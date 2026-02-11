import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import { Product } from '@/app/lib/api';

interface SeriesManagerProps {
  products: Product[];
}

interface SeriesGroup {
  name: string;
  products: Product[];
  issues: string[];
}

export function SeriesManager({ products }: SeriesManagerProps) {
  const [expandedSeries, setExpandedSeries] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'issues'>('all');

  const groups = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of products) {
      const list = map.get(p.series) || [];
      list.push(p);
      map.set(p.series, list);
    }

    const result: SeriesGroup[] = [];
    for (const [name, prods] of map) {
      const issues: string[] = [];

      // Check for mixed duty within series
      const duties = new Set(prods.map(p => p.duty));
      if (duties.size > 1) issues.push(`Mixed duty: ${[...duties].join(', ')}`);

      // Check for mixed material
      const materials = new Set(prods.map(p => p.material).filter(Boolean));
      if (materials.size > 1) issues.push(`Mixed material: ${[...materials].join(', ')}`);

      // Check for mixed technology
      const techs = new Set(prods.map(p => p.technology));
      if (techs.size > 1) issues.push(`Mixed technology: ${[...techs].join(', ')}`);

      // Check for mixed IP
      const ips = new Set(prods.map(p => p.ip).filter(Boolean));
      if (ips.size > 1) issues.push(`Mixed IP: ${[...ips].join(', ')}`);

      result.push({ name, products: prods, issues });
    }

    return result.sort((a, b) => b.products.length - a.products.length);
  }, [products]);

  const filtered = filter === 'issues' ? groups.filter(g => g.issues.length > 0) : groups;
  const issueCount = groups.filter(g => g.issues.length > 0).length;

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">{groups.length} series total</span>
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            className={`px-3 py-1.5 text-sm ${filter === 'all' ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`px-3 py-1.5 text-sm flex items-center gap-1.5 ${filter === 'issues' ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            onClick={() => setFilter('issues')}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Issues ({issueCount})
          </button>
        </div>
      </div>

      {/* Series list */}
      <div className="space-y-1">
        {filtered.map((group) => (
          <div key={group.name} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <button
              className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-750"
              onClick={() => setExpandedSeries(expandedSeries === group.name ? null : group.name)}
            >
              {expandedSeries === group.name ? (
                <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
              )}
              <span className="font-medium text-gray-900 dark:text-white flex-1">{group.name}</span>
              {group.issues.length > 0 && (
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              )}
              <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                {group.products.length}
              </span>
            </button>

            {expandedSeries === group.name && (
              <div className="px-3 pb-3 space-y-3">
                {group.issues.length > 0 && (
                  <div className="space-y-1">
                    {group.issues.map((issue, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-3 py-1.5 rounded">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        {issue}
                      </div>
                    ))}
                  </div>
                )}
                <div className="overflow-auto rounded border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="px-3 py-2 text-left text-gray-500">Part #</th>
                        <th className="px-3 py-2 text-left text-gray-500">Tech</th>
                        <th className="px-3 py-2 text-left text-gray-500">Duty</th>
                        <th className="px-3 py-2 text-left text-gray-500">Material</th>
                        <th className="px-3 py-2 text-left text-gray-500">IP</th>
                        <th className="px-3 py-2 text-left text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.products.map((p) => (
                        <tr key={p.id} className="border-t border-gray-100 dark:border-gray-700">
                          <td className="px-3 py-1.5 text-gray-900 dark:text-white font-mono text-xs">{p.part_number || '—'}</td>
                          <td className="px-3 py-1.5 text-gray-600 dark:text-gray-400 capitalize">{p.technology}</td>
                          <td className="px-3 py-1.5 text-gray-600 dark:text-gray-400 capitalize">{p.duty}</td>
                          <td className="px-3 py-1.5 text-gray-600 dark:text-gray-400">{p.material || '—'}</td>
                          <td className="px-3 py-1.5 text-gray-600 dark:text-gray-400">{p.ip || '—'}</td>
                          <td className="px-3 py-1.5 text-gray-600 dark:text-gray-400">{p.actions.join(', ') || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
