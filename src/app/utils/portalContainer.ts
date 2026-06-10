// All app CSS is scoped by postcss-prefix-selector (see postcss.config.mjs)
// to two roots: the main #lm-product-finder wrapper and a dedicated
// #lm-product-finder-portals element that this module manages.
//
// Radix portals (dropdowns, selects, drawers, dialogs) MUST NOT render
// inside the main wrapper: on a WordPress host page, any theme ancestor with
// a CSS transform/filter becomes the containing block for position:fixed,
// which mispositions popovers (a menu landing on top of its trigger gets
// select-on-release — "stays open only while held"). The portal root is a
// direct child of <body>, so fixed positioning always resolves against the
// viewport, while still receiving the scoped CSS (vars, fonts, colors).

const PORTAL_ROOT_ID = 'lm-product-finder-portals';
const APP_ROOT_ID = 'lm-product-finder';

let observer: MutationObserver | null = null;

function syncDarkClass(portalRoot: HTMLElement) {
  const appRoot = document.getElementById(APP_ROOT_ID);
  if (!appRoot) return;
  portalRoot.classList.toggle('lm-dark', appRoot.classList.contains('lm-dark'));
}

export function getPortalContainer(): HTMLElement {
  let portalRoot = document.getElementById(PORTAL_ROOT_ID);
  if (!portalRoot) {
    portalRoot = document.createElement('div');
    portalRoot.id = PORTAL_ROOT_ID;
    document.body.appendChild(portalRoot);
  }

  // Mirror the app wrapper's .lm-dark class so dark-mode styles apply to
  // portaled content too (Header toggles the class on the wrapper only).
  syncDarkClass(portalRoot);
  if (!observer) {
    const appRoot = document.getElementById(APP_ROOT_ID);
    if (appRoot) {
      observer = new MutationObserver(() => syncDarkClass(portalRoot!));
      observer.observe(appRoot, { attributes: true, attributeFilter: ['class'] });
    }
  }

  return portalRoot;
}
