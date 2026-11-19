/**
 * "Describe the switch you need" — a free, in-browser keyword matcher.
 *
 * No AI service: the buyer's sentence is scanned for words and phrases
 * (plus common synonyms) that map onto the wizard's own answers, e.g.
 * "rugged two pedal switch with a guard for a washdown area" becomes
 * Heavy Duty + Twin Pedal + Safety Guard + Wet / Washdown. Those answers
 * then go through the same scoring as the guided wizard (matchScore), so
 * the results page ranks exact and close matches exactly as it does after
 * the questions.
 *
 * This module is loaded on demand (when the search box is first used), so
 * it adds nothing to the front page's first load.
 *
 * Adding a synonym: find the field's RULES entry below and extend its regex.
 * Patterns run on normalized text: lower case, hyphens and punctuation
 * turned into spaces, so "Heavy-Duty" is matched as "heavy duty".
 */
import type { Product } from '@/app/lib/api';
import type { WizardState } from '@/app/hooks/useWizardState';
import { scoreAndSplit } from '@/app/utils/matchScore';
import { getProcessedProducts } from '@/app/utils/productFilters';
import {
  applications, technologies, actions, environments, duties, connections,
  circuitCounts, features as featureOptions, categories, optionLabel,
} from '@/app/data/options';

/** The wizard answers a description can set. */
export interface SmartAnswers {
  selectedApplication?: string;
  selectedTechnology?: string;
  selectedAction?: string;
  selectedEnvironment?: string;
  selectedDuty?: string;
  selectedConnection?: string;
  selectedCircuitCount?: string;
  selectedGuard?: string;
  selectedFeatures?: string[];
}

type SingleField = Exclude<keyof SmartAnswers, 'selectedFeatures'>;

/**
 * One thing we understood. `key` identifies it for removal:
 * a wizard field name, `feature:<id>`, `material:<name>` or `search`.
 */
export interface SmartChip {
  key: string;
  /** "Duty Rating: Heavy Duty" */
  label: string;
  /** "Heavy Duty", for the live preview under the search box */
  short: string;
}

export interface ParsedDescription {
  answers: SmartAnswers;
  /** Housing materials (results page's material filter). */
  materials: string[];
  /** Series name, part number or "explosion proof" for the keyword search. */
  searchTerm: string;
  chips: SmartChip[];
}

export interface SmartSearchResult extends ParsedDescription {
  query: string;
  /** Industry card the application sits under ('' when none). */
  category: string;
  /** Understood, but left out because no stock switch matched with it. */
  dropped: SmartChip[];
  exact: number;
  close: number;
}

// ── Rules ──────────────────────────────────────────────────────────────

const TWO = '(?:2|two|dual|double|twin)';

interface Rule {
  field: SingleField;
  value: string;
  re: RegExp;
}

