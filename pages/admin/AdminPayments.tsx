
import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/db';
import { Order } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';

export const AdminPayments: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED'>('ALL');
  const [filterMethod, setFilterMethod] = useState<'ALL' | 'PAYPAL' | 'MANUAL'>('ALL');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
      totalRevenue: 0,
      pendingRevenue: 0,
      failedCount: 0,
      paidCount: 0,
      aov: 0
  });

  const fetchData = async () => {
    setLoading(true);
    try {
        const result = await api.getAdminPaymentsPaginated(page, 20, filterStatus, filterMethod);
        setOrders(result.data);
        setTotalPages(result.totalPages);
        
        // Calculate Derived AOV
        const rawStats = result.stats || {};
        const aov = rawStats.paidCount > 0 ? (rawStats.totalRevenue / rawStats.paidCount) : 0;
        
        setStats({
            totalRevenue: rawStats.totalRevenue || 0,
            pendingRevenue: rawStats.pendingRevenue || 0,
            failedCount: rawStats.failedCount || 0,
            paidCount: rawStats.paidCount || 0,
            aov
        });

    } catch (e) {
        console.error("Payment data fetch failed", e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, filterStatus, filterMethod]);

  const handleFilterChange = (status: any) => {
      setFilterStatus(status);
      setPage(1); // Reset to page 1 on filter change
  };

  const handleMethodChange = (method: any) => {
      setFilterMethod(method);
      setPage(1);
  };

  const getStatusBadge = (status: string) => {
    const s = (status || 'pending').toLowerCase();
    switch (s) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'refunded': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900">Payments & Finance</h1>
          <p className="text-sm text-slate-500">Track revenue, reconcile transactions, and monitor payment health.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" onClick={() => window.print()} className="text-xs">
              Print Report
           </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Revenue (Paid)</p>
           <p className="text-3xl font-serif font-bold text-brand-dark">£{stats.totalRevenue.toLocaleString('en-GB', {minimumFractionDigits: 2})}</p>
           <p className="text-xs text-green-600 font-medium mt-1">{stats.paidCount} successful transactions</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pending Revenue</p>
           <p className="text-3xl font-serif font-bold text-yellow-600">£{stats.pendingRevenue.toLocaleString('en-GB', {minimumFractionDigits: 2})}</p>
           <p className="text-xs text-yellow-600 font-medium mt-1">Awaiting completion</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Average Order Value</p>
           <p className="text-3xl font-serif font-bold text-slate-900">£{stats.aov.toLocaleString('en-GB', {minimumFractionDigits: 2})}</p>
           <p className="text-xs text-slate-400 font-medium mt-1">Per paid order</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Failed/Issues</p>
           <p className="text-3xl font-serif font-bold text-red-600">{stats.failedCount}</p>
           <p className="text-xs text-red-600 font-medium mt-1">Requires attention</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
           <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider self-center mr-2">Status:</span>
              {['ALL', 'PAID', 'PENDING', 'REFUNDED'].map(status => (
                 <button
                    key={status}
                    onClick={() => handleFilterChange(status)}
                    className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all whitespace-nowrap ${filterStatus === status ? 'bg-brand-dark text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'}`}
                 >
                    {status}
                 </button>
              ))}
           </div>
           
           <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gateway:</span>
              <select 
                value={filterMethod} 
                onChange={(e) => handleMethodChange(e.target.value)}
                className="bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-lg focus:ring-brand-green focus:border-brand-green block p-1.5 outline-none"
              >
                 <option value="ALL">All Gateways</option>
                 <option value="PAYPAL">PayPal</option>
                 <option value="MANUAL">Manual / Other</option>
              </select>
           </div>
        </div>

        {/* Table */}
        {loading ? <div className="p-10"><LoadingSpinner /></div> : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Date & Order</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Gateway Details</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {orders.length === 0 ? (
                 <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                       No payments found matching your filters.
                    </td>
                 </tr>
              ) : (
                 orders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                       <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                             <span className="text-xs font-bold text-slate-900">{new Date(order.createdAt).toLocaleDateString()}</span>
                             <span className="text-[10px] text-slate-400 font-mono mt-0.5">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                             <Link to={`/admin/orders/${order.id}`} className="text-xs font-bold text-brand-green hover:underline mt-1">
                                #{order.orderNumber || order.id.slice(0,8)}
                             </Link>
                          </div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                             <span className="text-sm font-medium text-slate-900">{order.customerName || 'Guest'}</span>
                             <span className="text-xs text-slate-500">{order.customerEmail}</span>
                          </div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                          {order.paymentIntentId ? (
                             <div className="flex flex-col">
                                <div className="flex items-center gap-1.5 mb-1">
                                   <span className="w-2 h-2 rounded-full bg-[#003087]"></span>
                                   <span className="text-xs font-bold text-slate-700">PayPal</span>
                                </div>
                                <code className="text-[10px] bg-slate-100 px-2 py-1 rounded border border-slate-200 text-slate-600 font-mono select-all">
                                   {order.paymentIntentId}
                                </code>
                             </div>
                          ) : (
                             <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                <span className="text-xs font-medium text-slate-500">Manual / Other</span>
                             </div>
                          )}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm font-bold text-slate-900">£{(order.total || 0).toFixed(2)}</span>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusBadge(order.paymentStatus || 'pending')}`}>
                             {order.paymentStatus || 'PENDING'}
                          </span>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <Link to={`/admin/orders/${order.id}`} className="text-brand-green font-bold text-xs hover:text-brand-dark bg-brand-light/30 px-3 py-1.5 rounded-lg hover:bg-brand-light/50 transition-colors">
                             Details
                          </Link>
                       </td>
                    </tr>
                 ))
              )}
            </tbody>
          </table>
        </div>
        )}
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} isLoading={loading} />
      </div>
    </div>
  );
};
