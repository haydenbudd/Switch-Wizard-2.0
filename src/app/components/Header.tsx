import { useEffect, useState } from 'react';
import { RotateCcw, Moon, Sun, Settings, Menu } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from '@/app/components/Router';

interface HeaderProps {
  onReset: () => void;
}

export function Header({ onReset }: HeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const { navigate } = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      <div className="mx-auto px-2 sm:px-4 pt-2">
        <div className="relative w-full" style={{ minHeight: 52 }}>
          <div
            className="relative overflow-hidden will-change-transform rounded-[20px] px-4 transition-all duration-300 glass-card"
          >
            <div className="relative">
              <div className="flex items-center justify-between h-[52px]">
                {/* Logo */}
                <div className="flex items-center gap-3">
                  <img
                    src="/Linemaster Blue Corporate Logo 2.png"
                    alt="Linemaster"
                    className="h-9"
                  />
                  <div className="hidden sm:block h-4 w-px bg-foreground/10" />
                  <span className="hidden sm:block text-sm font-medium text-muted-foreground tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                    Product Finder
                  </span>
                </div>

                {/* Desktop Actions */}
                <div className="hidden sm:flex items-center gap-0.5">
                  <button
                    className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 dark:active:bg-white/10 transition-all duration-200"
                    title={resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
                    onClick={() => {
                      const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
                      setTheme(newTheme);
                      // Fallback for sandboxed environments (e.g. Figma Make)
                      // where next-themes may not be able to manipulate the DOM
                      document.documentElement.classList.toggle('dark', newTheme === 'dark');
                    }}
                  >
                    {mounted && resolvedTheme === 'dark' ? (
                      <Sun className="w-[18px] h-[18px] text-muted-foreground" />
                    ) : (
                      <Moon className="w-[18px] h-[18px] text-muted-foreground" />
                    )}
                  </button>

                  <button
                    className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 dark:active:bg-white/10 transition-all duration-200"
                    title="Admin Panel"
                    onClick={() => navigate('/admin')}
                  >
                    <Settings className="w-[18px] h-[18px] text-muted-foreground" />
                  </button>

                  <button
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-primary-foreground hover:opacity-90 active:opacity-80 transition-all duration-200 text-sm font-medium ml-1"
                    onClick={onReset}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Mobile Menu Button */}
                <div className="sm:hidden relative">
                  <button
                    className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 dark:active:bg-white/10 transition-all duration-200"
                    aria-label="Menu"
                  >
                    <Menu className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