// Order matters within a field: the first rule that matches wins, so the
// more specific phrases come first (power plant → Utilities before plant →
// Manufacturing).
const RULES: Rule[] = [
  // Application
  { field: 'selectedApplication', value: 'medical', re: /\b(medical|surgical|surgery|surgeon|hospital|dental|dentist|patient|doctor|clinic(al)?|ultrasound|x ray|xray|exam(ination)? (table|chair|room)|veterinar(y|ian)|operating room|ophthalm\w*|laser therapy|healthcare)\b/ },
  { field: 'selectedApplication', value: 'tattoo', re: /\b(tattoo\w*|body art|piercing|permanent makeup)\b/ },
  { field: 'selectedApplication', value: 'utilities', re: /\b(utilit(y|ies)|power (plant|station)|water treatment|waste ?water|infrastructure|substation)\b/ },
  { field: 'selectedApplication', value: 'automotive', re: /\b(automotive|auto (shop|body|repair)|body shop|car (lift|wash)|cars?|vehicles?|tire (changer|machine)|tyre|garage|mechanic|paint booth|vehicle lift)\b/ },
  { field: 'selectedApplication', value: 'construction', re: /\b(construction|weld(er|ing)?|fabricat(ion|ing)|job site|jobsite|heavy equipment)\b/ },
  { field: 'selectedApplication', value: 'agriculture', re: /\b(agricultur(e|al)|farm(ing)?|tractor|food processing|packaging|packing line)\b/ },
  { field: 'selectedApplication', value: 'defense', re: /\b(defen[cs]e|military|army|navy|air force|government)\b/ },
  { field: 'selectedApplication', value: 'general', re: /\b(sewing|office|dictation|transcription|music(al)?|guitar|pedal steel|computer|pc|keyboard|gaming|streaming|hobby|consumer|photo booth|recording|general use)\b/ },
  { field: 'selectedApplication', value: 'manufacturing', re: /\b(manufactur\w*|cnc|lathe|mill(ing)?|machin(e|es|ery|ing)|assembly( line)?|factory|production line|punch press|press brake|presses|woodwork\w*|saw|router|industrial)\b/ },

  // Technology
  { field: 'selectedTechnology', value: 'wireless', re: /\b(wireless|cordless|cord free|rf|radio|bluetooth|no (cords?|cables?|wires?)|without (a )?(cords?|cables?|wires?)|untethered)\b/ },
  { field: 'selectedTechnology', value: 'pneumatic', re: /\b(pneumatic\w*|air (powered|operated|actuated|valve|line|pressure)|compressed air|airval|psi)\b/ },
  { field: 'selectedTechnology', value: 'electrical', re: /\b(electric(al)?|wired|corded)\b/ },

  // Action
  { field: 'selectedAction', value: 'variable', re: /\b(variable|speed control|adjustable speed|potentiometer|pot|proportional|analog(ue)?|rheostat|throttle|pressure sensitive|dimmer|speed)\b/ },
  { field: 'selectedAction', value: 'maintained', re: /\b(maintain(ed)?|latch(ing|ed)?|toggle|push on push off|press on press off|click on click off|alternate action|stays? on|on until pressed again)\b/ },
  { field: 'selectedAction', value: 'momentary', re: /\b(momentary|hold to run|press and hold|while (pressed|held|holding|down)|only when pressed|spring return|dead ?man|jog(ging)?|release to stop)\b/ },

  // Environment
  { field: 'selectedEnvironment', value: 'wet', re: /\b(wet|wash ?down|waterproof|water proof|watertight|submersible|submerged|underwater|ip ?6[78]|ipx?[78]|hose ?down|liquids?|flood\w*)\b/ },
  { field: 'selectedEnvironment', value: 'damp', re: /\b(damp|splash\w*|spills?|dust(y|proof)?|dirt(y)?|oil(y)?|coolant|outdoors?|outside|ip ?5[4-6]|ip ?65|humid\w*|grime)\b/ },
  { field: 'selectedEnvironment', value: 'dry', re: /\b(dry|indoors?|inside|clean (room|area|bench)|ip ?20)\b/ },

  // Duty
  { field: 'selectedDuty', value: 'heavy', re: /\b(heavy (duty|use)|heavy|rugged\w*|tough|durable|industrial (grade|strength)|robust|indestructible|abuse|built to last|cast iron)\b/ },
  { field: 'selectedDuty', value: 'medium', re: /\b(medium (duty|use)|medium|moderate (use|duty)|general purpose|standard duty)\b/ },
  { field: 'selectedDuty', value: 'light', re: /\b(light (duty|use)|light ?weight|occasional (use)?|portable|small|compact)\b/ },

  // Connection
  { field: 'selectedConnection', value: 'quick-connect', re: /\b(quick (connect|disconnect)|spade|tab terminals?|connector)\b/ },
  { field: 'selectedConnection', value: 'screw-terminal', re: /\b(screw terminals?|terminals?|hard ?wired?|wire it (myself|ourselves)|solder)\b/ },
  { field: 'selectedConnection', value: 'pre-wired', re: /\b(prewired|ready to (use|plug)|plug( ?in| and play)?|power cord|with (a )?cord|cord (attached|included)|flying leads|phone plug|1\/4 (inch )?(jack|plug)|3 prong)\b/ },

  // Circuits
  { field: 'selectedCircuitCount', value: '1', re: /\b((1|one|single) circuits?|sp[ds]t)\b/ },
  { field: 'selectedCircuitCount', value: '2', re: /\b(2|two|dual|double) (circuits?|pole)|\bdpdt\b/ },
  { field: 'selectedCircuitCount', value: '3', re: /\b(3|three|triple) (circuits?|pole)|\btpdt\b/ },
  { field: 'selectedCircuitCount', value: '4', re: /\b(4|four) circuits?\b/ },

  // Safety guard (feature rules below handle "gated")
  { field: 'selectedGuard', value: 'no', re: /\b(unguarded|unshielded|open pedal)\b/ },
  { field: 'selectedGuard', value: 'yes', re: /\b(guard(ed|s)?|shield(ed|s)?|cover|hood(ed)?|protective|accidental\w*|prevent (accidental|unintended)|safety (guard|cover|shield)|anti trip|enclosed pedal)\b/ },
];

