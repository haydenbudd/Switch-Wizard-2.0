import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Settings, 
  LogOut, 
  Plus, 
  Search,
  Upload,
  Database,
  RefreshCw,
  Edit
} from 'lucide-react';
import { ProductList } from './ProductList';
import { ProductForm } from './ProductForm';
import { CSVImport } from './CSVImport';
import { BulkAttributeUpdater } from './BulkAttributeUpdater';
import { SupabaseDebugger } from './SupabaseDebugger';
import { Button } from '@/app/components/ui/button';
import { Product, fetchProducts, createOrUpdateProduct, deleteProduct } from '@/app/lib/api';
import { toast } from 'sonner';

interface AdminDashboardProps {
  onSignOut: () => void;
}

type View = 'products' | 'import' | 'settings' | 'bulk-update' | 'debug';

export function AdminDashboard({ onSignOut }: AdminDashboardProps) {
  const [currentView, setCurrentView] = useState<View>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleCreateProduct = async (data: Partial<Product>) => {
    try {
      await createOrUpdateProduct(data);
      toast.success('Product created successfully');
      setIsCreating(false);
      loadProducts();
    } catch (error) {
      console.error('Failed to create product:', error);
      toast.error('Failed to create product');
    }
  };

  const handleUpdateProduct = async (data: Partial<Product>) => {
    try {
      if (!editingProduct) return;
      await createOrUpdateProduct({ ...data, id: editingProduct.id });
      toast.success('Product updated successfully');
      setEditingProduct(null);
      loadProducts();
    } catch (error) {
      console.error('Failed to update product:', error);
      toast.error('Failed to update product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await deleteProduct(id);
      toast.success('Product deleted successfully');
      loadProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(p => 
    p.series.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.part_number && p.part_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-primary" />
            Admin Panel
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <Button
            variant={currentView === 'products' && !isCreating && !editingProduct ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => {
              setCurrentView('products');
              setIsCreating(false);
              setEditingProduct(null);
            }}
          >
            <Package className="w-4 h-4 mr-2" />
            Products
          </Button>
          <Button
            variant={currentView === 'import' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentView('import')}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button
            variant={currentView === 'bulk-update' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentView('bulk-update')}
          >
            <Edit className="w-4 h-4 mr-2" />
            Bulk Update
          </Button>
          <Button
            variant={currentView === 'debug' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentView('debug')}
          >
            <Database className="w-4 h-4 mr-2" />
            Database Debug
          </Button>
          <Button
            variant={currentView === 'settings' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentView('settings')}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
            onClick={onSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {currentView === 'products' && !isCreating && !editingProduct && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Product Catalog</h2>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={loadProducts} title="Refresh Products">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button onClick={() => setIsCreating(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by series, description, or part number..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <ProductList 
                products={filteredProducts}
                loading={loading}
                onEdit={setEditingProduct}
                onDelete={handleDeleteProduct}
              />
            </div>
          )}

          {(isCreating || editingProduct) && (
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isCreating ? 'Create New Product' : `Edit ${editingProduct?.series}`}
                </h2>
                <Button variant="ghost" onClick={() => {
                  setIsCreating(false);
                  setEditingProduct(null);
                }}>
                  Cancel
                </Button>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <ProductForm
                  key={editingProduct?.id || 'new'}
                  initialData={editingProduct || undefined}
                  onSubmit={isCreating ? handleCreateProduct : handleUpdateProduct}
                  isLoading={loading}
                />
              </div>
            </div>
          )}

          {currentView === 'import' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Import Products</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Upload a CSV file to bulk import or update products. 
                Existing products with matching IDs or Part Numbers will be updated.
              </p>
              <CSVImport onImportComplete={loadProducts} />
            </div>
          )}

          {currentView === 'bulk-update' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bulk Attribute Update</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Select an attribute to update across multiple products matching a search criteria.
              </p>
              <BulkAttributeUpdater onUpdateComplete={loadProducts} />
            </div>
          )}

          {currentView === 'debug' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Database Debugger</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Inspect raw database contents and verify data integrity.
              </p>
              <SupabaseDebugger />
            </div>
          )}

          {currentView === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Settings</h2>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-medium mb-4">Account</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  You are logged in as an administrator.
                </p>
                <Button variant="destructive" onClick={onSignOut}>
                  Sign Out
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
