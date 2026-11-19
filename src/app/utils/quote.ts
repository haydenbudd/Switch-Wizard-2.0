import type { Product } from '@/app/lib/api';
import type { WizardState } from '@/app/hooks/useWizardState';
import { notify } from '@/app/utils/notify';
import { optionLabel } from '@/app/data/options';
import { trackQuoteClick } from '@/app/utils/analytics';

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

// Same page as the site header's "Request a Quote" button
export const CONTACT_URL = 'https://linemaster.com/request-a-quote/';

const HEADING = 'Quote request - Linemaster footswitch (from the Switch Wizard)';

/**
 * What the wizard knows about the visitor, shared by every Request a Quote
 * button on the results page (the page itself, product details, compare).
 */
export interface QuoteContext {
  /** The visitor's answers as [label, value] rows. */
  answers: [string, string][];
  /** Readable application, sent to the form's Application field. */
  application?: string;
  /** Share link that reopens these results. */
  resultsUrl?: string;
}

function answerLines(ctx?: QuoteContext): string[] {
  if (!ctx || ctx.answers.length === 0) return [];
  return ['', 'My requirements:', ...ctx.answers.map(([k, v]) => `- ${k}: ${v}`)];
}

function resultsLinkLines(ctx?: QuoteContext): string[] {
  return ctx?.resultsUrl ? ['', `My results: ${formSafeUrl(ctx.resultsUrl)}`] : [];
}

/**
 * The quote form strips every %XX sequence from a pre-filled value (Contact
 * Form 7's wpcf7_sanitize_query_var), which would cut "a%2Cb" in a share link
 * down to "ab". The wizard's own params only ever encode commas, so put
 * those back as plain commas.
 */
function formSafeUrl(url: string): string {
  return url.replace(/%2C/gi, ',');
}

/** Quote request text for the results page: answers + the products in play. */
export function resultsQuoteText(opts: {
  context: QuoteContext;
  products: Product[];
  needsCustom: boolean;
}): string {
  const lines: string[] = [HEADING, ...answerLines(opts.context)];
  if (opts.needsCustom) {
    lines.push('', 'I need a custom cable length and/or connector - please advise on options.');
  }
  if (opts.products.length > 0) {
    lines.push('', "Products I'm considering:", ...opts.products.slice(0, 8).map(p => `- ${productLine(p)}`));
  }
  lines.push(...resultsLinkLines(opts.context));
  return lines.join('\n');
}

/** Quote request text for one product (detail modal, compare panel). */
export function productQuoteText(p: Product, context?: QuoteContext): string {
  return [
    HEADING,
    '',
    `Product: ${productLine(p)}`,
    ...(p.link ? [p.link] : []),
    ...answerLines(context),
    ...resultsLinkLines(context),
  ].join('\n');
}

/** Quote request text for a semi-custom medical configuration. */
export function configQuoteText(rows: { label: string; value: string }[]): string {
  return [
    'Quote request - semi-custom medical footswitch (from the Switch Wizard)',
    '',
    'My configuration:',
    ...rows.map(({ label, value }) => `- ${label}: ${value}`),
  ].join('\n');
}

/**
 * The quote page with the form pre-filled. linemaster.com's form is Contact
 * Form 7, which fills a field from the URL parameter of the same name once
 * its tag has `default:get`: `comments` is the Message box and `Application`
 * the Application field. See WORDPRESS.md, "Pre-filled quote form".
 */
export function quoteUrl(details: string, application?: string): string {
  const params = new URLSearchParams();
  if (application) params.set('Application', application);
  params.set('comments', details);
  return `${CONTACT_URL}?${params.toString()}`;
}

export type QuoteSource = 'results' | 'product' | 'compare' | 'medical_custom';

/**
 * Props for an <a> that opens the quote form in a new tab (so the buyer
 * keeps their results), pre-filled with `details`. The details are also
 * copied to the clipboard, as a fallback for a form that comes up empty.
 * Clipboard access can be unavailable (http pages, denied permission):
 * the link still opens; only the helper toast is skipped.
 */
export function quoteLinkProps(details: string, opts: {
  source: QuoteSource;
  application?: string;
  products?: Product[];
}) {
  return {
    href: quoteUrl(details, opts.application),
    target: '_blank',
    rel: 'noopener noreferrer',
    onClick: () => {
      trackQuoteClick(opts.source, {
        application: opts.application,
        products: opts.products?.slice(0, 8).map(productLine),
      });
      navigator.clipboard?.writeText(details)
        .then(() => notify.success('Your switch details are copied. If the Message box on the quote form is empty, paste them in.', { duration: 8000 }))
        .catch(() => {});
    },
  };
}
