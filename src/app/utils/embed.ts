/**
 * True when the wizard is embedded in another page (linemaster.com), false on
 * its own standalone GitHub Pages site. The host page already supplies the
 * page title, branding and light theme, so embedded mode drops the app's own.
 *
 * Detected from the DOM at runtime: every embed loads the same GitHub Pages
 * build, and embeds differ — the WordPress plugin renders #lm-wizard-root,
 * while a bare embed uses #lm-product-finder > #root, the same markup as
 * the standalone page. So the standalone index.html marks itself with
 * data-lm-standalone, and everything else counts as embedded.
 */
export const ON_SITE =
  typeof document !== 'undefined' && !document.querySelector('[data-lm-standalone]');
