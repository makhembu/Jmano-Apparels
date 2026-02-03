
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/db';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const UpdatePassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthReady } = useAuth();

  // Redirect if not authenticated after auth is ready
  useEffect(() => {
    if (isAuthReady && !user) {
        // If auth is initialized and no user, the password reset link might be invalid or expired.
        // However, supabase.auth.onAuthStateChange in App.tsx/AuthContext usually handles the session from the URL hash.
        // If we are here, we expect a user session to be active.
        showToast("Invalid or expired password reset link.", "error");
        navigate('/login');
    }
  }, [isAuthReady, user, navigate, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        showToast("Passwords do not match", "error");
        return;
    }
    if (password.length < 6) {
        showToast("Password must be at least 6 characters", "error");
        return;
    }

    setLoading(true);
    try {
      await api.updateUserPassword(password);
      showToast('Password updated successfully. You are now logged in.', 'success');
      navigate('/dashboard');
    } catch (e: any) {
      showToast(e.message || 'Failed to update password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl border-t-8 border-brand-hope animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-bold text-brand-dark">Set New Password</h2>
          <p className="mt-3 text-sm text-slate-500 font-medium">
            Secure your account with a new password.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
            <input
              type="password"
              required
              className="w-full border-2 border-slate-100 bg-slate-50 rounded-xl p-4 text-sm font-bold text-slate-900 focus:bg-white focus:ring-0 focus:border-brand-hope outline-none transition-all placeholder:font-normal"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm Password</label>
            <input
              type="password"
              required
              className="w-full border-2 border-slate-100 bg-slate-50 rounded-xl p-4 text-sm font-bold text-slate-900 focus:bg-white focus:ring-0 focus:border-brand-hope outline-none transition-all placeholder:font-normal"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            isLoading={loading}
            fullWidth
            className="h-14 rounded-2xl bg-brand-hope text-brand-dark font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-hope/20 hover:bg-brand-dark hover:text-white transition-all"
          >
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
};
