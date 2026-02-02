import React from 'react';
// @ts-ignore
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { BackButton } from '../components/ui/BackButton';

export const Terms: React.FC = () => {
  const { settings } = useApp();
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      <BackButton className="mb-6" />
      <h1 className="text-3xl font-serif font-bold mb-6 text-brand-dark">Terms & Conditions</h1>
      <div className="prose max-w-none whitespace-pre-wrap font-light text-gray-700">
         {settings.termsConditions || (
           <p>Welcome to Jambo Apparels. Please check back later for our full terms and conditions.</p>
         )}
      </div>
      <div className="mt-8 border-t pt-4">
        <Link to="/" className="text-brand-green hover:underline">Back to Home</Link>
      </div>
    </div>
  );
};

export const Privacy: React.FC = () => {
  const { settings } = useApp();
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      <BackButton className="mb-6" />
      <h1 className="text-3xl font-serif font-bold mb-6 text-brand-dark">Privacy Policy</h1>
      <div className="prose max-w-none whitespace-pre-wrap font-light text-gray-700">
        {settings.privacyPolicy || (
          <p>We are committed to protecting your privacy. Policy details coming soon.</p>
        )}
      </div>
    </div>
  );
};

export const Cookies: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
    <BackButton className="mb-6" />
    <h1 className="text-3xl font-serif font-bold mb-6 text-brand-dark">Cookie Policy</h1>
    <p className="mb-4">We use cookies to ensure the basic functionality of our website, such as keeping you logged in and maintaining your shopping cart.</p>
    <h2 className="text-xl font-bold mt-6 mb-2 text-brand-green">Essential Cookies</h2>
    <p className="mb-4">These are necessary for the website to function and cannot be switched off.</p>
  </div>
);

export const Returns: React.FC = () => {
  const { settings } = useApp();
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      <BackButton className="mb-6" />
      <h1 className="text-3xl font-serif font-bold mb-6 text-brand-dark">Returns & Refund Policy</h1>
      <div className="prose max-w-none whitespace-pre-wrap font-light text-gray-700">
        {settings.returnPolicy || (
          <p>We want you to be blessed by your purchase. Standard return window is 30 days.</p>
        )}
      </div>
    </div>
  );
};