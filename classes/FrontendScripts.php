<?php

namespace Notifima;

defined( 'ABSPATH' ) || exit;

class FrontendScripts {

    public static $scripts = array();
    public static $styles  = array();

    public function __construct() {
        add_action( 'wp_enqueue_scripts', array( $this, 'load_scripts' ) );
    }

    public static function register_script( $handle, $path, $deps = array(), $version = '', $text_domain = '' ) {
        self::$scripts[] = $handle;
        wp_register_script( $handle, $path, $deps, $version, true );
        wp_set_script_translations( $handle, $text_domain );
    }

    public static function register_style( $handle, $path, $deps = array(), $version = '' ) {
        self::$styles[] = $handle;
        wp_register_style( $handle, $path, $deps, $version );
    }

    public static function register_scripts() {
        $version = Notifima()->version;
        $suffix  = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';

        error_log( 'FrontendUrl : ' . print_r( Notifima()->plugin_url . 'assets/js/notifima-frontend' . $suffix . '.js', true ) );

        $register_scripts = apply_filters(
            'notifima_register_scripts',
            array(
				'notifima-frontend-script' => array(
					'src'         => Notifima()->plugin_url . 'assets/js/notifima-frontend' . $suffix . '.js',
					'deps'        => array( 'jquery', 'wp-element', 'wp-components' ),
					'version'     => $version,
					'text_domain' => 'notifima',
				),
			)
        );
        foreach ( $register_scripts as $name => $props ) {
            self::register_script( $name, $props['src'], $props['deps'], $props['version'], $props['text_domain'] );
        }
    }

    public static function register_styles() {
        $version = Notifima()->version;
        $suffix  = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';

        $register_styles = apply_filters(
            'notifima_register_styles',
            array(
				'notifima-frontend-style' => array(
					'src'     => Notifima()->plugin_url . 'assets/styles/notifima-frontend' . $suffix . '.css',
					'deps'    => array(),
					'version' => $version,
				),
			)
        );
        foreach ( $register_styles as $name => $props ) {
            self::register_style( $name, $props['src'], $props['deps'], $props['version'] );
        }
    }

    /**
     * Register/queue frontend scripts.
     */
    public static function load_scripts() {
        self::register_scripts();
        self::register_styles();
    }

    public static function localize_scripts( $handle ) {
        $settings_array  = Utill::get_form_settings_array();
        $button_settings = $settings_array['customize_btn'];

        $border_size = ( ! empty( $button_settings['button_border_size'] ) ) ? $button_settings['button_border_size'] . 'px' : '1px';

        $button_css = '';
        if ( ! empty( $button_settings['button_background_color'] ) ) {
            $button_css .= 'background:' . $button_settings['button_background_color'] . '; ';
        }
        if ( ! empty( $button_settings['button_text_color'] ) ) {
            $button_css .= 'color:' . $button_settings['button_text_color'] . '; ';
        }
        if ( ! empty( $button_settings['button_border_color'] ) ) {
            $button_css .= 'border: ' . $border_size . ' solid ' . $button_settings['button_border_color'] . '; ';
        }
        if ( ! empty( $button_settings['button_font_size'] ) ) {
            $button_css .= 'font-size:' . $button_settings['button_font_size'] . 'px; ';
        }
        if ( ! empty( $button_settings['button_border_redious'] ) ) {
            $button_css .= 'border-radius:' . $button_settings['button_border_redious'] . 'px;';
        }

        $subscribe_button_html   = '<button style="' . $button_css . '" class="notifima-button alert_button_hover" name="alert_button">' . $button_settings['button_text'] . '</button>';
        $unsubscribe_button_html = '<button class="unsubscribe-button" style="' . $button_css . '">' . $settings_array['unsubscribe_button_text'] . '</button>';

        $localize_scripts = apply_filters(
            'notifima_localize_scripts',
            array(
				'notifima-frontend-script'                 => array(
					'object_name' => 'localizeData',
					'data'        => array(
						'ajax_url'                  => admin_url( 'admin-ajax.php', 'relative' ),
						'nonce'                     => wp_create_nonce( 'notifima-security-nonce' ),
						'additional_fields'         => apply_filters( 'notifima_subscription_form_additional_fields', array() ),
						'button_html'               => $subscribe_button_html,
						'alert_success'             => $settings_array['alert_success'],
						'alert_email_exist'         => $settings_array['alert_email_exist'],
						'valid_email'               => $settings_array['valid_email'],
						'ban_email_domain_text'     => $settings_array['ban_email_domain_text'],
						'ban_email_address_text'    => $settings_array['ban_email_address_text'],
						'double_opt_in_success'     => $settings_array['double_opt_in_success'],
						'processing'                => __( 'Processing...', 'notifima' ),
						'error_occurs'              => __( 'Some error occurs', 'notifima' ),
						'try_again'                 => __( 'Please try again.', 'notifima' ),
						'unsubscribe_button'        => $unsubscribe_button_html,
						'alert_unsubscribe_message' => $settings_array['alert_unsubscribe_message'],
						'recaptcha_enabled'         => apply_filters( 'notifima_recaptcha_enabled', false ),
					),
				),
				'notifima-stock-notification-block-script' => array(
					'object_name' => 'stockNotificationBlock',
					'data'        => array(
						'apiurl'  => untrailingslashit( get_rest_url() ),
						'restUrl' => Notifima()->rest_namespace,
						'nonce'   => wp_create_nonce( 'notifima-security-nonce' ),
					),
				),
				'notifima-stock-notification-block-editor-script' => array(
					'object_name' => 'stockNotificationBlock',
					'data'        => array(
						'apiurl'  => untrailingslashit( get_rest_url() ),
						'restUrl' => Notifima()->rest_namespace,
						'nonce'   => wp_create_nonce( 'notifima-security-nonce' ),
					),
				),
			)
        );

        if ( isset( $localize_scripts[ $handle ] ) ) {
            $props = $localize_scripts[ $handle ];
            self::localize_script( $handle, $props['object_name'], $props['data'] );
        }
    }

    public static function localize_script( $handle, $name, $data = array() ) {
        wp_localize_script( $handle, $name, $data );
    }

    public static function enqueue_script( $handle ) {
        wp_enqueue_script( $handle );
    }

    public static function enqueue_style( $handle ) {
        wp_enqueue_style( $handle );
    }
}
