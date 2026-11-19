import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight, Sparkles, Pencil } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { FilterChip } from '@/app/components/FilterChip';
import { optionLabel } from '@/app/data/options';
import type { Product } from '@/app/lib/api';
import type { WizardState } from '@/app/hooks/useWizardState';
import type { SmartSearchResult } from '@/app/utils/smartSearch';

// The matcher is fetched the first time the box is used, so the front page's
// first load doesn't carry it.
type SmartSearchModule = typeof import('@/app/utils/smartSearch');
let modulePromise: Promise<SmartSearchModule> | null = null;
const loadMatcher = () => (modulePromise ??= import('@/app/utils/smartSearch'));

// Sample descriptions, picked to show off different kinds of answer
const EXAMPLES = [
  'Heavy-duty twin pedal with a guard for a washdown area',
  'Variable speed pedal for a sewing machine',
  'Explosion-proof switch',
];

function matchSummary(r: SmartSearchResult): string {
  const total = r.exact + r.close;
  if (r.chips.length === 0) return '';
  if (r.close === 0) return `${total} ${total === 1 ? 'match' : 'matches'}`;
  if (r.exact === 0) return `${total} close ${total === 1 ? 'match' : 'matches'}`;
  return `${r.exact} exact ${r.exact === 1 ? 'match' : 'matches'}, ${r.close} close`;
}

interface SmartSearchBoxProps {
  products: Product[];
  /** Text to start with (the last description, after Back). */
  initialQuery?: string;
  onSearch: (result: SmartSearchResult) => void;
  /** Nothing was understood: open the full catalog instead. */
  onBrowseAll: () => void;
}

/**
 * Front page "describe the switch you need" box. Shows, as the buyer types,
 * what was understood and how many switches it matches.
 */
export function SmartSearchBox({ products, initialQuery = '', onSearch, onBrowseAll }: SmartSearchBoxProps) {
  const [text, setText] = useState(initialQuery);
  const [result, setResult] = useState<SmartSearchResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Re-run the matcher (debounced) whenever the text or the catalog changes
  useEffect(() => {
    if (!text.trim()) { setResult(null); return; }
    let cancelled = false;
    const t = setTimeout(() => {
      loadMatcher().then(m => {
        if (!cancelled) setResult(m.runSmartSearch(text, products));
      }).catch(() => { /* chunk failed to load; submit retries */ });
    }, 120);
    return () => { cancelled = true; clearTimeout(t); };
  }, [text, products]);

  const submit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim()) { inputRef.current?.focus(); return; }
    try {
      const m = await loadMatcher();
      const r = m.runSmartSearch(text, products);
      if (r.chips.length === 0) onBrowseAll();
      else onSearch(r);
    } catch {
      modulePromise = null;
      onBrowseAll();
    }
  }, [text, products, onSearch, onBrowseAll]);

  const showing = result && result.query === text ? result : null;
  const understood = showing?.chips.filter(c => !showing.dropped.some(d => d.key === c.key)) ?? [];

  return (
    <form
      role="search"
      aria-label="Describe the switch you need"
      onSubmit={submit}
      className="glass-card rounded-[14px] w-full mx-auto px-5 py-6 sm:px-8 sm:py-7 text-left"
      style={{ maxWidth: '760px' }}
    >
      <label htmlFor="lm-smart-search" className="!flex items-center gap-2 !text-lg !font-semibold !text-foreground !mb-1">
        <Sparkles className="w-5 h-5 !text-brand-steel" aria-hidden="true" />
        Describe the switch you need
      </label>
      {/* ! margins: the site's theme sets p{margin:0 0 10px} */}
      <p className="!mt-0 !mb-4 !text-sm !text-muted-foreground">
        Type it in your own words and we&apos;ll match it to our catalog.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          ref={inputRef}
          id="lm-smart-search"
          // No type attribute (it defaults to text): theme rules for
          // input[type="text"] on linemaster.com then leave it alone
          value={text}
          onChange={e => setText(e.target.value)}
          onFocus={() => { loadMatcher().catch(() => { modulePromise = null; }); }}
          placeholder="e.g. rugged two-pedal switch with a guard for a wet floor"
          autoComplete="off"
          enterKeyHint="search"
          aria-describedby="lm-smart-search-status"
          className="w-full sm:w-auto sm:flex-1 min-w-0 h-12 shrink-0 rounded-full border border-input bg-background px-5 !text-base !text-foreground placeholder:!text-muted-foreground shadow-sm outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
        />
        <Button type="submit" variant="cta" className="h-12 px-6 gap-2 !text-sm shrink-0 group">
          Find matches
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Button>
      </div>

      <div id="lm-smart-search-status" aria-live="polite" className="mt-4 min-h-[2rem]">
        {!text.trim() ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="!text-sm !text-muted-foreground">Try:</span>
            {EXAMPLES.map(ex => (
              <button
                key={ex}
                type="button"
                onClick={() => { setText(ex); inputRef.current?.focus(); }}
                className="rounded-full border border-border/70 bg-background/60 hover:border-primary/40 hover:bg-muted px-3 py-1 !text-sm !text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                {ex}
              </button>
            ))}
          </div>
        ) : showing && understood.length > 0 ? (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="!text-sm !text-muted-foreground">We understood:</span>
              {understood.map(c => (
                <span key={c.key} className="rounded-full bg-primary/10 !text-primary px-3 py-1 !text-sm !font-medium">
                  {c.short}
                </span>
              ))}
              <span className="!text-sm !font-semibold !text-foreground tabular-nums">· {matchSummary(showing)}</span>
            </div>
            {showing.dropped.length > 0 && (
              <p className="!my-0 !text-sm !text-muted-foreground">
                No stock switch matches all of that, so we left out{' '}
                <span className="!font-medium !text-foreground">{showing.dropped.map(d => d.short).join(', ')}</span>.
                Our team can still help with a custom build.
              </p>
            )}
          </div>
        ) : showing ? (
          <p className="!my-0 !text-sm !text-muted-foreground">
            We didn&apos;t catch any switch details yet. Try words like <em>wireless</em>, <em>two pedal</em>,{' '}
            <em>guard</em>, <em>washdown</em> or <em>heavy duty</em>, or press Find matches to browse everything.
          </p>
        ) : null}
      </div>
    </form>
  );
}

