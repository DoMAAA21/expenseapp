import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EMAIL_REGEX } from '@/constants/regex';

export  function LoginForm() {
  const {
    register,
    formState: { errors },
  } = useFormContext<{
    email: string;
    password: string;
  }>();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: EMAIL_REGEX,
              message: 'Invalid email address',
            },
          })}
          aria-invalid={errors.email ? 'true' : 'false'}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters',
            },
          })}
          aria-invalid={errors.password ? 'true' : 'false'}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>
    </div>
  );
}
