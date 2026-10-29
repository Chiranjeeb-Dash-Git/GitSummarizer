import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Menu, Moon, Sun, X } from 'lucide-react';
import StrataMark from '../ui/StrataMark.jsx';
import Kbd from '../ui/Kbd.jsx';
import Button from '../ui/Button.jsx';
import { WipeLink, useWipeNavigate } from '../effects/StrataWipe.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useUI } from '../../store/ui.js';
import { applyTheme, currentTheme } from '../../lib/theme.js';

export function ThemeToggle() {
  const [theme, setTheme] = useState(currentTheme());
  const next = theme === 'daylight' ? 'basalt' : 'daylight';
  return (
    <button
      type="button"
      aria-label={`Switch to the ${next === 'basalt' ? 'dark' : 'light'} theme`}
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        applyTheme(next, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
        setTheme(next);
      }}
      className="grid h-11 w-11 place-items-center rounded-full border border-line-strong hover:bg-surface-2"
    >
      {theme === 'daylight' ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const go = useWipeNavigate();
  const setPaletteOpen = useUI((s) => s.setPaletteOpen);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

  const { scrollY } = useScroll();
  const [hasBorder, setHasBorder] = useState(false);
  const height = useTransform(scrollY, [0, 80], ['72px', '60px']);

  useEffect(() => {
    return scrollY.on('change', (latest) => {
      setHasBorder(latest > 8);
    });
  }, [scrollY]);

  return (
    <motion.header
      style={{ height }}
      className={`sticky top-0 z-50 flex items-center bg-paper transition-[border-color] duration-150 ${
        hasBorder ? 'border-b border-line' : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-5 md:px-10 xl:px-16">
        <WipeLink to="/" className="flex items-center gap-3">
          <StrataMark size={30} />
          <span className="font-display text-xl font-bold tracking-tight">GitSummarizer</span>
        </WipeLink>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-5 md:flex">
          <a href="/#samples" className="text-sm font-semibold text-muted hover:text-ink">
            Samples
          </a>
          {user && (
            <WipeLink to="/dashboard" className="text-sm font-semibold text-muted hover:text-ink">
              Dashboard
            </WipeLink>
          )}

          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            aria-label="Open command palette"
            className="flex items-center gap-2 rounded-field border border-line-strong bg-surface px-3 py-1.5 text-xs text-muted hover:bg-surface-2"
          >
            <span>Search</span>
            <Kbd>⌘K</Kbd>
          </button>

          <ThemeToggle />

          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdown(!userDropdown)}
                className="grid h-10 w-10 place-items-center rounded-full border border-line-strong bg-surface font-display font-bold uppercase text-ink hover:bg-surface-2"
                aria-expanded={userDropdown}
                aria-label="User menu"
              >
                {user.displayName ? user.displayName[0] : 'U'}
              </button>
              {userDropdown && (
                <div className="absolute right-0 top-12 z-50 w-44 rounded-field border border-line-strong bg-surface p-1.5 shadow-stack">
                  <WipeLink
                    to="/dashboard"
                    onClick={() => setUserDropdown(false)}
                    className="block rounded-chip px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-2"
                  >
                    Dashboard
                  </WipeLink>
                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdown(false);
                      logout.mutate();
                    }}
                    className="block w-full text-left rounded-chip px-3 py-2 text-sm font-semibold text-oxide hover:bg-surface-2"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <WipeLink to="/login">
              <Button variant="ghost">Sign in</Button>
            </WipeLink>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            className="grid h-11 w-11 place-items-center rounded-full border border-line-strong hover:bg-surface-2"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      {menuOpen && (
        <div className="absolute left-0 top-full z-50 w-full border-b border-line-strong bg-paper p-5 shadow-stack md:hidden">
          <div className="flex flex-col gap-2">
            <a
              href="/#samples"
              onClick={() => setMenuOpen(false)}
              className="flex h-14 items-center rounded-field px-4 text-base font-semibold hover:bg-surface-2"
            >
              Samples
            </a>
            {user && (
              <WipeLink
                to="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="flex h-14 items-center rounded-field px-4 text-base font-semibold hover:bg-surface-2"
              >
                Dashboard
              </WipeLink>
            )}
            {user ? (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  logout.mutate();
                }}
                className="flex h-14 items-center rounded-field px-4 text-left text-base font-semibold text-oxide hover:bg-surface-2"
              >
                Sign out
              </button>
            ) : (
              <WipeLink
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="flex h-14 items-center rounded-field px-4 text-base font-semibold hover:bg-surface-2"
              >
                Sign in
              </WipeLink>
            )}
          </div>
        </div>
      )}
    </motion.header>
  );
}

