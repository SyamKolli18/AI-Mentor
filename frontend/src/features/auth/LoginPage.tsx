import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Mail, Lock } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

// Zod validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
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
      toast(err.message || 'Invalid credentials. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2 text-center md:text-left">
        <h1 className="text-2xl font-extrabold tracking-tight text-stone-50 md:text-3xl">
          Welcome Back
        </h1>
        <p className="text-sm text-stone-300">
          Sign in to resume tracking your career goals.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Email Address"
          placeholder="you@college.edu"
          type="email"
          leftIcon={<Mail className="h-4 w-4 text-stone-400" />}
          error={errors.email?.message}
          disabled={isLoading}
          {...register('email')}
        />

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-stone-200 tracking-wide uppercase select-none">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-orange-400 hover:text-orange-300 font-semibold transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
          <Input
            placeholder="••••••••"
            type="password"
            leftIcon={<Lock className="h-4 w-4 text-stone-400" />}
            error={errors.password?.message}
            disabled={isLoading}
            {...register('password')}
          />
        </div>

        <Button variant="primary" type="submit" isLoading={isLoading} className="w-full h-11 mt-2 bg-orange-500 hover:bg-orange-400 text-white font-bold shadow-glow">
          Sign In
        </Button>
      </form>

      <div className="text-center text-xs text-stone-300">
        Don't have an account?{' '}
        <Link to="/signup" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
          Sign Up
        </Link>
      </div>
    </>
  );
};
export default LoginPage;
