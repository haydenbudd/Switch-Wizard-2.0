=== Linemaster Product Finder ===
Contributors: linemaster
Tags: product finder, wizard, foot switch, linemaster
Requires at least: 5.6
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 2.1.0
License: Proprietary

Interactive product-finder wizard for Linemaster foot pedal switches.

== Description ==

The Linemaster Product Finder is a guided wizard that helps customers navigate
the full range of Linemaster foot pedal switches. Assets are served from GitHub
Pages so updates deploy automatically when you push to the main branch.

= Features =

* 9-step guided product selection wizard
* Dedicated medical-device flow
* Real-time product counts at each step
* Search, sort, and filter results
* PDF export of selections
* Light / dark theme toggle
* Fully responsive design

== Installation ==

1. Upload the `linemaster-product-finder` folder to `/wp-content/plugins/`.
2. Activate the plugin through the **Plugins** menu in WordPress.
3. Add the `[switch-wizard]` shortcode to any page or post.

Updates are automatic — just push to the GitHub repo.

== Usage ==

**Basic:**

    [switch-wizard]

**Custom minimum height:**

    [switch-wizard height="600px"]

**Extra CSS class:**

    [switch-wizard class="my-section"]

== Changelog ==

= 2.1.0 =
* Assets now served from GitHub Pages — no re-upload needed for updates.
* Fix card overflow on industry selection step.
* Add trust badges bar.

= 2.0.0 =
* Initial WordPress plugin release.
