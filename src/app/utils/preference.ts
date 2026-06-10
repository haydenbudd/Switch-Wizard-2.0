// The wizard's "No Preference" sentinel. A selection equal to this value (or
// left empty) does not constrain results anywhere — filtering, scoring,
// counting, or PDF output. Always test selections through hasPreference()
// instead of comparing against the raw string.

export const NO_PREFERENCE = 'no_preference';

/** True when the user made a real, constraining choice. */
export function hasPreference(value: string | undefined | null): value is string {
  return !!value && value !== NO_PREFERENCE;
}
