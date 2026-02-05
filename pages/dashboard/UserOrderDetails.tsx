
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

export const UserOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, refreshOrders, products, addToCart, settings } = useApp();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [reordering, setReordering] = useState(false);

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

  // Auto-print logic for when user clicks link in email
  useEffect(() => {
    if (!loading && order && searchParams.get('print') === 'true') {
        // Small delay to ensure DOM is fully painted including images
        setTimeout(() => {
            window.print();
        }, 800);
    }
  }, [loading, order, searchParams]);
  
  const handleCancel = async () => {
    if (!order || !user) return;
    if (window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
      setCancelling(true);
      try {
        await api.cancelOrder(order.id, user.id);
        showToast("Order successfully cancelled.", "success");
        await fetchOrder(); // Re-fetch to get updated status
        await refreshOrders(); // Refresh global order list
      } catch (e: any) {
        showToast(e.message || "Failed to cancel order.", "error");
      } finally {
        setCancelling(false);
      }
    }
  };

  const handleReorder = async () => {
    if (!order) return;
    setReordering(true);

    const itemsToAdd: { product: Product; item: any }[] = [];
    const missingItems: string[] = [];

    // Parallel fetching for performance
    await Promise.all(order.products.map(async (item) => {
        // 1. Check if product is already loaded in Context (paginated view)
        let productToAdd = products.find((p) => p.id === item.productId);
        
        // 2. If not found in memory, fetch individually from DB
        if (!productToAdd) {
            try {
                productToAdd = await api.getProductById(item.productId);
            } catch (e) {
                console.warn(`Product ${item.productId} not found/deleted`);
            }
        }

        // 3. Verify availability
        if (productToAdd && (productToAdd.isPublished !== false)) {
            itemsToAdd.push({ product: productToAdd, item });
        } else {
            missingItems.push(item.title);
        }
    }));

    // Execute Add
    itemsToAdd.forEach(({ product, item }) => {
        addToCart(product, item.size, item.quantity, item.selectedColor);
    });

    setReordering(false);
    
    if (itemsToAdd.length > 0) {
        showToast('Items added to cart!', 'success');
        navigate('/cart');
    }
    
    if (missingItems.length > 0) {
        // Slight delay to ensure toast doesn't conflict
        setTimeout(() => {
            showToast(`${missingItems.length} items unavailable for reorder.`, 'info');
        }, 500);
    }
  };

  const getProductSlug = (productId: string) => {
    const found = products.find((p) => p.id === productId);
    return found?.slug || productId;
  };

  const recommendedProducts = useMemo(() => {
    if (!order || !products?.length) return [];

    const orderProductIds = new Set(order.products.map(p => p.productId));
    const orderProducts = products.filter((p) => orderProductIds.has(p.id));
    const categoryKeys = new Set(orderProducts.map((p) => p.categoryKey));

    if (categoryKeys.size === 0) {
      // Fallback: If no categories found (e.g., product deleted), show featured items
      return products.filter((p) => p.isFeatured && !orderProductIds.has(p.id)).slice(0, 4);
    }

    const similar = products.filter((p) => 
      categoryKeys.has(p.categoryKey) &&
      !orderProductIds.has(p.id) &&
      p.isPublished !== false
    );
    
    return similar.sort(() => 0.5 - Math.random()).slice(0, 4);
  }, [order, products]);

  if (loading || !user) return <LoadingSpinner fullScreen />;
  if (!order) {
    return (
      <div className="text-center py-20">
        <p>Order not found.</p>
        <Link to="/dashboard" className="text-brand-green underline mt-4 inline-block">Back to Dashboard</Link>
      </div>
    );
  }

  const canCancel = ['Pending', 'Processing', 'Pending Payment'].includes(order.status);
  const canReturn = order.status === 'Delivered';
  const canReorder = !['Cancelled', 'Refunded'].includes(order.status);
  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in relative">
      
      {/* --- INVOICE PRINT VIEW (Hidden on Screen) --- */}
      <div id="invoice-container" className="hidden print:block bg-white text-slate-900 p-8 font-sans max-w-[210mm] mx-auto h-full relative">
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
                <p className="text-sm font-bold text-slate-900">{user.name}</p>
                <p className="text-sm text-slate-600">{user.email}</p>
            </div>
            <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-1">Ship To</h3>
                {order.shippingAddress ? (
                   <address className="not-italic text-sm text-slate-600 leading-relaxed">
                      <p className="font-bold text-slate-900">{user.name}</p>
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

      <BackButton to="/dashboard" className="mb-6 no-print" />

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
          <OrderStatusTracker 
            status={order.status}
            createdAt={order.createdAt}
            shippedAt={order.shippedAt}
            deliveredAt={order.deliveredAt}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start no-print">
        <div className="lg:col-span-2 space-y-8">
          {/* Items List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold p-6 border-b border-gray-100">Items Ordered ({order.products.length})</h2>
            <ul className="divide-y divide-gray-100">
              {order.products.map((item, idx) => {
                const slug = getProductSlug(item.productId);
                return (
                  <li key={idx} className="p-6 flex flex-col sm:flex-row gap-4 items-start">
                    {/* Product info on the left */}
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
                    {/* Price and Action on the right */}
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

          {/* Shipping & Billing */}
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
          {/* Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-3">
             <h3 className="text-lg font-bold mb-2">Order Actions</h3>
             
             {/* Mobile-only Print Button */}
             <Button variant="outline" fullWidth onClick={() => window.print()} className="md:hidden">
                Print / Download Invoice
             </Button>

             {canReorder && (
                <Button onClick={handleReorder} isLoading={reordering} variant="primary" fullWidth>Reorder Items</Button>
             )}
             {canCancel && (
               <Button onClick={handleCancel} isLoading={cancelling} variant="danger" fullWidth>Cancel Order</Button>
             )}
             {canReturn && (
               <Link to="/returns">
                  <Button variant="outline" fullWidth>Request a Return</Button>
               </Link>
             )}
             <Link to="/about">
               <Button variant="outline" fullWidth>Contact Support</Button>
             </Link>
          </div>
          
          {/* Summary */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-sm space-y-2">
            <h3 className="text-lg font-bold mb-4">Order Summary</h3>
            <div className="flex justify-between"><span>Subtotal</span><span>£{order.subtotal?.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>£{order.shippingCost?.toFixed(2)}</span></div>
            {order.discountAmount && order.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-£{order.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t mt-2 font-bold text-base">
              <span>Total</span>
              <span>£{order.total.toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-500 text-right">Includes £{order.taxAmount?.toFixed(2)} VAT</p>
          </div>
        </div>
      </div>

      {/* Recommended Products */}
      {recommendedProducts.length > 0 && (
        <section className="mt-24 border-t border-slate-100 pt-16 no-print">
          <h2 className="text-3xl font-serif font-bold text-brand-dark mb-12">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {recommendedProducts.map((prod: any) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
