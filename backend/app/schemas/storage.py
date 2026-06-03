from pydantic import BaseModel, ConfigDict, Field


class DeleteImageRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    url: str = Field(min_length=1)
