import { memo } from 'react';
import { GlassCard } from './GlassCard';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Product } from '@/app/lib/api';
import { ArrowRight, Star, Shield, Zap, Wind, CheckCircle2, Package } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { getProxiedImageUrl } from '@/app/utils/imageProxy';

// Icon mapping for features - defined outside component to avoid re-creation on every render
function FeatureIcon({ feature }: { feature: string }) {
  switch (feature) {
    case 'shield': return <Shield className="w-3 h-3 mr-1" />;
    case 'wireless': return <Zap className="w-3 h-3 mr-1" />;
    case 'pneumatic': return <Wind className="w-3 h-3 mr-1" />;
    default: return <CheckCircle2 className="w-3 h-3 mr-1" />;
  }
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard = memo(function ProductCard({ product }: ProductCardProps) {
  if (!product) return null;
  const isFlagship = product.flagship;

  return (
    <GlassCard
      className="h-full flex flex-col group relative overflow-hidden transition-all duration-500"
      hoverEffect={true}
    >
      {/* Featured/Flagship Badge */}
      {isFlagship && (
        <div className="absolute top-4 right-4 z-20">
          <Badge className="bg-[var(--accent-warm)] text-[var(--accent-warm-foreground)] border-transparent backdrop-blur-sm shadow-sm shadow-[var(--accent-warm)]/20 flex items-center gap-1 text-[11px] tracking-wide uppercase">
            <Star className="w-3 h-3 fill-current opacity-70" />
            Top Choice
          </Badge>
        </div>
      )}

      {/* Product Image Area */}
      <div className="relative aspect-[4/3] -mx-6 -mt-6 mb-4 bg-gradient-to-b from-secondary/80 to-transparent p-6 flex items-center justify-center overflow-hidden">
        {/* Background blobs for depth */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
        
        {product.image ? (
          <ImageWithFallback
            src={getProxiedImageUrl(product.image)}
            alt={product.series}
            className="w-full h-full object-contain relative z-10 transition-transform duration-700 group-hover:scale-110 drop-shadow-xl"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center relative z-10">
            <div className="text-center text-muted-foreground/40">
              <Package className="w-12 h-12 mx-auto mb-2" />
              <span className="text-xs font-medium">{product.series}</span>
            </div>
          </div>
        )}
        
        {/* Quick specs overlay on hover */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-between text-xs font-medium z-20 border-t border-border/30" aria-hidden="true">
          <span>{product.ip}</span>
          <span className="capitalize">{product.material}</span>
          <span className="capitalize">{product.duty} Duty</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1">
        <div className="mb-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">
              {product.series}
            </h3>
            {product.part_number && (
              <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded">
                #{product.part_number}
              </span>
            )}
          </div>
          <div className="text-sm text-primary/80 font-medium mb-1 capitalize flex items-center gap-2">
            {product.technology}
            <span className="w-1 h-1 rounded-full bg-current opacity-50" aria-hidden="true" />
            <span className={product.duty === 'heavy' ? 'text-[var(--accent-warm)]' : ''}>
              {product.duty} Duty
            </span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Feature Tags */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {product.features?.slice(0, 3).map((feature) => (
            <Badge 
              key={feature} 
              variant="secondary" 
              className="text-[10px] bg-secondary/50 hover:bg-secondary transition-colors px-2 py-0.5 h-5 font-normal capitalize"
            >
              <FeatureIcon feature={feature} />
              {feature.replace('_', ' ')}
            </Badge>
          ))}
          {(product.features?.length || 0) > 3 && (
            <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal">
              +{(product.features?.length || 0) - 3}
            </Badge>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
          <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
            aria-label={`View details for ${product.series}`}
          >
            <Button className="w-full group/btn bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/15 text-primary-foreground border-0 transition-all duration-300" tabIndex={-1}>
              View Details
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" aria-hidden="true" />
            </Button>
          </a>
        </div>
      </div>
    </GlassCard>
  );
});
