// Proxy linemaster.com images through wsrv.nl to bypass CORS/hotlink blocking.
// The linemaster.com CDN does not set Access-Control-Allow-Origin headers,
// so images fail to load from external origins like GitHub Pages.
//
// wsrv.nl also handles resizing and WebP conversion for faster loading.

interface ImageOptions {
  /** Max width in pixels. Defaults to 600. */
  width?: number;
  /** Image quality 1-100. Defaults to 75. */
  quality?: number;
}

export function getProxiedImageUrl(url: string, opts?: ImageOptions): string {
  if (!url) return url;
  if (url.includes('linemaster.com')) {
    const w = opts?.width ?? 600;
    const q = opts?.quality ?? 75;
    // No &default=1 — that flag makes wsrv return a placeholder with HTTP 200
    // on source 404, hiding broken images from ImageWithFallback's onError.
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${w}&q=${q}&output=webp`;
  }
  return url;
}

/**
 * Build a 1x/2x srcset for retina displays. Browsers pick the right entry
 * based on devicePixelRatio, so high-DPI screens get sharp images without
 * making low-DPI screens download the extra bytes.
 */
export function getProxiedImageSrcSet(url: string, baseWidth: number, quality?: number): string | undefined {
  if (!url || !url.includes('linemaster.com')) return undefined;
  const url1x = getProxiedImageUrl(url, { width: baseWidth, quality });
  const url2x = getProxiedImageUrl(url, { width: baseWidth * 2, quality });
  return `${url1x} 1x, ${url2x} 2x`;
}
