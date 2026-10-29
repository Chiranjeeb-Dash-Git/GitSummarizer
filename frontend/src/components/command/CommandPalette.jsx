import { useEffect } from 'react';
import { Command } from 'cmdk';
import { useUI } from '../../store/ui.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useWipeNavigate } from '../effects/StrataWipe.jsx';
import { applyTheme, currentTheme } from '../../lib/theme.js';
import { SAMPLES } from '../../lib/constants.js';

export default function CommandPalette() {
  const open = useUI((s) => s.paletteOpen);
  const setOpen = useUI((s) => s.setPaletteOpen);
  const { user, logout } = useAuth();
  const go = useWipeNavigate();

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(!useUI.getState().paletteOpen);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setOpen]);

  const run = (fn) => () => { setOpen(false); fn(); };
  const item = 'flex h-12 cursor-pointer items-center rounded-field px-4 text-[15px] data-[selected=true]:bg-surface-2';

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command menu"
      overlayClassName="fixed inset-0 z-[110] bg-basalt/60"
      contentClassName="fixed left-1/2 top-[18vh] z-[120] w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-slab border border-line-strong bg-surface shadow-stack"
    >
      <Command.Input
        placeholder="Search pages and sample repositories"
        className="h-14 w-full border-b border-line bg-transparent px-5 text-base placeholder:text-muted focus:outline-none"
      />
      <Command.List data-lenis-prevent className="max-h-[50vh] overflow-y-auto p-2">
        <Command.Empty className="px-4 py-6 text-muted">Nothing matches that search.</Command.Empty>
        <Command.Group heading="Go to" className="text-sm text-muted [&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-semibold">
          <Command.Item className={item} onSelect={run(() => go('/'))}>Home</Command.Item>
          {user && <Command.Item className={item} onSelect={run(() => go('/dashboard'))}>Dashboard</Command.Item>}
        </Command.Group>
        <Command.Group heading="Try a sample" className="text-sm text-muted [&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-semibold">
          {SAMPLES.map((s) => (
            <Command.Item key={s.input} value={`${s.input} ${s.note}`} className={item}
              onSelect={run(() => go(`/read?${new URLSearchParams({ input: s.input, kind: s.kind, audience: 'learner' })}`))}>
              {s.input}
            </Command.Item>
          ))}
        </Command.Group>
        <Command.Group heading="Actions" className="text-sm text-muted [&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-semibold">
          <Command.Item className={item} onSelect={run(() => applyTheme(currentTheme() === 'daylight' ? 'basalt' : 'daylight'))}>Switch theme</Command.Item>
          {user ? (
            <Command.Item className={item} onSelect={run(() => logout.mutate())}>Sign out</Command.Item>
          ) : (
            <Command.Item className={item} onSelect={run(() => go('/login'))}>Sign in</Command.Item>
          )}
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}

