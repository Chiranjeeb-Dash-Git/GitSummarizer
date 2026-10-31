import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SavedList from '../components/dashboard/SavedList.jsx';
import HistoryList from '../components/dashboard/HistoryList.jsx';
import SummaryActions from '../components/analyzer/SummaryActions.jsx';
import { api } from '../lib/api.js';

vi.mock('../lib/api.js', () => ({ api: { get: vi.fn() } }));
vi.mock('../components/effects/StrataWipe.jsx', () => ({ WipeLink: (props) => <Link {...props} />, useWipeNavigate: () => vi.fn() }));
vi.mock('../hooks/useAuth.js', () => ({ useAuth: () => ({ user: { id: 'user' } }) }));
vi.mock('../components/ui/Dialog.jsx', () => ({ default: ({ open, children }) => open ? children : null }));

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function mount(Component) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}><MemoryRouter><Component /></MemoryRouter></QueryClientProvider>);
}

describe('library API consumers', () => {
  it('loads the existing save before allowing edits and preserves its note', async () => {
    let resolve;
    api.get.mockReturnValue(new Promise((r) => { resolve = r; }));
    mount(() => <SummaryActions summary={{ id: 'summary' }} markdown="Example" saved={null} streaming={false} />);
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    await act(async () => resolve({ data: { saved: { id: 'saved', note: 'Keep my note', tags: ['backend'] } } }));
    fireEvent.click(await screen.findByRole('button', { name: 'Saved' }));
    expect(screen.getByPlaceholderText('Add personal notes or context...')).toHaveValue('Keep my note');
  });

  it('renders saved summaries and tags using the public API response', async () => {
    api.get.mockResolvedValue({ data: [{ id: 'save', summaryId: 'summary', title: 'Architecture', note: '', tags: [], repository: { fullName: 'owner/repo' } }], tags: ['backend'] });
    mount(SavedList);
    expect(await screen.findByRole('link', { name: 'Architecture' })).toHaveAttribute('href', '/r/summary');
    expect(screen.getByRole('button', { name: 'backend' })).toBeInTheDocument();
  });

  it('keeps the history cursor and loads the next page', async () => {
    const row = { id: 'first', summaryId: 's1', createdAt: '2026-10-31T00:00:00Z', repository: { fullName: 'owner/first' } };
    api.get.mockResolvedValueOnce({ data: [row], nextCursor: 'next-page' }).mockResolvedValueOnce({ data: [{ ...row, id: 'second', summaryId: 's2', repository: { fullName: 'owner/second' } }], nextCursor: null });
    let intersect;
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback) { intersect = callback; }
      observe() {}
      disconnect() {}
    });
    try {
      mount(HistoryList);
      await screen.findByRole('link', { name: 'owner/first' });
      await act(async () => intersect([{ isIntersecting: true }]));
      expect(await screen.findByRole('link', { name: 'owner/second' })).toHaveAttribute('href', '/r/s2');
      expect(api.get).toHaveBeenLastCalledWith('/history?limit=20&cursor=next-page');
    } finally { vi.unstubAllGlobals(); }
  });
});
