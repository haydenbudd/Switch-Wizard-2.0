<?php
/**
 * Plugin Name: Linemaster Product Finder
 * Description: Interactive product selection wizard for Linemaster foot switches.
 * Version: 2.0.0
 * Author: Linemaster
 * License: Proprietary
 * Text Domain: linemaster-product-finder
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'LM_PF_VERSION', '2.0.0' );
define( 'LM_PF_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'LM_PF_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/**
 * Enqueue the built React app assets only on pages that use the shortcode.
 */
function lm_pf_enqueue_assets() {
    // Only load when the shortcode is present on the page
    global $post;
    if ( ! is_a( $post, 'WP_Post' ) || ! has_shortcode( $post->post_content, 'linemaster_product_finder' ) ) {
        return;
    }

    $assets_url = LM_PF_PLUGIN_URL . 'assets/';

    // Google Fonts used by the wizard
    wp_enqueue_style(
        'lm-pf-google-fonts',
        'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Outfit:wght@300;400;500;600;700;800&display=swap',
        array(),
        null // no version for external fonts
    );

    // Main CSS bundle
    wp_enqueue_style(
        'lm-pf-styles',
        $assets_url . 'index.css',
        array( 'lm-pf-google-fonts' ),
        LM_PF_VERSION
    );

    // Main JS bundle (module type)
    wp_enqueue_script(
        'lm-pf-app',
        $assets_url . 'app.js',
        array(),
        LM_PF_VERSION,
        true // load in footer
    );

    // Vite outputs ES modules — add type="module" attribute
    add_filter( 'script_loader_tag', 'lm_pf_add_module_type', 10, 3 );

    // Vendor chunks are loaded dynamically by the main bundle via relative imports,
    // so we don't need to enqueue them separately.
}
add_action( 'wp_enqueue_scripts', 'lm_pf_enqueue_assets' );

/**
 * Add type="module" to our script tag so Vite's ES module output works.
 */
function lm_pf_add_module_type( $tag, $handle, $src ) {
    if ( 'lm-pf-app' === $handle ) {
        $tag = str_replace( '<script ', '<script type="module" ', $tag );
    }
    return $tag;
}

/**
 * Shortcode: [linemaster_product_finder]
 *
 * Renders the mount point div. The React app attaches to #root inside
 * the #lm-product-finder container (matches the scoped CSS prefix).
 */
function lm_pf_shortcode( $atts ) {
    // Accept optional height attribute
    $atts = shortcode_atts( array(
        'min_height' => '600px',
    ), $atts, 'linemaster_product_finder' );

    $min_height = esc_attr( $atts['min_height'] );

    return '<div id="lm-product-finder" style="min-height:' . $min_height . '"><div id="root"></div></div>';
}
add_shortcode( 'linemaster_product_finder', 'lm_pf_shortcode' );
