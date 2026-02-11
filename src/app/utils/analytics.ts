// Analytics tracking for wizard events
// Persists events to Supabase wizard_events table

import { supabase } from '@/app/lib/supabase';

const sessionId = crypto.randomUUID();

interface WizardStepData {
  application?: string;
  technology?: string;
  action?: string;
  environment?: string;
  features?: string[];
  source?: string;
}

function persist(event_type: string, flow?: string, step?: number, data: Record<string, unknown> = {}) {
  supabase
    .from('wizard_events')
    .insert({ session_id: sessionId, event_type, flow, step, data })
    .then(({ error }) => {
      if (error) console.warn('[Analytics] persist failed:', error.message);
    });
}

export function trackWizardStep(step: number, flow: string, data: WizardStepData = {}) {
  persist('step_view', flow, step, data);
}

export function trackPDFDownload(flow: string, data: WizardStepData = {}) {
  persist('pdf_download', flow, undefined, data);
}

export function trackNoResults(data: WizardStepData = {}) {
  persist('no_results', undefined, undefined, data);
}
