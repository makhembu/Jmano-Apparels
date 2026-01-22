import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';

export const AdminDashboard: React.FC = () => {
  const { orders, products, blogPosts } = useApp();

  useEffect(() => {
    console.log("[AdminDashboard] Page mounted. Stats: ", { orders: orders.length, products: products.length, blogPosts: blogPosts.length });
  }, [orders.length, products.length, blogPosts.length]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-brand-green">
           <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
           <p className="text-3xl font-bold text-gray-900 mt-2">{orders.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-brand-hope">
           <h3 className="text-gray-500 text-sm font-medium">Active Products</h3>
           <p className="text-3xl font-bold text-gray-900 mt-2">{products.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-brand-testament">
           <h3 className="text-gray-500 text-sm font-medium">Blog Posts</h3>
           <p className="text-3xl font-bold text-gray-900 mt-2">{blogPosts.length}</p>
        </div>
      </div>
      
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
             <thead>
               <tr>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
               </tr>
             </thead>
             <tbody className="bg-white divide-y divide-gray-200">
               {orders.slice(0, 5).map(order => (
                 <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-GB')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">£{order.total.toFixed(2)}</td>
                 </tr>
               ))}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};