<?php

namespace LPImportExport\LearnDashMigration;

use LPImportExport\Migration\Helpers\RestApi;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;
use Exception;

/**
 * LearnDash Migration Controller
 *
 * @package LPImportExport\LearnDashMigration
 */
class LearnDashMigrationController {

	/**
	 * Constructor.
	 *
	 * Initializes the migration controller by registering REST API routes
	 * and initializing the curriculum patch to fix LearnPress caching issues.
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );

		// Initialize curriculum patch to fix LearnPress caching issue.
		LP_Curriculum_Patch::instance();
	}

	/**
	 * Register REST API routes for LearnDash migration.
	 *
	 * Registers two endpoints:
	 * - POST /migrate/learndash: Main migration endpoint that handles all migration steps
	 * - DELETE /delete-migrated-data/learndash: Cleanup endpoint to remove migrated data
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function register_rest_routes() {
		register_rest_route(
			RestApi::generate_namespace(),
			'/migrate/learndash',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'permission_callback' => array( $this, 'check_admin_permission' ),
					'callback'            => array( $this, 'migrate' ),
				),
			)
		);

		register_rest_route(
			RestApi::generate_namespace(),
			'/delete-migrated-data/learndash',
			array(
				'methods'             => WP_REST_Server::DELETABLE,
				'permission_callback' => array( $this, 'check_admin_permission' ),
				'callback'            => array( $this, 'delete_migrated_data' ),
			),
		);
	}

	/**
	 * Check if the current user has admin permission.
	 *
	 * Permission callback for REST API endpoints.
	 * Only users with 'manage_options' capability can access migration endpoints.
	 *
	 * @since 1.0.0
	 * @return bool True if user has admin permission, false otherwise.
	 */
	public function check_admin_permission() {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Main migration handler.
	 *
	 * Routes migration requests to the appropriate step based on the 'item' parameter.
	 * Migration steps are executed in sequence:
	 * 1. content - Fetch and migrate courses, lessons, topics, and quizzes to LearnPress
	 * 2. student_migrate - Migrate student progress directly to LearnPress
	 *
	 * @since 1.0.0
	 * @param WP_REST_Request $request REST request containing:
	 *                                 - item: Migration step ('content', 'student_migrate')
	 *                                 - paged: Current page number for batch processing
	 *                                 - number: Number of items to process per batch
	 * @return WP_REST_Response Success or error response with migration progress data.
	 */
	public function migrate( WP_REST_Request $request ) {
		try {
			$params = $request->get_params();
			$item   = $params['item'] ?? 'content';
			$paged  = $params['paged'] ?? 1;
			$number = $params['number'] ?? 10;

			switch ( $item ) {
				case 'content':
					return $this->step_content( $paged, $number );
				case 'student_migrate':
					return $this->step_student_migrate( $paged, $number );
				default:
					throw new Exception( __( 'Invalid migration step.', 'learnpress-import-export' ) );
			}
		} catch ( Exception $e ) {
			return RestApi::error( $e->getMessage() );
		}
	}

	/**
	 * Step 1: Migrate content to LearnPress.
	 *
	 * Fetches LearnDash courses directly and converts them to LearnPress format, including:
	 * - Course structure and metadata
	 * - Lessons converted to LP sections
	 * - Topics converted to LP lessons
	 * - Quizzes and questions
	 * - Associated media and attachments
	 *
	 * @since 1.0.0
	 * @param int $paged  Current page number (1-indexed).
	 * @param int $number Number of courses to migrate per batch.
	 * @return WP_REST_Response Response with migrated count, next page, and next migration step.
	 */
	protected function step_content( $paged, $number ) {
		// Clear previous data when starting fresh (page 1).
		if ( $paged == 1 ) {
			delete_option( 'learndash_migrated_content' );
			delete_option( 'learndash_migrated_content_count' );
			delete_option( 'learndash_migrated_student_migrate_count' );
		}

		// Fetch LearnDash courses directly.
		$courses = get_posts(
			array(
				'post_type'      => 'sfwd-courses',
				'posts_per_page' => $number,
				'offset'         => ( $paged - 1 ) * $number,
				'post_status'    => 'any',
				'orderby'        => 'title',
				'order'          => 'ASC',
			)
		);

		$total = LearnDashHelper::get_content_total();

		// Build and migrate each course directly.
		$dumper   = new LearnDashDataDump();
		$migrator = new LearnDashToLearnPressMigration();

		foreach ( $courses as $course ) {
			$ld_course             = $dumper->get_course_data( $course );
			$ld_course['lessons']  = $dumper->dump_lessons( $course->ID );
			$ld_course['quizzes']  = $dumper->dump_quizzes( $course->ID, 'course' );

			$migrator->migrate_course( $ld_course );
		}

		$migrated_count = get_option( 'learndash_migrated_content_count', 0 ) + count( $courses );
		update_option( 'learndash_migrated_content_count', $migrated_count );

		$data = array(
			'migrated_total'    => $migrated_count,
			'next_page'         => $paged + 1,
			'next_migrate_item' => 'content',
		);

		if ( $migrated_count >= $total ) {
			$data['next_page']         = 1;
			$data['next_migrate_item'] = 'student_migrate';
		}

		return RestApi::success( __( 'Migrating content...', 'learnpress-import-export' ), $data );
	}

	/**
	 * Step 3: Migrate student progress to LearnPress.
	 *
	 * Migrates student progress directly from LearnDash database to LearnPress.
	 * No JSON files - fetches and migrates user data in real-time.
	 * Creates user items (enrollments, lessons, quizzes) in the learnpress_user_items table.
	 * On completion, records the migration timestamp and user who performed the migration.
	 *
	 * @since 1.0.0
	 * @param int $paged  Current page number (1-indexed).
	 * @param int $number Number of users to process per batch.
	 * @return WP_REST_Response Response with migrated count, next page, and success message on completion.
	 */
	protected function step_student_migrate( $paged, $number ) {
		$student_migrator = new LearnDashStudentDataMigration();
		$result           = $student_migrator->migrate_users_direct( $paged, $number );

		$migrated_count = get_option( 'learndash_migrated_student_migrate_count', 0 ) + $result['processed'];
		update_option( 'learndash_migrated_student_migrate_count', $migrated_count );

		$data = array(
			'migrated_total'    => $migrated_count,
			'next_page'         => $paged + 1,
			'next_migrate_item' => 'student_migrate',
		);

		// Stop when no more users to process.
		if ( ! $result['has_more'] ) {
			$data['next_page']            = 1;
			$data['next_migrate_item']    = false;
			$data['migrate_success_html'] = '<p>' . __( 'LearnDash migration completed successfully!', 'learnpress-import-export' ) . '</p>';
			update_option( 'learndash_migrate_time', time() );
			update_option( 'learndash_migrate_user_id', get_current_user_id() );
		}

		return RestApi::success( __( 'Migrating student progress...', 'learnpress-import-export' ), $data );
	}

	/**
	 * Delete all migrated data and reset migration state.
	 *
	 * Removes all migration-related WordPress options.
	 * This allows the migration to be run again from scratch.
	 * Does NOT delete the actual LearnPress content that was created - only the migration tracking data.
	 *
	 * Options cleared:
	 * - Content migration progress
	 * - Student migration progress
	 * - Migration timestamp and user info
	 *
	 * @since 1.0.0
	 * @param WP_REST_Request $request REST request (unused but required by REST API).
	 * @return WP_REST_Response Success response confirming data was cleared.
	 */
	public function delete_migrated_data( WP_REST_Request $request ) {

		delete_option( 'learndash_migrated_content' );
		delete_option( 'learndash_migrated_content_count' );
		delete_option( 'learndash_migration_mapping' );
		delete_option( 'learndash_migrated_student_migrate_count' );
		delete_option( 'learndash_migrate_time' );
		delete_option( 'learndash_migrate_user_id' );

		return RestApi::success( __( 'Cleared all LearnDash migrated data and progress.', 'learnpress-import-export' ) );
	}
}
