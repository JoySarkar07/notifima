<?php

/**
 * Notifima Email Admin Email
 *
 * Override this template by copying it to yourtheme/woocommerce-product-stock-alert/emails/plain/AdminEmail.php
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

echo sprintf( esc_html__( 'Hi there. A customer has subscribed to a product on your shop. Product details are shown below for your reference:', 'notifima' ) ) . "\n\n";

echo "\n****************************************************\n\n";

echo "\n Product Name : " . esc_html( $product->get_name() );

echo "\n\n Product link : " . esc_html( $product->get_permalink() );

echo "\n\n\n****************************************************\n\n";

echo "\n\n Customer Details : " . esc_html( $args['customer_email'] );

echo "\n\n\n****************************************************\n\n";


echo esc_html( apply_filters( 'woocommerce_email_footer_text', get_option( 'woocommerce_email_footer_text' ) ) );
