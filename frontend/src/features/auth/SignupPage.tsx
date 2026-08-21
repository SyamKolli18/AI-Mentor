import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
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
      
      registerSession(res.data.token, res.data.user, res.data.refreshToken);
      
      toast(res.data.message || 'Account created successfully! Launching onboarding.', 'success');
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
          Create AI Mentor Account
        </h1>
        <p className="text-xs text-slate-400">
          Initialize your student career operating system.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Full Name"
          placeholder="Syam Kolli"
          type="text"
          leftIcon={<User className="h-4 w-4 text-slate-400" />}
          error={errors.name?.message}
          disabled={isLoading}
          {...register('name')}
        />

        <Input
          label="Student Email"
          placeholder="syam@college.edu"
          type="email"
          leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
          error={errors.email?.message}
          disabled={isLoading}
          {...register('email')}
        />

        <Input
          label="Password (min 6 characters)"
          placeholder="••••••••"
          type="password"
          leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
          error={errors.password?.message}
          disabled={isLoading}
          {...register('password')}
        />

        <Button 
          variant="primary" 
          type="submit" 
          isLoading={isLoading} 
          className="w-full h-11 mt-2 bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-crimson-glow"
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Build My Roadmap
        </Button>
      </form>

      <div className="text-center text-xs text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="text-rose-400 hover:text-rose-300 font-bold transition-colors">
          Sign In
        </Link>
      </div>
    </>
  );
};
export default SignupPage;
