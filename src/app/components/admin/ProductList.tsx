import { Product } from '@/app/lib/api';
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
import { Edit2, Trash2, ExternalLink } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  loading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export function ProductList({ products, loading, onEdit, onDelete }: ProductListProps) {
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
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Image</TableHead>
            <TableHead>Series / Part #</TableHead>
            <TableHead>Technology</TableHead>
            <TableHead>Specs</TableHead>
            <TableHead>Applications</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <img 
                  src={product.image} 
                  alt={product.series} 
                  className="w-12 h-12 object-contain rounded bg-gray-50"
                />
              </TableCell>
              <TableCell>
                <div className="font-medium">{product.series}</div>
                {product.part_number && (
                  <div className="text-xs text-muted-foreground">#{product.part_number}</div>
                )}
                {product.flagship && (
                  <Badge variant="secondary" className="mt-1 text-[10px] bg-amber-100 text-amber-800 hover:bg-amber-100">
                    Flagship
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="capitalize">{product.technology}</div>
                <div className="text-xs text-muted-foreground capitalize">{product.duty} Duty</div>
              </TableCell>
              <TableCell>
                <div className="space-y-1 text-xs">
                  <div className="flex gap-1">
                    <span className="font-medium">IP:</span> {product.ip}
                  </div>
                  <div className="flex gap-1">
                    <span className="font-medium">Mat:</span> {product.material}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                  {product.applications.slice(0, 3).map(app => (
                    <Badge key={app} variant="outline" className="text-[10px] capitalize">
                      {app}
                    </Badge>
                  ))}
                  {product.applications.length > 3 && (
                    <span className="text-xs text-muted-foreground">+{product.applications.length - 3}</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button size="icon" variant="ghost" asChild title="View on site">
                    <a href={product.link} target="_blank" rel="noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => onEdit(product)} title="Edit">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => onDelete(product.id)} title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
