import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Home } from './pages/Home.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { ProductDetails } from './pages/ProductDetails.jsx';
import { Cart } from './pages/Cart.jsx';
import { Shipping } from './pages/Shipping.jsx';
import { Payment } from './pages/Payment.jsx';
import { PlaceOrder } from './pages/PlaceOrder.jsx';
import { Profile } from './pages/Profile.jsx';
import { Admin } from './pages/Admin.jsx';
import { ProductListing } from './pages/ProductListing.jsx';
import { AdminProductList } from './pages/admin/AdminProductList.jsx';
import { AdminProductEdit } from './pages/admin/AdminProductEdit.jsx';
import { AdminCategoryList } from './pages/admin/AdminCategoryList.jsx';
import { AdminCategoryEdit } from './pages/admin/AdminCategoryEdit.jsx';
import { AdminOrderList } from './pages/admin/AdminOrderList.jsx';
import { AdminLayout } from './pages/admin/AdminLayout.jsx';
import { VerifyEmail } from './pages/VerifyEmail.jsx';
import { OrderDetails } from './pages/OrderDetails.jsx';
import { Navbar } from './components/layout/Navbar.jsx';
import { Footer } from './components/layout/Footer.jsx';
import { VerificationBanner } from './components/layout/VerificationBanner.jsx';
import { CartSync } from './components/cart/CartSync.jsx';

function App() {
  return (
    <Router>
      <CartSync />
      <div className="min-h-screen bg-base-black flex flex-col selection:bg-accent/30 selection:text-accent">
        <header className="fixed top-0 left-0 w-full z-[100] border-b border-white/5 bg-base-black/60 backdrop-blur-xl">
          <VerificationBanner />
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 w-full">
            <Navbar />
          </div>
        </header>
        <main className="flex-grow pt-32 pb-16 max-w-[1440px] mx-auto px-6 lg:px-12 w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<ProductListing />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Navigate to="/shipping" />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/placeorder" element={<PlaceOrder />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* Admin Routes with Layout */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Admin />} />
              <Route path="products" element={<AdminProductList />} />
              <Route path="products/new" element={<AdminProductEdit />} />
              <Route path="products/:id/edit" element={<AdminProductEdit />} />
              <Route path="categories" element={<AdminCategoryList />} />
              <Route path="categories/new" element={<AdminCategoryEdit />} />
              <Route path="categories/:id/edit" element={<AdminCategoryEdit />} />
              <Route path="orderlist" element={<AdminOrderList />} />
              <Route path="users" element={<div className="p-8 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Internal Stub</p>
                <h3 className="text-xl font-black text-gray-900">User Management System</h3>
                <p className="text-gray-500 mt-2">Access control and identity services are currently being provisioned.</p>
              </div>} />
              <Route path="sales" element={<div className="p-8 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Metrics Engine</p>
                <h3 className="text-xl font-black text-gray-900">Financial Intelligence & Analytics</h3>
                <p className="text-gray-500 mt-2">The analytics pipeline is pending data ingestion from production orders.</p>
              </div>} />
            </Route>

            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/order/:id" element={<OrderDetails />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
