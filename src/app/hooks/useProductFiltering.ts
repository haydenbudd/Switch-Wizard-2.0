import { useCallback, useMemo } from 'react';
import type { Product } from '@/app/lib/api';
import { WizardState } from '@/app/hooks/useWizardState';
import { matchesEnvironment } from '@/app/utils/productFilters';
import { scoreAndSplit, type SplitResults } from '@/app/utils/matchScore';
import { hasPreference, NO_PREFERENCE } from '@/app/utils/preference';

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

  // Pre-compute product counts for each option at each step in a single pass
  const productCountMap = useMemo(() => {
    const safeProducts = products || [];
    const counts = new Map<string, number>();

    // Helper to make composite keys
    const key = (step: number, optionId: string) => `${step}:${optionId}`;

    for (const p of safeProducts) {
      const matchesApp = p.applications.includes(wizardState.selectedApplication);
      if (!matchesApp) continue;

      // Step 1: Technology
      counts.set(key(1, p.technology), (counts.get(key(1, p.technology)) || 0) + 1);

      const matchesTech = p.technology === wizardState.selectedTechnology;
      if (!matchesTech) continue;

      // Step 2: Action
      for (const action of p.actions) {
        counts.set(key(2, action), (counts.get(key(2, action)) || 0) + 1);
      }
      // "no_preference" matches everything at this filtering level
      counts.set(key(2, NO_PREFERENCE), (counts.get(key(2, NO_PREFERENCE)) || 0) + 1);

      const matchesAction =
        !hasPreference(wizardState.selectedAction) ||
        p.actions.includes(wizardState.selectedAction);
      if (!matchesAction) continue;

      // Step 3: Environment — check each env option against this product's IP
      for (const env of ['open', 'dry', 'damp', 'wet', 'any']) {
        if (matchesEnvironment(env, p.ip)) {
          counts.set(key(3, env), (counts.get(key(3, env)) || 0) + 1);
        }
      }

      const matchesEnv = matchesEnvironment(wizardState.selectedEnvironment, p.ip);
      if (!matchesEnv) continue;

      // Step 4: Duty
      counts.set(key(4, p.duty), (counts.get(key(4, p.duty)) || 0) + 1);
      // "no_preference" matches everything at this filtering level
      counts.set(key(4, NO_PREFERENCE), (counts.get(key(4, NO_PREFERENCE)) || 0) + 1);

      const matchesDuty =
        !hasPreference(wizardState.selectedDuty) ||
        p.duty === wizardState.selectedDuty;
      if (!matchesDuty) continue;

      // Step 5: Connection Type
      if (p.connector_type) {
        counts.set(key(5, p.connector_type), (counts.get(key(5, p.connector_type)) || 0) + 1);
      }
      // "no_preference" matches everything at this filtering level
      counts.set(key(5, NO_PREFERENCE), (counts.get(key(5, NO_PREFERENCE)) || 0) + 1);

      const matchesConnection = wizardState.selectedTechnology === 'pneumatic' || !hasPreference(wizardState.selectedConnection) || p.connector_type === wizardState.selectedConnection;
      if (!matchesConnection) continue;

      // Step 6: Circuit Count
      if (p.circuitry) {
        counts.set(key(6, p.circuitry), (counts.get(key(6, p.circuitry)) || 0) + 1);
      }
      // "no_preference" matches everything at this filtering level
      counts.set(key(6, NO_PREFERENCE), (counts.get(key(6, NO_PREFERENCE)) || 0) + 1);

      const matchesCircuit = !hasPreference(wizardState.selectedCircuitCount) || p.circuitry === wizardState.selectedCircuitCount;
      if (!matchesCircuit) continue;

      // Step 7: Guard
      const hasShield = (p.features || []).includes('shield');
      if (hasShield) {
        counts.set(key(7, 'yes'), (counts.get(key(7, 'yes')) || 0) + 1);
      }
      // 'no' = no preference, all products count
      counts.set(key(7, 'no'), (counts.get(key(7, 'no')) || 0) + 1);
    }

    return counts;
  }, [products, wizardState.selectedApplication, wizardState.selectedTechnology, wizardState.selectedAction, wizardState.selectedEnvironment, wizardState.selectedDuty, wizardState.selectedConnection, wizardState.selectedCircuitCount]);

  const getProductCount = useCallback((step: number, optionId?: string) => {
    if (!optionId) return 0;
    return productCountMap.get(`${step}:${optionId}`) || 0;
  }, [productCountMap]);

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
    if (wizardState.selectedGuard) {
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
