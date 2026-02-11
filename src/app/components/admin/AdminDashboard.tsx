import { useState, useEffect, useMemo } from 'react';
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
  Edit,
  Zap,
  Wind,
  Wifi,
  BarChart3,
  Layers,
  Shield,
  AlertTriangle,
  FolderTree,
  PieChart,
  TrendingUp,
  Download
} from 'lucide-react';
import { ProductList } from './ProductList';
import { ProductForm } from './ProductForm';
import { CSVImport } from './CSVImport';
import { BulkAttributeUpdater } from './BulkAttributeUpdater';
import { SupabaseDebugger } from './SupabaseDebugger';
import { DataAudit } from './DataAudit';
import { SeriesManager } from './SeriesManager';
import { FieldCoverage } from './FieldCoverage';
import { WizardAnalytics } from './WizardAnalytics';
import { Button } from '@/app/components/ui/button';
import { Product, fetchProducts, createOrUpdateProduct, deleteProduct } from '@/app/lib/api';
import { toast } from 'sonner';

interface AdminDashboardProps {
  onSignOut: () => void;
}

type View = 'products' | 'import' | 'settings' | 'bulk-update' | 'debug' | 'audit' | 'series' | 'coverage' | 'analytics';

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

  const stats = useMemo(() => {
    if (products.length === 0) return null;

    const techCounts: Record<string, number> = {};
    const dutyCounts: Record<string, number> = {};
    const materialCounts: Record<string, number> = {};
    const ipCounts: Record<string, number> = {};
    const seriesSet = new Set<string>();

    for (const p of products) {
      techCounts[p.technology] = (techCounts[p.technology] || 0) + 1;
      dutyCounts[p.duty] = (dutyCounts[p.duty] || 0) + 1;
      if (p.material) materialCounts[p.material] = (materialCounts[p.material] || 0) + 1;
      if (p.ip) ipCounts[p.ip] = (ipCounts[p.ip] || 0) + 1;
      seriesSet.add(p.series);
    }

    return { techCounts, dutyCounts, materialCounts, ipCounts, seriesCount: seriesSet.size };
  }, [products]);

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

          <div className="pt-3 pb-1 px-2">
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Reports</p>
          </div>
          <Button
            variant={currentView === 'audit' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentView('audit')}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Data Audit
          </Button>
          <Button
            variant={currentView === 'series' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentView('series')}
          >
            <FolderTree className="w-4 h-4 mr-2" />
            Series Manager
          </Button>
          <Button
            variant={currentView === 'coverage' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentView('coverage')}
          >
            <PieChart className="w-4 h-4 mr-2" />
            Field Coverage
          </Button>
          <Button
            variant={currentView === 'analytics' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentView('analytics')}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Wizard Analytics
          </Button>

          <div className="pt-3 pb-1 px-2">
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">System</p>
          </div>
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
              {/* Stats Overview */}
              {stats && (
                <div className="space-y-4">
                  {/* Top row: totals */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                          <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Total Products</span>
                      </div>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white ml-11">{products.length}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30">
                          <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Series</span>
                      </div>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white ml-11">{stats.seriesCount}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/30">
                          <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">IP Ratings</span>
                      </div>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white ml-11">{Object.keys(stats.ipCounts).length}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                          <BarChart3 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Materials</span>
                      </div>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white ml-11">{Object.keys(stats.materialCounts).length}</p>
                    </div>
                  </div>

                  {/* Breakdown rows */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Technology breakdown */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">By Technology</h3>
                      <div className="space-y-2">
                        {Object.entries(stats.techCounts).sort((a, b) => b[1] - a[1]).map(([tech, count]) => (
                          <div key={tech} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {tech === 'electrical' && <Zap className="w-3.5 h-3.5 text-yellow-500" />}
                              {tech === 'pneumatic' && <Wind className="w-3.5 h-3.5 text-cyan-500" />}
                              {tech === 'wireless' && <Wifi className="w-3.5 h-3.5 text-violet-500" />}
                              <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{tech}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-blue-500"
                                  style={{ width: `${(count / products.length) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">{count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Duty breakdown */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">By Duty Class</h3>
                      <div className="space-y-2">
                        {Object.entries(stats.dutyCounts).sort((a, b) => b[1] - a[1]).map(([duty, count]) => (
                          <div key={duty} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{duty}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-emerald-500"
                                  style={{ width: `${(count / products.length) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">{count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Material breakdown (top 5) */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Top Materials</h3>
                      <div className="space-y-2">
                        {Object.entries(stats.materialCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([mat, count]) => (
                          <div key={mat} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate mr-2">{mat}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-amber-500"
                                  style={{ width: `${(count / products.length) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">{count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Product Catalog</h2>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={loadProducts} title="Refresh Products">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" onClick={() => {
                    const headers = ['id','series','part_number','technology','duty','ip','material','actions','applications','connector_type','voltage','amperage','certifications','description','image','link'];
                    const rows = products.map(p => headers.map(h => {
                      const val = (p as Record<string, unknown>)[h];
                      const str = Array.isArray(val) ? val.join('; ') : String(val ?? '');
                      return `"${str.replace(/"/g, '""')}"`;
                    }).join(','));
                    const csv = [headers.join(','), ...rows].join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `products-${new Date().toISOString().slice(0, 10)}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
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

          {currentView === 'audit' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Data Audit</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Scan product data for missing fields, duplicates, and inconsistencies.
              </p>
              <DataAudit
                products={products}
                onProductUpdate={async (id, data) => {
                  await createOrUpdateProduct({ ...data, id });
                  loadProducts();
                }}
                onEditProduct={(product) => {
                  setEditingProduct(product);
                  setCurrentView('products');
                }}
              />
            </div>
          )}

          {currentView === 'series' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Series Manager</h2>
              <p className="text-gray-500 dark:text-gray-400">
                View products grouped by series. Highlights inconsistencies within each series.
              </p>
              <SeriesManager products={products} />
            </div>
          )}

          {currentView === 'coverage' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Field Coverage</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Completeness report for every product field — sorted worst to best.
              </p>
              <FieldCoverage products={products} />
            </div>
          )}

          {currentView === 'analytics' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Wizard Analytics</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Track how users interact with the product finder wizard.
              </p>
              <WizardAnalytics />
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
