import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, 
    ShoppingBag, 
    Layers, 
    ClipboardList, 
    Users, 
    BarChart3, 
    LogOut, 
    Menu, 
    X, 
    Settings,
    Bell,
    Search,
    ChevronRight,
    UserCircle
} from 'lucide-react';
import { logout } from '../../features/auth/authSlice.js';
import { useLogoutMutation } from '../../features/auth/userApiSlice.js';
import { useDebounce } from '../../hooks/useDebounce.js';

export const AdminLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 500);
    const { userInfo } = useSelector((state) => state.auth);
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [logoutApiCall] = useLogoutMutation();

    // Reset search query on tab change
    useEffect(() => {
        setSearchQuery('');
    }, [pathname]);

    const handleLogout = async () => {
        try {
            await logoutApiCall().unwrap();
            dispatch(logout());
            navigate('/login');
        } catch (err) {
            console.error(err);
        }
    };

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
        { name: 'Categories', icon: Layers, path: '/admin/categories' },
        { name: 'Products', icon: ShoppingBag, path: '/admin/products' },
        { name: 'Orders', icon: ClipboardList, path: '/admin/orderlist' },
        { name: 'Users', icon: Users, path: '/admin/users' },
        { name: 'Sales & Analytics', icon: BarChart3, path: '/admin/sales' },
    ];

    const getPageTitle = () => {
        const current = menuItems.find(item => item.path === pathname);
        if (current) return current.name;
        if (pathname.includes('/admin/products/')) return 'Product Editor';
        if (pathname.includes('/admin/categories/')) return 'Category Editor';
        return 'Admin Portal';
    };

    return (
        <div className="min-h-screen bg-[#FDFDFF] flex overflow-hidden">
            {/* Sidebar */}
            <motion.aside 
                initial={false}
                animate={{ width: isSidebarOpen ? 280 : 80 }}
                className="relative z-50 bg-white border-r border-gray-100 flex flex-col transition-all duration-300 ease-in-out shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
            >
                {/* Logo Section */}
                <div className="h-20 flex items-center px-6 mb-4">
                    <Link to="/admin" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-white shadow-lg shadow-secondary/20">
                            <ShoppingBag size={24} />
                        </div>
                        <AnimatePresence>
                            {isSidebarOpen && (
                                <motion.span 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="text-xl font-black text-gray-900 tracking-tight"
                                >
                                    HANNVIS
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Link>
                </div>

                {/* Navigation Links */}
                <nav className="flex-grow px-4 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link 
                                key={item.name}
                                to={item.path}
                                className={`group flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 relative overflow-hidden ${
                                    isActive 
                                    ? 'bg-secondary text-white shadow-lg shadow-secondary/25 font-bold' 
                                    : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                <item.icon size={22} className={isActive ? 'text-white' : 'group-hover:text-secondary group-hover:scale-110 transition-transform'} />
                                <AnimatePresence>
                                    {isSidebarOpen && (
                                        <motion.span 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="whitespace-nowrap"
                                        >
                                            {item.name}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                                {isActive && isSidebarOpen && (
                                    <motion.div layoutId="activeArrow" className="ml-auto">
                                        <ChevronRight size={16} />
                                    </motion.div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Section (Logout) */}
                <div className="p-4 border-t border-gray-50">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-red-400 hover:text-red-500 hover:bg-red-50/50 transition-all group font-medium"
                    >
                        <LogOut size={22} className="group-hover:translate-x-1 transition-transform" />
                        <AnimatePresence>
                            {isSidebarOpen && (
                                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    Sign Out
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                </div>

                {/* Toggle Button */}
                <button 
                    onClick={() => setSidebarOpen(!isSidebarOpen)}
                    className="absolute -right-3 top-24 bg-white border border-gray-100 rounded-full p-1 shadow-sm text-gray-400 hover:text-secondary hover:shadow-md transition-all z-[60]"
                >
                    {isSidebarOpen ? <X size={14} /> : <Menu size={14} />}
                </button>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-grow flex flex-col h-screen overflow-hidden">
                {/* Top Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-10 sticky top-0 z-40">
                    <div>
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1 italic">Administrative Control</h2>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">{getPageTitle()}</h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center bg-gray-50 border border-transparent focus-within:border-gray-200 focus-within:bg-white px-4 py-2 rounded-xl transition-all w-64 group">
                            <Search size={18} className="text-gray-400 group-focus-within:text-secondary" />
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Universal search..." 
                                className="bg-transparent border-none outline-none ml-2 text-sm text-gray-900 w-full"
                            />
                        </div>

                        <div className="flex items-center gap-3 px-4 py-2 bg-gray-50/50 rounded-2xl border border-gray-100 group hover:border-gray-200 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white ring-offset-2">
                                {userInfo?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden lg:block text-left">
                                <p className="text-xs font-black text-gray-900 leading-none">{userInfo?.name}</p>
                                <p className="text-[10px] font-bold text-secondary uppercase tracking-tighter mt-1">Admin Access</p>
                            </div>
                        </div>

                        <button className="relative w-10 h-10 flex items-center justify-center text-gray-400 hover:text-secondary hover:bg-gray-50 rounded-xl transition-all">
                            <Bell size={20} />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                    </div>
                </header>

                {/* Content Outlet */}
                <main className="flex-grow overflow-y-auto p-10 bg-[#FDFDFF] custom-scrollbar">
                    <Outlet context={{ searchQuery: debouncedSearchQuery }} />
                </main>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #E5E7EB;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #D1D5DB;
                }
            `}} />
        </div>
    );
};
