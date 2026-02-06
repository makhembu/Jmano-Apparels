import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../lib/db';
import { useToast } from '../context/ToastContext';
import { useConsent } from '../context/CookieConsentContext';

// Fix: Changed type from React.ReactNode to React.ReactElement for better type safety with React.cloneElement.
const SocialIcons: Record<string, React.ReactElement> = {
  facebook: (
    // FIX: Added empty className prop to SVG element to allow cloning with className for styling.
    <svg className="" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
  ),
  twitter: (
    // FIX: Added empty className prop to SVG element to allow cloning with className for styling.
    <svg className="" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
  ),
  instagram: (
    // FIX: Added empty className prop to SVG element to allow cloning with className for styling.
    <svg className="" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.148 3.225-1.664 4.771-4.919 4.919-1.266.058-1.646.07-4.85.07-3.204 0-3.584-.012-4.85-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.646-.07-4.85s.012-3.584.07-4.85c.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.646-.07 4.85-.07zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12s.014 3.667.072 4.948c.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24s3.667-.014 4.948-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.948C21.726 2.69 19.302.274 14.948.073 13.667.014 13.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z" /></svg>
  )
};

export const Footer: React.FC = () => {
  const { settings } = useApp();
  const { showToast } = useToast();
  const { resetConsent } = useConsent();
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
            
            {settings.socialLinks && Object.values(settings.socialLinks).some(v => v) && (
              <div className="flex space-x-4 mt-6">
                {Object.entries(settings.socialLinks).map(([platform, url]) =>
                  url && SocialIcons[platform] ? (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-light/70 hover:text-brand-hope transition-colors"
                      aria-label={`Jambo Apparels on ${platform}`}
                    >
                      {React.cloneElement(SocialIcons[platform], { className: "w-6 h-6" })}
                    </a>
                  ) : null
                )}
              </div>
            )}

            {settings.enableNewsletterSignup && (
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
                  <div className="flex items-start gap-2">
                     <input type="checkbox" required className="mt-1 w-3 h-3 rounded border-gray-300 text-brand-green focus:ring-brand-green" />
                     <span className="text-[10px] text-brand-light">I consent to receive marketing emails.</span>
                  </div>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-brand-green hover:bg-green-700 text-white text-sm py-2 px-3 rounded transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </form>
              </div>
            )}
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
              <li><Link to="/about" className="hover:text-brand-hope">About Us</Link></li>
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
              <li>
                <button onClick={resetConsent} className="hover:text-brand-hope text-left">
                  Cookie Settings
                </button>
              </li>
              <li className="pt-2 text-brand-light break-all">
                {settings.contactEmail || 'support@jamboapparels.com'}
              </li>
              <li className="text-brand-light">
                {settings.contactPhone || '+44 7938 065717'}
              </li>
              <li className="text-brand-light text-xs mt-1">
                {settings.contactAddress || 'London, UK'}
              </li>
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