from pydantic import BaseModel


class BaseResponse(BaseModel):
    status: str
    message: str


class ErrorResponse(BaseModel):
    error: str
    detail: str = ""