type LabeledOption = { id: string; label: string };

interface SmartSearchSummaryProps {
  wizardState: WizardState;
  /** The buyer's own words, when they came from the search box. */
  query?: string;
  /** Understood, but left out because nothing matched with it. */
  dropped?: string[];
  applications: LabeledOption[];
  technologies: LabeledOption[];
  actions: LabeledOption[];
  environments: LabeledOption[];
  duties: LabeledOption[];
  connections: LabeledOption[];
  circuitCounts: LabeledOption[];
  features: LabeledOption[];
  /** Back to the front page with the description in the box. */
  onEdit?: () => void;
}

/**
 * Results page header for a described search: the description, and what it
 * was understood as, each removable. (The guided wizard's answers bar jumps
 * back to that step instead, which needs the earlier answers to be set.)
 */
export function SmartSearchSummary(props: SmartSearchSummaryProps) {
  const { wizardState: s, query, dropped = [], onEdit } = props;

  const single: [string, string, LabeledOption[], () => void][] = [
    ['Application', s.selectedApplication, props.applications, () => s.setSelectedApplication('')],
    ['Technology', s.selectedTechnology, props.technologies, () => s.setSelectedTechnology('')],
    ['Action Type', s.selectedAction, props.actions, () => s.setSelectedAction('')],
    ['Environment', s.selectedEnvironment, props.environments, () => s.setSelectedEnvironment('')],
    ['Duty Rating', s.selectedDuty, props.duties, () => s.setSelectedDuty('')],
    ['Connection Type', s.selectedConnection, props.connections, () => s.setSelectedConnection('')],
    ['Circuits Controlled', s.selectedCircuitCount, props.circuitCounts, () => s.setSelectedCircuitCount('')],
  ];
  const chips = single
    .filter(([, value]) => value)
    .map(([label, value, options, remove]) => ({ key: label, label: `${label}: ${optionLabel(options, value)}`, remove }));
  if (s.selectedGuard) {
    chips.push({
      key: 'guard',
      label: `Safety Guard: ${s.selectedGuard === 'yes' ? 'Required' : 'Not required'}`,
      remove: () => s.setSelectedGuard(''),
    });
  }
  for (const f of s.selectedFeatures) {
    chips.push({
      key: `feature:${f}`,
      label: `Feature: ${optionLabel(props.features, f)}`,
      remove: () => s.setSelectedFeatures(prev => prev.filter(x => x !== f)),
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {query && (
        <p className="!my-0 !text-base !text-muted-foreground px-1">
          Matches for <span className="!font-semibold !text-foreground">&ldquo;{query}&rdquo;</span>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-1 ml-3 !text-sm !font-medium !text-primary hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
            >
              <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
              Edit
            </button>
          )}
        </p>
      )}
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-1">
          <span className="!text-sm !font-medium !text-muted-foreground mr-1">We understood:</span>
          {chips.map(c => (
            <FilterChip key={c.key} label={c.label} onRemove={c.remove} className="!text-sm" />
          ))}
        </div>
      )}
      {dropped.length > 0 && (
        <p className="!my-0 !text-sm !text-muted-foreground px-1">
          No stock switch matches all of that, so these were left out: {dropped.join(', ')}. Request a quote to ask about a custom build.
        </p>
      )}
    </div>
  );
}
