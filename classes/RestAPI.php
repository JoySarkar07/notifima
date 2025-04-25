<?php

namespace Notifima;

defined( 'ABSPATH' ) || exit;

class RestAPI
 {
    function __construct() {
        if ( current_user_can( 'manage_options' ) ) {
            add_action( 'rest_api_init', [ $this, 'register_restAPI' ] );
        }
    }

    /**
     * Rest api register function call on rest_api_init action hook.
     * @return void
     */
    public function register_restAPI() {
        register_rest_route( Notifima()->rest_namespace, '/settings', [
            'methods' => 'POST',
            'callback' => [ $this, 'set_settings' ],
            'permission_callback' => [ $this, 'notifima_permission' ],
        ] );

        register_rest_route( Notifima()->rest_namespace, '/stock-notification-form', [
            'methods' => 'GET',
            'callback' => [ $this, 'render_stock_notification_form' ],
            'permission_callback' => [ $this, 'notifima_permission' ],
        ] );
    }

    /**
     * Notifima api permission function.
     * @return bool
     */
    public function notifima_permission() {
        return true;
    }

    /**
     * Seve the setting set in react's admin setting page.
     * @param mixed $request
     * @return array
     */
    public function set_settings( $request ) {
        $all_details = [];
        $get_settings_data = $request->get_param( 'setting' );
        $settingsname = $request->get_param( 'settingName' );
        $settingsname = str_replace( "-", "_", $settingsname );
        $optionname = 'woo_stock_manager_' . $settingsname . '_tab_settings';

        // save the settings in database
        Notifima()->setting->update_option( $optionname, $get_settings_data );

        do_action( 'notifima_settings_after_save', $settingsname, $get_settings_data );

        $all_details[ 'error' ] = __( 'Settings Saved', 'notifima' );

        return $all_details;
    }

    public function render_stock_notification_form($request) {
        $product_id = $request->get_param('product_id');

        // Start output buffering
        ob_start();

        Notifima()->frontend->display_product_subscription_form(intval($product_id));
        // Return the output
        return rest_ensure_response(['html' => ob_get_clean()]);
    }
}