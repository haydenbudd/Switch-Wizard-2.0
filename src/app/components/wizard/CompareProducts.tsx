import { Product } from '@/app/lib/api';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { X, ExternalLink, ChevronUp, ChevronDown, GitCompareArrows } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { getProxiedImageUrl } from '@/app/utils/imageProxy';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  colorClasses,
  getTechColor,
  getDutyColor,
  getIpColor,
  getMaterialColor,
  getConnectionColor,
  getFeatureColor,
  getCircuitColor,
} from '@/app/lib/attributeColors';

const MotionDiv = motion.div;

interface CompareProductsProps {
  products: Product[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemove: (id: string) => void;
}

const COMPARE_ROWS: { label: string; getValue: (p: Product) => string; getColor: (p: Product) => string }[] = [
  { label: 'Technology', getValue: (p) => p.technology, getColor: (p) => colorClasses(getTechColor(p.technology)) },
  { label: 'Duty Rating', getValue: (p) => p.duty, getColor: (p) => colorClasses(getDutyColor(p.duty)) },
  { label: 'IP Rating', getValue: (p) => p.ip, getColor: (p) => colorClasses(getIpColor(p.ip)) },
  { label: 'Material', getValue: (p) => p.material, getColor: (p) => colorClasses(getMaterialColor(p.material)) },
  { label: 'Circuit Count', getValue: (p) => p.circuitry || '—', getColor: (p) => p.circuitry ? colorClasses(getCircuitColor(p.circuitry)) : '' },
  { label: 'Connection', getValue: (p) => p.connector_type?.replace(/-/g, ' ') || '—', getColor: (p) => p.connector_type ? colorClasses(getConnectionColor(p.connector_type)) : '' },
  { label: 'Part Number', getValue: (p) => p.part_number || '—', getColor: () => '' },
  { label: 'Features', getValue: (p) => (p.features || []).map(f => f.replace('_', ' ')).join(', ') || '—', getColor: () => '' },
];

export function CompareProducts({ products, open, onOpenChange, onRemove }: CompareProductsProps) {
  const [expanded, setExpanded] = useState(false);

  if (products.length === 0) return null;

  return (
    <AnimatePresence>
      {products.length > 0 && (
        <MotionDiv
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50"
        >
          <div className="mx-auto max-w-7xl px-4 pb-4">
            <div className="rounded-2xl border border-border/60 bg-background/95 backdrop-blur-xl shadow-2xl shadow-black/20 overflow-hidden">

              {/* Collapsed bar — always visible */}
              <button
                onClick={() => {
                  if (products.length >= 2) {
                    setExpanded(prev => !prev);
                  }
                }}
                className="w-full flex items-center justify-between px-6 py-3.5 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-primary">
                    <GitCompareArrows className="w-6 h-6" />
                    <span className="!text-xl !font-semibold !text-primary">
                      Compare ({products.length})
                    </span>
                  </div>

                  {/* Mini product avatars */}
                  <div className="flex -space-x-2">
                    {products.map(p => (
                      <div
                        key={p.id}
                        className="w-11 h-11 rounded-full border-2 border-background bg-secondary flex items-center justify-center overflow-hidden"
                        title={p.series}
                      >
                        {p.image ? (
                          <ImageWithFallback
                            src={getProxiedImageUrl(p.image)}
                            alt={p.series}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-bold text-muted-foreground">{p.series.slice(0, 2)}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {products.length < 2 && (
                    <span className="!text-base !text-muted-foreground">Add {2 - products.length} more to compare</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {products.length >= 2 && (
                    expanded
                      ? <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      : <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Expanded comparison table */}
              <AnimatePresence>
                {expanded && products.length >= 2 && (
                  <MotionDiv
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-border/50 px-6 py-5 max-h-[60vh] overflow-y-auto">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px] border-collapse">
                          <thead>
                            <tr>
                              <th className="text-left p-4 !text-lg !font-medium !text-muted-foreground w-52" />
                              {products.map((product) => (
                                <th key={product.id} className="p-4 text-center min-w-[220px]">
                                  <div className="flex flex-col items-center gap-3">
                                    {product.image && (
                                      <div className="w-36 h-28 flex items-center justify-center">
                                        <ImageWithFallback
                                          src={getProxiedImageUrl(product.image)}
                                          alt={product.series}
                                          className="max-w-full max-h-full object-contain"
                                        />
                                      </div>
                                    )}
                                    <span className="!text-2xl !font-bold">{product.series}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="!text-sm !text-muted-foreground h-8 px-3"
                                      onClick={() => onRemove(product.id)}
                                    >
                                      <X className="w-4 h-4 mr-1" /> Remove
                                    </Button>
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {COMPARE_ROWS.map((row) => (
                              <tr key={row.label} className="border-t border-border/50">
                                <td className="p-4 !text-lg !font-medium !text-muted-foreground">{row.label}</td>
                                {products.map((product) => {
                                  const value = row.getValue(product);
                                  const color = row.getColor(product);
                                  // For the Features row, render individual colored badges
                                  if (row.label === 'Features' && product.features && product.features.length > 0) {
                                    return (
                                      <td key={product.id} className="p-4 text-center">
                                        <div className="flex flex-wrap justify-center gap-1.5">
                                          {product.features.map((f) => (
                                            <Badge
                                              key={f}
                                              variant="secondary"
                                              className={`!text-base capitalize font-normal px-3 py-1 ${colorClasses(getFeatureColor(f))}`}
                                            >
                                              {f.replace('_', ' ')}
                                            </Badge>
                                          ))}
                                        </div>
                                      </td>
                                    );
                                  }
                                  return (
                                    <td key={product.id} className="p-4 text-center">
                                      <Badge
                                        variant="secondary"
                                        className={`!text-base capitalize font-normal px-3 py-1 ${color}`}
                                      >
                                        {value}
                                      </Badge>
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                            {/* Link row */}
                            <tr className="border-t border-border/50">
                              <td className="p-4 !text-lg !font-medium !text-muted-foreground">Details</td>
                              {products.map((product) => (
                                <td key={product.id} className="p-4 text-center">
                                  <a href={product.link} target="_blank" rel="noopener noreferrer">
                                    <Button size="sm" variant="outline" className="gap-2 !text-base px-4">
                                      <ExternalLink className="w-5 h-5" /> View
                                    </Button>
                                  </a>
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </MotionDiv>
                )}
              </AnimatePresence>
            </div>
          </div>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}
