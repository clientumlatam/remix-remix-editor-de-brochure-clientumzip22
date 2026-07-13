<?php

class WebinarSysteemTextOverride
{
    public static function get_text($key) {
        $text = [
            'woocommerce-webinar-tickets-title' => __('My Webinar Tickets', 'wp-webinarsystem'),
            'woocommerce-webinar-tickets-webinar' => __('Webinar', 'wp-webinarsystem'),
            'woocommerce-webinar-tickets-date' => __('Session', 'wp-webinarsystem'),
            'woocommerce-webinar-tickets-join' => __('Join', 'wp-webinarsystem'),
            'woocommerce-webinar-tickets-join-webinar' => __('Join webinar', 'wp-webinarsystem'),
            'woocommerce-webinar-tickets-time' => __('Time', 'wp-webinarsystem'),
            'woocommerce-webinar-tickets-order' => __('Order', 'wp-webinarsystem')
        ];

        return apply_filters('wpws_text_override', $text[$key], $key);
    }

    public static function e($key) {
        echo esc_html(self::get_text($key));
    }
}
