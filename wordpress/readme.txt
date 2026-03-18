=== Linemaster Product Finder ===
Contributors: linemaster
Tags: product finder, wizard, foot switch
Requires at least: 5.8
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 2.1.0
License: Proprietary

Interactive product selection wizard for Linemaster foot switches.

== Description ==

Embed the Linemaster Product Finder wizard on any page or post using the
`[linemaster_product_finder]` shortcode. Assets are served from GitHub Pages
so updates deploy automatically when you push to the main branch.

== Installation ==

1. Upload this plugin folder to `wp-content/plugins/`.
2. Activate the plugin from the WordPress admin Plugins screen.
3. Add `[linemaster_product_finder]` to any page or post.

That's it — no need to re-upload when the wizard is updated. Just push to
the GitHub repo and the changes go live automatically.

== Shortcode ==

`[linemaster_product_finder]` — renders the product finder widget.

Optional attributes:
- `min_height` — minimum height of the container (default: `600px`).

Example: `[linemaster_product_finder min_height="800px"]`

== Changelog ==

= 2.1.0 =
* Assets now served from GitHub Pages — no re-upload needed for updates.

= 2.0.0 =
* Initial WordPress plugin release.
