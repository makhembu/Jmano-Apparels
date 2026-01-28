
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
  const { refreshOrders, settings } = useApp();
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

  // Determine display name and email (prefer registered user, fallback to guest fields)
  const displayName = customer?.name || order.customerName || 'Guest User';
  const displayEmail = customer?.email || order.customerEmail || 'No email provided';
  const isGuest = !customer && !order.userId;

  // Invoice Date Formatting
  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in relative">
      
      {/* --- INVOICE PRINT VIEW (Hidden on Screen) --- */}
      <div id="invoice-container" className="hidden print:block bg-white text-slate-900 p-12 font-sans max-w-[210mm] mx-auto h-full relative">
        
        {/* Top Section: Logo & Invoice Metadata */}
        <div className="flex justify-between items-start mb-16">
          {/* Brand Left */}
          <div className="w-1/2">
             <img 
                src={settings.logoImage || "https://i.imgur.com/pkaScEv.png"} 
                alt="Jambo Apparels" 
                className="h-20 w-auto object-contain mb-6" 
             />
             <div className="text-sm text-gray-500 leading-relaxed font-medium pl-1">
                <p>{settings.contactAddress || '123 Scripture Lane, London, UK'}</p>
                <p>{settings.contactEmail || 'support@jamboapparels.com'}</p>
                <p>{settings.contactPhone}</p>
             </div>
          </div>
          
          {/* Invoice Details Right */}
          <div className="w-1/2 text-right">
             <h1 className="text-4xl font-light text-gray-300 uppercase tracking-[0.2em] mb-4">Invoice</h1>
             
             <div className="space-y-1">
                <p className="text-sm font-bold text-gray-900">
                   <span className="text-gray-400 font-normal mr-2">Order ID:</span>
                   #{order.orderNumber}
                </p>
                <p className="text-sm font-bold text-gray-900">
                   <span className="text-gray-400 font-normal mr-2">Date:</span>
                   {invoiceDate}
                </p>
             </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full border-t-2 border-brand-green mb-10 opacity-20"></div>

        {/* Customer & Shipping Details */}
        <div className="flex gap-12 mb-16">
           <div className="w-1/2">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Billed To</h3>
              <div className="text-sm text-gray-800 leading-relaxed">
                 <p className="font-bold text-base text-gray-900 mb-1">{displayName}</p>
                 <p>{displayEmail}</p>
                 {order.userId ? (
                    <p className="text-xs text-gray-500 mt-1">Customer ID: {order.userId.slice(0,8).toUpperCase()}</p>
                 ) : (
                    <p className="text-xs text-gray-500 mt-1">Guest Checkout</p>
                 )}
                 <p className="mt-2 text-gray-900 font-bold text-xs uppercase">
                    Payment: {order.paymentIntentId ? 'PayPal' : 'Manual / Card'}
                 </p>
              </div>
           </div>
           <div className="w-1/2">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Shipped To</h3>
              {order.shippingAddress ? (
                 <div className="text-sm text-gray-800 leading-relaxed">
                    <p className="font-bold text-base text-gray-900 mb-1">{displayName}</p>
                    <p>{order.shippingAddress.address1}</p>
                    {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                    <p>{order.shippingAddress.city}, {order.shippingAddress.postcode}</p>
                    <p className="font-bold text-gray-700">{order.shippingAddress.country}</p>
                    {order.shippingAddress.phone && <p className="mt-1 text-gray-500">Tel: {order.shippingAddress.phone}</p>}
                 </div>
              ) : (
                 <p className="text-sm text-gray-400 italic">No shipping address provided.</p>
              )}
           </div>
        </div>

        {/* Line Items */}
        <div className="mb-10">
           <table className="w-full text-sm">
              <thead>
                 <tr className="border-b-2 border-gray-900">
                    <th className="text-left py-3 font-black text-gray-900 uppercase text-[10px] tracking-widest">Description</th>
                    <th className="text-center py-3 font-black text-gray-900 uppercase text-[10px] tracking-widest w-32">Size / Color</th>
                    <th className="text-center py-3 font-black text-gray-900 uppercase text-[10px] tracking-widest w-16">Qty</th>
                    <th className="text-right py-3 font-black text-gray-900 uppercase text-[10px] tracking-widest w-24">Unit Price</th>
                    <th className="text-right py-3 font-black text-gray-900 uppercase text-[10px] tracking-widest w-24">Amount</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {order.products.map((item, i) => (
                    <tr key={i}>
                       <td className="py-4 align-top">
                          <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                          <p className="text-[10px] text-gray-500 font-mono mt-1">SKU: {item.productId?.slice(0,8).toUpperCase()}</p>
                       </td>
                       <td className="py-4 text-center text-gray-600 font-medium align-top">
                          {item.size}
                          {item.selectedColor && <span className="block text-[10px] text-gray-400">{item.selectedColor}</span>}
                       </td>
                       <td className="py-4 text-center font-bold text-gray-900 align-top">{item.quantity}</td>
                       <td className="py-4 text-right text-gray-600 align-top">£{item.price.toFixed(2)}</td>
                       <td className="py-4 text-right font-bold text-gray-900 align-top">£{(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mb-20">
           <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                 <span className="font-medium">Subtotal</span>
                 <span>£{(order.subtotal || (order.total - (order.shippingCost || 0))).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                 <span className="font-medium">Shipping</span>
                 <span>{order.shippingCost === 0 ? 'Free' : `£${(order.shippingCost || 0).toFixed(2)}`}</span>
              </div>
              {order.discountAmount && order.discountAmount > 0 && (
                 <div className="flex justify-between text-sm text-brand-green font-bold">
                    <span>Discount {order.discountCode ? `(${order.discountCode})` : ''}</span>
                    <span>-£{order.discountAmount.toFixed(2)}</span>
                 </div>
              )}
              <div className="flex justify-between text-[10px] text-gray-400 pb-3 border-b border-gray-200">
                 <span>VAT (Included)</span>
                 <span>£{(order.taxAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-2xl font-black text-brand-dark pt-2">
                 <span>Total</span>
                 <span>£{order.total.toFixed(2)}</span>
              </div>
           </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-12 left-12 right-12 text-center">
           <div className="border-t border-gray-200 pt-6">
              <p className="text-brand-green font-bold text-sm mb-2">Thank you for your business!</p>
              <p className="font-serif italic text-gray-500 text-sm">"Let all that you do be done in love." - 1 Corinthians 16:14</p>
              <div className="mt-4 flex justify-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                 <span>jamboapparels.com</span>
                 <span>•</span>
                 <span>{settings.contactEmail}</span>
              </div>
           </div>
        </div>
      </div>
      {/* --- END INVOICE PRINT VIEW --- */}


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
          <Button variant="outline" onClick={() => window.print()} className="rounded-xl px-6 h-11 no-print bg-white border-slate-200 hover:border-brand-green text-slate-700 hover:text-brand-green">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start no-print">
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
                   Customer Details
                </h3>
                
                <div className="flex items-center gap-4">
                   <div className="h-14 w-14 rounded-2xl bg-brand-light flex items-center justify-center text-brand-dark font-black text-xl border-2 border-white shadow-sm no-print">
                      {displayName.charAt(0).toUpperCase()}
                   </div>
                   <div>
                      {customer ? (
                        <Link to={`/admin/users?id=${customer.id}`} className="text-lg font-bold text-slate-900 hover:text-brand-green transition-colors no-print">{displayName}</Link>
                      ) : (
                        <p className="text-lg font-bold text-slate-900">{displayName}</p>
                      )}
                      
                      <p className="hidden print:block text-lg font-bold text-slate-900">{displayName}</p>
                      <p className="text-sm text-slate-500">{displayEmail}</p>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1 no-print">
                         Tier: {isGuest ? 'Guest Checkout' : 'Registered Member'}
                      </p>
                   </div>
                </div>
             </div>

             {/* Shipping Address Card */}
             <div className="bg-white shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 p-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                   <svg className="w-4 h-4 text-brand-green no-print" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                   Delivery Destination
                </h3>
                {order.shippingAddress ? (
                   <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-900">{displayName || 'Recipient'}</p>
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
                 Transaction via {order.paymentIntentId ? 'PayPal' : 'Jambo Secure Gate'}
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};
