=== Linemaster Product Finder ===
Contributors: linemaster
Tags: product finder, wizard, foot switch
Requires at least: 5.8
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 2.0.0
License: Proprietary

Interactive product selection wizard for Linemaster foot switches.

== Description ==

Embed the Linemaster Product Finder wizard on any page or post using the
`[linemaster_product_finder]` shortcode. The wizard guides customers through a
series of questions — application, technology, environment, duty level — and
returns matching foot switch products.

== Installation ==

1. Run `npm run build:wordpress` in the project root.
2. Copy the `wordpress/` directory into `wp-content/plugins/linemaster-product-finder/`.
3. Copy the contents of `dist-wordpress/assets/` into the plugin's `assets/` folder:
   `wp-content/plugins/linemaster-product-finder/assets/`
4. Activate the plugin from the WordPress admin Plugins screen.
5. Add `[linemaster_product_finder]` to any page or post.

== Shortcode ==

`[linemaster_product_finder]` — renders the product finder widget.

Optional attributes:
- `min_height` — minimum height of the container (default: `600px`).

Example: `[linemaster_product_finder min_height="800px"]`

== Changelog ==

= 2.0.0 =
* Initial WordPress plugin release.
* Full product finder wizard with standard and medical flows.
* Supabase-backed product data.
* PDF export, shareable result URLs, analytics tracking.
