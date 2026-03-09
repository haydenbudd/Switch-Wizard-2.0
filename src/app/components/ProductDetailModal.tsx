import { Product } from '@/app/lib/api';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { getProxiedImageUrl } from '@/app/utils/imageProxy';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ExternalLink,
  Zap,
  Wind,
  Shield,
  CheckCircle2,
  Droplets,
  Anvil,
  Sparkles,
  Hexagon,
  Feather,
  Gem,
  Component,
  Cable,
  Gauge,
  Layers,
  Palette,
  Hash,
  ToggleLeft,
  Star,
  FileText,
} from 'lucide-react';
import { useEffect, useCallback } from 'react';
import {
  colorClasses,
  getTechColor,
  getDutyColor,
  getIpColor,
  getMaterialColor,
  getConnectionColor,
  getFeatureColor,
  type AttributeColor,
} from '@/app/lib/attributeColors';

const MotionDiv = motion.div;

interface ProductDetailModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

// Map series names to their datasheet PDFs on linemaster.com
const SERIES_DATASHEETS: Record<string, string> = {
  'hercules': 'https://linemaster.com/cdn/manuals/data-sheets/Hercules%20LIT-034%20Rev%20D.pdf',
  'atlas': 'https://linemaster.com/cdn/manuals/data-sheets/Atlas%20LIT-054%20Rev.B.pdf',
  'clipper': 'https://linemaster.com/cdn/manuals/data-sheets/Clipper%20LIT-037%20Rev.%20B.pdf',
  'classic iv': 'https://linemaster.com/cdn/manuals/data-sheets/Classic%20IV%20LIT-010%20Rev.D.pdf',
  'classic': 'https://linemaster.com/cdn/manuals/data-sheets/Classic%20II%20LIT-056%20Rev.B.pdf',
  'dolphin': 'https://linemaster.com/cdn/manuals/data-sheets/Dolphin%20LIT-048%20Rev.B.pdf',
  'gem': 'https://linemaster.com/cdn/manuals/data-sheets/Gem%20LIT-052%20Rev.B.pdf',
  'varior': 'https://linemaster.com/cdn/manuals/data-sheets/Varior%20LIT-053%20Rev.B.pdf',
  'compact': 'https://linemaster.com/cdn/manuals/data-sheets/Compact%20LIT-042%20Rev%20C.pdf',
  'treadlite': 'https://linemaster.com/cdn/manuals/data-sheets/Treadlite%20II%20LIT-044%20Rev.B.pdf',
  'aquiline': 'https://linemaster.com/cdn/manuals/data-sheets/Aquiline%20Metal%20LIT-063%20Rev.B.pdf',
  'vanguard': 'https://linemaster.com/cdn/manuals/data-sheets/Vanguard%20LIT-049%20Rev.%20B.pdf',
  'air seal': 'https://linemaster.com/cdn/manuals/data-sheets/Air%20footswitches%20LIT-025%20Rev.%20C.pdf',
  'air-seal': 'https://linemaster.com/cdn/manuals/data-sheets/Air%20footswitches%20LIT-025%20Rev.%20C.pdf',
  'airval': 'https://linemaster.com/cdn/manuals/data-sheets/Air%20footswitches%20LIT-025%20Rev.%20C.pdf',
  'rf wireless': 'https://linemaster.com/cdn/manuals/data-sheets/Digital%20RF%20Wireless%20LIT-030%20Rev%20C.pdf',
  'explosion proof': 'https://linemaster.com/cdn/manuals/data-sheets/Explosion%20Proof%20LIT-051%20Rev.B.pdf',
};

function getDatasheetUrl(series: string): string | null {
  const s = series.toLowerCase();
  if (SERIES_DATASHEETS[s]) return SERIES_DATASHEETS[s];
  for (const [key, url] of Object.entries(SERIES_DATASHEETS)) {
    if (s.includes(key)) return url;
  }
  return null;
}

function MaterialIcon({ material }: { material: string }) {
  const cls = 'w-4 h-4 text-muted-foreground';
  const m = material.toLowerCase();
  if (m.includes('cast iron')) return <Anvil className={cls} />;
  if (m.includes('stainless')) return <Sparkles className={cls} />;
  if (m.includes('thermoplastic') || m.includes('plastic') || m.includes('rubber') || m.includes('polymeric'))
    return <Hexagon className={cls} />;
  if (m.includes('aluminum') || m.includes('aluminium')) return <Feather className={cls} />;
  if (m.includes('zinc') || m.includes('die')) return <Gem className={cls} />;
  return <Component className={cls} />;
}

function TechIcon({ tech }: { tech: string }) {
  const cls = 'w-4 h-4 text-muted-foreground';
  if (tech === 'wireless') return <Zap className={cls} />;
  if (tech === 'pneumatic') return <Wind className={cls} />;
  return <Zap className={cls} />;
}

