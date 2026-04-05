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
        <div className="min-h-screen bg-base-black flex overflow-hidden font-sans">
            {/* Sidebar */}
            <motion.aside 
                initial={false}
                animate={{ width: isSidebarOpen ? 280 : 80 }}
                className="relative z-50 bg-surface/20 backdrop-blur-2xl border-r border-white/5 flex flex-col transition-all duration-300 ease-[0.25,0.1,0.25,1] shadow-2xl"
            >
                {/* Logo Section */}
                <div className="h-24 flex items-center px-8">
                    <Link to="/admin" className="flex items-center gap-4 group">
                        <div className="w-10 h-10 border border-accent rounded-sm flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-base-black transition-all duration-300">
                            <Layers size={20} />
                        </div>
                        <AnimatePresence>
                            {isSidebarOpen && (
                                <motion.span 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="text-lg font-display tracking-[0.1em] text-text-primary uppercase"
                                >
                                    Hannvis
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Link>
                </div>

                {/* Navigation Links */}
                <nav className="flex-grow px-6 py-6 space-y-3">
                    <p className={`text-[10px] font-bold text-text-muted uppercase tracking-[0.3em] mb-6 px-4 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
                        Navigation
                    </p>
                    {menuItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link 
                                key={item.name}
                                to={item.path}
                                className={`group flex items-center gap-4 px-4 py-3 rounded-sm transition-all duration-300 relative overflow-hidden ${
                                    isActive 
                                    ? 'bg-accent text-base-black font-bold shadow-[0_0_20px_rgba(201,169,110,0.1)]' 
                                    : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                                }`}
                            >
                                <item.icon size={18} className="flex-shrink-0" />
                                <AnimatePresence>
                                    {isSidebarOpen && (
                                        <motion.span 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="whitespace-nowrap text-xs uppercase tracking-widest pt-0.5"
                                        >
                                            {item.name}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                                {isActive && !isSidebarOpen && (
                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-accent" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Section (Logout) */}
                <div className="p-6 border-t border-white/5 bg-black/20">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-4 py-3 text-text-muted hover:text-red-400 transition-colors group"
                    >
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <AnimatePresence>
                            {isSidebarOpen && (
                                <motion.span 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    exit={{ opacity: 0 }}
                                    className="text-[10px] uppercase tracking-[0.2em] font-bold"
                                >
                                    End Session
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                </div>

                {/* Toggle Button */}
                <button 
                    onClick={() => setSidebarOpen(!isSidebarOpen)}
                    className="absolute -right-3 top-12 bg-accent text-base-black rounded-sm p-1 shadow-gold-glow transition-all hover:scale-110 z-[60]"
                >
                    {isSidebarOpen ? <X size={12} /> : <Menu size={12} />}
                </button>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-grow flex flex-col h-screen overflow-hidden">
                {/* Top Header */}
                <header className="h-24 bg-base-black/40 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-12 sticky top-0 z-40">
                    <div>
                        <p className="text-[9px] font-bold text-accent uppercase tracking-[0.4em] mb-1 italic opacity-80">Management Workspace</p>
                        <h1 className="text-3xl font-display text-text-primary tracking-tight">{getPageTitle()}</h1>
                    </div>

                    <div className="flex items-center gap-10">
                        <div className="hidden md:flex items-center bg-surface/40 border border-white/5 focus-within:border-accent/40 focus-within:bg-surface/60 px-5 py-2.5 rounded-sm transition-all w-80 group shadow-inner">
                            <Search size={16} className="text-text-muted group-focus-within:text-accent transition-colors" />
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search archives..." 
                                className="bg-transparent border-none outline-none ml-3 text-xs tracking-wider text-text-primary placeholder:text-text-muted/50 w-full"
                            />
                        </div>

                        <div className="flex items-center gap-4 px-5 py-2.5 bg-surface/30 rounded-sm border border-white/5 group hover:border-accent/20 transition-all">
                            <div className="w-9 h-9 rounded-sm border border-accent/20 bg-accent text-base-black flex items-center justify-center text-xs font-bold shadow-lg">
                                {userInfo?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden lg:block text-left">
                                <p className="text-[10px] font-bold text-text-primary leading-none uppercase tracking-widest">{userInfo?.name}</p>
                                <p className="text-[8px] font-bold text-accent uppercase tracking-[0.2em] mt-1.5 opacity-60">Admin Rank</p>
                            </div>
                        </div>

                        <button className="relative w-10 h-10 flex items-center justify-center text-text-muted hover:text-accent transition-all group">
                            <Bell size={20} className="group-hover:scale-110 transition-transform" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border border-base-black animate-pulse"></span>
                        </button>
                    </div>
                </header>

                {/* Content Outlet */}
                <main className="flex-grow overflow-y-auto p-12 bg-base-black custom-scrollbar">
                    <div className="max-w-7xl mx-auto">
                        <Outlet context={{ searchQuery: debouncedSearchQuery }} />
                    </div>
                </main>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(201, 169, 110, 0.1);
                    border-radius: 0;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(201, 169, 110, 0.3);
                }
            `}} />
        </div>
    );
};
