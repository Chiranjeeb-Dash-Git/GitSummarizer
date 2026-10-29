import { useMemo } from 'react';
import { Star } from 'lucide-react';
import MarkdownView from '../markdown/MarkdownView.jsx';
import StrataRail from './StrataRail.jsx';
import SummaryActions from './SummaryActions.jsx';
import { extractSections } from '../../lib/sections.js';
import { formatCompact } from '../../lib/format.js';
import { AUDIENCES, KINDS } from '../../lib/constants.js';

export default function ResultPanel({ repository, kind, audience, markdown, streaming, summary, saved, cached, onRefresh }) {
  const sections = useMemo(() => extractSections(markdown), [markdown]);
  const kindLabel = KINDS.find((k) => k.value === kind)?.label;
  const audienceLabel = AUDIENCES.find((a) => a.value === audience)?.label;

  return (
    <article className="mx-auto max-w-[1280px] px-5 pb-28 pt-10 md:px-10 xl:px-16">
      {repository && (
        <header className="mb-8 flex flex-col gap-5 border-b border-line pb-8 sm:flex-row sm:items-start">
          <img src={repository.avatarUrl} alt="" width="56" height="56" className="h-14 w-14 rounded-full border border-line-strong" />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-h1 font-extrabold">{repository.fullName}</h1>
            {repository.description && <p className="mt-2 max-w-[60ch] text-muted">{repository.description}</p>}
            <ul className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              {repository.language && <li className="font-semibold">{repository.language}</li>}
              <li className="inline-flex items-center gap-1.5"><Star size={15} aria-hidden="true" />{formatCompact(repository.stars)} stars</li>
              {kindLabel && <li>{kindLabel} for {audienceLabel?.toLowerCase()}</li>}
              {cached && <li className="text-muted">Reused from a recent reading</li>}
            </ul>
          </div>
        </header>
      )}

      <div className="mb-8">
        <SummaryActions summary={summary} markdown={markdown} saved={saved} streaming={streaming} onRefresh={onRefresh} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[3rem_minmax(0,1fr)] lg:gap-12">
        <StrataRail sections={sections} />
        <MarkdownView source={markdown} streaming={streaming} />
      </div>
    </article>
  );
}

