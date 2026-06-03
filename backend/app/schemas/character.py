from pydantic import BaseModel, ConfigDict, Field


class CharacterPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1)
    image_url: str = ""
    icon_url: str = ""
    quote: str = ""
    role: int
    slug: str = Field(min_length=1)
    bio: str = ""
    abilities: str = ""
    relationships: str = ""
    trivias: str = ""
    labels: list[str] = Field(default_factory=list)
    gallery: list[str] = Field(default_factory=list)


class CharacterStatsPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    age: str | None = None
    gender: int | None = None
    height: int | None = None
    species: str | None = None
    birthday: str | None = None
    status: int | None = None


class CharacterWriteRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    charPayload: CharacterPayload
    statsPayload: CharacterStatsPayload
