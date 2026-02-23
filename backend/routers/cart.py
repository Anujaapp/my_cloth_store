from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import crud, schemas, dependencies, models

router = APIRouter(
    prefix="/cart",
    tags=["cart"]
)

@router.get("/", response_model=schemas.Cart)
def get_cart(db: Session = Depends(dependencies.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    cart = crud.get_cart(db, user_id=current_user.id)
    if not cart:
        # Auto-create cart if accessing getting it
        cart = crud.create_cart(db, user_id=current_user.id)
    return cart

@router.post("/items", response_model=schemas.Cart)
def add_item_to_cart(item: schemas.CartItemCreate, db: Session = Depends(dependencies.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    # Check if stock is available
    product = crud.get_product(db, item.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Simple check, real logic might need to account for items already in cart
    if product.stock < item.quantity:
        raise HTTPException(status_code=400, detail="Not enough stock")

    return crud.add_to_cart(db, user_id=current_user.id, item=item)

@router.put("/items/{product_id}", response_model=schemas.Cart)
def update_cart_item(product_id: int, update: schemas.CartItemUpdate, size: str = "M", db: Session = Depends(dependencies.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    cart = crud.update_cart_item(db, user_id=current_user.id, product_id=product_id, size=size, quantity=update.quantity)
    if not cart:
        raise HTTPException(status_code=404, detail="Cart or item not found")
    return cart

@router.delete("/items/{product_id}", response_model=schemas.Cart)
def remove_item_from_cart(product_id: int, size: str = "M", db: Session = Depends(dependencies.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    cart = crud.remove_from_cart(db, user_id=current_user.id, product_id=product_id, size=size)
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    return cart

@router.delete("/", response_model=schemas.Cart)
def clear_cart(db: Session = Depends(dependencies.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    cart = crud.clear_cart(db, user_id=current_user.id)
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    return cart
