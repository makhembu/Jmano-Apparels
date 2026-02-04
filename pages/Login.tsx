
import React, { useState } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const Login: React.FC = () => {
  const { login, signUp, user, loading: authLoading, refreshProfile } = useApp();
  const location = useLocation();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const from = location.state?.from || '/';

  if (authLoading) return <LoadingSpinner fullScreen />;
  if (user) {
    if (user.role === 'admin' && from === '/') return <Navigate to="/admin" replace />;
    return <Navigate to={from} replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setErrorMsg('');
    
    try {
      if (isSignUp) {
        if (!agreedToTerms) throw new Error("You must agree to the terms.");
        await signUp(formData.email, formData.password, formData.name);
      } else {
        await login(formData.email, formData.password);
        await refreshProfile();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-green/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <Card className="border-t-8 border-t-brand-hope shadow-2xl">
          <CardContent className="p-8 sm:p-10 space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-serif font-bold text-brand-dark">
                {isSignUp ? 'Join the Family' : 'Welcome Back'}
              </h2>
              <p className="mt-2 text-sm text-slate-500 font-medium">
                {isSignUp ? 'Thread your faith into every day.' : 'Sign in to access your dashboard.'}
              </p>
            </div>
            
            {errorMsg && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-xs font-bold text-center">
                {errorMsg}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {isSignUp && (
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Simon Peter"
                  required
                />
              )}
              
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                  {!isSignUp && (
                    <Link to="/forgot-password" className="text-xs font-bold text-brand-green hover:text-brand-hope transition-colors">
                      Forgot?
                    </Link>
                  )}
                </div>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                  fullWidth={false}
                  className="w-full"
                  autoComplete="current-password"
                />
              </div>
              
              {isSignUp && (
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-green focus:ring-brand-green"
                  />
                  <span className="text-xs text-slate-500 font-medium">
                    I agree to the <Link to="/terms" className="font-bold text-brand-green hover:underline">Terms</Link> and <Link to="/privacy" className="font-bold text-brand-green hover:underline">Privacy Policy</Link>.
                  </span>
                </label>
              )}

              <Button
                type="submit"
                isLoading={formLoading}
                variant="secondary"
                size="lg"
                fullWidth
                className="shadow-xl"
              >
                {isSignUp ? 'Create My Account' : 'Sign In'}
              </Button>
            </form>

            <div className="text-center pt-4 border-t border-slate-100">
              <button 
                onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); }}
                className="text-sm font-bold text-slate-400 hover:text-brand-dark transition-colors"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Join Us"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
