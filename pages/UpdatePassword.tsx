
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/db';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

export const UpdatePassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthReady } = useAuth();

  useEffect(() => {
    if (isAuthReady && !user) {
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
      <Card className="max-w-md w-full border-t-8 border-brand-hope shadow-2xl">
        <CardContent className="p-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-brand-dark">Set New Password</h2>
            <p className="mt-3 text-sm text-slate-500 font-medium">
              Secure your account with a new password.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="New Password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              label="Confirm Password"
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <Button
              type="submit"
              isLoading={loading}
              fullWidth
              size="lg"
              variant="secondary"
            >
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
