import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { showToast } = useToast();

    // Handle case where images might be empty or null
    const imageUrl = product.images && product.images.length > 0
        ? product.images[0]
        : 'https://placehold.co/600x400?text=No+Image';

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
            <Link to={`/products/${product.id}`}>
                <div className="relative pb-[125%] overflow-hidden">
                    <img
                        src={imageUrl}
                        alt={product.title}
                        className="absolute top-0 left-0 w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                    />
                </div>
            </Link>
            <div className="p-5">
                <div className="mb-2">
                    <span className="text-xs uppercase tracking-wider text-rose-500 font-semibold">{product.category}</span>
                </div>
                <Link to={`/products/${product.id}`}>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-rose-500 transition-colors">{product.title}</h3>
                </Link>
                <div className="flex items-center justify-between mt-4">
                    <span className="text-xl font-bold text-rose-600">₹{product.price.toFixed(2)}</span>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            if (product.stock > 0) {
                                const size = product.sizes?.[0] || 'M';
                                addToCart(product, size);
                                showToast(`🛒 ${product.title} added to cart!`, 'success');
                            }
                        }}
                        disabled={product.stock <= 0}
                        className={`p-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-400 ${product.stock > 0 ? 'text-white hover:opacity-90 hover:scale-105' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                        style={product.stock > 0 ? { background: 'linear-gradient(135deg, #e11d48, #f59e0b)' } : {}}
                        title={product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                    >
                        <ShoppingCart className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
