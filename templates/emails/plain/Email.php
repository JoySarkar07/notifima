<?php

/**
 * Notifima Email
 *
 * Override this template by copying it to yourtheme/woocommerce-product-stock-alert/emails/plain/Email.php
 *
 * @author    MultiVendorX
 * @package   woocommerce-product-stock-alert/templates
 * @version   1.3.0
 */
if ( ! defined( 'ABSPATH' ) ) {
    exit;
} // Exit if accessed directly

echo esc_html( $args['email_heading'] ) . "\n\n";

$product = $args['product'];

echo sprintf( esc_html__( 'Hi there. You have subscribed to a product. Your subscribed product is available now. Product details are shown below for your reference:', 'notifima' ) ) . "\n\n";

echo "\n****************************************************\n\n";

echo "\n Product Name : " . esc_html( $product->get_name() );

echo "\n\n Product Price : " . esc_html( wc_price( wc_get_price_to_display( $product ) ) );

echo "\n\n Product link : " . esc_html( $product->get_permalink() );

echo "\n\n\n****************************************************\n\n";

echo "\n\n Your Details : " . esc_html( $args['customer_email'] );

echo "\n\n\n****************************************************\n\n";

echo esc_html( apply_filters( 'woocommerce_email_footer_text', get_option( 'woocommerce_email_footer_text' ) ) );
