import { supabase } from './supabase';
import { transformRow, type StockSwitchRow } from './transformProduct';
import { markFlagships } from './publicRest';

export interface Product {
  id: string;
  series: string;
  technology: string;
  duty: 'heavy' | 'medium' | 'light';
  ip: string;
  actions: string[];
  material: string;
  description: string;
  applications: string[];
  features?: string[]; // Available features like 'shield', 'multi_stage', 'twin'
  recommended_for?: string[]; // Array of application IDs where this product shines
  // New fields from user request
  part_number?: string;      // "Part"
  pfc_config?: string;       // "PFC Config"
  pedal_count?: number;      // "Number of Pedals"
  circuitry?: string;        // "Circuits Controlled"
  stages?: string;           // "Stages"
  configuration?: string;    // "Configuration"
  interior_sub?: string;     // "Interior Sub"
  microswitch?: string;      // "Microswitch"
  microswitch_qty?: number;  // "Microswitch Qty"
  potentiometer?: string;    // "Potentiometer"
  color?: string;            // "Color"

  connector_type?: string; // Wiring connection type: 'screw-terminal', 'quick-connect', 'pre-wired'
  certifications?: string; // e.g. "UL, CSA, IEC"
  voltage?: string; // e.g. "120V - 240V"
  amperage?: string; // e.g. "10A - 15A"
  specs?: Record<string, string>; // Full specs JSONB from scraped data
  flagship: boolean;
  image: string;
  link: string;
  created_at?: string;
  updated_at?: string;
}

export interface Option {
  id: string;
  category: string;
  label: string;
  icon?: string;
  description: string;
  isMedical?: boolean;
  availableFor?: string[];
  hideFor?: string[];
  parentCategory?: string;
  sortOrder?: number;
}

// Product API calls — query Stock Switches table directly
export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('Stock Switches')
    .select('*')
    .neq('Syteline Status', 'Obsolete');

  if (error) {
    console.error('Supabase query failed:', error.message);
    throw new Error(error.message);
  }

  if (!data || data.length === 0) return [];

  return markFlagships((data as StockSwitchRow[]).map(transformRow));
}

export async function fetchProduct(id: string): Promise<Product> {
  const { data, error } = await supabase
    .from('Stock Switches')
    .select('*')
    .eq('id', Number(id))
    .single();

  if (error) throw new Error(error.message);
  return transformRow(data as StockSwitchRow);
}

// Reverse-map Product fields back to Stock Switches table columns
function productToRow(product: Partial<Product>): Record<string, unknown> {
  const row: Record<string, unknown> = {};

  if (product.series !== undefined) row.series = product.series;
  if (product.part_number !== undefined) row.Part = product.part_number;
  if (product.material !== undefined) row.Material = product.material;
  if (product.ip !== undefined) row['IP Rating'] = product.ip;
  if (product.description !== undefined) row.description = product.description;
  if (product.image !== undefined) row.image_url = product.image;
  if (product.link !== undefined) row.Link = product.link;
  if (product.applications !== undefined) row.applications = product.applications;
  if (product.duty !== undefined) row.duty = product.duty;
  if (product.color !== undefined) row.Color = product.color;
  if (product.pedal_count !== undefined) row['Number of Pedals'] = product.pedal_count;
  if (product.stages !== undefined) row.Stages = product.stages;
  if (product.configuration !== undefined) row.Configuration = product.configuration;
  if (product.circuitry !== undefined) row['Circuits Controlled'] = product.circuitry;
  if (product.pfc_config !== undefined) row['PFC Config'] = product.pfc_config;

  // Map technology back
  if (product.technology === 'wireless') row.Wireless = 'Yes';
  if (product.technology === 'pneumatic') row['Pneumatic Flow Control'] = 'Yes';

  // Map actions back to On/Off
  if (product.actions !== undefined) {
    const hasMom = product.actions.includes('momentary');
    const hasMain = product.actions.includes('maintained');
    const hasVar = product.actions.includes('variable');
    if (hasVar) row.Linear = 'Yes';
    if (hasMom && hasMain) row['On/Off'] = 'Mom/Main';
    else if (hasMom) row['On/Off'] = 'Mom';
    else if (hasMain) row['On/Off'] = 'Main';
  }

  // Map features back to Guard and Gated
  if (product.features !== undefined) {
    if (product.features.includes('shield')) row.Guard = 'Full';
    row.Gated = product.features.includes('gated') ? 'Yes' : null;
  }

  // Map connector_type back to Connection
  if (product.connector_type !== undefined) {
    const connMap: Record<string, string> = {
      'screw-terminal': 'Screw Terminals',
      'quick-connect': 'Connector',
      'pre-wired': 'Flying Leads',
    };
    row.Connection = connMap[product.connector_type] || product.connector_type;
  }

  return row;
}

export async function createOrUpdateProduct(product: Partial<Product>): Promise<Product> {
  const row = productToRow(product);

  if (product.id) {
    // Update existing row
    const { data, error } = await supabase
      .from('Stock Switches')
      .update(row)
      .eq('id', Number(product.id))
      .select()
      .single();

    if (error) throw new Error(error.message);
    return transformRow(data as StockSwitchRow);
  } else {
    // Insert new row
    const { data, error } = await supabase
      .from('Stock Switches')
      .insert(row)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return transformRow(data as StockSwitchRow);
  }
}

export async function createOrUpdateProducts(products: Partial<Product>[]): Promise<void> {
  const BATCH_SIZE = 10;
  const totalBatches = Math.ceil(products.length / BATCH_SIZE);

  console.log(`Starting bulk upload of ${products.length} products in ${totalBatches} batches...`);

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;

    console.log(`Uploading batch ${batchNum}/${totalBatches} (${batch.length} items)...`);

    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    try {
      const rows = batch.map(p => productToRow(p));

      const { error } = await supabase
        .from('Stock Switches')
        .insert(rows);

      if (error) throw new Error(error.message);
    } catch (error) {
      console.error(`Error uploading batch ${batchNum}:`, error);
      throw new Error(`Failed to upload batch ${batchNum}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  console.log('Bulk upload completed successfully');
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('Stock Switches')
    .delete()
    .eq('id', Number(id));

  if (error) throw new Error(error.message);
}

export async function deleteAllProducts(): Promise<void> {
  const { error } = await supabase
    .from('Stock Switches')
    .delete()
    .neq('id', 0); // delete all rows

  if (error) throw new Error(error.message);
}
