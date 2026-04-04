import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useGetMyOrdersQuery } from '../features/orders/orderApiSlice.js';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Message } from '../components/ui/Message.jsx';
import { Loader } from '../components/ui/Loader.jsx';
import { useLogoutMutation } from '../features/auth/userApiSlice.js';
import { logout } from '../features/auth/authSlice.js';
import { motion } from 'framer-motion';

export const Profile = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);
  
  const { data: ordersData, isLoading, error } = useGetMyOrdersQuery(undefined, { skip: !userInfo });
  const orders = ordersData || [];
  const [logoutApiCall] = useLogoutMutation();

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      setName(userInfo.name);
      setEmail(userInfo.email);
    }
  }, [userInfo, navigate]);

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="py-6 flex flex-col md:flex-row gap-10">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="md:w-1/3 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">User Profile</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button className="w-full">Update Profile</Button>
          
          <div className="pt-4 border-t mt-4">
            <Button variant="danger" className="w-full" onClick={logoutHandler}>Sign Out</Button>
          </div>
          
          {userInfo && userInfo.role === 'admin' && (
            <div className="pt-4 border-t mt-4">
               <Link to="/admin">
                 <Button variant="secondary" className="w-full">Admin Dashboard</Button>
               </Link>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="md:w-2/3">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h2>
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">{error?.data?.message || 'Failed to fetch orders'}</Message>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivered</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-secondary font-mono">{order.orderId || order._id.substring(18).toUpperCase()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.createdAt.substring(0, 10)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.totalPrice}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.isPaid ? order.paidAt.substring(0, 10) : <span className="text-red-500 font-medium">No</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.isDelivered ? order.deliveredAt.substring(0, 10) : <span className="text-red-500 font-medium">No</span>}
                    </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                       <Link to={`/order/${order._id}`}>
                         <Button variant="ghost" size="sm" className="font-bold text-secondary">Details</Button>
                       </Link>
                     </td>
                   </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};
