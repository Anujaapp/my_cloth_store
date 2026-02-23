from sqlalchemy.orm import Session
import models, schemas
from auth import get_password_hash
from fastapi import HTTPException, status

# User CRUD
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_phone(db: Session, phone: str):
    return db.query(models.User).filter(models.User.phone == phone).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        phone=getattr(user, 'phone', None),
        is_verified=True,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Product CRUD
def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Product).offset(skip).limit(limit).all()

def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def create_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, product_id: int, product: schemas.ProductUpdate):
    db_product = get_product(db, product_id)
    if not db_product:
        return None
    
    update_data = product.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
    
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = get_product(db, product_id)
    if db_product:
        db.delete(db_product)
        db.commit()
    return db_product

# Order CRUD
def create_order(db: Session, order: schemas.OrderCreate, user_id: int):
    # Calculate total price and verify stock
    total_price = 0.0
    db_order_items = []
    
    for item in order.items:
        product = get_product(db, item.product_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Not enough stock for {product.title}")
        
        # Deduct stock
        product.stock -= item.quantity
        
        # Create order item
        db_item = models.OrderItem(
            product_id=product.id,
            quantity=item.quantity,
            size=item.size,
            price=product.price # Snapshot price
        )
        db_order_items.append(db_item)
        total_price += product.price * item.quantity

    db_order = models.Order(
        user_id=user_id,
        total_price=total_price,
        shipping_address=order.shipping_address,
        status="Pending"
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    # Associate items with order
    for item in db_order_items:
        item.order_id = db_order.id
        db.add(item)
    
    db.commit()
    db.refresh(db_order)
    return db_order

def get_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Order).offset(skip).limit(limit).all()

def get_user_orders(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Order).filter(models.Order.user_id == user_id).offset(skip).limit(limit).all()

def update_order_status(db: Session, order_id: int, status: str):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if order:
        order.status = status
        db.commit()
        db.refresh(order)
    return order

# Cart CRUD
def get_cart(db: Session, user_id: int):
    return db.query(models.Cart).filter(models.Cart.user_id == user_id).first()

def create_cart(db: Session, user_id: int):
    db_cart = models.Cart(user_id=user_id)
    db.add(db_cart)
    db.commit()
    db.refresh(db_cart)
    return db_cart

def add_to_cart(db: Session, user_id: int, item: schemas.CartItemCreate):
    cart = get_cart(db, user_id)
    if not cart:
        cart = create_cart(db, user_id)
    
    # Check if item already exists
    db_item = db.query(models.CartItem).filter(
        models.CartItem.cart_id == cart.id,
        models.CartItem.product_id == item.product_id,
        models.CartItem.size == item.size
    ).first()

    if db_item:
        db_item.quantity += item.quantity
    else:
        db_item = models.CartItem(
            cart_id=cart.id,
            product_id=item.product_id,
            quantity=item.quantity,
            size=item.size
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(cart)
    return cart

def remove_from_cart(db: Session, user_id: int, product_id: int, size: str):
    cart = get_cart(db, user_id)
    if not cart:
        return None
    
    db_item = db.query(models.CartItem).filter(
        models.CartItem.cart_id == cart.id,
        models.CartItem.product_id == product_id,
        models.CartItem.size == size
    ).first()

    if db_item:
        db.delete(db_item)
        db.commit()
        db.refresh(cart)
    return cart

def update_cart_item(db: Session, user_id: int, product_id: int, size: str, quantity: int):
    cart = get_cart(db, user_id)
    if not cart:
        return None

    if quantity <= 0:
        return remove_from_cart(db, user_id, product_id, size)

    db_item = db.query(models.CartItem).filter(
        models.CartItem.cart_id == cart.id,
        models.CartItem.product_id == product_id,
        models.CartItem.size == size
    ).first()

    if db_item:
        db_item.quantity = quantity
        db.commit()
        db.refresh(cart)
    return cart

def clear_cart(db: Session, user_id: int):
    cart = get_cart(db, user_id)
    if cart:
        db.query(models.CartItem).filter(models.CartItem.cart_id == cart.id).delete()
        db.commit()
        db.refresh(cart)
    return cart
