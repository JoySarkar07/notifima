<?php

namespace Notifima;

defined( 'ABSPATH' ) || exit;

class FrontEnd {

    public function __construct() {
        // enqueue scripts
        add_action( 'wp_enqueue_scripts', array( &$this, 'frontend_scripts' ) );
        // enqueue styles
        add_action( 'wp_enqueue_scripts', array( &$this, 'frontend_styles' ) );

        add_action( 'wp', array( $this, 'load_subscription_form' ) );

        // Hover style
        add_action( 'wp_head', array( $this, 'frontend_hover_styles' ) );

        add_filter( 'notifima_display_product_lead_time', array( $this, 'display_product_lead_time' ), 10 );
    }

    /**
     * Add the product subscription form in single product page
     */
    public function load_subscription_form() {
        if ( is_product() ) {
            add_action( 'woocommerce_simple_add_to_cart', array( $this, 'display_product_subscription_form' ), 31 );
            add_action( 'woocommerce_bundle_add_to_cart', array( $this, 'display_product_subscription_form' ), 31 );
            add_action( 'woocommerce_subscription_add_to_cart', array( $this, 'display_product_subscription_form' ), 31 );
            add_action( 'woocommerce_woosb_add_to_cart', array( $this, 'display_product_subscription_form' ), 31 );
            add_action( 'woocommerce_after_variations_form', array( $this, 'display_product_subscription_form' ), 31 );
            // support for grouped products
            add_filter( 'woocommerce_grouped_product_list_column_price', array( $this, 'display_in_grouped_product' ), 10, 2 );
        }
    }

    /**
     * Enque Frontend's JavaScript. And Send Localize data.
     *
     * @return void
     */
    public function frontend_scripts() {
        FrontendScripts::load_scripts();
        FrontendScripts::localize_scripts( 'notifima-frontend-script' );
        if ( is_product() || is_shop() || is_product_category() ) {
            // Enqueue your frontend javascript from here
            wp_enqueue_script( 'notifima-frontend-script' );
            FrontendScripts::enqueue_script( 'notifima-frontend-script' );
        }
    }

    /**
     * Enqueue fronted css.
     *
     * @return void
     */
    public function frontend_styles() {
        FrontendScripts::load_scripts();
        if ( function_exists( 'is_product' ) ) {
            if ( is_product() ) {
                // Enqueue your frontend stylesheet from here
                FrontendScripts::enqueue_style( 'notifima-frontend-style' );
            }
        }
    }

    /**
     * Set frontend's button hover style on 'wp_head' hook.
     *
     * @return void
     */
    public function frontend_hover_styles() {
        $settings_array       = Utill::get_form_settings_array();
        $button_settings      = $settings_array['customize_btn'];
        $button_onhover_style = $border_size = '';
        $border_size          = ( ! empty( $button_settings['button_border_size'] ) ) ? $button_settings['button_border_size'] . 'px' : '1px';

        if ( isset( $button_settings['button_background_color_onhover'] ) ) {
            $button_onhover_style .= ! empty( $button_settings['button_background_color_onhover'] ) ? 'background: ' . $button_settings['button_background_color_onhover'] . ' !important;' : '';
        }
        if ( isset( $button_settings['button_text_color_onhover'] ) ) {
            $button_onhover_style .= ! empty( $button_settings['button_text_color_onhover'] ) ? ' color: ' . $button_settings['button_text_color_onhover'] . ' !important;' : '';
        }
        if ( isset( $button_settings['button_border_color_onhover'] ) ) {
            $button_onhover_style .= ! empty( $button_settings['button_border_color_onhover'] ) ? 'border: ' . $border_size . ' solid' . $button_settings['button_border_color_onhover'] . ' !important;' : '';
        }
        if ( $button_onhover_style ) {
            echo '<style>
                button.alert_button_hover:hover, button.unsubscribe_button:hover {
                ' . esc_html( $button_onhover_style ) . '
                } 
            </style>';
        }
    }

