/**
 * Color mappings for product attributes.
 * Returns Tailwind classes for bg, text, and border to make
 * attributes visually distinct across cards, compare table, and detail modal.
 *
 * All colors use opacity variants so they stay subtle on glass backgrounds
 * and support both light and dark themes.
 */

export interface AttributeColor {
  bg: string;
  text: string;
  border: string;
}

// --- IP Rating ---
const ipColors: Record<string, AttributeColor> = {
  IP68: { bg: 'bg-blue-100 dark:bg-blue-950/60', text: 'text-blue-800 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  IP67: { bg: 'bg-sky-100 dark:bg-sky-950/60', text: 'text-sky-800 dark:text-sky-300', border: 'border-sky-200 dark:border-sky-800' },
  IP66: { bg: 'bg-cyan-100 dark:bg-cyan-950/60', text: 'text-cyan-800 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800' },
  IP65: { bg: 'bg-cyan-50 dark:bg-cyan-950/40', text: 'text-cyan-700 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-800' },
};
const ipDefault: AttributeColor = { bg: 'bg-slate-100 dark:bg-slate-800/60', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-700' };

export function getIpColor(ip: string): AttributeColor {
  return ipColors[ip?.toUpperCase()] || ipDefault;
}

// --- Material ---
export function getMaterialColor(material: string): AttributeColor {
  const m = material.toLowerCase();
  if (m.includes('cast iron'))
    return { bg: 'bg-stone-100 dark:bg-stone-900/60', text: 'text-stone-700 dark:text-stone-300', border: 'border-stone-300 dark:border-stone-700' };
  if (m.includes('stainless'))
    return { bg: 'bg-slate-100 dark:bg-slate-800/60', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-300 dark:border-slate-600' };
  if (m.includes('thermoplastic') || m.includes('plastic') || m.includes('rubber') || m.includes('polymeric'))
    return { bg: 'bg-emerald-50 dark:bg-emerald-950/50', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' };
  if (m.includes('aluminum') || m.includes('aluminium'))
    return { bg: 'bg-violet-50 dark:bg-violet-950/50', text: 'text-violet-700 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800' };
  if (m.includes('zinc') || m.includes('die'))
    return { bg: 'bg-amber-50 dark:bg-amber-950/50', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' };
  return ipDefault;
}

// --- Connection Type ---
const connectionColors: Record<string, AttributeColor> = {
  'screw-terminal': { bg: 'bg-orange-50 dark:bg-orange-950/50', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' },
  'quick-connect':  { bg: 'bg-teal-50 dark:bg-teal-950/50', text: 'text-teal-700 dark:text-teal-400', border: 'border-teal-200 dark:border-teal-800' },
  'pre-wired':      { bg: 'bg-purple-50 dark:bg-purple-950/50', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
};

export function getConnectionColor(type?: string): AttributeColor {
  if (!type) return ipDefault;
  return connectionColors[type.toLowerCase()] || ipDefault;
}

// --- Technology ---
const techColors: Record<string, AttributeColor> = {
  electrical: { bg: 'bg-blue-50 dark:bg-blue-950/50', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
  wireless:   { bg: 'bg-violet-50 dark:bg-violet-950/50', text: 'text-violet-700 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800' },
  pneumatic:  { bg: 'bg-cyan-50 dark:bg-cyan-950/50', text: 'text-cyan-700 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-800' },
};

export function getTechColor(tech: string): AttributeColor {
  return techColors[tech?.toLowerCase()] || ipDefault;
}

// --- Duty Rating ---
const dutyColors: Record<string, AttributeColor> = {
  heavy:  { bg: 'bg-amber-50 dark:bg-amber-950/50', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
  medium: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
  light:  { bg: 'bg-green-50 dark:bg-green-950/40', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
};

export function getDutyColor(duty: string): AttributeColor {
  return dutyColors[duty?.toLowerCase()] || ipDefault;
}

// --- Circuit Count ---
const circuitColors: Record<string, AttributeColor> = {
  '1': { bg: 'bg-slate-100 dark:bg-slate-800/60', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-700' },
  '2': { bg: 'bg-indigo-50 dark:bg-indigo-950/50', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800' },
  '3': { bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/50', text: 'text-fuchsia-700 dark:text-fuchsia-400', border: 'border-fuchsia-200 dark:border-fuchsia-800' },
  '4': { bg: 'bg-rose-50 dark:bg-rose-950/50', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800' },
};

export function getCircuitColor(count?: string): AttributeColor {
  if (!count) return ipDefault;
  return circuitColors[count] || { bg: 'bg-pink-50 dark:bg-pink-950/50', text: 'text-pink-700 dark:text-pink-400', border: 'border-pink-200 dark:border-pink-800' };
}

// --- Features ---
const featureColors: Record<string, AttributeColor> = {
  shield:      { bg: 'bg-emerald-50 dark:bg-emerald-950/50', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
  gated:       { bg: 'bg-teal-50 dark:bg-teal-950/50', text: 'text-teal-700 dark:text-teal-400', border: 'border-teal-200 dark:border-teal-800' },
  twin:        { bg: 'bg-violet-50 dark:bg-violet-950/50', text: 'text-violet-700 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800' },
  multi_stage: { bg: 'bg-amber-50 dark:bg-amber-950/50', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
};

export function getFeatureColor(feature: string): AttributeColor {
  return featureColors[feature] || { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800' };
}

/**
 * Helper: build className string from an AttributeColor.
 * Adds border so color-coded badges have a tinted border instead of transparent.
 */
export function colorClasses(c: AttributeColor): string {
  return `${c.bg} ${c.text} border ${c.border}`;
}
