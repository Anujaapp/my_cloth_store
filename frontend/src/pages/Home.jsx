import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../api';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=500&q=60';

const Home = () => {
    const [categoryGroups, setCategoryGroups] = useState([]);
    const location = useLocation();

    // Scroll to About section if navigated here from another page with state
    useEffect(() => {
        if (location.state?.scrollTo === 'about') {
            setTimeout(() => {
                document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
            }, 150);
        }
    }, [location.state]);

    useEffect(() => {
        api.getProducts().then(products => {
            // Group all products by category
            const map = {};
            products.forEach(p => {
                if (!p.category) return;
                if (!map[p.category]) map[p.category] = [];
                map[p.category].push(p);
            });
            // Convert to array: [{category, products: [...]}]
            setCategoryGroups(
                Object.entries(map).map(([category, items]) => ({ category, items }))
            );
        }).catch(() => { });
    }, []);

    return (
        <div>
            {/* Hero Section */}
            <div className="w-full" style={{ background: 'linear-gradient(135deg, #fff5f7 0%, #fff8ee 50%, #ffffff 100%)' }}>
                <div className="w-full px-8 py-20 flex flex-col lg:flex-row items-center gap-12">
                    <div className="flex-1 text-center lg:text-left">
                        <span className="inline-block text-xs font-bold uppercase tracking-widest text-rose-500 bg-rose-50 border border-rose-200 rounded-full px-4 py-1 mb-4">New Collection 2026</span>
                        <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                            Elevate your style with{' '}
                            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #e11d48, #f59e0b)' }}>TrendSetters</span>
                        </h1>
                        <p className="mt-6 text-lg text-gray-500 max-w-lg mx-auto lg:mx-0">
                            Discover the latest fashion trends in women's clothing. From casual chic to elegant evening wear, we have something for every occasion.
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link to="/products" className="px-8 py-4 font-semibold rounded-xl text-base transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-white" style={{ background: 'linear-gradient(135deg, #e11d48, #f59e0b)' }}>
                                Shop Collection
                            </Link>
                            <Link to="/login" className="px-8 py-4 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-semibold rounded-xl text-base transition-colors shadow-sm">
                                Join Now
                            </Link>
                        </div>
                    </div>
                    <div className="flex-1 w-full">
                        <img
                            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                            alt="Woman shopping"
                            className="w-full h-96 lg:h-[500px] object-cover rounded-2xl shadow-xl"
                        />
                    </div>
                </div>
            </div>

            {/* Category Sections — one per category */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
                {categoryGroups.length === 0 ? (
                    <p className="text-center text-gray-400 py-10">No products yet. Add products from the admin dashboard.</p>
                ) : (
                    categoryGroups.map(({ category, items }) => (
                        <section key={category}>
                            {/* Category Heading */}
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-2xl font-extrabold text-gray-900 capitalize">{category}</h2>
                                <Link
                                    to={`/products?category=${encodeURIComponent(category)}`}
                                    className="text-sm font-medium text-rose-500 hover:text-rose-700 hover:underline"
                                >
                                    View all →
                                </Link>
                            </div>

                            {/* Product Images Row */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {items.slice(0, 5).map(product => (
                                    <Link
                                        to={`/products/${product.id}`}
                                        key={product.id}
                                        className="group rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow duration-300"
                                    >
                                        <img
                                            src={product.images?.[0] || FALLBACK_IMG}
                                            alt={product.title}
                                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                            onError={e => { e.target.src = FALLBACK_IMG; }}
                                        />
                                        <div className="p-2 bg-white">
                                            <p className="text-sm font-medium text-gray-800 truncate">{product.title}</p>
                                            <p className="text-sm font-bold text-rose-500">₹{product.price}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ))
                )}
            </div>

            {/* About Section */}
            <section id="about" className="w-full py-20 px-8 mt-10" style={{ background: 'linear-gradient(135deg, #9f1239 0%, #e11d48 40%, #f59e0b 100%)' }}>
                <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-12">
                    {/* Image */}
                    <div className="flex-1">
                        <img
                            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=700&q=80"
                            alt="About AKR Womens Clothing"
                            className="w-full h-72 lg:h-96 object-cover rounded-2xl shadow-2xl"
                        />
                    </div>
                    {/* Text */}
                    <div className="flex-1 text-white">
                        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-200 mb-3">Our Story</p>
                        <h2 className="text-4xl font-extrabold leading-tight mb-5"
                            style={{ fontFamily: "'Playfair Display', serif" }}>
                            About AKR Womens Clothing
                        </h2>
                        <p className="text-indigo-100 text-base leading-relaxed mb-4">
                            AKR Womens Clothing was born from a passion for empowering women through fashion. We believe every woman deserves to look and feel her best, no matter the occasion.
                        </p>
                        <p className="text-indigo-100 text-base leading-relaxed mb-6">
                            From timeless classics to the latest trends — our curated collection of tops, dresses, bottoms, and kurta sets is crafted with quality fabrics and thoughtful design, keeping the modern Indian woman in mind.
                        </p>
                        <div className="flex flex-wrap gap-6">
                            <div className="text-center">
                                <p className="text-3xl font-black">500+</p>
                                <p className="text-indigo-200 text-sm">Styles Available</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-black">10K+</p>
                                <p className="text-indigo-200 text-sm">Happy Customers</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-black">100%</p>
                                <p className="text-indigo-200 text-sm">Quality Assured</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
