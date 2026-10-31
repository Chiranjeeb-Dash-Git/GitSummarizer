import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const [inputVal, setInputVal] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const termRef = useRef(null);
  const curRef = useRef(null);

  // Cursor following sticker
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
        curRef.current.style.transform = `translate(${cx - 30}px, ${cy - 30}px)`;
      }
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Reveals intersection observer
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.15 },
    );
    document.querySelectorAll('.gv-reveal').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Parallax shapes
  useEffect(() => {
    const rm = matchMedia('(prefers-reduced-motion:reduce)').matches;
    if (rm) return;
    const px = document.querySelectorAll('[data-speed]');
    let tick = false;

    const onScroll = () => {
      if (tick) return;
      tick = true;
      requestAnimationFrame(() => {
        px.forEach((el) => {
          const speed = parseFloat(el.getAttribute('data-speed') || '0');
          el.style.transform = `translate3d(0, ${window.scrollY * speed}px, 0)`;
        });
        tick = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Terminal animated type-in on view
  useEffect(() => {
    const term = termRef.current;
    if (!term) return;

    const L = [
      '<span class="text-coral">$</span> gitvision read github.com/acme/atlas --for maintainers',
      '<span class="text-lime">✓</span> <span class="text-paper/70">resolved acme/atlas (TypeScript, 12.4k stars)</span>',
      '<span class="text-lime">✓</span> <span class="text-paper/70">read README, 38 top-level files, 120 commits</span>',
      '',
      '{',
      '  <span class="text-sun">"summary"</span>: <span class="text-lime">"A multi-tenant billing engine with a ledger core."</span>,',
      '  <span class="text-sun">"modules"</span>: [<span class="text-lime">"ledger"</span>, <span class="text-lime">"invoicing"</span>, <span class="text-lime">"webhooks"</span>],',
      '  <span class="text-sun">"hotspots"</span>: <span class="text-pink">3</span>, <span class="text-paper/60">// all inside /ledger</span>',
      '  <span class="text-sun">"risk"</span>: <span class="text-lime">"low"</span>',
      '}',
      '',
      '<span class="text-coral">→</span> release notes ready in <span class="text-sun">2.8s</span> <span class="gv-blink inline-block h-4 w-2 bg-sun align-[-2px]"></span>',
    ];

    let started = false;
    const rm = matchMedia('(prefers-reduced-motion:reduce)').matches;

    function type() {
      let i = 0;
      function next() {
        if (!term) return;
        term.innerHTML = L.slice(0, i + 1)
          .map((l) => `<div class="gv-tl in">${l || '&nbsp;'}</div>`)
          .join('');
        if (++i < L.length) setTimeout(next, rm ? 0 : 380);
      }
      next();
    }

    const obs = new IntersectionObserver(
      ([e], o) => {
        if (e.isIntersecting && !started) {
          started = true;
          type();
          o.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(term);
    return () => obs.disconnect();
  }, []);

  const handleAnalyze = (e) => {
    e?.preventDefault();
    const val = inputVal.trim();
    const m = val.match(
      /^(?:https?:\/\/)?(?:www\.)?(?:github\.com\/)?([\w.-]+)\/([\w.-]+?)(?:\.git)?(?:[\/?#].*)?$/i,
    );
    if (!m) {
      setErrorMsg('Enter a GitHub link such as github.com/owner/repo.');
      return;
    }
    setErrorMsg('');
    navigate(`/read?input=${encodeURIComponent(val)}&kind=overview&audience=learner`);
  };

  const handleChip = (u) => {
    setInputVal(u);
    navigate(`/read?input=${encodeURIComponent(u)}&kind=overview&audience=learner`);
  };

  return (
    <div className="gitvision-root relative min-h-screen font-sans selection:bg-[#0A0A0A] selection:text-[#FFD60A]">
      <style>{`
        .gitvision-root {
          background-color: #FFF5DC;
          background-image: radial-gradient(rgba(10,10,10,.16) 1.3px, transparent 1.3px);
          background-size: 22px 22px;
          color: #0A0A0A;
          font-family: 'Space Grotesk', system-ui, sans-serif;
          overflow-x: hidden;
        }
        .gitvision-root .nb {
          border: 3px solid #0A0A0A;
          border-radius: 12px;
          box-shadow: 6px 6px 0 #0A0A0A;
        }
        .gitvision-root .lift {
          transition: transform .18s cubic-bezier(.3,1.6,.5,1), box-shadow .18s;
        }
        .gitvision-root .lift:hover {
          transform: translate(-4px,-4px);
          box-shadow: 10px 10px 0 #0A0A0A;
        }
        .gitvision-root .press:active {
          transform: translate(5px,5px);
          box-shadow: 1px 1px 0 #0A0A0A;
        }
        .gitvision-root .hl {
          background: #FFD60A;
          padding: 0 .18em;
          box-decoration-break: clone;
          -webkit-box-decoration-break: clone;
          border-radius: 6px;
        }
        .gitvision-root .gv-shape {
          position: absolute;
          pointer-events: none;
        }
        .gitvision-root .gv-reveal {
          opacity: 0;
          transform: translateY(34px) rotate(var(--r,0deg));
          transition: opacity .5s, transform .6s cubic-bezier(.3,1.5,.5,1);
          transition-delay: var(--d,0s);
        }
        .gitvision-root .gv-reveal.in {
          opacity: 1;
          transform: rotate(var(--r,0deg));
        }
        .gitvision-root .marq {
          display: flex;
          width: max-content;
          animation: gv-marq 24s linear infinite;
        }
        @keyframes gv-marq { to { transform: translateX(-50%); } }
        .gitvision-root .gv-blink {
          animation: gv-blink 1.1s steps(2) infinite;
        }
        @keyframes gv-blink { 50% { opacity: .2; } }
        .gitvision-root .gv-spin {
          animation: gv-spin 14s linear infinite;
        }
        @keyframes gv-spin { to { transform: rotate(360deg); } }
        .gitvision-root .dash {
          stroke-dasharray: 6 7;
          animation: gv-dash 1s linear infinite;
        }
        @keyframes gv-dash { to { stroke-dashoffset: -26; } }
        .gitvision-root .gv-tl { opacity: 0; transition: opacity .2s; }
        .gitvision-root .gv-tl.in { opacity: 1; }
        @media(prefers-reduced-motion:reduce){
          .gitvision-root * { animation: none!important; transition: none!important; }
          .gitvision-root .gv-reveal, .gitvision-root .gv-tl { opacity: 1; }
        }
      `}</style>

      {/* Cursor Sticker */}
      <div
        ref={curRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-50 hidden h-[60px] w-[60px] rounded-full border-[3px] border-[#0A0A0A] bg-[#FFD60A] opacity-90 md:block"
        style={{ transform: 'translate(-100px, -100px)' }}
      />

      {/* HEADER NAVBAR */}
      <header className="sticky z-50 px-3 pt-3" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
        <nav className="nb mx-auto flex max-w-6xl items-center justify-between bg-white px-4 py-3" aria-label="Main">
          <a href="#top" className="flex items-center gap-2.5 font-['Archivo_Black'] text-xl text-[#0A0A0A] sm:text-2xl">
            <span className="grid h-9 w-9 place-items-center rounded-lg border-[3px] border-[#0A0A0A] bg-[#FFD60A] text-lg">◆</span>GitVision AI
          </a>
          <div className="hidden items-center gap-7 text-sm font-bold text-[#0A0A0A] md:flex">
            <a className="underline decoration-[3px] underline-offset-4 hover:bg-[#FFD60A]" href="#features">Features</a>
            <a className="underline decoration-[3px] underline-offset-4 hover:bg-[#FFD60A]" href="#preview">Console</a>
            <a className="underline decoration-[3px] underline-offset-4 hover:bg-[#FFD60A]" href="#proof">Proof</a>
          </div>
          <a
            href="#analyze"
            className="nb press lift rounded-lg bg-[#FF5C3A] px-4 py-2 text-sm font-bold text-[#0A0A0A] sm:px-5"
            style={{ boxShadow: '4px 4px 0 #0A0A0A' }}
          >
            Launch Console
          </a>
        </nav>
      </header>

      <main id="top" className="relative z-10">
        {/* HERO SECTION */}
        <section className="relative mx-auto max-w-6xl px-5 pb-20 pt-14 sm:pt-20">
          <svg
            className="gv-shape gv-spin left-0 top-6 hidden w-24 sm:block"
            data-speed=".14"
            viewBox="0 0 100 100"
            aria-hidden="true"
          >
            <path
              style={{ transformOrigin: '50px 50px' }}
              d="M50 4l12 28 30-4-20 22 16 26-30-6-8 28-8-28-30 6 16-26L8 28l30 4z"
              fill="#FFD60A"
              stroke="#0A0A0A"
              strokeWidth="4"
              strokeLinejoin="round"
            />
          </svg>
          <div
            className="gv-shape right-2 top-40 hidden h-20 w-20 rounded-full border-[3px] border-[#0A0A0A] bg-[#FF9EC4] sm:block"
            data-speed="-.1"
            aria-hidden="true"
          />
          <div
            className="gv-shape bottom-24 left-6 hidden h-14 w-14 rotate-12 border-[3px] border-[#0A0A0A] bg-[#B5F23D] sm:block"
            data-speed=".08"
            aria-hidden="true"
          />

          <div className="relative text-center">
            <span
              className="gv-reveal nb inline-block -rotate-2 bg-[#B5F23D] px-4 py-2 font-mono text-xs font-bold sm:text-sm text-[#0A0A0A]"
              style={{ '--r': '-2deg', boxShadow: '4px 4px 0 #0A0A0A' }}
            >
              ★ NEXT-GEN REPOSITORY INTELLIGENCE
            </span>
            <h1
              className="gv-reveal mx-auto mt-8 max-w-5xl font-['Archivo_Black'] text-[2.7rem] leading-[1.02] text-[#0A0A0A] sm:text-7xl lg:text-8xl"
              style={{ '--d': '.08s' }}
            >
              Read any repo with <span className="hl">zero confusion.</span>
            </h1>
            <p
              className="gv-reveal mx-auto mt-7 max-w-2xl text-lg font-medium leading-relaxed text-[#0A0A0A] sm:text-xl"
              style={{ '--d': '.16s' }}
            >
              Paste a GitHub link. GitVision AI reads the code, the history and the docs, then hands you a clear overview and release notes in seconds.
            </p>

            <div id="analyze" className="gv-reveal mx-auto mt-11 max-w-3xl" style={{ '--d': '.24s' }}>
              <form
                onSubmit={handleAnalyze}
                className="nb flex flex-col gap-3 bg-white p-3 sm:flex-row"
                style={{ boxShadow: '8px 8px 0 #0A0A0A' }}
                noValidate
              >
                <label htmlFor="u" className="sr-only">GitHub repository URL</label>
                <input
                  id="u"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="github.com/vercel/next.js"
                  className="min-w-0 flex-1 rounded-lg border-[3px] border-[#0A0A0A] bg-[#FFF5DC] px-4 py-3.5 font-mono text-sm font-bold text-[#0A0A0A] placeholder:text-[#5B5B52] focus:bg-[#FFD60A] focus:outline-none sm:text-base"
                />
                <button
                  id="go"
                  type="submit"
                  className="nb press lift rounded-lg bg-[#FF5C3A] px-8 py-3.5 font-['Archivo_Black'] text-lg text-[#0A0A0A]"
                  style={{ boxShadow: '4px 4px 0 #0A0A0A' }}
                >
                  Analyze
                </button>
              </form>
              {errorMsg && (
                <p id="err" className="mt-3 min-h-[1.5rem] font-bold text-[#FF5C3A]" role="alert">
                  {errorMsg}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2.5 text-sm font-bold text-[#0A0A0A]">
                <span>Try:</span>
                <button
                  type="button"
                  onClick={() => handleChip('expressjs/express')}
                  className="chip nb press lift rounded-full bg-white px-4 py-1.5 text-[#0A0A0A]"
                  style={{ boxShadow: '3px 3px 0 #0A0A0A' }}
                >
                  expressjs/express
                </button>
                <button
                  type="button"
                  onClick={() => handleChip('vitejs/vite')}
                  className="chip nb press lift rounded-full bg-white px-4 py-1.5 text-[#0A0A0A]"
                  style={{ boxShadow: '3px 3px 0 #0A0A0A' }}
                >
                  vitejs/vite
                </button>
                <button
                  type="button"
                  onClick={() => handleChip('facebook/react')}
                  className="chip nb press lift rounded-full bg-white px-4 py-1.5 text-[#0A0A0A]"
                  style={{ boxShadow: '3px 3px 0 #0A0A0A' }}
                >
                  facebook/react
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <div className="-rotate-1 overflow-hidden border-y-[3px] border-[#0A0A0A] bg-[#0A0A0A] py-4 text-[#FFD60A]" aria-hidden="true">
          <div className="marq font-['Archivo_Black'] text-2xl sm:text-3xl">
            <span className="whitespace-nowrap px-6">README SUMMARIES ✶ RELEASE NOTES ✶ ARCHITECTURE MAPS ✶ COMMIT TRANSLATIONS ✶ PLAIN LANGUAGE ✶ </span>
            <span className="whitespace-nowrap px-6">README SUMMARIES ✶ RELEASE NOTES ✶ ARCHITECTURE MAPS ✶ COMMIT TRANSLATIONS ✶ PLAIN LANGUAGE ✶ </span>
          </div>
        </div>

        {/* BENTO */}
        <section id="features" className="mx-auto max-w-6xl px-5 py-24 text-[#0A0A0A]">
          <div className="gv-reveal max-w-3xl">
            <h2 className="font-['Archivo_Black'] text-4xl leading-[1.05] sm:text-6xl">Big brains. <span className="hl">Zero jargon.</span></h2>
            <p className="mt-5 text-lg font-medium text-[#0A0A0A]">Three tools that turn a wall of code into something you can actually read.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-6">
            <article className="nb lift gv-reveal bg-[#FFD60A] p-7 md:col-span-4" style={{ '--d': '.04s' }}>
              <h3 className="font-['Archivo_Black'] text-3xl">Instant README summaries</h3>
              <p className="mt-3 max-w-md font-medium text-[#0A0A0A]">What the project does, what you need before starting, and where to look first, written for the way you work.</p>
              <div className="mt-7 space-y-3" aria-hidden="true">
                <div className="h-4 w-3/4 rounded-md border-[3px] border-[#0A0A0A] bg-white" />
                <div className="h-4 w-full rounded-md border-[3px] border-[#0A0A0A] bg-white" />
                <div className="h-4 w-2/3 rounded-md border-[3px] border-[#0A0A0A] bg-[#FF5C3A]" />
              </div>
            </article>
            <article className="nb lift gv-reveal bg-[#FF9EC4] p-7 md:col-span-2" style={{ '--d': '.12s' }}>
              <h3 className="font-['Archivo_Black'] text-3xl">Commit to release note</h3>
              <ul className="mt-5 space-y-4 text-sm text-[#0A0A0A]">
                <li><code className="font-mono text-xs font-bold">fix: npe in auth mw</code><p className="mt-1 font-bold">Fixed a crash that signed people out.</p></li>
                <li><code className="font-mono text-xs font-bold">perf(db): add idx</code><p className="mt-1 font-bold">Dashboards load faster.</p></li>
                <li><code className="font-mono text-xs font-bold">feat!: drop node 16</code><p className="mt-1 font-bold">Breaking: upgrade to Node 18.</p></li>
              </ul>
            </article>
            <article className="nb lift gv-reveal bg-[#B5F23D] p-7 md:col-span-3" style={{ '--d': '.08s' }}>
              <h3 className="font-['Archivo_Black'] text-3xl">Architecture visualizer</h3>
              <p className="mt-3 font-medium text-[#0A0A0A]">See how the modules connect before you open a single file.</p>
              <svg viewBox="0 0 320 130" className="mt-5 w-full" role="img" aria-label="Diagram of connected modules">
                <g stroke="#0A0A0A" strokeWidth="3" fill="none"><path className="dash" d="M70 65H132" /><path className="dash" d="M188 65H250" /><path className="dash" d="M160 32V44" /><path className="dash" d="M160 86V98" /></g>
                <g stroke="#0A0A0A" strokeWidth="3"><rect x="18" y="46" width="52" height="38" rx="8" fill="#fff" /><rect x="250" y="46" width="52" height="38" rx="8" fill="#fff" /><rect x="132" y="6" width="56" height="26" rx="7" fill="#FFD60A" /><rect x="132" y="98" width="56" height="26" rx="7" fill="#FF9EC4" /><circle cx="160" cy="65" r="24" fill="#FF5C3A" /></g>
              </svg>
            </article>
            <article className="nb lift gv-reveal bg-white p-7 md:col-span-3" style={{ '--d': '.16s' }}>
              <h3 className="font-['Archivo_Black'] text-3xl">Written for your role</h3>
              <p className="mt-3 font-medium text-[#0A0A0A]">One repository, three voices. Switch instantly and keep the result.</p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold text-[#0A0A0A]">
                <span className="nb rounded-full bg-[#FFD60A] px-4 py-1.5" style={{ boxShadow: '3px 3px 0 #0A0A0A' }}>Learners</span>
                <span className="nb rounded-full bg-[#FF9EC4] px-4 py-1.5" style={{ boxShadow: '3px 3px 0 #0A0A0A' }}>Product teams</span>
                <span className="nb rounded-full bg-[#B5F23D] px-4 py-1.5" style={{ boxShadow: '3px 3px 0 #0A0A0A' }}>Maintainers</span>
              </div>
            </article>
          </div>
        </section>

        {/* TERMINAL */}
        <section id="preview" className="mx-auto max-w-5xl px-5 py-20 text-[#0A0A0A]">
          <div className="gv-reveal mb-10 text-center">
            <h2 className="font-['Archivo_Black'] text-4xl sm:text-6xl">Watch it <span className="hl">read.</span></h2>
            <p className="mx-auto mt-5 max-w-xl text-lg font-medium text-[#0A0A0A]">A repository goes in. Structured understanding comes out.</p>
          </div>
          <div className="nb gv-reveal overflow-hidden bg-[#0A0A0A]" style={{ boxShadow: '10px 10px 0 #FF5C3A' }}>
            <div className="flex items-center gap-2 border-b-[3px] border-[#0A0A0A] bg-[#FFD60A] px-4 py-3 text-[#0A0A0A]">
              <i className="h-4 w-4 rounded-full border-[3px] border-[#0A0A0A] bg-[#FF5C3A]" />
              <i className="h-4 w-4 rounded-full border-[3px] border-[#0A0A0A] bg-white" />
              <i className="h-4 w-4 rounded-full border-[3px] border-[#0A0A0A] bg-[#12B76A]" />
              <span className="ml-3 font-mono text-xs font-bold">gitvision: acme/atlas</span>
            </div>
            <pre ref={termRef} className="min-h-[22rem] overflow-x-auto p-5 font-mono text-[13px] leading-7 text-white sm:p-7 sm:text-sm" aria-label="Terminal output sample" />
          </div>
        </section>

        {/* PROOF */}
        <section id="proof" className="mx-auto max-w-6xl px-5 py-24 text-[#0A0A0A]">
          <h2 className="gv-reveal max-w-2xl font-['Archivo_Black'] text-4xl leading-[1.05] sm:text-6xl">Hours back, <span className="hl">every week.</span></h2>
          <div className="mt-12 grid gap-7 md:grid-cols-3">
            <figure className="nb lift gv-reveal bg-[#FF9EC4] p-7" style={{ '--r': '-1.5deg', '--d': '.04s' }}>
              <p className="font-['Archivo_Black'] text-6xl">62%</p>
              <p className="font-bold">faster onboarding</p>
              <blockquote className="mt-5 font-medium leading-relaxed">“New hires understand a service on day one instead of week two.”</blockquote>
              <figcaption className="mt-4 text-sm font-bold">Staff engineer, platform team</figcaption>
            </figure>
            <figure className="nb lift gv-reveal bg-[#B5F23D] p-7" style={{ '--r': '1deg', '--d': '.12s' }}>
              <p className="font-['Archivo_Black'] text-6xl">4×</p>
              <p className="font-bold">quicker changelogs</p>
              <blockquote className="mt-5 font-medium leading-relaxed">“Release notes used to take an afternoon. Now they’re a review.”</blockquote>
              <figcaption className="mt-4 text-sm font-bold">Engineering manager</figcaption>
            </figure>
            <figure className="nb lift gv-reveal bg-[#FFD60A] p-7" style={{ '--r': '-.5deg', '--d': '.2s' }}>
              <p className="font-['Archivo_Black'] text-6xl">5 min</p>
              <p className="font-bold">to vet a dependency</p>
              <blockquote className="mt-5 font-medium leading-relaxed">“I can judge whether a library is worth adopting before my coffee cools.”</blockquote>
              <figcaption className="mt-4 text-sm font-bold">Open-source maintainer</figcaption>
            </figure>
          </div>
          <p className="mt-7 text-xs font-bold text-[#5B5B52]">Illustrative sample quotes for layout. Replace with real customer words and figures before launch.</p>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t-[3px] border-[#0A0A0A] bg-[#0A0A0A] px-5 py-12 text-[#FFF5DC]">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <p className="font-['Archivo_Black'] text-3xl text-[#FFD60A]">GitVision AI</p>
            <p className="mt-1 text-sm font-medium">Repository intelligence, made obvious.</p>
          </div>
          <div className="flex flex-wrap gap-x-7 gap-y-2 text-sm font-bold">
            <a className="underline decoration-2 underline-offset-4 hover:text-[#FFD60A]" href="#features">Features</a>
            <a className="underline decoration-2 underline-offset-4 hover:text-[#FFD60A]" href="#preview">Console</a>
            <a className="underline decoration-2 underline-offset-4 hover:text-[#FFD60A]" href="#proof">Proof</a>
          </div>
          <p className="flex items-center gap-2.5 rounded-full border-[3px] border-[#FFF5DC] bg-[#B5F23D] px-4 py-2 text-xs font-bold text-[#0A0A0A]">
            <span className="gv-blink h-2.5 w-2.5 rounded-full border-2 border-[#0A0A0A] bg-[#12B76A]" />
            All Systems Operational
          </p>
        </div>
        <p className="mx-auto mt-10 max-w-6xl text-xs font-medium text-[#FFF5DC]/70">© 2026 GitVision AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
