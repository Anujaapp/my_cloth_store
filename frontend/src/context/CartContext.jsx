import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { token } = useAuth();
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem('cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error("Failed to load cart from localStorage", error);
            return [];
        }
    });

    // Helper to format backend cart items to frontend structure
    const formatBackendCart = (backendCart) => {
        return backendCart.items.map(item => ({
            ...item.product,
            id: item.product.id,
            size: item.size,
            quantity: item.quantity,
            cart_item_id: item.id
        }));
    };

    // Fetch cart on login/token change
    useEffect(() => {
        const fetchCart = async () => {
            if (token) {
                try {
                    const backendCart = await api.getCart(token);
                    setCart(formatBackendCart(backendCart));
                } catch (error) {
                    console.error("Failed to fetch backend cart", error);
                }
            } else {
                // If logging out, optionally re-load from local or clear
                // For now, let's fall back to local storage if available or keep empty
                try {
                    const savedCart = localStorage.getItem('cart');
                    setCart(savedCart ? JSON.parse(savedCart) : []);
                } catch (error) {
                    setCart([]);
                }
            }
        };
        fetchCart();
    }, [token]);

    // Save to localStorage (only if not logged in, or always? specific requirements?)
    // If logged in, we save to backend. If not, local.
    useEffect(() => {
        try {
            if (!token) {
                localStorage.setItem('cart', JSON.stringify(cart));
            }
        } catch (error) {
            console.error("Failed to save cart to localStorage", error);
        }
    }, [cart, token]);

    const addToCart = async (product, size, quantity = 1) => {
        // Optimistic UI update or wait for API?
        // Let's optimistic update first

        // Check stock (frontend check)
        const existingItem = cart.find(
            (item) => item.id === product.id && item.size === size
        );
        const currentQuantity = existingItem ? existingItem.quantity : 0;
        if (product.stock < currentQuantity + quantity) {
            alert(`Sorry, only ${product.stock} items available in stock.`);
            return;
        }

        if (token) {
            try {
                const updatedCart = await api.addToCart({
                    product_id: product.id,
                    quantity: quantity,
                    size: size
                }, token);
                setCart(formatBackendCart(updatedCart));
            } catch (error) {
                console.error("Failed to add to backend cart", error);
                alert("Failed to add item to cart. Please try again.");
            }
        } else {
            setCart((prevCart) => {
                if (existingItem) {
                    return prevCart.map((item) =>
                        item.id === product.id && item.size === size
                            ? { ...item, quantity: item.quantity + quantity }
                            : item
                    );
                } else {
                    return [...prevCart, { ...product, size, quantity }];
                }
            });
        }
    };

    const removeFromCart = async (productId, size) => {
        if (token) {
            try {
                const updatedCart = await api.removeFromCart(productId, size, token);
                setCart(formatBackendCart(updatedCart));
            } catch (error) {
                console.error("Failed to remove from backend cart", error);
            }
        } else {
            setCart((prevCart) =>
                prevCart.filter((item) => !(item.id === productId && item.size === size))
            );
        }
    };

    const updateQuantity = async (productId, size, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId, size);
            return;
        }

        if (token) {
            try {
                const updatedCart = await api.updateCartItem(productId, size, quantity, token);
                setCart(formatBackendCart(updatedCart));
            } catch (error) {
                console.error("Failed to update backend cart", error);
            }
        } else {
            setCart((prevCart) =>
                prevCart.map((item) =>
                    item.id === productId && item.size === size
                        ? { ...item, quantity }
                        : item
                )
            );
        }
    };

    const clearCart = async () => {
        if (token) {
            try {
                await api.clearCart(token);
                setCart([]);
            } catch (error) {
                console.error("Failed to clear backend cart", error);
            }
        } else {
            setCart([]);
        }
    };

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, total }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
