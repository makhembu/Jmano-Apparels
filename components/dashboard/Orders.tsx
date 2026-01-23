import React from 'react';
import { Order } from '../../types';
import { EmptyState } from '../ui/EmptyState';
import { Link } from 'react-router-dom';

interface OrdersProps {
  orders: Order[];
}

export const Orders: React.FC<OrdersProps> = ({ orders }) => {
  if (orders.length === 0) {
    return <EmptyState title="No orders yet" description="Your faith-inspired collection starts here." actionLabel="Shop Now" actionLink="/shop" />;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {orders.map(order => (
        <Link to={`/order/${order.id}`} key={order.id} className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-brand-green/30 transition-all group">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center gap-3">
                 <span className="font-mono text-sm font-bold text-gray-900 group-hover:text-brand-green">#{order.orderNumber || order.id.slice(0,8)}</span>
                 <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                    order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                 }`}>
                    {order.status}
                 </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString('en-GB', { dateStyle: 'long' })}</p>
            </div>
            <div className="mt-2 sm:mt-0 text-right">
               <p className="text-lg font-bold text-gray-900">£{(order.total || 0).toFixed(2)}</p>
               <span className="text-xs font-bold text-brand-green opacity-0 group-hover:opacity-100 transition-opacity">View Details &rarr;</span>
            </div>
          </div>
          
          <div className="space-y-2">
             {order.products.slice(0, 2).map((p, idx) => (
               <div key={idx} className="flex justify-between items-center text-sm">
                 <div className="flex items-center gap-2">
                   <span className="text-gray-400 text-xs font-mono">{p.quantity}x</span>
                   <span className="text-gray-700">{p.title}</span>
                 </div>
                 <span className="text-gray-500 text-xs">Size: {p.size}</span>
               </div>
             ))}
             {order.products.length > 2 && (
                <p className="text-xs text-gray-400 font-bold text-center pt-2">+ {order.products.length - 2} more items</p>
             )}
          </div>
        </Link>
      ))}
    </div>
  );
};
