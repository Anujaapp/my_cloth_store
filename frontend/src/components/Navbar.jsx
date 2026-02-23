import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

const Navbar = ({ onMenuClick }) => {
    const { user, logout, isAdmin } = useAuth();
    const { cart } = useCart();
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const isShopPage = location.pathname.startsWith('/products');
    const isHomePage = location.pathname === '/';
    const isCartPage = location.pathname === '/cart';
    const isAdminPage = location.pathname === '/admin';

    const handleAboutClick = (e) => {
        e.preventDefault();
        if (isHomePage) {
            document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
        } else {
            navigate('/', { state: { scrollTo: 'about' } });
        }
    };

    const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <nav className="sticky top-0 z-50 border-b border-white/30" style={{ background: 'rgba(255,255,255,0.35)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
            <div className="w-full px-4 sm:px-6">
                {/* 3-column layout: left | center | right */}
                <div className="grid grid-cols-3 items-center h-16">

                    {/* LEFT: hamburger + brand */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onMenuClick}
                            className="p-2 rounded-md text-black hover:text-gray-600 hover:bg-white/40 transition-colors"
                            aria-label="Open menu"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <Link to="/" className="text-2xl font-black uppercase text-black hidden sm:block" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '0.05em' }}>
                            AKR WOMENS CLOTHING
                        </Link>
                    </div>

                    {/* CENTER: nav links */}
                    <div className="hidden md:flex justify-center items-center gap-8">
                        <Link
                            to="/"
                            className={`text-sm font-semibold tracking-wide transition-colors pb-0.5 ${location.pathname === '/'
                                ? 'text-rose-600 border-b-2 border-rose-500'
                                : 'text-black hover:text-rose-500'
                                }`}
                        >Home</Link>
                        <Link
                            to="/products"
                            className={`text-sm font-semibold tracking-wide transition-colors pb-0.5 ${isShopPage
                                ? 'text-rose-600 border-b-2 border-rose-500'
                                : 'text-black hover:text-rose-500'
                                }`}
                        >Shop</Link>
                        <a
                            href="/#about"
                            onClick={handleAboutClick}
                            className="text-black hover:text-rose-500 text-sm font-semibold tracking-wide transition-colors cursor-pointer"
                        >About</a>
                    </div>

                    {/* RIGHT: cart + auth */}
                    <div className="flex items-center justify-end space-x-4">
                        <Link to="/cart" className={`relative p-2 transition-colors ${isCartPage ? 'text-rose-600' : 'text-black hover:text-rose-500'}`}>
                            <ShoppingCart className="h-6 w-6" />
                            {cartItemCount > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                                    {cartItemCount}
                                </span>
                            )}
                        </Link>
                        <div className="hidden md:flex items-center space-x-4">
                            {isAdmin && (
                                <Link to="/admin" className={`text-sm font-semibold tracking-wide transition-colors pb-0.5 ${isAdminPage ? 'text-rose-600 border-b-2 border-rose-500' : 'text-black hover:text-rose-500'}`}>Admin</Link>
                            )}
                            {user ? (
                                <>
                                    <span className="text-sm text-black">Hi, {user.email}</span>
                                    <button onClick={logout} className="text-black hover:text-gray-500 text-sm font-medium">Logout</button>
                                </>
                            ) : (
                                <Link to="/login" className="flex items-center text-black hover:text-gray-500">
                                    <User className="h-5 w-5 mr-1" />
                                    <span className="text-sm font-medium">Login</span>
                                </Link>
                            )}
                        </div>
                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button onClick={() => setIsOpen(!isOpen)} className="text-black hover:text-gray-600 focus:outline-none">
                                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-200">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Home</Link>
                        <Link to="/products" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Shop</Link>
                        <a href="/#about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                            onClick={e => { e.preventDefault(); setIsOpen(false); if (isHomePage) { setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 100); } else { navigate('/', { state: { scrollTo: 'about' } }); } }}
                        >About</a>

                        {user ? (
                            <button onClick={logout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Logout</button>
                        ) : (
                            <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Login</Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
