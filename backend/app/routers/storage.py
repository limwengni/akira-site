from time import time_ns

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from ..dependencies import require_authenticated_user
from ..schemas.storage import DeleteImageRequest
from ..supabase_client import supabase

router = APIRouter(prefix="/storage", tags=["storage"])


@router.post("/upload")
async def upload_character_image(
    file: UploadFile = File(...),
    slug: str = Form(...),
    asset_type: str = Form(...),
    _user=Depends(require_authenticated_user),
):
    is_gallery = asset_type.startswith("gallery")
    folder = slug

    if not is_gallery:
        existing_files = (
            supabase.storage
            .from_("character-assets")
            .list(folder)
        )

        if existing_files:
            files_to_delete = [
                f"{folder}/{item['name']}"
                for item in existing_files
                if item["name"].startswith(f"{asset_type}-")
            ]

            if files_to_delete:
                supabase.storage.from_("character-assets").remove(files_to_delete)

    file_ext = file.filename.split(".").pop() if file.filename and "." in file.filename else ""
    clean_ext = f".{file_ext}" if file_ext else ""

    if is_gallery:
        clean_file_name = file.filename.rsplit(".", 1)[0] if file.filename else "gallery"
        file_path = f"{folder}/gallery/{time_ns()}-{clean_file_name}{clean_ext}"
    else:
        file_path = f"{folder}/{asset_type}-{time_ns()}{clean_ext}"

    file_bytes = await file.read()

    upload_response = (
        supabase.storage
        .from_("character-assets")
        .upload(
            path=file_path,
            file=file_bytes,
            file_options={"content-type": file.content_type or "application/octet-stream"},
        )
    )

    if upload_response is None:
        raise HTTPException(status_code=500, detail="Failed to upload image")

    public_url_response = (
        supabase.storage
        .from_("character-assets")
        .get_public_url(file_path)
    )

    if isinstance(public_url_response, dict):
        public_url = (
            public_url_response.get("publicUrl")
            or public_url_response.get("publicURL")
            or public_url_response.get("data", {}).get("publicUrl")
        )
    else:
        public_url = public_url_response

    return {
        "message": "Image uploaded successfully",
        "publicUrl": public_url,
    }


@router.delete("/delete")
def delete_character_image(
    payload: DeleteImageRequest,
    _user=Depends(require_authenticated_user),
):
    if not payload.url or "placeholder" in payload.url:
        return {"message": "No image deleted", "deleted": []}

    parts = payload.url.split("public/character-assets/")

    if len(parts) < 2 or not parts[1]:
        raise HTTPException(status_code=400, detail="Invalid image URL")

    delete_response = (
        supabase.storage
        .from_("character-assets")
        .remove([parts[1]])
    )

    if delete_response is None:
        raise HTTPException(status_code=500, detail="Failed to delete image")

    return {
        "message": "Image deleted successfully",
        "deleted": delete_response,
    }
