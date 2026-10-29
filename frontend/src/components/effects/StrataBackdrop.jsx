import { useEffect, useRef } from 'react';

const LANES = 7;

export default function StrataBackdrop({ className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0, visible = true, last = 0;
    let colors = [];

    const readColors = () => {
      const s = getComputedStyle(document.documentElement);
      colors = Array.from({ length: 6 }, (_, i) => s.getPropertyValue(`--strata-${i + 1}`).trim());
      colors.line = s.getPropertyValue('--line-strong').trim();
    };

    const lanes = Array.from({ length: LANES }, (_, i) => ({
      speed: 14 + (i % 4) * 9,
      dots: Array.from({ length: 5 }, () => Math.random()),
      color: i % 6,
    }));
    const merges = [];

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const laneX = (i) => ((i + 1) / (LANES + 1)) * w;

    const draw = (dt) => {
      ctx.clearRect(0, 0, w, h);
      lanes.forEach((lane, i) => {
        const x = laneX(i);
        ctx.strokeStyle = colors.line;
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        ctx.globalAlpha = 1;
        lane.dots = lane.dots.map((p) => {
          const next = p - (lane.speed * dt) / h;
          return next < -0.05 ? 1.05 : next;
        });
        ctx.fillStyle = colors[lane.color];
        lane.dots.forEach((p) => {
          ctx.beginPath(); ctx.arc(x, p * h, 5, 0, Math.PI * 2); ctx.fill();
        });
      });
      if (!reduce && Math.random() < dt * 0.6) {
        const a = Math.floor(Math.random() * (LANES - 1));
        merges.push({ a, b: a + 1, t: 0, color: Math.floor(Math.random() * 6) });
      }
      for (let i = merges.length - 1; i >= 0; i--) {
        const m = merges[i];
        m.t += dt * 0.5;
        if (m.t > 1) { merges.splice(i, 1); continue; }
        const x1 = laneX(m.a), x2 = laneX(m.b), y = h * (1 - m.t);
        ctx.strokeStyle = colors[m.color];
        ctx.lineWidth = 3;
        ctx.globalAlpha = 1 - m.t;
        ctx.beginPath(); ctx.moveTo(x1, y + 40); ctx.bezierCurveTo(x1, y, x2, y + 40, x2, y); ctx.stroke();
        ctx.globalAlpha = 1;
      }
    };

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) { last = now; return; }
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      draw(dt);
    };

    readColors();
    resize();
    draw(0);
    const ro = new ResizeObserver(() => { resize(); draw(0); });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(canvas);
    const mo = new MutationObserver(() => { readColors(); if (reduce) draw(0); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    if (!reduce) raf = requestAnimationFrame((t) => { last = t; frame(t); });

    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); mo.disconnect(); };
  }, []);

  return <canvas ref={ref} className={`h-full w-full ${className}`} aria-hidden="true" />;
}

