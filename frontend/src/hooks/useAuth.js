import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api.js';

export function useAuth() {
  const qc = useQueryClient();

  const me = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me').then((r) => r.data.user),
    staleTime: 5 * 60_000,
    retry: false,
  });

  const login = useMutation({
    mutationFn: (body) => api.post('/auth/login', body),
    onSuccess: (r) => qc.setQueryData(['me'], r.data.user),
  });

  const register = useMutation({
    mutationFn: (body) => api.post('/auth/register', body),
    onSuccess: (r) => qc.setQueryData(['me'], r.data.user),
  });

  const logout = useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSuccess: () => {
      qc.setQueryData(['me'], null);
      qc.removeQueries({ predicate: (q) => ['history', 'saved', 'stats'].includes(q.queryKey[0]) });
    },
  });

  return { user: me.data ?? null, loading: me.isPending, login, register, logout };
}

