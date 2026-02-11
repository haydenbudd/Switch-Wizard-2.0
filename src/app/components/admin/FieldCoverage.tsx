import { useMemo } from 'react';
import { Product } from '@/app/lib/api';

interface FieldCoverageProps {
  products: Product[];
}

interface FieldStat {
  field: string;
  label: string;
  filled: number;
  total: number;
  percent: number;
}

export function FieldCoverage({ products }: FieldCoverageProps) {
  const stats = useMemo(() => {
    const total = products.length;
    if (total === 0) return [];

    const fields: { field: string; label: string; check: (p: Product) => boolean }[] = [
      { field: 'part_number', label: 'Part Number', check: p => !!p.part_number },
      { field: 'description', label: 'Description', check: p => !!p.description },
      { field: 'image', label: 'Image URL', check: p => !!p.image },
      { field: 'link', label: 'Product Link', check: p => !!p.link },
      { field: 'material', label: 'Material', check: p => !!p.material },
      { field: 'ip', label: 'IP Rating', check: p => !!p.ip },
      { field: 'connector_type', label: 'Connector Type', check: p => !!p.connector_type },
      { field: 'voltage', label: 'Voltage', check: p => !!p.voltage },
      { field: 'amperage', label: 'Amperage', check: p => !!p.amperage },
      { field: 'certifications', label: 'Certifications', check: p => !!p.certifications },
      { field: 'actions', label: 'Actions (non-empty)', check: p => p.actions && p.actions.length > 0 },
      { field: 'applications', label: 'Applications', check: p => p.applications && p.applications.length > 0 },
      { field: 'color', label: 'Color', check: p => !!p.color },
      { field: 'circuitry', label: 'Circuitry', check: p => !!p.circuitry },
      { field: 'stages', label: 'Stages', check: p => !!p.stages },
      { field: 'configuration', label: 'Configuration', check: p => !!p.configuration },
    ];

    const result: FieldStat[] = fields.map(({ field, label, check }) => {
      const filled = products.filter(check).length;
      return { field, label, filled, total, percent: Math.round((filled / total) * 100) };
    });

    return result.sort((a, b) => a.percent - b.percent);
  }, [products]);

  const barColor = (percent: number) => {
    if (percent >= 90) return 'bg-emerald-500';
    if (percent >= 70) return 'bg-blue-500';
    if (percent >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Field</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 w-1/2">Coverage</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Filled</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Missing</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((stat) => (
              <tr key={stat.field} className="border-t border-gray-100 dark:border-gray-700">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{stat.label}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${barColor(stat.percent)}`}
                        style={{ width: `${stat.percent}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                      {stat.percent}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-right">{stat.filled}</td>
                <td className="px-4 py-3 text-sm text-right">
                  <span className={stat.total - stat.filled > 0 ? 'text-red-500 font-medium' : 'text-gray-400'}>
                    {stat.total - stat.filled}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
