import { useEffect, useState, useCallback } from 'react';
import { RotateCcw, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { ON_SITE } from '@/app/utils/embed';

interface HeaderProps {
  onReset: () => void;
}

const IS_EMBEDDED = typeof __LM_EMBED_MODE__ !== 'undefined' && __LM_EMBED_MODE__;

function toggleDarkClass(dark: boolean) {
  // In standalone mode, apply .dark on <html> for next-themes.
  // In WordPress embed mode, skip this to avoid affecting the host page.
  if (!IS_EMBEDDED) {
    document.documentElement.classList.toggle('dark', dark);
  }
  // Always apply .lm-dark on the scoping container
  // (postcss-prefix-selector rewrites .dark → #lm-product-finder.lm-dark)
  document.getElementById('lm-product-finder')?.classList.toggle('lm-dark', dark);
}

export function Header({ onReset }: HeaderProps) {
  const { setTheme } = useTheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const container = document.getElementById('lm-product-finder');
    const dark = IS_EMBEDDED
      ? container?.classList.contains('lm-dark') ?? false
      : document.documentElement.classList.contains('dark');
    setIsDark(dark);
    // Sync the scoping container on mount
    container?.classList.toggle('lm-dark', dark);
  }, []);

  const handleToggleDark = useCallback(() => {
    const next = !isDark;
    setIsDark(next);
    setTheme(next ? 'dark' : 'light');
    toggleDarkClass(next);
  }, [isDark, setTheme]);

  return (
    <header className="sticky top-0 z-50 pt-3 pb-1">
      <div className="mx-auto px-4">
        {/* Pill toolbar — top right */}
        <nav aria-label="Wizard controls" className="group absolute top-3 right-4 flex items-center gap-0.5 rounded-full glass-card px-1 py-1">
          {/* linemaster.com is light-only, so no theme toggle when embedded */}
          {!ON_SITE && <button
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 dark:active:bg-white/10 transition-all duration-200"
            title={isDark ? 'Light mode' : 'Dark mode'}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={handleToggleDark}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            ) : (
              <Moon className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            )}
          </button>}

          {/* No admin gear here: it was visible to every public visitor
              (and its link broke inside the WordPress embed). The admin
              panel is reached directly at /Switch-Wizard-2.0/admin. */}

          <button
            className="flex items-center gap-1.5 p-2 sm:pr-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 dark:active:bg-white/10 transition-all duration-200"
            title="Start over — clears all your answers"
            aria-label="Start over (clears all your answers)"
            onClick={onReset}
          >
            <RotateCcw className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <span className="hidden sm:inline text-sm !text-muted-foreground">Start over</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
