<?php
/**
 * Learnpress Import User class.
 *
 * @author   ThimPress
 * @package  LearnPress/Import-Export/Classes
 * @version  3.0.0
 */

// Prevent loading this file directly
defined( 'ABSPATH' ) || exit;

// Load Importer API
require_once ABSPATH . 'wp-admin/includes/import.php';

if ( ! class_exists( 'WP_Importer' ) ) {
	$class_wp_importer = ABSPATH . 'wp-admin/includes/class-wp-importer.php';
	if ( file_exists( $class_wp_importer ) ) {
		require $class_wp_importer;
	}
}

if ( ! class_exists( 'LP_Import_User_LearnPress' ) ) {
	/**
	 * Class LP_Import_User_LearnPress.
	 */
	class LP_Import_User_LearnPress {

		/**
		 * @var null
		 */
		protected static $_instance = null;

		/**
		 * @var array
		 */
		private $processed_posts = array();

		/**
		 * @var array
		 */
		private $processed_authors = array();

		/**
		 * @var array
		 */
		private $processed_terms = array();

		/**
		 * @var array
		 */
		private $processed_thumbnails = array();

		/**
		 * @var int
		 */
		private $posts_count = 0;

		/**
		 * @var int
		 */
		private $posts_imported = 0;

		/**
		 * @var array
		 */
		private $posts_duplication = array();

		/**
		 * LP_Import_User_LearnPress constructor.
		 */
		public function __construct() {

			add_action( 'lpie_import_form', array( $this, 'add_form' ), 10, 1 );
			
			if ( ! empty( LP_Request::get_param('lpie_import_user_data') ) ) {
				add_action( 'lpie_import_user_step_1', array( $this, 'step_1' ) );
				add_action( 'lpie_import_user_step_2', array( $this, 'step_2' ) );
				add_action( 'lpie_import_user_step_3', array( $this, 'step_3' ) );
			}

			add_action( 'lpie_import_user_from_server', array( $this, 'import_form_server_view' ) );

			require_once LP_ADDON_IMPORT_EXPORT_INC . 'admin/providers/learnpress/lp-import-functions.php';

		}

		public function add_form( $step ) {
			$args = array(
				'step' => $step
			);
			lpie_admin_view( 'learnpress/import-user/form-import', $args );
		}
		/**
		 * Import from server view.
		 *
		 * @param string $file Raw value of the learnpress_import_form_server request
		 *                     parameter — MUST be sanitised before any filesystem use.
		 */
		public function import_form_server_view( $file ) {
			// ---------------------------------------------------------------
			// Path-traversal jail (same pattern as do_import()).
			// Collapse any ../ sequences to a basename, then confirm the
			// resolved real path sits inside the learnpress/ uploads root.
			// ---------------------------------------------------------------
			$safe_name = sanitize_file_name( basename( $file ) );

			// Detect the original sub-directory prefix (export/ or import/).
			if ( strpos( $file, 'export/' ) === 0 ) {
				$subdir = 'export/';
			} elseif ( strpos( $file, 'import/' ) === 0 ) {
				$subdir = 'import/';
			} else {
				$subdir = 'import/';
			}

			$base_dir = realpath( lpie_root_path() . '/learnpress/' . $subdir );
			$target   = realpath( lpie_root_path() . '/learnpress/' . $subdir . $safe_name );

			// Bail if the path cannot be resolved or escapes the allowed directory.
			if ( ! $base_dir || ! $target || strpos( $target, $base_dir . DIRECTORY_SEPARATOR ) !== 0 ) {
				wp_die( esc_html__( 'Invalid file path.', 'learnpress-import-export' ) );
			}

			// Safe relative path used in the nonce URL (never the raw input).
			$safe_relative = $subdir . $safe_name;
			?>
            <h2><strong><?php _e( 'Course(s) found on this file', 'learnpress-import-export' ); ?></strong>
                (<?php echo esc_html( $safe_name ); ?>):</h2>
            <table class="wp-list-table widefat fixed striped">
				<?php
				$file_data = $this->parse( $target );
				$courses   = $file_data['posts'];
				foreach ( $courses as $course ) {
					if ( $course['post_type'] === LP_COURSE_CPT ) {
						echo '<tr><td>' . esc_html( $course['post_title'] ) . '</td></tr>';
					}
				}
				?>
            </table>
            <p>
                <a href="<?php echo wp_nonce_url( admin_url( 'admin.php?page=learnpress-import-export&tab=import&import-user-file=' . rawurlencode( $safe_relative ) . '&step=3' ), 'learnpress-import-export', 'import-nonce' ); ?>"
                   class="button button-primary button-large"><?php _e( 'Confirm Import', 'learnpress-import-export' ); ?></a>
                <a href="<?php echo admin_url( 'admin.php?page=learnpress-import-export&tab=import' ); ?>"
                   class="button button-large"><?php _e( 'Cancel', 'learnpress-import-export' ); ?></a>
            </p>
			<?php
		}

		/**
		 * Import step 1 view.
		 */
		public function step_1() {
			lpie_admin_view( 'learnpress/import-user/step-1' );
		}

		/**
		 * Import step 2 view.
		 */
		public function step_2() {
			lpie_admin_view( 'learnpress/import-user/step-2' );
		}

		/**
		 * Import step 3 view.
		 */
		public function step_3() {
			$this->do_import();
			lpie_admin_view( 'learnpress/import-user/step-3' );
		}

		/**
		 * Import process.
		 */
		public function do_import() {
			if ( ! current_user_can( 'manage_options' ) ) {
				wp_die( esc_html__( 'You do not have sufficient permissions.', 'learnpress-import-export' ) );
			}

			$arrResult = array();

			// --- Patch A: Sanitize path to prevent path-traversal (CVE import-user-file) ---
			$raw_file  = LP_Request::get_param( 'import-user-file' );
			// Allow only a single-level tmp/ prefix; strip everything else.
			$subdir    = ( strpos( $raw_file, 'tmp/' ) === 0 ) ? 'tmp/' : '';
			$safe_file = sanitize_file_name( basename( $raw_file ) );
			$jail_dir  = realpath( lpie_root_path() . '/learnpress' );
			$full_path = realpath( lpie_root_path() . '/learnpress/' . $subdir . $safe_file );

			if ( ! $full_path || ! $jail_dir || strpos( $full_path, $jail_dir . DIRECTORY_SEPARATOR ) !== 0 ) {
				wp_die( esc_html__( 'Invalid import file path.', 'learnpress-import-export' ) );
			}
			// --- End Patch A ---

			$handle    = fopen( $full_path, 'r' );
			$delimiter = $this->detectDelimiter( $full_path );

			while( ($data_csv = fgetcsv($handle, 1000, $delimiter ) ) !== FALSE ) {
				$arrResult[] = $data_csv;
			}

			if ( ! empty( $arrResult ) ) {
				$data_import_order = array();

				foreach( $arrResult as $key => $user ) {
					if ( $key > 0 ) {
						//create user
						$userdata = array(
							'user_login' => $user[0],
							'user_pass'  => $user[1],
							'user_email' => $user[2],
							'first_name' => $user[3],
							'last_name'  => $user[4],
							'role'       => $user[5] ?: 'subscriber'
						);
						$user_id = wp_insert_user( $userdata );
						if ( ! is_wp_error ( $user_id) ) {
							if ( ! empty( $user[6] ) ) {
								$courses_id = explode( ' ', $user[6] );
								$data_import_order[$user_id] = $courses_id;
							}
							$GLOBALS['is_imported_done'] = true;
						}
					}
				}
				if ( ! empty( $data_import_order ) ) {
					$this->create_order( $data_import_order );
				}
			}

			if ( ! empty( LP_Request::get_param( 'save_import' ) ) ) {
				if ( ! file_exists( lpie_import_path() ) ) {
					mkdir( lpie_import_path(), 0777, true );
				}
				// $full_path and $safe_file are already validated above.
				copy( $full_path, lpie_import_path() . '/' . $safe_file );
			}

		}

		public function detectDelimiter($csvFile)
		{
			$delimiters = array(
				';' => 0,
				',' => 0,
				"\t" => 0,
				"|" => 0
			);

			$handle = fopen($csvFile, "r");
			$firstLine = fgets($handle);
			fclose($handle); 
			foreach ($delimiters as $delimiter => &$count) {
				$count = count(str_getcsv($firstLine, $delimiter));
			}

			return array_search(max($delimiters), $delimiters);
		}

		public function create_order( $data_import_order ){
			$total = count( $data_import_order );
			$limit = 10;
			
			$bg = LP_Background_Single_Import_Export::instance();
			$bg->data( 
				array(
					'handle_name'       => 'create_order',
					'data_import_order' => $data_import_order,
					'offset'            => 0,
					'limit'             => $limit,
					'total_page' 		=> ceil( $total / $limit )
				)
			)->dispatch();
		}
		/**
		 * Parse import file.
		 *
		 * @param $file
		 *
		 * @return array|WP_Error
		 */
		public function parse( $file ) {
			$parser = new LPR_Export_Import_Parser();

			return $parser->parse( $file );
		}

		/**
		 * Instance.
		 *
		 * @return LP_Import_User_LearnPress|null
		 */
		public static function instance() {
			if ( ! self::$_instance ) {
				self::$_instance = new self();
			}

			return self::$_instance;
		}
	}
}

return LP_Import_User_LearnPress::instance();