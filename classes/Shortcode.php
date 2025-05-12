<?php

namespace Notifima;

defined( 'ABSPATH' ) || exit;

class Shortcode {

    public function __construct() {
        // Product Notifima Subscription Form Shortcode.
        add_shortcode( 'notifima_subscription_form', array( $this, 'notifima_subscription_form' ) );
    }

    /**
     * display notifima subscription form wrapper function for Shortcode rendering
     *
     * @access public
     * @param  mixed $function
     * @param  array $atts     ( default: array() )
     * @return string
     */
    public function notifima_subscription_form( $attr ) {
        ob_start();
        $product_id = isset( $attr['product_id'] ) ? (int) $attr['product_id'] : 0;

        do_action( 'notifima_before_subscription_form' );

        Notifima()->frontend->display_product_subscription_form( $product_id );

        do_action( 'notifima_after_subscription_form' );

        return ob_get_clean();
    }
}
