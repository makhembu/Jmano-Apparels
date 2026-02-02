
import React, { useEffect, useState } from 'react';
// @ts-ignore
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
  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in relative">
      
      {/* --- INVOICE PRINT VIEW (Hidden on Screen) --- */}
      <div id="invoice-container" className="hidden print:block bg-white text-slate-900 font-sans max-w-[210mm] mx-auto h-full relative">
        {/* Header */}
        <div className="flex justify-between items-start mb-12 border-b-2 border-slate-900 pb-8">
          <div className="w-1/2">
             <img src={settings.logoImage || "https://i.imgur.com/pkaScEv.png"} alt="Jambo Apparels" className="h-16 w-auto object-contain mb-4" />
             <div className="text-sm text-gray-600 leading-relaxed font-medium">
                <p className="font-bold text-slate-900">Jambo Apparels</p>
                <p>{settings.contactAddress || '123 Scripture Lane, London, UK'}</p>
                <p>{settings.contactEmail || 'support@jamboapparels.com'}</p>
                <p>{settings.contactPhone}</p>
             </div>
          </div>
          <div className="w-1/2 text-right">
             <h1 className="text-4xl font-black text-slate-900 uppercase tracking-widest mb-4">Invoice</h1>
             <div className="space-y-1">
                <p className="text-base font-bold text-slate-900"><span className="text-slate-500 font-normal mr-2">Order ID:</span>#{order.orderNumber || order.id.slice(0,8)}</p>
                <p className="text-base font-bold text-slate-900"><span className="text-slate-500 font-normal mr-2">Date:</span>{invoiceDate}</p>
                <p className="text-base font-bold text-slate-900"><span className="text-slate-500 font-normal mr-2">Status:</span>{order.status}</p>
             </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-2 gap-8 mb-12">
            <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-1">Bill To</h3>
                <p className="text-sm font-bold text-slate-900">{displayName}</p>
                <p className="text-sm text-slate-600">{displayEmail}</p>
            </div>
            <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-1">Ship To</h3>
                {order.shippingAddress ? (
                   <address className="not-italic text-sm text-slate-600 leading-relaxed">
                      <p className="font-bold text-slate-900">{displayName}</p>
                      {order.shippingAddress.address1}<br/>
                      {order.shippingAddress.address2 && <>{order.shippingAddress.address2}<br/></>}
                      {order.shippingAddress.city}, {order.shippingAddress.postcode}<br/>
                      {order.shippingAddress.country}
                   </address>
                ) : (
                   <p className="text-sm text-slate-400 italic">No shipping address provided.</p>
                )}
            </div>
        </div>

        {/* Items */}
        <div className="mb-12">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b-2 border-slate-900">
                        <th className="text-left py-3 font-black text-slate-900 uppercase tracking-wider">Item</th>
                        <th className="text-center py-3 font-black text-slate-900 uppercase tracking-wider">Qty</th>
                        <th className="text-right py-3 font-black text-slate-900 uppercase tracking-wider">Price</th>
                        <th className="text-right py-3 font-black text-slate-900 uppercase tracking-wider">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {order.products.map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-200">
                            <td className="py-4">
                                <p className="font-bold text-slate-900">{item.title}</p>
                                <p className="text-xs text-slate-500">Size: {item.size} {item.selectedColor ? `| ${item.selectedColor}` : ''}</p>
                            </td>
                            <td className="py-4 text-center text-slate-900">{item.quantity}</td>
                            <td className="py-4 text-right text-slate-900">£{item.price.toFixed(2)}</td>
                            <td className="py-4 text-right font-bold text-slate-900">£{(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-16">
            <div className="w-1/2 lg:w-1/3 space-y-3">
                <div className="flex justify-between text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span>£{order.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                    <span>Shipping</span>
                    <span>£{order.shippingCost?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                    <span>Tax (VAT Included)</span>
                    <span>£{order.taxAmount?.toFixed(2)}</span>
                </div>
                {order.discountAmount && order.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 font-bold">
                        <span>Discount</span>
                        <span>-£{order.discountAmount.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between text-xl font-black text-slate-900 border-t-2 border-slate-900 pt-3">
                    <span>Total</span>
                    <span>£{order.total.toFixed(2)}</span>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="text-center border-t border-slate-200 pt-8 text-sm text-slate-500">
            <p className="font-serif font-bold text-slate-900 mb-2">Thank you for your business!</p>
            <p>For any questions, please contact {settings.contactEmail || 'support@jamboapparels.com'}</p>
            <p className="text-xs mt-4">Jambo Apparels &copy; {new Date().getFullYear()}</p>
        </div>
      </div>

      {/* --- DASHBOARD VIEW (Hidden when Printing) --- */}
      <div className="no-print">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <div className="back-button-container">
            <button onClick={() => navigate('/admin/orders')} className="text-xs font-black text-brand-green uppercase tracking-widest flex items-center gap-1 mb-2 hover:underline">
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
            <div id="btn-print-invoice">
                <Button variant="outline" onClick={() => window.print()} className="rounded-xl px-6 h-11 bg-white border-slate-200 hover:border-brand-green text-slate-700 hover:text-brand-green">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    Print Invoice
                </Button>
            </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            <div className="lg:col-span-2 space-y-8">
            <div id="section-order-items" className="bg-white shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 overflow-hidden">
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
                                    <div className="h-16 w-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
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
                            </td>
                            </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
            </div>

            <div id="section-customer-info" className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 p-8">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    Customer Details
                    </h3>
                    <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-brand-light flex items-center justify-center text-brand-dark font-black text-xl border-2 border-white shadow-sm">
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-lg font-bold text-slate-900">{displayName}</p>
                        <p className="text-sm text-slate-500">{displayEmail}</p>
                    </div>
                    </div>
                </div>

                <div className="bg-white shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 p-8">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    Delivery Destination
                    </h3>
                    {order.shippingAddress ? (
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-900">{displayName || 'Recipient'}</p>
                        <address className="not-italic text-sm text-slate-600 leading-relaxed font-light">
                            {order.shippingAddress.address1}<br/>
                            {order.shippingAddress.city}, {order.shippingAddress.postcode}<br/>
                            <span className="font-bold text-slate-900 uppercase text-[11px] tracking-widest">{order.shippingAddress.country}</span>
                        </address>
                    </div>
                    ) : (
                    <p className="text-slate-400 italic text-sm font-light">Missing address data.</p>
                    )}
                </div>
            </div>
            </div>

            <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-24 logistics-control-panel">
            <div className="bg-white shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 p-8 space-y-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-4">Logistics Management</h3>
                
                <div className="space-y-4">
                    <div id="select-order-status">
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

                    <div id="select-payment-status">
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

                    <div id="input-tracking-number">
                        <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2">Tracking Registry</label>
                        <input 
                        type="text" 
                        value={tracking} 
                        onChange={(e) => setTracking(e.target.value)} 
                        placeholder="e.g. GB123456789"
                        className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-900 text-sm font-mono focus:ring-2 focus:ring-brand-green/10 outline-none transition-all" 
                        />
                    </div>

                    <div id="btn-save-changes">
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
            </div>
            </div>
        </div>
      </div>
    </div>
  );
};
