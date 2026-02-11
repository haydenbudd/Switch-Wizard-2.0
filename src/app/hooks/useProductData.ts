import type { ElementType } from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchProducts, Product, Option } from '@/app/lib/api';
import type { Option as DataOption } from '@/app/data/options';
import {
  categories as staticCategories,
  applications as staticApplications,
  technologies as staticTechnologies,
  actions as staticActions,
  environments as staticEnvironments,
  features as staticFeatures,
  consoleStyles as staticConsoleStyles,
  pedalCounts as staticPedalCounts,
  medicalTechnicalFeatures as staticMedicalTechnicalFeatures,
  accessories as staticAccessories,
  guards as staticGuards,
  materials as staticMaterials,
  duties as staticDuties,
  connections as staticConnections,
} from '@/app/data/options';
import { products as staticProducts } from '@/app/data/products';

// Extend Option to allow component icons (e.g. Lucide icons)
interface OptionWithIcon extends Omit<Option, 'icon'> {
  icon?: ElementType;
  isMedical?: boolean;
  availableFor?: string[];
  hideFor?: string[];
  parentCategory?: string;
}

// Helper to process options without destroying React component icons
function processOption(opt: DataOption): OptionWithIcon {
  return {
    id: opt.id,
    category: opt.category || '',
    label: opt.label,
    description: opt.description,
    // Preserve the icon component if it exists
    icon: opt.icon,
    isMedical: opt.isMedical || false,
    availableFor: opt.availableFor || undefined,
    hideFor: opt.hideFor || undefined,
    parentCategory: opt.parentCategory || undefined,
    sortOrder: opt.sortOrder || 0,
  };
}

interface ProductData {
  products: Product[];
  categories: OptionWithIcon[];
  applications: OptionWithIcon[];
  technologies: OptionWithIcon[];
  actions: OptionWithIcon[];
  environments: OptionWithIcon[];
  features: OptionWithIcon[];
  consoleStyles: OptionWithIcon[];
  pedalCounts: OptionWithIcon[];
  guards: OptionWithIcon[];
  medicalTechnicalFeatures: OptionWithIcon[];
  accessories: OptionWithIcon[];
  materials: OptionWithIcon[];
  connections: OptionWithIcon[];
  duties: OptionWithIcon[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

// Pre-compute static option data so the wizard renders instantly
const staticOptionData = {
  categories: staticCategories.map(processOption),
  applications: staticApplications.map(processOption),
  technologies: staticTechnologies.map(processOption),
  actions: staticActions.map(processOption),
  environments: staticEnvironments.map(processOption),
  features: staticFeatures.map(processOption),
  consoleStyles: staticConsoleStyles.map(processOption),
  pedalCounts: staticPedalCounts.map(processOption),
  medicalTechnicalFeatures: staticMedicalTechnicalFeatures.map(processOption),
  accessories: staticAccessories.map(processOption),
  guards: staticGuards.map(processOption),
  // Add static materials, duties, and connections to the map for lookup
  materials: staticMaterials.map(processOption),
  duties: staticDuties.map(processOption),
  connections: staticConnections.map(processOption),
};

export function useProductData(): ProductData {
  // Initialize with static data so the wizard is usable immediately
  const [products, setProducts] = useState<Product[]>(staticProducts as Product[]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);

      const productsData = await fetchProducts();

      if (signal?.aborted) return;
      // Use API products if available, otherwise keep static fallback
      setProducts(productsData.length > 0 ? productsData : staticProducts as Product[]);
    } catch (err) {
      if (signal?.aborted) return;
      console.warn('API fetch failed, using static fallback data:', err);
      setProducts(staticProducts as Product[]);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [loadData]);

  // Derive unique materials from product data with user-friendly descriptions
  const materials: OptionWithIcon[] = useMemo(() => {
    const metaMap = new Map(staticOptionData.materials.map(m => [m.id, m]));

    const seen = new Set<string>();
    return products
      .filter(p => {
        if (seen.has(p.material)) return false;
        seen.add(p.material);
        return true;
      })
      .map(p => {
        const meta = metaMap.get(p.material);
        return {
          id: p.material,
          category: 'material',
          label: p.material,
          description: meta?.description || '',
          icon: meta?.icon,
          sortOrder: meta?.sortOrder || 99,
        };
      })
      .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));
  }, [products]);

  // Derive unique connection types from product data with rich metadata
  const connections: OptionWithIcon[] = useMemo(() => {
    const metaMap = new Map(staticOptionData.connections.map(c => [c.id, c]));

    const seen = new Set<string>();
    return products
      .filter(p => p.connector_type && p.connector_type !== 'undefined')
      .filter(p => {
        if (seen.has(p.connector_type!)) return false;
        seen.add(p.connector_type!);
        return true;
      })
      .map(p => {
        const meta = metaMap.get(p.connector_type!);
        return {
          id: p.connector_type!,
          category: 'connection',
          label: meta?.label || p.connector_type!.replace(/-/g, ' '),
          description: meta?.description || '',
          icon: meta?.icon,
          sortOrder: meta?.sortOrder || 99,
        };
      })
      .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));
  }, [products]);

  // Derive unique duty ratings with user-friendly descriptions
  const duties: OptionWithIcon[] = useMemo(() => {
    const metaMap = new Map(staticOptionData.duties.map(d => [d.id, d]));

    const seen = new Set<string>();
    return products
      .filter(p => {
        if (seen.has(p.duty)) return false;
        seen.add(p.duty);
        return true;
      })
      .map(p => {
        const meta = metaMap.get(p.duty);
        return {
          id: p.duty,
          category: 'duty',
          label: meta?.label || p.duty.charAt(0).toUpperCase() + p.duty.slice(1),
          description: meta?.description || '',
          icon: meta?.icon,
          sortOrder: meta?.sortOrder || 99,
        };
      })
      .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));
  }, [products]);

  // Always use static data for wizard options — these define the UX flow and must always be available.
  // API options could supplement in the future but should never be the sole source.
  return {
    products,
    categories: staticOptionData.categories,
    applications: staticOptionData.applications,
    technologies: staticOptionData.technologies,
    actions: staticOptionData.actions,
    environments: staticOptionData.environments,
    features: staticOptionData.features,
    consoleStyles: staticOptionData.consoleStyles,
    pedalCounts: staticOptionData.pedalCounts,
    guards: staticOptionData.guards,
    medicalTechnicalFeatures: staticOptionData.medicalTechnicalFeatures,
    accessories: staticOptionData.accessories,
    materials,
    connections,
    duties,
    loading,
    error,
    refresh: loadData,
  };
}
