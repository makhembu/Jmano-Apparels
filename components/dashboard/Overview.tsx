import React from 'react';
import { User, Order } from '../../types';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

interface OverviewProps {
  user: User;
  orders: Order[];
  wishlistCount: number;
  onNavigate: (tab: string) => void;
}

export const Overview: React.FC<OverviewProps> = ({ user, orders, wishlistCount, onNavigate }) => {
  const { cart } = useCart();
  const latestOrder = orders[0];
  const totalSpent = orders.reduce((acc, curr) => acc + (curr.total || 0), 0);

  const StatCard = ({ label, value }: { label: string, value: string | number }) => (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 font-serif">{value}</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Orders" value={orders.length} />
        <StatCard label="Wishlist" value={wishlistCount} />
        <StatCard label="Total Spent" value={`£${totalSpent.toFixed(0)}`} />
        <StatCard label="Member Since" value={user.createdAt ? new Date(user.createdAt).getFullYear() : '-'} />
      </div>

      {/* 2. Active Cart Warning */}
      {cart.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <span className="bg-amber-100 p-2 rounded-full text-amber-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </span>
              <div>
                 <p className="text-sm font-bold text-amber-900">You have {cart.length} items in your basket</p>
                 <p className="text-xs text-amber-700">Don't forget to complete your purchase.</p>
              </div>
           </div>
           <Link to="/cart" className="text-xs font-bold bg-white border border-amber-200 text-amber-800 px-4 py-2 rounded hover:bg-amber-50 transition-colors">
              View Cart
           </Link>
        </div>
      )}

      {/* 3. Latest Order */}
      <div>
        <div className="flex justify-between items-end mb-4">
           <h3 className="text-lg font-bold text-gray-900">Recent Order</h3>
           {orders.length > 0 && (
             <button onClick={() => onNavigate('orders')} className="text-sm text-brand-green hover:underline">View All History</button>
           )}
        </div>

        {latestOrder ? (
          <Link to={`/order/${latestOrder.id}`} className="block border border-gray-200 rounded-lg overflow-hidden hover:shadow-md hover:border-brand-green/30 transition-all">
             <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                <div>
                   <span className="font-mono text-sm font-bold text-gray-700">#{latestOrder.orderNumber || latestOrder.id.slice(0,8)}</span>
                   <span className="mx-2 text-gray-300">|</span>
                   <span className="text-xs text-gray-500">{new Date(latestOrder.createdAt).toLocaleDateString()}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                   latestOrder.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                   {latestOrder.status}
                </span>
             </div>
             <div className="p-6 bg-white">
                <div className="flex items-start gap-4">
                   <div className="h-16 w-16 bg-gray-100 rounded border border-gray-200 overflow-hidden flex-shrink-0">
                      <img src={latestOrder.products[0]?.image} alt="" className="w-full h-full object-cover" />
                   </div>
                   <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-900">{latestOrder.products[0]?.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                         {latestOrder.products.length > 1 ? `+ ${latestOrder.products.length - 1} other items` : `Size: ${latestOrder.products[0]?.size}`}
                      </p>
                   </div>
                   <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">£{(latestOrder.total || 0).toFixed(2)}</p>
                      <span className="text-xs text-brand-green font-bold">View Details &rarr;</span>
                   </div>
                </div>
             </div>
          </Link>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
             <p className="text-sm text-gray-500 mb-2">No orders placed yet.</p>
             <Link to="/shop" className="text-brand-green font-bold text-sm hover:underline">Start Shopping</Link>
          </div>
        )}
      </div>

    </div>
  );
};
