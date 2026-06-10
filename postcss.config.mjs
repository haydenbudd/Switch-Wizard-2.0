import prefixSelector from 'postcss-prefix-selector';

// All app CSS is scoped to the wizard so it can't leak into a host WordPress
// page. Two scope roots share the same rules via :is():
//   #lm-product-finder         — the main app wrapper
//   #lm-product-finder-portals — a direct child of <body> that Radix portals
//     (dropdowns, selects, drawers, dialogs) render into. It must live on
//     <body> because position:fixed breaks inside any host-page ancestor
//     with a CSS transform/filter — portaling popovers into the app wrapper
//     made them misposition on themes that animate their page containers.
//     (see src/app/utils/portalContainer.ts)
// :is() keeps specificity identical to the previous single-ID prefix.
const SCOPE = ':is(#lm-product-finder, #lm-product-finder-portals)';

export default {
  plugins: [
    prefixSelector({
      prefix: SCOPE,
      transform(prefix, selector, prefixedSelector) {
        if (selector === ':root') return prefix;
        if (selector === 'body') return prefix;
        if (selector === 'html') return prefix;
        if (selector === ':host') return prefix;
        // .dark theme class (not dark: utility class names which have a backslash)
        if (selector === '.dark') return `${prefix}.lm-dark`;
        if (selector === '.dark body' || selector === '.dark html') return `${prefix}.lm-dark`;
        if (selector.startsWith('.dark ')) return selector.replace('.dark ', `${prefix}.lm-dark `);
        return prefixedSelector;
      },
    }),
  ],
};
