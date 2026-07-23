import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { FormDivider } from '@/components/auth/FormDivider';
import { SocialButton } from '@/components/auth/SocialButton';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { validateEmail, validatePassword } from '@/utils/authValidation';
import { APP_CONFIG } from '@/constants/app';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (!emailError.valid || !passwordError.valid) {
      const next: { email?: string; password?: string } = {};
      if (emailError.error) next.email = emailError.error;
      if (passwordError.error) next.password = passwordError.error;
      setErrors(next);
      return;
    }

    setErrors({});
    setLoading(true);
    const { error } = await login(email, password);
    setLoading(false);

    if (error) {
      setErrors({ form: error });
    } else {
      navigate(from, { replace: true });
    }
  }

  return (
    <AuthCard>
      <AuthHeader title="Welcome Back" subtitle={`Sign in to ${APP_CONFIG.name}`} />

      {errors.form && (
        <Alert variant="error" className="mb-4">
          {errors.form}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Email Address"
          type="email"
          name="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="current-password"
          required
        />
        <div className="flex items-center justify-end">
          <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-700">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" fullWidth loading={loading}>
          Sign In
        </Button>
      </form>

      <FormDivider />

      <div className="space-y-3">
        <SocialButton provider="google" label="Continue with Google" disabled />
      </div>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700">
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}
