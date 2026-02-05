
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/db';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { Order, Product, DailyAnalytics } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

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
  const [dailyData, setDailyData] = useState<DailyAnalytics[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Initial Load
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Parallel fetch for speed using optimized endpoints
      const [statsData, ordersResult, lowStockData, analyticsData, productPerf] = await Promise.all([
        api.getAdminDashboardStats(),
        api.getOrdersPaginated(1, 5, 'ALL'), // Fetch latest 5 orders only
        api.getLowStockProducts(5), // Fetch top 5 low stock items
        api.getDailyAnalytics(7), // Last 7 days for the graph
        api.getTopSellingProducts(5) // Fetch top 5 best sellers directly from inventory DB
      ]);
      
      setStats(statsData);
      setRecentOrders(ordersResult.data);
      setLowStockProducts(lowStockData);
      setDailyData(analyticsData);
      setTopProducts(productPerf);
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

      {/* Analytics Row: Graph & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
           <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
              Revenue Trend (Last 7 Days)
           </h3>
           <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2E7D32" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, {weekday: 'short'})}
                    tick={{fontSize: 10, fill: '#94a3b8'}}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} prefix="£" />
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    labelStyle={{fontSize: '12px', fontWeight: 'bold', color: '#334155'}}
                    formatter={(value: any) => [`£${value}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#2E7D32" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Top Performing Products */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
           <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">
                 Top Performers
              </h3>
              <Link to="/admin/analytics" className="text-xs text-brand-green font-bold hover:underline">View Insights</Link>
           </div>
           <div className="space-y-1">
              {topProducts.length === 0 ? (
                 <p className="text-sm text-gray-500 italic text-center py-4">No sales data yet.</p>
              ) : (
                 topProducts.slice(0, 5).map((p, i) => (
                    <Link 
                      key={i} 
                      to={`/admin/products/${p.id}`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors -mx-2 group"
                    >
                       <div className="flex items-center gap-3 overflow-hidden">
                          <span className={`text-xs font-bold w-4 ${i === 0 ? 'text-yellow-500' : 'text-gray-400'}`}>{i + 1}</span>
                          <span className="text-sm font-medium text-gray-700 truncate group-hover:text-brand-green transition-colors" title={p.title}>{p.title}</span>
                       </div>
                       <div className="text-right flex-shrink-0">
                          <span className="block text-xs font-bold text-gray-900">{p.totalSales} Sold</span>
                       </div>
                    </Link>
                 ))
              )}
           </div>
        </div>
      </div>
      
      {/* Bottom Row: Recent Orders & Inventory Alerts */}
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
    </div>
  );
};
