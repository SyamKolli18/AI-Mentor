import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, CheckCircle2 } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast('Reset token is missing from URL.', 'error');
      return;
    }

    if (password.length < 6) {
      toast('Password must be at least 6 characters.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      toast('Passwords do not match.', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.post('/auth/reset-password', { token, password });
      setIsSuccess(true);
      toast(res.data.message || 'Password reset successfully!', 'success');
    } catch (err: any) {
      toast(err.message || 'Failed to reset password. Link might be expired.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col gap-6 text-center">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-white">Invalid Reset Link</h2>
          <p className="text-sm text-slate-400">
            This password reset link is invalid, incomplete, or broken. Please request a new link.
          </p>
        </div>
        <Link to="/forgot-password" className="text-primary hover:text-accent text-sm font-semibold transition-colors">
          Request Reset Link
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col gap-6 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
          <CheckCircle2 className="h-6 w-6 text-emerald-400" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-white">Password Updated</h2>
          <p className="text-sm text-slate-400">
            Your password has been changed successfully. You can now sign in using your new password.
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/login')} className="w-full">
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2 text-center md:text-left">
        <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
          Choose New Password
        </h1>
        <p className="text-sm text-slate-400">
          Please enter and confirm your new secure account password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="New Password"
          placeholder="••••••••"
          type="password"
          leftIcon={<Lock className="h-4 w-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          required
        />

        <Input
          label="Confirm Password"
          placeholder="••••••••"
          type="password"
          leftIcon={<Lock className="h-4 w-4" />}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
          required
        />

        <Button variant="primary" type="submit" isLoading={isLoading} className="w-full h-11 mt-2">
          Update Password
        </Button>
      </form>
    </>
  );
};
export default ResetPasswordPage;
