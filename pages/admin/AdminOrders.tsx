
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/db';
import { Order } from '../../types';
import { formatDate, formatCurrency } from '../../lib/utils';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchOrders(page, filter);
  }, [page, filter]);

  const fetchOrders = async (pageNum: number, status: string) => {
    setLoading(true);
    try {
        const result = await api.getOrdersPaginated(pageNum, 15, status);
        setOrders(result.data);
        setTotalPages(result.totalPages);
    } catch (e) {
        console.error("Failed to load orders");
    } finally {
        setLoading(false);
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'Shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-8 pb-24 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-slate-900">Orders Registry</h1>
          <p className="text-base text-slate-500 mt-1">Manage and fulfill customer orders.</p>
        </div>
        <Link to="/admin/orders/new">
            <Button variant="primary" size="lg" className="shadow-lg shadow-brand-green/20">+ Create New Order</Button>
        </Link>
      </div>

      {/* Large Filter Tabs */}
      <div className="flex flex-wrap gap-3 pb-2">
         {['ALL', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
             <button
                key={status}
                onClick={() => { setFilter(status); setPage(1); }}
                className={`px-6 py-3 text-sm font-bold rounded-xl transition-all shadow-sm border ${
                  filter === status 
                    ? 'bg-brand-dark text-white border-brand-dark transform scale-105' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
             >
                {status}
             </button>
         ))}
      </div>
      
      {loading ? (
        <div className="py-20"><LoadingSpinner /></div> 
      ) : (
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-500 uppercase tracking-wider">Order Details</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {orders.length === 0 ? (
                     <tr><td colSpan={5} className="px-6 py-12 text-center text-lg text-slate-500">No orders found matching this filter.</td></tr>
                  ) : (
                     orders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                           <td className="px-6 py-6 whitespace-nowrap">
                              <div className="flex flex-col">
                                 <Link to={`/admin/orders/${order.id}`} className="text-lg font-bold text-brand-dark hover:underline">
                                    #{order.orderNumber || order.id.slice(0,8)}
                                 </Link>
                                 <span className="text-sm text-slate-500 mt-1">
                                    {formatDate(order.createdAt)}
                                 </span>
                              </div>
                           </td>
                           <td className="px-6 py-6 whitespace-nowrap">
                              <div className="flex flex-col">
                                 <span className="text-base font-bold text-slate-900">{order.customerName || 'Guest'}</span>
                                 <span className="text-sm text-slate-500">{order.customerEmail || 'No email'}</span>
                              </div>
                           </td>
                           <td className="px-6 py-6 whitespace-nowrap text-center">
                              <span className={`px-4 py-2 inline-flex text-xs leading-5 font-bold rounded-full uppercase tracking-wider border ${getStatusStyles(order.status)}`}>
                                 {order.status}
                              </span>
                           </td>
                           <td className="px-6 py-6 whitespace-nowrap text-right">
                              <span className="text-lg font-bold text-slate-900">{formatCurrency(order.total || 0)}</span>
                              <div className="text-xs mt-1">
                                {order.paymentStatus === 'paid' ? (
                                    <span className="text-green-600 font-bold">PAID</span>
                                ) : (
                                    <span className="text-red-500 font-bold">UNPAID</span>
                                )}
                              </div>
                           </td>
                           <td className="px-6 py-6 whitespace-nowrap text-right">
                              <Link to={`/admin/orders/${order.id}`}>
                                <button className="bg-white border-2 border-slate-200 text-slate-700 hover:border-brand-green hover:text-brand-green font-bold py-2 px-6 rounded-xl transition-colors">
                                    Open
                                </button>
                              </Link>
                           </td>
                        </tr>
                     ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="bg-slate-50 border-t border-slate-200 p-4">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} isLoading={loading} />
            </div>
        </div>
      )}
    </div>
  );
};
