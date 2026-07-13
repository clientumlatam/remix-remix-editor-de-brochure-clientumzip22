<?php

namespace LPImportExport\LearnDashMigration;

/**
 * LearnDash Helper Class
 *
 * Provides utility methods for the LearnDash to LearnPress migration process.
 * Contains static methods for retrieving migration state, totals, and progress data.
 * Used by the migration UI to display progress bars and status information.
 *
 * @package LPImportExport\LearnDashMigration
 * @since   1.0.0
 */
class LearnDashHelper {

	/**
	 * Get migration data for UI display.
	 *
	 * Compiles all migration step information including labels, descriptions,
	 * total counts, and current progress. Also includes migration metadata
	 * such as when the last migration was performed and by which user.
	 *
	 * @since 1.0.0
	 * @return array {
	 *     Migration data array.
	 *
	 *     @type array $migration_items         Associative array of migration steps (content, student_migrate).
	 *     @type int   $learndash_migrate_time    Unix timestamp of last completed migration, or 0 if never run.
	 *     @type int   $learndash_migrate_user_id User ID who performed the last migration, or 0 if never run.
	 * }
	 */
	public static function get_data() {
		$data = array();

		// Map LearnDash steps to labels/descriptions for the UI.
		$data['migration_items'] = array(
			'content'         => array(
				'label'       => esc_html__( 'Content Migration', 'learnpress-import-export' ),
				'description' => esc_html__( 'Migrating courses, lessons, topics, quizzes, and questions to LearnPress.', 'learnpress-import-export' ),
				'total'       => self::get_content_total(),
				'migrated'    => self::get_migrated_total( 'content' ),
			),
			'student_migrate' => array(
				'label'       => esc_html__( 'Student Progress Migration', 'learnpress-import-export' ),
				'description' => esc_html__( 'Migrating user course progress and quiz attempts to LearnPress.', 'learnpress-import-export' ),
				'total'       => self::get_student_migrate_total(),
				'migrated'    => self::get_migrated_total( 'student_migrate' ),
			),
		);

		$data['learndash_migrate_time']    = get_option( 'learndash_migrate_time', 0 );
		$data['learndash_migrate_user_id'] = get_option( 'learndash_migrate_user_id', 0 );

		return $data;
	}

	/**
	 * Get the total number of LearnDash courses for content migration step.
	 *
	 * Counts all LearnDash courses (sfwd-courses post type) regardless of status.
	 * This determines the total iterations needed for the content step progress bar.
	 *
	 * @since 1.0.0
	 * @return int Total count of LearnDash courses.
	 */
	public static function get_content_total() {
		$courses = get_posts(
			array(
				'post_type'      => 'sfwd-courses',
				'posts_per_page' => -1,
				'post_status'    => 'any',
				'fields'         => 'ids',
			)
		);
		return count( $courses );
	}

	/**
	 * Get the total number of users for student migration step.
	 *
	 * First tries to count distinct users from learndash_user_activity table
	 * where activity_type='course'. Falls back to counting all wp_users
	 * if the LearnDash activity table doesn't exist.
	 *
	 * @since 1.0.0
	 * @global wpdb $wpdb WordPress database object.
	 * @return int Total count of users with LearnDash progress to migrate.
	 */
	public static function get_student_migrate_total() {
		global $wpdb;

		$table_name = $wpdb->prefix . 'learndash_user_activity';

		// Check if learndash_user_activity table exists.
		$table_exists = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table_name ) );

		if ( $table_exists ) {
			// Count distinct users with course activity.
			return (int) $wpdb->get_var(
				$wpdb->prepare(
					"SELECT COUNT(DISTINCT user_id) FROM {$table_name} WHERE activity_type = %s",
					'course'
				)
			);
		}

		// Fallback: count all users.
		return (int) $wpdb->get_var( "SELECT COUNT(ID) FROM {$wpdb->users}" );
	}

	/**
	 * Get the number of migrated items for a specific step.
	 *
	 * Retrieves the current migration progress for each step from WordPress options.
	 * Used to update the progress bar UI during migration.
	 *
	 * @since 1.0.0
	 * @param string $item Migration step key: 'content' or 'student_migrate'.
	 * @return int Number of items that have been migrated for the specified step.
	 */
	public static function get_migrated_total( $item ) {
		if ( $item === 'content' ) {
			return (int) get_option( 'learndash_migrated_content_count', 0 );
		}
		if ( $item === 'student_migrate' ) {
			return (int) get_option( 'learndash_migrated_student_migrate_count', 0 );
		}
		return 0;
	}
}
