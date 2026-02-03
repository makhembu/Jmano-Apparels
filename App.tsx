
import React, { useEffect, Suspense, lazy } from 'react';
// @ts-ignore
import { HashRouter, BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { ShopProvider } from './context/ShopContext';
import { CartProvider } from './context/CartContext';
import { Layout } from './components/Layout';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import ScrollToTop from './components/ScrollToTop';
import { SystemHealth } from './components/SystemHealth';
import { supabase } from './lib/supabaseClient';
import { GlobalScriptInjector } from './components/GlobalScriptInjector';
import { GlobalAnalyticsTracker } from './components/GlobalAnalyticsTracker';
import { CacheManager } from './lib/cache';

// --- Lazy Loaded Components ---

// Public Pages (Critical Path - Keep Home Eager if possible, but lazy for now to split bundle)
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetails } from './pages/ProductDetails';

// User Dashboard & Cart
const Cart = lazy(() => import('./pages/Cart').then(module => ({ default: module.Cart })));
const Checkout = lazy(() => import('./pages/Checkout').then(module => ({ default: module.Checkout })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const UserOrderDetails = lazy(() => import('./pages/dashboard/UserOrderDetails').then(module => ({ default: module.UserOrderDetails })));

// Content Pages
const About = lazy(() => import('./pages/About').then(module => ({ default: module.About })));
const Blog = lazy(() => import('./pages/Blog').then(module => ({ default: module.Blog })));
const BlogPost = lazy(() => import('./pages/BlogPost').then(module => ({ default: module.BlogPost })));

// Auth
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then(module => ({ default: module.ForgotPassword })));
const UpdatePassword = lazy(() => import('./pages/UpdatePassword').then(module => ({ default: module.UpdatePassword })));

// Legal
const Terms = lazy(() => import('./pages/Legal').then(module => ({ default: module.Terms })));
const Privacy = lazy(() => import('./pages/Legal').then(module => ({ default: module.Privacy })));
const Cookies = lazy(() => import('./pages/Legal').then(module => ({ default: module.Cookies })));
const Returns = lazy(() => import('./pages/Legal').then(module => ({ default: module.Returns })));
const NotFound = lazy(() => import('./pages/NotFound').then(module => ({ default: module.NotFound })));

// Admin - Heavy Bundle
const AdminLayout = lazy(() => import('./components/AdminLayout').then(module => ({ default: module.AdminLayout })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics').then(module => ({ default: module.AdminAnalytics })));
const AdminAppSettings = lazy(() => import('./pages/admin/AdminAppSettings').then(module => ({ default: module.AdminAppSettings })));
const AdminShopSettings = lazy(() => import('./pages/admin/AdminShopSettings').then(module => ({ default: module.AdminShopSettings })));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts').then(module => ({ default: module.AdminProducts })));
const AdminProductEditor = lazy(() => import('./pages/admin/AdminProductEditor').then(module => ({ default: module.AdminProductEditor })));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders').then(module => ({ default: module.AdminOrders })));
const AdminOrderDetails = lazy(() => import('./pages/admin/AdminOrderDetails').then(module => ({ default: module.AdminOrderDetails })));
const AdminOrderNew = lazy(() => import('./pages/admin/AdminOrderNew').then(module => ({ default: module.AdminOrderNew })));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments').then(module => ({ default: module.AdminPayments })));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers').then(module => ({ default: module.AdminUsers })));
const AdminBlog = lazy(() => import('./pages/admin/AdminBlog').then(module => ({ default: module.AdminBlog })));
const AdminBlogEditor = lazy(() => import('./pages/admin/AdminBlogEditor').then(module => ({ default: module.AdminBlogEditor })));
const AdminNewsletter = lazy(() => import('./pages/admin/AdminNewsletter').then(module => ({ default: module.AdminNewsletter })));
const AdminContact = lazy(() => import('./pages/admin/AdminContact').then(module => ({ default: module.AdminContact })));
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile').then(module => ({ default: module.AdminProfile })));

// 1. Hybrid Router Selection
const isProduction = window.location.hostname === 'jamboapparels.com' || window.location.hostname === 'www.jamboapparels.com';
const Router = isProduction ? BrowserRouter : HashRouter;

// Auth Event Handler
const AuthEventHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Cast to any to bypass type mismatch error
    const { data: { subscription } } = (supabase.auth as any).onAuthStateChange((event: string, session: any) => {
      if (event === 'PASSWORD_RECOVERY') {
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
  // Version Check on Mount
  useEffect(() => {
    CacheManager.checkVersion();
  }, []);

  return (
    <SystemHealth>
      <AuthProvider>
        <ShopProvider>
          <CartProvider>
            <AppProvider>
              <Router>
                <GlobalScriptInjector />
                <GlobalAnalyticsTracker />
                <ScrollToTop />
                <AuthEventHandler />
                
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <Routes>
                    {/* Public Routes (Eager) */}
                    <Route path="/" element={<Layout><Home /></Layout>} />
                    <Route path="/shop" element={<Layout><Shop /></Layout>} />
                    <Route path="/product/:id" element={<Layout><ProductDetails /></Layout>} />
                    
                    {/* Public Routes (Lazy) */}
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
                      <Route path="analytics" element={<AdminAnalytics />} />
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

                    {/* 404 Catch-All */}
                    <Route path="*" element={<Layout><NotFound /></Layout>} />
                  </Routes>
                </Suspense>
              </Router>
            </AppProvider>
          </CartProvider>
        </ShopProvider>
      </AuthProvider>
    </SystemHealth>
  );
};

export default App;
