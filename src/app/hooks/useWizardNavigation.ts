import { useCallback, useMemo } from 'react';
import { WizardState } from '@/app/hooks/useWizardState';
import { trackWizardStep } from '@/app/utils/analytics';

interface CategoryOption {
  id: string;
  isMedical?: boolean;
}

interface UseWizardNavigationOptions {
  wizardState: WizardState;
  categories: CategoryOption[];
}

export function useWizardNavigation({ wizardState, categories }: UseWizardNavigationOptions) {
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
    wizardState.setSelectedApplication(id);
    wizardState.setSelectedTechnology('');
    clearDownstreamSelections(0);
    wizardState.setFlow('standard');
    setTimeout(() => wizardState.setStep(1), 150);
    trackWizardStep(0, 'standard', { application: id });
  }, [clearDownstreamSelections, wizardState.setSelectedApplication, wizardState.setSelectedTechnology, wizardState.setFlow, wizardState.setStep]);

  const handleBack = useCallback(() => {
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
      wizardState.setStep(prevStep);
    }
  }, [wizardState.step, wizardState.flow, wizardState.selectedCategory, wizardState.selectedApplication, wizardState.selectedTechnology, wizardState.selectedMedicalPath, wizardState.selectedChannel, wizardState.setFlow, wizardState.setStep, wizardState.setSelectedCategory, wizardState.setSelectedApplication]);

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

  const handleViewMedicalProducts = useCallback(() => {
    wizardState.setSelectedTechnology('electrical');
    wizardState.setStep(9);
    wizardState.setFlow('standard');
    trackWizardStep(9, 'standard', {
      application: wizardState.selectedApplication,
      technology: 'electrical',
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
    return steps;
  }, [wizardState.flow, wizardState.selectedTechnology, wizardState.selectedMedicalPath, wizardState.selectedChannel]);

  const skipsConnectionStep = wizardState.selectedTechnology === 'pneumatic' || wizardState.selectedTechnology === 'wireless';

  const getProgressStep = useCallback((rawStep: number) => {
    if (rawStep <= 0) return 0;
    let step = rawStep;
    if (skipsConnectionStep && rawStep > 5) step--;
    if (skipsConnectionStep && rawStep > 6) step--;
    return step;
  }, [skipsConnectionStep]);

  const getDisplayStep = useCallback((rawStep: number) => getProgressStep(rawStep) + 1, [getProgressStep]);

  return {
    clearDownstreamSelections,
    handleCategorySelect,
    handleApplicationSelect,
    handleBack,
    handleContinue,
    handleViewMedicalProducts,
    totalSteps,
    getProgressStep,
    getDisplayStep,
  };
}
