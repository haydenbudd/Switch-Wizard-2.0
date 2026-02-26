import { useState, useEffect, useCallback, Suspense, lazy, useMemo } from 'react';
import { Router } from '@/app/components/Router';
import { Header } from '@/app/components/Header';
import { OrbBackground } from '@/app/components/OrbBackground';
import { useProductData } from '@/app/hooks/useProductData';
import { useWizardState } from '@/app/hooks/useWizardState';
import { trackWizardStep, trackNoResults } from '@/app/utils/analytics';
import { parseShareParams, updateUrlWithState, clearShareParams } from '@/app/utils/shareUrl';
import { Toaster } from 'sonner';
import { MedicalFlow } from '@/app/components/wizard/MedicalFlow';
import { StandardSteps } from '@/app/components/wizard/StandardSteps';
import { ResultsPage } from '@/app/components/wizard/ResultsPage';

// Lazy load admin panel with fallback for environments like Figma Make
// where the module may not be resolvable.
const AdminContainer = lazy(() =>
  import('@/app/components/admin/AdminContainer')
    .then(module => ({ default: module.AdminContainer }))
    .catch(() => ({ default: () => null }))
);

function matchesEnvironment(env: string, ip: string): boolean {
  if (env === 'open') return ip === 'IPXX';
  if (env === 'dry') return ['IPXX', 'IP20'].includes(ip);
  if (env === 'damp') return ['IP56', 'IP68'].includes(ip);
  if (env === 'wet') return ip === 'IP68';
  return true;
}

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
    materials,
    connections,
    circuitCounts,
    duties,
  } = useProductData();

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

    // Jump straight to results
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

  // Clear all selections downstream of the given step to prevent stale filter combos
  const clearDownstreamSelections = useCallback((fromStep: number) => {
    if (fromStep <= 1) { wizardState.setSelectedAction(''); }
    if (fromStep <= 2) { wizardState.setSelectedEnvironment(''); }
    if (fromStep <= 3) { wizardState.setSelectedDuty(''); }
    if (fromStep <= 4) { wizardState.setSelectedConnection(''); }
    if (fromStep <= 5) { wizardState.setSelectedCircuitCount(''); }
    if (fromStep <= 6) { wizardState.setSelectedGuard(''); }
    if (fromStep <= 7) { wizardState.setSelectedFeatures([]); }
  }, [wizardState.setSelectedAction, wizardState.setSelectedEnvironment, wizardState.setSelectedDuty, wizardState.setSelectedConnection, wizardState.setSelectedCircuitCount, wizardState.setSelectedGuard, wizardState.setSelectedFeatures]);

  const handleCategorySelect = useCallback((categoryId: string) => {
    const cat = (categories || []).find((c) => c.id === categoryId);
    wizardState.setSelectedCategory(categoryId);

    // Medical category auto-advances to medical flow
    if (cat?.isMedical) {
      wizardState.setSelectedApplication('medical');
      wizardState.setSelectedTechnology('');
      clearDownstreamSelections(0);
      wizardState.setFlow('medical');
      setTimeout(() => wizardState.setStep(1), 150);
      trackWizardStep(0, 'medical', { application: 'medical' });
    }
    // Other categories stay on step 0 phase 2 to show sub-applications
  }, [categories, clearDownstreamSelections, wizardState.setSelectedCategory, wizardState.setSelectedApplication, wizardState.setSelectedTechnology, wizardState.setFlow, wizardState.setStep]);

  const handleApplicationSelect = useCallback((id: string) => {
    wizardState.setSelectedApplication(id);
    wizardState.setSelectedTechnology('');
    clearDownstreamSelections(0);
    wizardState.setFlow('standard');
    setTimeout(() => wizardState.setStep(1), 150);
    trackWizardStep(0, 'standard', { application: id });
  }, [clearDownstreamSelections, wizardState.setSelectedApplication, wizardState.setSelectedTechnology, wizardState.setFlow, wizardState.setStep]);

  const handleBack = useCallback(() => {
    // Step 0 phase 2: go back to phase 1 (category selection)
    if (wizardState.step === 0 && wizardState.selectedCategory) {
      wizardState.setSelectedCategory('');
      wizardState.setSelectedApplication('');
      return;
    }
    if (wizardState.step === 0) return;
    if (wizardState.flow === 'medical' && wizardState.step === 1) {
      wizardState.setFlow('standard');
      wizardState.setStep(0);
      wizardState.setSelectedCategory('');
      wizardState.setSelectedApplication('');
    } else if (wizardState.step === 9 && wizardState.selectedApplication === 'medical') {
      // Back from results to medical flow environment step
      wizardState.setFlow('medical');
      wizardState.setStep(3);
    } else {
      let prevStep = wizardState.step - 1;
      // Skip Circuit Count step (index 6) for pneumatic/wireless technology
      if (prevStep === 6 && (wizardState.selectedTechnology === 'pneumatic' || wizardState.selectedTechnology === 'wireless')) {
        prevStep--;
      }
      // Skip Connection Type step (index 5) for pneumatic/wireless technology
      if (prevStep === 5 && (wizardState.selectedTechnology === 'pneumatic' || wizardState.selectedTechnology === 'wireless')) {
        prevStep--;
      }
      wizardState.setStep(prevStep);
    }
  }, [wizardState.step, wizardState.flow, wizardState.selectedCategory, wizardState.selectedApplication, wizardState.selectedTechnology, wizardState.setFlow, wizardState.setStep, wizardState.setSelectedCategory, wizardState.setSelectedApplication]);

  const handleContinue = useCallback(() => {
    let newStep = wizardState.step + 1;
    // Skip Connection Type step (index 5) for pneumatic/wireless technology
    if (newStep === 5 && (wizardState.selectedTechnology === 'pneumatic' || wizardState.selectedTechnology === 'wireless')) {
      newStep++;
    }
    // Skip Circuit Count step (index 6) for pneumatic/wireless technology
    if (newStep === 6 && (wizardState.selectedTechnology === 'pneumatic' || wizardState.selectedTechnology === 'wireless')) {
      newStep++;
    }
    wizardState.setStep(newStep);
    trackWizardStep(newStep, wizardState.flow, {
      application: wizardState.selectedApplication,
      technology: wizardState.selectedTechnology,
      action: wizardState.selectedAction,
      environment: wizardState.selectedEnvironment,
      features: wizardState.selectedFeatures,
    });
  }, [wizardState.step, wizardState.flow, wizardState.selectedTechnology, wizardState.selectedApplication, wizardState.selectedAction, wizardState.selectedEnvironment, wizardState.selectedFeatures, wizardState.setStep]);

  const handleViewMedicalProducts = useCallback(() => {
    wizardState.setSelectedTechnology('electrical');
    wizardState.setFlow('standard');
    wizardState.setStep(9);
    trackWizardStep(9, 'standard', {
      application: wizardState.selectedApplication,
      technology: 'electrical',
      action: wizardState.selectedAction,
      environment: wizardState.selectedEnvironment,
      source: 'medical_bypass'
    });
  }, [wizardState.selectedApplication, wizardState.selectedAction, wizardState.selectedEnvironment, wizardState.setSelectedTechnology, wizardState.setFlow, wizardState.setStep]);

  const filterProducts = useCallback((overrides: Partial<typeof wizardState> = {}) => {
    const state = { ...wizardState, ...overrides };

    return (products || []).filter((product) => {
      if (state.selectedApplication && !product.applications.includes(state.selectedApplication)) return false;
      if (state.selectedTechnology && product.technology !== state.selectedTechnology) return false;
      if (state.selectedAction && !product.actions.includes(state.selectedAction)) return false;
      if (!matchesEnvironment(state.selectedEnvironment, product.ip)) return false;
      if (state.selectedDuty && product.duty !== state.selectedDuty) return false;
      if (state.selectedTechnology !== 'pneumatic' && state.selectedConnection && product.connector_type !== state.selectedConnection) return false;
      if (state.selectedCircuitCount && state.selectedCircuitCount !== 'no_preference' && product.circuitry !== state.selectedCircuitCount) return false;
      if (state.selectedGuard === 'yes' && !(product.features || []).includes('shield')) return false;
      // "no" = no preference, don't exclude shielded products

      if (state.selectedFeatures.length > 0) {
        const hardwareFeatures = state.selectedFeatures.filter(
          f => f !== 'custom_cable' && f !== 'custom_connector'
        );
        if (hardwareFeatures.length > 0) {
          const productFeatures = product.features || [];
          const hasAllFeatures = hardwareFeatures.every(featureId => productFeatures.includes(featureId));
          if (!hasAllFeatures) return false;
        }
      }

      return true;
    });
  }, [products, wizardState]);

  const getProductCount = useCallback((step: number, optionId?: string) => {
    const safeProducts = products || [];
    if (step === 1) {
      return safeProducts.filter(p =>
        p.applications.includes(wizardState.selectedApplication) &&
        p.technology === optionId
      ).length;
    } else if (step === 2) {
      return safeProducts.filter(p =>
        p.applications.includes(wizardState.selectedApplication) &&
        p.technology === wizardState.selectedTechnology &&
        p.actions.includes(optionId || '')
      ).length;
    } else if (step === 3) {
      return safeProducts.filter(p => {
        if (!p.applications.includes(wizardState.selectedApplication)) return false;
        if (p.technology !== wizardState.selectedTechnology) return false;
        if (!p.actions.includes(wizardState.selectedAction)) return false;
        if (!matchesEnvironment(optionId || '', p.ip)) return false;
        return true;
      }).length;
    } else if (step === 4) {
      return safeProducts.filter(p => {
        if (!p.applications.includes(wizardState.selectedApplication)) return false;
        if (p.technology !== wizardState.selectedTechnology) return false;
        if (!p.actions.includes(wizardState.selectedAction)) return false;
        if (!matchesEnvironment(wizardState.selectedEnvironment, p.ip)) return false;
        return p.duty === optionId;
      }).length;
    } else if (step === 5) {
      return safeProducts.filter(p => {
        if (!p.applications.includes(wizardState.selectedApplication)) return false;
        if (p.technology !== wizardState.selectedTechnology) return false;
        if (!p.actions.includes(wizardState.selectedAction)) return false;
        if (!matchesEnvironment(wizardState.selectedEnvironment, p.ip)) return false;
        if (wizardState.selectedDuty && p.duty !== wizardState.selectedDuty) return false;
        return p.connector_type === optionId;
      }).length;
    } else if (step === 6) {
      // Circuit Count
      return safeProducts.filter(p => {
        if (!p.applications.includes(wizardState.selectedApplication)) return false;
        if (p.technology !== wizardState.selectedTechnology) return false;
        if (!p.actions.includes(wizardState.selectedAction)) return false;
        if (!matchesEnvironment(wizardState.selectedEnvironment, p.ip)) return false;
        if (wizardState.selectedDuty && p.duty !== wizardState.selectedDuty) return false;
        if (wizardState.selectedTechnology !== 'pneumatic' && wizardState.selectedConnection && p.connector_type !== wizardState.selectedConnection) return false;
        if (optionId === 'no_preference') return true;
        return p.circuitry === optionId;
      }).length;
    } else if (step === 7) {
      // Guard (was step 6)
      return safeProducts.filter(p => {
        if (!p.applications.includes(wizardState.selectedApplication)) return false;
        if (p.technology !== wizardState.selectedTechnology) return false;
        if (!p.actions.includes(wizardState.selectedAction)) return false;
        if (!matchesEnvironment(wizardState.selectedEnvironment, p.ip)) return false;
        if (wizardState.selectedDuty && p.duty !== wizardState.selectedDuty) return false;
        if (wizardState.selectedTechnology !== 'pneumatic' && wizardState.selectedConnection && p.connector_type !== wizardState.selectedConnection) return false;
        if (wizardState.selectedCircuitCount && wizardState.selectedCircuitCount !== 'no_preference' && p.circuitry !== wizardState.selectedCircuitCount) return false;
        const hasShield = (p.features || []).includes('shield');
        if (optionId === 'yes') return hasShield;
        // 'no' = no preference, show all products
        return true;
      }).length;
    }
    return 0;
  }, [products, wizardState.selectedApplication, wizardState.selectedTechnology, wizardState.selectedAction, wizardState.selectedEnvironment, wizardState.selectedDuty, wizardState.selectedConnection, wizardState.selectedCircuitCount]);

  const getAlternativeProducts = useCallback(() => {
    if (wizardState.selectedFeatures.length > 0) {
      const withoutFeatures = filterProducts({ selectedFeatures: [] });
      if (withoutFeatures.length > 0) return { products: withoutFeatures, relaxed: 'features' as const };
    }
    if (wizardState.selectedGuard) {
      const withoutGuard = filterProducts({ selectedFeatures: [], selectedGuard: '' });
      if (withoutGuard.length > 0) return { products: withoutGuard, relaxed: 'guard' as const };
    }
    if (wizardState.selectedDuty) {
      const withoutDuty = filterProducts({ selectedFeatures: [], selectedGuard: '', selectedDuty: '' });
      if (withoutDuty.length > 0) return { products: withoutDuty, relaxed: 'duty' as const };
    }
    if (wizardState.selectedEnvironment) {
      const withoutEnvironment = (products || []).filter((product) => {
        if (!product.applications.includes(wizardState.selectedApplication)) return false;
        if (product.technology !== wizardState.selectedTechnology) return false;
        if (!product.actions.includes(wizardState.selectedAction)) return false;
        return true;
      });
      if (withoutEnvironment.length > 0) return { products: withoutEnvironment, relaxed: 'environment' as const };
    }
    if (wizardState.selectedAction) {
      const withoutAction = (products || []).filter((product) => {
        if (!product.applications.includes(wizardState.selectedApplication)) return false;
        if (product.technology !== wizardState.selectedTechnology) return false;
        return true;
      });
      if (withoutAction.length > 0) return { products: withoutAction, relaxed: 'action' as const };
    }
    if (wizardState.selectedTechnology) {
      const withoutTechnology = (products || []).filter((product) => {
        if (!product.applications.includes(wizardState.selectedApplication)) return false;
        return true;
      });
      if (withoutTechnology.length > 0) return { products: withoutTechnology, relaxed: 'technology' as const };
    }
    const allForApplication = (products || []).filter((product) => product.applications.includes(wizardState.selectedApplication));
    return { products: allForApplication, relaxed: 'all' as const };
  }, [filterProducts, products, wizardState]);

  const needsCustomSolution = useMemo(() => {
    return wizardState.selectedFeatures.includes('custom_cable') ||
      wizardState.selectedFeatures.includes('custom_connector');
  }, [wizardState.selectedFeatures]);

  // Track no-results as a side effect (not inside useMemo)
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

  // Calculate total visible steps dynamically
  const totalSteps = useMemo(() => {
    if (wizardState.flow === 'medical') return 6;
    let steps = 9;
    // Pneumatic/wireless skip both Connection Type and Circuit Count steps
    if (wizardState.selectedTechnology === 'pneumatic' || wizardState.selectedTechnology === 'wireless') steps -= 2;
    return steps;
  }, [wizardState.flow, wizardState.selectedTechnology]);

  const skipsConnectionStep = wizardState.selectedTechnology === 'pneumatic' || wizardState.selectedTechnology === 'wireless';

  const getProgressStep = useCallback((rawStep: number) => {
    if (rawStep <= 0) return 0;
    let step = rawStep;
    // Pneumatic/wireless skip Connection Type (5) and Circuit Count (6)
    if (skipsConnectionStep && rawStep > 5) step--;
    if (skipsConnectionStep && rawStep > 6) step--;
    return step;
  }, [skipsConnectionStep]);

  const getDisplayStep = useCallback((rawStep: number) => getProgressStep(rawStep) + 1, [getProgressStep]);

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
      <Suspense fallback={<div>Loading...</div>}>
        <AdminContainer />
      </Suspense>
    );
  }
  return <WizardApp />;
}
