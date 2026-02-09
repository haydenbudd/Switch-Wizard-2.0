import { GlassCard } from '@/app/components/GlassCard';
import { ProductCard } from '@/app/components/ProductCard';
import { Button } from '@/app/components/ui/button';
import { Product, Option } from '@/app/lib/api';
import { WizardState } from '@/app/hooks/useWizardState';
import { RefreshCw, Download, ArrowLeft, SlidersHorizontal, ArrowUp, Check, Search } from 'lucide-react';
import { EnhancedSearch } from '@/app/components/EnhancedSearch';
import { FilterChip } from '@/app/components/FilterChip';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuRadioGroup, 
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/app/components/ui/dropdown-menu';
import { useState, useMemo } from 'react';

interface ResultsPageProps {
  wizardState: WizardState;
  products: Product[];
  applications: Option[];
  technologies: Option[];
  actions: Option[];
  environments: Option[];
  features: Option[];
  duties: Option[];
  filterProducts: (overrides?: Partial<WizardState>) => Product[];
  getAlternativeProducts: () => { products: Product[]; relaxed: string };
  needsCustomSolution: boolean;
  onBack: () => void;
  onReset: () => void;
  onGeneratePDF: () => void;
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
}

export function ResultsPage({
  wizardState,
  products, // All products, used for counting
  applications,
  technologies,
  actions,
  environments,
  features,
  duties,
  filterProducts,
  getAlternativeProducts,
  needsCustomSolution,
  onBack,
  onReset,
  onGeneratePDF,
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
  setMaterialFilter
}: ResultsPageProps) {
  
  // Primary filtered list based on wizard state
  const wizardMatches = filterProducts();

  // Derive available materials from wizard-filtered products
  const availableMaterials = useMemo(() => {
    const mats = new Set(wizardMatches.map(p => p.material).filter(Boolean));
    return Array.from(mats).sort();
  }, [wizardMatches]);

  // Secondary filtering based on Results Page controls (search, sort, etc)
  const finalResults = useMemo(() => {
    let result = [...wizardMatches];

    // Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.series.toLowerCase().includes(lower) || 
        p.description.toLowerCase().includes(lower) ||
        p.part_number?.toLowerCase().includes(lower)
      );
    }

    // Duty Filter
    if (dutyFilter.length > 0) {
      result = result.filter(p => dutyFilter.includes(p.duty));
    }

    // Corded Filter
    if (cordedFilter !== 'all') {
      result = result.filter(p => {
        if (!p.connector_type) return false;
        const isPrewired = p.connector_type.includes('pre-wired') || p.connector_type.includes('plug');
        return cordedFilter === 'corded' ? isPrewired : !isPrewired;
      });
    }

    // Material Filter
    if (materialFilter.length > 0) {
      result = result.filter(p => materialFilter.includes(p.material));
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'duty') {
        const dutyOrder = { heavy: 3, medium: 2, light: 1 };
        return (dutyOrder[b.duty as keyof typeof dutyOrder] || 0) - (dutyOrder[a.duty as keyof typeof dutyOrder] || 0);
      }
      if (sortBy === 'ip') {
        const getIpVal = (ip: string) => {
          if (ip.toUpperCase().includes('X')) return 80; // IPX8 = high water protection
          return parseInt(ip.replace(/\D/g, '') || '0');
        };
        return getIpVal(b.ip) - getIpVal(a.ip);
      }
      return 0; // Relevance is default order
    });

    return result;
  }, [wizardMatches, searchTerm, dutyFilter, cordedFilter, materialFilter, sortBy]);

  // Alternatives if no results
  const alternatives = useMemo(() => {
    if (finalResults.length === 0) {
      return getAlternativeProducts();
    }
    return null;
  }, [finalResults.length, getAlternativeProducts]);

  // Handler for clearing specific wizard filters
  const removeWizardFilter = (type: 'application' | 'technology' | 'action' | 'environment' | 'duty' | 'material' | 'feature', value?: string) => {
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
        if (value) {
          wizardState.setSelectedFeatures(prev => prev.filter(f => f !== value));
        }
        break;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-32">
      {/* Header & Controls */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Recommended Products</h2>
            <p className="text-muted-foreground mt-1">
              {finalResults.length} matches found based on your criteria
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onGeneratePDF} className="gap-2">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            <Button variant="ghost" onClick={onReset} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </div>

        {/* Active Filters Display */}
        <div className="flex flex-wrap gap-2 items-center bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-border/50">
          <span className="text-sm font-medium text-muted-foreground mr-2">Filters:</span>
          
          {wizardState.selectedApplication && (
            <FilterChip 
              label={applications.find(a => a.id === wizardState.selectedApplication)?.label || wizardState.selectedApplication} 
              onRemove={() => removeWizardFilter('application')}
            />
          )}
          {wizardState.selectedTechnology && (
            <FilterChip 
              label={technologies.find(t => t.id === wizardState.selectedTechnology)?.label || wizardState.selectedTechnology} 
              onRemove={() => removeWizardFilter('technology')}
            />
          )}
          {wizardState.selectedAction && (
            <FilterChip 
              label={actions.find(a => a.id === wizardState.selectedAction)?.label || wizardState.selectedAction} 
              onRemove={() => removeWizardFilter('action')}
            />
          )}
          {wizardState.selectedEnvironment && wizardState.selectedEnvironment !== 'any' && (
            <FilterChip 
              label={environments.find(e => e.id === wizardState.selectedEnvironment)?.label || wizardState.selectedEnvironment} 
              onRemove={() => removeWizardFilter('environment')}
            />
          )}
          
          {/* Add chips for result-page specific filters */}
          {searchTerm && (
            <FilterChip label={`Search: "${searchTerm}"`} onRemove={() => setSearchTerm('')} className="bg-blue-100 text-blue-800" />
          )}
          
          {dutyFilter.length > 0 && (
            <FilterChip label={`Duty: ${dutyFilter.join(', ')}`} onRemove={() => setDutyFilter([])} className="bg-orange-100 text-orange-800" />
          )}

          {materialFilter.length > 0 && (
            <FilterChip label={`Material: ${materialFilter.join(', ')}`} onRemove={() => setMaterialFilter([])} className="bg-emerald-100 text-emerald-800" />
          )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-20 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-lg p-4 rounded-xl border shadow-sm">
          <EnhancedSearch 
            searchTerm={searchTerm} 
            onSearchChange={setSearchTerm}
            className="w-full md:w-96"
          />
          
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 whitespace-nowrap">
                  <ArrowUp className="w-4 h-4" />
                  Sort: <span className="font-semibold capitalize">{sortBy}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                  <DropdownMenuRadioItem value="relevance">Relevance</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="duty">Duty Rating (Heavy First)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="ip">IP Rating (High to Low)</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 whitespace-nowrap">
                  <SlidersHorizontal className="w-4 h-4" />
                  More Filters
                  {(dutyFilter.length > 0 || cordedFilter !== 'all' || materialFilter.length > 0) && (
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Connection Type</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={cordedFilter} onValueChange={(v) => setCordedFilter(v as any)}>
                  <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="corded">Pre-wired / Plug</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="cordless">Terminals (User wired)</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuLabel>Duty Rating</DropdownMenuLabel>
                {/* Simplified Multi-select via standard items for now */}
                {['heavy', 'medium', 'light'].map(duty => (
                  <div key={duty} className="flex items-center px-2 py-1.5 hover:bg-accent cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      setDutyFilter(prev => prev.includes(duty) ? prev.filter(d => d !== duty) : [...prev, duty]);
                    }}
                  >
                    <div className={`w-4 h-4 border rounded mr-2 flex items-center justify-center ${dutyFilter.includes(duty) ? 'bg-primary border-primary text-white' : ''}`}>
                      {dutyFilter.includes(duty) && <Check className="w-3 h-3" />}
                    </div>
                    <span className="capitalize text-sm">{duty}</span>
                  </div>
                ))}

                <DropdownMenuSeparator />

                <DropdownMenuLabel>Material</DropdownMenuLabel>
                {availableMaterials.map(mat => (
                  <div key={mat} className="flex items-center px-2 py-1.5 hover:bg-accent cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      setMaterialFilter(prev => prev.includes(mat) ? prev.filter(m => m !== mat) : [...prev, mat]);
                    }}
                  >
                    <div className={`w-4 h-4 border rounded mr-2 flex items-center justify-center ${materialFilter.includes(mat) ? 'bg-primary border-primary text-white' : ''}`}>
                      {materialFilter.includes(mat) && <Check className="w-3 h-3" />}
                    </div>
                    <span className="text-sm">{mat}</span>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {finalResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {finalResults.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              highlight={product.flagship} 
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <div className="max-w-md">
            <h3 className="text-xl font-semibold mb-2">No exact matches found</h3>
            <p className="text-muted-foreground mb-6">
              We couldn't find any products matching all your criteria. Try removing some filters or viewing our full catalog.
            </p>
            
            {/* Custom Solution CTA */}
            {needsCustomSolution && (
              <GlassCard className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 mb-6 text-left">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Need a Custom Solution?</h4>
                <p className="text-sm text-blue-600/80 dark:text-blue-400/80 mb-3">
                  Your requirements for {wizardState.selectedFeatures.join(', ')} might require a custom build.
                </p>
                <Button size="sm" className="w-full">Contact Engineering</Button>
              </GlassCard>
            )}

            {alternatives && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {alternatives.products.length} {alternatives.products.length === 1 ? 'product' : 'products'} available if you adjust your filters
                </p>
                <Button variant="outline" onClick={() => removeWizardFilter(alternatives.relaxed as any)}>
                  Remove {alternatives.relaxed === 'all' ? 'all filters' : `"${alternatives.relaxed}" filter`} ({alternatives.products.length} results)
                </Button>
                <Button variant="link" onClick={onReset}>Start over</Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden z-40">
        <Button size="icon" className="h-12 w-12 rounded-full shadow-xl bg-blue-600 hover:bg-blue-700" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
