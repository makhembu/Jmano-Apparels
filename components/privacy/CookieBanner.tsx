
import React, { useState } from 'react';
import { useConsent, ConsentSettings } from '../../context/CookieConsentContext';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';

export const CookieBanner: React.FC = () => {
  const { isBannerOpen, acceptAll, saveConsent } = useConsent();
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<ConsentSettings>({
    necessary: true,
    analytics: false,
    marketing: false
  });

  if (!isBannerOpen) return null;

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-4 md:p-6 animate-slide-in">
      <div className="max-w-7xl mx-auto">
        {!showDetails ? (
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-serif font-bold text-brand-dark mb-2">We value your privacy</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                We use cookies to enhance your experience, analyze site traffic, and deliver relevant content. 
                By clicking "Accept All", you consent to our use of cookies. 
                Read our <Link to="/privacy" className="underline text-brand-green hover:text-brand-dark">Privacy Policy</Link> and <Link to="/cookies" className="underline text-brand-green hover:text-brand-dark">Cookie Policy</Link>.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button 
                onClick={() => setShowDetails(true)}
                className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors"
              >
                Preferences
              </button>
              <Button onClick={acceptAll} className="shadow-lg shadow-brand-green/20 whitespace-nowrap">
                Accept All
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-serif font-bold text-brand-dark">Cookie Preferences</h3>
              <p className="text-sm text-slate-500">Manage your consent settings below.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 opacity-70">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-900 text-sm">Necessary</span>
                  <input type="checkbox" checked disabled className="text-brand-green rounded focus:ring-brand-green cursor-not-allowed" />
                </div>
                <p className="text-xs text-slate-500">Required for the website to function (e.g. cart, login). Cannot be disabled.</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-900 text-sm">Analytics</span>
                  <input 
                    type="checkbox" 
                    checked={preferences.analytics} 
                    onChange={(e) => setPreferences(p => ({...p, analytics: e.target.checked}))}
                    className="text-brand-green rounded focus:ring-brand-green cursor-pointer w-5 h-5" 
                  />
                </div>
                <p className="text-xs text-slate-500">Helps us understand how you use the site so we can improve it (Google Analytics).</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-900 text-sm">Marketing</span>
                  <input 
                    type="checkbox" 
                    checked={preferences.marketing} 
                    onChange={(e) => setPreferences(p => ({...p, marketing: e.target.checked}))}
                    className="text-brand-green rounded focus:ring-brand-green cursor-pointer w-5 h-5" 
                  />
                </div>
                <p className="text-xs text-slate-500">Used to deliver relevant advertisements and track campaign performance.</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button 
                onClick={() => setShowDetails(false)}
                className="px-6 py-3 text-xs font-bold text-slate-500 hover:text-slate-800 uppercase tracking-widest"
              >
                Back
              </button>
              <Button onClick={handleSavePreferences} variant="secondary">
                Save Preferences
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
