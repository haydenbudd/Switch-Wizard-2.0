/**
 * Styles for product attribute tags (IP rating, material, connection,
 * technology, duty, circuits, features) on cards, the compare table, the
 * detail modal and the admin list.
 *
 * Every attribute shares one quiet style, matching linemaster.com, which uses
 * nothing but navy, steel blue and orange. The tags' icons and labels tell
 * them apart. The per-attribute functions are kept so call sites, and any
 * future one-off highlight, don't need to change.
 */

export interface AttributeColor {
  bg: string;
  text: string;
  border: string;
}

const NEUTRAL: AttributeColor = {
  bg: 'bg-[#f2f5f9] dark:bg-slate-800/60',
  text: 'text-primary dark:text-slate-300',
  border: 'border-[#dce3ec] dark:border-slate-700',
};

export function getIpColor(_ip: string): AttributeColor {
  return NEUTRAL;
}

export function getMaterialColor(_material: string): AttributeColor {
  return NEUTRAL;
}

export function getConnectionColor(_type?: string): AttributeColor {
  return NEUTRAL;
}

export function getTechColor(_tech: string): AttributeColor {
  return NEUTRAL;
}

export function getDutyColor(_duty: string): AttributeColor {
  return NEUTRAL;
}

export function getCircuitColor(_count?: string): AttributeColor {
  return NEUTRAL;
}

export function getFeatureColor(_feature: string): AttributeColor {
  return NEUTRAL;
}

/**
 * Helper: build className string from an AttributeColor.
 * Adds border so badges have a tinted border instead of transparent.
 */
export function colorClasses(c: AttributeColor): string {
  return `${c.bg} ${c.text} border ${c.border}`;
}
