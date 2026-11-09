import { useLandingMotion } from '../hooks/useLandingMotion.ts';
import TerminalPreview from '../components/landing/TerminalPreview.tsx';
import '../styles/home.css';
import LandingAnalyzer from '../components/landing/LandingAnalyzer.tsx';

export default function Home() {
  const cursorRef = useLandingMotion();

  return (
    <div className="gitvision-root relative min-h-screen font-sans selection:bg-[#0A0A0A] selection:text-[#FFD60A]">

      <div
        ref={cursorRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-50 hidden h-[60px] w-[60px] rounded-full border-[3px] border-[#0A0A0A] bg-[#FFD60A] opacity-90 md:block"
        style={{ transform: 'translate(-100px, -100px)' }}
      />

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
              <span className="gv-headline-word" style={{ animationDelay: '0s' }}>Read</span>{' '}
              <span className="gv-headline-word" style={{ animationDelay: '0.2s' }}>any</span>{' '}
              <span className="gv-headline-word" style={{ animationDelay: '0.4s' }}>repo</span>{' '}
              <span className="gv-headline-word" style={{ animationDelay: '0.6s' }}>with</span>{' '}
              <span className="hl" style={{ animationDelay: '0.8s' }}>zero confusion.</span>
            </h1>
            <p
              className="gv-reveal mx-auto mt-7 max-w-2xl text-lg font-medium leading-relaxed text-[#0A0A0A] sm:text-xl"
              style={{ '--d': '.16s' }}
            >
              Paste a GitHub link. GitVision AI reads the code, the history and the docs, then hands you a clear overview and release notes in seconds.
            </p>

            <LandingAnalyzer />
          </div>
        </section>

        <div className="-rotate-1 overflow-hidden border-y-[3px] border-[#0A0A0A] bg-[#0A0A0A] py-4 text-[#FFD60A]" aria-hidden="true">
          <div className="marq font-['Archivo_Black'] text-2xl sm:text-3xl">
            <span className="whitespace-nowrap px-6">README SUMMARIES ✶ RELEASE NOTES ✶ ARCHITECTURE MAPS ✶ COMMIT TRANSLATIONS ✶ PLAIN LANGUAGE ✶ </span>
            <span className="whitespace-nowrap px-6">README SUMMARIES ✶ RELEASE NOTES ✶ ARCHITECTURE MAPS ✶ COMMIT TRANSLATIONS ✶ PLAIN LANGUAGE ✶ </span>
          </div>
        </div>

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

        <section id="preview" className="mx-auto max-w-5xl px-5 py-20 text-[#0A0A0A]">
          <div className="gv-reveal mb-10 text-center">
            <h2 className="font-['Archivo_Black'] text-4xl sm:text-6xl">Watch it <span className="hl">read.</span></h2>
            <p className="mx-auto mt-5 max-w-xl text-lg font-medium text-[#0A0A0A]">A repository goes in. Structured understanding comes out.</p>
          </div>
          <div className="nb gv-reveal overflow-hidden bg-[#0A0A0A] rounded-xl" style={{ boxShadow: '10px 10px 0 #FF5C3A' }}>
            <div className="flex items-center gap-2 border-b-[3px] border-[#0A0A0A] bg-[#FFD60A] px-4 py-3 text-[#0A0A0A]">
              <i className="h-4 w-4 rounded-full border-[3px] border-[#0A0A0A] bg-[#FF5C3A] inline-block" />
              <i className="h-4 w-4 rounded-full border-[3px] border-[#0A0A0A] bg-white inline-block" />
              <i className="h-4 w-4 rounded-full border-[3px] border-[#0A0A0A] bg-[#12B76A] inline-block" />
              <span className="ml-3 font-mono text-xs font-bold text-[#0A0A0A]">gitvision: acme/atlas</span>
            </div>
            <TerminalPreview />
          </div>
        </section>

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
