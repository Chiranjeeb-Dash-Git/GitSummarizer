import CountUp from '../effects/CountUp.jsx';
import Skeleton from '../ui/Skeleton.jsx';

export default function StatsSentence({ stats, loading }) {
  if (loading) {
    return <Skeleton className="h-7 w-96 max-w-full" />;
  }

  const reads = stats?.totalReads ?? 0;
  const saves = stats?.totalSaves ?? 0;
  const topLanguage = stats?.topLanguage;

  if (reads === 0) {
    return (
      <p className="text-lg text-muted">
        Nothing here yet. Read a repository and it will appear below.
      </p>
    );
  }

  return (
    <p className="text-lg leading-relaxed text-ink">
      You have read{' '}
      <strong className="font-display font-bold text-malachite">
        <CountUp value={reads} />
      </strong>{' '}
      repositories in the last 30 days and saved{' '}
      <strong className="font-display font-bold text-ochre">
        <CountUp value={saves} />
      </strong>{' '}
      summaries.
      {topLanguage && (
        <>
          {' '}Most of them were{' '}
          <strong className="font-display font-bold text-verdigris">{topLanguage}</strong>.
        </>
      )}
    </p>
  );
}

