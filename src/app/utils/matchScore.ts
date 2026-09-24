import type { Product } from '@/app/lib/api';
import type { WizardState } from '@/app/hooks/useWizardState';
import { matchesEnvironment } from '@/app/utils/productFilters';
import { hasPreference } from '@/app/utils/preference';
import {
  applications, environments, connections, features as featureOptions, optionLabel,
} from '@/app/data/options';

/**
 * Smart-match scoring for the results page.
 *
 * Hard filters (must match, applied upstream): technology, action.
 *
 * Soft criteria below contribute weighted points. Each product's score is
 * compared to maxScore (the sum of points the user actually opted into),
 * giving a 0..1 quality value. Products are split into:
 *   - perfect: every selected soft criterion satisfied (matchedCount === totalSelected)
 *   - close:   at least one criterion satisfied but not all
 *
 * The `missing` array holds short plain-language reasons the product falls
 * short (e.g. "Heavier duty than selected", "Missing: Twin Pedal"), shown on
 * close-match cards and in the PDF.
 */

export interface MatchResult {
  score: number;
  maxScore: number;
  /** Number of soft criteria the user picked that this product fully matches. */
  matchedCount: number;
  /** Number of soft criteria the user picked overall. */
  totalSelected: number;
  /** Plain-language reasons the product does NOT fully satisfy the buyer's answers. */
  missing: string[];
}

const DUTY_TIER: Record<string, number> = { light: 0, medium: 1, heavy: 2 };

/** Environment → minimum acceptable IP rank. Higher rank = more sealed. */
const IP_RANK: Record<string, number> = { IPXX: 0, IP20: 1, IP56: 2, IP68: 3 };
const ENV_MIN_RANK: Record<string, number> = { open: 0, dry: 0, damp: 2, wet: 3 };

// Exact-tier credit delegates to the shared rule set in productFilters so the
// IP/environment tier definitions live in exactly one place.
const envExactMatch = matchesEnvironment;

function envMeetsMinimum(env: string, ip: string): boolean {
  if (env === 'any') return true;
  const min = ENV_MIN_RANK[env];
  const rank = IP_RANK[ip] ?? 0;
  return rank >= min;
}

export function scoreProduct(product: Product, state: WizardState): MatchResult {
  let score = 0;
  let maxScore = 0;
  let matchedCount = 0;
  let totalSelected = 0;
  const missing: string[] = [];

  // Application (weight 3) — the buyer's industry
  if (state.selectedApplication) {
    totalSelected += 1;
    maxScore += 3;
    if (product.applications.includes(state.selectedApplication)) {
      score += 3;
      matchedCount += 1;
    } else {
      missing.push(`Not listed for ${optionLabel(applications, state.selectedApplication)}`);
    }
  }

  // Environment (weight 2) — IP rating fit. A switch sealed *beyond* what the
  // environment needs (e.g. IP68 for a dry bench) is fully suitable, so it
  // counts as a match rather than being demoted to a close match.
  if (state.selectedEnvironment && state.selectedEnvironment !== 'any') {
    totalSelected += 1;
    maxScore += 2;
    if (envExactMatch(state.selectedEnvironment, product.ip) || envMeetsMinimum(state.selectedEnvironment, product.ip)) {
      score += 2;
      matchedCount += 1;
    } else {
      missing.push(`Not rated for ${optionLabel(environments, state.selectedEnvironment)} (${product.ip})`);
    }
  }

  // Duty (weight 2 exact, 1 adjacent tier)
  if (hasPreference(state.selectedDuty)) {
    totalSelected += 1;
    maxScore += 2;
    if (product.duty === state.selectedDuty) {
      score += 2;
      matchedCount += 1;
    } else {
      const sel = DUTY_TIER[state.selectedDuty];
      const have = DUTY_TIER[product.duty];
      if (sel !== undefined && have !== undefined && Math.abs(sel - have) === 1) {
        score += 1;
      }
      missing.push(
        have !== undefined && sel !== undefined && have > sel
          ? 'Heavier duty than selected'
          : 'Lighter duty than selected'
      );
    }
  }

  // Connection / wiring (weight 1) — irrelevant for pneumatic
  if (state.selectedTechnology !== 'pneumatic' && hasPreference(state.selectedConnection)) {
    totalSelected += 1;
    maxScore += 1;
    if (product.connector_type === state.selectedConnection) {
      score += 1;
      matchedCount += 1;
    } else {
      missing.push(
        product.connector_type
          ? `Different connection (${optionLabel(connections, product.connector_type)})`
          : 'Connection type not listed'
      );
    }
  }

  // Circuit count (weight 1)
  if (hasPreference(state.selectedCircuitCount)) {
    totalSelected += 1;
    maxScore += 1;
    if (product.circuitry === state.selectedCircuitCount) {
      score += 1;
      matchedCount += 1;
    } else {
      missing.push(
        product.circuitry
          ? `Controls ${product.circuitry} circuit${product.circuitry === '1' ? '' : 's'}`
          : 'Circuit count not listed'
      );
    }
  }

  // Safety guard (weight 1) — only "yes" is meaningful; "no" = no preference
  if (state.selectedGuard === 'yes') {
    totalSelected += 1;
    maxScore += 1;
    if ((product.features || []).includes('shield')) {
      score += 1;
      matchedCount += 1;
    } else {
      missing.push('No safety guard');
    }
  }

  // Features (weight 1 per selected hardware feature)
  if (state.selectedFeatures.length > 0) {
    const hardware = state.selectedFeatures.filter(
      f => f !== 'custom_cable' && f !== 'custom_connector'
    );
    if (hardware.length > 0) {
      totalSelected += 1;
      maxScore += hardware.length;
      const productFeatures = product.features || [];
      const matched = hardware.filter(f => productFeatures.includes(f));
      score += matched.length;
      if (matched.length === hardware.length) {
        matchedCount += 1;
      } else {
        const lacking = hardware.filter(f => !productFeatures.includes(f));
        missing.push(`Missing: ${lacking.map(f => optionLabel(featureOptions, f)).join(', ')}`);
      }
    }
  }

  return { score, maxScore, matchedCount, totalSelected, missing };
}

