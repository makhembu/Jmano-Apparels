
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../lib/db';
import { Order, User } from '../../types';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useApp } from '../../context/AppContext';
import { useShop } from '../../context/ShopContext';
import { useCopilot } from '../../contexts/CopilotContext';

export const AdminOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { refreshOrders, settings } = useApp();
  const { refreshData } = useShop();
  const { setPageData } = useCopilot();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Management States
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [tracking, setTracking] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      api.getOrderById(id).then(async (o) => {
        if (o) {
          setOrder(o);
          setStatus(o.status);
          setPaymentStatus(o.paymentStatus || 'pending');
          setTracking(o.trackingNumber || '');
          
          // Push context to Copilot
          setPageData(o as any);

          if (o.userId) {
            try {
              const u = await api.getUserProfile(o.userId);
              setCustomer(u);
            } catch (e) {
              console.error("Failed to load customer profile", e);
            }
          }
        }
      }).catch(err => {
        showToast("Error loading order", "error");
      }).finally(() => setLoading(false));
    }
    
    return () => setPageData(undefined);
  }, [id, showToast, setPageData]);

  const handleUpdate = async () => {
    if (!id) return;
    setIsUpdating(true);
    try {
      await api.adminUpdateOrder(id, { 
        status, 
        trackingNumber: tracking, 
        paymentStatus 
      });
      if (order) {
          const updated = { ...order, status, trackingNumber: tracking, paymentStatus };
          setOrder(updated);
          setPageData(updated as any);
      }
      await refreshOrders();
      await refreshData();
      showToast('Order records updated successfully', 'success');
    } catch (e) {
      showToast('Failed to update order records', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!order) return <div className="p-20 text-center"><p className="text-slate-500 mb-4">Order record not found.</p><Button onClick={() => navigate('/admin/orders')}>Back to Orders</Button></div>;

  const statusColors: Record<string, string> = {
    'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Processing': 'bg-blue-100 text-blue-800 border-blue-200',
    'Shipped': 'bg-purple-100 text-purple-800 border-purple-200',
    'Delivered': 'bg-green-100 text-green-800 border-green-200',
    'Cancelled': 'bg-red-100 text-red-800 border-red-200'
  };

  const displayName = customer?.name || order.customerName || 'Guest User';
  const displayEmail = customer?.email || order.customerEmail || 'No email provided';
  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in relative">
      <div id="invoice-container" className="hidden print:block bg-white text-slate-900 p-12 font-sans max-w-[210mm] mx-auto h-full relative">
        <div className="flex justify-between items-start mb-16">
          <div className="w-1/2">
             <img src={settings.logoImage || "https://i.imgur.com/pkaScEv.png"} alt="Jambo Apparels" className="h-20 w-auto object-contain mb-6" />
             <div className="text-sm text-gray-500 leading-relaxed font-medium pl-1">
                <p>{settings.contactAddress || '123 Scripture Lane, London, UK'}</p>
                <p>{settings.contactEmail || 'support@jamboapparels.com'}</p>
                <p>{settings.contactPhone}</p>
             </div>
          </div>
          <div className="w-1/2 text-right">
             <h1 className="text-4xl font-light text-gray-300 uppercase tracking-[0.2em] mb-4">Invoice</h1>
             <div className="space-y-1">
                <p className="text-sm font-bold text-gray-900"><span className="text-gray-400 font-normal mr-2">Order ID:</span>#{order.orderNumber}</p>
                <p className="text-sm font-bold text-gray-900"><span className="text-gray-400 font-normal mr-2">Date:</span>{invoiceDate}</p>
             </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4 no-print">
        <div>
          <button onClick={() => navigate('/admin/orders')} className="text-xs font-black text-brand-green uppercase tracking-widest flex items-center gap-1 mb-2 hover:underline">← Back to Registry</button>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-serif font-bold text-slate-900">Order #{order.orderNumber || order.id?.slice(0, 8)}</h1>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[order.status] || 'bg-slate-100 text-slate-800'}`}>
              {order.status}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button id="btn-print-invoice" variant="outline" onClick={() => window.print()} className="rounded-xl px-6 h-11 no-print bg-white border-slate-200 hover:border-brand-green text-slate-700 hover:text-brand-green">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Print Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start no-print">
        <div className="lg:col-span-2 space-y-8">
          <div id="section-order-items" className="bg-white shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 overflow-hidden">
             <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Itemized Receipt</h3>
             </div>
             <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/30">
                   <tr>
                      <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Piece</th>
                      <th className="px-4 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Specs</th>
                      <th className="px-4 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty</th>
                      <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {order.products.map((item, idx) => (
                     <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5 flex items-center gap-4">
                           <div className="h-16 w-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                              {item.image ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" /> : null}
                           </div>
                           <p className="text-sm font-bold text-slate-900 truncate">{item.title}</p>
                        </td>
                        <td className="px-4 py-5 text-center text-[10px] font-black uppercase text-slate-600">{item.size}</td>
                        <td className="px-4 py-5 text-center text-sm font-black text-slate-700">×{item.quantity}</td>
                        <td className="px-8 py-5 text-right text-sm font-black text-slate-900">£{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>

          <div id="section-customer-info" className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-white shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 p-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Customer Details</h3>
                <div className="flex items-center gap-4">
                   <div className="h-14 w-14 rounded-2xl bg-brand-light flex items-center justify-center text-brand-dark font-black text-xl border-2 border-white shadow-sm">{displayName.charAt(0).toUpperCase()}</div>
                   <div><p className="text-lg font-bold text-slate-900">{displayName}</p><p className="text-sm text-slate-500">{displayEmail}</p></div>
                </div>
             </div>
             <div className="bg-white shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 p-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Delivery Destination</h3>
                <address className="not-italic text-sm text-slate-600 leading-relaxed font-light">
                   {order.shippingAddress?.address1}<br/>
                   {order.shippingAddress?.city}, {order.shippingAddress?.postcode}<br/>
                   <span className="font-bold text-slate-900 uppercase text-[11px] tracking-widest">{order.shippingAddress?.country}</span>
                </address>
             </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-24">
           <div className="bg-white shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 p-8 space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-4">Logistics Management</h3>
              <div className="space-y-4">
                 <div>
                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2">Order Status</label>
                    <select id="input-order-status" value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-900 text-sm font-bold focus:ring-2 focus:ring-brand-green/10 outline-none">
                       <option value="Pending">Pending</option>
                       <option value="Processing">Processing</option>
                       <option value="Shipped">Shipped</option>
                       <option value="Delivered">Delivered</option>
                       <option value="Cancelled">Cancelled</option>
                    </select>
                 </div>
                 <div id="btn-save-changes">
                    <Button variant="primary" fullWidth onClick={handleUpdate} isLoading={isUpdating} className="h-12 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-brand-green/20">Apply Changes</Button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
