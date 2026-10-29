# GitVision AI: Landing Page

A luxury, dark-editorial landing page for **GitVision AI**. It ships as one self-contained file with Tailwind CSS (CDN, config embedded) and no build step.

## Run it

1. Copy the source at the bottom of this file into a new file named `index.html`.
2. Double-click it to open in a browser, or serve the folder with `npx serve`.

An internet connection is needed for the Tailwind script and Google Fonts.

## Design system

| Token | Value | Use |
|---|---|---|
| obsidian | `#080808` | Page background |
| charcoal | `#121212` | Glass panels |
| gold | `#D4AF37` | Accents, borders, CTA |
| amber | `#E5A93B` | Highlights, warnings |
| emerald | `#059669` | AI and success states |
| ivory | `#F4F4F0` | Headings |
| stone | `#A1A1AA` | Body text |

The Tailwind config replaces the default palette, so no blue or purple class can be used. Fonts: Cormorant Garamond (display), Manrope (body), JetBrains Mono (code).

## What is inside

- Cursor-following glow and floating gold particles
- Sticky glass navbar with the "Launch Console" button
- Hero with the animated scan simulation (URL input, five stages, emerald-to-gold progress bar)
- Bento grid: README summaries, commit-to-release-note translation, architecture visualizer, role modes
- Terminal preview that types in when scrolled into view
- Proof cards and a footer with the "All Systems Operational" indicator
- Scroll reveals, parallax rings, tile spotlights, and full `prefers-reduced-motion` support

## Before launch

- The scan result is a **simulation**. Connect the form to your backend (`POST /api/v1/summaries/stream` in the GitSummarizer spec) to make it real.
- The three testimonials and their figures are placeholders. Replace them with real quotes.
- For production, replace the Tailwind CDN script with the Tailwind CLI or Vite build.

## Source (`index.html`)

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>GitVision AI: see any repository with absolute clarity</title>
<meta name="description" content="GitVision AI turns complex GitHub repositories into crystal-clear overviews and release notes.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com/3.4.17"></script>
<script>
tailwind.config = { theme: {
  colors: { transparent: 'transparent', current: 'currentColor', obsidian: '#080808', charcoal: '#121212',
    gold: '#D4AF37', amber: '#E5A93B', emerald: '#059669', ivory: '#F4F4F0', stone: '#A1A1AA' },
  extend: { fontFamily: { display: ['Cormorant Garamond', 'Georgia', 'serif'], sans: ['Manrope', 'system-ui', 'sans-serif'], mono: ['JetBrains Mono', 'ui-monospace', 'monospace'] } } } };
