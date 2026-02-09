import { GlassCard } from './GlassCard';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Product } from '@/app/lib/api';
import { ArrowRight, Star, Shield, Zap, Wind, CheckCircle2, Package } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { getProxiedImageUrl } from '@/app/utils/imageProxy';

interface ProductCardProps {
  product: Product;
  highlight?: boolean; // If true, applies a featured style
}

export function ProductCard({ product, highlight = false }: ProductCardProps) {
  const isMedical = (product.applications || []).includes('medical');
  const isFlagship = product.flagship;

  // Icon mapping for features
  const FeatureIcon = ({ feature }: { feature: string }) => {
    switch (feature) {
      case 'shield': return <Shield className="w-3 h-3 mr-1" />;
      case 'wireless': return <Zap className="w-3 h-3 mr-1" />; // Or Wifi icon
      case 'pneumatic': return <Wind className="w-3 h-3 mr-1" />;
      default: return <CheckCircle2 className="w-3 h-3 mr-1" />;
    }
  };

  return (
    <GlassCard 
      className={`h-full flex flex-col group relative overflow-hidden transition-all duration-500 ${
        highlight ? 'border-blue-500/30 shadow-xl shadow-blue-500/10' : ''
      }`}
      hoverEffect={true}
    >
      {/* Featured/Flagship Badge */}
      {isFlagship && (
        <div className="absolute top-4 right-4 z-20">
          <Badge className="bg-yellow-400/90 text-yellow-950 border-yellow-200 backdrop-blur-sm shadow-sm flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-700" />
            Top Choice
          </Badge>
        </div>
      )}

      {/* Product Image Area */}
      <div className="relative aspect-[4/3] -mx-6 -mt-6 mb-4 bg-gradient-to-b from-gray-50/50 to-transparent dark:from-white/5 p-6 flex items-center justify-center overflow-hidden">
        {/* Background blobs for depth */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors duration-500" />
        
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
        <div className="absolute inset-x-0 bottom-0 p-3 bg-white/90 dark:bg-black/80 backdrop-blur-md translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-between text-xs font-medium z-20 border-t border-white/10">
          <span>{product.ip}</span>
          <span className="capitalize">{product.material}</span>
          <span className="capitalize">{product.duty} Duty</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1">
        <div className="mb-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {product.series}
            </h3>
            {product.part_number && (
              <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded">
                #{product.part_number}
              </span>
            )}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1 capitalize flex items-center gap-2">
            {product.technology}
            <span className="w-1 h-1 rounded-full bg-current opacity-50" />
            <span className={product.duty === 'heavy' ? 'text-orange-600 dark:text-orange-400' : ''}>
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
          >
            <Button className="w-full group/btn bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/20 text-white border-0">
              View Details
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </a>
        </div>
      </div>
    </GlassCard>
  );
}