interface ListRule {
  value: string;
  re: RegExp;
}

const FEATURE_RULES: ListRule[] = [
  { value: 'twin', re: new RegExp(`\\b(twin|${TWO} (pedals?|treadles?|switch(es)?|foot ?switch(es)?)|pair of pedals|side by side pedals)\\b`) },
  { value: 'multi_stage', re: /\b((2|two|3|three|multi|multiple) (stage|step|position|level)s?|multistage|staged)\b/ },
  { value: 'gated', re: /\b(gated?|lock ?out|interlock(ed)?|lift (the )?(gate|guard))\b/ },
];

const MATERIAL_RULES: ListRule[] = [
  { value: 'Cast Iron', re: /\bcast iron\b/ },
  { value: 'Cast Aluminum', re: /\b(cast )?alumin(i)?um\b/ },
  { value: 'Stainless Steel', re: /\bstainless( steel)?\b/ },
  { value: 'Formed Steel', re: /\b(formed|sheet) steel\b/ },
  { value: 'Cast Zinc', re: /\bzinc\b/ },
  { value: 'Polymeric', re: /\b(plastic|polymer(ic)?|nylon|composite)\b/ },
];

// Product families named in the text go to the keyword search, which
// matches on series name. Words that are also plain adjectives
// ("classic", "compact", "premier", "deluxe") are left out on purpose.
const SERIES_WORDS: [RegExp, string][] = [
  [/\bexplosion proof\b|\bhazardous (location|area)s?\b|\bclass (1|i) div\w*\b|\batex\b|\bflammable\b|\bexplosive\b/, 'explosion proof'],
  [/\banti trip\b/, 'anti-trip'],
  [/\bhercules\b/, 'hercules'],
  [/\batlas\b/, 'atlas'],
  [/\bclipper\b/, 'clipper'],
  [/\baquiline\b/, 'aquiline'],
  [/\btread ?lite\b/, 'treadlite'],
  [/\bdolphin\b/, 'dolphin'],
  [/\bgem( v)?\b/, 'gem'],
  [/\bvarior\b/, 'varior'],
  [/\bairval\b/, 'airval'],
  [/\bair seal\b/, 'air seal'],
  [/\blektro\b/, 'lektro'],
  [/\bnautilus\b/, 'nautilus'],
  [/\bvanguard\b/, 'vanguard'],
];

// A match is ignored when one of these words sits just before it
// ("no guard", "not wireless", "without a cord").
const NEGATION = /\b(no|not|non|without|never|dont|doesnt|isnt|wont|nothing|avoid)( (a|an|any|the|need|needs|want|require|required|have|be|to))*\s*$/;

/** "Heavy-Duty, 2-pedal!" → " heavy duty 2 pedal " (padded for \b). */
export function normalize(text: string): string {
  return ' ' + text
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/\bpre ?-?wired\b/g, 'prewired')
    .replace(/[^a-z0-9/]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() + ' ';
}

