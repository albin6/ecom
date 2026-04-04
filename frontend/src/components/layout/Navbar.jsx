import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useLogoutMutation } from '../../features/auth/userApiSlice.js';
import { logout } from '../../features/auth/authSlice.js';

const NavLink = ({ to, children }) => (
  <Link
    to={to}
    className="relative text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors group pb-0.5"
  >
    {children}
    <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-secondary rounded-full transition-all duration-300 group-hover:w-full" />
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
      // Always clear local state and redirect to login
      dispatch(logout());
      navigate('/login');
    }
  };

  return (
    <div className="flex justify-between items-center h-16">
      <Link to="/" className="text-xl font-black tracking-tight text-gray-900 flex items-center gap-1.5">
        <span className="text-secondary">H</span>annvis
      </Link>

      <div className="flex gap-5 items-center">
        {userInfo ? (
          <>
            {userInfo.role !== 'admin' && (
              <Link to="/cart" className="relative flex items-center text-gray-600 hover:text-gray-900 transition-colors" title="Cart">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 h-4.5 min-w-[18px] px-1 bg-secondary text-white text-[10px] font-black rounded-full flex items-center justify-center leading-none"
                    style={{ height: 18 }}
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Link>
            )}
            <NavLink to="/profile">{userInfo.name.split(' ')[0]}</NavLink>
            {userInfo.role === 'admin' && (
              <NavLink to="/admin">
                <span className="text-emerald-600">Admin</span>
              </NavLink>
            )}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleLogout}
              className="text-sm font-semibold text-gray-500 hover:text-red-500 transition-colors"
            >
              Sign Out
            </motion.button>
          </>
        ) : (
          <Link
            to="/login"
            className="h-9 px-5 bg-primary text-white rounded-full text-sm font-semibold hover:bg-slate-800 flex items-center transition-colors shadow-sm"
          >
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
};
