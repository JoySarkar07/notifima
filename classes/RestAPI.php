<?php

namespace Notifima;

defined( 'ABSPATH' ) || exit;

class RestAPI {

    public function __construct() {
        if ( current_user_can( 'manage_options' ) ) {
            add_action( 'rest_api_init', array( $this, 'register_restAPI' ) );
        }
    }

    /**
     * Rest api register function call on rest_api_init action hook.
     *
     * @return void
     */
    public function register_restAPI() {
        register_rest_route(
            Notifima()->rest_namespace,
            '/settings',
            array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'set_settings' ),
				'permission_callback' => array( $this, 'notifima_permission' ),
			)
        );

        register_rest_route(
            Notifima()->rest_namespace,
            '/stock-notification-form',
            array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'render_notifima_form' ),
				'permission_callback' => array( $this, 'notifima_permission' ),
			)
        );
    }

    /**
     * Notifima api permission function.
     *
     * @return bool
     */
    public function notifima_permission() {
        return true;
    }

    /**
     * Seve the setting set in react's admin setting page.
     *
     * @param  mixed $request
     * @return array
     */
    public function set_settings( $request ) {
        $all_details       = array();
        $get_settings_data = $request->get_param( 'setting' );
        $settingsname      = $request->get_param( 'settingName' );
        $settingsname      = str_replace( '-', '_', $settingsname );
        $optionname        = 'notifima_' . $settingsname . '_settings';

        // save the settings in database
        Notifima()->setting->update_option( $optionname, $get_settings_data );

        do_action( 'notifima_after_save_settings', $settingsname, $get_settings_data );

        $all_details['error'] = __( 'Settings Saved', 'notifima' );

        return $all_details;
    }

    public function render_notifima_form( $request ) {
        $product_id = $request->get_param( 'product_id' );

        // Start output buffering
        ob_start();

        Notifima()->frontend->display_product_subscription_form( intval( $product_id ) );

        // Return the output
        return rest_ensure_response( array( 'html' => ob_get_clean() ) );
    }
}
