<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class CAP_Database {

    const DB_VERSION = '1.1';
    const OPTION_KEY = 'cap_db_version';

    public static function install() {
        global $wpdb;
        $charset = $wpdb->get_charset_collate();
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';

        /* ── deals ──────────────────────────────────────────────────────────── */
        dbDelta( "CREATE TABLE {$wpdb->prefix}cap_deals (
            id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id     BIGINT UNSIGNED NOT NULL DEFAULT 0,
            company     VARCHAR(255) NOT NULL DEFAULT '',
            contact     VARCHAR(255) NOT NULL DEFAULT '',
            amount      DECIMAL(14,2) NOT NULL DEFAULT 0,
            currency    VARCHAR(10)  NOT NULL DEFAULT 'ARS',
            stage       VARCHAR(100) NOT NULL DEFAULT 'lead',
            industry    VARCHAR(100) NOT NULL DEFAULT '',
            notes       TEXT,
            probability TINYINT UNSIGNED NOT NULL DEFAULT 0,
            close_date  DATE DEFAULT NULL,
            created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY stage (stage)
        ) $charset;" );

        /* ── activities ─────────────────────────────────────────────────────── */
        dbDelta( "CREATE TABLE {$wpdb->prefix}cap_activities (
            id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id     BIGINT UNSIGNED NOT NULL DEFAULT 0,
            type        VARCHAR(50)  NOT NULL DEFAULT 'note',
            title       VARCHAR(255) NOT NULL DEFAULT '',
            notes       TEXT,
            deal_id     BIGINT UNSIGNED DEFAULT NULL,
            contact     VARCHAR(255) DEFAULT NULL,
            completed   TINYINT(1)   NOT NULL DEFAULT 0,
            due_date    DATETIME     DEFAULT NULL,
            created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY deal_id (deal_id)
        ) $charset;" );

        /* ── contacts ───────────────────────────────────────────────────────── */
        dbDelta( "CREATE TABLE {$wpdb->prefix}cap_contacts (
            id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id     BIGINT UNSIGNED NOT NULL DEFAULT 0,
            name        VARCHAR(255) NOT NULL DEFAULT '',
            email       VARCHAR(255) NOT NULL DEFAULT '',
            phone       VARCHAR(80)  NOT NULL DEFAULT '',
            company     VARCHAR(255) NOT NULL DEFAULT '',
            position    VARCHAR(150) NOT NULL DEFAULT '',
            industry    VARCHAR(100) NOT NULL DEFAULT '',
            notes       TEXT,
            tags        TEXT,
            score       TINYINT UNSIGNED NOT NULL DEFAULT 0,
            created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY email (email(191))
        ) $charset;" );

        /* ── brochure templates ─────────────────────────────────────────────── */
        dbDelta( "CREATE TABLE {$wpdb->prefix}cap_templates (
            id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id     BIGINT UNSIGNED NOT NULL DEFAULT 0,
            name        VARCHAR(255) NOT NULL DEFAULT '',
            industry    VARCHAR(100) NOT NULL DEFAULT '',
            color_theme VARCHAR(50)  NOT NULL DEFAULT 'navy',
            hide_prices TINYINT(1)   NOT NULL DEFAULT 0,
            hide_chatbot TINYINT(1)  NOT NULL DEFAULT 0,
            brochure_data LONGTEXT,
            created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_id (user_id)
        ) $charset;" );

        /* ── api keys (cifradas) ────────────────────────────────────────────── */
        dbDelta( "CREATE TABLE {$wpdb->prefix}cap_api_keys (
            id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id     BIGINT UNSIGNED NOT NULL DEFAULT 0,
            service     VARCHAR(80)  NOT NULL DEFAULT '',
            api_key_enc TEXT         NOT NULL,
            created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY user_service (user_id, service)
        ) $charset;" );

        /* ── saved leads (Patagonia Explorer) ──────────────────────────────── */
        dbDelta( "CREATE TABLE {$wpdb->prefix}cap_leads (
            id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id     BIGINT UNSIGNED NOT NULL DEFAULT 0,
            name        VARCHAR(255) NOT NULL DEFAULT '',
            address     VARCHAR(500) NOT NULL DEFAULT '',
            phone       VARCHAR(80)  NOT NULL DEFAULT '',
            website     VARCHAR(500) NOT NULL DEFAULT '',
            rating      DECIMAL(3,1) NOT NULL DEFAULT 0,
            reviews     INT UNSIGNED NOT NULL DEFAULT 0,
            industry    VARCHAR(150) NOT NULL DEFAULT '',
            city        VARCHAR(150) NOT NULL DEFAULT '',
            province    VARCHAR(150) NOT NULL DEFAULT '',
            meddic_data LONGTEXT,
            status      VARCHAR(50)  NOT NULL DEFAULT 'new',
            created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY status (status)
        ) $charset;" );

        /* ── products (Productos) ──────────────────────────────────────────── */
        dbDelta( "CREATE TABLE {$wpdb->prefix}cap_products (
            id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id     BIGINT UNSIGNED NOT NULL DEFAULT 0,
            code        VARCHAR(100) NOT NULL DEFAULT '',
            name        VARCHAR(255) NOT NULL DEFAULT '',
            price       DECIMAL(14,2) DEFAULT NULL,
            category    VARCHAR(150) NOT NULL DEFAULT '',
            subcategory VARCHAR(150) NOT NULL DEFAULT '',
            unit        VARCHAR(50)  NOT NULL DEFAULT '',
            active      TINYINT(1)   NOT NULL DEFAULT 1,
            created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY category (category)
        ) $charset;" );

        /* ── sellers (Vendedores) ───────────────────────────────────────────── */
        dbDelta( "CREATE TABLE {$wpdb->prefix}cap_sellers (
            id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id     BIGINT UNSIGNED NOT NULL DEFAULT 0,
            name        VARCHAR(255) NOT NULL DEFAULT '',
            phone       VARCHAR(80)  NOT NULL DEFAULT '',
            email       VARCHAR(255) NOT NULL DEFAULT '',
            specialty   VARCHAR(50)  NOT NULL DEFAULT 'general',
            branch      VARCHAR(255) NOT NULL DEFAULT '',
            active      TINYINT(1)   NOT NULL DEFAULT 1,
            created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_id (user_id)
        ) $charset;" );

        /* ── branches (Sucursales) ────────────────────────────────────────── */
        dbDelta( "CREATE TABLE {$wpdb->prefix}cap_branches (
            id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id     BIGINT UNSIGNED NOT NULL DEFAULT 0,
            name        VARCHAR(255) NOT NULL DEFAULT '',
            address     VARCHAR(500) NOT NULL DEFAULT '',
            city        VARCHAR(150) NOT NULL DEFAULT '',
            phone       VARCHAR(80)  NOT NULL DEFAULT '',
            schedule    VARCHAR(500) NOT NULL DEFAULT '',
            active      TINYINT(1)   NOT NULL DEFAULT 1,
            created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_id (user_id)
        ) $charset;" );

        /* ── conversations (WhatsApp bot) ────────────────────────────────── */
        dbDelta( "CREATE TABLE {$wpdb->prefix}cap_conversations (
            id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id         BIGINT UNSIGNED NOT NULL DEFAULT 0,
            customer_name   VARCHAR(255) NOT NULL DEFAULT '',
            customer_phone  VARCHAR(80)  NOT NULL DEFAULT '',
            channel         VARCHAR(50)  NOT NULL DEFAULT 'whatsapp',
            status          VARCHAR(50)  NOT NULL DEFAULT 'activa',
            query_type      VARCHAR(50)  NOT NULL DEFAULT 'otro',
            summary         TEXT,
            assigned_seller VARCHAR(255) NOT NULL DEFAULT '',
            created_date    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY status (status)
        ) $charset;" );

        update_option( self::OPTION_KEY, self::DB_VERSION );
    }

    public static function deactivate() {
        flush_rewrite_rules();
    }

    /** Corre migraciones si la versión de DB cambió */
    public static function maybe_upgrade() {
        if ( get_option( self::OPTION_KEY ) !== self::DB_VERSION ) {
            self::install();
        }
    }

    /* ── helpers ──────────────────────────────────────────────────────────── */

    public static function encrypt( string $value ): string {
        if ( ! defined( 'SECURE_AUTH_KEY' ) || SECURE_AUTH_KEY === '' ) return base64_encode( $value );
        $iv  = random_bytes( 16 );
        $enc = openssl_encrypt( $value, 'AES-256-CBC', SECURE_AUTH_KEY, 0, $iv );
        return base64_encode( $iv . $enc );
    }

    public static function decrypt( string $value ): string {
        if ( ! defined( 'SECURE_AUTH_KEY' ) || SECURE_AUTH_KEY === '' ) return base64_decode( $value );
        $raw = base64_decode( $value );
        $iv  = substr( $raw, 0, 16 );
        $enc = substr( $raw, 16 );
        return openssl_decrypt( $enc, 'AES-256-CBC', SECURE_AUTH_KEY, 0, $iv ) ?: '';
    }
}
