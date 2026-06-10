// Analytics tracking for wizard events
// Persists events to Supabase wizard_events table

// Lazily initialized: crypto.randomUUID is secure-context-only, so calling it
// at module top level would crash the whole bundle on plain-http hosts
// (staging/intranet WordPress sites).
let sessionId: string | null = null;

function getSessionId(): string {
  if (!sessionId) {
    sessionId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
  return sessionId;
}

interface WizardStepData {
  application?: string;
  technology?: string;
  action?: string;
  environment?: string;
  features?: string[];
  source?: string;
}

function persist(event_type: string, flow?: string, step?: number, data: Record<string, unknown> = {}) {
  // Dynamic import keeps @supabase/supabase-js out of the eager bundle.
  // Inserts are fire-and-forget — tracking must never affect the wizard.
  import('@/app/lib/supabase')
    .then(({ supabase }) =>
      supabase
        .from('wizard_events')
        .insert({ session_id: getSessionId(), event_type, flow, step, data })
    )
    .then((result) => {
      if (result?.error) console.warn('[Analytics] persist failed:', result.error.message);
    })
    .catch(() => {
      // Chunk failed to load (offline, blocked) — drop the event silently
    });
}

export function trackWizardStep(step: number, flow: string, data: WizardStepData = {}) {
  persist('step_view', flow, step, { ...data });
}

export function trackPDFDownload(flow: string, data: WizardStepData = {}) {
  persist('pdf_download', flow, undefined, { ...data });
}

export function trackNoResults(data: WizardStepData = {}) {
  persist('no_results', undefined, undefined, { ...data });
}
