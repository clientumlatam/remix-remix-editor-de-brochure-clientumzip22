<?php
/**
 * Plugin load class.
 *
 * @author   ThimPress
 * @package  LearnPress/Import-Export/Classes
 * @version  3.0.1
 */

// Prevent loading this file directly
use LearnPress\Models\UserModel;

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'LP_Addon_Import_Export' ) ) {
	/**
	 * Class LP_Addon_Import_Export
	 */
	class LP_Addon_Import_Export extends LP_Addon {
		private static $_instance = false;

		public static function instance() {
			if ( ! self::$_instance ) {
				self::$_instance = new self();
			}

			return self::$_instance;
		}

		/**
		 * @var string
		 */
		public $version = LP_ADDON_IMPORT_EXPORT_VER;

		/**
		 * @var string
		 */
		public $require_version = LP_ADDON_IMPORT_EXPORT_REQUIRE_VER;

		/**
		 * Path file addon.
		 *
		 * @var string
		 */
		public $plugin_file = LP_ADDON_IMPORT_EXPORT_FILE;

		/**
		 * LP_Addon_Import_Export constructor.
		 */
		public function __construct() {
			parent::__construct();

			$this->hooks();
		}

		/**
		 * Include required core files used in admin and on the frontend.
		 *
		 * @since 3.0.0
		 */
		protected function _includes() {
			include_once LP_ADDON_IMPORT_EXPORT_INC . 'functions.php';
			include_once LP_ADDON_IMPORT_EXPORT_INC . 'parsers.php';
			//run background
			include_once LP_ADDON_IMPORT_EXPORT_INC . 'admin/background/class-lp-import-export-background.php';
		}

		/**
		 * Hook into actions and filters.
		 */
		protected function hooks() {
			add_action( 'learn-press/admin/menu-items', array( $this, 'admin_menu' ) );
			add_action( 'admin_enqueue_scripts', array( $this, 'admin_scripts' ) );
			add_action( 'admin_init', array( $this, 'do_action' ) );

			global $pagenow;
			if ( ! in_array( $pagenow, array( 'export.php', 'import.php' ), true ) ) {
				include_once LP_ADDON_IMPORT_EXPORT_INC . 'class-lp-import.php';
				include_once LP_ADDON_IMPORT_EXPORT_INC . 'class-lp-export.php';
			}
		}

		/**
		 * Add admin menu.
		 */
		public function admin_menu( $menu_items = array() ) {
			$menu_items['import-export'] = include_once LP_ADDON_IMPORT_EXPORT_PATH . '/views/admin/sub-menus/class-lp-submenu-import-export.php';

			return $menu_items;
		}

		/**
		 * Admin import export page.
		 */
		public static function admin_page() {
			wp_enqueue_style( 'learn-press-import-export-style' );
			lpie_admin_view( 'settings-page' );
		}

		/**
		 * Admin script.
		 */
		public function admin_scripts() {
			$min    = '.min';
			$ver    = LP_ADDON_IMPORT_EXPORT_VER;
			$is_rtl = is_rtl() ? '-rtl' : '';
			if ( LP_Debug::is_debug() ) {
				$min = '';
				$ver = uniqid();
			}

			wp_register_script(
				'learn-press-import-script',
				$this->get_plugin_url( 'assets/js/import.js' ),
				array(
					'jquery',
					'backbone',
					'wp-util',
					'plupload',
				),
				$ver,
				[ 'strategy' => 'defer' ]
			);

			wp_register_script(
				'learn-press-export-script',
				$this->get_plugin_url( 'assets/js/export.js' ),
				array(
					'jquery',
					'backbone',
					'wp-util',
				),
				$ver,
				[ 'strategy' => 'defer' ]
			);

			wp_register_script(
				'learn-press-import-user-script',
				$this->get_plugin_url( 'assets/js/import-user.js' ),
				array(
					'jquery',
					'backbone',
					'wp-util',
				),
				$ver,
				[ 'strategy' => 'defer' ]
			);

			wp_register_style(
				'learn-press-import-export-style',
				$this->get_plugin_url( "assets/dist/css/admin/export-import{$is_rtl}{$min}.css" ),
				array(),
				$ver
			);
		}

		/**
		 * Do actions when admin init.
		 *
		 * All import/export actions are admin-only operations. Gate the entire
		 * block here so that non-admin users and guests never trigger file
		 * system access, tmp cleanup, or the custom action hook.
		 */
		public function do_action() {
			// Single capability guard — nothing below runs for non-admins or guests.
			if ( ! current_user_can( 'manage_options' ) ) {
				return;
			}

			do_action( 'learn_press_import_export_actions' );

			// delete files
			$this->_delete_files();
			// download file
			$this->_download_file();
			// delete temp
			$this->_delete_tmp();
		}

		/**
		 * Delete file what was imported/exported.
		 *
		 * Capability is already enforced by do_action(). Nonce is verified
		 * here as a CSRF guard. Capability check comes first (correct order).
		 */
		private function _delete_files() {
			// delete file
			if ( ! empty( $_REQUEST['delete-export'] ) ) {
				if ( ! wp_verify_nonce( $_REQUEST['nonce'] ?? '', 'lpie-delete-export-file' ) ) {
					wp_die( __( 'Security check failed.', 'learnpress-import-export' ) );
				}

				$file = learn_press_get_request( 'delete-export' );
				if ( $file ) {
					$file = explode( ',', $file );
					foreach ( $file as $f ) {
						lpie_delete_file( 'learnpress/export/' . basename( $f ) );
					}
				}
				wp_redirect( admin_url( 'admin.php?page=learnpress-import-export&tab=export' ) );
				exit();
			}
			if ( ! empty( $_REQUEST['delete-import'] ) ) {
				if ( ! wp_verify_nonce( $_REQUEST['nonce'] ?? '', 'lpie-delete-import-file' ) ) {
					wp_die( __( 'Security check failed.', 'learnpress-import-export' ) );
				}

				$file = learn_press_get_request( 'delete-import' );
				if ( $file ) {
					$file = explode( ',', $file );
					foreach ( $file as $f ) {
						lpie_delete_file( 'learnpress/import/' . basename( $f ) );
					}
				}
				wp_redirect( admin_url( 'admin.php?page=learnpress-import-export&tab=import' ) );
				exit();
			}
		}

		/**
		 * Download file what was imported/exported.
		 *
		 * Capability is already enforced by do_action(). Each branch still
		 * requires its own nonce as a CSRF guard.
		 */
		private function _download_file() {
			// download file was exported
			if ( ! empty( $_REQUEST['download-export'] ) && wp_verify_nonce(
				$_REQUEST['nonce'] ?? '',
				'lpie-download-export-file'
			) ) {
				$file = learn_press_get_request( 'download-export' );
				$file = basename( $file );
				lpie_export_header( $file );
				echo lpie_get_contents( 'learnpress/export/' . $file );
				die();
			}
			// download file was imported
			if ( ! empty( $_REQUEST['download-import'] ) && wp_verify_nonce(
				$_REQUEST['nonce'] ?? '',
				'lpie-download-import-file'
			) ) {
				$file = learn_press_get_request( 'download-import' );
				$file = basename( $file );
				lpie_export_header( $file );
				echo lpie_get_contents( 'learnpress/import/' . $file );
				die();
			}
			// download a generic file (restricted to known learnpress subdirectories)
			if ( ! empty( $_REQUEST['download-file'] ) && wp_verify_nonce(
				$_REQUEST['nonce'] ?? '',
				'lpie-download-file'
			) ) {
				$file      = learn_press_get_request( 'download-file' );
				$safe_file = basename( $file );

				// Restrict to known learnpress subdirectories only.
				if ( strpos( $file, 'learnpress/export/' ) === 0 ) {
					$subdir = 'learnpress/export/';
				} elseif ( strpos( $file, 'learnpress/import/' ) === 0 ) {
					$subdir = 'learnpress/import/';
				} else {
					// Default to tmp (covers download_export flow).
					$subdir = 'learnpress/tmp/';
				}

				$alias = ! empty( $_REQUEST['alias'] ) ? sanitize_file_name( $_REQUEST['alias'] ) : $safe_file;
				lpie_export_header( $alias );
				echo lpie_get_contents( $subdir . $safe_file );
				die();
			}
		}

		/**
		 * Delete temp files.
		 */
		private function _delete_tmp() {
			$filesystem = lpie_filesystem();
			if ( $filesystem ) {
				$path = lpie_root_path() . '/learnpress/tmp';
				$list = $filesystem->dirlist( $path );
				if ( $list ) {
					foreach ( $list as $file ) {
						if ( time() - $file['lastmodunix'] > HOUR_IN_SECONDS ) {
							@unlink( $path . '/' . $file['name'] );
						}
					}
				}
			}
		}
	}
}
