<?php
/**
 * Plugin Name: Linemaster Product Finder
 * Plugin URI:  https://linemaster.com
 * Description: Interactive product-finder wizard that helps customers select the right Linemaster foot pedal switch.
 * Version:     2.0.0
 * Author:      Linemaster
 * Author URI:  https://linemaster.com
 * License:     Proprietary
 * Text Domain: linemaster-product-finder
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'LM_FINDER_VERSION', '2.0.0' );
define( 'LM_FINDER_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'LM_FINDER_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/**
 * Register the [switch-wizard] shortcode.
 *
 * Usage:
 *   [switch-wizard]                           — default (100% width, 800px min-height)
 *   [switch-wizard height="600px"]            — custom minimum height
 *   [switch-wizard class="my-custom-class"]   — additional CSS class on wrapper
 */
function lm_finder_shortcode( $atts ) {
	$atts = shortcode_atts(
		array(
			'height' => '800px',
			'class'  => '',
		),
		$atts,
		'switch-wizard'
	);

	// Enqueue assets only when the shortcode is actually used
	lm_finder_enqueue_assets();

	$extra_class = $atts['class'] ? ' ' . esc_attr( $atts['class'] ) : '';
	$height      = esc_attr( $atts['height'] );

	return '<div id="lm-product-finder" class="lm-product-finder-wp' . $extra_class . '" style="min-height:' . $height . ';width:100%;position:relative">'
		. '<div id="lm-wizard-root"></div>'
		. '</div>';
}
add_shortcode( 'switch-wizard', 'lm_finder_shortcode' );

/**
 * Enqueue the built React application assets.
 */
function lm_finder_enqueue_assets() {
	static $enqueued = false;
	if ( $enqueued ) {
		return;
	}
	$enqueued = true;

	$base = LM_FINDER_PLUGIN_URL . 'assets/';

	// Google Fonts used by the wizard (DM Sans + Outfit)
	wp_enqueue_style(
		'lm-finder-fonts',
		'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Outfit:wght@300;400;500;600;700;800&display=swap',
		array(),
		null
	);

	// Main stylesheet
	wp_enqueue_style(
		'lm-finder-style',
		$base . 'index.css',
		array( 'lm-finder-fonts' ),
		LM_FINDER_VERSION
	);

	// Vendor chunks (loaded before the app entry)
	$vendors = array( 'vendor-motion', 'vendor-radix', 'vendor-jspdf' );
	foreach ( $vendors as $vendor ) {
		wp_enqueue_script(
			'lm-finder-' . $vendor,
			$base . $vendor . '.js',
			array(),
			LM_FINDER_VERSION,
			true
		);
	}

	// Main application entry
	wp_enqueue_script(
		'lm-finder-app',
		$base . 'app.js',
		array_map( function ( $v ) { return 'lm-finder-' . $v; }, $vendors ),
		LM_FINDER_VERSION,
		true
	);

	// Vite outputs ES modules
	add_filter( 'script_loader_tag', 'lm_finder_add_module_type', 10, 3 );
}

/**
 * Add type="module" to our script tags so the browser treats them as ES modules.
 */
function lm_finder_add_module_type( $tag, $handle, $src ) {
	if ( strpos( $handle, 'lm-finder-' ) === 0 ) {
		$tag = str_replace( ' src=', ' type="module" src=', $tag );
	}
	return $tag;
}
