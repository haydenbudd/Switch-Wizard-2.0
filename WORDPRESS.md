# WordPress Deployment Guide

Step-by-step instructions for publishing the Linemaster Product Finder to your WordPress site.

## 1. Build the plugin

```bash
npm run build:wordpress
```

This runs the WordPress-specific Vite build and assembles the plugin directory at `dist-wordpress/linemaster-product-finder/`.

## 2. Create the zip

```bash
cd dist-wordpress
zip -r linemaster-product-finder.zip linemaster-product-finder/
```

## 3. Upload to WordPress

1. Log in to your WordPress admin (`linemaster.com/wp-admin`)
2. Go to **Plugins → Add New → Upload Plugin**
3. Choose `linemaster-product-finder.zip`
4. Click **Install Now**

## 4. Activate

Click **Activate Plugin** after it finishes installing.

## 5. Add to a page

1. Go to **Pages → Add New** (or edit an existing page)
2. Add a **Shortcode** block (or Custom HTML block) and paste:

```
[switch-wizard]
```

3. **Publish** / **Update** the page.

The wizard will render inline on that page.

## Optional shortcode settings

```
[switch-wizard height="600px"]              — custom min-height
[switch-wizard class="full-width-section"]  — add a CSS class to the wrapper
```

## Updating later

When you make changes to the wizard code:

1. Run `npm run build:wordpress` again
2. Zip the output
3. In WordPress: **Plugins → Deactivate** the old version → **Delete** it → **Upload** the new zip → **Activate**

Or if you have FTP/SSH access, you can replace the files directly in `wp-content/plugins/linemaster-product-finder/` without the deactivate/reinstall cycle.
