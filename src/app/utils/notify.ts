/**
 * Toast helpers for the wizard that load sonner on demand.
 *
 * Same call shape as sonner's `toast.info/success/error`, but each call
 * waits until the lazily loaded <LazyToaster> has mounted, so early toasts
 * (e.g. the data-fallback notice) are not lost.
 */
type Sonner = typeof import('sonner');
type ToastFn = Sonner['toast']['info'];

let sonnerPromise: Promise<Sonner> | null = null;
export function loadSonner(): Promise<Sonner> {
  return (sonnerPromise ??= import('sonner'));
}

let resolveMounted: () => void = () => {};
const toasterMounted = new Promise<void>((resolve) => {
  resolveMounted = resolve;
});
export function markToasterMounted() {
  resolveMounted();
}

function make(kind: 'info' | 'success' | 'error'): (...args: Parameters<ToastFn>) => void {
  return (...args) => {
    Promise.all([loadSonner(), toasterMounted])
      .then(([m]) => m.toast[kind](...args))
      .catch(() => {
        // Toast library failed to load (offline): toasts are informational only
      });
  };
}

export const notify = {
  info: make('info'),
  success: make('success'),
  error: make('error'),
};
