import type { Product } from './api';

export interface StockSwitchRow {
  id: number;
  series: string;
  Part: string;
  'Syteline Status': string | null;
  'On/Off': string | null;
  Wireless: string | null;
  Linear: string | null;
  'Pneumatic Flow Control': string | null;
  Guard: string | null;
  Connection: string | null;
  'IP Rating': string | null;
  Material: string | null;
  'Number of Pedals': number | null;
  Stages: string | null;
  Configuration: string | null;
  'PFC Config': string | null;
  Color: string | null;
  Link: string | null;
  description: string | null;
  image_url: string | null;
  applications: string[] | null;
  duty: string | null;
  features: string | null;
  Notes: string | null;
  'Circuits Controlled': string | null;
}

const INDUSTRIAL_EXPANSIONS = [
  'manufacturing',
  'construction',
  'utilities',
  'agriculture',
  'defense',
];

function deriveTechnology(row: StockSwitchRow): string {
  if (row.Wireless === 'Yes') return 'wireless';
  if (row['Pneumatic Flow Control'] === 'Yes') return 'pneumatic';
  return 'electrical';
}

function deriveActions(row: StockSwitchRow): string[] {
  const actions: string[] = [];
  const onOff = (row['On/Off'] || '').trim();

  if (onOff === 'Mom') actions.push('momentary');
  if (onOff === 'Main') actions.push('maintained');
  if (onOff === 'Mom/Main') {
    actions.push('momentary');
    actions.push('maintained');
  }
  if (row.Linear === 'Yes') actions.push('variable');

  return actions;
}

function deriveConnectorType(row: StockSwitchRow): string | undefined {
  // Pneumatic and wireless products don't have electrical connectors
  if (row['Pneumatic Flow Control'] === 'Yes' || row.Wireless === 'Yes') {
    return undefined;
  }

  // Map unambiguous Connection values
  switch (row.Connection) {
    case 'Screw Terminals':
    case 'Solder Terminals':
    case 'Solder Terminals + Quick-connect':
    case 'Wire-nuts':
      return 'screw-terminal';
    case 'Connector':
      return 'quick-connect';
    case 'Flying Leads':
    case '1/4" Phone Plug':
    case '3-Prong Plug':
      return 'pre-wired';
    case 'Wireless (No Wiring)':
      return undefined;
    case 'Terminals Only': {
      // "Terminals Only" = no cord, user wires it. Actual terminal type
      // varies by series — quick-connect tabs vs screw/solder terminals.
      // Verified against linemaster.com product pages (Feb 2026)
      const s = (row.series || '').toLowerCase();
      if (s.includes('classic') || s.includes('treadlite') || s.includes('aquiline')) {
        return 'quick-connect';
      }
      return 'screw-terminal';
    }
  }

  // For null Connection, infer from series when possible
  // Verified against linemaster.com product pages (Feb 2026)
  const series = (row.series || '').toLowerCase();
  if (series.includes('hercules') || series.includes('clipper') || series.includes('atlas') || series.includes('nautilus') || series.includes('compact') || series.includes('lektro')) {
    return 'screw-terminal';
  }
  if (series.includes('classic') || series.includes('treadlite') || series.includes('aquiline')) {
    return 'quick-connect';
  }
  if (series.includes('varior') || series.includes('dolphin') || series.includes('gem') || series.includes('air seal') || series.includes('vanguard') || series.includes('executive')) {
    return 'pre-wired';
  }

  return undefined;
}

function normalizeIp(raw: string | null): string {
  if (!raw) return 'IPXX';
  if (raw === 'IPX8') return 'IP68';
  return raw;
}

function deriveFeatures(row: StockSwitchRow): string[] {
  const features: string[] = [];

  if (row.Guard === 'Full' || row.Guard === 'Standard') {
    features.push('shield');
  }

  if (row['Number of Pedals'] != null && row['Number of Pedals'] >= 2) {
    features.push('twin');
  }

  if (
    row.Stages != null &&
    (row.Stages.includes('2 Stage') || row.Stages.includes('3 Stage'))
  ) {
    features.push('multi_stage');
  }

  return features;
}

