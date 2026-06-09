// All app CSS is scoped under #lm-product-finder by postcss-prefix-selector
// (see postcss.config.mjs). Radix portals default to document.body, which is
// OUTSIDE that wrapper — portaled content (dropdowns, drawers, selects) would
// render completely unstyled. Always portal into the scoped wrapper instead.
export function getPortalContainer(): HTMLElement {
  return document.getElementById('lm-product-finder') ?? document.body;
}
