/**
 * Plain-language IP (Ingress Protection, IEC 60529) ratings. Buyers see codes
 * like "IPXX" or "IP56" on cards and in the compare table; these helpers say
 * what they mean. The raw code stays the source of truth for filtering,
 * sorting and colors — this is display only.
 */

const MEANING: Record<string, string> = {
  IPXX: 'No IP rating — for clean, dry, protected locations.',
  IP20: 'IP20: protected against fingers and small debris; no protection against water.',
  IP56: 'IP56: dust-protected and resists powerful water jets.',
  IP68: 'IP68: dust-tight and protected against continuous submersion.',
};

const SHORT: Record<string, string> = {
  IPXX: 'Not IP-rated',
  IP20: 'IP20 · indoor, not water-resistant',
  IP56: 'IP56 · dust & water-jet resistant',
  IP68: 'IP68 · dust-tight, submersible',
};

/** Compact badge text: the code, except unrated switches read "Not IP-rated". */
export function ipBadgeLabel(ip: string): string {
  return ip?.toUpperCase() === 'IPXX' ? 'Not IP-rated' : ip;
}

/** One-line summary for spec rows / compare table, e.g. "IP68 · dust-tight, submersible". */
export function ipShort(ip: string): string {
  return SHORT[ip?.toUpperCase()] ?? ip;
}

/** Full sentence for tooltips. */
export function ipMeaning(ip: string): string {
  return MEANING[ip?.toUpperCase()]
    ?? `${ip}: Ingress Protection rating — first digit is protection from solids/dust, second from water.`;
}