/** Every non-negated match of `re` in `text`; `negated` is true if any were negated. */
function scan(text: string, re: RegExp): { hit: boolean; negated: boolean } {
  const g = new RegExp(re.source, 'g');
  let hit = false;
  let negated = false;
  for (const m of text.matchAll(g)) {
    const before = text.slice(Math.max(0, m.index - 30), m.index);
    if (NEGATION.test(before)) negated = true;
    else hit = true;
  }
  return { hit, negated };
}

const FIELD_LABELS: Record<SingleField, string> = {
  selectedApplication: 'Application',
  selectedTechnology: 'Technology',
  selectedAction: 'Action Type',
  selectedEnvironment: 'Environment',
  selectedDuty: 'Duty Rating',
  selectedConnection: 'Connection Type',
  selectedCircuitCount: 'Circuits Controlled',
  selectedGuard: 'Safety Guard',
};

const FIELD_OPTIONS: Record<SingleField, ReadonlyArray<{ id: string; label: string }>> = {
  selectedApplication: applications,
  selectedTechnology: technologies,
  selectedAction: actions,
  selectedEnvironment: environments,
  selectedDuty: duties,
  selectedConnection: connections,
  selectedCircuitCount: circuitCounts,
  selectedGuard: [{ id: 'yes', label: 'Required' }, { id: 'no', label: 'Not required' }],
};

export function chipLabel(field: SingleField, value: string): string {
  return `${FIELD_LABELS[field]}: ${optionLabel(FIELD_OPTIONS[field], value)}`;
}

/** Part numbers typed as-is ("632-S", "41sh12") that exist in the catalog. */
function findPartNumber(text: string, products: Product[]): string {
  const tokens = text.match(/[a-z0-9]*\d[a-z0-9]*(?:-[a-z0-9]+)*/gi) ?? [];
  for (const token of tokens) {
    if (token.length < 3) continue;
    const t = token.toLowerCase();
    const hit = products.find(p => p.part_number?.toLowerCase() === t);
    if (hit?.part_number) return hit.part_number;
  }
  return '';
}

/** Turn a free-text description into wizard answers. */
export function parseDescription(text: string, products: Product[] = []): ParsedDescription {
  const norm = normalize(text);
  const answers: SmartAnswers = {};
  const chips: SmartChip[] = [];

  for (const rule of RULES) {
    if (answers[rule.field]) continue;
    const { hit, negated } = scan(norm, rule.re);
    if (hit) {
      answers[rule.field] = rule.value;
    } else if (negated && rule.field === 'selectedGuard' && rule.value === 'yes') {
      // "no guard needed" is an answer too
      answers.selectedGuard = 'no';
    }
  }

  const features = FEATURE_RULES.filter(r => scan(norm, r.re).hit).map(r => r.value);
  // A gated guard is a guard
  if (features.includes('gated') && !answers.selectedGuard) answers.selectedGuard = 'yes';
  if (answers.selectedGuard === 'no') {
    const i = features.indexOf('gated');
    if (i >= 0) features.splice(i, 1);
  }
  if (features.length) answers.selectedFeatures = features;

  // Pneumatic and wireless switches have no wiring options
  if (answers.selectedTechnology === 'pneumatic' || answers.selectedTechnology === 'wireless') {
    delete answers.selectedConnection;
    delete answers.selectedCircuitCount;
  }

  for (const field of Object.keys(FIELD_LABELS) as SingleField[]) {
    const value = answers[field];
    if (!value) continue;
    const short = field === 'selectedGuard'
      ? (value === 'yes' ? 'Safety guard' : 'No guard')
      : optionLabel(FIELD_OPTIONS[field], value);
    chips.push({ key: field, label: chipLabel(field, value), short });
  }
  for (const f of features) {
    const name = optionLabel(featureOptions, f);
    chips.push({ key: `feature:${f}`, label: `Feature: ${name}`, short: name });
  }

  const materials = MATERIAL_RULES.filter(r => scan(norm, r.re).hit).map(r => r.value);
  for (const m of materials) chips.push({ key: `material:${m}`, label: `Material: ${m}`, short: m });

  let searchTerm = findPartNumber(text, products);
  if (!searchTerm) {
    const series = SERIES_WORDS.find(([re]) => scan(norm, re).hit);
    if (series) searchTerm = series[1];
  }
  if (searchTerm) chips.push({ key: 'search', label: `Keyword: ${searchTerm}`, short: `“${searchTerm}”` });

  return { answers, materials, searchTerm, chips };
}

