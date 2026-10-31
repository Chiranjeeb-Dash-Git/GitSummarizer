import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AnalyzerForm from '../components/analyzer/AnalyzerForm.jsx';
import RepoPreview from '../components/analyzer/RepoPreview.jsx';
import Read from '../pages/Read.jsx';

const mocks = vi.hoisted(() => ({ start: vi.fn(), cancel: vi.fn(), state: null, preview: {} }));
vi.mock('../hooks/useRepoPreview.js', () => ({ useRepoPreview: () => mocks.preview }));
vi.mock('../hooks/useAnalyze.js', () => ({ useAnalyze: () => ({ state: mocks.state, start: mocks.start, cancel: mocks.cancel }) }));
vi.mock('../hooks/useAuth.js', () => ({ useAuth: () => ({ user: { id: 'user' } }) }));
vi.mock('../components/analyzer/ErrorPanel.jsx', () => ({ default: ({ onRetry }) => <button onClick={onRetry}>Retry</button> }));
vi.mock('../components/analyzer/ResultPanel.jsx', () => ({ default: ({ onRefresh }) => <button onClick={onRefresh}>Refresh</button> }));

function Destination() {
  const location = useLocation();
  return <output data-testid="destination">{location.search}</output>;
}

function renderApp(element, path = '/') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}><MemoryRouter initialEntries={[path]}><Routes>
    <Route path="/" element={element} /><Route path="/read" element={path === '/' ? <Destination /> : element} />
  </Routes></MemoryRouter></QueryClientProvider>);
}

beforeEach(() => { mocks.start.mockReset(); mocks.cancel.mockReset(); mocks.preview = { isPending: false }; });
afterEach(cleanup);

describe('reading a commit', () => {
  it('accepts a repository and valid commit hash and includes it in the read link', () => {
    renderApp(<AnalyzerForm />);
    fireEvent.change(screen.getByLabelText('GitHub link or owner/repo'), { target: { value: 'vitejs/vite' } });
    fireEvent.click(screen.getByRole('tab', { name: 'One commit' }));
    const button = screen.getByRole('button', { name: 'Read this repository' });
    expect(button).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Commit hash'), { target: { value: 'not-a-hash' } });
    expect(button).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Commit hash'), { target: { value: ' A3F9C21 ' } });
    expect(button).toBeEnabled();
    fireEvent.click(button);
    const params = new URLSearchParams(screen.getByTestId('destination').textContent);
    expect(params.get('input')).toBe('vitejs/vite');
    expect(params.get('kind')).toBe('commit');
    expect(params.get('sha')).toBe('A3F9C21');
  });

  it('preserves commit-link input without requiring a separate hash', () => {
    renderApp(<AnalyzerForm />);
    fireEvent.change(screen.getByLabelText('GitHub link or owner/repo'), { target: { value: ' https://github.com/vitejs/vite/commit/a3f9c21 ' } });
    fireEvent.click(screen.getByRole('tab', { name: 'One commit' }));
    expect(screen.queryByLabelText('Commit hash')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Read this repository' }));
    expect(new URLSearchParams(screen.getByTestId('destination').textContent).has('sha')).toBe(false);
  });

  it('retains the hash for initial request, retry and refresh', () => {
    mocks.state = { status: 'error', error: {} };
    renderApp(<Read />, '/read?input=vitejs%2Fvite&kind=commit&audience=learner&sha=a3f9c21');
    expect(mocks.start).toHaveBeenCalledWith(expect.objectContaining({ options: { limit: 30, sha: 'a3f9c21' } }));
    fireEvent.click(screen.getByText('Retry'));
    expect(mocks.start).toHaveBeenLastCalledWith(expect.objectContaining({ options: { limit: 30, sha: 'a3f9c21' } }));
    cleanup();
    mocks.state = { status: 'done', text: 'Result', summary: { kind: 'commit' } };
    renderApp(<Read />, '/read?input=vitejs%2Fvite&kind=commit&audience=learner&sha=a3f9c21');
    fireEvent.click(screen.getByText('Refresh'));
    expect(mocks.start).toHaveBeenLastCalledWith(expect.objectContaining({ options: { limit: 30, refresh: true, sha: 'a3f9c21' } }));
  });
});

it('renders repository preview from the API response', () => {
  render(<RepoPreview enabled query={{ isPending: false, data: { repository: { fullName: 'vitejs/vite', avatarUrl: 'https://example.com/avatar', stars: 1234, language: 'JavaScript', description: 'A build tool' } } }} />);
  expect(screen.getByText('vitejs/vite')).toBeInTheDocument();
  expect(screen.getByText('A build tool')).toBeInTheDocument();
});
