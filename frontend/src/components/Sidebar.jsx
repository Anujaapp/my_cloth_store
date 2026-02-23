import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Home, ShoppingBag, Tag, ChevronRight } from 'lucide-react';
import { api } from '../api';

const Sidebar = ({ isOpen, onClose }) => {
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();
    const [, setSearchParams] = useSearchParams();

    useEffect(() => {
        api.getProducts().then(products => {
            const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
            setCategories(cats);
        }).catch(() => { });
    }, []);

    const handleCategoryClick = (cat) => {
        navigate(`/products?category=${encodeURIComponent(cat)}`);
        onClose();
    };

    return (
        <>

            {/* Sidebar Panel */}
            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Header */}
                <div className="flex items-center px-5 py-4 border-b" style={{ background: 'linear-gradient(135deg, #9f1239, #e11d48)' }}>
                    <span className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>AKR Womens Clothing</span>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Menu</p>

                    <Link
                        to="/"
                        onClick={onClose}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                        <Home className="h-4 w-4" />
                        <span className="text-sm font-medium">Home</span>
                    </Link>

                    <Link
                        to="/products"
                        onClick={onClose}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                        <ShoppingBag className="h-4 w-4" />
                        <span className="text-sm font-medium">All Products</span>
                    </Link>

                    {/* Categories */}
                    {categories.length > 0 && (
                        <>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-5 mb-2 px-2">Categories</p>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryClick(cat)}
                                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Tag className="h-4 w-4" />
                                        <span className="text-sm font-medium capitalize">{cat}</span>
                                    </div>
                                    <ChevronRight className="h-3 w-3 text-gray-400" />
                                </button>
                            ))}
                        </>
                    )}
                </nav>

                {/* Footer */}
                <div className="px-5 py-4 border-t text-xs text-gray-400 text-center">
                    © 2026 AKR Womens Clothing
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
