
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/db';
import { Button } from '../components/ui/Button';
import { BackButton } from '../components/ui/BackButton';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';

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
      <div className="min-h-screen flex items-center justify-center bg-brand-dark py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full border-t-8 border-brand-green">
          <CardContent className="p-10 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-serif font-bold text-brand-dark mb-4">Check your email</h2>
            <p className="text-sm text-slate-600 mb-8 font-medium">
              We have sent a password recover link to <strong>{email}</strong>. Please click the link to reset your password.
            </p>
            <Link to="/login">
              <Button fullWidth variant="secondary">Back to Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-24 left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="mb-6">
           <BackButton to="/login" className="text-white hover:text-brand-hope" />
        </div>
        
        <Card className="border-t-8 border-brand-hope shadow-2xl">
          <CardContent className="p-10">
            <div className="text-center mt-2">
              <h2 className="text-3xl font-serif font-bold text-brand-dark">Forgot Password?</h2>
              <p className="mt-3 text-sm text-slate-500 font-medium">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {errorMsg && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-xs font-bold text-center mt-6">
                {errorMsg}
              </div>
            )}

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <Input
                label="Email Address"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Button
                type="submit"
                isLoading={loading}
                fullWidth
                size="lg"
                variant="secondary"
              >
                Send Reset Link
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
