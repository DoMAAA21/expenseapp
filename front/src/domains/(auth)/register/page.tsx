import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { RegisterForm, type RegisterFormData } from './_components/register-form';
import { getApiErrorMessage } from '@/lib/http-error';
import http from '@/lib/http';

export default function RegisterPage() {
  const { isAuthenticated, isLoading, refetch } = useAuth();
  const navigate = useNavigate();
  const methods = useForm<RegisterFormData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading && !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(values: RegisterFormData) {
    try {
      await http.post('/auth/register', {
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      refetch();
      toast.success('Account created successfully');
      navigate('/', { replace: true });
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Registration failed. Please try again.'));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-6 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Create account</h1>
          <p className="text-muted-foreground">Sign up to start tracking your finances.</p>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
            <RegisterForm />

            <Button type="submit" className="w-full" disabled={methods.formState.isSubmitting || isLoading}>
              {methods.formState.isSubmitting ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        </FormProvider>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-foreground underline underline-offset-4">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
