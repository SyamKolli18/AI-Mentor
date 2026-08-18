import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Mail, Lock, User } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

// Zod validation schema
const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup: registerSession } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: async (data) => {
      // Inline custom/zod validation to avoid dependency resolving quirks
      try {
        const validated = signupSchema.parse(data);
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
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    try {
      setIsLoading(true);
      const res = await api.post('/auth/signup', data);
      
      // Store credentials
      registerSession(res.data.token, res.data.user);
      
      toast(res.data.message || 'Verification email has been sent! Check your inbox.', 'success');
      navigate('/onboarding');
    } catch (err: any) {
      toast(err.message || 'Signup failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2 text-center md:text-left">
        <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
          Create an Account
        </h1>
        <p className="text-sm text-slate-400">
          Enter your credentials to launch your learning journey.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Full Name"
          placeholder="Enter your name"
          type="text"
          leftIcon={<User className="h-4 w-4" />}
          error={errors.name?.message}
          disabled={isLoading}
          {...register('name')}
        />

        <Input
          label="Email Address"
          placeholder="you@college.edu"
          type="email"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          disabled={isLoading}
          {...register('email')}
        />

        <Input
          label="Password"
          placeholder="••••••••"
          type="password"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          disabled={isLoading}
          {...register('password')}
        />

        <Button variant="primary" type="submit" isLoading={isLoading} className="w-full h-11 mt-2">
          Sign Up
        </Button>
      </form>

      <div className="text-center text-xs text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="text-primary hover:text-accent font-semibold transition-colors">
          Sign In
        </Link>
      </div>
    </>
  );
};
export default SignupPage;
