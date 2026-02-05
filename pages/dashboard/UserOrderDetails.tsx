
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
import { ProductCard } from '../../components/ProductCard';
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
  const [cancelling, setCancelling] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [restoring, setRestoring] = useState(false);

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

  useEffect(() => {
    if (!loading && order && searchParams.get('print') === 'true') {
        setTimeout(() => { window.print(); }, 800);
    }
  }, [loading, order, searchParams]);
  
  const handleCancel = async () => {
    if (!order || !user) return;
    if (window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
      setCancelling(true);
      try {
        await api.cancelOrder(order.id, user.id);
        showToast("Order successfully cancelled.", "success");
        await fetchOrder();
        await refreshOrders();
      } catch (e: any) {
        showToast(e.message || "Failed to cancel order.", "error");
      } finally {
        setCancelling(false);
      }
    }
  };

  const handleCancelAndEdit = async () => {
    if (!order || !user) return;
    if (!window.confirm("This will cancel the current order and move these items back into your active cart. Continue?")) return;

    setRestoring(true);
    try {
        // 1. Call Secure DB Function to cancel order and restore stock
        const { error } = await (api as any).cancelAndRestoreStock(order.id, user.id);
        if (error) throw error;

        // 2. Add items to user's local cart
        for (const item of order.products) {
            let productObj = products.find(p => p.id === item.productId);
            if (!productObj) {
                productObj = await api.getProductById(item.productId);
            }
            if (productObj) {
                addToCart(productObj, item.size, item.quantity, item.selectedColor);
            }
        }

        showToast("Order unraveled. Items are back in your cart.", "success");
        navigate('/cart');
    } catch (e: any) {
        console.error("Restoration failed", e);
        showToast(e.message || "Could not restore items.", "error");
    } finally {
        setRestoring(false);
    }
  };

  const handleReorder = async () => {
    if (!order) return;
    setReordering(true);
    const itemsToAdd: any[] = [];
    await Promise.all(order.products.map(async (item) => {
        let productToAdd = products.find((p) => p.id === item.productId);
        if (!productToAdd) {
            try { productToAdd = await api.getProductById(item.productId); } catch (e) {}
        }
        if (productToAdd && (productToAdd.isPublished !== false)) {
            itemsToAdd.push({ product: productToAdd, item });
        }
    }));
    itemsToAdd.forEach(({ product, item }) => {
        addToCart(product, item.size, item.quantity, item.selectedColor);
    });
    setReordering(false);
    if (itemsToAdd.length > 0) {
        showToast('Items added to cart!', 'success');
        navigate('/cart');
    }
  };

  const getProductSlug = (productId: string) => {
    const found = products.find((p) => p.id === productId);
    return found?.slug || productId;
  };

  const paypalOptions = useMemo(() => ({
    "client-id": paypalConfig?.clientId || "test",
    currency: settings.currency || "GBP",
    intent: "capture"
  }), [paypalConfig?.clientId, settings.currency]);

  if (loading || !user) return <LoadingSpinner fullScreen />;
  if (!order) return null;

  const isPendingPayment = order.status === 'Pending Payment';
  const canCancel = ['Pending', 'Processing', 'Pending Payment'].includes(order.status);
  const canReturn = order.status === 'Delivered';
  const canReorder = !['Cancelled', 'Refunded', 'Pending Payment'].includes(order.status);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in relative">
      <div id="invoice-container" className="hidden print:block bg-white text-slate-900 p-8 font-sans max-w-[210mm] mx-auto h-full relative">
         {/* ... Print View Implementation ... */}
         <div className="flex justify-between items-start mb-12 border-b-2 border-slate-900 pb-8">
            <div className="w-1/2">
                <img src={settings.logoImage || "https://i.imgur.com/pkaScEv.png"} alt="Jambo Apparels" className="h-16 w-auto object-contain mb-4" />
                <div className="text-sm text-gray-600 leading-relaxed font-medium">
                    <p className="font-bold text-slate-900">Jambo Apparels</p>
                    <p>{settings.contactAddress || '123 Scripture Lane, London, UK'}</p>
                    <p>{settings.contactEmail}</p>
                </div>
            </div>
            <div className="w-1/2 text-right">
                <h1 className="text-4xl font-black text-slate-900 uppercase tracking-widest mb-4">Invoice</h1>
                <p className="text-base font-bold text-slate-900"><span className="text-slate-500 font-normal mr-2">Order:</span>#{order.orderNumber}</p>
                <p className="text-base font-bold text-slate-900"><span className="text-slate-500 font-normal mr-2">Date:</span>{new Date(order.createdAt).toLocaleDateString('en-GB')}</p>
            </div>
         </div>
         {/* ... Rest of print table ... */}
      </div>

      <BackButton to="/dashboard" className="mb-6 no-print" />

      {isPendingPayment && (
        <div className="mb-8 bg-brand-hope/10 border-2 border-brand-hope rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-in shadow-xl shadow-brand-hope/5 no-print">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-hope rounded-full flex items-center justify-center text-brand-dark">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                 <h2 className="text-lg font-bold text-brand-dark">Payment Required</h2>
                 <p className="text-sm text-brand-dark/70">Your order is logged but payment hasn't been confirmed yet.</p>
              </div>
           </div>
           <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Button 
                variant="outline" 
                onClick={handleCancelAndEdit}
                isLoading={restoring}
                className="bg-white border-brand-hope/30 text-brand-dark hover:bg-brand-hope/20"
              >
                Cancel & Edit Basket
              </Button>
              <div className="min-w-[200px]">
                {paypalConfig?.enabled && (
                    <PayPalScriptProvider options={paypalOptions}>
                        {/* @ts-ignore - style prop typing issue in some versions of react-paypal-js */}
                        <PayPalButtons 
                            style={{ layout: "horizontal", height: 44, color: "gold", shape: "rect", label: "pay" } as any}
                            createOrder={(data, actions) => handlePayPalCreateOrder(data, actions, () => {}, order.total, order)}
                            onApprove={handlePayPalApprove}
                        />
                    </PayPalScriptProvider>
                )}
              </div>
           </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 no-print">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold font-serif text-gray-900">Order #{order.orderNumber}</h1>
            <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString('en-GB', { dateStyle: 'long' })}</p>
          </div>
          <div className="flex items-center gap-4">
             <p className="text-xl sm:text-2xl font-bold text-gray-900 font-serif">£{order.total.toFixed(2)}</p>
             <Button variant="outline" onClick={() => window.print()} className="hidden md:flex">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Print Invoice
             </Button>
          </div>
        </div>
        <div className="mt-8">
          <OrderStatusTracker status={order.status} createdAt={order.createdAt} shippedAt={order.shippedAt} deliveredAt={order.deliveredAt} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start no-print">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold p-6 border-b border-gray-100">Items Ordered ({order.products.length})</h2>
            <ul className="divide-y divide-gray-100">
              {order.products.map((item, idx) => {
                const slug = getProductSlug(item.productId);
                return (
                  <li key={idx} className="p-6 flex flex-col sm:flex-row gap-4 items-start">
                    <div className="flex gap-4 flex-1">
                      <Link to={`/product/${slug}`}>
                        <img src={item.image} alt={item.title} className="w-20 h-20 rounded-lg object-cover border border-gray-100 flex-shrink-0" />
                      </Link>
                      <div className="flex-1">
                        <Link to={`/product/${slug}`} className="font-bold text-sm text-gray-900 hover:text-brand-green transition-colors block">{item.title}</Link>
                        <p className="text-xs text-gray-500 mt-1">Size: {item.size} {item.selectedColor && `| Color: ${item.selectedColor}`}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-start sm:items-end justify-between h-full w-full sm:w-auto mt-4 sm:mt-0">
                      <p className="text-sm font-bold text-gray-900 mb-2 sm:mb-0">£{(item.price * item.quantity).toFixed(2)}</p>
                      {order.status === 'Delivered' && (
                        <Link to={`/product/${slug}#reviews`}>
                          <Button variant="outline" className="h-8 text-[10px] font-bold uppercase tracking-wider">Leave a Testimony</Button>
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4">Delivery Details</h2>
            <address className="not-italic text-sm text-gray-600 leading-relaxed">
              <p className="font-bold text-gray-900">{user.name}</p>
              {order.shippingAddress?.address1}<br />
              {order.shippingAddress?.address2 && <>{order.shippingAddress.address2}<br /></>}
              {order.shippingAddress?.city}, {order.shippingAddress?.postcode}<br />
              {order.shippingAddress?.country}
            </address>
          </div>
        </div>
        
        <div className="lg:sticky lg:top-24 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-3">
             <h3 className="text-lg font-bold mb-2">Order Actions</h3>
             <Button variant="outline" fullWidth onClick={() => window.print()} className="md:hidden">Print Invoice</Button>
             {canReorder && (
                <Button onClick={handleReorder} isLoading={reordering} variant="primary" fullWidth>Reorder Items</Button>
             )}
             {canCancel && !isPendingPayment && (
               <Button onClick={handleCancel} isLoading={cancelling} variant="danger" fullWidth>Cancel Order</Button>
             )}
             {canReturn && (
               <Link to="/returns" className="block w-full">
                  <Button variant="outline" fullWidth>Request a Return</Button>
               </Link>
             )}
             <Link to="/about" className="block w-full">
               <Button variant="outline" fullWidth>Contact Support</Button>
             </Link>
          </div>
          
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-sm space-y-2">
            <h3 className="text-lg font-bold mb-4">Order Summary</h3>
            <div className="flex justify-between"><span>Subtotal</span><span>£{order.subtotal?.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>£{order.shippingCost?.toFixed(2)}</span></div>
            {order.discountAmount && order.discountAmount > 0 && (
              <div className="flex justify-between text-green-600"><span>Discount</span><span>-£{order.discountAmount.toFixed(2)}</span></div>
            )}
            <div className="flex justify-between pt-2 border-t mt-2 font-bold text-base"><span>Total</span><span>£{order.total.toFixed(2)}</span></div>
            <p className="text-xs text-gray-500 text-right">Includes £{order.taxAmount?.toFixed(2)} VAT</p>
          </div>
        </div>
      </div>
    </div>
  );
};
