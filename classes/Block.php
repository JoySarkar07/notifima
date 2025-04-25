<?php

namespace Notifima;
defined( 'ABSPATH' ) || exit;

class Block {
    private $blocks;

    public function __construct() {
        // Register the block
        add_action( 'init', [$this, 'register_blocks'] );
        // Enqueue the script and style for block editor
        add_action( 'enqueue_block_assets', [ $this,'enqueue_all_block_assets'] );


        $this->blocks = [
            [
                'name' => 'stock-notification-block', // block name
                // src link is generated (which is append from block name) within the function
				'react_dependencies'   => ['wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-i18n'], // the react dependencies which required in js
                'localize' => [
					'object_name' => 'stockNotificationBlock', // the localized variable name
                    // all the data that is required in index.js
					'data' => [
                        'apiUrl'  => '', // this set blank because in scope the get_rest_url() is not defined
                        'restUrl' => Notifima()->rest_namespace,
                        'nonce'   => wp_create_nonce( 'notifima-security-nonce' )
					],
				],
            ]
        ];
    }

    public function enqueue_all_block_assets() {

        foreach ($this->blocks as $block_script) {
            wp_set_script_translations( $block_script['name'], 'notifima' );
            if (isset($block_script['localize'])) {
                $block_script['localize']['data']['apiUrl'] = untrailingslashit( get_rest_url() );
                wp_localize_script('notifima-' . $block_script['name'] . '-editor-script', $block_script['localize']['object_name'], $block_script['localize']['data']);
                wp_localize_script('notifima-' . $block_script['name'] . '-script', $block_script['localize']['object_name'], $block_script['localize']['data']);
			}
		}
    }
    
    public function register_blocks() {
    
        foreach ($this->blocks as $block) {
            register_block_type(Notifima()->plugin_path . 'build/block/' . $block['name']);
        }
    }
    
}