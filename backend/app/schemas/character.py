from typing import Any

from pydantic import BaseModel


class CharacterWriteRequest(BaseModel):
    charPayload: dict[str, Any]
    statsPayload: dict[str, Any]
