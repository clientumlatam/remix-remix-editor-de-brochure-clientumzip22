<?php

namespace LPImportExport\Migration\Models;

class MasterStudyCourseModel {
	/**
	 * @return int
	 */
	public static function get_course_total() {
		global $wpdb;
		$sql = $wpdb->prepare(
			"
        SELECT COUNT(*)
        FROM {$wpdb->posts}
        WHERE post_type = %s
        ",
			LP_ADDON_IMPORT_EXPORT_MASTER_STUDY_COURSE_CPT,
		);

		$total = $wpdb->get_var( $sql );

		return $total ? intval( $total ) : 0;
	}

	/**
	 * @return int
	 */
	public static function get_process_course_total() {
		global $wpdb;

		$table = $wpdb->prefix . 'stm_lms_user_courses';

		$sql = "SELECT COUNT(*) FROM {$table}";

		$total = $wpdb->get_var( $sql );

		return $total ? intval( $total ) : 0;
	}

	/**
	 * @param int $posts_per_page
	 * @param int $paged
	 * @return array|object|\stdClass[]
	 */
	public static function get_process_course_item( int $posts_per_page = 10, int $paged = 1 ) {
		global $wpdb;

		$table  = $wpdb->prefix . 'stm_lms_user_courses';
		$offset = ( $paged - 1 ) * $posts_per_page;

		$sql = $wpdb->prepare(
			"
            SELECT *
            FROM {$table}
            LIMIT %d OFFSET %d
            ",
			$posts_per_page,
			$offset
		);

		$results = $wpdb->get_results( $sql );

		return empty( $results ) ? array() : $results;
	}
}
