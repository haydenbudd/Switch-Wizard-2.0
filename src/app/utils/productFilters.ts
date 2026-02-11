import { Product } from '@/app/lib/api';

export interface FilterOptions {
  searchTerm: string;
  dutyFilter: string[];
  cordedFilter: 'all' | 'corded' | 'cordless';
  sortBy: 'relevance' | 'duty' | 'ip';
  selectedEnvironment?: string;
}

export const filterProductsBySearch = (products: Product[], searchTerm: string): Product[] => {
  if (!searchTerm.trim()) return products;
  const term = searchTerm.toLowerCase();
  return products.filter(p =>
    p.series.toLowerCase().includes(term) ||
    p.description.toLowerCase().includes(term) ||
    p.material.toLowerCase().includes(term) ||
    p.ip.toLowerCase().includes(term) ||
    p.part_number?.toLowerCase().includes(term) ||
    p.id.toLowerCase().includes(term) ||
    (p.features && p.features.some(f => f.toLowerCase().includes(term)))
  );
};

export const filterProductsByDuty = (products: Product[], dutyFilter: string[]): Product[] => {
  if (dutyFilter.length === 0) return products;
  return products.filter(p => dutyFilter.includes(p.duty));
};

export const filterProductsByConnection = (products: Product[], cordedFilter: 'all' | 'corded' | 'cordless'): Product[] => {
  if (cordedFilter === 'all') return products;

  return products.filter(p => {
    // Check if product has connector_type field populated
    if (!p.connector_type || p.connector_type === 'undefined') {
      // If no connection data, show in both results until database is populated
      return true;
    }

    // Normalize connector_type value to lowercase for comparison
    const connection = p.connector_type.toLowerCase();

    // Pre-wired products come with a cord attached, ready to connect
    const hasPrewiredCord =
      connection.includes('pre-wired') ||
      connection.includes('prong') ||
      connection.includes('plug');

    // Not pre-wired (customer must wire): screw terminals, quick-connect terminals
    const isNotPrewired =
      connection.includes('screw') ||
      connection.includes('quick') ||
      connection.includes('terminal');

    if (cordedFilter === 'corded') {
      return hasPrewiredCord;
    } else {
      return isNotPrewired;
    }
  });
};

export const isProductEnvironmentMatch = (product: Product, selectedEnvironment?: string) => {
  if (!selectedEnvironment) return false;
  if (selectedEnvironment === 'any') return true; // No preference — all products match
  if (selectedEnvironment === 'dry') return true; // Dry: any IP rating is sufficient
  if (selectedEnvironment === 'damp') return ['IP56', 'IP68'].includes(product.ip);
  if (selectedEnvironment === 'wet') return product.ip === 'IP68';
  return false;
};

export const sortProducts = (products: Product[], sortBy: 'relevance' | 'duty' | 'ip', selectedEnvironment?: string): Product[] => {
  const sorted = [...products]; // Copy array

  if (sortBy === 'duty') {
    const dutyOrder: Record<string, number> = { heavy: 0, medium: 1, light: 2 };
    sorted.sort((a, b) => {
      // Environment match takes priority if provided
      if (selectedEnvironment) {
        const aMatchesEnv = isProductEnvironmentMatch(a, selectedEnvironment);
        const bMatchesEnv = isProductEnvironmentMatch(b, selectedEnvironment);
        if (aMatchesEnv && !bMatchesEnv) return -1;
        if (!aMatchesEnv && bMatchesEnv) return 1;
      }
      return (dutyOrder[a.duty] ?? 3) - (dutyOrder[b.duty] ?? 3);
    });
  } else if (sortBy === 'ip') {
    sorted.sort((a, b) => {
      // Environment match takes priority if provided
      if (selectedEnvironment) {
        const aMatchesEnv = isProductEnvironmentMatch(a, selectedEnvironment);
        const bMatchesEnv = isProductEnvironmentMatch(b, selectedEnvironment);
        if (aMatchesEnv && !bMatchesEnv) return -1;
        if (!aMatchesEnv && bMatchesEnv) return 1;
      }
      const ipA = parseInt(a.ip.replace(/\D/g, '')) || 0;
      const ipB = parseInt(b.ip.replace(/\D/g, '')) || 0;
      return ipB - ipA; // Higher IP rating first
    });
  } else {
    // relevance: prioritize environment match if selected
    if (selectedEnvironment) {
      sorted.sort((a, b) => {
        const aMatchesEnv = isProductEnvironmentMatch(a, selectedEnvironment);
        const bMatchesEnv = isProductEnvironmentMatch(b, selectedEnvironment);
        if (aMatchesEnv && !bMatchesEnv) return -1;
        if (!aMatchesEnv && bMatchesEnv) return 1;
        return 0;
      });
    }
  }

  return sorted;
};

export const getProcessedProducts = (products: Product[], options: FilterOptions): Product[] => {
  let filtered = products;
  filtered = filterProductsBySearch(filtered, options.searchTerm);
  filtered = filterProductsByDuty(filtered, options.dutyFilter);
  filtered = filterProductsByConnection(filtered, options.cordedFilter);
  filtered = sortProducts(filtered, options.sortBy, options.selectedEnvironment);
  return filtered;
};

