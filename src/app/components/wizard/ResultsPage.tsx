import { GlassCard } from '@/app/components/GlassCard';
import { ProductCard } from '@/app/components/ProductCard';
import { ProductDetailModal } from '@/app/components/ProductDetailModal';
import { CompareProducts, MAX_COMPARE } from '@/app/components/wizard/CompareProducts';
import { Button } from '@/app/components/ui/button';
import type { Product } from '@/app/lib/api';
import { WizardState } from '@/app/hooks/useWizardState';
import { RefreshCw, Download, ArrowLeft, SlidersHorizontal, ArrowUp, Check, Search, Link, GitCompareArrows, Mail, Menu } from 'lucide-react';
import { buildShareUrl } from '@/app/utils/shareUrl';
import { toast } from 'sonner';
import { EnhancedSearch } from '@/app/components/EnhancedSearch';
import { FilterChip } from '@/app/components/FilterChip';
import { WizardBreadcrumb } from '@/app/components/wizard/WizardBreadcrumb';
import { resultsQuoteText, quoteLinkProps } from '@/app/utils/quote';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/app/components/ui/dropdown-menu';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from '@/app/components/ui/drawer';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { getProcessedProducts } from '@/app/utils/productFilters';
import { getProxiedImageUrl, getProxiedImageSrcSet } from '@/app/utils/imageProxy';

// Friendly names for the internal filter keys shown in the no-results
// "remove this filter" recovery button
const RELAXED_FILTER_LABELS: Record<string, string> = {
  features: 'extra features',
  guard: 'safety guard',
  duty: 'duty rating',
  environment: 'environment',
  action: 'action type',
  technology: 'technology',
};

// Only id/label are read — accepts options whose icon is a React component
// (useProductData's OptionWithIcon) or a string (api Option).
interface LabeledOption {
  id: string;
  label: string;
}

/** The results page's on-screen lists, handed to the PDF generator. */
export interface PDFResults {
  perfect: Product[];
  close: { product: Product; reasons: string[] }[];
}

interface ResultsPageProps {
  wizardState: WizardState;
  products: Product[];
  applications: LabeledOption[];
  technologies: LabeledOption[];
  actions: LabeledOption[];
  environments: LabeledOption[];
  features: LabeledOption[];
  duties: LabeledOption[];
  filterProducts: (overrides?: Partial<WizardState>) => Product[];
  scoredProducts: (overrides?: Partial<WizardState>) => import('@/app/utils/matchScore').SplitResults;
  getAlternativeProducts: () => { products: Product[]; relaxed: string };
  needsCustomSolution: boolean;
  onBack: () => void;
  onReset: () => void;
  onGeneratePDF: (onScreen?: PDFResults) => void;
  connections: LabeledOption[];
  circuitCounts: LabeledOption[];
  /** Edit an earlier answer (breadcrumb chip) — returns here if unchanged. */
  onJumpToStep: (step: number) => void;
  clearDownstreamSelections: (step: number) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: 'relevance' | 'duty' | 'ip';
  setSortBy: (sort: 'relevance' | 'duty' | 'ip') => void;
  dutyFilter: string[];
  setDutyFilter: React.Dispatch<React.SetStateAction<string[]>>;
  cordedFilter: 'all' | 'corded' | 'cordless';
  setCordedFilter: (val: 'all' | 'corded' | 'cordless') => void;
  materialFilter: string[];
  setMaterialFilter: React.Dispatch<React.SetStateAction<string[]>>;
  technologyFilter: string[];
  setTechnologyFilter: React.Dispatch<React.SetStateAction<string[]>>;
}