    /**
     * Display product subscription form if product is outof stock
     *
     * @version 1.0.0
     */
    public function display_product_subscription_form( $productObj = null ) {
        global $product;

        $productObj = is_int( $productObj ) ? wc_get_product( $productObj ) : ( $productObj ?: $product );

        if ( empty( $productObj ) ) {
            return;
        }
        $guest_subscription_enabled = Notifima()->setting->get_setting( 'is_guest_subscriptions_enable' );
        $guest_subscription_enabled = is_array( $guest_subscription_enabled ) ? reset( $guest_subscription_enabled ) : false;
        if ( ! $guest_subscription_enabled && ! is_user_logged_in() ) {
            return;
        }

        $backorders_enabled = Notifima()->setting->get_setting( 'is_enable_backorders' );
        $backorders_enabled = is_array( $backorders_enabled ) ? reset( $backorders_enabled ) : false;

        $stock_status = $productObj->get_stock_status();
        if ( $stock_status == 'onbackorder' && ! $backorders_enabled ) {
            return;
        }

        if ( $productObj->is_type( 'variable' ) ) {
            $get_variations = count( $productObj->get_children() ) <= apply_filters( 'woocommerce_ajax_variation_threshold', 30, $productObj );
            $get_variations = $get_variations ? $productObj->get_available_variations() : false;
            if ( $get_variations ) {
                echo '<div class="notifima-shortcode-subscribe-form" data-product-id="' . esc_attr( $productObj->get_id() ) . '"></div>';
            } else {
                echo( $this->get_subscribe_form( $productObj ) );
            }
        } else {
            echo( $this->get_subscribe_form( $productObj ) );
        }
    }

    /**
     * Display Request Stock Form for grouped product
     *
     * @param string $value default html
     * @param object $child indivisual child of grouped product
     *
     * @version 1.0.0
     */
    public function display_in_grouped_product( $value, $child ) {
        $value = $value . $this->get_subscribe_form( $child );

        return $value;
    }

