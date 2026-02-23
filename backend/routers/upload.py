import uuid
import os
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from typing import List
import models, dependencies

router = APIRouter(
    prefix="/upload",
    tags=["upload"]
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
BASE_URL = "http://localhost:8000/uploads"


@router.post("/", response_model=List[str])
async def upload_images(
    files: List[UploadFile] = File(...),
    current_user: models.User = Depends(dependencies.get_current_admin_user)
):
    """Upload one or more product images. Returns a list of public image URLs."""
    urls = []
    for file in files:
        if file.content_type not in ALLOWED_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"File '{file.filename}' is not a supported image type. Allowed: JPEG, PNG, WEBP, GIF."
            )

        # Generate a unique filename to avoid collisions
        ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
        unique_name = f"{uuid.uuid4().hex}{ext}"
        save_path = os.path.join(UPLOAD_DIR, unique_name)

        # Write file to disk
        contents = await file.read()
        with open(save_path, "wb") as f:
            f.write(contents)

        urls.append(f"{BASE_URL}/{unique_name}")

    return urls
