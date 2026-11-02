import { useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAnalyze } from '../hooks/useAnalyze.js';
import { useAuth } from '../hooks/useAuth.js';
import DrillLoader from '../components/analyzer/DrillLoader.jsx';
import ResultPanel from '../components/analyzer/ResultPanel.jsx';
import ErrorPanel from '../components/analyzer/ErrorPanel.jsx';

export default function Read() {
  const [params] = useSearchParams();
  const qc = useQueryClient();
  const { user } = useAuth();
  const input = params.get('input') ?? '';
  const kind = params.get('kind') ?? 'overview';
  const audience = params.get('audience') ?? 'learner';
  const sha = kind === 'commit' ? params.get('sha') ?? '' : '';
  const { state, start, cancel } = useAnalyze();

  useEffect(() => {
    if (!input) return undefined;
    start({ input, kind, audience, options: { limit: 30, ...(sha && { sha }) } });
    return cancel;
  }, [input, kind, audience, sha, start, cancel]);

  useEffect(() => {
    if (state.status === 'done' && user) {
      qc.invalidateQueries({ queryKey: ['history'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    }
  }, [state.status, user, qc]);

  useEffect(() => {
    document.title = state.repository ? `${state.repository.fullName} in plain language | GitSummarizer` : 'Reading | GitSummarizer';
  }, [state.repository]);

  if (!input) return <Navigate to="/" replace />;

  if (state.status === 'error') {
    return (
      <div className="mx-auto max-w-[1280px] px-5 py-16 md:px-10 xl:px-16">
        <ErrorPanel error={state.error} onRetry={() => start({ input, kind, audience, options: { limit: 30, ...(sha && { sha }) } })} />
      </div>
    );
  }

  const waiting = state.status === 'idle' || (state.status === 'running' && !state.text);
  if (waiting) {
    return (
      <div className="mx-auto max-w-[1280px] px-5 py-16 md:px-10 xl:px-16">
        <DrillLoader stages={state.stages} repository={state.repository} cached={state.cached} />
      </div>
    );
  }

  return (
    <ResultPanel
      repository={state.summary?.repository ?? state.repository}
      kind={state.summary?.kind ?? state.kind}
      audience={state.summary?.audience ?? audience}
      markdown={state.text}
      streaming={state.status === 'running'}
      summary={state.summary}
      cached={state.cached}
      saved={null}
      onRefresh={() => start({ input, kind, audience, options: { limit: 30, refresh: true, ...(sha && { sha }) } })}
    />
  );
}

