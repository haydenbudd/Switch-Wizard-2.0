# WordPress Deployment Guide

The WordPress plugin is a thin wrapper: it registers the `[switch-wizard]`
shortcode and loads the wizard's JavaScript and CSS straight from GitHub Pages
(`https://haydenbudd.github.io/Switch-Wizard-2.0/assets/`). There is no
separate WordPress build. Pushing to `main` deploys GitHub Pages, and every
page using the plugin picks up the change automatically.

## Install the plugin

1. Zip the `wordpress/` folder as `linemaster-product-finder.zip`, with the
   folder inside renamed to `linemaster-product-finder/`:

   ```bash
   cp -r wordpress linemaster-product-finder
   zip -r linemaster-product-finder.zip linemaster-product-finder
   rm -r linemaster-product-finder
   ```

2. In WordPress admin go to **Plugins → Add New → Upload Plugin**, choose the
   zip, click **Install Now**, then **Activate**.

## Add to a page

Add a **Shortcode** block (or Custom HTML block) and paste:

```
[switch-wizard]
```

Optional settings:

```
[switch-wizard height="600px"]              — custom min-height
[switch-wizard class="full-width-section"]  — add a CSS class to the wrapper
```

## When you need to update the plugin itself

Only when `wordpress/linemaster-product-finder.php` changes. The main case is
the chunk file names: the plugin enqueues `vendor-radix.js` and `app.js`
by name, so if the `manualChunks` setup in
`vite.config.ts` changes, update the `$vendors` list in the PHP file, bump its
version, and re-upload the zip.

`public/assets/vendor-motion.js` is an empty placeholder kept for plugin
versions up to 2.1.3, which still request that file. It can be deleted once
every site runs 2.1.4 or later.

## Pre-filled quote form

Every Request a Quote button in the wizard opens
`https://linemaster.com/request-a-quote/?Application=…&comments=…`, where
`comments` holds the visitor's answers, the product(s) and a link back to
their results. The quote form is Contact Form 7 (form ID 3293), which only
fills a field from the URL when that field's tag has `default:get`. Until it
does, the form opens empty and visitors paste the details the wizard copied
to their clipboard.

To turn pre-filling on, in WordPress admin go to **Contact → Contact Forms →
Request a Quote** (ID 3293), and on the **Form** tab:

1. Add `default:get` to the Message tag. For example
   `[textarea* comments placeholder "Message *"]` becomes
   `[textarea* comments default:get placeholder "Message *"]`.
2. Add `default:get` to the Application tag, and make its "Application" text
   a placeholder rather than a value, so a blank field isn't sent as the word
   "Application". For example `[text Application "Application"]` becomes
   `[text Application default:get placeholder "Application"]`.
3. Save. Keep the field names exactly `comments` and `Application`: the
   wizard sends parameters with those names, and they are case-sensitive.

No change is needed on the **Mail** tab, as long as it already includes
`[comments]` and `[Application]`.
