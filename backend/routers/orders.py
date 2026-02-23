from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
import crud, schemas, dependencies, models

router = APIRouter(
    prefix="/orders",
    tags=["orders"]
)

class StatusUpdate(BaseModel):
    status: str

@router.post("/", response_model=schemas.Order)
def create_order(order: schemas.OrderCreate, db: Session = Depends(dependencies.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    return crud.create_order(db=db, order=order, user_id=current_user.id)

@router.get("/", response_model=List[schemas.Order])
def read_orders(skip: int = 0, limit: int = 100, db: Session = Depends(dependencies.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    if current_user.is_admin:
        return crud.get_orders(db, skip=skip, limit=limit)
    return crud.get_user_orders(db, user_id=current_user.id, skip=skip, limit=limit)

@router.put("/{order_id}/status", response_model=schemas.Order)
def update_order_status(order_id: int, body: StatusUpdate, db: Session = Depends(dependencies.get_db), current_user: models.User = Depends(dependencies.get_current_admin_user)):
    order = crud.update_order_status(db, order_id, body.status)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
