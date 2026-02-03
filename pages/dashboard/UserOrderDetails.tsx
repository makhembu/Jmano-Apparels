
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, refreshOrders, products, addToCart } = useApp();

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <BackButton to="/dashboard" className="mb-6" />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold font-serif text-gray-900">Order #{order.orderNumber}</h1>
            <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString('en-GB', { dateStyle: 'long' })}</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 font-serif">£{order.total.toFixed(2)}</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
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
        <section className="mt-24 border-t border-slate-100 pt-16">
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
