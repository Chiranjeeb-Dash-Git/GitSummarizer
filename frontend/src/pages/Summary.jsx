import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api.js';
import ResultPanel from '../components/analyzer/ResultPanel.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import RouteFallback from '../components/layout/RouteFallback.jsx';

export default function Summary() {
  const { id } = useParams();
  const { data, isPending, error } = useQuery({
    queryKey: ['summary', id],
    queryFn: () => api.get(`/summaries/${id}`).then((r) => r.data),
  });

  if (isPending) return <RouteFallback />;
  if (error) {
    return (
      <EmptyState
        title="We could not open that summary"
        body={error.status === 404 ? 'It may have been removed, or the link is incomplete.' : error.message}
        action={{ label: 'Read a repository', to: '/' }}
      />
    );
  }

  const { summary, saved } = data;
  return (
    <ResultPanel
      repository={summary.repository}
      kind={summary.kind}
      audience={summary.audience}
      markdown={summary.contentMd}
      streaming={false}
      summary={summary}
      saved={saved}
      cached={false}
      onRefresh={null}
    />
  );
}

