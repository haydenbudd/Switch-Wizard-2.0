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

export function trackFlowSelect(flow: string) {
  console.log('[Analytics] Flow select:', flow);
  persist('flow_select', flow);
}

export function trackWizardStep(step: number, flow: string, data: WizardStepData = {}) {
  console.log('[Analytics] Wizard step:', { step, flow, ...data });
  persist('step_view', flow, step, data);
}

export function trackSelection(flow: string, step: number, data: WizardStepData = {}) {
  console.log('[Analytics] Selection:', { flow, step, ...data });
  persist('selection', flow, step, data);
}

export function trackProductView(productId: string, source: string = 'results') {
  console.log('[Analytics] Product view:', { productId, source });
  persist('product_view', undefined, undefined, { productId, source });
}

export function trackPDFDownload(flow: string, data: WizardStepData = {}) {
  console.log('[Analytics] PDF download:', { flow, ...data });
  persist('pdf_download', flow, undefined, data);
}

export function trackQuoteRequest(flow: string, data: WizardStepData = {}) {
  console.log('[Analytics] Quote request:', { flow, ...data });
  persist('quote_request', flow, undefined, data);
}

export function trackNoResults(data: WizardStepData = {}) {
  console.log('[Analytics] No results:', data);
  persist('no_results', undefined, undefined, data);
}

export function trackResultView(flow: string, resultCount: number) {
  console.log('[Analytics] Result view:', { flow, resultCount });
  persist('result_view', flow, undefined, { resultCount });
}