/** Remove one understood item (a chip's key) from a parse. */
export function withoutChip(parsed: ParsedDescription, key: string): ParsedDescription {
  const answers = { ...parsed.answers };
  let { materials, searchTerm } = parsed;
  if (key.startsWith('feature:')) {
    const id = key.slice('feature:'.length);
    answers.selectedFeatures = (answers.selectedFeatures ?? []).filter(f => f !== id);
    if (!answers.selectedFeatures.length) delete answers.selectedFeatures;
  } else if (key.startsWith('material:')) {
    materials = materials.filter(m => m !== key.slice('material:'.length));
  } else if (key === 'search') {
    searchTerm = '';
  } else {
    delete answers[key as SingleField];
  }
  return { answers, materials, searchTerm, chips: parsed.chips.filter(c => c.key !== key) };
}

/** Wizard state for a parse, as the scorer expects it. */
function toState(answers: SmartAnswers): WizardState {
  return {
    selectedApplication: '', selectedTechnology: '', selectedAction: '', selectedEnvironment: '',
    selectedDuty: '', selectedConnection: '', selectedCircuitCount: '', selectedGuard: '',
    ...answers,
    selectedFeatures: answers.selectedFeatures ?? [],
  } as WizardState;
}

/** Exact and close matches, with the results page's search + material filters applied. */
export function countMatches(products: Product[], parsed: ParsedDescription): { exact: number; close: number } {
  const split = scoreAndSplit(products, toState(parsed.answers));
  const opts = {
    searchTerm: parsed.searchTerm, materialFilter: parsed.materials,
    dutyFilter: [], technologyFilter: [], cordedFilter: 'all' as const, sortBy: 'relevance' as const,
  };
  return {
    exact: getProcessedProducts(split.perfect.map(s => s.product), opts).length,
    close: getProcessedProducts(split.close.map(s => s.product), opts).length,
  };
}

// When nothing matches, these are let go one at a time, in this order:
// the hard filters first (technology and action exclude products outright),
// then the keyword and material filters, then everything else.
const RELAX_ORDER = [
  'selectedTechnology', 'selectedAction', 'search', 'material:', 'selectedCircuitCount',
  'selectedConnection', 'feature:', 'selectedEnvironment', 'selectedDuty', 'selectedGuard',
];

/**
 * Parse, count, and — if nothing at all matches — leave out understood
 * items one at a time until something does, so the buyer always lands on
 * a useful page. What was left out is reported as `dropped`.
 */
export function runSmartSearch(query: string, products: Product[]): SmartSearchResult {
  let parsed = parseDescription(query, products);
  let counts = countMatches(products, parsed);
  const dropped: SmartChip[] = [];

  for (const prefix of RELAX_ORDER) {
    if (counts.exact + counts.close > 0) break;
    for (const chip of parsed.chips.filter(c => c.key === prefix || (prefix.endsWith(':') && c.key.startsWith(prefix)))) {
      parsed = withoutChip(parsed, chip.key);
      dropped.push(chip);
    }
    counts = countMatches(products, parsed);
  }

  return { ...parsed, query, category: categoryFor(parsed.answers.selectedApplication), dropped, ...counts };
}

/** The industry card an application sits under (so Back and the breadcrumb behave). */
export function categoryFor(applicationId: string | undefined): string {
  if (!applicationId) return '';
  const parent = applications.find(a => a.id === applicationId)?.parentCategory ?? '';
  return categories.some(c => c.id === parent) ? parent : '';
}
