import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const { checkSession } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setStatus('error');
        setErrorMsg('Email verification token is missing in URL.');
        return;
      }

      try {
        const res = await api.post('/auth/verify-email', { token });
        setStatus('success');
        toast(res.data.message || 'Email verified successfully!', 'success');
        
        // Refresh session to get updated isVerified status
        await checkSession();
      } catch (err: any) {
        setStatus('error');
        setErrorMsg(err.message || 'Verification link is invalid or expired.');
      }
    };

    performVerification();
  }, [token]);

  return (
    <div className="flex flex-col gap-6 text-center">
      {status === 'loading' && (
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <h2 className="text-xl font-bold text-white">Verifying your email</h2>
          <p className="text-sm text-slate-400">Please wait while we activate your account.</p>
        </div>
      )}

      {status === 'success' && (
        <>
          <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 animate-bounce">
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold text-white">Email Verified!</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your email has been verified. You can now access all personalized features and build your path.
            </p>
          </div>
          <Button variant="primary" onClick={() => navigate('/dashboard')} className="w-full">
            Go to Dashboard
          </Button>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="mx-auto h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
            <AlertTriangle className="h-6 w-6 text-rose-400" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold text-white">Verification Failed</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              {errorMsg}
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/login')} className="w-full">
            Back to Sign In
          </Button>
        </>
      )}
    </div>
  );
};
export default VerifyEmailPage;
