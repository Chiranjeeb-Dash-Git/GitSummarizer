import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Clock, Mail, ShieldAlert } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { WipeLink, useWipeNavigate } from '../components/effects/StrataWipe.jsx';
import Field from '../components/ui/Field.jsx';
import Button from '../components/ui/Button.jsx';
import StrataBackdrop from '../components/effects/StrataBackdrop.jsx';
import { toast } from '../lib/toast.js';

export default function Register() {
  const { user, register, verifyEmail, resendCode } = useAuth();
  const location = useLocation();
  const go = useWipeNavigate();
  const [form, setForm] = useState({ displayName: '', email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [countdown, setCountdown] = useState(60);
  const [devOtpHint, setDevOtpHint] = useState(null);
  const target = location.state?.from ?? '/dashboard';

  useEffect(() => {
    let timer;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (user) return <Navigate to={target} replace />;

  const submitRegister = (e) => {
    e.preventDefault();
    register.mutate(form, {
      onSuccess: (res) => {
        setStep('otp');
        setCountdown(60);
        if (res.data?.code) {
          setDevOtpHint(res.data.code);
        } else {
          setDevOtpHint(null);
        }
        toast.success(`Verification code dispatched for ${form.email}`);
      },
    });
  };

  const submitOtp = (e) => {
    e.preventDefault();
    if (otp.trim().length !== 6) return;
    verifyEmail.mutate(
      { email: form.email, code: otp.trim() },
      {
        onSuccess: () => {
          toast.success('Email verified successfully! Welcome to GitSummarizer.');
          go(target, { replace: true });
        },
      },
    );
  };

  const handleResend = () => {
    if (countdown > 0) return;
    resendCode.mutate(
      { email: form.email },
      {
        onSuccess: (res) => {
          setCountdown(60);
          if (res.data?.code) setDevOtpHint(res.data.code);
          toast.success('A fresh verification code has been dispatched.');
        },
        onError: (err) => {
          toast.error(err.message || 'Could not resend code.');
        },
      },
    );
  };

  const regErr = register.error;
  const otpErr = verifyEmail.error;

  const fieldError = (name) => {
    if (name === 'email' && regErr?.code === 'EMAIL_TAKEN') {
      return (
        <span>
          An account with this email already exists.{' '}
          <WipeLink to="/login" className="underline underline-offset-2">
            Sign in instead.
          </WipeLink>
        </span>
      );
    }
    return regErr?.details?.[name]?.[0];
  };

  return (
    <div className="mx-auto grid min-h-[78vh] max-w-[1280px] lg:grid-cols-2">
      <div className="flex items-center px-5 py-14 md:px-10 xl:px-16">
        {step === 'form' ? (
          <form onSubmit={submitRegister} className="w-full max-w-md" noValidate>
            <h1 className="font-display text-h1 font-extrabold">Create your account</h1>
            <p className="mt-3 text-muted">Save summaries and keep your reading history.</p>
            {regErr && !regErr.details && regErr.code !== 'EMAIL_TAKEN' && (
              <p role="alert" className="mt-6 rounded-field border border-oxide bg-surface px-4 py-3 text-sm font-medium text-oxide">
                {regErr.message}
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
              {register.isPending ? 'Sending verification code...' : 'Continue with verification'}
            </Button>

            <p className="mt-6 text-sm text-muted">
              Already have an account?{' '}
              <WipeLink to="/login" className="font-semibold text-ink underline underline-offset-4">
                Sign in
              </WipeLink>
            </p>
          </form>
        ) : (
          <form onSubmit={submitOtp} className="w-full max-w-md animate-fade-in" noValidate>
            <button
              type="button"
              onClick={() => setStep('form')}
              className="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted hover:text-ink transition-colors"
            >
              <ArrowLeft size={14} /> Back to details
            </button>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line-strong bg-surface-2 text-malachite mb-4">
              <Mail size={24} />
            </div>

            <h1 className="font-display text-2xl font-extrabold tracking-tight">Verify your email</h1>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              We dispatched a 6-digit confirmation code for <strong className="font-semibold text-ink">{form.email}</strong>.
            </p>

            {devOtpHint && (
              <div className="mt-4 rounded-field border border-ochre/40 bg-surface-2 p-3 text-xs leading-relaxed text-ink">
                <div className="flex items-center gap-1.5 font-bold text-ochre mb-1">
                  <ShieldAlert size={15} />
                  <span>Resend Test Domain Notice</span>
                </div>
                <p className="text-muted">
                  Resend's free trial domain only delivers to your account address (<code className="text-ochre">chiranjeeb.email@gmail.com</code>).
                  For other emails, your code is provided below:
                </p>
                <div className="mt-2 flex items-center justify-between rounded bg-paper px-3 py-1.5 font-mono font-bold text-malachite text-sm">
                  <span>Code: {devOtpHint}</span>
                  <button
                    type="button"
                    onClick={() => setOtp(devOtpHint)}
                    className="text-xs font-sans text-ink underline hover:text-malachite"
                  >
                    Auto-fill
                  </button>
                </div>
              </div>
            )}

            {otpErr && (
              <p role="alert" className="mt-5 rounded-field border border-oxide bg-surface px-4 py-3 text-sm font-medium text-oxide">
                {otpErr.message}
              </p>
            )}

            <div className="mt-6">
              <label htmlFor="otp-input" className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                6-Digit Verification Code
              </label>
              <input
                id="otp-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                autoFocus
                className="h-14 w-full rounded-field border border-line-strong bg-surface px-4 text-center font-mono text-2xl tracking-[0.4em] font-bold text-ink placeholder:text-muted/40 focus:border-malachite focus:outline-none"
              />
            </div>

            <Button
              type="submit"
              className="mt-6 w-full"
              disabled={otp.length !== 6 || verifyEmail.isPending}
            >
              {verifyEmail.isPending ? 'Verifying...' : 'Verify & Enter GitSummarizer'}
            </Button>

            <div className="mt-6 flex items-center justify-between text-xs text-muted">
              <span>Didn't receive the email?</span>
              <button
                type="button"
                onClick={handleResend}
                disabled={countdown > 0 || resendCode.isPending}
                className="font-semibold text-ink underline underline-offset-4 disabled:opacity-40 disabled:no-underline"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
              </button>
            </div>
          </form>
        )}
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
