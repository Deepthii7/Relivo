import uuid
from datetime import datetime
from io import BytesIO
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from algorithms.matching import find_matches
from config import UPLOAD_DIR
from database.connection import get_db
from models.request import RequestDB
from models.resource import ResourceDB
from models.user import UserDB
from services.security import get_current_user


router = APIRouter(prefix="/resources", tags=["Resources"])
MAX_IMAGE_SIZE = 5 * 1024 * 1024
MAX_IMAGE_PIXELS = 20_000_000
IMAGE_SIGNATURES = {
    "image/jpeg": (b"\xff\xd8\xff", ".jpg"),
    "image/png": (b"\x89PNG\r\n\x1a\n", ".png"),
    "image/webp": (b"RIFF", ".webp"),
    "image/gif": (b"GIF8", ".gif"),
}


def resource_payload(resource: ResourceDB, db: Session) -> dict:
    donor = db.query(UserDB).filter_by(id=resource.donor_id).first() if resource.donor_id else None
    requests_count = db.query(func.count(RequestDB.id)).filter_by(resource_id=resource.id).scalar() or 0
    return {
        "id": resource.id, "title": resource.title, "category": resource.category,
        "description": resource.description, "quantity": resource.quantity,
        "initialQuantity": resource.initial_quantity or resource.quantity,
        "condition": resource.condition, "location": resource.location,
        "status": resource.status, "donorId": resource.donor_id,
        "donorName": donor.name if donor else "", "donorOrg": donor.organization if donor else "",
        "imageUrl": resource.image_url, "requestedCount": requests_count,
        "uploadedDaysAgo": max(0, (datetime.utcnow() - resource.created_at).days),
        "createdAt": resource.created_at.isoformat(),
    }


async def save_image(image: UploadFile | None) -> str | None:
    if not image or not image.filename:
        return None
    signature = IMAGE_SIGNATURES.get(image.content_type or "")
    if not signature:
        raise HTTPException(status_code=415, detail="Upload a PNG, JPEG, WebP, or GIF image")
    content = await image.read(MAX_IMAGE_SIZE + 1)
    if not content or len(content) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=413, detail="Images must be smaller than 5 MB")
    expected, extension = signature
    if not content.startswith(expected) or (image.content_type == "image/webp" and content[8:12] != b"WEBP"):
        raise HTTPException(status_code=415, detail="The uploaded file is not a valid image")
    try:
        with Image.open(BytesIO(content)) as decoded:
            actual_format = decoded.format
            if decoded.width * decoded.height > MAX_IMAGE_PIXELS:
                raise HTTPException(status_code=413, detail="Image dimensions exceed the 20 megapixel limit")
            decoded.verify()
        expected_format = {"image/jpeg": "JPEG", "image/png": "PNG", "image/webp": "WEBP", "image/gif": "GIF"}[image.content_type]
        if actual_format != expected_format:
            raise HTTPException(status_code=415, detail="Image contents do not match the selected file type")
    except HTTPException:
        raise
    except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError) as error:
        raise HTTPException(status_code=415, detail="The uploaded file is not a valid image") from error
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{extension}"
    (UPLOAD_DIR / filename).write_bytes(content)
    return f"/uploads/{filename}"


@router.get("")
def get_resources(
    q: str = "", category: str = "", condition: str = "", status: str = "", location: str = "",
    db: Session = Depends(get_db),
):
    query = db.query(ResourceDB)
    if q.strip():
        term = f"%{q.strip()}%"
        query = query.filter(or_(ResourceDB.title.ilike(term), ResourceDB.description.ilike(term), ResourceDB.category.ilike(term), ResourceDB.location.ilike(term)))
    if category and category != "All":
        query = query.filter(ResourceDB.category.ilike(category))
    if condition and condition != "Any":
        query = query.filter(ResourceDB.condition == condition)
    if status and status != "Any":
        query = query.filter(ResourceDB.status == status)
    if location.strip():
        query = query.filter(ResourceDB.location.ilike(f"%{location.strip()}%"))
    resources = query.order_by(ResourceDB.created_at.desc(), ResourceDB.id.desc()).all()
    return {"resources": [resource_payload(resource, db) for resource in resources]}


@router.get("/match")
def match_resources(category: str = "", location: str = "", db: Session = Depends(get_db)):
    resources = db.query(ResourceDB).filter(ResourceDB.quantity > 0).all()
    matches = find_matches(resources, category, location)
    return {"matches": [resource_payload(resource, db) for resource in matches]}


@router.get("/search")
def search_resources(
    name: str = "", category: str = "", location: str = "", condition: str = "", status: str = "",
    db: Session = Depends(get_db),
):
    return get_resources(q=name, category=category, condition=condition, status=status, location=location, db=db)


@router.get("/{resource_id}")
def get_resource(resource_id: int, db: Session = Depends(get_db)):
    resource = db.query(ResourceDB).filter_by(id=resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return {"resource": resource_payload(resource, db)}


@router.post("", status_code=201)
async def add_resource(
    title: str = Form(min_length=1, max_length=160),
    category: str = Form(min_length=1, max_length=80),
    quantity: int = Form(gt=0, le=100000),
    condition: str = Form(),
    location: str = Form(min_length=1, max_length=160),
    description: str = Form(default="", max_length=3000),
    image: UploadFile | None = File(default=None),
    user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role not in ("donor", "admin"):
        raise HTTPException(status_code=403, detail="Only donors can list resources")
    if condition not in ("Like New", "Good", "Fair", "Needs Repair"):
        raise HTTPException(status_code=422, detail="Choose a valid resource condition")
    image_url = await save_image(image)
    resource = ResourceDB(
        title=title.strip(), category=category.strip(), description=description.strip(),
        quantity=quantity, initial_quantity=quantity, condition=condition,
        location=location.strip(), status="Available", image_url=image_url,
        donor_id=user.id, created_at=datetime.utcnow(),
    )
    try:
        db.add(resource)
        db.commit()
        db.refresh(resource)
    except Exception:
        db.rollback()
        if image_url:
            (UPLOAD_DIR / Path(image_url).name).unlink(missing_ok=True)
        raise
    return {"resource": resource_payload(resource, db)}