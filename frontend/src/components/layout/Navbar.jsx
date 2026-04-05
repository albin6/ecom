import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useLogoutMutation } from '../../features/auth/userApiSlice.js';
import { logout } from '../../features/auth/authSlice.js';

const NavLink = ({ to, children }) => (
  <Link
    to={to}
    className="relative text-[11px] uppercase tracking-[0.2em] font-bold text-text-muted hover:text-text-primary transition-all duration-300 group pb-1"
  >
    {children}
    <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-accent transition-all duration-500 group-hover:w-full" />
  </Link>
);

export const Navbar = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();
  const cartCount = cartItems.reduce((acc, i) => acc + i.qty, 0);

  const handleLogout = async () => {
    try {
      await logoutApiCall().unwrap();
    } catch (err) {
      console.error('API logout failed, performing local logout:', err);
    } finally {
      dispatch(logout());
      navigate('/login');
    }
  };

  return (
    <div className="flex justify-between items-center h-24">
      <Link to="/" className="text-2xl font-serif tracking-[0.2em] uppercase text-text-primary hover:text-accent transition-colors">
        Hannvis
      </Link>

      <div className="flex gap-8 items-center">
        <NavLink to="/shop">Shop</NavLink>
        {userInfo ? (
          <>
            {userInfo.role !== 'admin' && (
              <Link to="/cart" className="relative group p-2 text-text-muted hover:text-accent transition-all duration-300" title="Cart">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute top-0 right-0 h-4 w-4 bg-accent text-base-black text-[9px] font-bold rounded-full flex items-center justify-center leading-none shadow-[0_0_10px_rgba(201,169,110,0.4)]"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Link>
            )}
            <NavLink to="/profile">{userInfo.name.split(' ')[0]}</NavLink>
            {userInfo.role === 'admin' && (
              <NavLink to="/admin">Admin</NavLink>
            )}
            <button
              onClick={handleLogout}
              className="text-[11px] uppercase tracking-[0.2em] font-bold text-text-muted hover:text-error transition-colors"
            >
              Exit
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="btn btn-primary h-10 px-8 shadow-lg"
          >
            Entry
          </Link>
        )}
      </div>
    </div>
  );
};
