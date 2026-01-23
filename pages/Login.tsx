import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';

export const Login: React.FC = () => {
  const { login, signUp, user } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Default to false (Sign In)
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Destination path (defaults to home if not specified)
  const from = location.state?.from || '/';

  // If user is already logged in, redirect immediately
  if (user) return <Navigate to={from} replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    try {
      if (isSignUp) {
        await signUp(email, password, name);
        // If signup is successful, the AuthContext should handle the profile sync and state change
      } else {
        await login(email, password);
        // Note: successful login triggers redirection via the user effect or manual navigate
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      console.error("Form submission error:", err);
      // Detailed error messages already handled by Toasts in AuthContext, 
      // but we show them here for form-specific focus
      setErrorMsg(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 animate-fade-in">
        <div className="text-center">
          <img src="https://i.imgur.com/pkaScEv.png" className="h-10 mx-auto mb-8" alt="Jambo" />
          <h2 className="text-4xl font-serif font-bold text-slate-900">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            {isSignUp ? 'Join our community to start your journey.' : 'Sign in to access your dashboard and orders.'}
          </p>
          {location.state?.from && (
             <div className="mt-4 inline-block px-4 py-1.5 bg-brand-light/50 rounded-full border border-brand-green/10">
                <p className="text-[10px] font-black text-brand-green uppercase tracking-widest">
                   Sign in to continue to Checkout
                </p>
             </div>
          )}
        </div>
        
        {errorMsg && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-xs font-bold text-center animate-shake">
            {errorMsg}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {isSignUp && (
              <div className="animate-fade-in">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl p-4 text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all"
                  placeholder="Simon Peter"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                autoComplete="email"
                required
                className="w-full border border-slate-200 bg-slate-50 rounded-xl p-4 text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                autoComplete="current-password"
                required
                className="w-full border border-slate-200 bg-slate-50 rounded-xl p-4 text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              isLoading={loading}
              fullWidth
              className="h-14 rounded-2xl font-bold uppercase tracking-wider text-xs shadow-xl shadow-brand-green/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              {isSignUp ? 'Create My Account' : 'Sign In'}
            </Button>
          </div>
        </form>

        <div className="text-center">
          <button 
            onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); }}
            className="text-sm font-medium text-slate-500 hover:text-brand-green transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};