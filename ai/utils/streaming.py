from pydantic import BaseModel

def generate_streaming_str(model: BaseModel):
    return f"data: {model.model_dump_json(by_alias=True)}\n\n"