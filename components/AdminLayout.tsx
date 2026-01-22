import React from 'react';
import { Link, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user } = useAuth();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-dark text-white flex-shrink-0 hidden md:block">
        <div className="p-6">
          <h2 className="text-2xl font-bold font-serif">Admin Panel</h2>
        </div>
        <nav className="mt-4 px-2 space-y-2">
          <Link to="/admin" className="block px-4 py-2 hover:bg-green-800 rounded transition">Dashboard</Link>
          <Link to="/admin/products" className="block px-4 py-2 hover:bg-green-800 rounded transition">Products</Link>
          <Link to="/admin/orders" className="block px-4 py-2 hover:bg-green-800 rounded transition">Orders</Link>
          <Link to="/admin/users" className="block px-4 py-2 hover:bg-green-800 rounded transition">Users</Link>
          <Link to="/admin/blog" className="block px-4 py-2 hover:bg-green-800 rounded transition">Blog</Link>
          <Link to="/admin/settings" className="block px-4 py-2 hover:bg-green-800 rounded transition">Settings</Link>
          <div className="border-t border-green-800 my-2 pt-2">
             <Link to="/" className="block px-4 py-2 hover:bg-green-800 rounded text-sm text-gray-300 transition">Back to Shop</Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-grow p-8 overflow-auto h-screen">
        <Outlet />
      </div>
    </div>
  );
};