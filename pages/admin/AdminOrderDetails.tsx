import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../lib/db';
import { Order, User } from '../../types';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useApp } from '../../context/AppContext';
import { useShop } from '../../context/ShopContext';

export const AdminOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { refreshOrders } = useApp();
  const { refreshData } = useShop();
  
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
  }, [id, showToast]);

  const handleUpdate = async () => {
    if (!id) return;
    setIsUpdating(true);
    try {
      await api.adminUpdateOrder(id, { 
        status, 
        trackingNumber: tracking, 
        paymentStatus 
      });
      
      // Update local state to reflect changes if needed
      if (order) {
          setOrder({ ...order, status, trackingNumber: tracking, paymentStatus });
      }
      
      // SYNC: Trigger global refreshes so Dashboard/Overview reflects current data
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
  if (!order) return (
    <div className="p-20 text-center">
      <p className="text-slate-500 mb-4">Order record not found.</p>
      <Button onClick={() => navigate('/admin/orders')}>Back to Orders</Button>
    </div>
  );

  const statusColors: Record<string, string> = {
    'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Processing': 'bg-blue-100 text-blue-800 border-blue-200',
    'Shipped': 'bg-purple-100 text-purple-800 border-purple-200',
    'Delivered': 'bg-green-100 text-green-800 border-green-200',
    'Cancelled': 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Print-Only Header */}
      <div className="print-header hidden">
         <div className="flex justify-between items-end mb-8">
            <div>
               <h1 className="text-4xl font-serif font-black text-slate-900">JAMBO APPARELS</h1>
               <p className="text-sm text-slate-500 italic">Divinely threaded scriptures.</p>
            </div>
            <div className="text-right">
               <h2 className="text-2xl font-bold text-slate-900">OFFICIAL INVOICE</h2>
               <p className="text-sm text-slate-500 uppercase tracking-widest">Order Registry #{order.orderNumber}</p>
            </div>
         </div>
      </div>

      {/* Header with Navigation - Screen Only */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4 no-print">
        <div className="back-button-container">
          <button 
            onClick={() => navigate('/admin/orders')}
            className="text-xs font-black text-brand-green uppercase tracking-widest flex items-center gap-1 mb-2 hover:underline"
          >
            ← Back to Order Registry
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-serif font-bold text-slate-900">Order #{order.orderNumber || order.id?.slice(0, 8)}</h1>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[order.status] || 'bg-slate-100 text-slate-800'}`}>
              {order.status}
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">Logged on {new Date(order.createdAt).toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' })}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => window.print()} className="rounded-xl px-6 h-11 no-print">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Main Details Area */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Itemized Receipt */}
          <div className="bg-white shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 overflow-hidden itemized-receipt-container">
             <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Itemized Receipt</h3>
             </div>
             <div className="p-0">
                <table className="min-w-full divide-y divide-slate-100">
                   <thead className="bg-slate-50/30">
                      <tr>
                         <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Piece</th>
                         <th className="px-4 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Specifications</th>
                         <th className="px-4 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty</th>
                         <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {order.products.map((item, idx) => (
                        <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                           <td className="px-8 py-5">
                              <div className="flex items-center gap-4">
                                 <div className="h-16 w-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 no-print">
                                    {item.image ? (
                                       <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                       <div className="w-full h-full flex items-center justify-center text-slate-300">
                                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                       </div>
                                    )}
                                 </div>
                                 <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-900 group-hover:text-brand-green transition-colors truncate">{item.title}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">ID: {item.productId?.slice(0, 8) || 'N/A'}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-4 py-5 text-center">
                              <div className="flex flex-col items-center gap-1">
                                 <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">{item.size}</span>
                                 {item.selectedColor && (
                                    <span className="text-[10px] text-slate-400 font-bold uppercase">{item.selectedColor}</span>
                                 )}
                              </div>
                           </td>
                           <td className="px-4 py-5 text-center">
                              <span className="text-sm font-black text-slate-700">×{item.quantity}</span>
                           </td>
                           <td className="px-8 py-5 text-right">
                              <p className="text-sm font-black text-slate-900">£{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                              <p className="text-[10px] text-slate-400 font-medium mt-0.5 no-print">£{(item.price || 0).toFixed(2)} ea</p>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
                
                {/* Financial Breakdown Table */}
                <div className="bg-slate-50/50 p-8 border-t border-slate-100">
                   <div className="max-w-xs ml-auto space-y-4">
                      <div className="flex justify-between items-center text-sm">
                         <span className="text-slate-500 font-medium">Subtotal</span>
                         <span className="text-slate-900 font-bold">£{(order.subtotal || (order.total - (order.shippingCost || 0))).toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                         <span className="text-slate-500 font-medium">Shipping</span>
                         <span className="text-slate-900 font-bold">{order.shippingCost === 0 ? 'FREE' : `£${(order.shippingCost || 0).toFixed(2)}`}</span>
                      </div>

                      {order.discountAmount && order.discountAmount > 0 && (
                         <div className="flex justify-between items-center text-sm text-green-600">
                            <span className="font-bold flex items-center gap-1.5">
                               Blessing Applied
                               {order.discountCode && <span className="bg-green-100 px-1.5 py-0.5 rounded text-[9px] uppercase">{order.discountCode}</span>}
                            </span>
                            <span className="font-black">-£{order.discountAmount.toFixed(2)}</span>
                         </div>
                      )}

                      <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
                         <div className="space-y-1">
                            <span className="text-lg font-serif font-bold text-slate-900 leading-none">Order Total</span>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                               Includes £{(order.taxAmount || 0).toFixed(2)} VAT
                            </p>
                         </div>
                         <span className="text-3xl font-serif font-black text-brand-green leading-none">£{(order.total || 0).toFixed(2)}</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Customer & Shipping Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Customer Card */}
             <div className="bg-white shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 p-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                   <svg className="w-4 h-4 text-brand-green no-print" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                   Customer Ambassador
                </h3>
                {customer ? (
                  <div className="flex items-center gap-4">
                     <div className="h-14 w-14 rounded-2xl bg-brand-light flex items-center justify-center text-brand-dark font-black text-xl border-2 border-white shadow-sm no-print">
                        {customer.name.charAt(0).toUpperCase()}
                     </div>
                     <div>
                        <Link to={`/admin/users?id=${customer.id}`} className="text-lg font-bold text-slate-900 hover:text-brand-green transition-colors no-print">{customer.name}</Link>
                        <p className="hidden print:block text-lg font-bold text-slate-900">{customer.name}</p>
                        <p className="text-sm text-slate-500">{customer.email}</p>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1 no-print">Loyalty Tier: Standard User</p>
                     </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 animate-pulse no-print">
                     <div className="h-14 w-14 rounded-2xl bg-slate-100"></div>
                     <div className="space-y-2">
                        <div className="h-4 w-32 bg-slate-100 rounded"></div>
                        <div className="h-3 w-48 bg-slate-100 rounded"></div>
                     </div>
                  </div>
                )}
             </div>

             {/* Shipping Address Card */}
             <div className="bg-white shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 p-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                   <svg className="w-4 h-4 text-brand-green no-print" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                   Delivery Destination
                </h3>
                {order.shippingAddress ? (
                   <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-900">{customer?.name || 'Recipient'}</p>
                      <address className="not-italic text-sm text-slate-600 leading-relaxed font-light">
                         {order.shippingAddress.address1}<br/>
                         {order.shippingAddress.address2 && <>{order.shippingAddress.address2}<br/></>}
                         {order.shippingAddress.city}, {order.shippingAddress.postcode}<br/>
                         <span className="font-bold text-slate-900 uppercase text-[11px] tracking-widest">{order.shippingAddress.country}</span>
                         {order.shippingAddress.phone && (
                            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-slate-500 font-bold text-[11px]">
                               <svg className="w-3.5 h-3.5 no-print" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                               Phone: {order.shippingAddress.phone}
                            </div>
                         )}
                      </address>
                   </div>
                ) : (
                   <p className="text-slate-400 italic text-sm font-light">Missing address data for this record.</p>
                )}
             </div>

             {/* Order Notes (Full Width) */}
             <div className="md:col-span-2 bg-brand-light/30 rounded-3xl p-8 border border-brand-green/10">
                <h3 className="text-[10px] font-black text-brand-green uppercase tracking-[0.2em] mb-4">Internal & Customer Instructions</h3>
                {order.notes ? (
                   <p className="text-slate-700 italic font-light leading-relaxed">"{order.notes}"</p>
                ) : (
                   <p className="text-slate-400 text-xs uppercase tracking-widest font-bold opacity-50">No special instructions journalled.</p>
                )}
             </div>
          </div>
        </div>

        {/* Management Sidebar */}
        <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-24 logistics-control-panel">
           {/* Logistics Control */}
           <div className="bg-white shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 p-8 space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-4">Logistics Management</h3>
              
              <div className="space-y-4">
                 <div>
                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2">Order Status</label>
                    <select 
                       value={status} 
                       onChange={(e) => setStatus(e.target.value)} 
                       className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-900 text-sm font-bold focus:ring-2 focus:ring-brand-green/10 outline-none transition-all"
                    >
                       <option value="Pending">Pending</option>
                       <option value="Processing">Processing</option>
                       <option value="Shipped">Shipped</option>
                       <option value="Delivered">Delivered</option>
                       <option value="Cancelled">Cancelled</option>
                    </select>
                 </div>

                 <div>
                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2">Payment Outcome</label>
                    <select 
                       value={paymentStatus} 
                       onChange={(e) => setPaymentStatus(e.target.value)} 
                       className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-900 text-sm font-bold focus:ring-2 focus:ring-brand-green/10 outline-none transition-all"
                    >
                       <option value="pending">Pending</option>
                       <option value="paid">Paid (Confirmed)</option>
                       <option value="failed">Failed</option>
                       <option value="refunded">Refunded</option>
                    </select>
                 </div>

                 <div>
                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2">Tracking Registry</label>
                    <input 
                       type="text" 
                       value={tracking} 
                       onChange={(e) => setTracking(e.target.value)} 
                       placeholder="e.g. GB123456789"
                       className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-900 text-sm font-mono focus:ring-2 focus:ring-brand-green/10 outline-none transition-all" 
                    />
                 </div>

                 <Button 
                    variant="primary" 
                    fullWidth 
                    onClick={handleUpdate} 
                    isLoading={isUpdating}
                    className="h-12 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-brand-green/20"
                 >
                    Apply Changes
                 </Button>
              </div>
           </div>

           {/* Event Log */}
           <div className="bg-slate-900 rounded-3xl p-8 text-white event-log-sidebar no-print">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Internal Registry</h3>
              <div className="space-y-5">
                 <div className="flex gap-4">
                    <div className="h-2 w-2 rounded-full bg-brand-green mt-1"></div>
                    <div>
                       <p className="text-xs font-bold">Registry Created</p>
                       <p className="text-[10px] text-slate-400 uppercase tracking-tighter">{new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                 </div>
                 {order.shippedAt && (
                    <div className="flex gap-4">
                       <div className="h-2 w-2 rounded-full bg-purple-500 mt-1"></div>
                       <div>
                          <p className="text-xs font-bold">Transit Initiated</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-tighter">{new Date(order.shippedAt).toLocaleDateString()}</p>
                       </div>
                    </div>
                 )}
                 {order.deliveredAt && (
                    <div className="flex gap-4">
                       <div className="h-2 w-2 rounded-full bg-green-500 mt-1"></div>
                       <div>
                          <p className="text-xs font-bold">Delivery Confirmed</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-tighter">{new Date(order.deliveredAt).toLocaleDateString()}</p>
                       </div>
                    </div>
                 )}
                 {order.cancelledAt && (
                    <div className="flex gap-4">
                       <div className="h-2 w-2 rounded-full bg-red-500 mt-1"></div>
                       <div>
                          <p className="text-xs font-bold">Registry Revoked</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-tighter">{new Date(order.cancelledAt).toLocaleDateString()}</p>
                       </div>
                    </div>
                 )}
              </div>
              <p className="mt-10 text-[9px] text-slate-500 font-bold uppercase tracking-widest text-center border-t border-slate-800 pt-6">
                 Transaction via Stripe Secure Gate
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};