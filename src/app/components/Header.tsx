import { useEffect, useState, useCallback } from 'react';
import { RotateCcw, Moon, Sun, Settings } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from '@/app/components/Router';

interface HeaderProps {
  onReset: () => void;
}

function toggleDarkClass(dark: boolean) {
  // Apply .dark on both <html> (for next-themes) and the scoping container
  // (for postcss-prefix-selector which rewrites .dark → #lm-product-finder.lm-dark)
  document.documentElement.classList.toggle('dark', dark);
  document.getElementById('lm-product-finder')?.classList.toggle('lm-dark', dark);
}

export function Header({ onReset }: HeaderProps) {
  const { setTheme } = useTheme();
  const { navigate } = useRouter();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const dark = document.documentElement.classList.contains('dark');
    setIsDark(dark);
    // Sync the scoping container on mount
    document.getElementById('lm-product-finder')?.classList.toggle('lm-dark', dark);
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
        <nav aria-label="Wizard controls" className="absolute top-3 right-4 flex items-center gap-0.5 rounded-full glass-card px-1 py-1">
          <button
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
          </button>

          <button
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 dark:active:bg-white/10 transition-all duration-200"
            title="Admin Panel"
            aria-label="Open admin panel"
            onClick={() => navigate('/admin')}
          >
            <Settings className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
          </button>

          <button
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 dark:active:bg-white/10 transition-all duration-200"
            title="Reset"
            aria-label="Reset wizard"
            onClick={onReset}
          >
            <RotateCcw className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </header>
  );
}
