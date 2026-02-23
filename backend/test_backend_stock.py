import urllib.request
import urllib.parse
import json
import sys

API_URL = "http://127.0.0.1:8000/api"

def test_out_of_stock_order():
    # 1. Login to get token
    login_data = urllib.parse.urlencode({"username": "anujaa.techsoft@gmail.com", "password": "password123"}).encode('utf-8')
    req = urllib.request.Request(f"{API_URL}/users/token", data=login_data, method='POST')
    
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            token = data["access_token"]
            print("Login successful.")
    except urllib.error.HTTPError as e:
        print(f"Login failed: {e.code} {e.read().decode('utf-8')}")
        return

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # 2. Try to order excessive quantity
    product_id = 1
    order_payload = {
        "shipping_address": "Test Address",
        "items": [
            {"product_id": product_id, "quantity": 999999, "size": "M"}
        ]
    }
    
    data = json.dumps(order_payload).encode('utf-8')
    req = urllib.request.Request(f"{API_URL}/orders/", data=data, headers=headers, method='POST')
    
    print(f"Attempting to order excessive quantity for product {product_id}...")
    try:
        with urllib.request.urlopen(req) as response:
            print(f"FAILURE: Backend accepted the order (Status {response.getcode()}).")
            print(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        if e.code == 400:
            error_body = e.read().decode('utf-8')
            if "Not enough stock" in error_body:
                print("SUCCESS: Backend correctly rejected the order due to insufficient stock.")
                print(f"Response: {error_body}")
            else:
                print(f"FAILURE: Backend returned 400 but unexpected message: {error_body}")
        else:
            print(f"FAILURE: Backend returned unexpected status code: {e.code}")
            print(e.read().decode('utf-8'))
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    test_out_of_stock_order()
