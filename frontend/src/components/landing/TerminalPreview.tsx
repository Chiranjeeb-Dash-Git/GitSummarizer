import { useEffect, useRef, useState } from 'react';

const lines = [
  <><span style={{ color: '#FF5C3A' }}>$</span> gitvision read github.com/acme/atlas --for maintainers</>,
  <><span style={{ color: '#12B76A' }}>✓</span> <span style={{ color: 'rgba(255,245,220,0.7)' }}>resolved acme/atlas (TypeScript, 12.4k stars)</span></>,
  <><span style={{ color: '#12B76A' }}>✓</span> <span style={{ color: 'rgba(255,245,220,0.7)' }}>read README, 38 top-level files, 120 commits</span></>,
  '\u00a0',
  '{',
  <>{'  '}<span style={{ color: '#FFD60A' }}>"summary"</span>: <span style={{ color: '#B5F23D' }}>"A multi-tenant billing engine with a ledger core."</span>,</>,
  <>{'  '}<span style={{ color: '#FFD60A' }}>"modules"</span>: [<span style={{ color: '#B5F23D' }}>"ledger"</span>, <span style={{ color: '#B5F23D' }}>"invoicing"</span>, <span style={{ color: '#B5F23D' }}>"webhooks"</span>],</>,
  <>{'  '}<span style={{ color: '#FFD60A' }}>"hotspots"</span>: <span style={{ color: '#FF9EC4' }}>3</span>, <span style={{ color: 'rgba(255,245,220,0.6)' }}>// all inside /ledger</span></>,
  <>{'  '}<span style={{ color: '#FFD60A' }}>"risk"</span>: <span style={{ color: '#B5F23D' }}>"low"</span></>,
  '}',
  '\u00a0',
  <><span style={{ color: '#FF5C3A' }}>→</span> release notes ready in <span style={{ color: '#FFD60A' }}>2.8s</span> <span className="gv-blink inline-block h-4 w-2 bg-[#FFD60A] align-[-2px]" /></>,
];

export default function TerminalPreview() {
  const terminalRef = useRef<HTMLPreElement>(null);
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const terminal = terminalRef.current;
    if (!terminal) return undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const reveal = () => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setVisibleLines(lines.length);
        return;
      }
      let count = 1;
      setVisibleLines(count);
      const next = () => {
        count += 1;
        setVisibleLines(count);
        if (count < lines.length) timer = setTimeout(next, 380);
      };
      timer = setTimeout(next, 380);
    };
    if (!('IntersectionObserver' in window)) {
      reveal();
      return () => clearTimeout(timer);
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        observer.disconnect();
        reveal();
      }
    }, { threshold: 0.4 });
    observer.observe(terminal);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  return (
    <pre ref={terminalRef} className="min-h-[22rem] overflow-x-auto p-5 font-mono text-[13px] leading-7 text-[#FFF5DC] sm:p-7 sm:text-sm whitespace-pre font-bold" aria-label="Terminal output sample">
      {lines.slice(0, visibleLines).map((line, index) => <div className="gv-tl in" key={index}>{line}</div>)}
    </pre>
  );
}
