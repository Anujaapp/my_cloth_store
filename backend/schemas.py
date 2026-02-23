from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_admin: bool
    is_verified: bool = False
    
    class Config:
        from_attributes = True

# Product Schemas
class ProductBase(BaseModel):
    title: str
    description: str
    price: float
    category: str
    stock: int
    images: List[str] = []
    sizes: List[str] = []

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    pass

class Product(ProductBase):
    id: int

    class Config:
        from_attributes = True

# Order Schemas
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    size: str

class OrderCreate(BaseModel):
    items: List[OrderItemBase]
    shipping_address: str

class OrderItem(OrderItemBase):
    id: int
    price: float # Snapshot price

    class Config:
        from_attributes = True

class Order(BaseModel):
    id: int
    status: str
    total_price: float
    shipping_address: str
    created_at: datetime
    items: List[OrderItem] = []

    class Config:
        from_attributes = True

# Cart Schemas
class CartItemBase(BaseModel):
    product_id: int
    quantity: int
    size: str

class CartItemCreate(CartItemBase):
    pass

class CartItemUpdate(BaseModel):
    quantity: int

class CartItem(CartItemBase):
    id: int
    product: Product # include product details for frontend display

    class Config:
        from_attributes = True

class CartBase(BaseModel):
    pass

class Cart(CartBase):
    id: int
    user_id: int
    items: List[CartItem] = []

    class Config:
        from_attributes = True
