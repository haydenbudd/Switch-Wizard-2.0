import { lazy, Suspense, useEffect } from 'react';
import { loadSonner, markToasterMounted } from '@/app/utils/notify';

const SonnerToaster = lazy(() => loadSonner().then((m) => ({ default: m.Toaster })));

/** Signals notify() once the Toaster above it has mounted and subscribed. */
function MountSignal() {
  useEffect(() => markToasterMounted(), []);
  return null;
}

/**
 * The toast container, loaded after first paint so the toast library
 * (sonner) stays out of the initial bundle. Toasts requested before it is
 * ready wait for it (see notify.ts).
 */
export function LazyToaster({ position = 'top-right' }: { position?: 'top-right' }) {
  return (
    <Suspense fallback={null}>
      <SonnerToaster position={position} />
      <MountSignal />
    </Suspense>
  );
}