function formatConnector(type?: string) {
  if (!type) return null;
  return type
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function ProductDetailModal({ product, open, onClose }: ProductDetailModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!product) return null;

  const datasheetUrl = getDatasheetUrl(product.series);

  const specs: { icon: React.ReactNode; label: string; value: string; color?: AttributeColor }[] = [
    { icon: <TechIcon tech={product.technology} />, label: 'Technology', value: product.technology, color: getTechColor(product.technology) },
    { icon: <Gauge className="w-4 h-4 text-muted-foreground" />, label: 'Duty Rating', value: product.duty, color: getDutyColor(product.duty) },
    { icon: <Droplets className="w-4 h-4 text-muted-foreground" />, label: 'IP Rating', value: product.ip, color: getIpColor(product.ip) },
    { icon: <MaterialIcon material={product.material} />, label: 'Material', value: product.material, color: getMaterialColor(product.material) },
  ];

  if (product.circuitry) {
    specs.push({ icon: <Hash className="w-4 h-4 text-muted-foreground" />, label: 'Circuits', value: product.circuitry });
  }
  if (product.connector_type) {
    specs.push({ icon: <Cable className="w-4 h-4 text-muted-foreground" />, label: 'Connection', value: formatConnector(product.connector_type)!, color: getConnectionColor(product.connector_type) });
  }
  if (product.stages) {
    specs.push({ icon: <Layers className="w-4 h-4 text-muted-foreground" />, label: 'Stages', value: product.stages });
  }
  if (product.pedal_count && product.pedal_count > 1) {
    specs.push({ icon: <Layers className="w-4 h-4 text-muted-foreground" />, label: 'Pedals', value: String(product.pedal_count) });
  }
  if (product.configuration) {
    specs.push({ icon: <ToggleLeft className="w-4 h-4 text-muted-foreground" />, label: 'Configuration', value: product.configuration });
  }
  if (product.color) {
    specs.push({ icon: <Palette className="w-4 h-4 text-muted-foreground" />, label: 'Color', value: product.color });
  }
  if (product.voltage) {
    specs.push({ icon: <Zap className="w-4 h-4 text-muted-foreground" />, label: 'Voltage', value: product.voltage });
  }
  if (product.amperage) {
    specs.push({ icon: <Gauge className="w-4 h-4 text-muted-foreground" />, label: 'Amperage', value: product.amperage });
  }

  return (
    <AnimatePresence>
      {open && (
        <MotionDiv
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <MotionDiv
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <MotionDiv
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border/60 bg-background shadow-2xl"
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            role="dialog"
            aria-modal="true"
            aria-label={`${product.series} product details`}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-muted transition-colors"
              aria-label="Close product details"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Hero image */}
            <div className="relative bg-gradient-to-b from-secondary/80 to-transparent p-8 pb-6 flex items-center justify-center min-h-[220px]">
              {product.flagship && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-[var(--accent-warm)] text-[var(--accent-warm-foreground)] border-transparent flex items-center gap-1 text-xs">
                    <Star className="w-3 h-3 fill-current" />
                    Top Choice
                  </Badge>
                </div>
              )}
              {product.image ? (
                <ImageWithFallback
                  src={getProxiedImageUrl(product.image)}
                  alt={product.series}
                  className="max-w-full max-h-[200px] object-contain drop-shadow-xl"
                />
              ) : (
                <div className="text-center text-muted-foreground/40">
                  <Component className="w-16 h-16 mx-auto mb-2" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="px-6 pb-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-1">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{product.series}</h2>
                  {product.part_number && (
                    <span className="text-sm text-muted-foreground font-mono">#{product.part_number}</span>
                  )}
                </div>
              </div>

              {/* Quick badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4 mt-2">
                <Badge variant="outline" className={`capitalize text-xs ${colorClasses(getTechColor(product.technology))}`}>
                  {product.technology}
                </Badge>
                <Badge
                  variant="outline"
                  className={`capitalize text-xs ${colorClasses(getDutyColor(product.duty))}`}
                >
                  {product.duty} Duty
                </Badge>
                <Badge variant="outline" className={`text-xs ${colorClasses(getIpColor(product.ip))}`}>
                  {product.ip}
                </Badge>
                {product.actions?.map((action) => (
                  <Badge key={action} variant="secondary" className="capitalize text-xs">
                    {action}
                  </Badge>
                ))}
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Specs grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {specs.map((spec) => (
                  <div
                    key={spec.label}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
                      spec.color
                        ? `${spec.color.bg} border ${spec.color.border}`
                        : 'bg-muted/40 border border-border/30'
                    }`}
                  >
                    {spec.icon}
                    <div className="min-w-0">
                      <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{spec.label}</div>
                      <div className={`text-sm font-medium capitalize truncate ${spec.color ? spec.color.text : ''}`}>{spec.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className={`capitalize text-xs gap-1.5 px-3 py-1 ${colorClasses(getFeatureColor(feature))}`}>
                        {feature === 'shield' && <Shield className="w-3 h-3" />}
                        {feature === 'multi_stage' && <Layers className="w-3 h-3" />}
                        {feature === 'twin' && <Layers className="w-3 h-3" />}
                        {!['shield', 'multi_stage', 'twin'].includes(feature) && <CheckCircle2 className="w-3 h-3" />}
                        {feature.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={product.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/15">
                    <ExternalLink className="w-4 h-4" />
                    View Product Page
                  </Button>
                </a>
                {datasheetUrl && (
                  <a
                    href={datasheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full gap-2">
                      <FileText className="w-4 h-4" />
                      Datasheet PDF
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </MotionDiv>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}
