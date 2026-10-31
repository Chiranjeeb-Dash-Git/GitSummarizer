import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit2, Trash2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import { WipeLink } from '../effects/StrataWipe.jsx';
import TagFilter from './TagFilter.jsx';
import Chip from '../ui/Chip.jsx';
import Button from '../ui/Button.jsx';
import Skeleton from '../ui/Skeleton.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import SaveDialog from '../analyzer/SaveDialog.jsx';
import { toast } from '../../lib/toast.js';

export default function SavedList() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['saved', search, selectedTag],
    queryFn: () => {
      const q = new URLSearchParams();
      if (search.trim()) q.set('q', search.trim());
      if (selectedTag) q.set('tag', selectedTag);
      return api.get(`/saved?${q.toString()}`).then((r) => ({ items: r.data, tags: r.tags }));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.del(`/saved/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['saved'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Removed');
    },
    onError: (err) => {
      toast.error(err.message || 'Could not remove from saved');
    },
  });

  if (isPending) {
    return (
      <div className="mt-8 space-y-4">
        <Skeleton className="h-24 w-full rounded-field" />
        <Skeleton className="h-24 w-full rounded-field" />
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

  const items = data?.items || [];
  const allTags = data?.tags || [];

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          placeholder="Search saved summaries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search saved"
          className="h-11 w-full max-w-sm rounded-field border border-line-strong bg-surface px-4 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none"
        />

        <TagFilter tags={allTags} selectedTag={selectedTag} onSelectTag={setSelectedTag} />
      </div>

      {!items.length ? (
        <EmptyState
          title="Nothing saved yet"
          body="Use Save on any summary to keep it here with a note and tags."
          action={{ label: 'Read a repository', to: '/' }}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative flex min-h-[96px] flex-col justify-between rounded-field border border-line-strong bg-surface p-4 pl-6 shadow-slab-sm sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <WipeLink
                    to={`/r/${item.summaryId}`}
                    className="font-display text-lg font-bold text-ink hover:text-malachite"
                  >
                    {item.title || item.repository?.fullName}
                  </WipeLink>
                  <span className="text-xs text-muted">
                    ({item.repository?.fullName})
                  </span>
                </div>

                {item.note && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{item.note}</p>
                )}

                {item.tags?.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {item.tags.map((t) => (
                      <Chip key={t} label={t} />
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center gap-2 sm:ml-4 sm:mt-0">
                <Button variant="quiet" onClick={() => setEditingItem(item)} aria-label="Edit save">
                  <Edit2 size={16} />
                  <span>Edit</span>
                </Button>
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(item.id)}
                  aria-label="Delete save"
                  className="grid h-9 w-9 place-items-center rounded-field text-muted hover:bg-surface-2 hover:text-oxide"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingItem && (
        <SaveDialog
          open={Boolean(editingItem)}
          onClose={() => setEditingItem(null)}
          summaryId={editingItem.summaryId}
          savedId={editingItem.id}
          initialNote={editingItem.note}
          initialTags={editingItem.tags}
        />
      )}
    </div>
  );
}

