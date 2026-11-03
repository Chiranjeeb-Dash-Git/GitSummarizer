import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api.js';
import { neonAuth } from '../lib/auth.js';

export function useAuth() {
  const qc = useQueryClient();

  const me = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      // 1. Check local backend session first
      try {
        const local = await api.get('/auth/me');
        if (local?.data?.user) return local.data.user;
      } catch {
        // fallback to neon session
      }

      // 2. Check Neon Auth managed session
      try {
        const neonSession = await neonAuth.getSession();
        const user = neonSession?.data?.user;
        if (user) {
          return {
            id: user.id,
            email: user.email,
            displayName: user.name || user.email?.split('@')[0],
            neonUser: true,
          };
        }
      } catch {
        // Guest user
      }
      return null;
    },
    staleTime: 5 * 60_000,
    retry: false,
  });

  const login = useMutation({
    mutationFn: async ({ email, password }) => {
      // 1. Attempt sign-in with Neon Auth
      try {
        const res = await neonAuth.signIn.email({ email, password });
        if (res?.data?.user) {
          const u = res.data.user;
          return {
            user: {
              id: u.id,
              email: u.email,
              displayName: u.name || u.email?.split('@')[0],
              neonUser: true,
            },
          };
        }
      } catch (err) {
        // If Neon reports invalid credentials, throw clean message
        if (err?.code === 'invalid_credentials' || err?.message?.toLowerCase().includes('password')) {
          throw new Error('Invalid email or password.');
        }
        // Fallback to local API
      }

      // 2. Fallback to existing backend auth
      const res = await api.post('/auth/login', { email, password });
      return res.data;
    },
    onSuccess: (data) => {
      qc.setQueryData(['me'], data.user);
      qc.invalidateQueries({ queryKey: ['summary'] });
    },
  });

  const register = useMutation({
    mutationFn: async ({ email, password, displayName }) => {
      // Attempt Neon Auth sign-up
      try {
        const res = await neonAuth.signUp.email({
          email,
          password,
          name: displayName || email.split('@')[0],
        });
        if (res?.data?.user) {
          return {
            status: 'pending_verification',
            email,
            neonManaged: true,
            message: 'Verification code sent to your email via Neon.',
          };
        }
      } catch (err) {
        const msg = err?.message || '';
        if (msg.toLowerCase().includes('already exists') || err?.code === 'user_already_exists') {
          const error = new Error('An account with this email already exists.');
          error.code = 'EMAIL_TAKEN';
          throw error;
        }
        // Fallback to local register
      }

      // Fallback to backend registration
      const res = await api.post('/auth/register', { email, password, displayName });
      return res.data;
    },
  });

  const verifyEmail = useMutation({
    mutationFn: async ({ email, code }) => {
      // 1. Try Neon Auth OTP verification
      try {
        const res = await neonAuth.emailOtp.verifyEmail({ email, otp: code });
        if (res?.data?.user) {
          const u = res.data.user;
          return {
            user: {
              id: u.id,
              email: u.email,
              displayName: u.name || u.email?.split('@')[0],
              neonUser: true,
            },
          };
        }
      } catch (err) {
        // Fallback to backend verification
      }

      // 2. Backend verification
      const res = await api.post('/auth/verify-email', { email, code });
      return res.data;
    },
    onSuccess: (data) => {
      qc.setQueryData(['me'], data.user);
      qc.invalidateQueries({ queryKey: ['summary'] });
    },
  });

  const resendCode = useMutation({
    mutationFn: async ({ email }) => {
      try {
        await neonAuth.emailOtp.sendVerificationOtp({ email, type: 'email-verification' });
        return { success: true };
      } catch {
        // Fallback to backend
        return api.post('/auth/resend-code', { email });
      }
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      try {
        await neonAuth.signOut();
      } catch {
        // ignore
      }
      return api.post('/auth/logout').catch(() => null);
    },
    onSuccess: () => {
      qc.setQueryData(['me'], null);
      qc.removeQueries({ predicate: (q) => ['history', 'saved', 'stats', 'summary'].includes(q.queryKey[0]) });
    },
  });

  return {
    user: me.data ?? null,
    loading: me.isPending,
    login,
    register,
    verifyEmail,
    resendCode,
    logout,
  };
}
