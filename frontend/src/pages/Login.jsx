import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { WipeLink, useWipeNavigate } from '../components/effects/StrataWipe.jsx';
import Field from '../components/ui/Field.jsx';
import Button from '../components/ui/Button.jsx';
import StrataBackdrop from '../components/effects/StrataBackdrop.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const location = useLocation();
  const go = useWipeNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const target = location.state?.from ?? '/dashboard';

  if (user) return <Navigate to={target} replace />;

  const submit = (e) => {
    e.preventDefault();
    login.mutate(form, { onSuccess: () => go(target, { replace: true }) });
  };

  const err = login.error;
  const fieldError = (name) => err?.details?.[name]?.[0];

  return (
    <div className="mx-auto grid min-h-[78vh] max-w-[1280px] lg:grid-cols-2">
      <div className="flex items-center px-5 py-14 md:px-10 xl:px-16">
        <form onSubmit={submit} className="w-full max-w-md" noValidate>
          <h1 className="font-display text-h1 font-extrabold">Sign in</h1>
          <p className="mt-3 text-muted">Pick up where you left off.</p>
          {err && !err.details && (
            <p role="alert" className="mt-6 rounded-field border border-oxide bg-surface px-4 py-3 text-sm font-medium text-oxide">{err.message}</p>
          )}
          <Field className="mt-8" label="Email" type="email" autoComplete="email" value={form.email} error={fieldError('email')}
            onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Field className="mt-5" label="Password" type="password" autoComplete="current-password" value={form.password} error={fieldError('password')}
            onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <Button type="submit" className="mt-8 w-full" disabled={login.isPending}>{login.isPending ? 'Signing in' : 'Sign in'}</Button>
          <p className="mt-6 text-sm text-muted">
            New here? <WipeLink to="/register" className="font-semibold text-ink underline underline-offset-4">Create an account</WipeLink>
          </p>
        </form>
      </div>
      <div className="relative hidden border-l border-line lg:block">
        <StrataBackdrop />
        <p className="absolute bottom-10 left-10 right-10 font-display text-3xl font-bold leading-tight">
          Every repository you read stays here, ready to reopen.
        </p>
      </div>
    </div>
  );
}

