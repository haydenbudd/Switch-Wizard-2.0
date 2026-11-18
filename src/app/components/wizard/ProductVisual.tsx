import { useState, type ElementType } from 'react';
import { getProxiedImageUrl, getProxiedImageSrcSet } from '@/app/utils/imageProxy';

/**
 * Card visual: a real Linemaster product photo (or two side by side), or the
 * icon if the photo can't load (offline, image CDN blocked).
 */
export function ProductVisual({
  image,
  icon: Icon,
  heightClass = 'h-24 md:h-32',
}: {
  image?: string | string[];
  icon?: ElementType;
  /** Height of the photo row */
  heightClass?: string;
}) {
  const [failed, setFailed] = useState(false);
  const images = image ? (Array.isArray(image) ? image : [image]) : [];
  if (images.length && !failed) {
    const width = images.length > 1 ? 200 : 320;
    return (
      <div className={`w-full ${heightClass} mb-4 flex items-center justify-center gap-2 shrink-0`}>
        {images.map(src => (
          <img
            key={src}
            src={getProxiedImageUrl(src, { width })}
            srcSet={getProxiedImageSrcSet(src, width)}
            alt=""
            loading="eager"
            onError={() => setFailed(true)}
            // Side-by-side photos share the width in proportion to their
            // aspect ratio, so a square and a wide photo end up the same height
            onLoad={images.length > 1 ? (e) => {
              const img = e.currentTarget;
              if (img.naturalHeight) img.style.flexGrow = String(img.naturalWidth / img.naturalHeight);
            } : undefined}
            className={`max-h-full object-contain transition-transform duration-300 group-hover:scale-105 ${images.length > 1 ? 'flex-1 basis-0 min-w-0' : 'max-w-full'}`}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-primary/8 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 mb-4 shrink-0">
      {Icon && <Icon className="w-8 h-8" aria-hidden="true" />}
    </div>
  );
}
