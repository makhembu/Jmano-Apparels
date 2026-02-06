import React, { useEffect, Suspense, lazy } from 'react';
import { HashRouter, BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ShopProvider } from './context/ShopContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { CookieConsentProvider } from './context/CookieConsentContext';
import { Layout } from './components/Layout';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import ScrollToTop from './components/ScrollToTop';
import { SystemHealth } from './components/SystemHealth';
import { GlobalScriptInjector } from './components/GlobalScriptInjector';
import { GlobalAnalyticsTracker } from './components/GlobalAnalyticsTracker';
import { CacheManager } from './lib/cache';
import { AppInitializer } from './components/AppInitializer';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy Loaded Components
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetails } from './pages/ProductDetails';

const Cart = lazy(() => import('./pages/Cart').then(module => ({ default: module.Cart })));
const Checkout = lazy(() => import('./pages/Checkout').then(module => ({ default: module.Checkout })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const UserOrderDetails = lazy(() => import('./pages/dashboard/UserOrderDetails').then(module => ({ default: module.UserOrderDetails })));

const About = lazy(() => import('./pages/About').then(module => ({ default: module.About })));
const Blog = lazy(() => import('./pages/Blog').then(module => ({ default: module.Blog })));
const BlogPost = lazy(() => import('./pages/BlogPost').then(module => ({ default: module.BlogPost })));

const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then(module => ({ default: module.ForgotPassword })));
const UpdatePassword = lazy(() => import('./pages/UpdatePassword').then(module => ({ default: module.UpdatePassword })));

const Terms = lazy(() => import('./pages/Legal').then(module => ({ default: module.Terms })));
const Privacy = lazy(() => import('./pages/Legal').then(module => ({ default: module.Privacy })));
const Cookies = lazy(() => import('./pages/Legal').then(module => ({ default: module.Cookies })));
const Returns = lazy(() => import('./pages/Legal').then(module => ({ default: module.Returns })));
const NotFound = lazy(() => import('./pages/NotFound').then(module => ({ default: module.NotFound })));

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

const isProduction = window.location.hostname.includes('jamboapparels.com');
const Router = isProduction ? BrowserRouter : HashRouter;

const App: React.FC = () => {
  useEffect(() => {
    CacheManager.checkVersion();
  }, []);

  return (
    <ErrorBoundary>
      <SystemHealth>
        <Router>
          <CookieConsentProvider>
            <AuthProvider>
              <ShopProvider>
                <CartProvider>
                  <OrderProvider>
                    <AppInitializer>
                      <GlobalScriptInjector />
                      <GlobalAnalyticsTracker />
                      <ScrollToTop />
                      <Suspense fallback={<LoadingSpinner fullScreen />}>
                        <Routes>
                          <Route path="/" element={<Layout><Home /></Layout>} />
                          <Route path="/shop" element={<Layout><Shop /></Layout>} />
                          <Route path="/product/:id" element={<Layout><ProductDetails /></Layout>} />
                          <Route path="/cart" element={<Layout><Cart /></Layout>} />
                          <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
                          <Route path="/about" element={<Layout><About /></Layout>} />
                          <Route path="/blog" element={<Layout><Blog /></Layout>} />
                          <Route path="/blog/:slug" element={<Layout><BlogPost /></Layout>} />
                          
                          <Route path="/login" element={<Layout><Login /></Layout>} />
                          <Route path="/forgot-password" element={<Layout><ForgotPassword /></Layout>} />
                          <Route path="/update-password" element={<Layout><UpdatePassword /></Layout>} />
                          
                          <Route path="/terms" element={<Layout><Terms /></Layout>} />
                          <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
                          <Route path="/cookies" element={<Layout><Cookies /></Layout>} />
                          <Route path="/returns" element={<Layout><Returns /></Layout>} />

                          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
                          <Route path="/order/:id" element={<Layout><UserOrderDetails /></Layout>} />

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

                          <Route path="*" element={<Layout><NotFound /></Layout>} />
                        </Routes>
                      </Suspense>
                    </AppInitializer>
                  </OrderProvider>
                </CartProvider>
              </ShopProvider>
            </AuthProvider>
          </CookieConsentProvider>
        </Router>
      </SystemHealth>
    </ErrorBoundary>
  );
};

export default App;
