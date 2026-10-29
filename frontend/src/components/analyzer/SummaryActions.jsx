import { useState } from 'react';
import { Bookmark, Copy, Download, Link2, RefreshCw } from 'lucide-react';
import Button from '../ui/Button.jsx';
import SaveDialog from './SaveDialog.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useWipeNavigate } from '../effects/StrataWipe.jsx';
import { toast } from '../../lib/toast.js';

export default function SummaryActions({ summary, markdown, saved, streaming, onRefresh }) {
  const { user } = useAuth();
  const go = useWipeNavigate();
  const [saveOpen, setSaveOpen] = useState(false);

  const onSaveClick = () => {
    if (!user) {
      toast.info('Sign in to save');
      go('/login');
      return;
    }
    setSaveOpen(true);
  };

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdown || '');
      toast.success('Copied');
    } catch {
      toast.error('Could not copy markdown');
    }
  };

  const downloadMarkdown = () => {
    if (!markdown) return;
    const repo = summary?.repository;
    const name = repo ? `${repo.owner}-${repo.name}-${summary?.kind || 'summary'}.md` : 'summary.md';
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(a);
    toast.success('Downloaded');
  };

  const copyLink = async () => {
    if (!summary?.id) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/r/${summary.id}`);
      toast.success('Link copied');
    } catch {
      toast.error('Could not copy link');
    }
  };

  const isSaved = Boolean(saved);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5">
        <Button
          variant="ghost"
          onClick={onSaveClick}
          disabled={streaming || !summary}
          aria-label={isSaved ? 'Saved' : 'Save'}
        >
          <Bookmark size={16} className={isSaved ? 'fill-current text-malachite' : ''} />
          {isSaved ? 'Saved' : 'Save'}
        </Button>

        <Button
          variant="ghost"
          onClick={copyMarkdown}
          disabled={streaming || !markdown}
          aria-label="Copy Markdown"
        >
          <Copy size={16} />
          Copy Markdown
        </Button>

        <Button
          variant="ghost"
          onClick={downloadMarkdown}
          disabled={streaming || !markdown}
          aria-label="Download"
        >
          <Download size={16} />
          Download
        </Button>

        <Button
          variant="ghost"
          onClick={copyLink}
          disabled={streaming || !summary}
          aria-label="Copy link"
        >
          <Link2 size={16} />
          Copy link
        </Button>

        {user && onRefresh && (
          <Button
            variant="ghost"
            onClick={onRefresh}
            disabled={streaming}
            aria-label="Refresh"
          >
            <RefreshCw size={16} />
            Refresh
          </Button>
        )}
      </div>

      {summary && (
        <SaveDialog
          open={saveOpen}
          onClose={() => setSaveOpen(false)}
          summaryId={summary.id}
          savedId={saved?.id}
          initialNote={saved?.note ?? ''}
          initialTags={saved?.tags ?? []}
        />
      )}
    </>
  );
}

