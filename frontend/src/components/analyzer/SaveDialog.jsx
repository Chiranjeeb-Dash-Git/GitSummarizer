import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Dialog from '../ui/Dialog.jsx';
import Button from '../ui/Button.jsx';
import Chip from '../ui/Chip.jsx';
import { api } from '../../lib/api.js';
import { toast } from '../../lib/toast.js';

export default function SaveDialog({ open, onClose, summaryId, initialNote = '', initialTags = [], savedId = null }) {
  const qc = useQueryClient();
  const [note, setNote] = useState(initialNote);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(initialTags);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addTag = () => {
    const clean = tagInput.trim().toLowerCase().replace(/^[#,]+/, '');
    if (clean && !tags.includes(clean) && tags.length < 8) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const onTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const removeTag = (t) => {
    setTags(tags.filter((x) => x !== t));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (savedId) {
        await api.patch(`/saved/${savedId}`, { note, tags });
      } else {
        await api.post('/saved', { summaryId, note, tags });
      }
      qc.invalidateQueries({ queryKey: ['saved'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      qc.invalidateQueries({ queryKey: ['summary', summaryId] });
      toast.success('Saved');
      onClose();
    } catch (err) {
      setError(err.message || 'Could not save summary');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!savedId) return;
    setLoading(true);
    try {
      await api.del(`/saved/${savedId}`);
      qc.invalidateQueries({ queryKey: ['saved'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      qc.invalidateQueries({ queryKey: ['summary', summaryId] });
      toast.success('Removed');
      onClose();
    } catch (err) {
      setError(err.message || 'Could not remove summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={savedId ? 'Edit this save' : 'Save this summary'}>
      <form onSubmit={handleSave} className="space-y-4">
        {error && <p className="text-sm font-medium text-oxide">{error}</p>}
        <div>
          <label className="mb-2 block text-sm font-semibold">Note</label>
          <textarea
            rows={3}
            maxLength={500}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add personal notes or context..."
            className="w-full rounded-field border border-line-strong bg-surface px-4 py-2.5 text-base text-ink placeholder:text-muted focus:border-ink focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">Tags</label>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={onTagKeyDown}
            onBlur={addTag}
            placeholder="Press Enter to add. Up to 8 tags."
            className="h-11 w-full rounded-field border border-line-strong bg-surface px-4 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none"
          />
          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((t) => (
                <Chip key={t} label={t} onRemove={() => removeTag(t)} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between pt-2">
          {savedId ? (
            <Button type="button" variant="quiet" onClick={handleRemove} disabled={loading}>
              Remove from saved
            </Button>
          ) : <span />}
          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              Save
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}

