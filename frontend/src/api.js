import { useState } from 'react';

const API_URL = 'http://localhost:8000/api';

export const api = {
    login: async (email, password) => {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const response = await fetch(`${API_URL}/users/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
        });
        if (!response.ok) throw new Error('Login failed');
        return response.json();
    },

    signup: async (userData) => {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        if (!response.ok) throw new Error('Signup failed');
        return response.json();
    },

    sendEmailOtp: async (email) => {
        const res = await fetch(`${API_URL}/verify/send-email-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.detail || 'Failed to send email OTP');
        }
        return res.json();
    },

    sendPhoneOtp: async (phone) => {
        const res = await fetch(`${API_URL}/verify/send-phone-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone }),
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.detail || 'Failed to send phone OTP');
        }
        return res.json();
    },

    verifyAndSignup: async ({ email, phone, password, email_otp, phone_otp }) => {
        const res = await fetch(`${API_URL}/verify/confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, phone, password, email_otp, phone_otp }),
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.detail || 'Verification failed');
        }
        return res.json();
    },

    getProducts: async (skip = 0, limit = 100) => {
        const response = await fetch(`${API_URL}/products/?skip=${skip}&limit=${limit}`);
        return response.json();
    },

    getProduct: async (id) => {
        const response = await fetch(`${API_URL}/products/${id}`);
        if (!response.ok) throw new Error('Product not found');
        return response.json();
    },

    createOrder: async (orderData, token) => {
        const response = await fetch(`${API_URL}/orders/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(orderData),
        });
        if (!response.ok) throw new Error('Order creation failed');
        return response.json();
    },

    // Admin functions
    createProduct: async (productData, token) => {
        const response = await fetch(`${API_URL}/products/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(productData),
        });
        if (!response.ok) throw new Error('Failed to create product');
        return response.json();
    },

    deleteProduct: async (id, token) => {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) throw new Error('Failed to delete product');
        return response.json();
    },

    uploadImages: async (files, token) => {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        const response = await fetch(`${API_URL}/upload/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });
        if (!response.ok) throw new Error('Failed to upload images');
        return response.json(); // returns array of URLs
    },

    adminGetOrders: async (token) => {
        const response = await fetch(`${API_URL}/orders/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.json();
    },

    updateOrderStatus: async (orderId, newStatus, token) => {
        const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ status: newStatus }),
        });
        if (!response.ok) throw new Error('Failed to update order status');
        return response.json();
    },

    getMe: async (token) => {
        const response = await fetch(`${API_URL}/users/me/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        if (!response.ok) throw new Error('Failed to fetch user');
        return response.json();
    },

    // Cart functions
    getCart: async (token) => {
        const response = await fetch(`${API_URL}/cart/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        if (!response.ok) throw new Error('Failed to fetch cart');
        return response.json();
    },

    addToCart: async (itemData, token) => {
        const response = await fetch(`${API_URL}/cart/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(itemData),
        });
        if (!response.ok) throw new Error('Failed to add item to cart');
        return response.json();
    },

    updateCartItem: async (productId, size, quantity, token) => {
        const response = await fetch(`${API_URL}/cart/items/${productId}?size=${size}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ quantity }),
        });
        if (!response.ok) throw new Error('Failed to update cart item');
        return response.json();
    },

    removeFromCart: async (productId, size, token) => {
        const response = await fetch(`${API_URL}/cart/items/${productId}?size=${size}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        if (!response.ok) throw new Error('Failed to remove item from cart');
        return response.json();
    },

    clearCart: async (token) => {
        const response = await fetch(`${API_URL}/cart/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        if (!response.ok) throw new Error('Failed to clear cart');
        return response.json();
    }
};
