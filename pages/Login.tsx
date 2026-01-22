import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';

export const Login: React.FC = () => {
  const { login, signUp, user } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
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
        alert("Account created! Please check your email for verification link (if enabled) or sign in.");
        setIsSignUp(false);
      } else {
        await login(email, password);
        // Explicitly navigate after successful login to ensure state is handled
        // Note: The auth state change might trigger the top-level redirect before this line runs, 
        // which is handled by the <Navigate> check above, but this provides a fallback.
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-light py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border-t-4 border-brand-green animate-fade-in">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 font-serif">
            {isSignUp ? 'Join the Family' : 'Welcome Back'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isSignUp ? 'Create an account to track your orders.' : 'Sign in to access your dashboard.'}
          </p>
          {location.state?.from && (
             <p className="mt-2 text-center text-xs text-brand-green bg-green-50 p-1 rounded">
                Please sign in to continue to {location.state.from.replace('/', '')}.
             </p>
          )}
        </div>
        
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm text-center">
            {errorMsg}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {isSignUp && (
              <div>
                <label htmlFor="name" className="sr-only">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-brand-green focus:border-brand-green focus:z-10 sm:text-sm bg-white"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${!isSignUp ? 'rounded-t-md' : ''} focus:outline-none focus:ring-brand-green focus:border-brand-green focus:z-10 sm:text-sm bg-white`}
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-brand-green focus:border-brand-green focus:z-10 sm:text-sm bg-white"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              isLoading={loading}
              fullWidth
              variant="primary"
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </div>
        </form>

        <div className="text-center">
          <button 
            onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); }}
            className="text-sm text-brand-green hover:text-brand-dark font-medium focus:outline-none underline"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};