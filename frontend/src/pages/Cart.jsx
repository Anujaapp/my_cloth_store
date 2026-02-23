import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Trash2, Plus, Minus } from 'lucide-react';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, total } = useCart();
    const navigate = useNavigate();
    const { showToast } = useToast();

    if (cart.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">Your cart is empty</h2>
                <p className="text-gray-600">Looks like you haven't added anything yet.</p>
                <Link to="/products" className="px-6 py-2 text-white rounded-full font-medium transition-all hover:opacity-90 hover:scale-105" style={{ background: 'linear-gradient(135deg, #e11d48, #f59e0b)' }}>
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-extrabold mb-8 text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #e11d48, #f59e0b)' }}>Shopping Cart</h1>

            <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start xl:gap-x-16">
                <section aria-labelledby="cart-heading" className="lg:col-span-7 bg-white rounded-xl shadow-sm p-6">
                    <ul role="list" className="divide-y divide-gray-200">
                        {cart.map((item) => (
                            <li key={`${item.id}-${item.size}`} className="flex py-6">
                                <div className="flex-shrink-0">
                                    <img
                                        src={item.images && item.images.length > 0 ? item.images[0] : 'https://placehold.co/150'}
                                        alt={item.title}
                                        className="w-24 h-24 rounded-md object-center object-cover sm:w-32 sm:h-32"
                                    />
                                </div>

                                <div className="ml-4 flex-1 flex flex-col justify-between sm:ml-6">
                                    <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                                        <div>
                                            <div className="flex justify-between">
                                                <h3 className="text-sm">
                                                    <Link to={`/products/${item.id}`} className="font-medium text-gray-700 hover:text-rose-500">
                                                        {item.title}
                                                    </Link>
                                                </h3>
                                            </div>
                                            <div className="mt-1 flex text-sm">
                                                <p className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-xs uppercase font-bold">{item.size}</p>
                                            </div>
                                            <p className="mt-1 text-sm font-bold text-rose-500">₹{item.price.toFixed(2)}</p>
                                        </div>

                                        <div className="mt-4 sm:mt-0 sm:pr-9">
                                            <div className="flex items-center space-x-3">
                                                <button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)} className="p-1 rounded-full hover:bg-gray-100 text-gray-500">
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                                <span className="text-gray-900 font-medium">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} className="p-1 rounded-full hover:bg-gray-100 text-gray-500">
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="absolute top-0 right-0">
                                                <button
                                                    type="button"
                                                    className="-m-2 p-2 inline-flex text-gray-400 hover:text-red-500"
                                                    onClick={() => {
                                                        removeFromCart(item.id, item.size);
                                                        showToast(`🗑️ ${item.title} removed from cart`, 'error', 2500);
                                                    }}
                                                >
                                                    <span className="sr-only">Remove</span>
                                                    <Trash2 className="h-5 w-5" aria-hidden="true" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Order summary */}
                <section
                    aria-labelledby="summary-heading"
                    className="mt-16 bg-white rounded-lg shadow-sm px-4 py-6 sm:p-6 lg:p-8 lg:mt-0 lg:col-span-5"
                >
                    <h2 id="summary-heading" className="text-lg font-medium text-gray-900">
                        Order summary
                    </h2>

                    <div className="mt-6 space-y-4">
                        <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                            <dt className="text-base font-medium text-gray-900">Order total</dt>
                            <dd className="text-xl font-bold text-rose-600">₹{total.toFixed(2)}</dd>
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={() => navigate('/checkout')}
                            className="w-full border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white transition-all hover:opacity-90 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-400"
                            style={{ background: 'linear-gradient(135deg, #e11d48, #f59e0b)' }}
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Cart;
