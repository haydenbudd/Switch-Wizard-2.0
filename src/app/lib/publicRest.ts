/**
 * Minimal Supabase REST (PostgREST) client for the public wizard.
 *
 * The wizard only ever runs one read (products) and one write (analytics
 * events), both as the anonymous role, so it talks to the REST endpoint
 * with plain fetch instead of loading @supabase/supabase-js (~170 KB). The
 * admin panel still uses the full client for sign-in and editing.
 */
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import type { Product } from './api';
import { transformRow, type StockSwitchRow } from './transformProduct';

const REST_URL = `https://${projectId}.supabase.co/rest/v1`;

const HEADERS = {
  apikey: publicAnonKey,
  Authorization: `Bearer ${publicAnonKey}`,
};

/** Mark one flagship "Top Choice" per series — best duty + IP + features. */
export function markFlagships(products: Product[]): Product[] {
  const dutyScore: Record<string, number> = { heavy: 3, medium: 2, light: 1 };
  const ipScore = (ip: string) => (ip === 'IPXX' ? 0 : parseInt(ip.replace(/\D/g, '') || '0'));
  const score = (p: Product) =>
    (dutyScore[p.duty] ?? 0) * 100 + ipScore(p.ip) * 10 + (p.features?.length ?? 0);

  const bestBySeries = new Map<string, Product>();
  for (const p of products) {
    const existing = bestBySeries.get(p.series);
    if (!existing || score(p) > score(existing)) {
      bestBySeries.set(p.series, p);
    }
  }
  for (const p of bestBySeries.values()) {
    p.flagship = true;
  }
  return products;
}

/** All non-obsolete products, transformed for the wizard. */
export async function fetchPublicProducts(signal?: AbortSignal): Promise<Product[]> {
  const params = new URLSearchParams({ select: '*', 'Syteline Status': 'neq.Obsolete' });
  const response = await fetch(`${REST_URL}/${encodeURIComponent('Stock Switches')}?${params}`, {
    headers: HEADERS,
    signal,
  });
  if (!response.ok) {
    throw new Error(`Products request failed: ${response.status} ${await response.text()}`);
  }
  const rows = (await response.json()) as StockSwitchRow[];
  return markFlagships(rows.map(transformRow));
}

/** Fire-and-forget insert into wizard_events. Never throws. */
export function insertWizardEvent(row: Record<string, unknown>): void {
  fetch(`${REST_URL}/wizard_events`, {
    method: 'POST',
    headers: { ...HEADERS, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(row),
    keepalive: true,
  })
    .then((response) => {
      if (!response.ok) console.warn('[Analytics] persist failed:', response.status);
    })
    .catch(() => {
      // Offline or blocked: drop the event silently
    });
}
