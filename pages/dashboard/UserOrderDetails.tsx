import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { api } from '../../lib/db';
import { Order } from '../../types';
import { Button } from '../../components/ui/Button';
import { BackButton } from '../../components/ui/BackButton';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { useShop } from '../../context/ShopContext';
import { useCart } from '../../context/CartContext';
import { useOrders } from '../../context/OrderContext';
import { OrderStatusTracker } from '../../components/dashboard/OrderStatusTracker';
import { usePayment } from '../../hooks/usePayment';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { formatCurrency, formatDate } from '../../lib/utils';

export const UserOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  // Decoupled Hooks
  const { user } = useAuth();
  const { settings } = useShop();
  const { clearCart } = useCart();
  const { refreshOrders } = useOrders();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  const { 
    isProcessing, 
    paypalConfig, 
    handlePayPalCreateOrder, 
    handlePayPalApprove 
  } = usePayment({ user, clearCart, settings });

  const fetchOrder = useCallback(async () => {
    if (!id || !user) return;
    setLoading(true);
    try {
      const o = await api.getOrderById(id);
      if (o && o.userId === user.id) {
        setOrder(o);
      } else {
        showToast("Order not found or access denied.", "error");
        navigate('/dashboard');
      }
    } catch (err) {
      showToast("Error loading order details.", "error");
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id, user, navigate, showToast]);

  useEffect(() => {
    if (user) {
      fetchOrder();
    }
  }, [user, fetchOrder]);

  const handleReturnRequest = async () => {
    if (!returnReason.trim() || !user || !order) return;
    setIsSubmittingReturn(true);
    try {
      await api.requestReturn(order.id, user.id, returnReason);
      showToast("Return request submitted. We'll be in touch!", "success");
      setIsReturnModalOpen(false);
      fetchOrder();
    } catch (e) {
      showToast("Failed to submit return request.", "error");
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  if (loading || !user) return <LoadingSpinner fullScreen />;
  if (!order) return null;

  const isPendingPayment = order.status === 'Pending Payment';
  const canReturn = order.status === 'Delivered' && order.returnStatus === 'none';
  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in relative">
      <div id="invoice-container" className="hidden print:block bg-white text-slate-900 p-12 font-sans max-w-[210mm] mx-auto h-full relative">
        <header className="flex justify-between items-start mb-16">
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
        </header>

        <section className="mb-12">
           <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Bill To</h2>
           <div className="text-base text-gray-800 leading-relaxed">
              <p className="font-bold text-lg">{order.customerName}</p>
              <p>{order.shippingAddress?.address1}</p>
              <p>{order.shippingAddress?.address2}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.postcode}</p>
              <p>{order.shippingAddress?.country}</p>
           </div>
        </section>

        <section>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-500">Item</th>
                <th className="p-4 text-center text-xs font-bold uppercase tracking-widest text-gray-500">Qty</th>
                <th className="p-4 text-right text-xs font-bold uppercase tracking-widest text-gray-500">Price</th>
                <th className="p-4 text-right text-xs font-bold uppercase tracking-widest text-gray-500">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.products.map((item, idx) => (
                <tr key={idx}>
                  <td className="p-4">
                    <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.size} {item.selectedColor ? `/ ${item.selectedColor}` : ''}</p>
                  </td>
                  <td className="p-4 text-center text-gray-700">{item.quantity}</td>
                  <td className="p-4 text-right text-gray-700 font-mono">£{item.price.toFixed(2)}</td>
                  <td className="p-4 text-right text-gray-900 font-bold font-mono">£{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-12 flex justify-end">
          <div className="w-full max-w-sm space-y-4">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="font-mono">£{order.subtotal?.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Shipping</span><span className="font-mono">£{order.shippingCost?.toFixed(2)}</span></div>
            {order.discountAmount && <div className="flex justify-between text-sm text-green-600"><span className="font-bold">Discount</span><span className="font-mono">-£{order.discountAmount.toFixed(2)}</span></div>}
            <div className="flex justify-between text-sm text-gray-400"><span className="italic">Tax (Included)</span><span className="font-mono">£{order.taxAmount?.toFixed(2)}</span></div>
            <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between text-xl font-bold text-gray-900"><span>Total</span><span className="font-mono">£{order.total.toFixed(2)}</span></div>
          </div>
        </section>

        <footer className="absolute bottom-12 left-12 right-12 text-center text-xs text-gray-400 border-t pt-6">
          Thank you for your order! If you have any questions, please contact us at {settings.contactEmail}.
        </footer>
      </div>

      <BackButton to="/dashboard" className="mb-6 no-print" />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 no-print">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold font-serif text-gray-900">Order #{order.orderNumber}</h1>
            <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-4">
             <p className="text-xl sm:text-2xl font-bold text-gray-900 font-serif">£{order.total.toFixed(2)}</p>
             <Button variant="outline" onClick={() => window.print()} className="hidden md:flex">Print Invoice</Button>
          </div>
        </div>
        <div className="mt-8">
          <OrderStatusTracker status={order.status} createdAt={order.createdAt} shippedAt={order.shippedAt} deliveredAt={order.deliveredAt} />
        </div>
      </div>

      {/* Return Logic Integration */}
      {order.returnStatus !== 'none' && (
        <div className="mb-8 bg-slate-50 border border-slate-200 rounded-2xl p-6 no-print">
           <h3 className="font-bold text-slate-900 mb-1">Return Status: <span className="capitalize text-brand-green">{order.returnStatus}</span></h3>
           <p className="text-sm text-slate-500">Reason: "{order.returnReason}"</p>
           {order.returnStatus === 'approved' && (
             <p className="mt-4 text-sm text-brand-green font-bold bg-green-50 p-3 rounded-lg border border-green-100">
               ✓ Your return is approved. Please follow the instructions sent to your email to ship the items back.
             </p>
           )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start no-print">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold p-6 border-b border-gray-100">Items Ordered</h2>
            <ul className="divide-y divide-gray-100">
              {order.products.map((item, idx) => (
                <li key={idx} className="p-6 flex gap-4">
                  <img src={item.image} alt={item.title} className="w-20 h-20 rounded-lg object-cover border border-gray-100" />
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">Size: {item.size} | Qty: {item.quantity}</p>
                    <p className="text-sm font-bold mt-2">£{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-3">
             <h3 className="text-lg font-bold mb-2">Actions</h3>
             {canReturn && (
                <Button variant="outline" fullWidth onClick={() => setIsReturnModalOpen(true)} className="text-orange-700 border-orange-200 hover:bg-orange-50">Request a Return</Button>
             )}
             <Link to="/about" className="block w-full">
               <Button variant="outline" fullWidth>Contact Support</Button>
             </Link>
          </div>
        </div>
      </div>

      {/* Return Modal */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in no-print">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-in">
              <div className="p-8">
                 <h3 className="text-2xl font-serif font-bold text-brand-dark mb-4">Request a Return</h3>
                 <p className="text-sm text-slate-500 mb-6 leading-relaxed">Please tell us why you'd like to return this order. Our team will review your request within 24 hours.</p>
                 
                 <div className="space-y-4">
                    <div>
                       <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Reason</label>
                       <select 
                         value={returnReason} 
                         onChange={(e) => setReturnReason(e.target.value)}
                         className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-green/10 outline-none bg-slate-50"
                       >
                          <option value="">Select a reason...</option>
                          <option value="Incorrect fit/size">Incorrect fit/size</option>
                          <option value="Defective material">Defective material</option>
                          <option value="Changed my mind">Changed my mind</option>
                          <option value="Other">Other (Specify in notes)</option>
                       </select>
                    </div>
                    {returnReason === 'Other' && (
                       <textarea 
                         rows={3} 
                         placeholder="Please specify..." 
                         className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-slate-50"
                       />
                    )}
                 </div>

                 <div className="flex gap-3 mt-8">
                    <Button variant="outline" fullWidth onClick={() => setIsReturnModalOpen(false)}>Cancel</Button>
                    <Button fullWidth onClick={handleReturnRequest} isLoading={isSubmittingReturn} disabled={!returnReason}>Submit Request</Button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
