import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { fetchProducts, createOrUpdateProducts, Product } from '@/app/lib/api';
import { toast } from 'sonner';
import { Search, Save, RefreshCw } from 'lucide-react';

interface BulkAttributeUpdaterProps {
  onUpdateComplete: () => void;
}

export function BulkAttributeUpdater({ onUpdateComplete }: BulkAttributeUpdaterProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [attribute, setAttribute] = useState<keyof Product>('technology');
  const [newValue, setNewValue] = useState('');
  const [previewCount, setPreviewCount] = useState(0);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    !searchTerm ? false :
    p.series.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.part_number && p.part_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    setPreviewCount(filteredProducts.length);
  }, [searchTerm, products]);

  const handleUpdate = async () => {
    if (previewCount === 0) {
      toast.error('No products matched your search');
      return;
    }
    if (!newValue) {
      toast.error('Please enter a new value');
      return;
    }

    if (!confirm(`Are you sure you want to update "${attribute}" to "${newValue}" for ${previewCount} products?`)) {
      return;
    }

    setLoading(true);
    try {
      const updatedProducts = filteredProducts.map(p => ({
        ...p,
        [attribute]: newValue
      }));

      await createOrUpdateProducts(updatedProducts);
      toast.success(`Updated ${updatedProducts.length} products`);
      setSearchTerm('');
      setNewValue('');
      await loadProducts();
      onUpdateComplete();
    } catch (error) {
      console.error('Bulk update failed:', error);
      toast.error('Failed to update products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Bulk Update Attributes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>1. Filter Products</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by series, desc, part #..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {previewCount} products matched
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>2. Select Attribute</Label>
              <Select 
                value={attribute} 
                onValueChange={(val) => setAttribute(val as keyof Product)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="duty">Duty Rating</SelectItem>
                  <SelectItem value="material">Material</SelectItem>
                  <SelectItem value="ip">IP Rating</SelectItem>
                  <SelectItem value="connector_type">Connector Type</SelectItem>
                  <SelectItem value="applications">Application (Append)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>3. New Value</Label>
              <Input
                placeholder={`Enter new ${attribute}...`}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Button 
          onClick={handleUpdate} 
          disabled={loading || previewCount === 0 || !newValue}
          className="w-full"
        >
          {loading ? 'Updating...' : `Update ${previewCount} Products`}
          {!loading && <Save className="w-4 h-4 ml-2" />}
        </Button>
      </CardContent>
    </Card>
  );
}
