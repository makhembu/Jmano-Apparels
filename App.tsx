import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
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
import { AdminLayout } from './components/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminProductEditor } from './pages/admin/AdminProductEditor';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminOrderDetails } from './pages/admin/AdminOrderDetails';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminBlog } from './pages/admin/AdminBlog';
import { AdminBlogEditor } from './pages/admin/AdminBlogEditor';
import { Terms, Privacy, Cookies, Returns } from './pages/Legal';
import ScrollToTop from './components/ScrollToTop';
import { SystemHealth } from './components/SystemHealth';

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <SystemHealth>
        <AuthProvider>
          <ShopProvider>
            <CartProvider>
              {/* AppProvider wraps specific providers to bridge legacy useApp hooks */}
              <AppProvider>
                <Router>
                  <ScrollToTop />
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
                    <Route path="/login" element={<Layout><Login /></Layout>} />
                    
                    {/* Legal Routes */}
                    <Route path="/terms" element={<Layout><Terms /></Layout>} />
                    <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
                    <Route path="/cookies" element={<Layout><Cookies /></Layout>} />
                    <Route path="/returns" element={<Layout><Returns /></Layout>} />

                    {/* User Routes */}
                    <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />

                    {/* Admin Routes */}
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<AdminDashboard />} />
                      <Route path="settings" element={<AdminSettings />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="products/new" element={<AdminProductEditor />} />
                      <Route path="products/:id" element={<AdminProductEditor />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="orders/:id" element={<AdminOrderDetails />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="blog" element={<AdminBlog />} />
                      <Route path="blog/new" element={<AdminBlogEditor />} />
                      <Route path="blog/:id" element={<AdminBlogEditor />} />
                    </Route>
                  </Routes>
                </Router>
              </AppProvider>
            </CartProvider>
          </ShopProvider>
        </AuthProvider>
      </SystemHealth>
    </HelmetProvider>
  );
};

export default App;