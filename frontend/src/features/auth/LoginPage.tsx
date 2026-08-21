import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login: setSession } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: async (data) => {
      try {
        const validated = loginSchema.parse(data);
        return { values: validated, errors: {} };
      } catch (err: any) {
        const fieldErrors: any = {};
        if (err.errors) {
          err.errors.forEach((e: any) => {
            const path = e.path[0];
            fieldErrors[path] = { message: e.message };
          });
        }
        return { values: {}, errors: fieldErrors };
      }
    },
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      const res = await api.post('/auth/login', data);
      
      setSession(res.data.token, res.data.user, res.data.refreshToken);
      
      toast('Welcome back to AI Mentor!', 'success');
      
      if (res.data.user.isOnboarded) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    } catch (err: any) {
      toast(err.message || 'Invalid email or password.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2 text-center md:text-left">
        <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
          Sign In to AI Mentor
        </h1>
        <p className="text-xs text-slate-400">
          Enter your registered email and password to resume your career roadmap.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Student Email"
          placeholder="student@college.edu"
          type="email"
          leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
          error={errors.email?.message}
          disabled={isLoading}
          {...register('email')}
        />

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] font-bold text-slate-300 tracking-wider uppercase select-none">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
          <Input
            placeholder="••••••••"
            type="password"
            leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
            error={errors.password?.message}
            disabled={isLoading}
            {...register('password')}
          />
        </div>

        <Button 
          variant="primary" 
          type="submit" 
          isLoading={isLoading} 
          className="w-full h-11 mt-2 bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-crimson-glow"
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Sign In
        </Button>
      </form>

      <div className="text-center text-xs text-slate-400">
        Don't have an AI Mentor account?{' '}
        <Link to="/signup" className="text-rose-400 hover:text-rose-300 font-bold transition-colors">
          Create Account
        </Link>
      </div>
    </>
  );
};
export default LoginPage;
