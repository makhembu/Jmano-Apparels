import React from 'react';
import { Order } from '../../types';
import { EmptyState } from '../ui/EmptyState';

interface OrdersProps {
  orders: Order[];
}

export const Orders: React.FC<OrdersProps> = ({ orders }) => {
  if (orders.length === 0) {
    return <EmptyState title="No orders yet" description="Your faith-inspired collection starts here." actionLabel="Shop Now" actionLink="/shop" />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold text-brand-dark mb-4 border-b pb-2">Order History</h2>
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition group">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-brand-light p-3 rounded-xl text-brand-green group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <span className="font-bold text-gray-900 text-lg">Order #{order.orderNumber}</span>
                  <p className="text-xs text-gray-500 font-medium">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="text-left sm:text-right w-full sm:w-auto">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                  order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.status}
                </span>
                {order.trackingNumber && <p className="text-[10px] text-gray-400 mt-2 font-bold">TRACKING: {order.trackingNumber}</p>}
              </div>
            </div>
            
            <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 mb-4">
               <ul className="space-y-3">
                  {order.products.map((p, idx) => (
                    <li key={idx} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="bg-white border px-1.5 py-0.5 rounded text-[10px] font-bold">{p.quantity}x</span>
                        <span className="text-gray-700 font-medium truncate">{p.title}</span>
                        <span className="text-gray-400 text-xs">({p.size})</span>
                      </div>
                      <span className="font-bold text-gray-900">£{((p.price || 0) * (p.quantity || 1)).toFixed(2)}</span>
                    </li>
                  ))}
               </ul>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
               <div className="text-xs text-gray-400 italic">
                 {order.shippingAddress && `Delivering to ${order.shippingAddress.city}, ${order.shippingAddress.postcode}`}
               </div>
               <div className="flex items-baseline gap-2">
                 <span className="text-sm text-gray-500">Order Total:</span>
                 <span className="text-2xl font-bold text-brand-green">£{(order.total || 0).toFixed(2)}</span>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
