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
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${w}&q=${q}&output=webp&default=1`;
  }
  return url;
}
