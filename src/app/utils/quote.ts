import type { Product } from '@/app/lib/api';
import type { WizardState } from '@/app/hooks/useWizardState';
import { optionLabel } from '@/app/data/options';

/** Where quote / engineering requests go. */
export const SALES_EMAIL = 'sales@linemaster.com';

type Labeled = ReadonlyArray<{ id: string; label: string }>;

export interface AnswerSources {
  applications: Labeled;
  technologies: Labeled;
  actions: Labeled;
  environments: Labeled;
  duties: Labeled;
  connections: Labeled;
  circuitCounts: Labeled;
  features: Labeled;
}

/** The buyer's standard-flow answers as readable [label, value] rows. */
export function answerRows(s: WizardState, src: AnswerSources): [string, string][] {
  const rows: [string, string][] = [];
  const add = (label: string, value: string, options: Labeled) => {
    if (value) rows.push([label, optionLabel(options, value)]);
  };
  add('Industry', s.selectedApplication, src.applications);
  add('Technology', s.selectedTechnology, src.technologies);
  add('Action', s.selectedAction, src.actions);
  add('Environment', s.selectedEnvironment, src.environments);
  add('Duty', s.selectedDuty, src.duties);
  if (s.selectedTechnology !== 'pneumatic' && s.selectedTechnology !== 'wireless') {
    add('Connection', s.selectedConnection, src.connections);
    add('Circuits', s.selectedCircuitCount, src.circuitCounts);
  }
  if (s.selectedGuard) rows.push(['Safety guard', s.selectedGuard === 'yes' ? 'Required' : 'Not required']);
  if (s.selectedFeatures.length > 0) {
    rows.push(['Features', s.selectedFeatures.map(f => optionLabel(src.features, f)).join(', ')]);
  }
  return rows;
}

export function productLine(p: Product): string {
  return p.part_number ? `${p.series} (#${p.part_number})` : p.series;
}

/** mailto: link with a readable, pre-filled body. */
export function buildMailto(subject: string, body: string): string {
  return `mailto:${SALES_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Quote request for the results page: answers + the products in play. */
export function resultsQuoteMailto(opts: {
  wizardState: WizardState;
  sources: AnswerSources;
  products: Product[];
  needsCustom: boolean;
}): string {
  const rows = answerRows(opts.wizardState, opts.sources);
  const lines: string[] = ['Hello,', '', "I'd like a quote for a Linemaster foot switch."];
  if (rows.length > 0) {
    lines.push('', 'My requirements:', ...rows.map(([k, v]) => `- ${k}: ${v}`));
  }
  if (opts.needsCustom) {
    lines.push('', 'I need a custom cable length and/or connector — please advise on options.');
  }
  if (opts.products.length > 0) {
    lines.push('', "Products I'm considering:", ...opts.products.slice(0, 8).map(p => `- ${productLine(p)}`));
  }
  lines.push('', 'Quantity: ', 'Company: ', 'Phone: ', '', 'Thank you.');
  return buildMailto('Foot switch quote request', lines.join('\n'));
}

/** Quote request for a single product (detail modal). */
export function productQuoteMailto(p: Product): string {
  const lines = [
    'Hello,',
    '',
    "I'd like a quote for the following Linemaster foot switch:",
    '',
    `- ${productLine(p)}`,
    ...(p.link ? [`- ${p.link}`] : []),
    '',
    'Quantity: ',
    'Company: ',
    'Phone: ',
    '',
    'Thank you.',
  ];
  return buildMailto(`Quote request: ${productLine(p)}`, lines.join('\n'));
}
