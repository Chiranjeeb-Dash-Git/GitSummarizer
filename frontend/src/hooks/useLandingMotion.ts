import { useEffect, useRef } from 'react';

export function useLandingMotion() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elements = document.querySelectorAll('.gitvision-root .gv-reveal');
    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('in'));
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const shapes = document.querySelectorAll<HTMLElement>('.gitvision-root [data-speed]');
    let frame: number | null = null;
    const onScroll = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        shapes.forEach((shape) => {
          const speed = Number(shape.getAttribute('data-speed')) || 0;
          shape.style.transform = `translate3d(0, ${window.scrollY * speed}px, 0)`;
        });
        frame = null;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(pointer: coarse)').matches) return undefined;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let frame: number | null = null;
    if (cursorRef.current) cursorRef.current.style.transform = `translate(${currentX - 30}px, ${currentY - 30}px)`;
    const animate = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      if (cursorRef.current) cursorRef.current.style.transform = `translate(${currentX - 30}px, ${currentY - 30}px)`;
      if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
        frame = requestAnimationFrame(animate);
      } else {
        frame = null;
      }
    };
    const onPointerMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (frame === null) frame = requestAnimationFrame(animate);
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  return cursorRef;
}
