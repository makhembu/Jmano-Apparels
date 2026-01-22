import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../lib/db';
import { useToast } from '../context/ToastContext';

export const Footer: React.FC = () => {
  const { settings } = useApp();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.subscribeToNewsletter(email);
      showToast('Successfully subscribed!', 'success');
      setEmail('');
    } catch (e) {
      showToast('Failed to subscribe. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-brand-dark text-white pt-10 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-xl font-serif font-bold mb-4">Jambo Apparels</h3>
            <p className="text-brand-light text-sm italic">{settings.slogan}</p>
            <p className="text-brand-light text-sm mt-2">{settings.coreValues}</p>
            
            {/* Newsletter Form */}
            <div className="mt-6">
              <h5 className="text-sm font-semibold mb-2">Join our Newsletter</h5>
              <form onSubmit={handleSubscribe} className="flex flex-col space-y-2">
                <input 
                  type="email" 
                  placeholder="Enter email..." 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="px-3 py-2 text-sm text-gray-900 bg-white rounded focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-brand-green hover:bg-green-700 text-white text-sm py-2 px-3 rounded transition-colors disabled:opacity-50"
                >
                  {loading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-brand-hope">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop" className="hover:text-brand-hope">All Products</Link></li>
              <li><Link to="/cart" className="hover:text-brand-hope">View Cart</Link></li>
              <li><Link to="/dashboard" className="hover:text-brand-hope">My Account</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-brand-hope">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-brand-hope">Our Mission</Link></li>
              <li><Link to="/blog" className="hover:text-brand-hope">Journal</Link></li>
              <li><Link to="/terms" className="hover:text-brand-hope">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-brand-hope">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-brand-hope">Help</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/returns" className="hover:text-brand-hope">Returns & Refunds</Link></li>
              <li><Link to="/cookies" className="hover:text-brand-hope">Cookie Policy</Link></li>
              <li className="pt-2 text-brand-light">support@jamboapparels.com</li>
              <li className="text-brand-light text-xs mt-1">London, UK</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-green-800 text-center text-xs text-brand-light">
          &copy; {new Date().getFullYear()} Jambo Apparels. All rights reserved. Registered in England & Wales.
        </div>
      </div>
    </footer>
  );
};