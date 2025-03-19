from pydantic import BaseModel
import json

def generate_streaming_str(data: dict | BaseModel) -> str:
    """生成流式响应的字符串格式
    
    Args:
        data: 要发送的数据，可以是字典或 Pydantic BaseModel
        
    Returns:
        str: 格式化的 SSE 数据字符串
    """
    if isinstance(data, BaseModel):
        json_str = data.model_dump_json(by_alias=True)
    else:
        json_str = json.dumps(data, ensure_ascii=False)
    
    return f"data: {json_str}\n\n"