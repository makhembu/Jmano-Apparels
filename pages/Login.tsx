import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';

export const Login: React.FC = () => {
  const { login, signUp, user, settings } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Default to false (Sign In)
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
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
        if (!agreedToTerms) {
          setErrorMsg("You must agree to the terms and privacy policy to sign up.");
          setLoading(false);
          return;
        }
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
    <div className="min-h-screen flex items-center justify-center bg-brand-dark py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-green/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-brand-hope/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full space-y-8 bg-white p-6 sm:p-10 rounded-3xl shadow-2xl shadow-black/20 border-t-8 border-brand-hope animate-fade-in relative z-10">
        <div className="text-center">
          {/* Logo removed */}
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brand-dark mt-4">
            {isSignUp ? 'Join the Family' : 'Welcome Back'}
          </h2>
          <p className="mt-3 text-sm text-slate-500 font-medium">
            {isSignUp ? 'Thread your faith into every day.' : 'Sign in to access your dashboard.'}
          </p>
          {location.state?.from && (
             <div className="mt-4 inline-block px-4 py-1.5 bg-brand-light rounded-full border border-brand-green/20">
                <p className="text-[10px] font-black text-brand-dark uppercase tracking-widest">
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
                  className="w-full border-2 border-slate-100 bg-slate-50 rounded-xl p-4 text-sm font-bold text-slate-900 focus:bg-white focus:ring-0 focus:border-brand-hope outline-none transition-all placeholder:font-normal"
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
                className="w-full border-2 border-slate-100 bg-slate-50 rounded-xl p-4 text-sm font-bold text-slate-900 focus:bg-white focus:ring-0 focus:border-brand-hope outline-none transition-all placeholder:font-normal"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                {!isSignUp && (
                  <Link to="/forgot-password" className="text-xs font-bold text-brand-green hover:text-brand-hope transition-colors">
                    Forgot Password?
                  </Link>
                )}
              </div>
              <input
                type="password"
                autoComplete="current-password"
                required
                className="w-full border-2 border-slate-100 bg-slate-50 rounded-xl p-4 text-sm font-bold text-slate-900 focus:bg-white focus:ring-0 focus:border-brand-hope outline-none transition-all placeholder:font-normal"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          {isSignUp && (
            <div className="flex items-start animate-fade-in">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 accent-brand-green focus:ring-brand-green"
                />
              </div>
              <div className="ml-3 text-xs">
                <label htmlFor="terms" className="text-slate-500 font-medium">
                  I agree to the{' '}
                  <Link to="/terms" target="_blank" rel="noopener noreferrer" className="font-bold text-brand-green hover:text-brand-dark">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="font-bold text-brand-green hover:text-brand-dark">
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-brand-hope text-brand-dark rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-hope/20 hover:bg-brand-dark hover:text-white hover:shadow-brand-dark/20 transform hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Processing...
                </span>
              ) : (
                isSignUp ? 'Create My Account' : 'Sign In'
              )}
            </button>
          </div>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <button 
            onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); }}
            className="text-sm font-bold text-slate-400 hover:text-brand-dark transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Join Us"}
          </button>
        </div>
      </div>
    </div>
  );
};