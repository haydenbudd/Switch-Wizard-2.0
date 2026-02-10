import { useForm } from 'react-hook-form';
import { Product } from '@/app/lib/api';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Switch } from '@/app/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: Partial<Product>) => void;
  isLoading?: boolean;
}

export function ProductForm({ initialData, onSubmit, isLoading }: ProductFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Product>({
    defaultValues: initialData || {
      flagship: false,
      applications: [],
      actions: [],
      features: [],
      recommended_for: [],
    },
  });

  const [newFeature, setNewFeature] = useState('');
  const features = watch('features') || [];
  
  const [newApplication, setNewApplication] = useState('');
  const applications = watch('applications') || [];

  const addFeature = () => {
    if (newFeature && !features.includes(newFeature)) {
      setValue('features', [...features, newFeature]);
      setNewFeature('');
    }
  };

  const removeFeature = (feat: string) => {
    setValue('features', features.filter(f => f !== feat));
  };

  const addApplication = () => {
    if (newApplication && !applications.includes(newApplication)) {
      setValue('applications', [...applications, newApplication]);
      setNewApplication('');
    }
  };

  const removeApplication = (app: string) => {
    setValue('applications', applications.filter(a => a !== app));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Series Name</Label>
          <Input {...register('series', { required: 'Series is required' })} placeholder="e.g. Hercules" />
          {errors.series && <span className="text-red-500 text-xs">{errors.series.message}</span>}
        </div>

        <div className="space-y-2">
          <Label>Part Number</Label>
          <Input {...register('part_number')} placeholder="e.g. 531-SWHO" />
        </div>

        <div className="col-span-full space-y-2">
          <Label>Description</Label>
          <Textarea {...register('description')} placeholder="Product description..." />
        </div>

        <div className="space-y-2">
          <Label>Technology</Label>
          <Select onValueChange={(val) => setValue('technology', val)} defaultValue={initialData?.technology}>
            <SelectTrigger>
              <SelectValue placeholder="Select technology" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="electrical">Electrical</SelectItem>
              <SelectItem value="pneumatic">Pneumatic</SelectItem>
              <SelectItem value="wireless">Wireless</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Duty Rating</Label>
          <Select onValueChange={(val: any) => setValue('duty', val)} defaultValue={initialData?.duty}>
            <SelectTrigger>
              <SelectValue placeholder="Select duty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="heavy">Heavy Duty</SelectItem>
              <SelectItem value="medium">Medium Duty</SelectItem>
              <SelectItem value="light">Light Duty</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Material</Label>
          <Input {...register('material')} placeholder="e.g. Cast Iron" />
        </div>

        <div className="space-y-2">
          <Label>IP Rating</Label>
          <Select onValueChange={(val) => setValue('ip', val)} defaultValue={initialData?.ip}>
            <SelectTrigger>
              <SelectValue placeholder="Select IP rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IPXX">IPXX (Basic / Open)</SelectItem>
              <SelectItem value="IP20">IP20 (Dry)</SelectItem>
              <SelectItem value="IP56">IP56 (Splash Proof)</SelectItem>
              <SelectItem value="IP68">IP68 (Submersible)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Connector Type</Label>
          <Select onValueChange={(val) => setValue('connector_type', val === 'none' ? undefined as any : val)} defaultValue={initialData?.connector_type || 'none'}>
            <SelectTrigger>
              <SelectValue placeholder="Select connector type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None / N/A</SelectItem>
              <SelectItem value="screw-terminal">Screw Terminal</SelectItem>
              <SelectItem value="quick-connect">Quick Connect</SelectItem>
              <SelectItem value="pre-wired">Pre-Wired Cable</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Image URL</Label>
          <Input {...register('image')} placeholder="https://..." />
        </div>

        <div className="space-y-2">
          <Label>Product Link</Label>
          <Input {...register('link')} placeholder="https://linemaster.com/..." />
        </div>

        <div className="flex items-center space-x-2 pt-8">
          <Switch 
            checked={watch('flagship')}
            onCheckedChange={(checked) => setValue('flagship', checked)}
          />
          <Label>Flagship Product</Label>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold">Attributes</h3>
        
        {/* Applications */}
        <div className="space-y-2">
          <Label>Applications</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {applications.map(app => (
              <span key={app} className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs flex items-center gap-1">
                {app}
                <button type="button" onClick={() => removeApplication(app)}><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input 
              value={newApplication}
              onChange={(e) => setNewApplication(e.target.value)}
              placeholder="Add application..."
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addApplication())}
            />
            <Button type="button" variant="secondary" onClick={addApplication}><Plus className="w-4 h-4" /></Button>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-2">
          <Label>Features</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {features.map(feat => (
              <span key={feat} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs flex items-center gap-1">
                {feat}
                <button type="button" onClick={() => removeFeature(feat)}><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input 
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="Add feature (e.g. shield, twin)..."
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
            />
            <Button type="button" variant="secondary" onClick={addFeature}><Plus className="w-4 h-4" /></Button>
          </div>
        </div>
      </div>

      <div className="pt-6">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Saving...' : (initialData ? 'Update Product' : 'Create Product')}
        </Button>
      </div>
    </form>
  );
}
