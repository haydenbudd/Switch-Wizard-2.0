// Encode/decode wizard state to/from URL query parameters for shareable results links

import type { WizardState } from '@/app/hooks/useWizardState';

// Short param keys to keep URLs compact
const PARAM_MAP = {
  app: 'selectedApplication',
  tech: 'selectedTechnology',
  action: 'selectedAction',
  env: 'selectedEnvironment',
  duty: 'selectedDuty',
  mat: 'selectedMaterial',
  conn: 'selectedConnection',
  cc: 'selectedCircuitCount',
  guard: 'selectedGuard',
  feat: 'selectedFeatures',
  flow: 'flow',
} as const;

type ParamKey = keyof typeof PARAM_MAP;

const REVERSE_MAP = Object.fromEntries(
  Object.entries(PARAM_MAP).map(([k, v]) => [v, k])
) as Record<string, ParamKey>;

/** Build a shareable URL from current wizard state */
export function buildShareUrl(state: WizardState): string {
  const params = new URLSearchParams();

  for (const [param, field] of Object.entries(PARAM_MAP) as [ParamKey, string][]) {
    const value = (state as Record<string, unknown>)[field];
    if (!value) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    params.set(param, Array.isArray(value) ? value.join(',') : String(value));
  }

  const base = window.location.origin + window.location.pathname;
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/** Parse URL search string back into partial wizard state. Returns null if no share params found. */
export function parseShareParams(search: string): Partial<WizardState> | null {
  const params = new URLSearchParams(search);
  if (params.size === 0) return null;

  // Check if any of our known params exist
  const hasShareParams = Object.keys(PARAM_MAP).some(k => params.has(k));
  if (!hasShareParams) return null;

  const state: Record<string, unknown> = {};

  for (const [param, field] of Object.entries(PARAM_MAP) as [ParamKey, string][]) {
    const raw = params.get(param);
    if (!raw) continue;

    if (field === 'selectedFeatures') {
      state[field] = raw.split(',').filter(Boolean);
    } else {
      state[field] = raw;
    }
  }

  return state as Partial<WizardState>;
}

/** Update the browser URL bar with share params (no history entry) */
export function updateUrlWithState(state: WizardState) {
  const url = buildShareUrl(state);
  window.history.replaceState(null, '', url);
}

/** Clear share params from the URL bar */
export function clearShareParams() {
  const base = window.location.origin + window.location.pathname;
  window.history.replaceState(null, '', base);
}

// ──────────────────────────────────────────────────────────────────────
// Mid-wizard persistence — survives accidental refresh
//
// Different from share URLs: share URLs always restore to the results page
// (step 9), localStorage restores to wherever the user left off.
// ──────────────────────────────────────────────────────────────────────

const LOCAL_KEY = 'lm-wizard-state-v1';

interface PersistedState {
  step: number;
  selectedCategory: string;
  selectedApplication: string;
  selectedTechnology: string;
  selectedAction: string;
  selectedEnvironment: string;
  selectedDuty: string;
  selectedMaterial: string;
  selectedConnection: string;
  selectedCircuitCount: string;
  selectedGuard: string;
  selectedFeatures: string[];
  flow: 'standard' | 'medical';
}

export function saveWizardStateToLocal(state: PersistedState) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
  } catch {
    // Private mode / storage disabled — silently degrade
  }
}

export function loadWizardStateFromLocal(): PersistedState | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    if (typeof parsed.step !== 'number') return null;
    return parsed as PersistedState;
  } catch {
    return null;
  }
}

export function clearWizardStateFromLocal() {
  try {
    localStorage.removeItem(LOCAL_KEY);
  } catch {
    // Storage unavailable
  }
}
