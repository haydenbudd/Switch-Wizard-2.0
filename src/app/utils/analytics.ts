// Analytics tracking for wizard events
// Persists events to Supabase wizard_events table

import { insertWizardEvent } from '@/app/lib/publicRest';

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
  /** Smart search: the buyer's description, and what was understood. */
  query?: string;
  understood?: string[];
}

function persist(event_type: string, flow?: string, step?: number, data: Record<string, unknown> = {}) {
  // Plain REST insert (no @supabase/supabase-js); fire-and-forget —
  // tracking must never affect the wizard.
  insertWizardEvent({ session_id: getSessionId(), event_type, flow, step, data });
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

/** Request a Quote clicks: where the button was, and what was being quoted. */
export function trackQuoteClick(source: string, data: { application?: string; products?: string[] } = {}) {
  persist('quote_click', undefined, undefined, { source, ...data });
}
