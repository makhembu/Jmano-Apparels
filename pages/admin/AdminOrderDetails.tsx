import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/db';
import { Order, User } from '../../types';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export const AdminOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [tracking, setTracking] = useState('');

  useEffect(() => {
    if(id) {
       api.getOrderById(id).then(async (o) => {
          setOrder(o);
          if(o) {
             setStatus(o.status);
             setPaymentStatus(o.paymentStatus || 'pending');
             setTracking(o.trackingNumber || '');
             if (o.userId) {
                try {
                  const u = await api.getUserProfile(o.userId);
                  setCustomer(u);
                } catch(e) {
                  console.error("Failed to load customer", e);
                }
             }
          }
       }).finally(() => setLoading(false));
    }
  }, [id]);

  const handleUpdate = async () => {
     if(!id) return;
     try {
        await api.adminUpdateOrder(id, { status, trackingNumber: tracking, paymentStatus });
        showToast('Order updated', 'success');
        // Refresh local state timestamps potentially, or just let user reload
     } catch(e) {
        showToast('Failed to update', 'error');
     }
  };

  if (loading) return <LoadingSpinner />;
  if (!order) return <div>Order not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
         <Button variant="outline" onClick={() => navigate('/admin/orders')}>Back to Orders</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="md:col-span-2 space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
               <h3 className="font-bold mb-4 border-b pb-2">Items</h3>
               <ul className="space-y-3">
                  {order.products.map((item, idx) => (
                     <li key={idx} className="flex justify-between items-center">
                        <div className="flex items-center">
                           <span className="font-medium">{item.title}</span>
                           <span className="text-gray-500 text-sm ml-2">({item.size}) x {item.quantity}</span>
                        </div>
                        <span>£{(item.price * item.quantity).toFixed(2)}</span>
                     </li>
                  ))}
               </ul>
               <div className="border-t mt-4 pt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                     <span>Subtotal</span>
                     <span>£{order.subtotal?.toFixed(2) || order.total.toFixed(2)}</span>
                  </div>
                  {order.shippingCost !== undefined && (
                     <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>£{order.shippingCost.toFixed(2)}</span>
                     </div>
                  )}
                  {order.discountAmount !== undefined && order.discountAmount > 0 && (
                     <div className="flex justify-between text-green-600">
                        <span>Discount {order.discountCode ? `(${order.discountCode})` : ''}</span>
                        <span>-£{order.discountAmount.toFixed(2)}</span>
                     </div>
                  )}
                  {order.taxAmount !== undefined && (
                     <div className="flex justify-between text-xs text-gray-400">
                        <span>Included Tax</span>
                        <span>£{order.taxAmount.toFixed(2)}</span>
                     </div>
                  )}
                  <div className="flex justify-between font-bold text-lg text-gray-900 border-t pt-2 mt-2">
                     <span>Total</span>
                     <span>£{order.total.toFixed(2)}</span>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="font-bold mb-4 border-b pb-2">Customer</h3>
                  {customer ? (
                    <div>
                      <p className="font-medium text-gray-900">{customer.name}</p>
                      <p className="text-gray-500 text-sm">{customer.email}</p>
                      <p className="text-gray-400 text-xs mt-1">ID: {customer.id}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">Customer ID: {order.userId}</p>
                  )}
               </div>

               <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="font-bold mb-4 border-b pb-2">Shipping Address</h3>
                  {order.shippingAddress ? (
                     <address className="not-italic text-gray-600 text-sm">
                        {order.shippingAddress.address1}<br/>
                        {order.shippingAddress.address2 && <>{order.shippingAddress.address2}<br/></>}
                        {order.shippingAddress.city}, {order.shippingAddress.postcode}<br/>
                        {order.shippingAddress.country}
                        {order.shippingAddress.phone && <><br/><span className="text-sm mt-2 block">📞 {order.shippingAddress.phone}</span></>}
                     </address>
                  ) : (
                     <p className="text-gray-500">No address data available</p>
                  )}
               </div>
               
               <div className="bg-white shadow rounded-lg p-6 md:col-span-2">
                  <h3 className="font-bold mb-4 border-b pb-2">Order Notes</h3>
                  {order.notes ? (
                     <p className="text-gray-600 italic">"{order.notes}"</p>
                  ) : (
                     <p className="text-gray-400 text-sm">No notes provided by customer.</p>
                  )}
               </div>
            </div>
         </div>

         <div className="md:col-span-1">
            <div className="bg-white shadow rounded-lg p-6 sticky top-24">
               <h3 className="font-bold mb-4 border-b pb-2">Management</h3>
               <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700">Status</label>
                     <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white text-gray-900">
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                     </select>
                  </div>
                  
                  {/* Timestamps */}
                  <div className="text-xs text-gray-500 space-y-1">
                     <p>Created: {new Date(order.createdAt).toLocaleString()}</p>
                     {order.shippedAt && <p>Shipped: {new Date(order.shippedAt).toLocaleString()}</p>}
                     {order.deliveredAt && <p>Delivered: {new Date(order.deliveredAt).toLocaleString()}</p>}
                     {order.cancelledAt && <p className="text-red-500">Cancelled: {new Date(order.cancelledAt).toLocaleString()}</p>}
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                     <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white text-gray-900">
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                     </select>
                     <p className="text-xs text-gray-500 mt-1">Method: {(order as any).paymentMethod || 'Stripe'}</p>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700">Tracking Number</label>
                     <input type="text" value={tracking} onChange={(e) => setTracking(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white text-gray-900" />
                  </div>
                  <Button variant="primary" fullWidth onClick={handleUpdate}>Update Order</Button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};