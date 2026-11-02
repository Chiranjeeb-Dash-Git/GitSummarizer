import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api.js';

export function useRepoPreview(input) {
  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebounced(input.trim()), 450);
    return () => clearTimeout(t);
  }, [input]);

  const enabled = debounced.length >= 3 && /[\w.-]+\/[\w.-]+/.test(debounced);

  const query = useQuery({
    queryKey: ['preview', debounced],
    enabled,
    retry: false,
    staleTime: 5 * 60_000,
    queryFn: ({ signal }) =>
      api.get(`/repos/preview?input=${encodeURIComponent(debounced)}`, { signal }).then((r) => r.data),
  });
  // Ignore the previous result while the next input is being debounced.
  return debounced === input.trim() ? query : { ...query, data: undefined, error: null, isPending: true };
}

