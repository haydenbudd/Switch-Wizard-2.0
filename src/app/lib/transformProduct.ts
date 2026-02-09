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
  // Map known Connection values
  switch (row.Connection) {
    case 'Terminals Only':
    case 'NPT Conduit Entry':
      return 'screw-terminal';
    case 'Connector':
      return 'quick-connect';
    case 'Flying Leads':
    case '1/4" Phone Plug':
    case '3-Prong Plug':
      return 'pre-wired';
    case 'Wireless (No Wiring)':
      return undefined;
  }

  // For null Connection, infer from series when possible
  const series = (row.series || '').toLowerCase();
  if (series.includes('hercules') || series.includes('clipper') || series.includes('vanguard') || series.includes('atlas') || series.includes('nautilus')) {
    return 'screw-terminal';
  }
  if (series.includes('varior') || series.includes('dolphin') || series.includes('gem') || series.includes('air seal') || series.includes('treadlite') || series.includes('executive')) {
    return 'pre-wired';
  }
  if (series.includes('classic')) {
    return 'quick-connect';
  }

  return undefined;
}

function normalizeIp(raw: string | null): string {
  if (!raw) return 'IP20';
  if (raw === 'IPXX') return 'IP20';
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
    material: row.Material || 'Unknown',
    connector_type: deriveConnectorType(row),
    description: row.description || `${row.series} - ${row.Part}`,
    applications: expandApplications(row.applications),
    features: deriveFeatures(row),
    flagship: false,
    image: row.image_url || '',
    link: row.Link || '',
    pedal_count: row['Number of Pedals'] ?? undefined,
    stages: row.Stages ?? undefined,
    configuration: row.Configuration ?? undefined,
    color: row.Color ?? undefined,
    pfc_config: row['PFC Config'] ?? undefined,
  };
}
