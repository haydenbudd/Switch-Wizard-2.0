import { Product } from '@/app/lib/api';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { X, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/app/components/ui/dialog';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { getProxiedImageUrl } from '@/app/utils/imageProxy';

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
  if (products.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compare Products ({products.length})</DialogTitle>
          <DialogDescription>Side-by-side comparison of selected products</DialogDescription>
        </DialogHeader>

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
      </DialogContent>
    </Dialog>
  );
}
