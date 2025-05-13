<?php
class Notifima_Core_Test extends WP_UnitTestCase {
    
    public function test_plugin_is_installed() {
        $this->assertNotFalse(
            get_option('notifima_installed'),
            'Activation hook should set this option'
        );
    }
   
}