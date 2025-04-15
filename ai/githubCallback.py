from fastapi import Depends, APIRouter, HTTPException, status
from fastapi.responses import RedirectResponse
from datetime import datetime, timedelta
import httpx, os
from dotenv import load_dotenv
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt  # 使用 PyJWT
from jwt import PyJWTError as JWTError
from pydantic import BaseModel
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

router  = APIRouter()

# 检查必要的环境变量
required_env_vars = ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET", "JWT_SECRET", "FRONTEND_REDIRECT"]
missing_vars = [var for var in required_env_vars if not os.getenv(var)]
if missing_vars:
    raise ValueError(f"缺少必要的环境变量: {', '.join(missing_vars)}")

GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
JWT_SECRET = os.getenv("JWT_SECRET")
FRONTEND_REDIRECT = os.getenv("FRONTEND_REDIRECT")

print(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, JWT_SECRET, FRONTEND_REDIRECT)
security = HTTPBearer()

class GitHubCode(BaseModel):
    code: str

def verify_jwt(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

@router.get("/api/protected")
async def protected_route(token: str = Depends(verify_jwt)):
    return {"message": "You are authenticated"}

@router.post("/auth/github")
async def github_callback(github_code: GitHubCode):
    logger.info(f"Received GitHub code: {github_code.code[:10]}...")
    
    async with httpx.AsyncClient() as client:
        try:
            # 1. 用 code 换 access_token
            logger.info("Requesting access token from GitHub...")
            token_res = await client.post(
                "https://github.com/login/oauth/access_token",
                headers={"Accept": "application/json"},
                data={
                    "client_id": GITHUB_CLIENT_ID,
                    "client_secret": GITHUB_CLIENT_SECRET,
                    "code": github_code.code,
                },
            )
            
            if token_res.status_code != 200:
                logger.error(f"GitHub token response error: {token_res.status_code} - {token_res.text}")
                raise HTTPException(
                    status_code=token_res.status_code,
                    detail=f"GitHub API error: {token_res.text}"
                )
                
            token_json = token_res.json()
            logger.info(f"GitHub token response: {token_json}")
            
            access_token = token_json.get("access_token")
            if not access_token:
                error = token_json.get("error", "Unknown error")
                error_description = token_json.get("error_description", "No description")
                logger.error(f"Failed to get access token: {error} - {error_description}")
                raise HTTPException(
                    status_code=400,
                    detail=f"Failed to get access token: {error} - {error_description}"
                )

            # 2. 用 access_token 获取用户信息
            logger.info("Fetching user info from GitHub...")
            user_res = await client.get(
                "https://api.github.com/user",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            if user_res.status_code != 200:
                logger.error(f"GitHub user info response error: {user_res.status_code} - {user_res.text}")
                raise HTTPException(
                    status_code=user_res.status_code,
                    detail=f"Failed to get user info: {user_res.text}"
                )
                
            user = user_res.json()
            github_id = user.get("id")
            github_login = user.get("login")
            logger.info(f"Successfully authenticated GitHub user: {github_login}")

            # 3. 生成 JWT
            payload = {
                "sub": str(github_id),
                "login": github_login,
                "exp": datetime.utcnow() + timedelta(hours=2),
            }
            jwt_token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")

            return jwt_token
            
        except httpx.HTTPError as e:
            logger.error(f"HTTP error during GitHub authentication: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"GitHub API error: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Unexpected error during GitHub authentication: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Internal server error: {str(e)}"
            )
