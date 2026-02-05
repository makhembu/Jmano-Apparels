
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/db';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { Order, Product } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';

interface AdminStats {
  revenue: number;
  orders: number;
  users: number;
  products: number;
  low_stock: number;
  pending_orders: number;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Initial Load
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Parallel fetch for speed using optimized endpoints
      const [statsData, ordersResult, lowStockData] = await Promise.all([
        api.getAdminDashboardStats(),
        api.getOrdersPaginated(1, 5, 'ALL'), // Fetch latest 5 orders only
        api.getLowStockProducts(5) // Fetch top 5 low stock items
      ]);
      
      setStats(statsData);
      setRecentOrders(ordersResult.data);
      setLowStockProducts(lowStockData);
    } catch (error) {
      console.error("Failed to load admin dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) return <LoadingSpinner />;

  const StatCard = ({ title, value, subtext, icon, colorClass }: any) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-start justify-between">
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
           <Link to="/admin/orders/new">
             <Button variant="outline" size="sm">
               Create Order
             </Button>
           </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          id="card-kpi-revenue"
          title="Total Revenue" 
          value={`£${(stats?.revenue || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`} 
          subtext="Lifetime sales"
          colorClass="bg-green-100 text-green-700"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard 
          id="card-kpi-orders"
          title="Orders" 
          value={stats?.orders || 0} 
          subtext={`${stats?.pending_orders || 0} pending processing`}
          colorClass="bg-blue-100 text-blue-700"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
        />
        <StatCard 
          title="Customers" 
          value={stats?.users || 0} 
          subtext="Registered accounts"
          colorClass="bg-purple-100 text-purple-700"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
        />
        <StatCard 
          title="Products" 
          value={stats?.products || 0} 
          subtext={`${stats?.low_stock || 0} low stock alerts`}
          colorClass="bg-yellow-100 text-yellow-700"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
        />
      </div>
      
      {/* Middle Row: Recent Orders & Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
           <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Recent Orders</h3>
              <Link to="/admin/orders" className="text-xs text-brand-green font-bold hover:underline">View All</Link>
           </div>
           <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                 <thead className="bg-gray-50">
                    <tr>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                       <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-gray-100">
                    {recentOrders.length === 0 ? (
                       <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">No recent orders found.</td></tr>
                    ) : (
                       recentOrders.map(order => (
                          <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                             <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-brand-dark">
                                <Link to={`/admin/orders/${order.id}`}>#{order.orderNumber || order.id.slice(0,8)}</Link>
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                {formatDate(order.createdAt)}
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate max-w-[150px]">
                                {order.customerName || 'Guest'}
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-[10px] leading-5 font-bold rounded-full uppercase tracking-wider ${
                                   order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                   order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                   'bg-yellow-100 text-yellow-800'
                                }`}>
                                   {order.status}
                                </span>
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono">
                                {formatCurrency(order.total || 0)}
                             </td>
                          </tr>
                       ))
                    )}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
           <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-red-50/50">
              <h3 className="font-bold text-red-800">Low Stock Alert</h3>
              <Link to="/admin/products" className="text-xs text-red-600 font-bold hover:underline">Manage</Link>
           </div>
           <div className="divide-y divide-gray-100">
              {lowStockProducts.length === 0 ? (
                 <div className="p-8 text-center text-sm text-gray-500">
                    <span className="text-green-500 block text-xl mb-2">✓</span>
                    Inventory levels look healthy.
                 </div>
              ) : (
                 lowStockProducts.map(p => (
                    <div key={p.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                       <div className="h-10 w-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                          <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                          <p className="text-xs text-gray-500">Threshold: {p.lowStockThreshold}</p>
                       </div>
                       <div className="text-right">
                          <span className={`text-sm font-bold ${p.stockQuantity === 0 ? 'text-red-600' : 'text-orange-500'}`}>
                             {p.stockQuantity}
                          </span>
                          <p className="text-[9px] text-gray-400 uppercase">Left</p>
                       </div>
                    </div>
                 ))
              )}
           </div>
        </div>

      </div>

      {/* Quick Links / Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
               <Link to="/admin/orders" className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-brand-green/30 hover:bg-brand-light/10 transition-all text-center">
                  <span className="block font-bold text-brand-dark">Manage Orders</span>
                  <span className="text-xs text-gray-500">Process & Ship</span>
               </Link>
               <Link to="/admin/products" className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-brand-green/30 hover:bg-brand-light/10 transition-all text-center">
                  <span className="block font-bold text-brand-dark">Inventory</span>
                  <span className="text-xs text-gray-500">Update Stock</span>
               </Link>
               <Link to="/admin/users" className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-brand-green/30 hover:bg-brand-light/10 transition-all text-center">
                  <span className="block font-bold text-brand-dark">Customers</span>
                  <span className="text-xs text-gray-500">View Profiles</span>
               </Link>
               <Link to="/admin/analytics" className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-brand-green/30 hover:bg-brand-light/10 transition-all text-center">
                  <span className="block font-bold text-brand-dark">Analytics</span>
                  <span className="text-xs text-gray-500">View Insights</span>
               </Link>
            </div>
         </div>

         <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
            <h3 className="font-bold text-blue-900 mb-2">System Status</h3>
            <p className="text-sm text-blue-700 mb-4">
               Your shop is online and operational. {stats?.low_stock ? `${stats.low_stock} products require restocking.` : 'Inventory levels are healthy.'}
            </p>
            {stats?.pending_orders && stats.pending_orders > 0 ? (
               <div className="bg-white p-4 rounded border border-blue-200 flex items-center justify-between">
                  <span className="text-sm font-bold text-blue-800">{stats.pending_orders} New Orders</span>
                  <Link to="/admin/orders" className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">Process Now</Link>
               </div>
            ) : (
               <div className="text-sm text-blue-600 italic">All orders are up to date.</div>
            )}
         </div>
      </div>
    </div>
  );
};
