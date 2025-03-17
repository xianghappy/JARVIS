from openai import OpenAI
import os
from fastapi import FastAPI, Request
from pydantic import BaseModel

# 注入环境变量 从.env文件中读取
from dotenv import load_dotenv
load_dotenv()

host=os.getenv("DASHSCOPE_HOST")
port=os.getenv("DASHSCOPE_PORT")

app = FastAPI()

class RequestModel(BaseModel):
    model: str = "qwq-32b"
    messages: list = [{'role': 'system', 'content': 'You are a helpful assistant.'},
                      {'role': 'user', 'content': '你是谁？'}]
    DASHSCOPE_API_KEY: str = "sk-xxx"

@app.post("/response", summary="获取模型响应", description="根据提供的模型名称和消息获取响应")
async def get_response(request: RequestModel):
    client = OpenAI(
        api_key=request.DASHSCOPE_API_KEY,
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",  # 填写DashScope SDK的base_url
    )
    completion = client.chat.completions.create(
        model=request.model,  # 使用传递的模型名称
        messages=request.messages,  # 使用传递的消息
        stream=True  # 使用传递的流式输出方式
    )
    response_data = []
    for chunk in completion:
        # 如果chunk.choices为空，则打印usage
        if not chunk.choices:
            response_data.append({"usage": chunk.usage})
        else:
            delta = chunk.choices[0].delta
            # 收集思考过程
            response_data.append({"delta": delta})
    return response_data

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host=host, port=port)