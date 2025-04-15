import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from '@remix-run/react';
import axios from 'axios';

export default function GitHubAuthHandler() {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const requestSent = useRef(false);

    useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
  
      if (code && !requestSent.current) {
        requestSent.current = true; // 标记请求已发送
        
        // 发送 code 到后端换取 JWT
        axios
          .post("http://localhost:8089/auth/github", { code }, {
            maxRedirects: 0, // 不自动跟随重定向
            validateStatus: function (status) {
              return status >= 200 && status < 400; // 接受 2xx 和 3xx 状态码
            }
          })
          .then((res) => {
            console.log(res);
            if (res.status === 307) {
              // 处理重定向
              const redirectUrl = res.headers.location;
              if (redirectUrl) {
                const tokenMatch = redirectUrl.match(/token=([^&]+)/);
                if (tokenMatch && tokenMatch[1]) {
                  const token = tokenMatch[1];
                  localStorage.setItem("jwt_token", token);
                  navigate("/chat");
                } else {
                  setError("无法获取认证令牌");
                }
              } else {
                setError("重定向URL无效");
              }
            } else {
              setError("意外的响应状态");
            }
          })
          .catch((err: Error) => {
            console.error("Login failed:", err);
            setError("登录失败，请重试");
          });
      } else if (!code) {
        setError("未收到授权码");
      }
    }, []);
  
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="text-red-500 mb-4">{error}</div>
          <button 
            onClick={() => window.location.href = "/login"}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            返回登录
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-screen">
        <div>正在处理 GitHub 登录...</div>
      </div>
    );
} 