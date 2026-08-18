import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2 } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

export const ForgotPasswordPage: React.FC = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsLoading(true);
      const res = await api.post('/auth/forgot-password', { email });
      setIsSubmitted(true);
      toast(res.data.message || 'Reset link sent!', 'success');
    } catch (err: any) {
      toast(err.message || 'Failed to send reset link.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col gap-6 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
          <CheckCircle2 className="h-6 w-6 text-emerald-400" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-white">Reset Link Sent</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            If an account exists with <span className="text-white font-semibold">{email}</span>, a link to reset your password has been sent. Please check your inbox and spam folder.
          </p>
        </div>
        <Link to="/login" className="text-primary hover:text-accent text-sm font-semibold transition-colors">
          Return to Sign In
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2 text-center md:text-left">
        <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
          Reset Password
        </h1>
        <p className="text-sm text-slate-400">
          Enter your email address and we'll send you a password reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email Address"
          placeholder="you@college.edu"
          type="email"
          leftIcon={<Mail className="h-4 w-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required
        />

        <Button variant="primary" type="submit" isLoading={isLoading} className="w-full h-11 mt-2">
          Send Reset Link
        </Button>
      </form>

      <div className="text-center text-xs text-slate-400">
        Remember your password?{' '}
        <Link to="/login" className="text-primary hover:text-accent font-semibold transition-colors">
          Sign In
        </Link>
      </div>
    </>
  );
};
export default ForgotPasswordPage;
