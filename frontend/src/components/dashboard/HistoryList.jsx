import { useEffect, useRef, useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bookmark, Trash2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import { dayLabel, formatTime } from '../../lib/format.js';
import { WipeLink } from '../effects/StrataWipe.jsx';
import Button from '../ui/Button.jsx';
import Dialog from '../ui/Dialog.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import Skeleton from '../ui/Skeleton.jsx';
import { toast } from '../../lib/toast.js';

export default function HistoryList() {
  const qc = useQueryClient();
  const sentinelRef = useRef(null);
  const [clearOpen, setClearOpen] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['history'],
    queryFn: ({ pageParam }) =>
      api.get(`/history?limit=20${pageParam ? `&cursor=${encodeURIComponent(pageParam)}` : ''}`).then((r) => r.data),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    initialPageParam: null,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.del(`/history/${id}`),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['history'] });
      const previous = qc.getQueryData(['history']);
      qc.setQueryData(['history'], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((p) => ({
            ...p,
            items: p.items.filter((item) => item.id !== id),
          })),
        };
      });
      return { previous };
    },
    onError: (_err, _id, context) => {
      qc.setQueryData(['history'], context.previous);
      toast.error('Could not remove from history');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Removed');
    },
  });

  const clearMutation = useMutation({
    mutationFn: () => api.del('/history'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['history'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      setClearOpen(false);
      toast.success('History cleared');
    },
    onError: (err) => {
      toast.error(err.message || 'Could not clear history');
    },
  });

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '400px' },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isPending) {
    return (
      <div className="mt-8 space-y-4">
        <Skeleton className="h-16 w-full rounded-field" />
        <Skeleton className="h-16 w-full rounded-field" />
        <Skeleton className="h-16 w-full rounded-field" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-8 rounded-field border border-oxide bg-surface p-6">
        <p className="font-semibold text-oxide">{error.message}</p>
        <Button className="mt-4" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const items = data.pages.flatMap((p) => p.items);

  if (!items.length) {
    return (
      <EmptyState
        title="No readings yet"
        body="Paste a GitHub link on the home page to read your first repository."
        action={{ label: 'Read a repository', to: '/' }}
      />
    );
  }

  // Group by dayLabel
  const grouped = [];
  let currentDay = null;
  let currentGroup = [];

  for (const item of items) {
    const day = dayLabel(item.createdAt);
    if (day !== currentDay) {
      if (currentDay !== null) grouped.push({ day: currentDay, rows: currentGroup });
      currentDay = day;
      currentGroup = [item];
    } else {
      currentGroup.push(item);
    }
  }
  if (currentDay !== null) grouped.push({ day: currentDay, rows: currentGroup });

  return (
    <div className="mt-8">
      <div className="flex justify-end pb-4">
        <Button variant="quiet" onClick={() => setClearOpen(true)}>
          Clear history
        </Button>
      </div>

      <div className="space-y-8">
        {grouped.map(({ day, rows }) => (
          <div key={day}>
            <div className="sticky top-[72px] z-10 bg-paper py-2 font-display text-xl font-bold">
              {day}
            </div>
            <div className="mt-2 space-y-2">
              {rows.map((row, idx) => (
                <div
                  key={row.id}
                  className="group relative flex items-center justify-between overflow-hidden rounded-field border border-line-strong bg-surface p-4 pl-7 shadow-slab-sm"
                >
                  <span
                    className="absolute inset-y-0 left-0 w-2"
                    style={{ background: `var(--strata-${(idx % 6) + 1})` }}
                  />

                  <div className="flex items-center gap-3.5 min-w-0">
                    {row.summary?.repository?.avatarUrl && (
                      <img
                        src={row.summary.repository.avatarUrl}
                        alt=""
                        className="h-9 w-9 shrink-0 rounded-full border border-line"
                      />
                    )}
                    <div className="min-w-0">
                      <WipeLink
                        to={`/r/${row.summary?.id}`}
                        className="font-display font-bold text-ink hover:text-malachite"
                      >
                        {row.summary?.repository?.fullName || row.queryInput}
                      </WipeLink>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                        <span>{row.summary?.kind || 'overview'}</span>
                        <span>•</span>
                        <span>{formatTime(row.createdAt)}</span>
                        {row.saved && (
                          <span className="inline-flex items-center gap-1 font-semibold text-malachite">
                            <Bookmark size={12} className="fill-current" /> Saved
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 shrink-0">
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(row.id)}
                      aria-label={`Remove ${row.summary?.repository?.fullName || 'item'} from history`}
                      className="grid h-8 w-8 place-items-center rounded-field text-muted hover:bg-surface-2 hover:text-oxide"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div ref={sentinelRef} className="h-8" />
      {isFetchingNextPage && <Skeleton className="mt-4 h-16 w-full rounded-field" />}

      <Dialog
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        title="Clear your reading history?"
      >
        <p className="text-muted">Saved summaries stay.</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setClearOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => clearMutation.mutate()} disabled={clearMutation.isPending}>
            Clear history
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

