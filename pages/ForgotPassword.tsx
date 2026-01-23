
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/db';
import { Button } from '../components/ui/Button';
import { BackButton } from '../components/ui/BackButton';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await api.requestPasswordReset(email);
      setSuccess(true);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 text-center animate-fade-in">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">Check your email</h2>
          <p className="text-sm text-slate-600 mb-8">
            We have sent a password recover link to <strong>{email}</strong>. Please click the link to reset your password.
          </p>
          <Link to="/login">
            <Button variant="outline" fullWidth className="h-12 rounded-xl">Back to Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 animate-fade-in relative">
        <div className="absolute top-6 left-6">
           <BackButton to="/login" />
        </div>
        
        <div className="text-center mt-8">
          <h2 className="text-3xl font-serif font-bold text-slate-900">Forgot Password?</h2>
          <p className="mt-3 text-sm text-slate-500">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-xs font-bold text-center mt-6 animate-shake">
            {errorMsg}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              required
              className="w-full border border-slate-200 bg-slate-50 rounded-xl p-4 text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            isLoading={loading}
            fullWidth
            className="h-14 rounded-2xl font-bold uppercase tracking-wider text-xs shadow-xl shadow-brand-green/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Send Reset Link
          </Button>
        </form>
      </div>
    </div>
  );
};
