import { useMemo, useState } from 'react';
import { AlertTriangle, AlertCircle, Info, ChevronDown, ChevronRight, Pencil, Check, X, ExternalLink } from 'lucide-react';
import { Product } from '@/app/lib/api';
import { toast } from 'sonner';

const EDITABLE_FIELDS = new Set(['image', 'description', 'link', 'material', 'ip', 'connector_type', 'voltage']);

interface DataAuditProps {
  products: Product[];
  onProductUpdate: (id: string, data: Partial<Product>) => Promise<void>;
  onEditProduct: (product: Product) => void;
}

interface Issue {
  severity: 'error' | 'warning' | 'info';
  field: string;
  message: string;
  products: { id: string; series: string; part_number?: string }[];
}

export function DataAudit({ products, onProductUpdate, onEditProduct }: DataAuditProps) {
  const [expandedIssue, setExpandedIssue] = useState<number | null>(null);
  const [editing, setEditing] = useState<{ id: string; field: string; value: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const issues = useMemo(() => {
    const result: Issue[] = [];

    const noImage = products.filter(p => !p.image);
    if (noImage.length > 0) {
      result.push({
        severity: 'error',
        field: 'image',
        message: `${noImage.length} products missing image URL`,
        products: noImage.map(p => ({ id: p.id, series: p.series, part_number: p.part_number })),
      });
    }

    const noDesc = products.filter(p => !p.description);
    if (noDesc.length > 0) {
      result.push({
        severity: 'error',
        field: 'description',
        message: `${noDesc.length} products missing description`,
        products: noDesc.map(p => ({ id: p.id, series: p.series, part_number: p.part_number })),
      });
    }

    const noLink = products.filter(p => !p.link);
    if (noLink.length > 0) {
      result.push({
        severity: 'warning',
        field: 'link',
        message: `${noLink.length} products missing product page link`,
        products: noLink.map(p => ({ id: p.id, series: p.series, part_number: p.part_number })),
      });
    }

    const noMaterial = products.filter(p => !p.material);
    if (noMaterial.length > 0) {
      result.push({
        severity: 'warning',
        field: 'material',
        message: `${noMaterial.length} products missing material`,
        products: noMaterial.map(p => ({ id: p.id, series: p.series, part_number: p.part_number })),
      });
    }

    const noIP = products.filter(p => !p.ip);
    if (noIP.length > 0) {
      result.push({
        severity: 'warning',
        field: 'ip',
        message: `${noIP.length} products missing IP rating`,
        products: noIP.map(p => ({ id: p.id, series: p.series, part_number: p.part_number })),
      });
    }

    const noConnector = products.filter(p => !p.connector_type);
    if (noConnector.length > 0) {
      result.push({
        severity: 'info',
        field: 'connector_type',
        message: `${noConnector.length} products missing connector type`,
        products: noConnector.map(p => ({ id: p.id, series: p.series, part_number: p.part_number })),
      });
    }

    const noActions = products.filter(p => !p.actions || p.actions.length === 0);
    if (noActions.length > 0) {
      result.push({
        severity: 'error',
        field: 'actions',
        message: `${noActions.length} products have no actions defined`,
        products: noActions.map(p => ({ id: p.id, series: p.series, part_number: p.part_number })),
      });
    }

    const partMap = new Map<string, Product[]>();
    for (const p of products) {
      if (p.part_number) {
        const existing = partMap.get(p.part_number) || [];
        existing.push(p);
        partMap.set(p.part_number, existing);
      }
    }
    const dupes = [...partMap.entries()].filter(([, v]) => v.length > 1);
    if (dupes.length > 0) {
      const allDupes = dupes.flatMap(([, v]) => v);
      result.push({
        severity: 'error',
        field: 'part_number',
        message: `${dupes.length} duplicate part numbers (${allDupes.length} products)`,
        products: allDupes.map(p => ({ id: p.id, series: p.series, part_number: p.part_number })),
      });
    }

    const noVoltage = products.filter(p => !p.voltage);
    if (noVoltage.length > 0) {
      result.push({
        severity: 'info',
        field: 'voltage',
        message: `${noVoltage.length} products missing voltage spec`,
        products: noVoltage.map(p => ({ id: p.id, series: p.series, part_number: p.part_number })),
      });
    }

    return result.sort((a, b) => {
      const order = { error: 0, warning: 1, info: 2 };
      return order[a.severity] - order[b.severity];
    });
  }, [products]);

  const severityCounts = useMemo(() => {
    const counts = { error: 0, warning: 0, info: 0 };
    for (const issue of issues) counts[issue.severity]++;
    return counts;
  }, [issues]);

  const handleSave = async () => {
    if (!editing || !editing.value.trim()) return;
    setSaving(true);
    try {
      await onProductUpdate(editing.id, { [editing.field]: editing.value.trim() });
      toast.success('Product updated');
      setEditing(null);
    } catch {
      toast.error('Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const handleEditFullProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) onEditProduct(product);
  };

  const isEditable = (field: string) => EDITABLE_FIELDS.has(field);

  const SeverityIcon = ({ severity }: { severity: Issue['severity'] }) => {
    if (severity === 'error') return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (severity === 'warning') return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    return <Info className="w-4 h-4 text-blue-500" />;
  };

  const severityBg = (severity: Issue['severity']) => {
    if (severity === 'error') return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800';
    if (severity === 'warning') return 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800';
    return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800';
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <AlertCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{severityCounts.error}</p>
          <p className="text-sm text-gray-500">Errors</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{severityCounts.warning}</p>
          <p className="text-sm text-gray-500">Warnings</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <Info className="w-5 h-5 text-blue-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{severityCounts.info}</p>
          <p className="text-sm text-gray-500">Info</p>
        </div>
      </div>

      {/* Issues list */}
      {issues.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          All products pass data quality checks.
        </div>
      ) : (
        <div className="space-y-2">
          {issues.map((issue, idx) => (
            <div key={idx} className={`rounded-lg border ${severityBg(issue.severity)}`}>
              <button
                className="w-full flex items-center gap-3 p-4 text-left"
                onClick={() => setExpandedIssue(expandedIssue === idx ? null : idx)}
              >
                <SeverityIcon severity={issue.severity} />
                <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white">{issue.message}</span>
                <span className="text-xs text-gray-500 px-2 py-0.5 bg-white/50 dark:bg-black/20 rounded-full">
                  {issue.field}
                </span>
                {expandedIssue === idx ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>
              {expandedIssue === idx && (
                <div className="px-4 pb-4">
                  <div className="max-h-80 overflow-auto rounded border border-gray-200 dark:border-gray-700">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800">
                          <th className="px-3 py-2 text-left text-gray-500">Series</th>
                          <th className="px-3 py-2 text-left text-gray-500">Part Number</th>
                          {isEditable(issue.field) && (
                            <th className="px-3 py-2 text-left text-gray-500">Fix {issue.field}</th>
                          )}
                          <th className="px-3 py-2 text-right text-gray-500 w-20">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {issue.products.map((p) => {
                          const isEditingThis = editing?.id === p.id && editing?.field === issue.field;
                          return (
                            <tr key={p.id} className="border-t border-gray-100 dark:border-gray-700">
                              <td className="px-3 py-1.5 text-gray-900 dark:text-white">{p.series}</td>
                              <td className="px-3 py-1.5 text-gray-600 dark:text-gray-400">{p.part_number || '—'}</td>
                              {isEditable(issue.field) && (
                                <td className="px-3 py-1.5">
                                  {isEditingThis ? (
                                    <input
                                      type="text"
                                      autoFocus
                                      className="w-full px-2 py-1 text-sm border border-blue-300 dark:border-blue-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      value={editing.value}
                                      onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSave();
                                        if (e.key === 'Escape') setEditing(null);
                                      }}
                                      placeholder={`Enter ${issue.field}...`}
                                    />
                                  ) : (
                                    <span className="text-gray-400 italic text-xs">empty</span>
                                  )}
                                </td>
                              )}
                              <td className="px-3 py-1.5 text-right">
                                {isEditingThis ? (
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 disabled:opacity-50"
                                      onClick={handleSave}
                                      disabled={saving || !editing.value.trim()}
                                      title="Save"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"
                                      onClick={() => setEditing(null)}
                                      title="Cancel"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : isEditable(issue.field) ? (
                                  <button
                                    className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                    onClick={() => setEditing({ id: p.id, field: issue.field, value: '' })}
                                    title={`Edit ${issue.field}`}
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <button
                                    className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                    onClick={() => handleEditFullProduct(p.id)}
                                    title="Edit full product"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
