import models, database
from sqlalchemy.orm import Session

# Create tables if they don't exist (re-run to ensure schema update if needed)
models.Base.metadata.create_all(bind=database.engine)

db = database.SessionLocal()

sample_products = [
    {
        "title": "Classic White Tee",
        "description": "A timeless classic. 100% cotton, breathable and comfortable.",
        "price": 25.00,
        "category": "Tops",
        "stock": 100,
        "images": ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
        "sizes": ["S", "M", "L", "XL", "XXL"]
    },
    {
        "title": "Floral Summer Dress",
        "description": "Lightweight and airy, perfect for hot summer days.",
        "price": 55.00,
        "category": "Dresses",
        "stock": 50,
        "images": ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
        "sizes": ["XS", "S", "M", "L"]
    },
    {
        "title": "High-Waist Jeans",
        "description": "Flattering high-waist fit with a vintage wash.",
        "price": 60.00,
        "category": "Bottoms",
        "stock": 75,
        "images": ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
        "sizes": ["24", "25", "26", "27", "28", "29", "30"]
    },
    {
        "title": "Oversized Denim Jacket",
        "description": "The perfect layer for any outfit. Rugged and stylish.",
        "price": 85.00,
        "category": "Outerwear",
        "stock": 40,
        "images": ["https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
        "sizes": ["S", "M", "L", "XL"]
    },
    {
        "title": "Cozy Knit Sweater",
        "description": "Warm and soft, essential for chilly evenings.",
        "price": 45.00,
        "category": "Tops",
        "stock": 60,
        "images": ["https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
        "sizes": ["S", "M", "L"]
    },
     {
        "title": "Elegant Evening Gown",
        "description": "Stunning floor-length gown for special occasions.",
        "price": 120.00,
        "category": "Dresses",
        "stock": 20,
        "images": ["https://images.unsplash.com/photo-1566174053879-31528523f8ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
        "sizes": ["S", "M", "L", "XL"]
    }
]

for product_data in sample_products:
    # Check if product exists
    existing = db.query(models.Product).filter(models.Product.title == product_data["title"]).first()
    if not existing:
        product = models.Product(**product_data)
        db.add(product)
        print(f"Added: {product.title}")
    else:
        print(f"Skipped (already exists): {product_data['title']}")

db.commit()
db.close()
print("Database population complete.")