</script>
<style>
:root{color-scheme:dark;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
html{scroll-behavior:smooth;scroll-padding-top:90px}
body{background:#080808;color:#F4F4F0;font-family:Manrope,system-ui,sans-serif;overflow-x:hidden;-webkit-font-smoothing:antialiased}
::selection{background:#D4AF37;color:#080808}
:focus-visible{outline:2px solid #D4AF37;outline-offset:3px}
.glass{background:rgba(18,18,18,.55);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(212,175,55,.2)}
.goldtext{background:linear-gradient(100deg,#F4E6B0,#D4AF37 45%,#E5A93B);-webkit-background-clip:text;background-clip:text;color:transparent}
.btn-gold{background:linear-gradient(135deg,#E5C45A,#D4AF37 55%,#B8901F);color:#080808;font-weight:700;transition:transform .3s,box-shadow .3s}
.btn-gold:hover{transform:translateY(-2px);box-shadow:0 12px 36px -10px rgba(212,175,55,.6)}
.btn-gold:disabled{opacity:.7;transform:none}
#glow{position:fixed;inset:0;pointer-events:none;z-index:0;background:radial-gradient(560px circle at var(--gx,50%) var(--gy,30%),rgba(212,175,55,.14),rgba(5,150,105,.06) 45%,transparent 72%)}
.dot{position:fixed;width:3px;height:3px;border-radius:50%;background:#D4AF37;opacity:.35;pointer-events:none;z-index:0;animation:drift var(--t) ease-in-out infinite alternate}
@keyframes drift{to{transform:translate(var(--x),var(--y))}}
.reveal{opacity:0;transform:translateY(30px);transition:opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1);transition-delay:var(--d,0s)}
.reveal.in{opacity:1;transform:none}
.tile{position:relative;transition:transform .5s cubic-bezier(.16,1,.3,1),border-color .4s,box-shadow .5s}
.tile:hover{transform:translateY(-8px);border-color:rgba(212,175,55,.55);box-shadow:0 34px 60px -34px rgba(212,175,55,.3)}
.tile::before{content:"";position:absolute;inset:0;border-radius:inherit;background:radial-gradient(340px circle at var(--mx,50%) var(--my,0%),rgba(212,175,55,.13),transparent 60%);opacity:0;transition:opacity .4s;pointer-events:none}
.tile:hover::before{opacity:1}
.pulse{animation:pulse 2s ease-in-out infinite}@keyframes pulse{50%{opacity:.3}}
.sweep{position:absolute;left:0;right:0;height:90px;top:-90px;background:linear-gradient(180deg,transparent,rgba(5,150,105,.16),rgba(212,175,55,.22),transparent);animation:sweep 2.2s linear infinite;pointer-events:none}
@keyframes sweep{to{top:100%}}
.bar{height:100%;width:0;background:linear-gradient(90deg,#059669,#D4AF37);box-shadow:0 0 18px rgba(212,175,55,.65);transition:width .15s linear}
.st{opacity:.4;transition:opacity .4s}.st[data-s=active],.st[data-s=done]{opacity:1}
.st[data-s=done] i{background:#059669;border-color:#059669}.st[data-s=active] i{border-color:#D4AF37;box-shadow:0 0 12px #D4AF37}
.dash{stroke-dasharray:5 6;animation:dash 1.4s linear infinite}@keyframes dash{to{stroke-dashoffset:-22}}
.tl{opacity:0;transform:translateX(-8px);transition:.5s}.tl.in{opacity:1;transform:none}
.caret{display:inline-block;width:8px;height:15px;background:#D4AF37;vertical-align:-2px;animation:pulse 1s steps(2) infinite}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}.reveal,.tl{opacity:1;transform:none}.bar{width:100%}}
</style>
</head>
<body>
<div id="glow" aria-hidden="true"></div>

<header class="sticky z-50 px-4 pt-3" style="top:env(safe-area-inset-top,0px)">
  <nav class="glass mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 py-3 sm:px-6" aria-label="Main">
    <a href="#top" class="flex items-center gap-2.5 font-display text-2xl font-semibold tracking-wide">
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 2 29 16 16 30 3 16Z" fill="none" stroke="#D4AF37" stroke-width="1.8"/><path d="M16 9 22 16 16 23 10 16Z" fill="#059669"/></svg>
      GitVision<span class="goldtext">&nbsp;AI</span>
    </a>
    <div class="hidden items-center gap-8 text-sm text-stone md:flex">
      <a class="transition hover:text-ivory" href="#features">Capabilities</a>
      <a class="transition hover:text-ivory" href="#preview">Console</a>
      <a class="transition hover:text-ivory" href="#proof">Proof</a>
    </div>
    <a href="#analyze" class="btn-gold rounded-full px-5 py-2.5 text-sm">Launch Console</a>
  </nav>
</header>

<main id="top" class="relative z-10">
  <!-- HERO -->
  <section class="relative mx-auto max-w-6xl px-5 pb-24 pt-16 text-center sm:pt-24">
    <div class="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full border border-gold/20" data-speed=".12" aria-hidden="true"></div>
    <div class="pointer-events-none absolute -right-20 top-48 h-64 w-64 rounded-full border border-emerald/30" data-speed="-.1" aria-hidden="true"></div>
    <span class="glass reveal inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-xs font-semibold tracking-[.18em] text-gold">
      <span class="pulse h-1.5 w-1.5 rounded-full bg-emerald"></span>NEXT-GEN REPOSITORY INTELLIGENCE
    </span>
    <h1 class="reveal mx-auto mt-8 max-w-4xl font-display text-5xl font-semibold leading-[.98] sm:text-7xl lg:text-8xl" style="--d:.1s">
      See every repository with <span class="goldtext italic">absolute clarity.</span>
    </h1>
    <p class="reveal mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-stone" style="--d:.2s">
      Paste a GitHub link. GitVision AI reads the code, the history and the docs, then hands you a crystal-clear overview and release notes in seconds.
    </p>

    <div id="analyze" class="reveal mx-auto mt-12 max-w-3xl" style="--d:.3s">
      <form id="f" class="glass flex flex-col gap-2 rounded-2xl p-2 shadow-[0_30px_80px_-40px_rgba(212,175,55,.35)] sm:flex-row" novalidate>
        <label for="u" class="sr-only">GitHub repository URL</label>
        <input id="u" autocomplete="off" spellcheck="false" placeholder="github.com/vercel/next.js" class="min-w-0 flex-1 rounded-xl bg-transparent px-5 py-4 font-mono text-sm text-ivory placeholder:text-stone/70 focus:outline-none sm:text-base">
        <button id="go" class="btn-gold rounded-xl px-8 py-4 text-base" type="submit">Analyze</button>
      </form>
      <p id="err" class="mt-3 min-h-[1.25rem] text-sm text-amber" role="alert"></p>
      <div class="mt-1 flex flex-wrap justify-center gap-2 text-xs text-stone">
        <span class="py-2">Try</span>
        <button class="chip glass rounded-full px-3.5 py-2 transition hover:text-gold" data-u="expressjs/express">expressjs/express</button>
        <button class="chip glass rounded-full px-3.5 py-2 transition hover:text-gold" data-u="vitejs/vite">vitejs/vite</button>
        <button class="chip glass rounded-full px-3.5 py-2 transition hover:text-gold" data-u="facebook/react">facebook/react</button>
      </div>
    </div>

    <div id="scan" class="glass relative mx-auto mt-10 hidden max-w-3xl overflow-hidden rounded-3xl p-6 text-left sm:p-8" aria-live="polite">
      <div class="sweep" id="sweep" aria-hidden="true"></div>
      <div class="relative">
        <div class="flex items-center justify-between gap-4">
          <p class="font-mono text-sm text-gold" id="repo"></p>
          <p class="text-xs text-stone">Simulated preview</p>
        </div>
        <div class="mt-4 h-1.5 overflow-hidden rounded-full bg-ivory/10"><div class="bar" id="bar"></div></div>
        <ul id="stages" class="mt-6 grid gap-3 text-sm sm:grid-cols-2"></ul>
        <div id="result" class="mt-7 hidden border-t border-gold/20 pt-6">
          <p class="flex items-center gap-2 text-sm font-semibold text-emerald"><span class="h-2 w-2 rounded-full bg-emerald"></span>Overview ready</p>
          <ul id="facts" class="mt-4 space-y-3 text-[15px] leading-relaxed text-ivory/90"></ul>
        </div>
      </div>
    </div>
  </section>

  <!-- BENTO -->
  <section id="features" class="mx-auto max-w-6xl px-5 py-24">
    <div class="reveal max-w-2xl">
      <h2 class="font-display text-4xl font-semibold leading-tight sm:text-6xl">Intelligence, <span class="goldtext italic">distilled.</span></h2>
      <p class="mt-5 text-lg text-stone">Three capabilities that turn a wall of code into something you can actually read.</p>
    </div>
    <div class="mt-14 grid gap-5 md:grid-cols-6">
      <article class="tile glass reveal rounded-3xl p-8 md:col-span-4" style="--d:.05s">
        <h3 class="font-display text-3xl font-semibold">Instant README summaries</h3>
        <p class="mt-3 max-w-md text-stone">What the project does, what you need before starting, and where to look first, written for the way you work.</p>
        <div class="mt-8 space-y-3" aria-hidden="true">
          <div class="h-2.5 w-3/4 rounded-full bg-gold/70"></div><div class="h-2.5 w-full rounded-full bg-ivory/15"></div>
          <div class="h-2.5 w-5/6 rounded-full bg-ivory/15"></div><div class="h-2.5 w-2/3 rounded-full bg-emerald/70"></div>
        </div>
      </article>
      <article class="tile glass reveal rounded-3xl p-8 md:col-span-2" style="--d:.15s">
        <h3 class="font-display text-3xl font-semibold">Commit to release note</h3>
        <ul class="mt-6 space-y-4 text-sm">
          <li><code class="font-mono text-xs text-stone">fix: npe in auth mw</code><p class="mt-1 text-ivory">Fixed a crash that signed people out.</p></li>
          <li><code class="font-mono text-xs text-stone">perf(db): add idx</code><p class="mt-1 text-ivory">Dashboards now load faster.</p></li>
          <li><code class="font-mono text-xs text-stone">feat!: drop node 16</code><p class="mt-1 text-amber">Breaking: upgrade to Node 18.</p></li>
        </ul>
      </article>
      <article class="tile glass reveal rounded-3xl p-8 md:col-span-3" style="--d:.1s">
        <h3 class="font-display text-3xl font-semibold">Architecture visualizer</h3>
        <p class="mt-3 text-stone">See how modules connect before you open a single file.</p>
        <svg viewBox="0 0 320 130" class="mt-6 w-full" role="img" aria-label="Diagram of connected modules">
          <g stroke="#D4AF37" stroke-opacity=".7" fill="none"><path class="dash" d="M70 65H140"/><path class="dash" d="M180 65H250"/><path class="dash" d="M160 30V50"/><path class="dash" d="M160 80V100"/></g>
          <g fill="#121212" stroke="#D4AF37"><rect x="20" y="48" width="50" height="34" rx="9"/><rect x="250" y="48" width="50" height="34" rx="9"/><rect x="135" y="8" width="50" height="24" rx="8"/><rect x="135" y="98" width="50" height="24" rx="8"/></g>
          <circle cx="160" cy="65" r="22" fill="#059669"/><circle cx="160" cy="65" r="30" fill="none" stroke="#059669" stroke-opacity=".5"/>
        </svg>
      </article>
      <article class="tile glass reveal rounded-3xl p-8 md:col-span-3" style="--d:.2s">
        <h3 class="font-display text-3xl font-semibold">Written for your role</h3>
        <p class="mt-3 text-stone">One repository, three voices. Switch instantly and keep the result.</p>
        <div class="mt-7 flex flex-wrap gap-2.5 text-sm">
          <span class="rounded-full border border-gold/50 px-4 py-2 text-gold">Learners</span>
          <span class="rounded-full border border-gold/20 px-4 py-2 text-stone">Product teams</span>
          <span class="rounded-full border border-gold/20 px-4 py-2 text-stone">Maintainers</span>
        </div>
        <p class="mt-6 flex items-center gap-2 text-sm text-emerald"><span class="pulse h-2 w-2 rounded-full bg-emerald"></span>Streaming, cached and shareable by link</p>
      </article>
    </div>
  </section>

  <!-- TERMINAL -->
  <section id="preview" class="mx-auto max-w-5xl px-5 py-24">
    <div class="reveal mb-12 text-center">
      <h2 class="font-display text-4xl font-semibold sm:text-6xl">Watch it <span class="goldtext italic">read.</span></h2>
      <p class="mx-auto mt-5 max-w-xl text-stone">A repository goes in. Structured understanding comes out.</p>
    </div>
    <div class="glass reveal overflow-hidden rounded-3xl shadow-[0_40px_90px_-40px_rgba(5,150,105,.35)]">
      <div class="flex items-center gap-2 border-b border-gold/15 px-5 py-3.5">
        <i class="h-3 w-3 rounded-full bg-gold/80"></i><i class="h-3 w-3 rounded-full bg-stone/50"></i><i class="h-3 w-3 rounded-full bg-emerald/80"></i>
        <span class="ml-3 font-mono text-xs text-stone">gitvision: acme/atlas</span>
      </div>
      <pre id="term" class="min-h-[22rem] overflow-x-auto p-6 font-mono text-[13px] leading-7 sm:text-sm" aria-label="Terminal output sample"></pre>
    </div>
  </section>

  <!-- PROOF -->
  <section id="proof" class="mx-auto max-w-6xl px-5 py-24">
    <h2 class="reveal max-w-2xl font-display text-4xl font-semibold leading-tight sm:text-6xl">Hours back, <span class="goldtext italic">every week.</span></h2>
    <div class="mt-12 grid gap-5 md:grid-cols-3">
      <figure class="glass tile reveal rounded-3xl p-8" style="--d:.05s"><p class="goldtext font-display text-6xl font-semibold">62%</p><p class="text-sm text-stone">faster onboarding</p><blockquote class="mt-6 leading-relaxed text-ivory/90">“New hires understand a service on day one instead of week two.”</blockquote><figcaption class="mt-5 text-sm text-stone">Staff engineer, platform team</figcaption></figure>
      <figure class="glass tile reveal rounded-3xl p-8" style="--d:.15s"><p class="goldtext font-display text-6xl font-semibold">4×</p><p class="text-sm text-stone">quicker changelogs</p><blockquote class="mt-6 leading-relaxed text-ivory/90">“Release notes used to take an afternoon. Now they’re a review.”</blockquote><figcaption class="mt-5 text-sm text-stone">Engineering manager</figcaption></figure>
      <figure class="glass tile reveal rounded-3xl p-8" style="--d:.25s"><p class="goldtext font-display text-6xl font-semibold">5 min</p><p class="text-sm text-stone">to vet a dependency</p><blockquote class="mt-6 leading-relaxed text-ivory/90">“I can judge whether a library is worth adopting before my coffee cools.”</blockquote><figcaption class="mt-5 text-sm text-stone">Open-source maintainer</figcaption></figure>
    </div>
    <p class="mt-6 text-xs text-stone/70">Illustrative sample quotes for layout. Replace with real customer words and figures before launch.</p>
  </section>
</main>

<footer class="relative z-10 border-t border-gold/15 px-5 py-12">
  <div class="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
    <div>
      <p class="font-display text-2xl font-semibold">GitVision<span class="goldtext">&nbsp;AI</span></p>
      <p class="mt-1 text-sm text-stone">Repository intelligence, beautifully clear.</p>
    </div>
    <div class="flex flex-wrap gap-x-8 gap-y-2 text-sm text-stone">
      <a class="hover:text-ivory" href="#features">Capabilities</a><a class="hover:text-ivory" href="#preview">Console</a><a class="hover:text-ivory" href="#proof">Proof</a>
    </div>
    <p class="glass flex items-center gap-2.5 rounded-full px-4 py-2 text-xs text-ivory"><span class="pulse h-2 w-2 rounded-full bg-emerald shadow-[0_0_10px_#059669]"></span>All Systems Operational</p>
  </div>
  <p class="mx-auto mt-10 max-w-6xl text-xs text-stone/70">© 2026 GitVision AI. All rights reserved.</p>
</footer>

<script>
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const rm=matchMedia('(prefers-reduced-motion:reduce)').matches;

/* cursor glow */
let tx=innerWidth/2,ty=innerHeight*.3,cx=tx,cy=ty;const glow=$('#glow');
addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY},{passive:true});
(function loop(){cx+=(tx-cx)*(rm?1:.08);cy+=(ty-cy)*(rm?1:.08);glow.style.setProperty('--gx',cx+'px');glow.style.setProperty('--gy',cy+'px');requestAnimationFrame(loop)})();

/* floating particles */
if(!rm)for(let i=0;i<24;i++){const d=document.createElement('div');d.className='dot';
  d.style.cssText=`left:${Math.random()*100}%;top:${Math.random()*100}%;--t:${8+Math.random()*10}s;--x:${(Math.random()-.5)*90}px;--y:${(Math.random()-.5)*120}px;opacity:${.15+Math.random()*.35}`;
  document.body.appendChild(d)}

/* reveals */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.15});
$$('.reveal').forEach(el=>io.observe(el));

/* tile spotlight */
$$('.tile').forEach(t=>t.addEventListener('pointermove',e=>{const r=t.getBoundingClientRect();t.style.setProperty('--mx',e.clientX-r.left+'px');t.style.setProperty('--my',e.clientY-r.top+'px')}));

/* parallax */
const px=$$('[data-speed]');let tick=false;
if(!rm)addEventListener('scroll',()=>{if(tick)return;tick=true;requestAnimationFrame(()=>{px.forEach(el=>el.style.transform=`translate3d(0,${scrollY*el.dataset.speed}px,0)`);tick=false})},{passive:true});

/* scan simulation */
const STAGES=['Resolving repository','Reading README and structure','Tracing commit history','Mapping architecture','Writing your overview'];
const hash=s=>{let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h};
const f=$('#f'),inp=$('#u'),go=$('#go'),scan=$('#scan'),bar=$('#bar'),result=$('#result');let busy=false;
$('#stages').innerHTML=STAGES.map(s=>`<li class="st flex items-center gap-3" data-s="idle"><i class="h-3.5 w-3.5 rounded-full border border-stone/60 transition"></i>${s}</li>`).join('');
const items=$$('.st');
function run(owner,repo){
  busy=true;go.disabled=true;go.textContent='Scanning…';
  $('#repo').textContent=`${owner}/${repo}`;scan.classList.remove('hidden');result.classList.add('hidden');$('#sweep').style.display='';
  items.forEach(i=>i.dataset.s='idle');bar.style.width='0';
  scan.scrollIntoView({behavior:rm?'auto':'smooth',block:'center'});
  const dur=rm?10:4400,t0=performance.now();
  (function step(now){
    const p=Math.min((now-t0)/dur,1);bar.style.width=p*100+'%';
    const k=Math.min(Math.floor(p*STAGES.length),STAGES.length-1);
    items.forEach((it,i)=>it.dataset.s=p>=1||i<k?'done':i===k?'active':'idle');
    if(p<1)return requestAnimationFrame(step);
    finish(owner,repo)})(t0);
}
function finish(owner,repo){
  const h=hash(owner+repo),n=4+h%6,c=140+h%860;
  $('#facts').innerHTML=[
    `<strong class="text-ivory">${repo}</strong> is organised into ${n} core modules, with a clear entry point and public surface.`,
    `${c} commits distilled into 6 plain-language release highlights.`,
    `2 areas flagged for careful review before the next release.`].map(t=>`<li class="flex gap-3"><span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold"></span><span>${t}</span></li>`).join('');
  result.classList.remove('hidden');$('#sweep').style.display='none';
  busy=false;go.disabled=false;go.textContent='Analyze';
}
f.addEventListener('submit',e=>{
  e.preventDefault();if(busy)return;
  const m=inp.value.trim().match(/^(?:https?:\/\/)?(?:www\.)?(?:github\.com\/)?([\w.-]+)\/([\w.-]+?)(?:\.git)?(?:[\/?#].*)?$/i);
  if(!m){$('#err').textContent='Enter a GitHub link such as github.com/owner/repo.';return}
  $('#err').textContent='';run(m[1],m[2]);
});
$$('.chip').forEach(b=>b.addEventListener('click',()=>{inp.value=b.dataset.u;f.requestSubmit()}));

/* terminal */
const L=[
 `<span class="text-amber">$</span> <span class="text-ivory">gitvision read github.com/acme/atlas --for maintainers</span>`,
 `<span class="text-emerald">✓</span> <span class="text-stone">resolved acme/atlas (TypeScript, 12.4k stars)</span>`,
 `<span class="text-emerald">✓</span> <span class="text-stone">read README, 38 top-level files, 120 commits</span>`,
 ``,
 `<span class="text-ivory">{</span>`,
 `  <span class="text-gold">"summary"</span>: <span class="text-emerald">"A multi-tenant billing engine with a ledger core."</span>,`,
 `  <span class="text-gold">"modules"</span>: [<span class="text-emerald">"ledger"</span>, <span class="text-emerald">"invoicing"</span>, <span class="text-emerald">"webhooks"</span>],`,
 `  <span class="text-gold">"hotspots"</span>: <span class="text-amber">3</span>, <span class="text-stone">// all inside /ledger</span>`,
 `  <span class="text-gold">"risk"</span>: <span class="text-emerald">"low"</span>`,
 `<span class="text-ivory">}</span>`,
 ``,
 `<span class="text-emerald">→</span> <span class="text-ivory">release notes ready in <span class="text-amber">2.8s</span></span> <span class="caret"></span>`];
const term=$('#term');let started=false;
function type(){let i=0;(function next(){term.innerHTML=L.slice(0,i+1).map(l=>`<div class="tl in">${l||'&nbsp;'}</div>`).join('');if(++i<L.length)setTimeout(next,rm?0:420)})()}
new IntersectionObserver(([e],o)=>{if(e.isIntersecting&&!started){started=true;type();o.disconnect()}},{threshold:.4}).observe(term);
</script>
</body>
</html>

```