export function ResultsPage({
  wizardState,
  products,
  applications,
  technologies,
  actions,
  environments,
  features,
  duties,
  filterProducts,
  scoredProducts,
  getAlternativeProducts,
  needsCustomSolution,
  onBack,
  onReset,
  onGeneratePDF,
  connections,
  circuitCounts,
  onJumpToStep,
  clearDownstreamSelections,
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  dutyFilter,
  setDutyFilter,
  cordedFilter,
  setCordedFilter,
  materialFilter,
  setMaterialFilter,
  technologyFilter,
  setTechnologyFilter,
}: ResultsPageProps) {
  // Guard against undefined props in environments like Figma Make
  if (!wizardState || !filterProducts) return null;

  // Comparison state
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  // Product detail modal state
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  // Mobile action drawer state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleCompareToggle = useCallback((id: string) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= MAX_COMPARE) {
        toast.info(`You can compare up to ${MAX_COMPARE} products — remove one to add another`);
        return prev;
      }
      return [...prev, id];
    });
  }, []);

  // Smart-match: split into perfect (every soft preference satisfied) and
  // close (partial fit). Hard filter is technology + action; everything else
  // is soft-scored. See utils/matchScore.ts.
  const split = useMemo(() => scoredProducts(), [scoredProducts]);

  // Build a quick lookup of which criteria each product falls short on, so
  // the secondary-filter pipeline can still operate on plain Product arrays
  // and the ProductCards can render their "Differs on" pill.
  const differsOnMap = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const sp of split.close) m.set(sp.product.id, sp.match.missing);
    return m;
  }, [split.close]);

  // Apply secondary filters (search/duty/material/wiring/sort) to each half
  // independently. Sort by relevance preserves the score order from split;
  // sort by duty/ip uses the existing sorter inside each half.
  const perfectProducts = useMemo(() => split.perfect.map(sp => sp.product), [split.perfect]);
  const closeProducts = useMemo(() => split.close.map(sp => sp.product), [split.close]);

  const finalPerfect = useMemo(() => {
    return getProcessedProducts(perfectProducts, {
      searchTerm, dutyFilter, materialFilter, technologyFilter, cordedFilter, sortBy,
    });
  }, [perfectProducts, searchTerm, dutyFilter, materialFilter, technologyFilter, cordedFilter, sortBy]);

  const finalClose = useMemo(() => {
    return getProcessedProducts(closeProducts, {
      searchTerm, dutyFilter, materialFilter, technologyFilter, cordedFilter, sortBy,
    });
  }, [closeProducts, searchTerm, dutyFilter, materialFilter, technologyFilter, cordedFilter, sortBy]);

  // Single combined list used by share-link badges and image preloading
  const finalResults = useMemo(() => [...finalPerfect, ...finalClose], [finalPerfect, finalClose]);

  // Technologies present before any on-page filtering, so ticking one
  // doesn't make the others vanish from the list. In the guided flow the
  // wizard's technology answer is a hard filter, leaving a single value —
  // the section then hides itself (only shown when there's a real choice).
  const availableTechnologies = useMemo(() => {
    const techs = new Set([...perfectProducts, ...closeProducts].map(p => p.technology).filter(Boolean));
    // Same order as the wizard's Technology step; unknown values sort last
    const rank = (t: string) => { const i = ['electrical', 'pneumatic', 'wireless'].indexOf(t); return i === -1 ? 99 : i; };
    return Array.from(techs).sort((a, b) => rank(a) - rank(b));
  }, [perfectProducts, closeProducts]);
  const techLabel = (id: string) => (technologies || []).find(t => t.id === id)?.label || id;

  // Derive available materials across both halves so the filter dropdown
  // can offer materials present in close matches too
  const availableMaterials = useMemo(() => {
    const mats = new Set(finalResults.map(p => p.material).filter(Boolean));
    return Array.from(mats).sort();
  }, [finalResults]);

  // Products selected for comparison
  const compareProducts = useMemo(() => {
    return compareIds
      .map(id => finalResults.find(p => p.id === id) ?? products.find(p => p.id === id))
      .filter((p): p is Product => p !== undefined);
  }, [compareIds, finalResults, products]);

  // Preload first 4 product images (above-the-fold). Use imagesrcset so the
  // browser picks the same URL the <img> srcset will resolve to (otherwise
  // retina users preload the 1x and the actual fetch is a separate 2x URL,
  // wasting the preload entirely).
  useEffect(() => {
    const toPreload = finalResults.slice(0, 4);
    const links: HTMLLinkElement[] = [];
    toPreload.forEach(p => {
      if (!p.image) return;
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.type = 'image/webp';
      link.href = getProxiedImageUrl(p.image, { width: 400 });
      const srcset = getProxiedImageSrcSet(p.image, 400);
      if (srcset) link.setAttribute('imagesrcset', srcset);
      // High priority — these images dominate LCP on the results page
      link.setAttribute('fetchpriority', 'high');
      document.head.appendChild(link);
      links.push(link);
    });
    return () => links.forEach(l => l.remove());
  }, [finalResults]);

  // Alternatives only when both perfect and close are empty — soft scoring
  // already covers partial matches, so the wizard-relaxation fallback is
  // the last resort for an entirely empty results page.
  const alternatives = useMemo(() => {
    if (finalPerfect.length === 0 && finalClose.length === 0) {
      return getAlternativeProducts();
    }
    return null;
  }, [finalPerfect.length, finalClose.length, getAlternativeProducts]);

  // Handler for clearing specific wizard filters
  type FilterType = 'application' | 'technology' | 'action' | 'environment' | 'duty' | 'material' | 'feature' | 'guard' | 'features' | 'all';
  const removeWizardFilter = (type: FilterType, value?: string) => {
    switch (type) {
      case 'application':
        wizardState.setSelectedApplication('');
        clearDownstreamSelections(0);
        break;
      case 'technology':
        wizardState.setSelectedTechnology('');
        clearDownstreamSelections(1);
        break;
      case 'action':
        wizardState.setSelectedAction('');
        break;
      case 'environment':
        wizardState.setSelectedEnvironment('');
        break;
      case 'duty':
        wizardState.setSelectedDuty('');
        break;
      case 'material':
        wizardState.setSelectedMaterial('');
        break;
      case 'feature':
      case 'features':
        if (value) {
          wizardState.setSelectedFeatures(prev => prev.filter(f => f !== value));
        } else {
          wizardState.setSelectedFeatures([]);
        }
        break;
      case 'guard':
        wizardState.setSelectedGuard('');
        break;
      case 'all':
        wizardState.setSelectedApplication('');
        wizardState.setSelectedTechnology('');
        wizardState.setSelectedAction('');
        wizardState.setSelectedEnvironment('');
        wizardState.setSelectedDuty('');
        wizardState.setSelectedMaterial('');
        wizardState.setSelectedGuard('');
        wizardState.setSelectedFeatures([]);
        break;
    }
  };

  // Generic toggle for multi-value filter arrays (duty, material, etc.)
  const makeToggleHandler = useCallback(
    <T extends string>(setter: React.Dispatch<React.SetStateAction<T[]>>, value: T) =>
      (e: React.SyntheticEvent) => {
        e.preventDefault();
        setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
      },
    []
  );

  const handleCopyLink = () => {
    const url = buildShareUrl(wizardState);
    // navigator.clipboard is undefined on non-secure (http) pages — calling
    // .writeText on it would throw synchronously, bypassing the .catch below
    if (!navigator.clipboard?.writeText) {
      toast.error('Copying requires a secure (https) connection');
      return;
    }
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copied to clipboard');
    }).catch((err: unknown) => {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        toast.error('Clipboard access denied — copy the URL from the address bar instead');
      } else {
        toast.error('Failed to copy link');
      }
    });
  };

  // Browse-all mode: reached via the start page shortcut (or by removing the
  // application chip). There's no configuration, so the page is a plain
  // catalog — no "recommended" framing, no PDF summary or share link.
  const isBrowseAll = wizardState.flow === 'standard' && !wizardState.selectedApplication;

  // On-page refinements (search box + More Filters). The wizard's own answers
  // are shown separately in the "Your answers" bar, where each one can be
  // edited in place rather than removed.
  const hasActiveFilters = Boolean(
    searchTerm ||
    dutyFilter.length > 0 ||
    materialFilter.length > 0 ||
    technologyFilter.length > 0 ||
    cordedFilter !== 'all'
  );

  const clearOnPageFilters = () => {
    setSearchTerm('');
    setDutyFilter([]);
    setMaterialFilter([]);
    setTechnologyFilter([]);
    setCordedFilter('all');
  };

  // Quote request → Linemaster contact page (new tab). The buyer's answers +
  // products in play (compare selection, else top results) are copied to the
  // clipboard for the contact form's message box.
  const quoteLink = quoteLinkProps(resultsQuoteText({
    wizardState,
    sources: { applications, technologies, actions, environments, duties, connections, circuitCounts, features },
    products: compareProducts.length > 0 ? compareProducts : finalResults,
    needsCustom: needsCustomSolution,
  }));

  // What the PDF should list — exactly what's on screen
  const pdfResults: PDFResults = {
    perfect: finalPerfect,
    close: finalClose.map(product => ({ product, reasons: differsOnMap.get(product.id) ?? [] })),
  };

  return (
    <div className="w-full py-8 pb-32 px-4 sm:px-[5%]">
      {/* Screen reader announcement for result count changes */}
      <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
        {finalResults.length} {finalResults.length === 1 ? 'product' : 'products'} found
      </div>

      {/* Header & Controls */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} title="Back" aria-label={isBrowseAll ? 'Back to start' : 'Go back to wizard'} className="hidden md:flex h-12 w-12">
              <ArrowLeft className="w-7 h-7" aria-hidden="true" />
            </Button>
            <h2 className="!text-3xl !font-bold !text-foreground">
              {isBrowseAll ? 'All Products' : 'Recommended Products'}
              <span className="!text-lg font-normal !text-muted-foreground ml-3">
                ({finalResults.length}
                {finalPerfect.length > 0 && finalClose.length > 0 && (
                  <> · {finalPerfect.length} perfect, {finalClose.length} close</>
                )})
              </span>
            </h2>
          </div>
          <div className="flex gap-2">
            {/* aria-labels needed: the text spans are display:none on mobile */}
            {!isBrowseAll && (
              <>
                <Button variant="outline" onClick={handleCopyLink} className="gap-2 !text-base" aria-label="Copy share link">
                  <Link className="w-6 h-6" aria-hidden="true" />
                  <span className="hidden sm:inline">Copy Link</span>
                </Button>
                <Button variant="outline" onClick={() => onGeneratePDF(pdfResults)} className="gap-2 !text-base" aria-label="Download results as PDF">
                  <Download className="w-6 h-6" aria-hidden="true" />
                  <span className="hidden sm:inline">Download PDF</span>
                </Button>
              </>
            )}
            <Button asChild className="gap-2 !text-base" aria-label="Request a quote (opens the Linemaster contact page)">
              <a {...quoteLink}>
                <Mail className="w-6 h-6" aria-hidden="true" />
                <span className="hidden sm:inline">Request a Quote</span>
              </a>
            </Button>
            <Button variant="ghost" onClick={onReset} className="gap-2 !text-base" aria-label="Reset wizard and start over">
              <RefreshCw className="w-6 h-6" aria-hidden="true" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          </div>
        </div>

        {/* The buyer's wizard answers — every one of them, each tappable to
            edit that step (unchanged answers bring them straight back). */}
        {!isBrowseAll && (
          <WizardBreadcrumb
            wizardState={wizardState}
            applications={applications}
            technologies={technologies}
            actions={actions}
            environments={environments}
            duties={duties}
            connections={connections}
            circuitCounts={circuitCounts}
            features={features}
            onJumpToStep={onJumpToStep}
            title="Your answers — tap one to change it"
            wrap
          />
        )}

        {/* On-page refinements */}
        {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center glass-card p-3 rounded-xl">
          <span className="text-base !font-medium !text-muted-foreground mr-2">Filters:</span>

          {searchTerm && (
            <FilterChip label={`Search: "${searchTerm}"`} onRemove={() => setSearchTerm('')} className="bg-blue-100 !text-blue-800 dark:bg-blue-900/30 dark:!text-blue-300" />
          )}

          {dutyFilter.length > 0 && (
            <FilterChip label={`Duty Rating: ${dutyFilter.join(', ')}`} onRemove={() => setDutyFilter([])} className="bg-orange-100 !text-orange-800 dark:bg-orange-900/30 dark:!text-orange-300" />
          )}

          {cordedFilter !== 'all' && (
            <FilterChip label={`Wiring: ${cordedFilter === 'corded' ? 'Cord included' : 'You wire it'}`} onRemove={() => setCordedFilter('all')} className="bg-sky-100 !text-sky-800 dark:bg-sky-900/30 dark:!text-sky-300" />
          )}
          {technologyFilter.length > 0 && (
            <FilterChip label={`Technology: ${technologyFilter.map(techLabel).join(', ')}`} onRemove={() => setTechnologyFilter([])} className="bg-violet-100 !text-violet-800 dark:bg-violet-900/30 dark:!text-violet-300" />
          )}
          {materialFilter.length > 0 && (
            <FilterChip label={`Material: ${materialFilter.join(', ')}`} onRemove={() => setMaterialFilter([])} className="bg-emerald-100 !text-emerald-800 dark:bg-emerald-900/30 dark:!text-emerald-300" />
          )}
        </div>
        )}

        {/* Toolbar */}
        <div className="!flex !flex-row !flex-nowrap gap-4 items-center sticky top-16 z-30 glass-card p-4 rounded-2xl" style={{ display: 'flex', flexWrap: 'nowrap' }}>
          <EnhancedSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            className="flex-1 min-w-0"
          />

          <div className="flex items-center gap-2 shrink-0">
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 whitespace-nowrap !text-base"
                  aria-label={`Sort by ${sortBy}`}
                >
                  <ArrowUp className="w-6 h-6" aria-hidden="true" />
                  <span className="hidden sm:inline">
                    Sort: <span className="font-semibold capitalize">{sortBy}</span>
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[224px]">
                <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => setSortBy(v as 'relevance' | 'duty' | 'ip')}>
                  <DropdownMenuRadioItem value="relevance" className="!text-lg py-2">Relevance</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="duty" className="!text-lg py-2">Duty Rating (Heavy First)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="ip" className="!text-lg py-2">IP Rating (High to Low)</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 whitespace-nowrap !text-base"
                  aria-label="More filters"
                >
                  <SlidersHorizontal className="w-6 h-6" aria-hidden="true" />
                  <span className="hidden sm:inline">More Filters</span>
                  {(dutyFilter.length > 0 || cordedFilter !== 'all' || materialFilter.length > 0 || technologyFilter.length > 0) && (
                    <span className="w-2 h-2 rounded-full bg-blue-500" aria-hidden="true" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                {availableTechnologies.length > 1 && (
                  <>
                    <DropdownMenuLabel className="!text-lg">Technology</DropdownMenuLabel>
                    {availableTechnologies.map(tech => (
                      <div key={tech} className="flex items-center px-2 py-2 hover:bg-accent cursor-pointer"
                        role="checkbox"
                        aria-checked={technologyFilter.includes(tech)}
                        aria-label={techLabel(tech)}
                        tabIndex={0}
                        onClick={makeToggleHandler(setTechnologyFilter, tech)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') makeToggleHandler(setTechnologyFilter, tech)(e); }}
                      >
                        <div className={`w-5 h-5 border rounded mr-2 flex items-center justify-center ${technologyFilter.includes(tech) ? 'bg-primary border-primary !text-white' : ''}`} aria-hidden="true">
                          {technologyFilter.includes(tech) && <Check className="w-4 h-4" />}
                        </div>
                        <span className="text-lg">{techLabel(tech)}</span>
                      </div>
                    ))}
                    <DropdownMenuSeparator />
                  </>
                )}

                {/* Labeled "Wiring" (not "Connection Type") to avoid clashing
                    with the wizard step of that name, which means terminals */}
                <DropdownMenuLabel className="!text-lg">Wiring</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={cordedFilter} onValueChange={(v) => setCordedFilter(v as 'all' | 'corded' | 'cordless')}>
                  <DropdownMenuRadioItem value="all" className="!text-lg py-2">All</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="corded" className="!text-lg py-2">Cord included (pre-wired)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="cordless" className="!text-lg py-2">You wire it (terminals)</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>

                <DropdownMenuSeparator />

                <DropdownMenuLabel className="!text-lg">Duty Rating</DropdownMenuLabel>
                {(['light', 'medium', 'heavy'] as const).map(duty => (
                  <div key={duty} className="flex items-center px-2 py-2 hover:bg-accent cursor-pointer"
                    role="checkbox"
                    aria-checked={dutyFilter.includes(duty)}
                    aria-label={`${duty} duty`}
                    tabIndex={0}
                    onClick={makeToggleHandler(setDutyFilter, duty)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') makeToggleHandler(setDutyFilter, duty)(e); }}
                  >
                    <div className={`w-5 h-5 border rounded mr-2 flex items-center justify-center ${dutyFilter.includes(duty) ? 'bg-primary border-primary !text-white' : ''}`} aria-hidden="true">
                      {dutyFilter.includes(duty) && <Check className="w-4 h-4" />}
                    </div>
                    <span className="capitalize text-lg">{duty}</span>
                  </div>
                ))}

                <DropdownMenuSeparator />

                <DropdownMenuLabel className="!text-lg">Material</DropdownMenuLabel>
                {availableMaterials.map(mat => (
                  <div key={mat} className="flex items-center px-2 py-2 hover:bg-accent cursor-pointer"
                    role="checkbox"
                    aria-checked={materialFilter.includes(mat)}
                    aria-label={mat}
                    tabIndex={0}
                    onClick={makeToggleHandler(setMaterialFilter, mat)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') makeToggleHandler(setMaterialFilter, mat)(e);
                    }}
                  >
                    <div className={`w-5 h-5 border rounded mr-2 flex items-center justify-center ${materialFilter.includes(mat) ? 'bg-primary border-primary !text-white' : ''}`} aria-hidden="true">
                      {materialFilter.includes(mat) && <Check className="w-4 h-4" />}
                    </div>
                    <span className="text-lg">{mat}</span>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Results — Perfect Matches + Close Matches */}
      {finalResults.length > 0 ? (
        <>
          {/* Custom cable / connector can't be matched from stock — always
              surface the quote path, not only when results are empty. */}
          {needsCustomSolution && (
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
              <div className="flex-1">
                <p className="!font-semibold !text-blue-900 dark:!text-blue-200">Custom cable or connector requested</p>
                <p className="text-sm !text-blue-800/80 dark:!text-blue-300/80">
                  These are built to order. The switches below are the closest stock bases — ask us to quote them with your custom cable or connector.
                </p>
              </div>
              <Button asChild className="gap-2 shrink-0">
                <a {...quoteLink}><Mail className="w-5 h-5" aria-hidden="true" /> Request a Quote</a>
              </Button>
            </div>
          )}
          {/* Perfect-match section: only show the explicit header when there
              are ALSO close matches below it; otherwise the heading is just
              noise above the only set of cards on the page. */}
          {finalPerfect.length > 0 && (
            <>
              {finalClose.length > 0 && (
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="!text-2xl !font-bold !text-foreground">Perfect Matches</h3>
                  <span className="!text-base !text-muted-foreground tabular-nums">({finalPerfect.length})</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {finalPerfect.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isComparing={compareIds.includes(product.id)}
                    onCompareToggle={handleCompareToggle}
                    onViewDetails={setDetailProduct}
                    priority={i < 4}
                    hideTopChoice={isBrowseAll}
                  />
                ))}
              </div>
            </>
          )}

          {/* Close-match section */}
          {finalClose.length > 0 && (
            <div className={finalPerfect.length > 0 ? 'mt-12' : ''}>
              <div className="flex flex-col gap-1 mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="!text-2xl !font-bold !text-foreground">Close Matches</h3>
                  <span className="!text-base !text-muted-foreground tabular-nums">({finalClose.length})</span>
                </div>
                {/* Large enough that "these aren't exact matches" can't be
                    missed when scanning straight from the section heading */}
                <p className="!text-xl !text-muted-foreground">
                  {finalPerfect.length > 0
                    ? 'These differ slightly from your preferences but might still fit.'
                    : 'No products match every preference exactly — here are the closest options.'}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {finalClose.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isComparing={compareIds.includes(product.id)}
                    onCompareToggle={handleCompareToggle}
                    onViewDetails={setDetailProduct}
                    priority={finalPerfect.length === 0 && i < 4}
                    differsOn={differsOnMap.get(product.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700" role="status">
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
            <Search className="w-10 h-10 !text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="max-w-md">
            {isBrowseAll ? (
              <>
                <h3 className="text-xl font-semibold mb-2">No products match your search</h3>
                <p className="!text-muted-foreground mb-6">
                  Try a different series name or part number, or clear your filters.
                </p>
                <Button variant="outline" onClick={clearOnPageFilters}>
                  Clear search &amp; filters
                </Button>
              </>
            ) : (
            <>
            <h3 className="text-xl font-semibold mb-2">No matching products</h3>
            {hasActiveFilters ? (
              <>
                {/* The search box / More Filters emptied the page — undoing
                    those is the fix, not relaxing the wizard answers. */}
                <p className="!text-muted-foreground mb-6">
                  Your search or filters removed every result.
                </p>
                <Button onClick={clearOnPageFilters} className="mb-6">Clear search &amp; filters</Button>
              </>
            ) : (
              <p className="!text-muted-foreground mb-6">
                Nothing in our stock catalog fits these answers. Adjust an answer above, or ask us about a custom switch.
              </p>
            )}

            {/* Custom Solution CTA */}
            {needsCustomSolution && (
              <GlassCard className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 mb-6 text-left">
                <h4 className="font-semibold !text-blue-800 dark:!text-blue-300 mb-1">Need a Custom Solution?</h4>
                <p className="text-sm !text-blue-600/80 dark:!text-blue-400/80 mb-3">
                  Your requirements for {wizardState.selectedFeatures.join(', ')} might require a custom build.
                </p>
                <Button asChild size="sm" className="w-full gap-2">
                  <a {...quoteLink}><Mail className="w-6 h-6" /> Contact Us</a>
                </Button>
              </GlassCard>
            )}

            {alternatives && !hasActiveFilters && alternatives.products.length > 0 && (
              <div className="space-y-4">
                <p className="text-sm !text-muted-foreground">
                  {alternatives.products.length} {alternatives.products.length === 1 ? 'product' : 'products'} available if you adjust your filters
                </p>
                <Button variant="outline" onClick={() => removeWizardFilter(alternatives.relaxed as FilterType)}>
                  {alternatives.relaxed === 'all'
                    ? `Remove all filters (${alternatives.products.length} results)`
                    : `Remove the ${RELAXED_FILTER_LABELS[alternatives.relaxed] ?? alternatives.relaxed} filter (${alternatives.products.length} results)`}
                </Button>
                <Button variant="link" onClick={onReset}>Start over</Button>
              </div>
            )}
            </>
            )}
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={detailProduct}
        open={detailProduct !== null}
        onClose={() => setDetailProduct(null)}
        hideTopChoice={isBrowseAll}
      />

      {/* Compare Slide-up Panel */}
      <CompareProducts
        products={compareProducts}
        open={compareOpen}
        onOpenChange={setCompareOpen}
        onRemove={(id) => setCompareIds(prev => prev.filter(x => x !== id))}
        onClear={() => { setCompareIds([]); setCompareOpen(false); }}
      />

      {/* Mobile Action Drawer */}
      {/* Sits above the Compare bar when it's showing, otherwise the bar
          (fixed to the bottom, z-50) covers the only Back/PDF/Reset access. */}
      <div className={`fixed right-6 md:hidden z-40 transition-[bottom] duration-300 ${compareProducts.length > 0 ? 'bottom-28' : 'bottom-6'}`}>
        <Button
          size="icon"
          className="h-12 w-12 rounded-full shadow-xl shadow-primary/25 bg-primary hover:bg-primary/90"
          onClick={() => setMobileDrawerOpen(true)}
          aria-label="Open actions menu"
        >
          <Menu className="w-7 h-7" aria-hidden="true" />
        </Button>
      </div>

      <Drawer open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Actions</DrawerTitle>
            <DrawerDescription>{finalResults.length} products found</DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-2 p-4 pb-8">
            <DrawerClose asChild>
              <Button variant="outline" className="w-full gap-2 justify-start" onClick={onBack}>
                <ArrowLeft className="w-6 h-6" /> Go Back
              </Button>
            </DrawerClose>
            <DrawerClose asChild>
              <Button asChild className="w-full gap-2 justify-start">
                <a {...quoteLink}><Mail className="w-6 h-6" /> Request a Quote</a>
              </Button>
            </DrawerClose>
            {!isBrowseAll && (
              <>
                <DrawerClose asChild>
                  <Button variant="outline" className="w-full gap-2 justify-start" onClick={handleCopyLink}>
                    <Link className="w-6 h-6" /> Copy Share Link
                  </Button>
                </DrawerClose>
                <DrawerClose asChild>
                  <Button variant="outline" className="w-full gap-2 justify-start" onClick={() => onGeneratePDF(pdfResults)}>
                    <Download className="w-6 h-6" /> Download PDF
                  </Button>
                </DrawerClose>
              </>
            )}
            <DrawerClose asChild>
              <Button variant="outline" className="w-full gap-2 justify-start !text-destructive" onClick={onReset}>
                <RefreshCw className="w-6 h-6" /> Reset Wizard
              </Button>
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
