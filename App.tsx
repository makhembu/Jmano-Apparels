
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { ShopProvider } from './context/ShopContext';
import { CartProvider } from './context/CartContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetails } from './pages/ProductDetails';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Dashboard } from './pages/Dashboard';
import { About } from './pages/About';
import { Blog } from './pages/Blog';
import { BlogPost } from './pages/BlogPost';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { UpdatePassword } from './pages/UpdatePassword';
import { AdminLayout } from './components/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminAppSettings } from './pages/admin/AdminAppSettings';
import { AdminShopSettings } from './pages/admin/AdminShopSettings';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminProductEditor } from './pages/admin/AdminProductEditor';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminOrderDetails } from './pages/admin/AdminOrderDetails';
import { AdminOrderNew } from './pages/admin/AdminOrderNew';
import { AdminPayments } from './pages/admin/AdminPayments';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminBlog } from './pages/admin/AdminBlog';
import { AdminBlogEditor } from './pages/admin/AdminBlogEditor';
import { AdminNewsletter } from './pages/admin/AdminNewsletter';
import { AdminContact } from './pages/admin/AdminContact';
import { AdminProfile } from './pages/admin/AdminProfile';
import { Terms, Privacy, Cookies, Returns } from './pages/Legal';
import ScrollToTop from './components/ScrollToTop';
import { SystemHealth } from './components/SystemHealth';
import { UserOrderDetails } from './pages/dashboard/UserOrderDetails';
import { supabase } from './lib/supabaseClient';
import { GlobalScriptInjector } from './components/GlobalScriptInjector';

// Component to handle global auth events like Password Recovery redirection
const AuthEventHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Redirect to the verifier/update password page when recovery link is clicked
        navigate('/update-password');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return null;
};

const App: React.FC = () => {
  return (
    <SystemHealth>
      <AuthProvider>
        <ShopProvider>
          <CartProvider>
            {/* AppProvider wraps specific providers to bridge legacy useApp hooks */}
            <AppProvider>
              <GlobalScriptInjector />
              <Router>
                <ScrollToTop />
                <AuthEventHandler />
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Layout><Home /></Layout>} />
                  <Route path="/shop" element={<Layout><Shop /></Layout>} />
                  <Route path="/product/:id" element={<Layout><ProductDetails /></Layout>} />
                  <Route path="/cart" element={<Layout><Cart /></Layout>} />
                  <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
                  <Route path="/about" element={<Layout><About /></Layout>} />
                  <Route path="/blog" element={<Layout><Blog /></Layout>} />
                  <Route path="/blog/:slug" element={<Layout><BlogPost /></Layout>} />
                  
                  {/* Auth Routes */}
                  <Route path="/login" element={<Layout><Login /></Layout>} />
                  <Route path="/forgot-password" element={<Layout><ForgotPassword /></Layout>} />
                  <Route path="/update-password" element={<Layout><UpdatePassword /></Layout>} />
                  
                  {/* Legal Routes */}
                  <Route path="/terms" element={<Layout><Terms /></Layout>} />
                  <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
                  <Route path="/cookies" element={<Layout><Cookies /></Layout>} />
                  <Route path="/returns" element={<Layout><Returns /></Layout>} />

                  {/* User Routes */}
                  <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
                  <Route path="/order/:id" element={<Layout><UserOrderDetails /></Layout>} />

                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="app-settings" element={<AdminAppSettings />} />
                    <Route path="shop-settings" element={<AdminShopSettings />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="products/new" element={<AdminProductEditor />} />
                    <Route path="products/:id" element={<AdminProductEditor />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="orders/new" element={<AdminOrderNew />} />
                    <Route path="orders/:id" element={<AdminOrderDetails />} />
                    <Route path="payments" element={<AdminPayments />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="blog" element={<AdminBlog />} />
                    <Route path="blog/new" element={<AdminBlogEditor />} />
                    <Route path="blog/:id" element={<AdminBlogEditor />} />
                    <Route path="newsletter" element={<AdminNewsletter />} />
                    <Route path="contact" element={<AdminContact />} />
                    <Route path="profile" element={<AdminProfile />} />
                  </Route>
                </Routes>
              </Router>
            </AppProvider>
          </CartProvider>
        </ShopProvider>
      </AuthProvider>
    </SystemHealth>
  );
};

export default App;
