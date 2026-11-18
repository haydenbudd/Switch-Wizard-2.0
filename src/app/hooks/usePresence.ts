import { useEffect, useState } from 'react';

/**
 * Keeps an element mounted long enough to play its exit animation.
 *
 * Returns `mounted` (render it at all) and `exiting` (apply the exit
 * class). Showing again mid-exit cancels the exit. Replaces motion's
 * AnimatePresence for the few places that animate out.
 */
export function usePresence(show: boolean, exitMs: number) {
  const [mounted, setMounted] = useState(show);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (show) {
      setMounted(true);
      setExiting(false);
      return;
    }
    if (!mounted) return;
    setExiting(true);
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const t = window.setTimeout(() => {
      setMounted(false);
      setExiting(false);
    }, reduce ? 0 : exitMs);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, exitMs]);

  return { mounted, exiting };
}
