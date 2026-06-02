from fastapi import APIRouter, Depends, HTTPException

from ..dependencies import require_authenticated_user
from ..schemas.character import CharacterWriteRequest
from ..supabase_client import supabase

router = APIRouter(prefix="/characters", tags=["characters"])


@router.get("")
def get_characters():
    response = (
        supabase
        .from_("characters")
        .select("*, stats(*)")
        .order("name")
        .execute()
    )

    if response.data is None:
        raise HTTPException(status_code=500, detail="Failed to fetch characters")

    return response.data


@router.post("")
def create_character(
    payload: CharacterWriteRequest,
    _user=Depends(require_authenticated_user),
):
    char_response = (
        supabase
        .from_("characters")
        .insert([payload.charPayload])
        .execute()
    )

    if char_response.data is None:
        raise HTTPException(status_code=500, detail="Failed to create character")

    new_character = char_response.data[0]
    character_id = new_character["id"]

    stats_data = {
        "character_id": character_id,
        **payload.statsPayload,
    }

    stats_response = (
        supabase
        .from_("stats")
        .insert([stats_data])
        .execute()
    )

    if stats_response.data is None:
        raise HTTPException(status_code=500, detail="Failed to create character stats")

    return {
        "message": "Character created successfully",
        "character": new_character,
        "stats": stats_response.data,
    }


@router.put("/{character_id}")
def update_character(
    character_id: int,
    payload: CharacterWriteRequest,
    _user=Depends(require_authenticated_user),
):
    char_response = None
    stats_response = None

    if payload.charPayload:
        char_response = (
            supabase
            .from_("characters")
            .update(payload.charPayload)
            .eq("id", character_id)
            .execute()
        )

        if char_response.data is None:
            raise HTTPException(status_code=500, detail="Failed to update character")

    if payload.statsPayload:
        stats_response = (
            supabase
            .from_("stats")
            .update(payload.statsPayload)
            .eq("character_id", character_id)
            .execute()
        )

        if stats_response.data is None:
            raise HTTPException(status_code=500, detail="Failed to update character stats")

    return {
        "message": "Character updated successfully",
        "character": char_response.data[0] if char_response and char_response.data else None,
        "stats": stats_response.data if stats_response else None,
    }


@router.delete("/{character_id}")
def delete_character(
    character_id: int,
    slug: str,
    _user=Depends(require_authenticated_user),
):
    folders_to_clean = [slug, f"{slug}/gallery"]

    for folder_path in folders_to_clean:
        list_response = (
            supabase
            .storage
            .from_("character-assets")
            .list(folder_path)
        )

        if list_response:
            files_to_remove = [
                f"{folder_path}/{item['name']}"
                for item in list_response
                if item["name"] != ".emptyKeep"
            ]

            if files_to_remove:
                supabase.storage.from_("character-assets").remove(files_to_remove)

    delete_response = (
        supabase
        .from_("characters")
        .delete()
        .eq("id", character_id)
        .execute()
    )

    if delete_response.data is None:
        raise HTTPException(status_code=500, detail="Failed to delete character")

    return {
        "message": "Character deleted successfully",
        "character": delete_response.data[0] if delete_response.data else None,
    }
