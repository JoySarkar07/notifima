<?php

// Extract the productId from attributes
$product_id = isset($attributes['productId']) ? intval($attributes['productId']) : null;

// Display the product subscription form
Notifima()->frontend->display_product_subscription_form($product_id, true);