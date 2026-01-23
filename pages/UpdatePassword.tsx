
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
  const { user } = useAuth();

  // If no user session is detected (which should exist if they clicked a valid recovery link), redirect.
  // We'll give it a slight delay to allow session hydration.
  useEffect(() => {
    const timer = setTimeout(() => {
        if (!user && !loading) {
            // Uncommenting this might be too aggressive if auth takes time to load.
            // For now, we rely on the user being on this page due to the AuthEventHandler redirection.
        }
    }, 2000);
    return () => clearTimeout(timer);
  }, [user, loading]);

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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-bold text-slate-900">Set New Password</h2>
          <p className="mt-3 text-sm text-slate-500">
            Secure your account with a new password.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
            <input
              type="password"
              required
              className="w-full border border-slate-200 bg-slate-50 rounded-xl p-4 text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all"
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
              className="w-full border border-slate-200 bg-slate-50 rounded-xl p-4 text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            isLoading={loading}
            fullWidth
            className="h-14 rounded-2xl font-bold uppercase tracking-wider text-xs shadow-xl shadow-brand-green/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
};
