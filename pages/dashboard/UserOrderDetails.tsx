
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { api } from '../../lib/db';
import { Order, Product } from '../../types';
import { Button } from '../../components/ui/Button';
import { BackButton } from '../../components/ui/BackButton';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useApp } from '../../context/AppContext';
import { OrderStatusTracker } from '../../components/dashboard/OrderStatusTracker';
import { usePayment } from '../../hooks/usePayment';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export const UserOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, refreshOrders, products, addToCart, settings, clearCart } = useApp();

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in relative">
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
        <div className="mb-8 bg-slate-50 border border-slate-200 rounded-2xl p-6">
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
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
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
