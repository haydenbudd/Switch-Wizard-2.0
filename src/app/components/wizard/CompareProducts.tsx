import type { Product } from '@/app/lib/api';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { X, ExternalLink, ChevronUp, ChevronDown, GitCompareArrows, Mail, Trash2 } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { getProxiedImageUrl, getProxiedImageSrcSet } from '@/app/utils/imageProxy';
import { useState, useEffect, Fragment } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  optionLabel,
  connections,
  technologies,
  actions as actionOptions,
  features as featureOptions,
} from '@/app/data/options';
import { ipShort, ipMeaning } from '@/app/utils/ipRating';
import { productQuoteText, quoteLinkProps } from '@/app/utils/quote';
import {
  colorClasses,
  getTechColor,
  getDutyColor,
  getIpColor,
  getMaterialColor,
  getConnectionColor,
  getFeatureColor,
  getCircuitColor,
} from '@/app/lib/attributeColors';

const MotionDiv = motion.div;

/** How many products can be compared side by side. */
export const MAX_COMPARE = 4;

interface CompareProductsProps {
  products: Product[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

interface CompareRow {
  label: string;
  /** Display value; '' means "no data" (shown as an em dash). */
  value: (p: Product) => string;
  /** Optional color badge classes for the value. */
  color?: (p: Product) => string;
  /** Optional tooltip for the value. */
  title?: (p: Product) => string;
}

const spec = (key: string) => (p: Product) => (p.specs?.[key] ?? '').trim();
const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

// Grouped so buyers can scan by concern. Rows with no data for any of the
// compared products are dropped automatically.
const SECTIONS: { title: string; rows: CompareRow[] }[] = [
  {
    title: 'Overview',
    rows: [
      { label: 'Part Number', value: p => p.part_number || '' },
      { label: 'Technology', value: p => optionLabel(technologies, p.technology), color: p => colorClasses(getTechColor(p.technology)) },
      { label: 'Action Type', value: p => (p.actions || []).map(a => optionLabel(actionOptions, a)).join(' / ') },
      { label: 'Duty Rating', value: p => cap(p.duty), color: p => colorClasses(getDutyColor(p.duty)) },
      { label: 'IP Rating', value: p => ipShort(p.ip), color: p => colorClasses(getIpColor(p.ip)), title: p => ipMeaning(p.ip) },
      // Explosion-proof models: hazardous-location classes and agency marks
      { label: 'Hazardous Location', value: spec('Hazardous Location Ratings') },
      { label: 'Approvals', value: spec('Agency Approvals') },
    ],
  },
  {
    title: 'Electrical',
    rows: [
      { label: 'Electrical Rating', value: spec('Electrical Ratings') },
      { label: 'Contact Form', value: spec('Circuitries') },
      // Pneumatic switches control no electrical circuits (stored as 0)
      { label: 'Circuits Controlled', value: p => (p.circuitry === '0' ? 'None' : p.circuitry || ''), color: p => (p.circuitry && p.circuitry !== '0' ? colorClasses(getCircuitColor(p.circuitry)) : '') },
      { label: 'Stages', value: p => (p.stages || '').trim() },
    ],
  },
  {
    title: 'Build',
    rows: [
      { label: 'Material', value: p => p.material || '', color: p => (p.material ? colorClasses(getMaterialColor(p.material)) : '') },
      { label: 'Color', value: p => p.color || spec('Housing Colors')(p) },
      { label: 'Pedals', value: p => (p.pedal_count ? String(p.pedal_count) : '') },
      { label: 'Shield / Guard', value: spec('Shields & Guards') },
      { label: 'Features', value: p => (p.features || []).map(f => optionLabel(featureOptions, f)).join(', ') },
    ],
  },
  {
    title: 'Connection',
    rows: [
      { label: 'Connection Type', value: p => (p.connector_type ? optionLabel(connections, p.connector_type) : ''), color: p => (p.connector_type ? colorClasses(getConnectionColor(p.connector_type)) : '') },
      { label: 'Cable Entry', value: spec('Cable Entries') },
      { label: 'Cordset', value: spec('Cordsets') },
      { label: 'Pneumatic Valve', value: spec('Pneumatic Valves') },
      { label: 'Ports', value: spec('Input & Output Ports') },
    ],
  },
];

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();

/** True below Tailwind's `sm` breakpoint — phones get narrower columns. */
function useIsNarrow(): boolean {
  const query = '(max-width: 639px)';
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setNarrow(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return narrow;
}

export function CompareProducts({ products, open, onOpenChange, onRemove, onClear }: CompareProductsProps) {
  const [diffOnly, setDiffOnly] = useState(false);
  const isNarrow = useIsNarrow();

  if (products.length === 0) return null;
  const canCompare = products.length >= 2;
  const expanded = open && canCompare;

  // Resolve every row once: drop rows nobody has data for, flag rows whose
  // values differ between the compared products.
  const sections = SECTIONS.map(section => ({
    title: section.title,
    rows: section.rows
      .map(row => {
        const values = products.map(p => row.value(p));
        const hasData = values.some(Boolean);
        const differs = new Set(values.map(norm)).size > 1;
        return { row, values, hasData, differs };
      })
      .filter(r => r.hasData && (!diffOnly || r.differs)),
  })).filter(s => s.rows.length > 0);

  const differingCount = SECTIONS.flatMap(s => s.rows).filter(row => {
    const values = products.map(p => row.value(p));
    return values.some(Boolean) && new Set(values.map(norm)).size > 1;
  }).length;

  // Label column + one column per product. Fixed widths keep 4 products
  // readable; the table scrolls sideways (labels pinned) on narrow screens.
  const labelWidth = isNarrow ? 112 : 180;
  const tableMinWidth = labelWidth + products.length * (isNarrow ? 190 : 230);

  return (
    <AnimatePresence>
      <MotionDiv
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50"
      >
        <div className="mx-auto max-w-7xl px-2 sm:px-4 pb-2 sm:pb-4">
          <div className="rounded-2xl border border-border/60 bg-background/95 backdrop-blur-xl shadow-2xl shadow-black/20 overflow-hidden">

            {/* Bar — always visible */}
            <div className="flex items-center justify-between gap-3 px-3 sm:px-6 py-3">
              <button
                type="button"
                onClick={() => canCompare && onOpenChange(!open)}
                aria-expanded={expanded}
                aria-controls="compare-panel"
                aria-label={canCompare
                  ? `${expanded ? 'Hide' : 'Show'} comparison of ${products.length} products`
                  : `Compare: add ${2 - products.length} more product to compare`}
                disabled={!canCompare}
                className="flex items-center gap-3 min-w-0 text-left rounded-lg -m-1 p-1 hover:bg-muted/30 transition-colors disabled:hover:bg-transparent disabled:cursor-default"
              >
                <GitCompareArrows className="w-7 h-7 shrink-0 !text-primary" aria-hidden="true" />
                <span className="!text-lg sm:!text-xl !font-semibold !text-primary whitespace-nowrap">
                  Compare <span className="tabular-nums">{products.length}/{MAX_COMPARE}</span>
                </span>

                {/* Mini product avatars */}
                <span className="hidden sm:flex -space-x-2" aria-hidden="true">
                  {products.map(p => (
                    <span
                      key={p.id}
                      className="w-10 h-10 rounded-full border-2 border-background bg-secondary flex items-center justify-center overflow-hidden"
                      title={p.series}
                    >
                      {p.image ? (
                        // Same width as ProductCard (400/800 srcset) so the
                        // browser cache hits instead of fetching a new variant.
                        <ImageWithFallback
                          src={getProxiedImageUrl(p.image, { width: 400 })}
                          srcSet={getProxiedImageSrcSet(p.image, 400)}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="eager"
                          fetchPriority="high"
                        />
                      ) : (
                        <span className="text-sm font-bold text-muted-foreground">{p.series.slice(0, 2)}</span>
                      )}
                    </span>
                  ))}
                </span>

                <span className="!text-sm sm:!text-base !text-muted-foreground truncate">
                  {!canCompare
                    ? `Add ${2 - products.length} more to compare`
                    : (
                      <>
                        {expanded ? 'Hide' : 'Show'}
                        <span className="hidden sm:inline"> comparison</span>
                      </>
                    )}
                </span>
                {canCompare && (expanded
                  ? <ChevronDown className="w-6 h-6 shrink-0 text-muted-foreground" aria-hidden="true" />
                  : <ChevronUp className="w-6 h-6 shrink-0 text-muted-foreground" aria-hidden="true" />)}
              </button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="shrink-0 gap-1.5 !text-muted-foreground"
                aria-label="Clear all compared products"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Clear all</span>
              </Button>
            </div>

            {/* Comparison table */}
            <AnimatePresence initial={false}>
              {expanded && (
                <MotionDiv
                  id="compare-panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                  className="overflow-hidden border-t border-border/50 bg-background"
                >
                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-6 py-2.5 bg-muted/20">
                    <label className="flex items-center gap-2 cursor-pointer select-none !text-base">
                      <input
                        type="checkbox"
                        checked={diffOnly}
                        onChange={e => setDiffOnly(e.target.checked)}
                        className="w-4 h-4 accent-[var(--primary)]"
                      />
                      Show differences only
                    </label>
                    <span className="!text-sm !text-muted-foreground">
                      {differingCount === 0
                        ? 'These products match on every listed spec'
                        : `${differingCount} ${differingCount === 1 ? 'spec differs' : 'specs differ'} (highlighted)`}
                    </span>
                  </div>

                  <div className="max-h-[70vh] overflow-auto">
                    <table className="w-full border-collapse table-fixed" style={{ minWidth: tableMinWidth }}>
                      <colgroup>
                        <col style={{ width: labelWidth }} />
                        {products.map(p => <col key={p.id} />)}
                      </colgroup>

                      {/* Sticky product header */}
                      <thead className="sticky top-0 z-20 bg-background">
                        <tr className="border-b border-border/60">
                          <th className="sticky left-0 z-30 bg-background" aria-label="Spec" />
                          {products.map(product => (
                            <th key={product.id} scope="col" className="p-3 align-top font-normal">
                              <div className="relative flex flex-col items-center gap-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => onRemove(product.id)}
                                  className="absolute -top-1 right-0 p-1.5 rounded-full hover:bg-muted text-muted-foreground"
                                  aria-label={`Remove ${product.series} from comparison`}
                                  title="Remove"
                                >
                                  <X className="w-4 h-4" aria-hidden="true" />
                                </button>
                                <div className="w-28 h-20 flex items-center justify-center">
                                  {product.image && (
                                    <ImageWithFallback
                                      src={getProxiedImageUrl(product.image, { width: 400 })}
                                      srcSet={getProxiedImageSrcSet(product.image, 400)}
                                      alt={product.series}
                                      className="max-w-full max-h-full object-contain"
                                      loading="eager"
                                      fetchPriority="high"
                                    />
                                  )}
                                </div>
                                <span className="!text-lg !font-bold leading-tight">{product.series}</span>
                                {product.part_number && (
                                  <span className="!text-sm !text-muted-foreground font-mono">#{product.part_number}</span>
                                )}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {sections.map(section => (
                          <Fragment key={section.title}>
                            <tr>
                              <th
                                colSpan={products.length + 1}
                                scope="colgroup"
                                className="sticky left-0 text-left px-3 pt-4 pb-1 !text-xs !font-semibold uppercase tracking-widest !text-muted-foreground"
                              >
                                {section.title}
                              </th>
                            </tr>
                            {section.rows.map(({ row, values, differs }) => (
                              <tr
                                key={row.label}
                                className={`border-t border-border/40 ${differs ? 'bg-amber-50/70 dark:bg-amber-900/10' : ''}`}
                              >
                                <th
                                  scope="row"
                                  className={`sticky left-0 z-10 text-left align-top px-3 py-2.5 !text-sm !font-medium !text-muted-foreground ${differs ? 'bg-amber-50 dark:bg-[#1f1a10]' : 'bg-background'}`}
                                >
                                  {row.label}
                                </th>
                                {products.map((product, i) => {
                                  const value = values[i];
                                  if (!value) {
                                    return <td key={product.id} className="px-3 py-2.5 text-center !text-muted-foreground/60">—</td>;
                                  }
                                  if (row.label === 'Features') {
                                    return (
                                      <td key={product.id} className="px-3 py-2.5 text-center align-top">
                                        <div className="flex flex-wrap justify-center gap-1.5">
                                          {(product.features || []).map(f => (
                                            <Badge key={f} variant="secondary" className={`!text-sm font-normal px-2.5 py-0.5 ${colorClasses(getFeatureColor(f))}`}>
                                              {optionLabel(featureOptions, f)}
                                            </Badge>
                                          ))}
                                        </div>
                                      </td>
                                    );
                                  }
                                  const color = row.color?.(product);
                                  return (
                                    <td key={product.id} className="px-3 py-2.5 text-center align-top" title={row.title?.(product)}>
                                      {color ? (
                                        <Badge variant="secondary" className={`!text-sm font-normal px-2.5 py-0.5 whitespace-normal rounded-[8px] ${color}`}>
                                          {value}
                                        </Badge>
                                      ) : (
                                        <span className="!text-sm leading-snug">{value}</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </Fragment>
                        ))}

                        {sections.length === 0 && (
                          <tr>
                            <td colSpan={products.length + 1} className="px-3 py-6 text-center !text-muted-foreground">
                              No differences in the listed specs.
                            </td>
                          </tr>
                        )}

                        {/* Actions */}
                        <tr className="border-t border-border/60">
                          <th scope="row" className="sticky left-0 z-10 bg-background text-left px-3 py-3 !text-sm !font-medium !text-muted-foreground">
                            Next step
                          </th>
                          {products.map(product => (
                            <td key={product.id} className="px-3 py-3">
                              <div className="flex flex-col items-stretch gap-2">
                                <Button asChild size="sm" className="gap-1.5 !text-sm">
                                  <a {...quoteLinkProps(productQuoteText(product))}>
                                    <Mail className="w-4 h-4" aria-hidden="true" /> Request a Quote
                                  </a>
                                </Button>
                                {product.link && (
                                  <Button asChild size="sm" variant="outline" className="gap-1.5 !text-sm">
                                    <a href={product.link} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="w-4 h-4" aria-hidden="true" /> Product page
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </MotionDiv>
              )}
            </AnimatePresence>
          </div>
        </div>
      </MotionDiv>
    </AnimatePresence>
  );
}
