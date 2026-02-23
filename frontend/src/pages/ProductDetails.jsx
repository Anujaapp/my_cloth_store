import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ShoppingCart, ArrowLeft } from 'lucide-react';

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSize, setSelectedSize] = useState('');
    const { addToCart } = useCart();
    const { showToast } = useToast();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await api.getProduct(id);
                setProduct(data);
                if (data.sizes && data.sizes.length > 0) {
                    setSelectedSize(data.sizes[0]);
                }
            } catch (err) {
                setError('Failed to load product details.');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) return <div className="text-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500 mx-auto"></div></div>;
    if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
    if (!product) return <div className="text-center py-20">Product not found.</div>;

    const imageUrl = product.images && product.images.length > 0 ? product.images[0] : 'https://placehold.co/600x600?text=No+Image';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <Link to="/products" className="inline-flex items-center text-rose-500 hover:text-rose-700 mb-6 font-medium">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Image Section */}
                <div className="rounded-2xl overflow-hidden shadow-lg bg-white">
                    <img src={imageUrl} alt={product.title} className="w-full h-full object-cover" />
                </div>

                {/* Details Section */}
                <div className="flex flex-col justify-center">
                    <span className="text-sm font-semibold text-rose-500 uppercase tracking-widest mb-2">{product.category}</span>
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{product.title}</h1>
                    <p className="text-3xl font-bold text-rose-600 mb-6">₹{product.price.toFixed(2)}</p>

                    <p className="text-gray-600 mb-8 leading-relaxed">
                        {product.description}
                    </p>

                    {/* Size Selector */}
                    <div className="mb-8">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Select Size</h3>
                        <div className="flex flex-wrap gap-3">
                            {product.sizes && product.sizes.map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`px-4 py-2 border rounded-md text-sm font-medium transition-all duration-200 
                                ${selectedSize === size
                                            ? 'text-white border-transparent shadow-md transform scale-105'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-rose-400 hover:text-rose-500'}`}
                                    style={selectedSize === size ? { background: 'linear-gradient(135deg, #e11d48, #f59e0b)' } : {}}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-4">
                        <button
                            onClick={() => {
                                addToCart(product, selectedSize);
                                showToast(`🛒 ${product.title} added to cart!`, 'success');
                            }}
                            disabled={!selectedSize || product.stock <= 0}
                            className={`flex-1 flex items-center justify-center px-8 py-3 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-rose-300 disabled:opacity-50 disabled:cursor-not-allowed
                                ${product.stock > 0 ? 'text-white' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
                            style={product.stock > 0 ? { background: 'linear-gradient(135deg, #e11d48, #f59e0b)' } : {}}
                        >
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                    </div>
                    <p className="mt-4 text-sm text-gray-500">
                        {product.stock > 0 ? `In Stock (${product.stock} available)` : <span className="text-red-500">Out of Stock</span>}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