// Extract the Linemaster product page ID from a product Link URL.
// e.g. "https://linemaster.com/product/167/hercules-full-shield/" → "167"
function extractProductPageId(link: string | null): string | null {
  if (!link) return null;
  const match = link.match(/\/product\/(\d+)\//);
  return match ? match[1] : null;
}

// Build a per-product CDN image URL from the product page ID.
// Linemaster hosts product images at /cdn/images/products/{id}/{id}-a-shadow@1200.png
function buildCdnImageUrl(productPageId: string): string {
  return `https://linemaster.com/cdn/images/products/${productPageId}/${productPageId}-a-shadow@1200.png`;
}

// Fallback images by series name when CDN image is unavailable
const SERIES_IMAGES: Record<string, string> = {
  'hercules': 'https://linemaster.com/wp-content/uploads/2025/04/hercules-full-shield.png',
  'atlas': 'https://linemaster.com/wp-content/uploads/2025/04/atlas.png',
  'clipper': 'https://linemaster.com/wp-content/uploads/2025/04/clipper_duo.png',
  'classic iv': 'https://linemaster.com/wp-content/uploads/2025/04/classic-iv.png',
  'classic': 'https://linemaster.com/wp-content/uploads/2025/04/classic-iv.png',
  'dolphin': 'https://linemaster.com/wp-content/uploads/2025/04/dolphin-2.png',
  'gem-v': 'https://linemaster.com/wp-content/uploads/2025/04/gem.png',
  'gem': 'https://linemaster.com/wp-content/uploads/2025/04/gem.png',
  'varior': 'https://linemaster.com/wp-content/uploads/2025/04/varior-potentiometer.png',
  'air seal': 'https://linemaster.com/wp-content/uploads/2025/03/air_seal.png',
  'air-seal': 'https://linemaster.com/wp-content/uploads/2025/03/air_seal.png',
  'rf wireless hercules': 'https://linemaster.com/wp-content/uploads/2025/04/rf-hercules.png',
  'airval hercules': 'https://linemaster.com/wp-content/uploads/2025/03/airval-hercules-duo_optimized.png',
};

// Check whether a URL is a series-level fallback (shared across all products in a series)
function isSeriesLevelImage(url: string): boolean {
  return Object.values(SERIES_IMAGES).some(seriesUrl => url === seriesUrl);
}

function deriveImage(row: StockSwitchRow): string {
  const pageId = extractProductPageId(row.Link);
  const dbUrl = row.image_url && !row.image_url.includes('placeholder') ? row.image_url : null;

  // 1. Use DB image_url if it's a real per-product image (not a series-level fallback)
  if (dbUrl && !isSeriesLevelImage(dbUrl)) return dbUrl;

  // 2. Derive per-product CDN image from the product page link (unique per product)
  if (pageId) return buildCdnImageUrl(pageId);

  // 3. Use DB image_url even if it's a series-level image (better than nothing)
  if (dbUrl) return dbUrl;

  // 4. Fall back to series-level image by series name
  const series = (row.series || '').toLowerCase();
  if (SERIES_IMAGES[series]) return SERIES_IMAGES[series];
  for (const [key, url] of Object.entries(SERIES_IMAGES)) {
    if (series.includes(key)) return url;
  }

  return '';
}

function expandApplications(raw: string[] | null): string[] {
  if (!raw || raw.length === 0) return ['general'];
  const apps = new Set(raw);

  if (apps.has('industrial')) {
    for (const sub of INDUSTRIAL_EXPANSIONS) {
      apps.add(sub);
    }
  }

  return Array.from(apps);
}

export function transformRow(row: StockSwitchRow): Product {
  return {
    id: String(row.id),
    series: row.series || 'Unknown',
    part_number: row.Part,
    technology: deriveTechnology(row),
    actions: deriveActions(row),
    duty: (row.duty as 'heavy' | 'medium' | 'light') || 'medium',
    ip: normalizeIp(row['IP Rating']),
    material: row.Material || '',
    connector_type: deriveConnectorType(row),
    description: row.description || `${row.series} - ${row.Part}`,
    applications: expandApplications(row.applications),
    features: deriveFeatures(row),
    flagship: false,
    image: deriveImage(row),
    link: row.Link || '',
    pedal_count: row['Number of Pedals'] ?? undefined,
    stages: row.Stages ?? undefined,
    circuitry: row['Circuits Controlled'] != null ? String(row['Circuits Controlled']) : undefined,
    configuration: row.Configuration ?? undefined,
    color: row.Color ?? undefined,
    pfc_config: row['PFC Config'] ?? undefined,
  };
}
