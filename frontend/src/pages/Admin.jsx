import { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Plus, Trash, UploadCloud, X } from 'lucide-react';

const Admin = () => {
    const { token, isAdmin } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('products');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);

    // Product Form State
    const [isAddingProduct, setIsAddingProduct] = useState(false);
    const [newProduct, setNewProduct] = useState({
        title: '', description: '', price: '', category: '', stock: '', sizes: ''
    });
    const [selectedFiles, setSelectedFiles] = useState([]); // File objects
    const [previews, setPreviews] = useState([]);           // Object URLs for preview
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
        }
        fetchData();
    }, [isAdmin, activeTab]);

    // Clean up object URLs on unmount to avoid memory leaks
    useEffect(() => {
        return () => previews.forEach(url => URL.revokeObjectURL(url));
    }, [previews]);

    const fetchData = async () => {
        if (activeTab === 'products') {
            const data = await api.getProducts();
            setProducts(data);
        } else {
            const data = await api.adminGetOrders(token);
            setOrders(data);
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        // Revoke old previews
        previews.forEach(url => URL.revokeObjectURL(url));

        setSelectedFiles(files);
        setPreviews(files.map(f => URL.createObjectURL(f)));
    };

    const removeImage = (index) => {
        URL.revokeObjectURL(previews[index]);
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const resetForm = () => {
        previews.forEach(url => URL.revokeObjectURL(url));
        setNewProduct({ title: '', description: '', price: '', category: '', stock: '', sizes: '' });
        setSelectedFiles([]);
        setPreviews([]);
        setIsAddingProduct(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (selectedFiles.length === 0) {
            alert('Please select at least one product image.');
            return;
        }
        try {
            setIsUploading(true);

            // 1. Upload images first, get back URL list
            const imageUrls = await api.uploadImages(selectedFiles, token);

            // 2. Create product with the returned URLs
            const productData = {
                ...newProduct,
                price: parseFloat(newProduct.price),
                stock: parseInt(newProduct.stock),
                images: imageUrls,
                sizes: newProduct.sizes.split(',').map(s => s.trim()).filter(Boolean)
            };
            await api.createProduct(productData, token);

            resetForm();
            fetchData();
            showToast(`✅ Product "${newProduct.title}" added successfully!`, 'success');
        } catch (error) {
            showToast('Failed to add product: ' + error.message, 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await api.deleteProduct(id, token);
                fetchData();
            } catch (error) {
                alert('Failed to delete product');
            }
        }
    };

    const ORDER_STATUSES = ['Pending', 'Dispatched', 'Shipped', 'Delivered'];

    const statusColors = {
        Pending: 'bg-yellow-100 text-yellow-800',
        Dispatched: 'bg-blue-100 text-blue-800',
        Shipped: 'bg-purple-100 text-purple-800',
        Delivered: 'bg-green-100 text-green-800',
    };

    const handleStatusChange = async (orderId, newStatus) => {
        const oldStatus = orders.find(o => o.id === orderId)?.status;
        try {
            await api.updateOrderStatus(orderId, newStatus, token);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            showToast(`Order #${orderId}: ${oldStatus} → ${newStatus} successfully!`, 'success');
        } catch (error) {
            showToast('Failed to update order status: ' + error.message, 'error');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

            <h1 className="text-3xl font-extrabold mb-8 text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #e11d48, #f59e0b)' }}>Admin Dashboard</h1>

            <div className="flex space-x-4 mb-8">
                <button
                    onClick={() => setActiveTab('products')}
                    className={`px-4 py-2 rounded-md font-medium transition-all ${activeTab === 'products' ? 'text-white' : 'bg-white text-gray-700 hover:bg-rose-50'}`}
                    style={activeTab === 'products' ? { background: 'linear-gradient(135deg, #e11d48, #f59e0b)' } : {}}
                >
                    Products
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-4 py-2 rounded-md font-medium transition-all ${activeTab === 'orders' ? 'text-white' : 'bg-white text-gray-700 hover:bg-rose-50'}`}
                    style={activeTab === 'orders' ? { background: 'linear-gradient(135deg, #e11d48, #f59e0b)' } : {}}
                >
                    Orders
                </button>
            </div>

            {activeTab === 'products' && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Product Management</h2>
                        <button
                            onClick={() => setIsAddingProduct(!isAddingProduct)}
                            className="flex items-center px-4 py-2 text-white rounded-md hover:opacity-90 transition-all"
                            style={{ background: 'linear-gradient(135deg, #e11d48, #f59e0b)' }}
                        >
                            <Plus className="h-4 w-4 mr-2" /> Add Product
                        </button>
                    </div>

                    {isAddingProduct && (
                        <div className="bg-white p-6 rounded-lg shadow mb-8">
                            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <input placeholder="Title" value={newProduct.title} onChange={e => setNewProduct({ ...newProduct, title: e.target.value })} className="border p-2 rounded" required />
                                <input placeholder="Category" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} className="border p-2 rounded" required />
                                <input placeholder="Price" type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} className="border p-2 rounded" required />
                                <input placeholder="Stock" type="number" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} className="border p-2 rounded" required />
                                <input placeholder="Sizes (comma separated, e.g. S,M,L)" value={newProduct.sizes} onChange={e => setNewProduct({ ...newProduct, sizes: e.target.value })} className="border p-2 rounded md:col-span-2" />
                                <textarea placeholder="Description" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} className="border p-2 rounded md:col-span-2" required />

                                {/* ── Image Upload Section ── */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>

                                    {/* Drop / Click zone */}
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-rose-400 hover:bg-rose-50 transition-colors"
                                    >
                                        <UploadCloud className="h-8 w-8 text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-500">Click to select images <span className="text-rose-500 font-medium">(multiple allowed)</span></p>
                                        <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WEBP or GIF</p>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </div>

                                    {/* Thumbnails */}
                                    {previews.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-3">
                                            {previews.map((src, i) => (
                                                <div key={i} className="relative group">
                                                    <img
                                                        src={src}
                                                        alt={`preview-${i}`}
                                                        className="h-20 w-20 object-cover rounded-lg border shadow-sm"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(i)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {/* ── End Image Upload Section ── */}

                                <div className="md:col-span-2 flex justify-end space-x-4">
                                    <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-600">Cancel</button>
                                    <button
                                        type="submit"
                                        disabled={isUploading}
                                        className="px-4 py-2 text-white rounded disabled:opacity-60 flex items-center gap-2 transition-all hover:opacity-90"
                                        style={{ background: 'linear-gradient(135deg, #e11d48, #f59e0b)' }}
                                    >
                                        {isUploading && (
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                            </svg>
                                        )}
                                        {isUploading ? 'Uploading...' : 'Save Product'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {products.map(product => (
                                <li key={product.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center">
                                        <img className="h-10 w-10 rounded-full object-cover mr-4" src={product.images?.[0] || 'https://placehold.co/100'} alt="" />
                                        <div>
                                            <p className="text-sm font-medium text-rose-500">{product.title}</p>
                                            <p className="text-sm text-gray-500">₹{product.price} · Stock: {product.stock}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-900"><Trash className="h-5 w-5" /></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {activeTab === 'orders' && (
                <div>
                    <h2 className="text-xl font-bold mb-6">Order Management</h2>
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {orders.map(order => (
                                <li key={order.id} className="px-6 py-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-lg font-bold">Order #{order.id}</h3>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-1 text-xs rounded-full font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                                                {order.status}
                                            </span>
                                            <select
                                                value={order.status}
                                                onChange={e => handleStatusChange(order.id, e.target.value)}
                                                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 cursor-pointer"
                                            >
                                                {ORDER_STATUSES.map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600">Total: <span className="font-bold text-rose-500">₹{order.total_price.toFixed(2)}</span></p>
                                    <p className="text-sm text-gray-600">Shipping: {order.shipping_address}</p>
                                </li>
                            ))}
                            {orders.length === 0 && <li className="px-6 py-4 text-gray-500">No orders found.</li>}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
