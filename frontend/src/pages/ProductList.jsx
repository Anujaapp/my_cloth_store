import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api';
import ProductCard from '../components/ProductCard';




const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();

    const activeCategory = searchParams.get('category') || '';

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await api.getProducts();
                setProducts(data);
            } catch (err) {
                setError('Failed to load products. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const filtered = activeCategory
        ? products.filter(p => p.category?.toLowerCase() === activeCategory.toLowerCase())
        : products;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-10">
                <p className="text-red-500 text-lg">{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-3xl font-extrabold mb-6 text-center text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #e11d48, #f59e0b)' }}>
                {activeCategory ? activeCategory : 'All Products'}
            </h2>


            {filtered.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-gray-500 text-lg">No products found in <strong>{activeCategory}</strong>.</p>
                    <button onClick={() => setSearchParams({})} className="mt-4 text-rose-500 hover:text-rose-700 hover:underline text-sm font-medium">
                        View all products
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filtered.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductList;
