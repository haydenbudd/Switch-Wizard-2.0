import { useMemo } from 'react';
import { Product } from '@/app/lib/api';
import { getProcessedProducts, FilterOptions } from '@/app/utils/productFilters';

export function useProductFilter(products: Product[], options: FilterOptions): Product[] {
  return useMemo(() => {
    return getProcessedProducts(products, options);
  }, [products, options.searchTerm, options.dutyFilter, options.cordedFilter, options.sortBy, options.selectedEnvironment]);
}
