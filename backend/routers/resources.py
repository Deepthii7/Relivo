from fastapi import APIRouter
from pydantic import BaseModel

from database.connection import SessionLocal
from models.resource import ResourceDB


router = APIRouter(
    prefix="/resources",
    tags=["Resources"]
)


class Resource(BaseModel):
    name: str
    category: str
    quantity: int
    location: str


@router.post("/")
def add_resource(resource: Resource):
    db = SessionLocal()

    new_resource = ResourceDB(
        name=resource.name,
        category=resource.category,
        quantity=resource.quantity,
        location=resource.location
    )

    db.add(new_resource)
    db.commit()
    db.refresh(new_resource)
    db.close()

    return {
        "message": "Resource added successfully!",
        "resource": resource
    }


@router.get("/")
def get_all_resources():
    db = SessionLocal()

    resources = db.query(ResourceDB).all()

    result = [
        {
            "id": resource.id,
            "name": resource.name,
            "category": resource.category,
            "quantity": resource.quantity,
            "location": resource.location
        }
        for resource in resources
    ]

    db.close()

    return {
        "resources": result
    }


@router.get("/search")
def search_resources(
    name: str = None,
    category: str = None,
    location: str = None
):
    db = SessionLocal()

    query = db.query(ResourceDB)

    if name:
        query = query.filter(ResourceDB.name.ilike(f"%{name}%"))

    if category:
        query = query.filter(ResourceDB.category.ilike(category))

    if location:
        query = query.filter(ResourceDB.location.ilike(location))

    resources = query.all()

    result = [
        {
            "id": resource.id,
            "name": resource.name,
            "category": resource.category,
            "quantity": resource.quantity,
            "location": resource.location
        }
        for resource in resources
    ]

    db.close()

    return {
        "resources": result
    }


@router.get("/match")
def match_resources(category: str, location: str):
    db = SessionLocal()

    resources = db.query(ResourceDB).all()

    matches = [
        resource
        for resource in resources
        if resource.category.lower() == category.lower()
        and resource.location.lower() == location.lower()
    ]

    result = [
        {
            "id": resource.id,
            "name": resource.name,
            "category": resource.category,
            "quantity": resource.quantity,
            "location": resource.location
        }
        for resource in matches
    ]

    db.close()

    return {
        "matches": result
    }