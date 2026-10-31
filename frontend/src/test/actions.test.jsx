import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SummaryActions from '../components/analyzer/SummaryActions.jsx';
import { api } from '../lib/api.js';

vi.mock('../lib/api.js', () => ({ api: { get: vi.fn() } }));
vi.mock('../hooks/useAuth.js', () => ({ useAuth: () => ({ user: { id: 'user' } }) }));
vi.mock('../components/effects/StrataWipe.jsx', () => ({ useWipeNavigate: () => vi.fn() }));
vi.mock('../lib/toast.js', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it('copies, downloads, shares and refreshes a completed summary', async () => {
  api.get.mockResolvedValue({ data: { saved: null } });
  const writeText = vi.fn().mockResolvedValue();
  vi.stubGlobal('navigator', { clipboard: { writeText } });
  vi.stubGlobal('URL', Object.assign(class extends URL {}, { createObjectURL: vi.fn(() => 'blob:summary'), revokeObjectURL: vi.fn() }));
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  const refresh = vi.fn();
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(<QueryClientProvider client={client}><SummaryActions summary={{ id: 'abc', kind: 'overview', repository: { owner: 'example', name: 'repo' } }} markdown="# Summary" streaming={false} onRefresh={refresh} /></QueryClientProvider>);
  await screen.findByRole('button', { name: 'Save' });
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Copy Markdown' })));
  expect(writeText).toHaveBeenCalledWith('# Summary');
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Copy link' })));
  expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/r/abc`);
  fireEvent.click(screen.getByRole('button', { name: 'Download' }));
  expect(click).toHaveBeenCalledOnce();
  expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:summary');
  fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
  expect(refresh).toHaveBeenCalledOnce();
});
