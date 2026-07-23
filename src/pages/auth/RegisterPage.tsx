import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { validateEmail, validatePassword, validateConfirmPassword, getPasswordStrength } from '@/utils/authValidation';
import { cn } from '@/utils/cn';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const emailResult = validateEmail(email);
    const passwordResult = validatePassword(password);
    const confirmResult = validateConfirmPassword(password, confirmPassword);

    if (!emailResult.valid || !passwordResult.valid || !confirmResult.valid) {
      const next: { email?: string; password?: string; confirmPassword?: string } = {};
      if (emailResult.error) next.email = emailResult.error;
      if (passwordResult.error) next.password = passwordResult.error;
      if (confirmResult.error) next.confirmPassword = confirmResult.error;
      setErrors(next);
      return;
    }

    setErrors({});
    setLoading(true);
    const { error } = await register(email, password);
    setLoading(false);

    if (error) {
      setErrors({ form: error });
    } else {
      navigate('/', { replace: true });
    }
  }

  const strength = password ? getPasswordStrength(password) : null;
  const strengthColors = { weak: 'bg-error-500', medium: 'bg-warning-500', strong: 'bg-success-500' };
  const strengthLabels = { weak: 'Weak', medium: 'Medium', strong: 'Strong' };

  return (
    <AuthCard>
      <AuthHeader title="Create Account" subtitle="Join the Enterprise Nursing LMS" />

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
        <PasswordInput
          label="Password"
          name="password"
          placeholder="Create a strong password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="new-password"
          required
        />
        {strength && (
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200">
              <div
                className={cn('h-full rounded-full transition-all', strengthColors[strength])}
                style={{ width: strength === 'weak' ? '33%' : strength === 'medium' ? '66%' : '100%' }}
              />
            </div>
            <span className="text-xs font-medium text-neutral-500">{strengthLabels[strength]}</span>
          </div>
        )}
        <PasswordInput
          label="Confirm Password"
          name="confirmPassword"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          autoComplete="new-password"
          required
        />
        <Button type="submit" size="lg" fullWidth loading={loading}>
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
