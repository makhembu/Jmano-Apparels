
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useShop } from '../../context/ShopContext';
import { api } from '../../lib/db';
import { User, Product } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';

export const AdminDashboard: React.FC = () => {
  const { orders, refreshOrders, loading: appLoading } = useApp();
  const { products, blogPosts, refreshData, loading: shopLoading } = useShop();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Fetch users for the customer count
    api.getAllUsers()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshOrders(),
        refreshData(),
        api.getAllUsers().then(setUsers)
      ]);
    } catch (e) {
      console.error("Refresh failed", e);
    } finally {
      setRefreshing(false);
    }
  };

  if (appLoading || shopLoading || loading) return <LoadingSpinner />;

  // --- Calculations ---

  // Revenue: Sum of all orders that are not cancelled or refunded
  const revenue = orders
    .filter(o => !['Cancelled', 'Refunded'].includes(o.status))
    .reduce((acc, curr) => acc + (curr.total || 0), 0);

  // Order Stats
  const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Processing');
  
  // Inventory Stats
  const lowStockProducts = products
    .filter(p => (p.stockQuantity || 0) <= (p.lowStockThreshold || 5))
    .sort((a, b) => (a.stockQuantity || 0) - (b.stockQuantity || 0));

  // Top Products (based on totalSales from DB)
  const topProducts = [...products]
    .sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0))
    .slice(0, 5);

  const StatCard = ({ id, title, value, subtext, icon, colorClass }: any) => (
    <div id={id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-full ${colorClass} bg-opacity-10 text-opacity-100`}>
        {icon}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Overview of your shop's performance</p>
        </div>
        <div className="flex gap-2 flex-wrap">
           <div id="btn-refresh-data">
             <Button onClick={handleRefresh} isLoading={refreshing} variant="outline" size="sm">
                Refresh Data
             </Button>
           </div>
           <Link to="/admin/products/new">
             <Button variant="primary" size="sm">
               + Add Product
             </Button>
           </Link>
           <Link to="/admin/blog/new">
             <Button variant="outline" size="sm">
               Write Post
             </Button>
           </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          id="card-kpi-revenue"
          title="Total Revenue" 
          value={`£${revenue.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`} 
          subtext="Lifetime sales"
          colorClass="bg-green-100 text-green-700"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard 
          id="card-kpi-orders"
          title="Orders" 
          value={orders.length} 
          subtext={`${pendingOrders.length} pending processing`}
          colorClass="bg-blue-100 text-blue-700"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
        />
        <StatCard 
          title="Customers" 
          value={users.length} 
          subtext="Registered accounts"
          colorClass="bg-purple-100 text-purple-700"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
        />
        <StatCard 
          title="Products" 
          value={products.length} 
          subtext={`${lowStockProducts.length} low stock alerts`}
          colorClass="bg-yellow-100 text-yellow-700"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Recent Orders */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
              <Link to="/admin/orders" className="text-sm text-brand-green hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No orders yet.</td></tr>
                  ) : orders.slice(0, 5).map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link to={`/admin/orders/${order.id}`} className="text-brand-dark hover:text-brand-green">
                          #{order.orderNumber || order.id?.slice(0, 8)}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                          order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        £{(order.total || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
             <div className="px-6 py-4 border-b border-gray-200">
               <h2 className="text-lg font-medium text-gray-900">Top Performing Products</h2>
             </div>
             <ul className="divide-y divide-gray-200">
               {topProducts.length === 0 ? (
                 <li className="px-6 py-4 text-sm text-gray-500 text-center">No sales data yet.</li>
               ) : topProducts.map(product => (
                 <li key={product.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center">
                       {/* FIX: The 'Product' type has an 'images' array. Use the first image. */}
                       <img src={product.images[0]} alt="" className="h-10 w-10 rounded object-cover border border-gray-200" />
                       <div className="ml-3">
                          <Link to={`/admin/products/${product.id}`} className="text-sm font-medium text-gray-900 hover:text-brand-green truncate block max-w-[200px]">{product.title}</Link>
                          <p className="text-xs text-gray-500">Stock: {product.stockQuantity}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-bold text-gray-900">{product.totalSales || 0} Sold</p>
                       <p className="text-xs text-brand-green">£{((product.price || 0) * (product.totalSales || 0)).toFixed(0)} Revenue</p>
                    </div>
                 </li>
               ))}
             </ul>
          </div>
        </div>

        {/* Right Column: Alerts & Actions */}
        <div className="space-y-8">
           
           {/* Low Stock Alert */}
           <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-red-50 rounded-t-lg">
                 <h2 className="text-sm font-bold text-red-800 uppercase tracking-wide flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Low Stock Alert
                 </h2>
                 <span className="bg-red-200 text-red-800 text-xs font-bold px-2 py-0.5 rounded-full">{lowStockProducts.length}</span>
              </div>
              <ul className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
                 {lowStockProducts.length === 0 ? (
                    <li className="px-6 py-4 text-sm text-gray-500 text-center">All inventory levels are healthy.</li>
                 ) : lowStockProducts.map(p => (
                    <li key={p.id} className="px-6 py-3 flex justify-between items-center hover:bg-gray-50">
                       <Link to={`/admin/products/${p.id}`} className="text-sm font-medium text-gray-700 hover:text-brand-green truncate max-w-[150px]" title={p.title}>{p.title}</Link>
                       <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">{p.stockQuantity} left</span>
                    </li>
                 ))}
              </ul>
              {lowStockProducts.length > 0 && (
                 <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
                    <Link to="/admin/products" className="text-xs font-medium text-gray-600 hover:text-gray-900">Manage Inventory &rarr;</Link>
                 </div>
              )}
           </div>

           {/* Pending Orders Action */}
           {pendingOrders.length > 0 && (
             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-yellow-800 font-bold text-lg mb-2">Needs Attention</h3>
                <p className="text-yellow-700 text-sm mb-4">You have {pendingOrders.length} orders waiting to be processed.</p>
                <Link to="/admin/orders" className="block w-full text-center bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 rounded transition shadow-sm">
                   Process Orders
                </Link>
             </div>
           )}

           {/* Quick Stats */}
           <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Content Overview</h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Blog Posts</span>
                    <span className="text-sm font-bold text-gray-900">{blogPosts.length}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Views</span>
                    <span className="text-sm font-bold text-gray-900">{blogPosts.reduce((acc, p) => acc + (p.viewCount || 0), 0)}</span>
                 </div>
                 <div className="pt-4 mt-2 border-t">
                    <Link to="/admin/blog" className="text-sm text-brand-green hover:underline">Manage Blog</Link>
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};
