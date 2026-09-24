import { useCallback, useMemo } from 'react';
import { WizardState } from '@/app/hooks/useWizardState';
import { trackWizardStep } from '@/app/utils/analytics';

interface CategoryOption {
  id: string;
  isMedical?: boolean;
}

interface TechnologyOption {
  id: string;
  availableFor?: string[];
}

interface UseWizardNavigationOptions {
  wizardState: WizardState;
  categories: CategoryOption[];
  technologies: TechnologyOption[];
}

export function useWizardNavigation({ wizardState, categories, technologies }: UseWizardNavigationOptions) {
  // Technologies offered for an application. When there's only one (e.g.
  // Tattoo → Electrical) the Technology step is a single card, so it's
  // answered automatically and skipped.
  const onlyTechnologyFor = useCallback((appId: string): string | null => {
    const available = (technologies || []).filter(t => t.availableFor?.includes(appId));
    return available.length === 1 ? available[0].id : null;
  }, [technologies]);
  const skipsTechStep = onlyTechnologyFor(wizardState.selectedApplication) !== null;

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

    if (cat?.isMedical) {
      wizardState.setSelectedApplication('medical');
      wizardState.setSelectedTechnology('');
      clearDownstreamSelections(0);
      wizardState.setFlow('medical');
      wizardState.setStep(1);
      trackWizardStep(0, 'medical', { application: 'medical' });
    }
  }, [categories, clearDownstreamSelections, wizardState.setSelectedCategory, wizardState.setSelectedApplication, wizardState.setSelectedTechnology, wizardState.setFlow, wizardState.setStep]);

  const handleApplicationSelect = useCallback((id: string) => {
    // Re-picking the same industry (e.g. after jumping back via the
    // breadcrumb to check it) must not wipe every later answer.
    if (id === wizardState.selectedApplication && wizardState.flow === 'standard') {
      const target = wizardState.resumeStep ?? (onlyTechnologyFor(id) ? 2 : 1);
      wizardState.setResumeStep(null);
      wizardState.setStep(target);
      return;
    }
    wizardState.setResumeStep(null);
    wizardState.setSelectedApplication(id);
    clearDownstreamSelections(0);
    wizardState.setFlow('standard');
    const onlyTech = onlyTechnologyFor(id);
    wizardState.setSelectedTechnology(onlyTech ?? '');
    wizardState.setStep(onlyTech ? 2 : 1);
    trackWizardStep(0, 'standard', { application: id });
  }, [clearDownstreamSelections, onlyTechnologyFor, wizardState.selectedApplication, wizardState.flow, wizardState.resumeStep, wizardState.setResumeStep, wizardState.setSelectedApplication, wizardState.setSelectedTechnology, wizardState.setFlow, wizardState.setStep]);

  // Skip the questions entirely: land on the results page with no wizard
  // answers, which scores every product as a match (see scoreAndSplit) —
  // i.e. the full catalog with search, More Filters, and Compare.
  const handleBrowseAll = useCallback(() => {
    wizardState.resetWizard();
    wizardState.setStep(9);
    trackWizardStep(9, 'standard', { source: 'browse_all' });
  }, [wizardState.resetWizard, wizardState.setStep]);

  const handleBack = useCallback(() => {
    // Browse-all mode (no application chosen) has no wizard steps behind it
    if (wizardState.step === 9 && wizardState.flow === 'standard' && !wizardState.selectedApplication) {
      wizardState.setStep(0);
      wizardState.setSelectedCategory('');
      return;
    }
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
      wizardState.setFlow('medical');
      wizardState.setStep(3);
    } else if (wizardState.flow === 'medical' && wizardState.selectedMedicalPath === 'custom') {
      let prevStep = wizardState.step - 1;
      if (prevStep === 8 && wizardState.selectedChannel === 'crescent') {
        prevStep--;
      }
      wizardState.setStep(prevStep);
    } else {
      let prevStep = wizardState.step - 1;
      if (prevStep === 6 && (wizardState.selectedTechnology === 'pneumatic' || wizardState.selectedTechnology === 'wireless')) {
        prevStep--;
      }
      if (prevStep === 5 && (wizardState.selectedTechnology === 'pneumatic' || wizardState.selectedTechnology === 'wireless')) {
        prevStep--;
      }
      if (prevStep === 1 && skipsTechStep) prevStep = 0;
      wizardState.setStep(prevStep);
    }
  }, [wizardState.step, wizardState.flow, wizardState.selectedCategory, wizardState.selectedApplication, wizardState.selectedTechnology, wizardState.selectedMedicalPath, wizardState.selectedChannel, skipsTechStep, wizardState.setFlow, wizardState.setStep, wizardState.setSelectedCategory, wizardState.setSelectedApplication]);

  const handleContinue = useCallback(() => {
    let newStep = wizardState.step + 1;

    if (wizardState.flow === 'medical' && wizardState.selectedMedicalPath === 'custom') {
      if (newStep === 8 && wizardState.selectedChannel === 'crescent') {
        newStep++;
      }
    } else {
      if (newStep === 5 && (wizardState.selectedTechnology === 'pneumatic' || wizardState.selectedTechnology === 'wireless')) {
        newStep++;
      }
      if (newStep === 6 && (wizardState.selectedTechnology === 'pneumatic' || wizardState.selectedTechnology === 'wireless')) {
        newStep++;
      }
    }

    wizardState.setStep(newStep);
    trackWizardStep(newStep, wizardState.flow, {
      application: wizardState.selectedApplication,
      technology: wizardState.selectedTechnology,
      action: wizardState.selectedAction,
      environment: wizardState.selectedEnvironment,
      features: wizardState.selectedFeatures,
    });
  }, [wizardState.step, wizardState.flow, wizardState.selectedTechnology, wizardState.selectedMedicalPath, wizardState.selectedChannel, wizardState.selectedApplication, wizardState.selectedAction, wizardState.selectedEnvironment, wizardState.selectedFeatures, wizardState.setStep]);

  // Advance from a step whose answer is unchanged: return to where the user
  // was before they jumped back to edit, otherwise just go to the next step.
  const handleResumeOrContinue = useCallback(() => {
    if (wizardState.resumeStep !== null) {
      const target = wizardState.resumeStep;
      wizardState.setResumeStep(null);
      wizardState.setStep(target);
      return;
    }
    handleContinue();
  }, [wizardState.resumeStep, wizardState.setResumeStep, wizardState.setStep, handleContinue]);

  // Breadcrumb / results-page "edit this answer" jump. Remembers where the
  // user came from so an unchanged answer takes them straight back.
  const jumpToStep = useCallback((target: number) => {
    // Medical stock results live on the standard results page but their
    // questions live in the medical flow — route edits there instead of
    // into standard steps the buyer never saw.
    if (wizardState.selectedApplication === 'medical') {
      wizardState.setResumeStep(null);
      if (target <= 1) {
        wizardState.setFlow('standard');
        wizardState.setStep(0);
        wizardState.setSelectedCategory('');
        wizardState.setSelectedApplication('');
      } else {
        wizardState.setFlow('medical');
        wizardState.setStep(target >= 3 ? 3 : 2);
      }
      return;
    }
    if (target < wizardState.step) wizardState.setResumeStep(wizardState.step);
    wizardState.setStep(target);
  }, [wizardState.selectedApplication, wizardState.step, wizardState.setResumeStep, wizardState.setFlow, wizardState.setStep, wizardState.setSelectedCategory, wizardState.setSelectedApplication]);

  const handleViewMedicalProducts = useCallback(() => {
    // No technology filter: wired and wireless medical switches both qualify
    wizardState.setSelectedTechnology('');
    wizardState.setStep(9);
    wizardState.setFlow('standard');
    trackWizardStep(9, 'standard', {
      application: wizardState.selectedApplication,
      action: wizardState.selectedAction,
      environment: wizardState.selectedEnvironment,
      source: 'medical_bypass'
    });
  }, [wizardState.selectedApplication, wizardState.selectedAction, wizardState.selectedEnvironment, wizardState.setSelectedTechnology, wizardState.setFlow, wizardState.setStep]);

  const totalSteps = useMemo(() => {
    if (wizardState.flow === 'medical') {
      if (wizardState.selectedMedicalPath === 'custom') {
        return wizardState.selectedChannel === 'crescent' ? 10 : 11;
      }
      return 6;
    }
    let steps = 9;
    if (wizardState.selectedTechnology === 'pneumatic' || wizardState.selectedTechnology === 'wireless') steps -= 2;
    if (skipsTechStep) steps -= 1;
    return steps;
  }, [wizardState.flow, wizardState.selectedTechnology, wizardState.selectedMedicalPath, wizardState.selectedChannel, skipsTechStep]);

  const skipsConnectionStep = wizardState.selectedTechnology === 'pneumatic' || wizardState.selectedTechnology === 'wireless';

  const getProgressStep = useCallback((rawStep: number) => {
    if (rawStep <= 0) return 0;
    let step = rawStep;
    if (skipsTechStep && rawStep > 1) step--;
    if (skipsConnectionStep && rawStep > 5) step--;
    if (skipsConnectionStep && rawStep > 6) step--;
    return step;
  }, [skipsConnectionStep, skipsTechStep]);

  const getDisplayStep = useCallback((rawStep: number) => getProgressStep(rawStep) + 1, [getProgressStep]);

  return {
    clearDownstreamSelections,
    handleCategorySelect,
    handleApplicationSelect,
    handleBrowseAll,
    handleBack,
    handleContinue,
    handleResumeOrContinue,
    jumpToStep,
    handleViewMedicalProducts,
    totalSteps,
    getProgressStep,
    getDisplayStep,
  };
}
