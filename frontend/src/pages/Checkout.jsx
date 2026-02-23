import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../api';

const Checkout = () => {
    const { cart, total, clearCart } = useCart();
    const { token, user } = useAuth();
    const navigate = useNavigate();

    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (cart.length === 0) {
        navigate('/cart');
        return null;
    }

    if (!user) {
        navigate('/login');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const orderData = {
            items: cart.map(item => ({
                product_id: item.id,
                quantity: item.quantity,
                size: item.size
            })),
            shipping_address: address
        };

        try {
            await api.createOrder(orderData, token);
            clearCart();
            alert('Order placed successfully!');
            navigate('/');
        } catch (err) {
            setError('Failed to place order. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-extrabold mb-8 text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #e11d48, #f59e0b)' }}>Checkout</h1>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Shipping Information</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Please enter your details.</p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-6 gap-6">
                            <div className="col-span-6">
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Shipping Address</label>
                                <textarea
                                    id="address"
                                    name="address"
                                    rows={3}
                                    className="mt-1 focus:ring-rose-400 focus:border-rose-400 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t pt-6">
                            <span className="text-xl font-bold text-rose-600 bg-rose-50 p-2 rounded">₹{total.toFixed(2)}</span>
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-400 disabled:opacity-50 transition-all hover:opacity-90"
                                style={{ background: 'linear-gradient(135deg, #e11d48, #f59e0b)' }}
                            >
                                {loading ? 'Placing Order...' : 'Place Order'}
                            </button>
                        </div>
                        {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
