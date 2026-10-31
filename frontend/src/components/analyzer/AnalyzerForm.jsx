import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Field from '../ui/Field.jsx';
import SegmentedControl from '../ui/SegmentedControl.jsx';
import Tabs from '../ui/Tabs.jsx';
import Kbd from '../ui/Kbd.jsx';
import MagneticButton from '../effects/MagneticButton.jsx';
import RepoPreview from './RepoPreview.jsx';
import { useRepoPreview } from '../../hooks/useRepoPreview.js';
import { AUDIENCES, KINDS } from '../../lib/constants.js';

const COMMIT_LINK = /\/commit\/[0-9a-f]{7,40}(?:[/?#]|$)/i;
const COMMIT_SHA = /^[0-9a-f]{7,40}$/i;

export default function AnalyzerForm({ initial }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [input, setInput] = useState(initial?.input ?? '');
  const [kind, setKind] = useState(initial?.kind ?? 'overview');
  const [audience, setAudience] = useState(initial?.audience ?? 'learner');
  const [sha, setSha] = useState(initial?.sha ?? '');
  const preview = useRepoPreview(input);

  const parsedType = preview.data?.parsed?.type;
  const forced = parsedType === 'commit' ? 'commit' : parsedType === 'compare' ? 'release_notes' : null;
  const activeKind = forced ?? kind;
  const needsHash = activeKind === 'commit' && !COMMIT_LINK.test(input.trim());
  const needsCommit = needsHash && !COMMIT_SHA.test(sha.trim());

  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    if (input.trim().length < 3) return inputRef.current?.focus();
    if (needsCommit) return undefined;
    const q = new URLSearchParams({ input: input.trim(), kind: activeKind, audience });
    if (needsHash) q.set('sha', sha.trim());
    return navigate(`/read?${q}`);
  };

  return (
    <form onSubmit={submit} className="rounded-slab border border-line-strong bg-surface p-5 shadow-stack sm:p-7" aria-label="Read a repository">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="relative flex-1">
          <Field
            ref={inputRef}
            label="GitHub link or owner/repo"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="github.com/vitejs/vite"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            inputMode="url"
          />
          {!input && <span className="pointer-events-none absolute bottom-3 right-4 hidden sm:block"><Kbd>/</Kbd></span>}
        </div>
        <MagneticButton type="submit" disabled={needsCommit}>Read this repository</MagneticButton>
      </div>

      <RepoPreview query={preview} enabled={input.trim().length >= 3} />

      <div className="mt-6">
        <Tabs
          label="What to write"
          tabs={KINDS}
          value={activeKind}
          onChange={(v) => !forced && setKind(v)}
        />
        {forced && <p className="mt-2 text-sm text-muted">The link decides this: {forced === 'commit' ? 'one commit' : 'release notes for the range'}.</p>}
        {needsHash && (
          <Field
            className="mt-4"
            label="Commit hash"
            value={sha}
            onChange={(e) => setSha(e.target.value)}
            placeholder="e.g. a3f9c21"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            hint="Enter 7–40 hexadecimal characters for this repository."
            error={sha.trim() && needsCommit ? 'Enter a valid commit hash of 7–40 hexadecimal characters.' : undefined}
          />
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold">Explain it for</span>
        <SegmentedControl label="Audience" options={AUDIENCES} value={audience} onChange={setAudience} />
      </div>
    </form>
  );
}

