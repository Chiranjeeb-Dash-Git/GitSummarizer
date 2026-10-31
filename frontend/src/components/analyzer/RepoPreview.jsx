import { Star } from 'lucide-react';
import Skeleton from '../ui/Skeleton.jsx';
import { formatCompact } from '../../lib/format.js';
import { ERROR_HELP } from '../../lib/constants.js';

// Deterministic strata color hash (1 to 6)
function hashColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 6) + 1;
}

export default function RepoPreview({ query, enabled }) {
  if (!enabled) return null;

  const { isPending, data, error } = query;

  return (
    <div className="mt-4" aria-live="polite">
      {isPending && <Skeleton className="h-20 w-full rounded-field" />}

      {error && (
        <div className="rounded-field border border-oxide bg-surface p-4">
          <p className="text-sm font-semibold text-oxide">{error.message}</p>
          {ERROR_HELP[error.code] && (
            <p className="mt-1 text-xs text-muted">{ERROR_HELP[error.code]}</p>
          )}
        </div>
      )}

      {!isPending && !error && data?.repository && (
        <div className="rounded-field border border-line-strong bg-surface-2 p-4 shadow-slab-sm">
          <div className="flex items-start gap-3.5">
            <img
              src={data.repository.avatarUrl}
              alt=""
              width="40"
              height="40"
              className="h-10 w-10 shrink-0 rounded-full border border-line"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-display text-lg font-bold">{data.repository.fullName}</span>
                {data.repository.language && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: `var(--strata-${hashColor(data.repository.language)})` }}
                      aria-hidden="true"
                    />
                    {data.repository.language}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-xs text-muted">
                  <Star size={13} aria-hidden="true" />
                  {formatCompact(data.repository.stars)}
                </span>
              </div>
              {data.repository.description && (
                <p className="mt-1 line-clamp-2 text-sm text-muted">{data.repository.description}</p>
              )}
              {data.parsed?.type === 'commit' && (
                <p className="mt-2 text-xs font-medium text-verdigris">
                  This is a commit link, so we will explain this commit.
                </p>
              )}
              {data.parsed?.type === 'compare' && (
                <p className="mt-2 text-xs font-medium text-verdigris">
                  This is a compare link, so we will write release notes for the range.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

