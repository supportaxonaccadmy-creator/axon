import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resetPassword } from '@/lib/auth/authService';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { validatePassword, validateConfirmPassword, getPasswordStrength } from '@/utils/authValidation';
import { cn } from '@/utils/cn';

export function ResetPasswordPage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const passwordResult = validatePassword(password);
    const confirmResult = validateConfirmPassword(password, confirmPassword);

    if (!passwordResult.valid || !confirmResult.valid) {
      const next: { password?: string; confirmPassword?: string } = {};
      if (passwordResult.error) next.password = passwordResult.error;
      if (confirmResult.error) next.confirmPassword = confirmResult.error;
      setErrors(next);
      return;
    }

    setErrors({});
    setLoading(true);
    const { error: resetError } = await resetPassword(password);
    setLoading(false);

    if (resetError) {
      setErrors({ form: resetError });
    } else {
      navigate('/login', { replace: true });
    }
  }

  const strength = password ? getPasswordStrength(password) : null;
  const strengthColors = { weak: 'bg-error-500', medium: 'bg-warning-500', strong: 'bg-success-500' };
  const strengthLabels = { weak: 'Weak', medium: 'Medium', strong: 'Strong' };

  return (
    <AuthCard>
      <AuthHeader title="Reset Password" subtitle="Enter your new password" />

      {errors.form && (
        <Alert variant="error" className="mb-4">
          {errors.form}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <PasswordInput
          label="New Password"
          name="password"
          placeholder="Enter a strong password"
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
          label="Confirm New Password"
          name="confirmPassword"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          autoComplete="new-password"
          required
        />
        <Button type="submit" size="lg" fullWidth loading={loading}>
          Reset Password
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Remember your password?{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
