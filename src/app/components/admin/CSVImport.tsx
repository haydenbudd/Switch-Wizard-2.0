import { useState, useRef } from 'react';
import { Button } from '@/app/components/ui/button';
import { Upload, FileUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { createOrUpdateProducts, Product } from '@/app/lib/api';
import { toast } from 'sonner';
import { Progress } from '@/app/components/ui/progress';

interface CSVImportProps {
  onImportComplete: () => void;
}

export function CSVImport({ onImportComplete }: CSVImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<{ total: number; success: number; failed: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStats(null);
      setProgress(0);
    }
  };

  const parseCSV = (text: string): Partial<Product>[] => {
    const lines = text.split(/\r\n|\n/);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const products: Partial<Product>[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      // Handle quoted CSV values correctly
      const row: string[] = [];
      let inQuote = false;
      let currentValue = '';
      
      for (let char of lines[i]) {
        if (char === '"') {
          inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
          row.push(currentValue);
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      row.push(currentValue); // Push last value

      const cleanedRow = row.map(val => val.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
      
      const product: Record<string, unknown> = {};
      
      // Map CSV headers to Product fields
      // Supports both standard field names and common CSV column headers
      headers.forEach((header, index) => {
        const value = cleanedRow[index];
        if (!value) return;

        const h = header.toLowerCase();
        
        // ID mapping
        if (h === 'id' || h === 'product id' || h === 'sku') product.id = value;
        
        // Series/Title
        else if (h === 'series' || h === 'name' || h === 'title') product.series = value;
        
        // Part Number
        else if (h === 'part' || h === 'part number' || h === 'part_number' || h === 'pn') product.part_number = value;
        
        // Description
        else if (h === 'description' || h === 'desc') product.description = value;
        
        // Technical Specs
        else if (h === 'technology' || h === 'tech') product.technology = value.toLowerCase();
        else if (h === 'duty' || h === 'duty rating') product.duty = value.toLowerCase();
        else if (h === 'material' || h === 'housing material') product.material = value;
        else if (h === 'ip' || h === 'ip rating' || h === 'environmental rating') product.ip = value;
        else if (h === 'voltage' || h === 'volts') product.voltage = value;
        else if (h === 'amperage' || h === 'amps') product.amperage = value;
        else if (h === 'circuitry' || h === 'circuits') product.circuitry = value;
        else if (h === 'certifications' || h === 'agency approvals') product.certifications = value;
        
        // Connection
        else if (h === 'connector_type' || h === 'connection' || h === 'connection type') product.connector_type = value;
        else if (h === 'cord length' || h === 'cord') product.cord_length = value;
        
        // Arrays (semicolon or pipe separated)
        else if (h === 'applications' || h === 'application') {
          product.applications = value.split(/[;|]/).map((s: string) => s.trim().toLowerCase());
        }
        else if (h === 'actions' || h === 'action') {
          product.actions = value.split(/[;|]/).map((s: string) => s.trim().toLowerCase());
        }
        else if (h === 'features' || h === 'feature') {
          product.features = value.split(/[;|]/).map((s: string) => s.trim().toLowerCase());
        }
        
        // Specific Attribute mapping from user request
        else if (h === 'pfc config') product.pfc_config = value;
        else if (h === 'number of pedals' || h === 'pedals') product.pedal_count = parseInt(value) || 1;
        else if (h === 'stages') product.stages = value;
        else if (h === 'configuration') product.configuration = value;
        else if (h === 'interior sub') product.interior_sub = value;
        else if (h === 'microswitch') product.microswitch = value;
        else if (h === 'microswitch qty') product.microswitch_qty = parseInt(value) || 1;
        else if (h === 'potentiometer') product.potentiometer = value;
        else if (h === 'color') product.color = value;
        
        // Image
        else if (h === 'image' || h === 'image url') product.image = value;
        else if (h === 'link' || h === 'product url') product.link = value;
        
        // Flags
        else if (h === 'flagship') product.flagship = value.toLowerCase() === 'true' || value === '1';
      });

      // Default values if missing
      if (!product.id && product.part_number) product.id = product.part_number;
      if (!product.id && product.series) product.id = product.series.toLowerCase().replace(/\s+/g, '-');
      
      // Leave image empty so the series-based fallback in transformProduct kicks in
      if (!product.image) product.image = '';
      if (!product.link) product.link = '#';
      if (!product.flagship) product.flagship = false;
      
      // Ensure required arrays exist
      if (!product.applications) product.applications = [];
      if (!product.actions) product.actions = [];
      if (!product.features) product.features = [];

      if (product.id && product.series) {
        products.push(product);
      }
    }

    return products;
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(10);
    setStats(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const products = parseCSV(text);
        
        if (products.length === 0) {
          toast.error('No valid products found in CSV');
          setUploading(false);
          return;
        }

        setProgress(30);
        console.log(`Parsed ${products.length} products from CSV`);

        // Upload in batches is handled by createOrUpdateProducts
        await createOrUpdateProducts(products);
        
        setProgress(100);
        setStats({
          total: products.length,
          success: products.length, // Assuming all succeed if no error thrown
          failed: 0
        });
        
        toast.success(`Successfully imported ${products.length} products`);
        onImportComplete();
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        
      } catch (error) {
        console.error('Import failed:', error);
        toast.error('Import failed. Check console for details.');
        setStats({
          total: 0,
          success: 0,
          failed: 1
        });
      } finally {
        setUploading(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
        <input
          type="file"
          accept=".csv"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-primary/10 rounded-full">
            <FileUp className="w-8 h-8 text-primary" />
          </div>
          
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">
              {file ? file.name : 'Upload Product CSV'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Drag & drop or click to browse'}
            </p>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              Select File
            </Button>
            {file && (
              <Button onClick={handleUpload} disabled={uploading}>
                {uploading ? 'Importing...' : 'Start Import'}
                {!uploading && <Upload className="w-4 h-4 ml-2" />}
              </Button>
            )}
          </div>
        </div>
      </div>

      {uploading && (
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Importing products...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {stats && (
        <div className={`mt-6 p-4 rounded-lg border flex items-start gap-3 ${
          stats.failed > 0 
            ? 'bg-amber-50 border-amber-200 text-amber-800' 
            : 'bg-green-50 border-green-200 text-green-800'
        }`}>
          {stats.failed > 0 ? (
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <div>
            <h4 className="font-semibold">Import Complete</h4>
            <p className="text-sm mt-1">
              Processed {stats.total} items. {stats.success} successful, {stats.failed} failed.
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-200 rounded-lg text-sm">
        <div className="flex items-center gap-2 font-semibold mb-2">
          <Info className="w-4 h-4" />
          CSV Format Guide
        </div>
        <p className="mb-2">Your CSV should include headers. Supported columns:</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs font-mono opacity-90">
          <div>id (optional)</div>
          <div>series / name</div>
          <div>part_number</div>
          <div>description</div>
          <div>technology</div>
          <div>duty</div>
          <div>material</div>
          <div>ip</div>
          <div>applications (list)</div>
          <div>features (list)</div>
          <div>connector_type</div>
          <div>image (url)</div>
        </div>
      </div>
    </div>
  );
}