    /**
     * Get subscribe from's HTML content for a particular product.
     * If the product is not outofstock it return empty string.
     *
     * @param  mixed $product   product variable
     * @param  mixed $variation variation variable default null
     * @return string HTML of subscribe form
     */
    public function get_subscribe_form( $product, $variation = null ) {
        if ( ! Subscriber::is_product_outofstock( $variation ? $variation : $product ) ) {
            return '';
        }
        $notifima_fields_array = array();
        $notifima_fields_html  = $user_email = '';
        $separator             = apply_filters( 'notifima_subscription_form_fields_separator', '<br>' );
        $settings_array        = Utill::get_form_settings_array();
        $button_settings       = $settings_array['customize_btn'];

        if ( is_user_logged_in() ) {
            $current_user = wp_get_current_user();
            $user_email   = $current_user->data->user_email;
        }
        $placeholder  = $settings_array['email_placeholder_text'];
        $alert_fields = apply_filters(
            'notifima_add_fields_in_subscription_form',
            array(
				'alert_email' => array(
					'type'        => 'text',
					'class'       => 'notifima-email',
					'value'       => $user_email,
					'placeholder' => $placeholder,
				),
			),
            $settings_array
        );
        if ( $alert_fields ) {
            foreach ( $alert_fields as $key => $fvalue ) {
                $type        = in_array( $fvalue['type'], array( 'recaptcha-v3', 'text', 'number', 'email' ) ) ? esc_attr( $fvalue['type'] ) : 'text';
                $class       = isset( $fvalue['class'] ) ? esc_attr( $fvalue['class'] ) : 'notifima_' . $key;
                $value       = isset( $fvalue['value'] ) ? esc_attr( $fvalue['value'] ) : '';
                $placeholder = isset( $fvalue['placeholder'] ) ? esc_attr( $fvalue['placeholder'] ) : '';
                switch ( $fvalue['type'] ) {
                    case 'recaptcha-v3':
                        $recaptcha_type = isset( $fvalue['version'] ) ? esc_attr( $fvalue['version'] ) : 'v3';
                        $sitekey        = isset( $fvalue['sitekey'] ) ? esc_attr( $fvalue['sitekey'] ) : '';
                        $secretkey      = isset( $fvalue['secretkey'] ) ? esc_attr( $fvalue['secretkey'] ) : '';

                        $recaptchaScript = '
                        <script>
                            grecaptcha.ready( function () {
                                grecaptcha.execute( "' . $sitekey . '" ).then( function ( token ) {
                                    var recaptchaResponse = document.getElementById( "recaptchav3_response" );
                                    recaptchaResponse.value = token;
                                }  );
                            }  );
                        </script>';

                        $recaptchaResponseInput  = '<input type="hidden" id="recaptchav3_response" name="recaptchav3_response" value="" />';
                        $recaptchaSiteKeyInput   = '<input type="hidden" id="recaptchav3_sitekey" name="recaptchav3_sitekey" value="' . esc_html( $sitekey ) . '" />';
                        $recaptchaSecretKeyInput = '<input type="hidden" id="recaptchav3_secretkey" name="recaptchav3_secretkey" value="' . esc_html( $secretkey ) . '" />';

                        $notifima_fields_array[] = $recaptchaScript . $recaptchaResponseInput . $recaptchaSiteKeyInput . $recaptchaSecretKeyInput;
                        break;
                    default:
                        $notifima_fields_array[] = '<input id="notifima_' . $key . '" type="' . $type . '" name="' . $key . '" class="' . $class . '" value="' . $value . '" placeholder="' . $placeholder . '" >';
                        break;
                }
            }
        }
        if ( $notifima_fields_array ) {
            $notifima_fields_html = implode( $separator, $notifima_fields_array );
        }

        $alert_text_html = '<h5 style="color:' . esc_html( $settings_array['alert_text_color'] ) . '" class="subscribe_for_interest_text">' . esc_html( $settings_array['alert_text'] ) . '</h5>';

        $button_css  = '';
        $border_size = ( ! empty( $button_settings['button_border_size'] ) ) ? esc_html( $button_settings['button_border_size'] ) . 'px' : '1px';
        if ( ! empty( $button_settings['button_background_color'] ) ) {
            $button_css .= 'background:' . esc_html( $button_settings['button_background_color'] ) . ';';
        }
        if ( ! empty( $button_settings['button_text_color'] ) ) {
            $button_css .= 'color:' . esc_html( $button_settings['button_text_color'] ) . ';';
        }
        if ( ! empty( $button_settings['button_border_color'] ) ) {
            $button_css .= 'border: ' . $border_size . ' solid ' . esc_html( $button_settings['button_border_color'] ) . ';';
        }
        if ( ! empty( $button_settings['button_font_size'] ) ) {
            $button_css .= 'font-size:' . esc_html( $button_settings['button_font_size'] ) . 'px;';
        }
        if ( ! empty( $button_settings['button_border_radious'] ) ) {
            $button_css .= 'border-radius:' . esc_html( $button_settings['button_border_radious'] ) . 'px;';
        }

        $button_html = '<button style="' . $button_css . '" class="notifima-button alert_button_hover" name="alert_button">' . esc_html( $button_settings['button_text'] ) . '</button>';

        $interested_person = get_post_meta( $variation ? $variation->get_id() : $product->get_id(), 'no_of_subscribers', true );
        $interested_person = ( isset( $interested_person ) && $interested_person > 0 ) ? $interested_person : 0;

        $shown_interest_html = '';
        $shown_interest_text = esc_html( $settings_array['shown_interest_text'] );

        $is_enable_no_interest = Notifima()->setting->get_setting( 'is_enable_no_interest' );
        $is_enable_no_interest = is_array( $is_enable_no_interest ) ? reset( $is_enable_no_interest ) : false;

        if ( $is_enable_no_interest && $interested_person != 0 && $shown_interest_text ) {
            $shown_interest_text = str_replace( '%no_of_subscribed%', $interested_person, $shown_interest_text );
            $shown_interest_html = '<p>' . $shown_interest_text . '</p>';
        }

        $lead_text_html = apply_filters( 'notifima_display_product_lead_time', $variation ? $variation : $product );

        return $lead_text_html .
        '<div class="notifima-subscribe-form" style="border-radius:10px;">
            ' . $alert_text_html . '
            <div class="fields_wrap"> ' . $notifima_fields_html . '' . $button_html . '
            </div>
            <input type="hidden" class="current-product-id" value="' . esc_attr( $product->get_id() ) . '" />
            <input type="hidden" class="current-variation-id" value="' . esc_attr( $variation ? $variation->get_id() : 0 ) . '" />
            <input type="hidden" class="current-product-name" value="' . esc_attr( $product->get_title() ) . '" />
            ' . $shown_interest_html . '
        </div>';
    }

    /**
     * Display lead time for a product
     *
     * @version 2.5.12
     */
    public function display_product_lead_time( $product ) {
        if ( empty( $product ) ) {
            return;
        }
        $display_lead_times = Notifima()->setting->get_setting( 'display_lead_times' );
        if ( ! empty( $display_lead_times ) && in_array( $product->get_stock_status(), $display_lead_times ) ) {
            $lead_time_static_text = Notifima()->setting->get_setting( 'lead_time_static_text' );

            return '<p>' . esc_html( $lead_time_static_text ) . '</p>';
        }

        return '';
    }
}
