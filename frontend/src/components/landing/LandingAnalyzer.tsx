import { useState, type CSSProperties, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

const modes = [
  { value: 'overview', label: '📄 Project Summary', selected: 'bg-[#FFD60A] ring-2 ring-[#0A0A0A]' },
  { value: 'release_notes', label: '🔀 Commit Overview', selected: 'bg-[#B5F23D] ring-2 ring-[#0A0A0A]' },
  { value: 'commit', label: '🛠️ One Commit', selected: 'bg-[#FF5C3A] ring-2 ring-[#0A0A0A]' },
] as const;
const audiences = [
  { value: 'learner', label: '🎓 Learners', selected: 'bg-[#FFD60A] ring-2 ring-[#0A0A0A]' },
  { value: 'product', label: '📦 Product teams', selected: 'bg-[#FF9EC4] ring-2 ring-[#0A0A0A]' },
  { value: 'maintainer', label: '🔧 Maintainers', selected: 'bg-[#B5F23D] ring-2 ring-[#0A0A0A]' },
] as const;

type Option<T extends string> = { value: T; label: string; selected: string };
function OptionButtons<T extends string>({ options, value, onChange, textColor = '' }: {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  textColor?: string;
}) {
  return options.map((option) => (
    <button
      key={option.value}
      type="button"
      onClick={() => onChange(option.value)}
      aria-pressed={value === option.value}
      className={`nb press lift rounded-full px-5 py-2 ${textColor} transition-colors ${
        value === option.value ? option.selected : 'bg-white hover:bg-[#FFF5DC]'
      }`}
      style={{ boxShadow: '3px 3px 0 #0A0A0A' }}
    >
      {option.label}
    </button>
  ));
}

export default function LandingAnalyzer() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<(typeof modes)[number]['value']>('overview');
  const [audience, setAudience] = useState<(typeof audiences)[number]['value']>('learner');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = input.trim();
    if (!/^(?:https?:\/\/)?(?:www\.)?(?:github\.com\/)?([\w.-]+)\/([\w.-]+?)(?:\.git)?(?:[\/?#].*)?$/i.test(value)) {
      setError('Enter a GitHub link such as github.com/owner/repo.');
      return;
    }
    const params = new URLSearchParams({ input: value, kind: mode, audience });
    navigate(`/read?${params}`);
  };

  return (
    <div id="analyze" className="gv-reveal mx-auto mt-11 max-w-3xl" style={{ '--d': '.24s' } as CSSProperties}>
      <form onSubmit={handleSubmit} className="nb flex flex-col gap-3 bg-white p-3 sm:flex-row" style={{ boxShadow: '8px 8px 0 #0A0A0A' }} noValidate>
        <label htmlFor="u" className="sr-only">GitHub repository URL</label>
        <input
          id="u"
          value={input}
          onChange={(event) => { setInput(event.target.value); setError(''); }}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? 'err' : undefined}
          maxLength={300}
          autoComplete="off"
          spellCheck={false}
          placeholder="github.com/vercel/next.js"
          className="min-w-0 flex-1 rounded-lg border-[3px] border-[#0A0A0A] bg-[#FFF5DC] px-4 py-3.5 font-mono text-sm font-bold text-[#0A0A0A] placeholder:text-[#5B5B52] focus:bg-[#FFD60A] focus:outline-none sm:text-base"
        />
        <button id="go" type="submit" className="nb press lift rounded-lg bg-[#FF5C3A] px-8 py-3.5 font-['Archivo_Black'] text-lg text-[#0A0A0A]" style={{ boxShadow: '4px 4px 0 #0A0A0A' }}>
          Analyze
        </button>
      </form>
      {error && <p id="err" className="mt-3 min-h-[1.5rem] font-bold text-[#FF5C3A]" role="alert">{error}</p>}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm font-bold text-[#0A0A0A]">
        <span className="text-[#5B5B52]">Mode:</span>
        <OptionButtons options={modes} value={mode} onChange={setMode} />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-sm font-bold text-[#0A0A0A]">
        <span className="text-[#5B5B52]">Audience:</span>
        <OptionButtons options={audiences} value={audience} onChange={setAudience} textColor="text-[#0A0A0A]" />
      </div>
      <p className="mt-2 text-center text-xs font-medium text-[#5B5B52]">
        {mode === 'overview'
          ? 'Reads README, structure & docs → clear project summary'
          : mode === 'release_notes'
          ? 'Parses recent commits & changes → structured changelog'
          : 'Deep-dive into a single commit — paste a /commit/<sha> URL'}
      </p>
    </div>
  );
}
