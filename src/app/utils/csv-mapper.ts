import { RawProductCSVRow } from '@/app/types/csv-types';
import { Product } from '@/app/lib/api';

export type ImportTemplateRow = RawProductCSVRow;

export function mapCsvRowToProduct(row: ImportTemplateRow): Product {
  // Parse pedals safely
  const pedalsInput = row['Number of Pedals'] || '1';
  const pedals = parseInt(pedalsInput.toString().replace(/[^0-9]/g, '') || '1', 10);

  // Parse amperage safely
  const ampString = row['125VAC Rating'] || row.amperage || '0';
  const amperage = parseFloat(ampString.toString().replace(/[^0-9.]/g, '') || '0');

  // Normalize IP rating
  const ipRating = row['IP Rating'] || row.ip || '';

  return {
    id: row.Part || row.id || `generated-${Math.random().toString(36).substr(2, 9)}`,
    series: row.Series || row.series || '',
    
    // Map 'Part' to 'part_number' as per API interface
    part_number: row.Part || row.part_number || '', 
    
    // Split comma-separated lists into arrays
    applications: row.applications ? row.applications.split(',').map((s: string) => s.trim().toLowerCase()) : [],
    actions: row['On/Off'] ? [row['On/Off'].toLowerCase()] : (row.actions ? row.actions.split(',').map((s: string) => s.trim().toLowerCase()) : []),
    
    // Normalize Technology
    technology: row.Type || row.technology || 'Electric',
    
    // Parse Numbers
    pedal_count: pedals, // Map to API property
    
    // Store original if needed for UI helpers
    pedals: pedals, // Keep for compatibility if UI uses this
    
    amperage: amperage.toString(),
    voltage: row.voltage || row['125VAC Rating'] || '', // Fallback or mapping
    
    // Misc
    ip: ipRating,
    ipRating: ipRating, // Keep both for compatibility
    
    material: row.Material || row.material || '',
    description: row.description || row.Notes || '',
    
    // Images
    image: row.image || row.Link || '',
    link: row.Link || row.link || '',
    
    // Store original raw data if needed for display
    features: [
        row.Wireless ? 'Wireless' : '',
        row.Guard === 'Yes' ? 'Shield' : '',
        row.Linear === 'Yes' ? 'Linear' : ''
    ].filter(Boolean),
    
    // Extra fields
    circuitry: row['Circuits Controlled'],
    color: row.Color,
    guard: row.Guard === 'Yes',
    certifications: row.certifications ? row.certifications.split(',') : []
    
  } as unknown as Product; 
}
