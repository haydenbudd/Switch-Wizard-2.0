import { useCallback, useEffect, useRef } from 'react';
import type { WizardState, WizardSnapshot } from '@/app/hooks/useWizardState';

/**
 * Browser Back and Forward move through the wizard's steps.
 *
 * Each screen the buyer moves to gets its own browser history entry, so the
 * browser's Back button returns to the previous step instead of leaving the
 * page, and Forward goes forward again. Back from the first screen leaves
 * the page as usual.
 *
 * The URL never changes here: the wizard runs embedded in linemaster.com,
 * so each entry keeps the host page's URL and carries the wizard's answers
 * in its history state object, under one key (any state the host page keeps
 * there is left alone). Share links still work as before, because
 * updateUrlWithState keeps the state object when it rewrites the query.
 *
 * Each entry stores the whole snapshot, not just the step, so Back after
 * "Start over" brings back the results that were on screen.
 */

const KEY = 'lmWizard';
/** The screen the entry before this one shows, set on entries the wizard
 *  pushes. Lets the wizard's own Back button step back through history. */
const PREV_KEY = 'lmWizardPrev';

/** What counts as moving to another screen. Changing an answer without
 *  moving (a multi-select toggle, a results filter) updates the current
 *  entry instead of adding one. */
function screenKey(s: WizardSnapshot): string {
  return [s.flow, s.step, s.selectedCategory, s.selectedApplication].join('|');
}

function isPristine(s: WizardSnapshot): boolean {
  return s.flow === 'standard' && s.step === 0 && !s.selectedCategory && !s.selectedApplication;
}

/** The current entry's state with the wizard's snapshot swapped in. */
function entryState(snap: WizardSnapshot, extra?: Record<string, unknown>): Record<string, unknown> {
  const current = window.history.state;
  const base = current && typeof current === 'object' ? current : {};
  return { ...base, [KEY]: snap, ...extra };
}

function readEntry(state: unknown): WizardSnapshot | null {
  if (!state || typeof state !== 'object') return null;
  const snap = (state as Record<string, unknown>)[KEY];
  if (!snap || typeof snap !== 'object') return null;
  const s = snap as WizardSnapshot;
  return typeof s.step === 'number' && (s.flow === 'standard' || s.flow === 'medical') ? s : null;
}

function prevScreen(): string | null {
  const state = window.history.state;
  if (!state || typeof state !== 'object') return null;
  const prev = (state as Record<string, unknown>)[PREV_KEY];
  return typeof prev === 'string' ? prev : null;
}

const same = (a: WizardSnapshot | null, b: WizardSnapshot | null) =>
  !!a && !!b && JSON.stringify(a) === JSON.stringify(b);

export function useWizardHistory(wizardState: WizardState, snapshot: WizardSnapshot, snapshotJson: string) {
  /** The snapshot the current history entry was last synced to. */
  const lastRef = useRef<WizardSnapshot | null>(null);
  // Screen of a popped entry being applied, so the change it causes
  // doesn't push a new entry on top of the one the buyer went back to.
  const restoringRef = useRef<string | null>(null);
  // Set by the on-load restore (share link / saved progress), so the first
  // screen replaces the page's entry instead of adding one behind it.
  const replaceNextRef = useRef(false);
  // The wizard's Back button called history.back(); its popstate is due.
  const backPendingRef = useRef(false);
  const settersRef = useRef(wizardState);
  settersRef.current = wizardState;

  const sync = useCallback((snap: WizardSnapshot) => {
    const last = lastRef.current;
    lastRef.current = snap;
    const replace = () => window.history.replaceState(entryState(snap), '');

    // First render: this page's entry becomes the wizard's first entry.
    // After a reload it already is one, and restoreFromEntry reads it next,
    // so leave it alone.
    if (!last) {
      if (!readEntry(window.history.state)) replace();
      return;
    }
    // Wait for the pending Back to land; the popstate handler syncs then
    if (backPendingRef.current) return;
    if (replaceNextRef.current || restoringRef.current === screenKey(snap)) {
      replaceNextRef.current = false;
      restoringRef.current = null;
      replace();
      return;
    }
    restoringRef.current = null;
    if (screenKey(last) === screenKey(snap)) {
      replace();
      return;
    }
    // The wizard's own Back button, to the screen the entry before shows:
    // step back through history instead of adding an entry, so browser Back
    // afterwards keeps going back rather than returning here.
    if (prevScreen() === screenKey(snap)) {
      backPendingRef.current = true;
      window.history.back();
      return;
    }
    // Moving on to another screen. The entry being left takes on the new
    // answers (at its own screen), so Back shows the answer just picked,
    // the same as the wizard's own Back button. Start over leaves it as it
    // was, so Back undoes the reset.
    if (!isPristine(snap)) {
      window.history.replaceState(entryState({
        ...snap,
        step: last.step,
        flow: last.flow,
        selectedCategory: last.selectedCategory,
        selectedApplication: last.selectedApplication,
      }), '');
    }
    window.history.pushState(entryState(snap, { [PREV_KEY]: screenKey(last) }), '');
  }, []);

  useEffect(() => {
    sync(snapshot);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshotJson]);

  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      const snap = readEntry(e.state);
      if (backPendingRef.current) {
        // Landed where the wizard's Back button sent us. The wizard already
        // shows this screen, with its latest answers: save them here.
        backPendingRef.current = false;
        const current = lastRef.current!;
        if (snap && screenKey(snap) === screenKey(current)) {
          window.history.replaceState(entryState(current), '');
        } else {
          // The buyer moved on before the Back landed: treat that as a move
          // from the screen this entry shows
          lastRef.current = snap ?? current;
          sync(current);
        }
        return;
      }
      // Entries the wizard didn't make (the host page's, an in-page #anchor)
      if (!snap) return;
      if (same(lastRef.current, snap)) return;
      restoringRef.current = screenKey(snap);
      const s = settersRef.current;
      // Reset first: applyPartial skips empty values, and the entry's empty
      // answers must clear the current ones.
      s.resetWizard();
      s.applyPartial(snap);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [sync]);

  /** Call when the page-load restore applies saved state. */
  const replaceNext = useCallback(() => { replaceNextRef.current = true; }, []);

  /**
   * On page load, restore this history entry's own snapshot if it has one
   * (a reload, or coming back to the page with Back or Forward). It's the
   * exact screen the buyer was on, where saved progress may be another
   * entry's. Returns false when the entry has none.
   */
  const restoreFromEntry = useCallback((): boolean => {
    const snap = readEntry(window.history.state);
    if (!snap) return false;
    // Already showing it (the start page): nothing to apply
    if (same(lastRef.current, snap)) return true;
    replaceNextRef.current = true;
    settersRef.current.resetWizard();
    settersRef.current.applyPartial(snap);
    return true;
  }, []);

  return { replaceNext, restoreFromEntry };
}
