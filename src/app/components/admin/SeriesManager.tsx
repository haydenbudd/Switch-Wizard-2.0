import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, AlertTriangle, Wrench, Loader2 } from 'lucide-react';
import { Product } from '@/app/lib/api';
import { toast } from 'sonner';

interface SeriesManagerProps {
  products: Product[];
  onProductUpdate: (id: string, data: Partial<Product>) => Promise<void>;
}

interface SeriesIssue {
  text: string;
  field: string;
  majorityValue: string;
  majorityCount: number;
  totalCount: number;
  affectedIds: string[];
}

interface SeriesGroup {
  name: string;
  products: Product[];
  issues: SeriesIssue[];
}

function getMajority(values: { value: string; id: string }[]): { majorityValue: string; majorityCount: number; affectedIds: string[] } {
  const counts = new Map<string, string[]>();
  for (const { value, id } of values) {
    const list = counts.get(value) || [];
    list.push(id);
    counts.set(value, list);
  }
  let best = '';
  let bestIds: string[] = [];
  for (const [val, ids] of counts) {
    if (ids.length > bestIds.length) {
      best = val;
      bestIds = ids;
    }
  }
  // Affected = those NOT matching majority
  const affectedIds = values.filter(v => v.value !== best).map(v => v.id);
  return { majorityValue: best, majorityCount: bestIds.length, affectedIds };
}

export function SeriesManager({ products, onProductUpdate }: SeriesManagerProps) {
  const [expandedSeries, setExpandedSeries] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'issues'>('all');
  const [fixing, setFixing] = useState<string | null>(null); // "seriesName:field"
  const [confirming, setConfirming] = useState<{ series: string; issue: SeriesIssue } | null>(null);

  const groups = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of products) {
      const list = map.get(p.series) || [];
      list.push(p);
      map.set(p.series, list);
    }

    const result: SeriesGroup[] = [];
    for (const [name, prods] of map) {
      const issues: SeriesIssue[] = [];

      // Check for mixed duty
      const duties = new Set(prods.map(p => p.duty));
      if (duties.size > 1) {
        const maj = getMajority(prods.map(p => ({ value: p.duty, id: p.id })));
        issues.push({
          text: `Mixed duty: ${[...duties].join(', ')}`,
          field: 'duty',
          majorityValue: maj.majorityValue,
          majorityCount: maj.majorityCount,
          totalCount: prods.length,
          affectedIds: maj.affectedIds,
        });
      }

      // Check for mixed material
      const materials = new Set(prods.map(p => p.material).filter(Boolean));
      if (materials.size > 1) {
        const withMaterial = prods.filter(p => p.material);
        const maj = getMajority(withMaterial.map(p => ({ value: p.material, id: p.id })));
        issues.push({
          text: `Mixed material: ${[...materials].join(', ')}`,
          field: 'material',
          majorityValue: maj.majorityValue,
          majorityCount: maj.majorityCount,
          totalCount: withMaterial.length,
          affectedIds: maj.affectedIds,
        });
      }

      // Check for mixed technology
      const techs = new Set(prods.map(p => p.technology));
      if (techs.size > 1) {
        const maj = getMajority(prods.map(p => ({ value: p.technology, id: p.id })));
        issues.push({
          text: `Mixed technology: ${[...techs].join(', ')}`,
          field: 'technology',
          majorityValue: maj.majorityValue,
          majorityCount: maj.majorityCount,
          totalCount: prods.length,
          affectedIds: maj.affectedIds,
        });
      }

      // Check for mixed IP
      const ips = new Set(prods.map(p => p.ip).filter(Boolean));
      if (ips.size > 1) {
        const withIp = prods.filter(p => p.ip);
        const maj = getMajority(withIp.map(p => ({ value: p.ip, id: p.id })));
        issues.push({
          text: `Mixed IP: ${[...ips].join(', ')}`,
          field: 'ip',
          majorityValue: maj.majorityValue,
          majorityCount: maj.majorityCount,
          totalCount: withIp.length,
          affectedIds: maj.affectedIds,
        });
      }

      result.push({ name, products: prods, issues });
    }

    return result.sort((a, b) => b.products.length - a.products.length);
  }, [products]);

  const filtered = filter === 'issues' ? groups.filter(g => g.issues.length > 0) : groups;
  const issueCount = groups.filter(g => g.issues.length > 0).length;

  const handleFix = async (series: string, issue: SeriesIssue) => {
    const key = `${series}:${issue.field}`;
    setFixing(key);
    try {
      for (const id of issue.affectedIds) {
        await onProductUpdate(id, { [issue.field]: issue.majorityValue });
      }
      toast.success(`Updated ${issue.affectedIds.length} products in "${series}" — ${issue.field} set to "${issue.majorityValue}"`);
      setConfirming(null);
    } catch {
      toast.error(`Failed to update ${issue.field} for "${series}"`);
    } finally {
      setFixing(null);
    }
  };

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
                    {group.issues.map((issue, i) => {
                      const key = `${group.name}:${issue.field}`;
                      const isFixing = fixing === key;
                      const isConfirming = confirming?.series === group.name && confirming?.issue.field === issue.field;

                      return (
                        <div key={i} className="flex items-center gap-2 text-sm bg-amber-50 dark:bg-amber-950/20 px-3 py-2 rounded">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                          <span className="flex-1 text-amber-600 dark:text-amber-400">{issue.text}</span>

                          {isConfirming ? (
                            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5">
                              <span className="text-xs text-gray-700 dark:text-gray-300">
                                Set {issue.affectedIds.length} products to <strong>{issue.majorityValue}</strong>?
                              </span>
                              <button
                                className="px-2 py-0.5 text-xs font-medium bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center gap-1"
                                onClick={() => handleFix(group.name, issue)}
                                disabled={isFixing}
                              >
                                {isFixing && <Loader2 className="w-3 h-3 animate-spin" />}
                                Confirm
                              </button>
                              <button
                                className="px-2 py-0.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                onClick={() => setConfirming(null)}
                                disabled={isFixing}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded"
                              onClick={() => setConfirming({ series: group.name, issue })}
                              title={`Set all to "${issue.majorityValue}" (${issue.majorityCount}/${issue.totalCount})`}
                            >
                              <Wrench className="w-3 h-3" />
                              Fix
                            </button>
                          )}
                        </div>
                      );
                    })}
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
