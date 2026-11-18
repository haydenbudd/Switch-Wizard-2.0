import { useCallback, useMemo } from 'react';
import { WizardState } from '@/app/hooks/useWizardState';
import { trackWizardStep } from '@/app/utils/analytics';
import {
  STEP,
  MEDICAL_STEP,
  getSequenceKey,
  nextStep,
  prevStep,
  stepPosition,
  type StepContext,
} from '@/app/utils/wizardSteps';

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

  // The answers the step order's skip rules read (see utils/wizardSteps)
  const stepContext = useMemo<StepContext>(() => ({
    technology: wizardState.selectedTechnology,
    channel: wizardState.selectedChannel,
    technologyAutoAnswered: skipsTechStep,
  }), [wizardState.selectedTechnology, wizardState.selectedChannel, skipsTechStep]);
  const sequenceKey = getSequenceKey(wizardState.flow, wizardState.selectedMedicalPath);

  const clearDownstreamSelections = useCallback((fromStep: number) => {
    // Clears the answers of every step after `fromStep`
    if (fromStep < STEP.ACTION) { wizardState.setSelectedAction(''); }
    if (fromStep < STEP.ENVIRONMENT) { wizardState.setSelectedEnvironment(''); }
    if (fromStep < STEP.DUTY) { wizardState.setSelectedDuty(''); }
    if (fromStep < STEP.CONNECTION) { wizardState.setSelectedConnection(''); }
    if (fromStep < STEP.CIRCUITS) { wizardState.setSelectedCircuitCount(''); }
    if (fromStep < STEP.GUARD) { wizardState.setSelectedGuard(''); }
    if (fromStep < STEP.FEATURES) { wizardState.setSelectedFeatures([]); }
  }, [wizardState.setSelectedAction, wizardState.setSelectedEnvironment, wizardState.setSelectedDuty, wizardState.setSelectedConnection, wizardState.setSelectedCircuitCount, wizardState.setSelectedGuard, wizardState.setSelectedFeatures]);

  const handleCategorySelect = useCallback((categoryId: string) => {
    const cat = (categories || []).find((c) => c.id === categoryId);
    wizardState.setSelectedCategory(categoryId);

    if (cat?.isMedical) {
      wizardState.setSelectedApplication('medical');
      wizardState.setSelectedTechnology('');
      clearDownstreamSelections(0);
      wizardState.setFlow('medical');
      wizardState.setStep(MEDICAL_STEP.FORK);
      trackWizardStep(STEP.APPLICATION, 'medical', { application: 'medical' });
    }
  }, [categories, clearDownstreamSelections, wizardState.setSelectedCategory, wizardState.setSelectedApplication, wizardState.setSelectedTechnology, wizardState.setFlow, wizardState.setStep]);

  // First question after picking an industry: Technology, unless the
  // industry offers only one technology and it's answered automatically.
  const firstStepAfterApplication = useCallback((appId: string) => nextStep('standard', STEP.APPLICATION, {
    ...stepContext,
    technologyAutoAnswered: onlyTechnologyFor(appId) !== null,
  }), [stepContext, onlyTechnologyFor]);

  const handleApplicationSelect = useCallback((id: string) => {
    // Re-picking the same industry (e.g. after jumping back via the
    // breadcrumb to check it) must not wipe every later answer.
    if (id === wizardState.selectedApplication && wizardState.flow === 'standard') {
      const target = wizardState.resumeStep ?? firstStepAfterApplication(id);
      wizardState.setResumeStep(null);
      wizardState.setStep(target);
      return;
    }
    // Changing the application from the answers row: keep the later answers
    // and return to where the user was — unless their technology isn't
    // offered for the new application, in which case ask that next.
    if (wizardState.resumeStep !== null && wizardState.flow === 'standard' && wizardState.selectedApplication) {
      wizardState.setSelectedApplication(id);
      const onlyTech = onlyTechnologyFor(id);
      const techStillValid = (technologies || []).some(
        t => t.id === wizardState.selectedTechnology && t.availableFor?.includes(id)
      );
      if (onlyTech) wizardState.setSelectedTechnology(onlyTech);
      if (onlyTech || techStillValid) {
        const target = wizardState.resumeStep;
        wizardState.setResumeStep(null);
        wizardState.setStep(target);
      } else {
        wizardState.setSelectedTechnology('');
        wizardState.setStep(STEP.TECHNOLOGY);
      }
      trackWizardStep(STEP.APPLICATION, 'standard', { application: id, source: 'edit' });
      return;
    }
    wizardState.setResumeStep(null);
    wizardState.setSelectedApplication(id);
    clearDownstreamSelections(0);
    wizardState.setFlow('standard');
    const onlyTech = onlyTechnologyFor(id);
    wizardState.setSelectedTechnology(onlyTech ?? '');
    wizardState.setStep(firstStepAfterApplication(id));
    trackWizardStep(STEP.APPLICATION, 'standard', { application: id });
  }, [clearDownstreamSelections, onlyTechnologyFor, firstStepAfterApplication, technologies, wizardState.selectedTechnology, wizardState.selectedApplication, wizardState.flow, wizardState.resumeStep, wizardState.setResumeStep, wizardState.setSelectedApplication, wizardState.setSelectedTechnology, wizardState.setFlow, wizardState.setStep]);

  // Skip the questions entirely: land on the results page with no wizard
  // answers, which scores every product as a match (see scoreAndSplit) —
  // i.e. the full catalog with search, More Filters, and Compare.
  const handleBrowseAll = useCallback(() => {
    wizardState.resetWizard();
    wizardState.setStep(STEP.RESULTS);
    trackWizardStep(STEP.RESULTS, 'standard', { source: 'browse_all' });
  }, [wizardState.resetWizard, wizardState.setStep]);

  const handleBack = useCallback(() => {
    // Browse-all mode (no application chosen) has no wizard steps behind it
    if (wizardState.step === STEP.RESULTS && wizardState.flow === 'standard' && !wizardState.selectedApplication) {
      wizardState.setStep(STEP.APPLICATION);
      wizardState.setSelectedCategory('');
      return;
    }
    if (wizardState.step === STEP.APPLICATION && wizardState.selectedCategory) {
      wizardState.setSelectedCategory('');
      wizardState.setSelectedApplication('');
      return;
    }
    if (wizardState.step === STEP.APPLICATION) return;
    if (wizardState.flow === 'medical' && wizardState.step === MEDICAL_STEP.FORK) {
      // Medical fork → back to the industry picker
      wizardState.setFlow('standard');
      wizardState.setStep(STEP.APPLICATION);
      wizardState.setSelectedCategory('');
      wizardState.setSelectedApplication('');
    } else if (wizardState.step === STEP.RESULTS && wizardState.selectedApplication === 'medical') {
      // Medical stock results → back to the medical Environment question
      wizardState.setFlow('medical');
      wizardState.setStep(MEDICAL_STEP.ENVIRONMENT);
    } else {
      wizardState.setStep(prevStep(sequenceKey, wizardState.step, stepContext));
    }
  }, [wizardState.step, wizardState.flow, wizardState.selectedCategory, wizardState.selectedApplication, sequenceKey, stepContext, wizardState.setFlow, wizardState.setStep, wizardState.setSelectedCategory, wizardState.setSelectedApplication]);

  const handleContinue = useCallback(() => {
    const newStep = nextStep(sequenceKey, wizardState.step, stepContext);
    wizardState.setStep(newStep);
    trackWizardStep(newStep, wizardState.flow, {
      application: wizardState.selectedApplication,
      technology: wizardState.selectedTechnology,
      action: wizardState.selectedAction,
      environment: wizardState.selectedEnvironment,
      features: wizardState.selectedFeatures,
    });
  }, [wizardState.step, wizardState.flow, sequenceKey, stepContext, wizardState.selectedTechnology, wizardState.selectedApplication, wizardState.selectedAction, wizardState.selectedEnvironment, wizardState.selectedFeatures, wizardState.setStep]);

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
      if (target <= STEP.TECHNOLOGY) {
        wizardState.setFlow('standard');
        wizardState.setStep(STEP.APPLICATION);
        wizardState.setSelectedCategory('');
        wizardState.setSelectedApplication('');
      } else {
        wizardState.setFlow('medical');
        wizardState.setStep(target >= STEP.ENVIRONMENT ? MEDICAL_STEP.ENVIRONMENT : MEDICAL_STEP.ACTION);
      }
      return;
    }
    if (target < wizardState.step) wizardState.setResumeStep(wizardState.step);
    wizardState.setStep(target);
  }, [wizardState.selectedApplication, wizardState.step, wizardState.setResumeStep, wizardState.setFlow, wizardState.setStep, wizardState.setSelectedCategory, wizardState.setSelectedApplication]);

  const handleViewMedicalProducts = useCallback(() => {
    // No technology filter: wired and wireless medical switches both qualify
    wizardState.setSelectedTechnology('');
    wizardState.setStep(STEP.RESULTS);
    wizardState.setFlow('standard');
    trackWizardStep(STEP.RESULTS, 'standard', {
      application: wizardState.selectedApplication,
      action: wizardState.selectedAction,
      environment: wizardState.selectedEnvironment,
      source: 'medical_bypass'
    });
  }, [wizardState.selectedApplication, wizardState.selectedAction, wizardState.selectedEnvironment, wizardState.setSelectedTechnology, wizardState.setFlow, wizardState.setStep]);

  // Standard flow progress. Position of a step among the steps the user
  // sees (0 = industry pick); the count is the questions before Results.
  const totalSteps = stepPosition('standard', STEP.RESULTS, stepContext);

  const getProgressStep = useCallback(
    (rawStep: number) => stepPosition('standard', rawStep, stepContext),
    [stepContext],
  );

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
    stepContext,
    totalSteps,
    getProgressStep,
    getDisplayStep,
  };
}
