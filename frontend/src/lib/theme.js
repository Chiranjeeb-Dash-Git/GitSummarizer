export const THEMES = { light: 'daylight', dark: 'basalt' };

export const currentTheme = () => document.documentElement.dataset.theme || 'daylight';

export function applyTheme(next, origin = { x: innerWidth / 2, y: 0 }) {
  const commit = () => {
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('gs-theme', next); } catch { /* storage unavailable */ }
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'basalt' ? '#0F1412' : '#E3E6DF');
  };

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || reduce) return commit();

  const transition = document.startViewTransition(commit);
  transition.ready.then(() => {
    const radius = Math.hypot(Math.max(origin.x, innerWidth - origin.x), Math.max(origin.y, innerHeight - origin.y));
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${origin.x}px ${origin.y}px)`, `circle(${radius}px at ${origin.x}px ${origin.y}px)`] },
      { duration: 650, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' },
    );
  });
}

