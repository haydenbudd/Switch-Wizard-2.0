import { useState, useEffect, useCallback, Suspense, lazy, Component, type ReactNode, type ErrorInfo } from 'react';
import { Router } from '@/app/components/Router';
import { Header } from '@/app/components/Header';
import { OrbBackground } from '@/app/components/OrbBackground';
import { useProductData } from '@/app/hooks/useProductData';
import { useWizardState } from '@/app/hooks/useWizardState';
import { useWizardNavigation } from '@/app/hooks/useWizardNavigation';
import { useProductFiltering } from '@/app/hooks/useProductFiltering';
import { trackNoResults } from '@/app/utils/analytics';
import { parseShareParams, updateUrlWithState, clearShareParams } from '@/app/utils/shareUrl';
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
    getProductCount,
    getAlternativeProducts,
    needsCustomSolution,
  } = useProductFiltering({ wizardState, products });

  // Restore wizard state from URL share params on mount
  const [shareRestored, setShareRestored] = useState(false);
  useEffect(() => {
    const shared = parseShareParams(window.location.search);
    if (!shared) return;

    if (shared.selectedApplication) wizardState.setSelectedApplication(shared.selectedApplication);
    if (shared.selectedTechnology) wizardState.setSelectedTechnology(shared.selectedTechnology);
    if (shared.selectedAction) wizardState.setSelectedAction(shared.selectedAction);
    if (shared.selectedEnvironment) wizardState.setSelectedEnvironment(shared.selectedEnvironment);
    if (shared.selectedDuty) wizardState.setSelectedDuty(shared.selectedDuty);
    if (shared.selectedMaterial) wizardState.setSelectedMaterial(shared.selectedMaterial);
    if (shared.selectedConnection) wizardState.setSelectedConnection(shared.selectedConnection);
    if (shared.selectedCircuitCount) wizardState.setSelectedCircuitCount(shared.selectedCircuitCount);
    if (shared.selectedGuard) wizardState.setSelectedGuard(shared.selectedGuard);
    if (shared.selectedFeatures) wizardState.setSelectedFeatures(shared.selectedFeatures);
    if (shared.flow) wizardState.setFlow(shared.flow as 'standard' | 'medical');

    wizardState.setStep(9);
    setShareRestored(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update URL bar when viewing results; clear when navigating away
  useEffect(() => {
    if (wizardState.step === 9) {
      updateUrlWithState(wizardState);
    } else if (shareRestored) {
      clearShareParams();
    }
  }, [wizardState.step, wizardState.selectedApplication, wizardState.selectedTechnology,
      wizardState.selectedAction, wizardState.selectedEnvironment, wizardState.selectedDuty,
      wizardState.selectedConnection, wizardState.selectedCircuitCount, wizardState.selectedGuard,
      wizardState.selectedFeatures, wizardState.selectedMaterial, wizardState.flow, shareRestored]);

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
    const { generatePDF } = await import('@/app/utils/generatePDF');
    await generatePDF({
      wizardState,
      matchedProducts: filterProducts(),
      applications, technologies, actions, environments, features, duties,
      consoleStyles, pedalCounts, medicalTechnicalFeatures, accessories,
    });
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
      <AdminErrorBoundary>
        <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', fontFamily: 'sans-serif' }}>Loading admin panel...</div>}>
          <AdminContainer />
        </Suspense>
      </AdminErrorBoundary>
    );
  }
  return <WizardApp />;
}
