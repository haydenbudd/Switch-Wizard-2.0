import type { Product } from '@/app/lib/api';
import type { WizardState } from '@/app/hooks/useWizardState';
import { toast } from 'sonner';
import { optionLabel } from '@/app/data/options';

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
  add('Application', s.selectedApplication, src.applications);
  add('Technology', s.selectedTechnology, src.technologies);
  add('Action Type', s.selectedAction, src.actions);
  add('Environment', s.selectedEnvironment, src.environments);
  add('Duty Rating', s.selectedDuty, src.duties);
  if (s.selectedTechnology !== 'pneumatic' && s.selectedTechnology !== 'wireless') {
    add('Connection Type', s.selectedConnection, src.connections);
    add('Circuits Controlled', s.selectedCircuitCount, src.circuitCounts);
  }
  if (s.selectedGuard) rows.push(['Safety Guard', s.selectedGuard === 'yes' ? 'Required' : 'Not required']);
  if (s.selectedFeatures.length > 0) {
    rows.push(['Features', s.selectedFeatures.map(f => optionLabel(src.features, f)).join(', ')]);
  }
  return rows;
}

export function productLine(p: Product): string {
  return p.part_number ? `${p.series} (#${p.part_number})` : p.series;
}

/**
 * Linemaster's contact page. It can't be pre-filled from a link, so the
 * Request a Quote buttons copy the buyer's details to the clipboard for them
 * to paste into the message box (see quoteLinkProps).
 */
export const CONTACT_URL = 'https://linemaster.com/contact/';

/** Quote request text for the results page: answers + the products in play. */
export function resultsQuoteText(opts: {
  wizardState: WizardState;
  sources: AnswerSources;
  products: Product[];
  needsCustom: boolean;
}): string {
  const rows = answerRows(opts.wizardState, opts.sources);
  const lines: string[] = ["Quote request - Linemaster footswitch"];
  if (rows.length > 0) {
    lines.push('', 'My requirements:', ...rows.map(([k, v]) => `- ${k}: ${v}`));
  }
  if (opts.needsCustom) {
    lines.push('', 'I need a custom cable length and/or connector - please advise on options.');
  }
  if (opts.products.length > 0) {
    lines.push('', "Products I'm considering:", ...opts.products.slice(0, 8).map(p => `- ${productLine(p)}`));
  }
  return lines.join('\n');
}

/** Quote request text for a single product (detail modal). */
export function productQuoteText(p: Product): string {
  return [
    'Quote request - Linemaster footswitch',
    '',
    `- ${productLine(p)}`,
    ...(p.link ? [`- ${p.link}`] : []),
  ].join('\n');
}

/** Quote request text for a semi-custom medical configuration. */
export function configQuoteText(rows: { label: string; value: string }[]): string {
  return [
    'Quote request - semi-custom medical footswitch',
    '',
    ...rows.map(({ label, value }) => `- ${label}: ${value}`),
  ].join('\n');
}

/**
 * Props for an <a> that opens the contact page in a new tab (so the buyer
 * keeps their results) and copies `details` to the clipboard on the way.
 * Clipboard access can be unavailable (http pages, denied permission) —
 * the link still opens; only the helper toast is skipped.
 */
export function quoteLinkProps(details: string) {
  return {
    href: CONTACT_URL,
    target: '_blank',
    rel: 'noopener noreferrer',
    onClick: () => {
      navigator.clipboard?.writeText(details)
        .then(() => toast.success('Your details are copied — paste them into the message box on the contact page.', { duration: 8000 }))
        .catch(() => {});
    },
  };
}
