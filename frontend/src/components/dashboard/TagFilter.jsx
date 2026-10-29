import Chip from '../ui/Chip.jsx';

export default function TagFilter({ tags = [], selectedTag, onSelectTag }) {
  if (!tags.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onSelectTag(null)}
        className={`h-7 rounded-chip px-2.5 text-xs font-semibold transition-colors ${
          selectedTag === null ? 'bg-ink text-paper' : 'bg-surface-2 text-ink hover:bg-line-strong'
        }`}
      >
        All tags
      </button>

      {tags.map((t) => {
        const isSelected = selectedTag === t;
        return (
          <button
            key={t}
            type="button"
            onClick={() => onSelectTag(isSelected ? null : t)}
            className={`h-7 rounded-chip px-2.5 text-xs font-semibold transition-colors ${
              isSelected ? 'bg-ink text-paper' : 'bg-surface-2 text-ink hover:bg-line-strong'
            }`}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}

