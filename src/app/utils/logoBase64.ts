// The logo is inlined as a base64 data URI at build time (Vite `?inline`),
// NOT fetched at runtime. A runtime fetch resolved against import.meta.env
// .BASE_URL ("/Switch-Wizard-2.0/...") works on GitHub Pages but resolves
// against the HOST page's origin when the wizard is embedded in WordPress —
// there it 404s, the HTML error page gets passed to jsPDF.addImage, and the
// whole PDF throws "wrong PNG signature". Inlining removes the network
// dependency entirely, so PDF generation works in every embedding context.
import logoDataUri from '@/assets/linemaster-logo.png?inline';

export async function getLogoBase64(): Promise<string> {
  return logoDataUri;
}
