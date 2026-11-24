import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

/**
 * hCaptcha's site key. It's public by design (it ships in every page that
 * shows the widget). The matching secret lives only in Supabase Auth's
 * captcha settings, which verify the token on sign-in.
 */
export const HCAPTCHA_SITE_KEY = 'cda827fc-ba24-413c-9980-6cc87b2c5b06';

const SCRIPT_URL = 'https://js.hcaptcha.com/1/api.js?render=explicit&onload=__lmHcaptchaReady';

interface HCaptchaApi {
  render(container: HTMLElement, params: Record<string, unknown>): string;
  reset(widgetId?: string): void;
  remove(widgetId?: string): void;
}

declare global {
  interface Window {
    hcaptcha?: HCaptchaApi;
    __lmHcaptchaReady?: () => void;
  }
}

let scriptPromise: Promise<HCaptchaApi> | null = null;

/** Loads hCaptcha's script once; later calls reuse the same promise. */
function loadHCaptcha(): Promise<HCaptchaApi> {
  if (window.hcaptcha) return Promise.resolve(window.hcaptcha);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    window.__lmHcaptchaReady = () => {
      if (window.hcaptcha) resolve(window.hcaptcha);
      else reject(new Error('hCaptcha failed to start'));
    };
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      scriptPromise = null; // allow a retry on the next mount
      reject(new Error('hCaptcha failed to load'));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export interface HCaptchaHandle {
  /** Clear the widget. Tokens are single-use, so call this after every sign-in attempt. */
  reset(): void;
}

interface HCaptchaProps {
  /** Called with a fresh token, or null when it expires, errors or is reset. */
  onToken: (token: string | null) => void;
  onLoadError?: (message: string) => void;
}

export const HCaptcha = forwardRef<HCaptchaHandle, HCaptchaProps>(function HCaptcha(
  { onToken, onLoadError },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  // Latest callbacks without re-rendering the widget when they change
  const onTokenRef = useRef(onToken);
  const onErrorRef = useRef(onLoadError);
  onTokenRef.current = onToken;
  onErrorRef.current = onLoadError;

  useImperativeHandle(ref, () => ({
    reset() {
      if (widgetId.current !== null) window.hcaptcha?.reset(widgetId.current);
      onTokenRef.current(null);
    },
  }), []);

  useEffect(() => {
    let cancelled = false;
    loadHCaptcha()
      .then((api) => {
        if (cancelled || !containerRef.current) return;
        widgetId.current = api.render(containerRef.current, {
          sitekey: HCAPTCHA_SITE_KEY,
          callback: (token: string) => onTokenRef.current(token),
          'expired-callback': () => onTokenRef.current(null),
          'error-callback': () => onTokenRef.current(null),
        });
      })
      .catch((err: Error) => {
        if (!cancelled) onErrorRef.current?.(err.message);
      });
    return () => {
      cancelled = true;
      if (widgetId.current !== null) {
        try {
          window.hcaptcha?.remove(widgetId.current);
        } catch {
          // Widget already gone
        }
        widgetId.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} className="flex justify-center min-h-[78px]" />;
});
