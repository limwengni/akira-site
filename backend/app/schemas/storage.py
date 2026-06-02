from pydantic import BaseModel


class DeleteImageRequest(BaseModel):
    url: str
