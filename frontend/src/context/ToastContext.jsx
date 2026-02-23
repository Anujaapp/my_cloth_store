import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState(null);

    const showToast = useCallback((message, type = 'success', duration = 3000) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), duration);
    }, []);

    const hideToast = () => setToast(null);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <div
                    className="fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-medium"
                    style={{
                        background: toast.type === 'success'
                            ? 'linear-gradient(135deg, #e11d48, #f59e0b)'
                            : toast.type === 'info'
                                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                : '#dc2626',
                        minWidth: '280px',
                        animation: 'slideIn 0.3s ease-out'
                    }}
                >
                    <span className="text-lg">
                        {toast.type === 'success' ? '✅' : toast.type === 'info' ? 'ℹ️' : '❌'}
                    </span>
                    <span className="flex-1">{toast.message}</span>
                    <button
                        onClick={hideToast}
                        className="ml-2 text-white/70 hover:text-white text-xl leading-none"
                    >
                        &times;
                    </button>
                </div>
            )}
            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(100%); }
                    to   { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </ToastContext.Provider>
    );
};
