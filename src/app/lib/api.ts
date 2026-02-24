import { supabase } from './supabase';
import { transformRow, type StockSwitchRow } from './transformProduct';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a6e7a38d`;

async function fetchAPI(endpoint: string, options: RequestInit = {}) {

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      cache: 'no-store',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { error: errorText || 'Unknown error' };
      }
      throw new Error(error.error || `HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - backend server may be starting up or unavailable');
      }
      throw error;
    }
    throw new Error('Unknown error occurred');
  }
}

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

  const products = (data as StockSwitchRow[]).map(transformRow);

  // Mark one flagship "Top Choice" per series — best duty + IP + features
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

export async function fetchProduct(id: string): Promise<Product> {
  const data = await fetchAPI(`/products/${id}`);
  return data.product;
}

export async function createOrUpdateProduct(product: Partial<Product>): Promise<Product> {
  const data = await fetchAPI('/products', {
    method: 'POST',
    body: JSON.stringify(product),
  });
  return data.product;
}

export async function createOrUpdateProducts(products: Partial<Product>[]): Promise<void> {
  // Split into smaller batches to prevent timeouts with large datasets
  // Reduced batch size to 10 to prevent connection closures on large payloads
  const BATCH_SIZE = 10;
  const totalBatches = Math.ceil(products.length / BATCH_SIZE);
  
  console.log(`Starting bulk upload of ${products.length} products in ${totalBatches} batches...`);
  
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    
    console.log(`Uploading batch ${batchNum}/${totalBatches} (${batch.length} items)...`);
    
    // Add a small delay between batches to prevent overwhelming the server/database
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    try {
      // Use the standard /products endpoint which now supports array input
      await fetchAPI('/products', {
        method: 'POST',
        body: JSON.stringify(batch),
      });
    } catch (error) {
      console.error(`Error uploading batch ${batchNum}:`, error);
      throw new Error(`Failed to upload batch ${batchNum}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  console.log('✅ Bulk upload completed successfully');
}

export async function deleteProduct(id: string): Promise<void> {
  await fetchAPI(`/products/${id}`, {
    method: 'DELETE',
  });
}

export async function deleteAllProducts(): Promise<void> {
  // Use a timestamp to prevent caching
  await fetchAPI(`/products?t=${Date.now()}`, {
    method: 'DELETE',
  });
}

// Options API calls
export async function fetchOptions(): Promise<Option[]> {
  const data = await fetchAPI('/options');
  return data.options || [];
}

export async function fetchOptionsByCategory(category: string): Promise<Option[]> {
  const data = await fetchAPI(`/options/${category}`);
  return data.options || [];
}

export async function createOrUpdateOption(option: Partial<Option>): Promise<Option> {
  const data = await fetchAPI('/options', {
    method: 'POST',
    body: JSON.stringify(option),
  });
  return data.option;
}

export async function deleteOption(id: string): Promise<void> {
  await fetchAPI(`/options/${id}`, {
    method: 'DELETE',
  });
}