export interface ScoredProduct {
  product: Product;
  match: MatchResult;
}

export interface SplitResults {
  perfect: ScoredProduct[];
  close: ScoredProduct[];
}

/**
 * Score every product and split into perfect / close groups.
 *
 * - Hard filter on technology + action is applied first.
 * - Perfect = every selected soft criterion fully satisfied.
 * - Close = at least one criterion satisfied (score > 0) but not perfect.
 * - Products with score 0 and any user-set soft preference are dropped
 *   entirely (they share nothing the buyer asked for).
 *
 * Tie-breakers inside each group: higher raw score wins; then the existing
 * flagship bonus and duty rank, so the same "Top Choice" products that
 * already surface for an exact match continue to do so.
 */
export function scoreAndSplit(products: Product[], state: WizardState): SplitResults {
  const perfect: ScoredProduct[] = [];
  const close: ScoredProduct[] = [];

  const passesHardFilter = (p: Product) => {
    if (state.selectedTechnology && p.technology !== state.selectedTechnology) return false;
    if (hasPreference(state.selectedAction) && !p.actions.includes(state.selectedAction)) return false;
    return true;
  };

  for (const product of products) {
    if (!passesHardFilter(product)) continue;
    const match = scoreProduct(product, state);

    // If the user didn't select any soft criteria, everything is a perfect match
    if (match.totalSelected === 0) {
      perfect.push({ product, match });
      continue;
    }

    if (match.matchedCount === match.totalSelected) {
      perfect.push({ product, match });
    } else if (match.score > 0) {
      close.push({ product, match });
    }
    // else: zero overlap with anything the buyer asked for — drop
  }

  const tiebreak = (a: ScoredProduct, b: ScoredProduct) => {
    if (b.match.score !== a.match.score) return b.match.score - a.match.score;
    const flagshipDiff = (b.product.flagship ? 1 : 0) - (a.product.flagship ? 1 : 0);
    if (flagshipDiff !== 0) return flagshipDiff;
    return (DUTY_TIER[b.product.duty] ?? 0) - (DUTY_TIER[a.product.duty] ?? 0);
  };

  perfect.sort(tiebreak);
  close.sort(tiebreak);

  return { perfect, close };
}
