import { Product } from '@/app/lib/api';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { X, ExternalLink, ChevronUp, ChevronDown, GitCompareArrows } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { getProxiedImageUrl } from '@/app/utils/imageProxy';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const MotionDiv = motion.div;

interface CompareProductsProps {
  products: Product[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemove: (id: string) => void;
}

const COMPARE_ROWS: { label: string; getValue: (p: Product) => string }[] = [
  { label: 'Technology', getValue: (p) => p.technology },
  { label: 'Duty Rating', getValue: (p) => p.duty },
  { label: 'IP Rating', getValue: (p) => p.ip },
  { label: 'Material', getValue: (p) => p.material },
  { label: 'Circuit Count', getValue: (p) => p.circuitry || '—' },
  { label: 'Connection', getValue: (p) => p.connector_type?.replace(/-/g, ' ') || '—' },
  { label: 'Part Number', getValue: (p) => p.part_number || '—' },
  { label: 'Features', getValue: (p) => (p.features || []).map(f => f.replace('_', ' ')).join(', ') || '—' },
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
          <div className="mx-auto max-w-5xl px-4 pb-4">
            <div className="rounded-t-2xl border border-b-0 border-border/60 bg-background/95 backdrop-blur-xl shadow-2xl shadow-black/20 overflow-hidden">

              {/* Collapsed bar — always visible */}
              <button
                onClick={() => {
                  if (products.length >= 2) {
                    setExpanded(prev => !prev);
                  }
                }}
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-primary">
                    <GitCompareArrows className="w-4 h-4" />
                    <span className="font-semibold text-sm">
                      Compare ({products.length})
                    </span>
                  </div>

                  {/* Mini product avatars */}
                  <div className="flex -space-x-2">
                    {products.map(p => (
                      <div
                        key={p.id}
                        className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center overflow-hidden"
                        title={p.series}
                      >
                        {p.image ? (
                          <ImageWithFallback
                            src={getProxiedImageUrl(p.image)}
                            alt={p.series}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[9px] font-bold text-muted-foreground">{p.series.slice(0, 2)}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {products.length < 2 && (
                    <span className="text-xs text-muted-foreground">Add {2 - products.length} more to compare</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {products.length >= 2 && (
                    expanded
                      ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      : <ChevronUp className="w-4 h-4 text-muted-foreground" />
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
                    <div className="border-t border-border/50 px-5 py-4 max-h-[60vh] overflow-y-auto">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[500px] border-collapse">
                          <thead>
                            <tr>
                              <th className="text-left p-3 text-sm font-medium text-muted-foreground w-36" />
                              {products.map((product) => (
                                <th key={product.id} className="p-3 text-center min-w-[180px]">
                                  <div className="flex flex-col items-center gap-2">
                                    {product.image && (
                                      <div className="w-20 h-16 flex items-center justify-center">
                                        <ImageWithFallback
                                          src={getProxiedImageUrl(product.image)}
                                          alt={product.series}
                                          className="max-w-full max-h-full object-contain"
                                        />
                                      </div>
                                    )}
                                    <span className="font-bold text-base">{product.series}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-xs text-muted-foreground h-6"
                                      onClick={() => onRemove(product.id)}
                                    >
                                      <X className="w-3 h-3 mr-1" /> Remove
                                    </Button>
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {COMPARE_ROWS.map((row) => (
                              <tr key={row.label} className="border-t border-border/50">
                                <td className="p-3 text-sm font-medium text-muted-foreground">{row.label}</td>
                                {products.map((product) => {
                                  const value = row.getValue(product);
                                  return (
                                    <td key={product.id} className="p-3 text-center">
                                      <Badge variant="secondary" className="text-xs capitalize font-normal">
                                        {value}
                                      </Badge>
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                            {/* Link row */}
                            <tr className="border-t border-border/50">
                              <td className="p-3 text-sm font-medium text-muted-foreground">Details</td>
                              {products.map((product) => (
                                <td key={product.id} className="p-3 text-center">
                                  <a href={product.link} target="_blank" rel="noopener noreferrer">
                                    <Button size="sm" variant="outline" className="gap-1">
                                      <ExternalLink className="w-3 h-3" /> View
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
