# Switch Wizard

Linemaster's footswitch product finder: a step-by-step wizard that narrows
Linemaster's stock footswitches down to the right one for a buyer's
application, with a separate flow for medical devices.

- **Live:** embedded on linemaster.com through the WordPress plugin in
  `wordpress/`, which loads the GitHub Pages build (see `WORDPRESS.md`).
- **Standalone:** https://haydenbudd.github.io/Switch-Wizard-2.0/
- **Admin:** `/admin` on the standalone site (Supabase sign-in).

## Stack

React 18, TypeScript, Vite, Tailwind CSS 4. Products are read from the
`Stock Switches` table in Supabase; wizard questions and options live in
`src/app/data/options.ts`. Usage analytics are written to `wizard_events`.

## Development

```bash
npm install
npm run dev        # local dev server
npx tsc --noEmit   # type-check
npm run build      # production build (deployed to GitHub Pages on push to main)
```

## Data scripts

`scripts/` holds the one-off pipeline used to scrape and import the product
catalog (`linemaster_all_294_products.json`, `Product Finder.csv`, and the
generated files in `scripts/output/`). It is not part of the app build.
