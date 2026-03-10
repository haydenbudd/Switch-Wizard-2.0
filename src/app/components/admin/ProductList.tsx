import { useState, useMemo } from 'react';
import { Product } from '@/app/lib/api';
import { getProxiedImageUrl } from '@/app/utils/imageProxy';
import { Button } from '@/app/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Edit2, Trash2, ExternalLink, X } from 'lucide-react';
import {
  colorClasses,
  getTechColor,
  getDutyColor,
  getIpColor,
  getMaterialColor,
  getConnectionColor,
} from '@/app/lib/attributeColors';

interface ProductListProps {
  products: Product[];
  loading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

// Tiny filter select component
function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs px-2 text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-primary"
      aria-label={`Filter by ${label}`}
    >
      <option value="">{label}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export function ProductList({ products, loading, onEdit, onDelete }: ProductListProps) {
  const [techFilter, setTechFilter] = useState('');
  const [dutyFilter, setDutyFilter] = useState('');
  const [ipFilter, setIpFilter] = useState('');
  const [materialFilter, setMaterialFilter] = useState('');
  const [seriesFilter, setSeriesFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Derive unique values for each filter
  const filterOptions = useMemo(() => {
    const techs = new Set<string>();
    const duties = new Set<string>();
    const ips = new Set<string>();
    const materials = new Set<string>();
    const seriesNames = new Set<string>();

    for (const p of products) {
      if (p.technology) techs.add(p.technology);
      if (p.duty) duties.add(p.duty);
      if (p.ip) ips.add(p.ip);
      if (p.material) materials.add(p.material);
      if (p.series) seriesNames.add(p.series);
    }

    return {
      techs: [...techs].sort(),
      duties: [...duties].sort(),
      ips: [...ips].sort(),
      materials: [...materials].sort(),
      series: [...seriesNames].sort(),
    };
  }, [products]);

  const activeFilterCount = [techFilter, dutyFilter, ipFilter, materialFilter, seriesFilter, searchQuery].filter(Boolean).length;

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesPartNumber = p.part_number?.toLowerCase().includes(q);
        const matchesSeries = p.series?.toLowerCase().includes(q);
        if (!matchesPartNumber && !matchesSeries) return false;
      }
      if (techFilter && p.technology !== techFilter) return false;
      if (dutyFilter && p.duty !== dutyFilter) return false;
      if (ipFilter && p.ip !== ipFilter) return false;
      if (materialFilter && p.material !== materialFilter) return false;
      if (seriesFilter && p.series !== seriesFilter) return false;
      return true;
    });
  }, [products, searchQuery, techFilter, dutyFilter, ipFilter, materialFilter, seriesFilter]);

  const clearFilters = () => {
    setTechFilter('');
    setDutyFilter('');
    setIpFilter('');
    setMaterialFilter('');
    setSeriesFilter('');
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-lg border border-dashed">
        <p className="text-gray-500">No products found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search part # or series..."
          className="h-8 w-48 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs px-2 text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-primary"
        />
        <FilterSelect label="Series" value={seriesFilter} options={filterOptions.series} onChange={setSeriesFilter} />
        <FilterSelect label="Technology" value={techFilter} options={filterOptions.techs} onChange={setTechFilter} />
        <FilterSelect label="Duty" value={dutyFilter} options={filterOptions.duties} onChange={setDutyFilter} />
        <FilterSelect label="IP Rating" value={ipFilter} options={filterOptions.ips} onChange={setIpFilter} />
        <FilterSelect label="Material" value={materialFilter} options={filterOptions.materials} onChange={setMaterialFilter} />

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs gap-1 text-muted-foreground">
            <X className="w-3 h-3" />
            Clear {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
          </Button>
        )}

        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} of {products.length} products
        </span>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Image</TableHead>
              <TableHead>Series / Part #</TableHead>
              <TableHead>Attributes</TableHead>
              <TableHead>Applications</TableHead>
              <TableHead className="text-right w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <img
                    src={getProxiedImageUrl(product.image)}
                    alt={product.series}
                    className="w-10 h-10 object-contain rounded bg-gray-50"
                    onError={(e) => { e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="%23f3f4f6" width="200" height="200"/><text x="100" y="108" text-anchor="middle" fill="%239ca3af" font-size="14" font-family="system-ui">No Image</text></svg>'; }}
                  />
                </TableCell>
                <TableCell>
                  <div className="font-medium">{product.series}</div>
                  {product.part_number && (
                    <div className="text-xs text-muted-foreground font-mono">#{product.part_number}</div>
                  )}
                  {product.flagship && (
                    <Badge variant="secondary" className="mt-1 text-[10px] bg-amber-100 text-amber-800 hover:bg-amber-100">
                      Flagship
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-[320px]">
                    <Badge variant="outline" className={`text-[10px] capitalize ${colorClasses(getTechColor(product.technology))}`}>
                      {product.technology}
                    </Badge>
                    <Badge variant="outline" className={`text-[10px] capitalize ${colorClasses(getDutyColor(product.duty))}`}>
                      {product.duty}
                    </Badge>
                    <Badge variant="outline" className={`text-[10px] ${colorClasses(getIpColor(product.ip))}`}>
                      {product.ip}
                    </Badge>
                    <Badge variant="outline" className={`text-[10px] capitalize ${colorClasses(getMaterialColor(product.material))}`}>
                      {product.material}
                    </Badge>
                    {product.connector_type && (
                      <Badge variant="outline" className={`text-[10px] capitalize ${colorClasses(getConnectionColor(product.connector_type))}`}>
                        {product.connector_type.replace(/-/g, ' ')}
                      </Badge>
                    )}
                    {product.circuitry && (
                      <Badge variant="outline" className="text-[10px]">
                        {product.circuitry}
                      </Badge>
                    )}
                    {product.stages && (
                      <Badge variant="outline" className="text-[10px]">
                        {product.stages}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-[180px]">
                    {product.applications.slice(0, 3).map(app => (
                      <Badge key={app} variant="secondary" className="text-[10px] capitalize">
                        {app}
                      </Badge>
                    ))}
                    {product.applications.length > 3 && (
                      <span className="text-xs text-muted-foreground">+{product.applications.length - 3}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" asChild title="View on site" className="h-8 w-8">
                      <a href={product.link} target="_blank" rel="noreferrer">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => onEdit(product)} title="Edit" className="h-8 w-8">
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => onDelete(product.id)} title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
