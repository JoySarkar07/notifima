<?php

namespace Notifima\Emails;

defined( 'ABSPATH' ) || exit; // Exit if accessed directly

if ( ! class_exists( 'AdminEmail' ) ) :

    /**
     * Email to Admin for notifima
     *
     * An email will be sent to the admin when customer subscribe an out of stock product.
     *
     * @class       WC_Admin_Email_Notifima
     * @version     1.3.0
     * @author      MultivendorX
     * @extends     \WC_Email
     */
    class AdminEmail extends \WC_Email {

        public $product;
        public $customer_email;
        public $recipient = '';

        /**
         * Constructor
         *
         * @access public
         * @return void
         */
        public function __construct() {
            $this->id             = 'notifima_subscriber_confimation_admin';
            $this->title          = __( 'Alert admin', 'notifima' );
            $this->description    = __( 'Admin will get an alert when customer subscribe any out of stock product', 'notifima' );
            $this->template_html  = 'emails/AdminEmail.php';
            $this->template_plain = 'emails/plain/AdminEmail.php';
            $this->template_base  = Notifima()->plugin_path . 'templates/';

            // Call parent constuctor
            parent::__construct();
        }

        /**
         * trigger function.
         *
         * @access public
         * @return void
         */
        public function trigger( $recipient, $product, $customer_email ) {

            $this->recipient      = $recipient;
            $this->product        = $product;
            $this->customer_email = $customer_email;

            if ( ! $this->is_enabled() || ! $this->get_recipient() ) {
                return;
            }

            $this->send( $this->get_recipient(), $this->get_subject(), $this->get_content(), $this->get_headers(), $this->get_attachments() );
        }

        /**
         * Get email subject.
         *
         * @since  1.4.7
         * @return string
         */
        public function get_default_subject() {
            return apply_filters( 'notifima_customer_subscription_admin_email_subject', __( 'A Customer has subscribed to a product on {site_title} ', 'notifima' ), $this->object );
        }

        /**
         * Get email heading.
         *
         * @since  1.4.7
         * @return string
         */
        public function get_default_heading() {
            return apply_filters( 'notifima_customer_subscription_admin_email_heading', __( 'Welcome to {site_title} ', 'notifima' ), $this->object );
        }

        /**
         * get_content_html function.
         *
         * @access public
         * @return string
         */
        public function get_content_html() {
            ob_start();
            Notifima()->util->get_template(
                $this->template_html,
                array(
					'email_heading'  => $this->get_heading(),
					'product'        => $this->product,
					'customer_email' => $this->customer_email,
					'sent_to_admin'  => true,
					'plain_text'     => false,
					'email'          => $this,
				)
            );

            return ob_get_clean();
        }

        /**
         * get_content_plain function.
         *
         * @access public
         * @return string
         */
        public function get_content_plain() {
            ob_start();
            Notifima()->util->get_template(
                $this->template_plain,
                array(
					'email_heading'  => $this->get_heading(),
					'product'        => $this->product,
					'customer_email' => $this->customer_email,
					'sent_to_admin'  => true,
					'plain_text'     => false,
					'email'          => $this,
				)
            );

            return ob_get_clean();
        }
    }
endif;
