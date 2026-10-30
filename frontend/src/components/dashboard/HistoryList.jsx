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
    getNextPageParam: (last) => last?.nextCursor ?? undefined,
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
          pages: (old.pages || []).map((p) => {
            const list = Array.isArray(p) ? p : (p?.items || p || []);
            const filtered = list.filter((item) => item.id !== id);
            return Array.isArray(p) ? filtered : { ...p, items: filtered };
          }),
        };
      });
      return { previous };
    },
    onError: (_err, _id, context) => {
      qc.setQueryData(['history'], context?.previous);
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

  // Safely extract items whether backend returns array or { items: [] }
  const items = (data?.pages || []).flatMap((p) => {
    if (Array.isArray(p)) return p;
    if (Array.isArray(p?.items)) return p.items;
    return [];
  });

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
      <div className="mb-6 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setClearOpen(true)}
          className="text-muted hover:text-oxide"
        >
          Clear history
        </Button>
      </div>

      <div className="space-y-8">
        {grouped.map(({ day, rows }) => (
          <section key={day} aria-label={day}>
            <h2 className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-muted">
              {day}
            </h2>
            <div className="divide-y divide-line rounded-field border border-line bg-surface">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="flex flex-col gap-3 p-4 transition-colors hover:bg-surface-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {row.repository?.avatarUrl ? (
                      <img
                        src={row.repository.avatarUrl}
                        alt=""
                        className="h-8 w-8 rounded-full border border-line bg-surface"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full border border-line bg-surface-2" />
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <WipeLink
                          to={`/r/${row.summaryId}`}
                          className="truncate font-medium text-ink hover:underline"
                        >
                          {row.repository?.fullName || row.title || 'Untitled summary'}
                        </WipeLink>
                        {row.saved && (
                          <span title="Saved to library">
                            <Bookmark size={14} className="fill-ochre text-ochre" />
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-muted">
                        {row.repository?.language && <span>{row.repository.language} • </span>}
                        <span>{formatTime(row.createdAt)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <WipeLink
                      to={`/r/${row.summaryId}`}
                      className="rounded-field px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface"
                    >
                      Open
                    </WipeLink>
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(row.id)}
                      aria-label="Remove item"
                      className="rounded-field p-1.5 text-muted hover:text-oxide hover:bg-surface transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div ref={sentinelRef} className="h-4" />

      {isFetchingNextPage && (
        <div className="mt-4 flex justify-center py-4">
          <Skeleton className="h-8 w-32 rounded-field" />
        </div>
      )}

      <Dialog
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        title="Clear entire history?"
        description="This will permanently delete all your repository reading history. Saved summaries will remain untouched."
      >
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setClearOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => clearMutation.mutate()}
            disabled={clearMutation.isPending}
          >
            {clearMutation.isPending ? 'Clearing...' : 'Clear history'}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
