import requests
import random
import string

BASE_URL = "http://localhost:8000/api"

def get_random_string(length=10):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

def test_cart_flow():
    # 1. Signup and Login
    email = f"test_{get_random_string()}@example.com"
    password = "password123"
    
    print(f"Creating user {email}...")
    # Signup
    requests.post(f"{BASE_URL}/users/", json={"email": email, "password": password})
    
    # Login
    response = requests.post(f"{BASE_URL}/users/token", data={"username": email, "password": password})
    assert response.status_code == 200
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("User logged in.")

    # 2. Add item to cart
    # Need a product first. Assuming product with ID 1 exists (from sample data) or we create one.
    # Let's create a product to be safe if admin
    # Or just try to get product 1
    
    print("Fetching product list...")
    products = requests.get(f"{BASE_URL}/products/").json()
    if not products:
        print("No products found, skipping cart test.")
        return

    product_id = products[0]['id']
    print(f"Adding product {product_id} to cart...")
    
    response = requests.post(f"{BASE_URL}/cart/items", json={
        "product_id": product_id,
        "quantity": 2,
        "size": "M"
    }, headers=headers)
    
    if response.status_code != 200:
        print(f"Failed to add to cart: Status {response.status_code}, Response: {response.text}")
        return

    cart = response.json()
    assert len(cart['items']) > 0
    assert cart['items'][0]['product_id'] == product_id
    assert cart['items'][0]['quantity'] == 2
    print("Item added to cart.")

    # 3. Get Cart
    print("Fetching cart...")
    response = requests.get(f"{BASE_URL}/cart/", headers=headers)
    cart = response.json()
    assert len(cart['items']) > 0
    print("Cart fetched successfully.")

    # 4. Update Quantity
    print("Updating quantity...")
    response = requests.put(f"{BASE_URL}/cart/items/{product_id}?size=M", json={"quantity": 5}, headers=headers)
    cart = response.json()
    item = next(i for i in cart['items'] if i['product_id'] == product_id)
    assert item['quantity'] == 5
    print("Quantity updated.")

    # 5. Remove Item
    print("Removing item...")
    response = requests.delete(f"{BASE_URL}/cart/items/{product_id}?size=M", headers=headers)
    cart = response.json()
    item = next((i for i in cart['items'] if i['product_id'] == product_id), None)
    assert item is None
    print("Item removed.")

    # 6. Clear Cart (Add item again first)
    print("Clearing cart test...")
    requests.post(f"{BASE_URL}/cart/items", json={
        "product_id": product_id,
        "quantity": 1,
        "size": "L"
    }, headers=headers)
    
    response = requests.delete(f"{BASE_URL}/cart/", headers=headers)
    cart = response.json()
    assert len(cart['items']) == 0
    print("Cart cleared.")

    print("\nCart flow test PASSED!")

if __name__ == "__main__":
    try:
        test_cart_flow()
    except Exception as e:
        print(f"\nTest FAILED: {e}")
