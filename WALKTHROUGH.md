# Online Women's Cloth Store - Walkthrough

## Overview
A modern, full-stack e-commerce application for women's clothing, built with React (Frontend) and FastAPI (Backend).

## Features Implemented
- **User Features:**
    - **Home Page:** Attractive landing page with featured categories.
    - **Product Catalog:** Browse products with images and prices.
    - **Product Details:** View details and select sizes (S, M, L, XL, XXL).
    - **Shopping Cart:** Manage cart items and quantities.
    - **Checkout:** Place orders with shipping address.
    - **Authentication:** Sign up and Login functionality.
- **Admin Features:**
    - **Dashboard:** Manage products and orders.
    - **Product Management:** Add, edit, delete products.
    - **Order Management:** View orders and update status (Pending, Shipped, Delivered).

## Project Structure
- `backend/`: FastAPI application (Python)
    - `main.py`: App entry point.
    - `models.py`: Database models.
    - `routers/`: API endpoints.
- `frontend/`: React application (Vite)
    - `src/pages/`: Page components (Home, ProductList, Admin, etc.).
    - `src/context/`: State management (Auth, Cart).

## How to Run
### Backend
1. Navigate to `backend` directory.
2. Activate virtual environment: `venv\Scripts\activate`
3. Run server: `uvicorn main:app --reload`
   - API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Frontend
1. Navigate to `frontend` directory.
2. Run development server: `npm run dev`
   - Access App: [http://localhost:5173](http://localhost:5173)

## Admin Access
**Default Admin:**
Since we are using a local SQLite database for this demo, you can create a user via the Sign Up page, and then manually set them as admin using a SQLite viewer or running this Python script in `backend/`:
```python
# run_admin.py
import models, database
from sqlalchemy.orm import Session

db = database.SessionLocal()
user = db.query(models.User).first()
if user:
    user.is_admin = True
    db.commit()
    print(f"User {user.email} is now an admin")
db.close()
```
