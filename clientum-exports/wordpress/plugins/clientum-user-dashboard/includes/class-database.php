<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class Clntm_Database {

    public static function install() {
        global $wpdb;
        $c = $wpdb->get_charset_collate();
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';

        dbDelta("CREATE TABLE {$wpdb->prefix}clntm_contacts (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL DEFAULT 0,
            name varchar(200) NOT NULL DEFAULT '',
            email varchar(200) DEFAULT '',
            phone varchar(50) DEFAULT '',
            company varchar(200) DEFAULT '',
            status varchar(50) DEFAULT 'active',
            source varchar(100) DEFAULT '',
            notes text DEFAULT '',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY idx_user_id (user_id)
        ) $c;");

        dbDelta("CREATE TABLE {$wpdb->prefix}clntm_companies (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL DEFAULT 0,
            name varchar(200) NOT NULL DEFAULT '',
            industry varchar(100) DEFAULT '',
            website varchar(200) DEFAULT '',
            email varchar(200) DEFAULT '',
            phone varchar(50) DEFAULT '',
            address text DEFAULT '',
            notes text DEFAULT '',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY idx_user_id (user_id)
        ) $c;");

        dbDelta("CREATE TABLE {$wpdb->prefix}clntm_leads (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL DEFAULT 0,
            name varchar(200) NOT NULL DEFAULT '',
            email varchar(200) DEFAULT '',
            phone varchar(50) DEFAULT '',
            company varchar(200) DEFAULT '',
            source varchar(100) DEFAULT '',
            status varchar(50) DEFAULT 'new',
            value decimal(12,2) DEFAULT 0,
            notes text DEFAULT '',
            contact_id bigint(20) DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY idx_user_id (user_id)
        ) $c;");

        dbDelta("CREATE TABLE {$wpdb->prefix}clntm_deals (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL DEFAULT 0,
            title varchar(200) NOT NULL DEFAULT '',
            contact_id bigint(20) DEFAULT 0,
            company varchar(200) DEFAULT '',
            value decimal(12,2) DEFAULT 0,
            stage varchar(100) DEFAULT 'Descubrimiento',
            notes text DEFAULT '',
            expected_close date DEFAULT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY idx_user_id (user_id)
        ) $c;");

        dbDelta("CREATE TABLE {$wpdb->prefix}clntm_activities (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL DEFAULT 0,
            title varchar(200) NOT NULL DEFAULT '',
            type varchar(50) DEFAULT 'task',
            contact_id bigint(20) DEFAULT 0,
            lead_id bigint(20) DEFAULT 0,
            deal_id bigint(20) DEFAULT 0,
            notes text DEFAULT '',
            activity_date datetime DEFAULT NULL,
            completed tinyint(1) DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY idx_user_id (user_id)
        ) $c;");

        dbDelta("CREATE TABLE {$wpdb->prefix}clntm_products (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL DEFAULT 0,
            name varchar(200) NOT NULL DEFAULT '',
            description text DEFAULT '',
            price decimal(12,2) DEFAULT 0,
            stock int(11) DEFAULT 0,
            sku varchar(100) DEFAULT '',
            category varchar(100) DEFAULT '',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY idx_user_id (user_id)
        ) $c;");

        dbDelta("CREATE TABLE {$wpdb->prefix}clntm_invoices (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL DEFAULT 0,
            number varchar(50) DEFAULT '',
            contact_id bigint(20) DEFAULT 0,
            contact_name varchar(200) DEFAULT '',
            status varchar(50) DEFAULT 'draft',
            items longtext DEFAULT '',
            subtotal decimal(12,2) DEFAULT 0,
            tax decimal(12,2) DEFAULT 0,
            total decimal(12,2) DEFAULT 0,
            due_date date DEFAULT NULL,
            notes text DEFAULT '',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY idx_user_id (user_id)
        ) $c;");

        dbDelta("CREATE TABLE {$wpdb->prefix}clntm_quotes (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL DEFAULT 0,
            number varchar(50) DEFAULT '',
            contact_id bigint(20) DEFAULT 0,
            contact_name varchar(200) DEFAULT '',
            status varchar(50) DEFAULT 'draft',
            items longtext DEFAULT '',
            subtotal decimal(12,2) DEFAULT 0,
            tax decimal(12,2) DEFAULT 0,
            total decimal(12,2) DEFAULT 0,
            valid_until date DEFAULT NULL,
            notes text DEFAULT '',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY idx_user_id (user_id)
        ) $c;");

        update_option( 'clntm_db_ver', CLNTM_DB_VER );
    }
}
