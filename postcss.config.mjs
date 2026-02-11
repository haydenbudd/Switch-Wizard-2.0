import prefixSelector from 'postcss-prefix-selector';

export default {
  plugins: [
    prefixSelector({
      prefix: '#lm-product-finder',
      transform(prefix, selector, prefixedSelector) {
        if (selector === ':root') return prefix;
        if (selector === 'body') return prefix;
        if (selector === 'html') return prefix;
        if (selector.startsWith('.dark body')) return `${prefix}.lm-dark`;
        if (selector.startsWith('.dark')) return selector.replace('.dark', `${prefix}.lm-dark`);
        return prefixedSelector;
      },
    }),
  ],
};
