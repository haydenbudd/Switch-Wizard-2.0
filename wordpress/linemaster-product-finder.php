<?php
/**
 * Plugin Name: Linemaster Product Finder
 * Description: Interactive product selection wizard for Linemaster foot switches. Assets served from GitHub Pages.
 * Version: 2.1.0
 * Author: Linemaster
 * License: Proprietary
 * Text Domain: linemaster-product-finder
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'LM_PF_VERSION', '2.1.0' );

// GitHub Pages base URL — assets are served from here.
// Update automatically when you push to the main branch.
define( 'LM_PF_ASSETS_URL', 'https://haydenbudd.github.io/Switch-Wizard-2.0/assets/' );
define( 'LM_PF_BASE_URL', 'https://haydenbudd.github.io/Switch-Wizard-2.0/' );

/**
 * Enqueue the built React app assets only on pages that use the shortcode.
 */
function lm_pf_enqueue_assets() {
    global $post;
    if ( ! is_a( $post, 'WP_Post' ) || ! has_shortcode( $post->post_content, 'linemaster_product_finder' ) ) {
        return;
    }

    // Google Fonts used by the wizard
    wp_enqueue_style(
        'lm-pf-google-fonts',
        'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Outfit:wght@300;400;500;600;700;800&display=swap',
        array(),
        null
    );

    // Main CSS bundle from GitHub Pages
    wp_enqueue_style(
        'lm-pf-styles',
        LM_PF_ASSETS_URL . 'index.css',
        array( 'lm-pf-google-fonts' ),
        LM_PF_VERSION
    );

    // Main JS bundle from GitHub Pages (module type)
    wp_enqueue_script(
        'lm-pf-app',
        LM_PF_ASSETS_URL . 'app.js',
        array(),
        LM_PF_VERSION,
        true
    );

    // Add type="module" so Vite's ES module output works
    add_filter( 'script_loader_tag', 'lm_pf_add_module_type', 10, 3 );
}
add_action( 'wp_enqueue_scripts', 'lm_pf_enqueue_assets' );

/**
 * Add type="module" to our script tag.
 */
function lm_pf_add_module_type( $tag, $handle, $src ) {
    if ( 'lm-pf-app' === $handle ) {
        $tag = str_replace( '<script ', '<script type="module" crossorigin ', $tag );
    }
    return $tag;
}

/**
 * Shortcode: [linemaster_product_finder]
 */
function lm_pf_shortcode( $atts ) {
    $atts = shortcode_atts( array(
        'min_height' => '600px',
    ), $atts, 'linemaster_product_finder' );

    $min_height = esc_attr( $atts['min_height'] );

    return '<div id="lm-product-finder" style="min-height:' . $min_height . '"><div id="root"></div></div>';
}
add_shortcode( 'linemaster_product_finder', 'lm_pf_shortcode' );
