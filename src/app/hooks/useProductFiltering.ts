import { useCallback, useMemo } from 'react';
import type { Product } from '@/app/lib/api';
import { WizardState } from '@/app/hooks/useWizardState';
import { matchesEnvironment } from '@/app/utils/productFilters';
import { scoreAndSplit, type SplitResults } from '@/app/utils/matchScore';
import { hasPreference } from '@/app/utils/preference';

/** Wizard step index → the answer field it sets (step 8 = multi-select features). */
const STEP_FIELDS = [
  'selectedApplication', 'selectedTechnology', 'selectedAction', 'selectedEnvironment',
  'selectedDuty', 'selectedConnection', 'selectedCircuitCount', 'selectedGuard', 'selectedFeatures',
] as const;

export interface OptionCount {
  /** Products that would match every answer so far exactly. */
  exact: number;
  /** Products that would be close matches (differ on something). */
  close: number;
}

interface UseProductFilteringOptions {
  wizardState: WizardState;
  products: Product[];
}

export function useProductFiltering({ wizardState, products }: UseProductFilteringOptions) {
  const filterProducts = useCallback((overrides: Partial<WizardState> = {}) => {
    const state = { ...wizardState, ...overrides };

    return (products || []).filter((product) => {
      if (state.selectedApplication && !product.applications.includes(state.selectedApplication)) return false;
      if (state.selectedTechnology && product.technology !== state.selectedTechnology) return false;
      if (hasPreference(state.selectedAction) && !product.actions.includes(state.selectedAction)) return false;
      if (!matchesEnvironment(state.selectedEnvironment, product.ip)) return false;
      if (hasPreference(state.selectedDuty) && product.duty !== state.selectedDuty) return false;
      if (
        state.selectedTechnology !== 'pneumatic' &&
        hasPreference(state.selectedConnection) &&
        product.connector_type !== state.selectedConnection
      ) return false;
      if (hasPreference(state.selectedCircuitCount) && product.circuitry !== state.selectedCircuitCount) return false;
      if (state.selectedGuard === 'yes' && !(product.features || []).includes('shield')) return false;

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

  // Per-option counts for the wizard cards, computed with the SAME scoring the
  // results page uses — "if you pick this, how many exact and close matches
  // would you get?" (later answers ignored). Previously these used strict
  // filtering, so cards were greyed out as "No products available" even when
  // picking them would have shown close matches.
  const getProductCount = useCallback((step: number, optionId?: string): OptionCount => {
    if (!optionId || step < 0 || step >= STEP_FIELDS.length) return { exact: 0, close: 0 };
    const overrides: Record<string, unknown> = {};
    for (let i = step + 1; i < STEP_FIELDS.length; i++) {
      overrides[STEP_FIELDS[i]] = STEP_FIELDS[i] === 'selectedFeatures' ? [] : '';
    }
    overrides[STEP_FIELDS[step]] = optionId;
    const split = scoreAndSplit(products || [], { ...wizardState, ...overrides } as WizardState);
    return { exact: split.perfect.length, close: split.close.length };
  }, [products, wizardState]);

  const getAlternativeProducts = useCallback(() => {
    // "no_preference" never constrains results, so relaxing it is a no-op —
    // treat it like an unset value when deciding which criterion to relax
    // and when re-filtering by action below.
    const hasAction = hasPreference(wizardState.selectedAction);
    const hasDuty = hasPreference(wizardState.selectedDuty);

    if (wizardState.selectedFeatures.length > 0) {
      const withoutFeatures = filterProducts({ selectedFeatures: [] });
      if (withoutFeatures.length > 0) return { products: withoutFeatures, relaxed: 'features' as const };
    }
    // "no" means no preference — relaxing it can't add results
    if (wizardState.selectedGuard === 'yes') {
      const withoutGuard = filterProducts({ selectedFeatures: [], selectedGuard: '' });
      if (withoutGuard.length > 0) return { products: withoutGuard, relaxed: 'guard' as const };
    }
    if (hasDuty) {
      const withoutDuty = filterProducts({ selectedFeatures: [], selectedGuard: '', selectedDuty: '' });
      if (withoutDuty.length > 0) return { products: withoutDuty, relaxed: 'duty' as const };
    }
    if (wizardState.selectedEnvironment) {
      const withoutEnvironment = (products || []).filter((product) => {
        if (!product.applications.includes(wizardState.selectedApplication)) return false;
        if (product.technology !== wizardState.selectedTechnology) return false;
        if (hasAction && !product.actions.includes(wizardState.selectedAction)) return false;
        return true;
      });
      if (withoutEnvironment.length > 0) return { products: withoutEnvironment, relaxed: 'environment' as const };
    }
    if (hasAction) {
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

  /**
   * Smart-match split: perfect matches (every soft criterion satisfied) and
   * close matches (partial fit). Hard filter is technology + action only —
   * everything else is a weighted preference. See utils/matchScore.ts.
   */
  const scoredProducts = useCallback((overrides: Partial<WizardState> = {}): SplitResults => {
    const state = { ...wizardState, ...overrides };
    return scoreAndSplit(products || [], state);
  }, [products, wizardState]);

  return {
    filterProducts,
    getProductCount,
    getAlternativeProducts,
    needsCustomSolution,
    scoredProducts,
  };
}
