import { useState, useEffect, useRef, useCallback, Suspense, lazy, Component, type ReactNode, type ErrorInfo } from 'react';
import { Router } from '@/app/components/Router';
import { Header } from '@/app/components/Header';
import { OrbBackground } from '@/app/components/OrbBackground';
import { useProductData } from '@/app/hooks/useProductData';
import { useWizardState, takeSnapshot, type WizardSnapshot } from '@/app/hooks/useWizardState';
import { useWizardNavigation } from '@/app/hooks/useWizardNavigation';
import { useProductFiltering } from '@/app/hooks/useProductFiltering';
import { trackNoResults } from '@/app/utils/analytics';
import {
  parseShareParams, updateUrlWithState, clearShareParams,
  saveWizardStateToLocal, loadWizardStateFromLocal, clearWizardStateFromLocal,
} from '@/app/utils/shareUrl';
import { Toaster, toast } from 'sonner';
import { MedicalFlow } from '@/app/components/wizard/MedicalFlow';
import { StandardSteps } from '@/app/components/wizard/StandardSteps';
import { ResultsPage } from '@/app/components/wizard/ResultsPage';

// Lazy load admin panel with fallback for environments like Figma Make
const AdminContainer = lazy(() =>
  import('@/app/components/admin/AdminContainer')
    .then(module => ({ default: module.AdminContainer }))
    .catch((err) => {
      console.error('Failed to load AdminContainer:', err);
      return { default: () => <div style={{ padding: 40, textAlign: 'center' }}>Failed to load admin panel. Check console for details.</div> };
    })
);

