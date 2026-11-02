import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRepoPreview } from '../hooks/useRepoPreview.js';
import { api } from '../lib/api.js';

vi.mock('../lib/api.js', () => ({ api: { get: vi.fn() } }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

it('does not expose a prior commit preview while a new repository input is debounced', async () => {
  api.get.mockResolvedValueOnce({ data: { parsed: { type: 'commit' }, repository: { fullName: 'one/repo' } } })
    .mockResolvedValueOnce({ data: { parsed: { type: 'repo' }, repository: { fullName: 'two/repo' } } });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  const { result, rerender } = renderHook(({ input }) => useRepoPreview(input), { initialProps: { input: 'one/repo/commit/a3f9c21' }, wrapper });
  await waitFor(() => expect(result.current.data?.parsed.type).toBe('commit'));
  rerender({ input: 'two/repo' });
  expect(result.current.data).toBeUndefined();
  await waitFor(() => expect(result.current.data?.parsed.type).toBe('repo'));
});
