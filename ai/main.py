from openai import OpenAI
import os
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from utils.streaming import generate_streaming_str
from utils.stock import get_stock_info
# 注入环境变量 从.env文件中读取
from dotenv import load_dotenv
import json
load_dotenv()


def select_tool(user_input: str):
    """根据用户输入选择合适的工具"""
    if "股票" in user_input or "股市" in user_input:
        return "get_stock_info"
    return None

host=os.getenv("DASHSCOPE_HOST")
port=os.getenv("DASHSCOPE_PORT")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatModel(BaseModel):
    model: str = "deepseek-v3"
    messages: list = [{'role': 'system', 'content': 'You are a helpful assistant.'},
                      {'role': 'user', 'content': 'AAPL 股市的股价'}]
    DASHSCOPE_API_KEY: str = "sk-xxx"

@app.post("/chat", status_code=status.HTTP_200_OK, response_class=StreamingResponse)
async def create_chat(chat: ChatModel):
    # 获取用户输入的工具调用
    user_input = chat.messages[-1]['content']
    # 解析工具调用
    tool_call = select_tool(user_input)    
    tool_result = None
    if tool_call:
        # 执行工具调用
        if tool_call == "get_stock_info":
            # 从用户输入中提取股票代码和市场
            # 这里需要实现提取逻辑
            # 使用大模型判断
            client = OpenAI(
                api_key=chat.DASHSCOPE_API_KEY,
                base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
            )
            completion = client.chat.completions.create(
                model=chat.model,
                messages=[
                            {
                                "role": "system",
                                "content": "你是一个智能助手，负责解析用户输入的股票代码和市场信息。"
                            },
                            {
                                "role": "user",
                                "content": f"请判断以下文本是否包含市场或股票代码，并返回JSON格式，"
                                        f"symbol: 股票代码\n"
                                        f"market: 市场类型 (US/HK/CN)\n"
                                        f"如果没有找到，返回 {{\"symbol\": null, \"market\": null}}。\n\n"
                                        f"示例输入: '我想查询 AAPL 的股价'\n"
                                        f"示例输出: {{\"symbol\": \"AAPL\", \"market\": \"US\"}}\n\n"
                                        f"用户输入: {user_input}"
                            }
                        ],
                stream=False
            )
            result = completion.choices[0].message.content  
            print("result:" + result)
            # 清理返回的字符串，移除可能的```json和```标记
            result = result.replace('```json', '').replace('```', '').strip()
            parsed_result = json.loads(result)
            symbol = parsed_result["symbol"]
            market = parsed_result["market"]
            tool_result = get_stock_info(symbol, market)
        else:
            tool_result = tool_call()

    # 将工具调用结果添加到消息列表中
    if tool_result:
        chat.messages[-1]['content']  += " 工具调用结果：" + str(tool_result)
        print(chat.messages[-1]['content'])

    client = OpenAI(
        api_key=chat.DASHSCOPE_API_KEY,
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",  # 填写DashScope SDK的base_url
    )
    completion = client.chat.completions.create(
        model=chat.model,  # 使用传递的模型名称
        messages=chat.messages,  # 使用传递的消息
        stream=True,  # 使用传递的流式输出方式
    )

    async def generate_stream():
        reasoning_content = ""
        answer_content = ""
        is_answering = False
        tool_info = []  # 存储工具调用信息的列表
        
        for chunk in completion:
            if not chunk.choices:
                # 处理用量统计信息
                usage_info = "\n" + "="*20 + "Usage" + "="*20 + "\n"
                usage_info += str(chunk.usage) + "\n"
                yield generate_streaming_str({"content": usage_info})
            else:
                delta = chunk.choices[0].delta
                
                # 处理AI的思考过程（链式推理）
                if hasattr(delta, 'reasoning_content') and delta.reasoning_content is not None:
                    reasoning_content += delta.reasoning_content
                    yield generate_streaming_str({"content": delta.reasoning_content})
                
                # 处理最终回复内容
                else:
                    if not is_answering and delta.content is not None:  # 首次进入回复阶段时打印标题
                        is_answering = True
                        yield generate_streaming_str({"content": "\n" + "="*20 + "回复内容" + "="*20 + "\n"})
                    
                    if delta.content is not None:
                        answer_content += delta.content
                        yield generate_streaming_str({"content": delta.content})
                    
                    # 处理工具调用信息（支持并行工具调用）
                    if delta.tool_calls is not None:
                        for tool_call in delta.tool_calls:
                            index = tool_call.index  # 工具调用索引，用于并行调用
                            
                            # 动态扩展工具信息存储列表
                            while len(tool_info) <= index:
                                tool_info.append({})
                            
                            # 收集工具调用ID
                            if tool_call.id:
                                tool_info[index]['id'] = tool_info[index].get('id', '') + tool_call.id
                            
                            # 收集函数名称
                            if tool_call.function and tool_call.function.name:
                                tool_info[index]['name'] = tool_info[index].get('name', '') + tool_call.function.name
                            
                            # 收集函数参数
                            if tool_call.function and tool_call.function.arguments:
                                tool_info[index]['arguments'] = tool_info[index].get('arguments', '') + tool_call.function.arguments
                                
                            yield generate_streaming_str({"tool_calls": [tool_info[index]]})
    
    return StreamingResponse(generate_stream(), media_type="text/event-stream")

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host=host, port=int(port))