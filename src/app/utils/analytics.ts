// Analytics tracking for wizard events
// Logs events to console; can be extended to send to an analytics service

interface WizardStepData {
  application?: string;
  technology?: string;
  action?: string;
  environment?: string;
  features?: string[];
  source?: string;
}

export function trackWizardStep(step: number, flow: string, data: WizardStepData = {}) {
  console.log('[Analytics] Wizard step:', { step, flow, ...data });
}

export function trackProductView(productId: string, source: string = 'results') {
  console.log('[Analytics] Product view:', { productId, source });
}

export function trackPDFDownload(flow: string, data: WizardStepData = {}) {
  console.log('[Analytics] PDF download:', { flow, ...data });
}

export function trackQuoteRequest(flow: string, data: WizardStepData = {}) {
  console.log('[Analytics] Quote request:', { flow, ...data });
}

export function trackNoResults(data: WizardStepData = {}) {
  console.log('[Analytics] No results:', data);
}
