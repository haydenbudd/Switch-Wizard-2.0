import prefixSelector from 'postcss-prefix-selector';

export default {
  plugins: [
    prefixSelector({
      prefix: '#lm-product-finder',
      transform(prefix, selector, prefixedSelector) {
        if (selector === ':root') return prefix;
        if (selector === 'body') return prefix;
        if (selector === 'html') return prefix;
        // .dark theme class (not dark: utility class names which have a backslash)
        if (selector === '.dark') return `${prefix}.lm-dark`;
        if (selector === '.dark body' || selector === '.dark html') return `${prefix}.lm-dark`;
        if (selector.startsWith('.dark ')) return selector.replace('.dark ', `${prefix}.lm-dark `);
        return prefixedSelector;
      },
    }),
  ],
};
