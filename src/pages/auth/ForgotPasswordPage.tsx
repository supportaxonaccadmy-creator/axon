import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '@/lib/auth/authService';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { validateEmail } from '@/utils/authValidation';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const emailResult = validateEmail(email);

    if (!emailResult.valid) {
      setError(emailResult.error);
      return;
    }

    setError(null);
    setLoading(true);
    const { error: forgotError } = await forgotPassword(email);
    setLoading(false);

    if (forgotError) {
      setError(forgotError);
    } else {
      setSuccess(true);
    }
  }

  return (
    <AuthCard>
      <AuthHeader title="Forgot Password" subtitle="Enter your email to receive a reset link" />

      {success ? (
        <Alert variant="success" title="Check your email">
          We&apos;ve sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the
          instructions to reset your password.
        </Alert>
      ) : (
        <>
          {error && (
            <Alert variant="error" className="mb-4">
              {error}
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
              autoComplete="email"
              required
            />
            <Button type="submit" size="lg" fullWidth loading={loading}>
              Send Reset Link
            </Button>
          </form>
        </>
      )}

      <p className="mt-6 text-center text-sm text-neutral-500">
        Remember your password?{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
