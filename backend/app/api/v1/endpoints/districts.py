from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.district import District
from app.schemas.district import DistrictResponse

router = APIRouter()


@router.get("", response_model=List[DistrictResponse])
def list_districts(db: Session = Depends(get_db)):
    return db.query(District).all()
