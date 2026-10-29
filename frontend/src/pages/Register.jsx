import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { WipeLink, useWipeNavigate } from '../components/effects/StrataWipe.jsx';
import Field from '../components/ui/Field.jsx';
import Button from '../components/ui/Button.jsx';
import StrataBackdrop from '../components/effects/StrataBackdrop.jsx';

export default function Register() {
  const { user, register } = useAuth();
  const location = useLocation();
  const go = useWipeNavigate();
  const [form, setForm] = useState({ displayName: '', email: '', password: '' });
  const target = location.state?.from ?? '/dashboard';

  if (user) return <Navigate to={target} replace />;

  const submit = (e) => {
    e.preventDefault();
    register.mutate(form, { onSuccess: () => go(target, { replace: true }) });
  };

  const err = register.error;
  const fieldError = (name) => {
    if (name === 'email' && err?.code === 'EMAIL_TAKEN') {
      return (
        <span>
          An account with this email already exists.{' '}
          <WipeLink to="/login" className="underline underline-offset-2">
            Sign in instead.
          </WipeLink>
        </span>
      );
    }
    return err?.details?.[name]?.[0];
  };

  return (
    <div className="mx-auto grid min-h-[78vh] max-w-[1280px] lg:grid-cols-2">
      <div className="flex items-center px-5 py-14 md:px-10 xl:px-16">
        <form onSubmit={submit} className="w-full max-w-md" noValidate>
          <h1 className="font-display text-h1 font-extrabold">Create your account</h1>
          <p className="mt-3 text-muted">Save summaries and keep your reading history.</p>
          {err && !err.details && err.code !== 'EMAIL_TAKEN' && (
            <p role="alert" className="mt-6 rounded-field border border-oxide bg-surface px-4 py-3 text-sm font-medium text-oxide">
              {err.message}
            </p>
          )}

          <Field
            className="mt-8"
            label="Name"
            type="text"
            autoComplete="name"
            value={form.displayName}
            error={fieldError('displayName')}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            required
          />

          <Field
            className="mt-5"
            label="Email"
            type="email"
            autoComplete="email"
            value={form.email}
            error={fieldError('email')}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <Field
            className="mt-5"
            label="Password"
            type="password"
            autoComplete="new-password"
            hint="At least 8 characters"
            value={form.password}
            error={fieldError('password')}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <Button type="submit" className="mt-8 w-full" disabled={register.isPending}>
            {register.isPending ? 'Creating account' : 'Create account'}
          </Button>

          <p className="mt-6 text-sm text-muted">
            Already have an account?{' '}
            <WipeLink to="/login" className="font-semibold text-ink underline underline-offset-4">
              Sign in
            </WipeLink>
          </p>
        </form>
      </div>

      <div className="relative hidden border-l border-line lg:block">
        <StrataBackdrop />
        <p className="absolute bottom-10 left-10 right-10 font-display text-3xl font-bold leading-tight">
          Read once, find it again whenever you need it.
        </p>
      </div>
    </div>
  );
}

