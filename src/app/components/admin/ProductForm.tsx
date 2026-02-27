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
import { X, ChevronDown } from 'lucide-react';
import {
  applications as appOptions,
  features as featureOptions,
  actions as actionOptions,
  materials as materialOptions,
  circuitCounts as circuitOptions,
} from '@/app/data/options';

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: Partial<Product>) => void;
  isLoading?: boolean;
}

function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { id: string; label: string; description: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((id) => {
            const opt = options.find((o) => o.id === id);
            return (
              <span
                key={id}
                className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs flex items-center gap-1"
              >
                {opt?.label || id}
                <button type="button" onClick={() => toggle(id)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
      {/* Dropdown trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <span className="text-muted-foreground">
            {selected.length === 0
              ? `Select ${label.toLowerCase()}...`
              : `${selected.length} selected`}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md max-h-60 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggle(opt.id)}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
              >
                <div
                  className={`h-4 w-4 rounded border flex items-center justify-center ${
                    selected.includes(opt.id)
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'border-input'
                  }`}
                >
                  {selected.includes(opt.id) && (
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <div className="text-left">
                  <div>{opt.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {opt.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ProductForm({
  initialData,
  onSubmit,
  isLoading,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Product>({
    defaultValues: initialData || {
      flagship: false,
      applications: [],
      actions: [],
      features: [],
      recommended_for: [],
    },
  });

  const features = watch('features') || [];
  const applications = watch('applications') || [];
  const actions = watch('actions') || [];

  // Watch all select fields so dropdowns stay in sync with form state
  const technology = watch('technology') || '';
  const duty = watch('duty') || '';
  const material = watch('material') || '';
  const ip = watch('ip') || '';
  const connectorType = watch('connector_type') || 'none';
  const circuitry = watch('circuitry') || 'no_preference';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Series Name</Label>
          <Input
            {...register('series', { required: 'Series is required' })}
            placeholder="e.g. Hercules"
          />
          {errors.series && (
            <span className="text-red-500 text-xs">
              {errors.series.message}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <Label>Part Number</Label>
          <Input {...register('part_number')} placeholder="e.g. 531-SWHO" />
        </div>

        <div className="col-span-full space-y-2">
          <Label>Description</Label>
          <Textarea
            {...register('description')}
            placeholder="Product description..."
          />
        </div>

        <div className="space-y-2">
          <Label>Technology</Label>
          <Select
            value={technology}
            onValueChange={(val) => setValue('technology', val)}
          >
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
          <Select
            value={duty}
            onValueChange={(val) => setValue('duty', val as Product['duty'])}
          >
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
          <Select
            value={material}
            onValueChange={(val) => setValue('material', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select material" />
            </SelectTrigger>
            <SelectContent>
              {materialOptions.map((mat) => (
                <SelectItem key={mat.id} value={mat.id}>
                  {mat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>IP Rating</Label>
          <Select
            value={ip}
            onValueChange={(val) => setValue('ip', val)}
          >
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
          <Select
            value={connectorType}
            onValueChange={(val) =>
              setValue('connector_type', val === 'none' ? undefined : val)
            }
          >
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
          <Label>Circuits Controlled</Label>
          <Select
            value={circuitry}
            onValueChange={(val) =>
              setValue('circuitry', val === 'no_preference' ? undefined : val)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select circuits" />
            </SelectTrigger>
            <SelectContent>
              {circuitOptions.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Image URL</Label>
          <Input {...register('image')} placeholder="https://..." />
        </div>

        <div className="space-y-2">
          <Label>Product Link</Label>
          <Input
            {...register('link')}
            placeholder="https://linemaster.com/..."
          />
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

        {/* Actions - multi-select dropdown */}
        <MultiSelectDropdown
          label="Actions"
          options={actionOptions}
          selected={actions}
          onChange={(vals) => setValue('actions', vals)}
        />

        {/* Applications - multi-select dropdown */}
        <MultiSelectDropdown
          label="Applications"
          options={appOptions}
          selected={applications}
          onChange={(vals) => setValue('applications', vals)}
        />

        {/* Features - multi-select dropdown */}
        <MultiSelectDropdown
          label="Features"
          options={featureOptions}
          selected={features}
          onChange={(vals) => setValue('features', vals)}
        />
      </div>

      <div className="pt-6">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading
            ? 'Saving...'
            : initialData
              ? 'Update Product'
              : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}
