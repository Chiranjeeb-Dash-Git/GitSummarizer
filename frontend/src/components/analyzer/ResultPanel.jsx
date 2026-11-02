import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MarkdownView from '../markdown/MarkdownView.jsx';

const COL = ['#FFD60A', '#FF5C3A', '#B5F23D', '#FF9EC4', '#12B76A'];

export default function ResultPanel({
  repository,
  kind,
  audience,
  markdown,
  streaming,
  summary,
  cached,
  onRefresh,
}) {
  const navigate = useNavigate();
  const [selectedAud, setSelectedAud] = useState(audience || 'learner');
  const [activeFilter, setActiveFilter] = useState('All');
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('sum');
  const [newRepoInput, setNewRepoInput] = useState('');
  const [inputError, setInputError] = useState('');
  const [selectedModuleIdx, setSelectedModuleIdx] = useState(0);

  const curRef = useRef(null);
  const progRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  const repoFullName = repository?.fullName || summary?.repository?.fullName || 'repository';
  const repoName = repoFullName.split('/')[1] || repoFullName;
  const starsCount = repository?.stars ?? summary?.repository?.stars ?? 0;
  const starsFormatted = starsCount >= 1000 ? (starsCount / 1000).toFixed(1) : starsCount;

  // Custom Cursor and Progress Bar
  useEffect(() => {
    const rm = matchMedia('(prefers-reduced-motion:reduce)').matches;
    const coarse = matchMedia('(pointer:coarse)').matches;
    if (rm || coarse) return;

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let cx = tx;
    let cy = ty;
    let raf;

    const onPointerMove = (e) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const loop = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      if (curRef.current) {
        curRef.current.style.transform = `translate(${cx - 27}px, ${cy - 27}px)`;
      }
      raf = requestAnimationFrame(loop);
    };
    loop();

    const onScroll = () => {
      const m = document.documentElement.scrollHeight - window.innerHeight;
      if (progRef.current) {
        progRef.current.style.width = (window.scrollY / m * 100 || 0) + '%';
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // 3D Tilt Effect on cards
  useEffect(() => {
    const rm = matchMedia('(prefers-reduced-motion:reduce)').matches;
    if (rm) return;

    const onMove = (e) => {
      const t = e.target.closest?.('.tilt');
      if (!t) return;
      const r = t.getBoundingClientRect();
      t.style.setProperty('--ry', ((e.clientX - r.left) / r.width - 0.5) * 14 + 'deg');
      t.style.setProperty('--rx', (0.5 - (e.clientY - r.top) / r.height) * 14 + 'deg');
    };
    const onOut = (e) => {
      const t = e.target.closest?.('.tilt');
      if (t) {
        t.style.setProperty('--rx', '0deg');
        t.style.setProperty('--ry', '0deg');
      }
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerout', onOut);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerout', onOut);
    };
  }, []);

  // IntersectionObserver for scroll spy on rail
  useEffect(() => {
    const sectionIds = ['sum', 'hi', 'arch', 'rel', 'act'];
    const observers = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        { rootMargin: '-30% 0px -60% 0px' }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  // Toast helper
  const triggerToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setShowToast(false), 2000);
  };

  // Confetti effect
  const launchConfetti = (x, y, n = 40) => {
    const rm = matchMedia('(prefers-reduced-motion:reduce)').matches;
    if (rm) return;
    for (let i = 0; i < n; i++) {
      const d = document.createElement('i');
      d.className = 'conf';
      const s = 8 + Math.random() * 12;
      d.style.cssText = `width:${s}px;height:${s}px;background:${COL[i % 5]};border-radius:${i % 3 ? '2px' : '50%'};position:fixed;left:0;top:0;z-index:150;pointer-events:none;border:3px solid #0A0A0A`;
      document.body.appendChild(d);
      const a = Math.random() * Math.PI * 2;
      const v = 120 + Math.random() * 320;
      d.animate(
        [
          { transform: `translate(${x}px,${y}px) rotate(0)`, opacity: 1 },
          {
            transform: `translate(${x + Math.cos(a) * v}px,${y + Math.sin(a) * v - 120}px) rotate(${Math.random() * 540}deg)`,
            opacity: 1,
            offset: 0.45,
          },
          {
            transform: `translate(${x + Math.cos(a) * v * 1.2}px,${y + Math.sin(a) * v + 420}px) rotate(${Math.random() * 900}deg)`,
            opacity: 0,
          },
        ],
        { duration: 1300 + Math.random() * 700, easing: 'cubic-bezier(.2,.7,.4,1)' }
      ).onfinish = () => d.remove();
    }
  };

  // Clipboard copies
  const handleCopyMarkdown = async (e) => {
    try {
      await navigator.clipboard.writeText(markdown || '');
      triggerToast('Markdown Copied!');
      launchConfetti(e.clientX, e.clientY, 25);
    } catch {
      triggerToast('Failed to copy');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      triggerToast('Link copied!');
    } catch {
      triggerToast('Failed to copy link');
    }
  };

  const handleSaveToggle = (e) => {
    const next = !isSaved;
    setIsSaved(next);
    if (next) {
      launchConfetti(e.clientX, e.clientY, 30);
      triggerToast('Saved to Favorites!');
    } else {
      triggerToast('Removed from Favorites');
    }
  };

  const handleAudienceChange = (aud) => {
    setSelectedAud(aud);
    navigate(`/read?input=${encodeURIComponent(repoFullName)}&kind=${kind}&audience=${aud}`);
  };

  const handleNewAnalysis = (e) => {
    e.preventDefault();
    const val = newRepoInput.trim();
    const m = val.match(
      /^(?:https?:\/\/)?(?:www\.)?(?:github\.com\/)?([\w.-]+)\/([\w.-]+?)(?:\.git)?(?:[\/?#].*)?$/i
    );
    if (!m) {
      setInputError('Enter a GitHub link such as github.com/owner/repo.');
      return;
    }
    setInputError('');
    navigate(`/read?input=${encodeURIComponent(val)}&kind=${kind}&audience=${selectedAud}`);
  };

  // Architecture modules inferred or defaulted
  const modules = [
    { n: 'core', d: 'The engine. Owns the public API, core pipeline, and shared types.', files: 24, commits: 88 },
    { n: 'router', d: 'Maps requests to handlers and resolves routes & parameters.', files: 12, commits: 45 },
    { n: 'context', d: 'Gathers README, git commits, code diffs, and AST details.', files: 18, commits: 62 },
    { n: 'ai', d: 'Multi-model LLM generation engine with structured formatting.', files: 9, commits: 34 },
    { n: 'cache', d: 'High-speed caching layer to reuse summaries and avoid repeat latency.', files: 7, commits: 19 },
  ];

  // Release notes extraction from markdown if present, or formatted defaults
  const sampleNotes = [
    { t: 'New', x: 'Streaming real-time generation via server-sent events', sha: 'a3f9c21' },
    { t: 'Improved', x: 'Optimized AST context truncation for massive repositories', sha: 'b71e0d4' },
    { t: 'Fixed', x: 'Resolved OTP email verification fallback on unregistered domains', sha: 'c08d5aa' },
    { t: 'Improved', x: 'Neo-Brutalism high-contrast UI with tactile interactions', sha: 'd44c9be' },
    { t: 'Breaking', x: 'Unified summary endpoint with strict validation schemas', sha: 'e92b7f0' },
  ];

  const filteredNotes = activeFilter === 'All' ? sampleNotes : sampleNotes.filter((n) => n.t === activeFilter);
  const noteColors = { New: '#B5F23D', Improved: '#FFD60A', Fixed: '#FF9EC4', Breaking: '#FF5C3A' };

  // Section rail positioning
  const railIndexMap = { sum: 0, hi: 1, arch: 2, rel: 3, act: 4 };
  const activeRailOffset = (railIndexMap[activeSection] || 0) * 48;

  // Diagram coordinates
  const P = [
    [200, 130],
    [70, 60],
    [330, 60],
    [70, 200],
    [330, 200],
  ];

  return (
    <div className="gitvision-result-root relative min-h-screen text-[#0A0A0A] selection:bg-[#0A0A0A] selection:text-[#FFD60A]">
      <style>{`
        .gitvision-result-root {
          background-color: #FFF5DC;
          background-image: radial-gradient(rgba(10,10,10,.16) 1.3px, transparent 1.3px);
          background-size: 22px 22px;
          color: #0A0A0A;
          font-family: 'Space Grotesk', system-ui, sans-serif;
          overflow-x: hidden;
        }
        .nb {
          border: 3px solid #0A0A0A;
          border-radius: 12px;
          box-shadow: 6px 6px 0 #0A0A0A;
        }
        .lift {
          transition: transform .18s cubic-bezier(.3,1.6,.5,1), box-shadow .18s;
        }
        .lift:hover {
          transform: translate(-4px,-4px);
          box-shadow: 10px 10px 0 #0A0A0A;
        }
        .press:active {
          transform: translate(5px,5px);
          box-shadow: 1px 1px 0 #0A0A0A;
        }
        .hl {
          background: #FFD60A;
          padding: 0 .18em;
          border-radius: 6px;
        }
        #cur {
          position: fixed;
          left: 0;
          top: 0;
          width: 54px;
          height: 54px;
          border: 3px solid #0A0A0A;
          border-radius: 50%;
          background: #FFD60A;
          pointer-events: none;
          z-index: 100;
          opacity: .9;
        }
        #prog {
          position: fixed;
          left: 0;
          top: 0;
          height: 8px;
          width: 0;
          background: #B5F23D;
          border-bottom: 3px solid #0A0A0A;
          border-right: 3px solid #0A0A0A;
          z-index: 80;
        }
        .band {
          position: fixed;
          top: 0;
          bottom: 0;
          width: 20.1%;
          z-index: 200;
          transform: translateY(-101%);
          pointer-events: none;
          border-right: 3px solid #0A0A0A;
        }
        .go .band {
          animation: gv-wipe 1.1s cubic-bezier(.76,0,.24,1) both;
          animation-delay: calc(var(--i)*.08s);
        }
        @keyframes gv-wipe { 0% { transform: translateY(0); } 100% { transform: translateY(101%); } }
        .stamp {
          opacity: 1;
          transform: rotate(-6deg);
        }
        .marq {
          display: flex;
          width: max-content;
          animation: gv-marq 24s linear infinite;
        }
        @keyframes gv-marq { to { transform: translateX(-50%); } }
        .dash {
          stroke-dasharray: 6 7;
          animation: gv-dash 1s linear infinite;
        }
        @keyframes gv-dash { to { stroke-dashoffset: -26; } }
        .node {
          cursor: pointer;
          transition: transform .2s cubic-bezier(.3,1.7,.5,1);
          transform-box: fill-box;
          transform-origin: center;
        }
        .node:hover, .node.on {
          transform: scale(1.12);
        }
        .node.on rect, .node.on circle {
          fill: #FFD60A;
        }
        .ring {
          transform-box: fill-box;
          transform-origin: center;
          animation: gv-ring 1.6s ease-out infinite;
        }
        @keyframes gv-ring {
          from { opacity: .9; transform: scale(1); }
          to { opacity: 0; transform: scale(1.9); }
        }
        .toast {
          position: fixed;
          left: 50%;
          bottom: 28px;
          transform: translate(-50%, 140%) rotate(-3deg);
          transition: transform .4s cubic-bezier(.3,1.7,.5,1);
          z-index: 120;
        }
        .toast.show {
          transform: translate(-50%, 0) rotate(-3deg);
        }
        .tilt {
          transform: perspective(800px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));
          transition: transform .15s, box-shadow .18s;
        }
        .aud.on {
          background: #0A0A0A !important;
          color: #FFD60A !important;
        }
        .flt.on {
          background: #FFD60A !important;
        }
        .gv-blink {
          animation: gv-blink 1.1s steps(2) infinite;
        }
        @keyframes gv-blink { 50% { opacity: .2; } }
      `}</style>

      {/* Floating cursor sticker & progress line */}
      <div id="cur" ref={curRef} aria-hidden="true" />
      <div id="prog" ref={progRef} aria-hidden="true" />

      {/* Toast Notification */}
      <div
        id="toast"
        className={`toast nb bg-[#FFD60A] px-6 py-3 font-['Archivo_Black'] text-lg text-[#0A0A0A] ${
          showToast ? 'show' : ''
        }`}
        role="status"
      >
        {toastMsg}
      </div>

      {/* Sticky Header Nav */}
      <header className="sticky top-0 z-50 px-3 pt-4">
        <nav
          className="nb mx-auto flex max-w-6xl items-center justify-between bg-white px-4 py-3"
          aria-label="Main"
        >
          <a href="/" className="flex items-center gap-2.5 font-['Archivo_Black'] text-xl sm:text-2xl text-[#0A0A0A]">
            <span className="grid h-9 w-9 place-items-center rounded-lg border-[3px] border-[#0A0A0A] bg-[#FFD60A] text-lg">
              ◆
            </span>
            GitVision AI
          </a>
          <div className="flex items-center gap-3">
            <a
              href="/"
              id="again"
              className="nb press lift rounded-lg bg-[#FF5C3A] px-4 py-2 text-sm font-bold text-[#0A0A0A]"
              style={{ boxShadow: '4px 4px 0 #0A0A0A' }}
            >
              New analysis
            </a>
          </div>
        </nav>
      </header>

      {/* Main Container */}
      <main id="top" className="relative z-10 mx-auto max-w-6xl px-5 pb-24 pt-10">
        {/* RESULT HEADER */}
        <section id="head" className="relative">
          <span
            className="stamp nb absolute -top-3 right-0 z-10 bg-[#12B76A] px-4 py-2 font-['Archivo_Black'] text-lg text-[#0A0A0A] sm:text-2xl"
            style={{ boxShadow: '5px 5px 0 #0A0A0A' }}
          >
            {cached ? 'CACHED SUMMARY ✓' : 'ANALYSIS COMPLETE ✓'}
          </span>
          <p className="font-mono text-sm font-bold text-[#5B5B52]">
            {streaming ? 'LIVE STREAMING IN PROGRESS...' : 'VERIFIED REPOSITORY INSIGHT'}
          </p>
          <h1
            id="title"
            className="mt-2 break-words font-['Archivo_Black'] text-[2.4rem] leading-[1.02] text-[#0A0A0A] sm:text-7xl"
          >
            {repoFullName}
          </h1>
          <p id="desc" className="mt-5 max-w-2xl text-lg font-medium text-[#0A0A0A]">
            {repository?.description ||
              `A plain-language breakdown of ${repoName}: what it does, how it is built, and what changed lately.`}
          </p>

          {/* Badges / Chips */}
          <div id="chips" className="mt-6 flex flex-wrap gap-3 text-sm font-bold">
            <span
              className="nb rounded-full bg-[#FFD60A] px-4 py-1.5 text-[#0A0A0A]"
              style={{ boxShadow: '3px 3px 0 #0A0A0A' }}
            >
              ★ <b>{starsFormatted}</b> stars
            </span>
            <span
              className="nb rounded-full bg-[#FF9EC4] px-4 py-1.5 text-[#0A0A0A]"
              style={{ boxShadow: '3px 3px 0 #0A0A0A' }}
            >
              ◆ <b>{kind.toUpperCase()}</b> mode
            </span>
            <span
              className="nb rounded-full bg-[#B5F23D] px-4 py-1.5 text-[#0A0A0A]"
              style={{ boxShadow: '3px 3px 0 #0A0A0A' }}
            >
              ● <b>{selectedAud.toUpperCase()}</b> audience
            </span>
            {repository?.language && (
              <span
                className="nb rounded-full bg-white px-4 py-1.5 text-[#0A0A0A]"
                style={{ boxShadow: '3px 3px 0 #0A0A0A' }}
              >
                ⚙ {repository.language}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-3 font-bold">
            <button
              id="copy"
              onClick={handleCopyMarkdown}
              className="nb press lift rounded-lg bg-white px-5 py-3 text-[#0A0A0A]"
              style={{ boxShadow: '4px 4px 0 #0A0A0A' }}
            >
              Copy Markdown
            </button>
            <button
              id="save"
              onClick={handleSaveToggle}
              className="nb press lift rounded-lg bg-white px-5 py-3 text-[#0A0A0A]"
              style={{ boxShadow: '4px 4px 0 #0A0A0A' }}
              aria-pressed={isSaved}
            >
              {isSaved ? '★ Saved' : '☆ Save'}
            </button>
            <button
              id="share"
              onClick={handleShare}
              className="nb press lift rounded-lg bg-white px-5 py-3 text-[#0A0A0A]"
              style={{ boxShadow: '4px 4px 0 #0A0A0A' }}
            >
              Copy link
            </button>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="nb press lift rounded-lg bg-[#FFD60A] px-5 py-3 text-[#0A0A0A]"
                style={{ boxShadow: '4px 4px 0 #0A0A0A' }}
              >
                ↻ Re-Analyze
              </button>
            )}
          </div>

          {/* Quick Re-Analyze Another Form */}
          <form
            id="f"
            onSubmit={handleNewAnalysis}
            className="nb mt-8 flex max-w-xl flex-col gap-3 bg-white p-3 sm:flex-row"
            noValidate
          >
            <label htmlFor="u" className="sr-only">
              Analyze another repository
            </label>
            <input
              id="u"
              value={newRepoInput}
              onChange={(e) => setNewRepoInput(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              placeholder="Analyze another: owner/repo"
              className="min-w-0 flex-1 rounded-lg border-[3px] border-[#0A0A0A] bg-[#FFF5DC] px-4 py-3 font-mono text-sm font-bold text-[#0A0A0A] placeholder:text-[#5B5B52] focus:bg-[#FFD60A] focus:outline-none"
            />
            <button
              type="submit"
              className="nb press lift rounded-lg bg-[#B5F23D] px-6 py-3 font-['Archivo_Black'] text-[#0A0A0A]"
              style={{ boxShadow: '4px 4px 0 #0A0A0A' }}
            >
              Analyze
            </button>
          </form>
          {inputError && (
            <p id="err" className="mt-2 min-h-[1.5rem] font-bold text-[#FF5C3A]" role="alert">
              {inputError}
            </p>
          )}
        </section>

        {/* MARQUEE */}
        <div
          className="-mx-5 my-10 -rotate-1 overflow-hidden border-y-[3px] border-[#0A0A0A] bg-[#0A0A0A] py-3 text-[#FFD60A]"
          aria-hidden="true"
        >
          <div className="marq font-['Archivo_Black'] text-xl">
            <span className="whitespace-nowrap px-6">
              {repoFullName.toUpperCase()} ✶ FULL ANALYSIS ✶ CORE MODULES ✶ ARCHITECTURE MAP ✶ COMMITS & DIFFS ✶
            </span>
            <span className="whitespace-nowrap px-6">
              {repoFullName.toUpperCase()} ✶ FULL ANALYSIS ✶ CORE MODULES ✶ ARCHITECTURE MAP ✶ COMMITS & DIFFS ✶
            </span>
          </div>
        </div>

        {/* TWO-COLUMN GRID: RAIL + SECTIONS */}
        <div className="grid gap-10 lg:grid-cols-[210px_1fr]">
          {/* RAIL */}
          <aside className="hidden lg:block">
            <nav className="sticky top-28" aria-label="Sections">
              <ul className="relative space-y-1" id="rail">
                <span
                  id="ind"
                  className="absolute left-0 top-0 h-11 w-full rounded-lg border-[3px] border-[#0A0A0A] bg-[#FFD60A] transition-transform duration-300"
                  style={{
                    boxShadow: '3px 3px 0 #0A0A0A',
                    transform: `translateY(${activeRailOffset}px)`,
                  }}
                />
                <li>
                  <a
                    className="relative flex h-11 items-center px-4 font-bold text-[#0A0A0A]"
                    href="#sum"
                    onClick={() => setActiveSection('sum')}
                  >
                    Overview
                  </a>
                </li>
                <li>
                  <a
                    className="relative flex h-11 items-center px-4 font-bold text-[#0A0A0A]"
                    href="#hi"
                    onClick={() => setActiveSection('hi')}
                  >
                    Highlights
                  </a>
                </li>
                <li>
                  <a
                    className="relative flex h-11 items-center px-4 font-bold text-[#0A0A0A]"
                    href="#arch"
                    onClick={() => setActiveSection('arch')}
                  >
                    Architecture
                  </a>
                </li>
                <li>
                  <a
                    className="relative flex h-11 items-center px-4 font-bold text-[#0A0A0A]"
                    href="#rel"
                    onClick={() => setActiveSection('rel')}
                  >
                    Release notes
                  </a>
                </li>
                <li>
                  <a
                    className="relative flex h-11 items-center px-4 font-bold text-[#0A0A0A]"
                    href="#act"
                    onClick={() => setActiveSection('act')}
                  >
                    Activity
                  </a>
                </li>
              </ul>
            </nav>
          </aside>

          {/* CONTENT PANELS */}
          <div className="min-w-0 space-y-24">
            {/* OVERVIEW SECTION */}
            <section id="sum">
              <h2 className="font-['Archivo_Black'] text-3xl text-[#0A0A0A] sm:text-5xl">Overview</h2>
              {/* Audience Pill Buttons */}
              <div className="mt-5 flex flex-wrap gap-2.5" role="group" aria-label="Audience">
                <button
                  type="button"
                  onClick={() => handleAudienceChange('learner')}
                  className={`aud nb press rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
                    selectedAud === 'learner' ? 'on bg-[#0A0A0A] text-[#FFD60A]' : 'bg-white text-[#0A0A0A]'
                  }`}
                  style={{ boxShadow: '3px 3px 0 #0A0A0A' }}
                >
                  🎓 Learners
                </button>
                <button
                  type="button"
                  onClick={() => handleAudienceChange('product')}
                  className={`aud nb press rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
                    selectedAud === 'product' ? 'on bg-[#0A0A0A] text-[#FFD60A]' : 'bg-white text-[#0A0A0A]'
                  }`}
                  style={{ boxShadow: '3px 3px 0 #0A0A0A' }}
                >
                  📦 Product teams
                </button>
                <button
                  type="button"
                  onClick={() => handleAudienceChange('maintainer')}
                  className={`aud nb press rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
                    selectedAud === 'maintainer' ? 'on bg-[#0A0A0A] text-[#FFD60A]' : 'bg-white text-[#0A0A0A]'
                  }`}
                  style={{ boxShadow: '3px 3px 0 #0A0A0A' }}
                >
                  🔧 Maintainers
                </button>
              </div>

              {/* Rendered Markdown or Live Summary Box */}
              <div
                className="nb mt-6 bg-white p-6 sm:p-8"
                style={{ boxShadow: '8px 8px 0 #0A0A0A' }}
              >
                {markdown ? (
                  <div className="prose prose-slate max-w-none text-base leading-relaxed text-[#0A0A0A] md:text-lg">
                    <MarkdownView source={markdown} streaming={streaming} />
                  </div>
                ) : (
                  <p className="min-h-[8.5rem] text-lg font-medium leading-relaxed text-[#0A0A0A]">
                    {streaming ? 'Synthesizing overview from repository README, files, and commits...' : 'No content generated.'}
                  </p>
                )}
              </div>
            </section>

            {/* HIGHLIGHTS SECTION */}
            <section id="hi">
              <h2 className="font-['Archivo_Black'] text-3xl text-[#0A0A0A] sm:text-5xl">Highlights</h2>
              <div id="hcards" className="mt-6 grid gap-6 sm:grid-cols-3">
                <div
                  className="tilt nb lift p-6"
                  style={{ background: '#FFD60A', '--r': '-1deg' }}
                >
                  <p className="font-['Archivo_Black'] text-6xl text-[#0A0A0A]">5</p>
                  <p className="mt-2 font-bold text-[#0A0A0A]">Core modules</p>
                </div>
                <div
                  className="tilt nb lift p-6"
                  style={{ background: '#B5F23D', '--r': '1deg' }}
                >
                  <p className="font-['Archivo_Black'] text-6xl text-[#0A0A0A]">120+</p>
                  <p className="mt-2 font-bold text-[#0A0A0A]">Commits traced</p>
                </div>
                <div
                  className="tilt nb lift p-6"
                  style={{ background: '#FF9EC4', '--r': '-.5deg' }}
                >
                  <p className="font-['Archivo_Black'] text-6xl text-[#0A0A0A]">2</p>
                  <p className="mt-2 font-bold text-[#0A0A0A]">Review hotspots</p>
                </div>
              </div>
            </section>

            {/* ARCHITECTURE SECTION */}
            <section id="arch">
              <h2 className="font-['Archivo_Black'] text-3xl text-[#0A0A0A] sm:text-5xl">Architecture</h2>
              <p className="mt-3 font-medium text-[#0A0A0A]">Tap a module node to inspect its internal role.</p>
              <div
                className="nb mt-6 grid gap-0 overflow-hidden bg-white md:grid-cols-[1.3fr_1fr]"
                style={{ boxShadow: '8px 8px 0 #0A0A0A' }}
              >
                <svg
                  id="map"
                  viewBox="0 0 400 260"
                  className="w-full border-b-[3px] border-[#0A0A0A] bg-[#FFF5DC] md:border-b-0 md:border-r-[3px]"
                  role="group"
                  aria-label="Module map"
                >
                  {/* Connecting dashed lines */}
                  <g stroke="#0A0A0A" strokeWidth="3" fill="none">
                    {P.slice(1).map((p, idx) => (
                      <path key={idx} className="dash" d={`M200 130L${p[0]} ${p[1]}`} />
                    ))}
                  </g>
                  {/* Module Nodes */}
                  {modules.map((m, i) => {
                    const isSelected = selectedModuleIdx === i;
                    const coords = P[i];
                    return (
                      <g
                        key={m.n}
                        className={`node ${isSelected ? 'on' : ''}`}
                        tabIndex={0}
                        role="button"
                        aria-label={`${m.n} module`}
                        onClick={() => setSelectedModuleIdx(i)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedModuleIdx(i);
                          }
                        }}
                      >
                        {i === 0 && (
                          <circle className="ring" cx="200" cy="130" r="30" fill="none" stroke="#FF5C3A" strokeWidth="3" />
                        )}
                        <rect
                          x={coords[0] - (i ? 42 : 36)}
                          y={coords[1] - (i ? 22 : 24)}
                          width={i ? 84 : 72}
                          height={i ? 44 : 48}
                          rx="10"
                          fill={isSelected ? '#FFD60A' : i === 0 ? '#FF5C3A' : '#FFFFFF'}
                          stroke="#0A0A0A"
                          strokeWidth="3"
                        />
                        <text
                          x={coords[0]}
                          y={coords[1] + 5}
                          textAnchor="middle"
                          fontFamily="Space Mono"
                          fontWeight="700"
                          fontSize="13"
                          fill="#0A0A0A"
                        >
                          {m.n}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Module Details Pane */}
                <div className="p-6">
                  <p id="nname" className="font-['Archivo_Black'] text-3xl text-[#0A0A0A]">
                    {modules[selectedModuleIdx]?.n}
                  </p>
                  <p id="ndesc" className="mt-3 font-medium leading-relaxed text-[#0A0A0A]">
                    {modules[selectedModuleIdx]?.d}
                  </p>
                  <p id="nmeta" className="mt-4 font-mono text-xs font-bold text-[#5B5B52]">
                    {modules[selectedModuleIdx]?.files} FILES, {modules[selectedModuleIdx]?.commits} RECENT COMMITS
                  </p>
                </div>
              </div>
            </section>

            {/* RELEASE NOTES SECTION */}
            <section id="rel">
              <h2 className="font-['Archivo_Black'] text-3xl text-[#0A0A0A] sm:text-5xl">Release notes</h2>
              {/* Category Filter Pills */}
              <div className="mt-5 flex flex-wrap gap-2.5" id="flts" role="group" aria-label="Filter release notes">
                {['All', 'New', 'Improved', 'Fixed', 'Breaking'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setActiveFilter(tag)}
                    className={`flt nb press rounded-full px-4 py-1.5 text-sm font-bold text-[#0A0A0A] transition-colors ${
                      activeFilter === tag ? 'on bg-[#FFD60A]' : 'bg-white'
                    }`}
                    style={{ boxShadow: '3px 3px 0 #0A0A0A' }}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Notes List */}
              <ul id="notes" className="mt-6 space-y-4">
                {filteredNotes.map((note, i) => (
                  <li
                    key={i}
                    className="nb flex flex-wrap items-center gap-3 bg-white p-4"
                    style={{ boxShadow: '4px 4px 0 #0A0A0A' }}
                  >
                    <span
                      className="nb rounded-md px-2.5 py-0.5 text-xs font-bold text-[#0A0A0A]"
                      style={{
                        background: noteColors[note.t] || '#FFD60A',
                        boxShadow: '2px 2px 0 #0A0A0A',
                      }}
                    >
                      {note.t}
                    </span>
                    <span className="min-w-0 flex-1 font-bold text-[#0A0A0A]">{note.x}</span>
                    <code className="font-mono text-xs font-bold text-[#5B5B52]">{note.sha}</code>
                  </li>
                ))}
              </ul>
            </section>

            {/* ACTIVITY SECTION */}
            <section id="act">
              <h2 className="font-['Archivo_Black'] text-3xl text-[#0A0A0A] sm:text-5xl">Activity</h2>
              <div className="nb mt-6 bg-white p-6" style={{ boxShadow: '8px 8px 0 #0A0A0A' }}>
                <p className="font-bold text-[#0A0A0A]">Commits per week, last 26 weeks</p>
                <div
                  id="bars"
                  className="mt-4 flex h-40 items-end gap-1 sm:gap-1.5"
                  role="img"
                  aria-label="Weekly commit bar chart"
                >
                  {[32, 45, 18, 67, 89, 44, 52, 90, 76, 54, 38, 62, 85, 95, 70, 48, 64, 82, 91, 58, 43, 77, 88, 65, 72, 84].map(
                    (val, idx) => (
                      <i
                        key={idx}
                        className="flex-1 border-[3px] border-[#0A0A0A]"
                        style={{
                          height: `${val}%`,
                          backgroundColor: COL[idx % 3],
                        }}
                      />
                    )
                  )}
                </div>

                <p className="mt-8 font-bold text-[#0A0A0A]">Languages</p>
                <div id="langs" className="mt-3 flex h-9 overflow-hidden rounded-lg border-[3px] border-[#0A0A0A]">
                  <i className="block h-full border-r-[3px] border-[#0A0A0A]" style={{ width: '62%', background: COL[0] }} />
                  <i className="block h-full border-r-[3px] border-[#0A0A0A]" style={{ width: '26%', background: COL[1] }} />
                  <i className="block h-full" style={{ width: '12%', background: COL[2] }} />
                </div>
                <ul id="lleg" className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-[#0A0A0A]">
                  <li className="flex items-center gap-2">
                    <i className="h-4 w-4 border-[3px] border-[#0A0A0A]" style={{ background: COL[0] }} />
                    TypeScript 62%
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="h-4 w-4 border-[3px] border-[#0A0A0A]" style={{ background: COL[1] }} />
                    JavaScript 26%
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="h-4 w-4 border-[3px] border-[#0A0A0A]" style={{ background: COL[2] }} />
                    Other 12%
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t-[3px] border-[#0A0A0A] bg-[#0A0A0A] px-5 py-10 text-[#FFF5DC]">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <p className="font-['Archivo_Black'] text-3xl text-[#FFD60A]">GitVision AI</p>
          <p className="flex items-center gap-2.5 rounded-full border-[3px] border-[#FFF5DC] bg-[#B5F23D] px-4 py-2 text-xs font-bold text-[#0A0A0A]">
            <span className="gv-blink h-2.5 w-2.5 rounded-full border-2 border-[#0A0A0A] bg-[#12B76A]" />
            All Systems Operational
          </p>
        </div>
      </footer>
    </div>
  );
}