function WizardApp() {
  const wizardState = useWizardState();

  const {
    products,
    categories,
    applications,
    technologies,
    actions,
    environments,
    features,
    consoleStyles,
    pedalCounts,
    medicalTechnicalFeatures,
    accessories,
    connections,
    circuitCounts,
    duties,
    error: dataError,
  } = useProductData();

  // Show toast when data fetch fails
  useEffect(() => {
    if (dataError) {
      toast.info('Using cached product data — live data unavailable', { id: 'data-error', duration: 5000 });
    }
  }, [dataError]);

  const {
    clearDownstreamSelections,
    handleCategorySelect,
    handleApplicationSelect,
    handleBack,
    handleContinue,
    handleViewMedicalProducts,
    totalSteps,
    getProgressStep,
    getDisplayStep,
  } = useWizardNavigation({ wizardState, categories });

  const {
    filterProducts,
    scoredProducts,
    getProductCount,
    getAlternativeProducts,
    needsCustomSolution,
  } = useProductFiltering({ wizardState, products });

  // Restore wizard state on mount.
  // Priority: share URL > localStorage > defaults.
  //   - Share URL always lands the user on the results page (it's the
  //     output of buildShareUrl, which is only invoked from results).
  //   - localStorage restores to the exact step the user last left off on.
  // State setters are stable (never change), so we capture them via ref to
  // avoid adding them as deps of this one-shot effect.
  const wizardSettersRef = useRef(wizardState);
  wizardSettersRef.current = wizardState;
  useEffect(() => {
    const s = wizardSettersRef.current;
    const shared = parseShareParams(window.location.search);
    if (shared) {
      // Share URLs always land on the results page
      s.applyPartial({ ...shared, step: 9 } as Partial<WizardSnapshot>);
      return;
    }

    // No share URL — try localStorage (resumes at the exact step)
    const persisted = loadWizardStateFromLocal();
    if (persisted) s.applyPartial(persisted);
  }, []);

  // Auto-save wizard state to localStorage whenever it meaningfully changes.
  // The serialized snapshot doubles as the change detector — the effect only
  // re-runs when a persisted field actually changed, and writes are skipped
  // while the wizard is pristine.
  const snapshot = takeSnapshot(wizardState);
  const snapshotJson = JSON.stringify(snapshot);
  useEffect(() => {
    const hasAnyInput =
      snapshot.step > 0 ||
      snapshot.selectedCategory ||
      snapshot.selectedApplication;
    if (!hasAnyInput) return;
    saveWizardStateToLocal(snapshot);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshotJson]);

  // Update URL bar when viewing results; clear our params when navigating
  // away. clearShareParams only touches the wizard's own query keys (and
  // no-ops when none are present), so this is safe for organic users and
  // preserves the host page's params (e.g. WordPress ?page_id=).
  useEffect(() => {
    if (wizardState.step === 9) {
      updateUrlWithState(wizardState);
    } else {
      clearShareParams();
    }
  }, [wizardState.step, wizardState.selectedApplication, wizardState.selectedTechnology,
      wizardState.selectedAction, wizardState.selectedEnvironment, wizardState.selectedDuty,
      wizardState.selectedConnection, wizardState.selectedCircuitCount, wizardState.selectedGuard,
      wizardState.selectedFeatures, wizardState.selectedMaterial, wizardState.flow]);

  // Enhanced search state for results page
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'duty' | 'ip'>('relevance');
  const [dutyFilter, setDutyFilter] = useState<string[]>([]);
  const [cordedFilter, setCordedFilter] = useState<'all' | 'corded' | 'cordless'>('all');
  const [materialFilter, setMaterialFilter] = useState<string[]>([]);

  const handleReset = useCallback(() => {
    wizardState.resetWizard();
    setSearchTerm('');
    setSortBy('relevance');
    setDutyFilter([]);
    setCordedFilter('all');
    setMaterialFilter([]);
    clearWizardStateFromLocal();
  }, [wizardState.resetWizard]);

  // Track no-results as a side effect
  useEffect(() => {
    if (wizardState.step === 9) {
      const filtered = filterProducts();
      if (filtered.length === 0) {
        trackNoResults({
          application: wizardState.selectedApplication,
          technology: wizardState.selectedTechnology,
          action: wizardState.selectedAction,
          environment: wizardState.selectedEnvironment,
          features: wizardState.selectedFeatures,
        });
      }
    }
  }, [filterProducts, wizardState.step]);

  const handleGeneratePDF = useCallback(async () => {
    try {
      const { generatePDF } = await import('@/app/utils/generatePDF');
      await generatePDF({
        wizardState,
        matchedProducts: filterProducts(),
        applications, technologies, actions, environments, features, duties,
        consoleStyles, pedalCounts, medicalTechnicalFeatures, accessories,
      });
    } catch (err) {
      console.error('PDF generation failed:', err);
      toast.error('PDF generation failed — please try again');
    }
  }, [wizardState, filterProducts, applications, technologies, actions, environments, features, duties, consoleStyles, pedalCounts, medicalTechnicalFeatures, accessories]);

  // Medical flow
  if (wizardState.flow === 'medical') {
    return (
      <MedicalFlow
        wizardState={wizardState}
        products={products}
        totalSteps={totalSteps}
        onBack={handleBack}
        onContinue={handleContinue}
        onViewStandardProducts={handleViewMedicalProducts}
        onGeneratePDF={handleGeneratePDF}
        onReset={handleReset}
      />
    );
  }

  // Standard flow
  return (
    <>
    <OrbBackground />
    <div className="min-h-screen relative z-10 grain-overlay">
      <a href="#wizard-main" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:text-sm focus:font-medium">
        Skip to content
      </a>
      <Header onReset={handleReset} />
      <main id="wizard-main">

      {wizardState.step >= 0 && wizardState.step <= 8 && (
        <StandardSteps
          wizardState={wizardState}
          categories={categories}
          applications={applications}
          technologies={technologies}
          actions={actions}
          environments={environments}
          features={features}
          duties={duties}
          connections={connections}
          circuitCounts={circuitCounts}
          totalSteps={totalSteps}
          getProgressStep={getProgressStep}
          getDisplayStep={getDisplayStep}
          getProductCount={getProductCount}
          clearDownstreamSelections={clearDownstreamSelections}
          onCategorySelect={handleCategorySelect}
          onApplicationSelect={handleApplicationSelect}
          onBack={handleBack}
          onContinue={handleContinue}
        />
      )}

      {wizardState.step === 9 && (
        <ResultsPage
          wizardState={wizardState}
          products={products}
          applications={applications}
          technologies={technologies}
          actions={actions}
          environments={environments}
          features={features}
          duties={duties}
          filterProducts={filterProducts}
          scoredProducts={scoredProducts}
          getAlternativeProducts={getAlternativeProducts}
          needsCustomSolution={needsCustomSolution}
          onBack={handleBack}
          onReset={handleReset}
          onGeneratePDF={handleGeneratePDF}
          clearDownstreamSelections={clearDownstreamSelections}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
          dutyFilter={dutyFilter}
          setDutyFilter={setDutyFilter}
          cordedFilter={cordedFilter}
          setCordedFilter={setCordedFilter}
          materialFilter={materialFilter}
          setMaterialFilter={setMaterialFilter}
        />
      )}
      </main>
    </div>
    <Toaster position="top-right" />
    </>
  );
}

export default function App() {
  return (
    <Router>
      {(path, navigate) => <AppShell path={path} navigate={navigate} />}
    </Router>
  );
}

class AdminErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Admin panel crashed:', error, info); }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#dc2626', marginBottom: 16 }}>Admin Panel Error</h2>
          <pre style={{ background: '#fee2e2', padding: 16, borderRadius: 8, textAlign: 'left', overflow: 'auto', maxWidth: 600, margin: '0 auto' }}>
            {this.state.error.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppShell({ path, navigate }: { path: string; navigate: (to: string) => void }) {
  const toggle = useCallback(() => {
    navigate(path.startsWith('/admin') ? '/' : '/admin');
  }, [path, navigate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle]);

  if (path.startsWith('/admin')) {
    return (
      <div key="admin">
        <AdminErrorBoundary>
          <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', fontFamily: 'sans-serif' }}>Loading admin panel...</div>}>
            <AdminContainer />
          </Suspense>
        </AdminErrorBoundary>
      </div>
    );
  }
  return <div key="wizard"><WizardApp /></div>;
}
