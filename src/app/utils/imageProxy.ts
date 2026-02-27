// Proxy linemaster.com images through wsrv.nl to bypass CORS/hotlink blocking.
// The linemaster.com CDN does not set Access-Control-Allow-Origin headers,
// so images fail to load from external origins like GitHub Pages.
export function getProxiedImageUrl(url: string): string {
  if (!url) return url;
  if (url.includes('linemaster.com')) {
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&default=1`;
  }
  return url;
}
