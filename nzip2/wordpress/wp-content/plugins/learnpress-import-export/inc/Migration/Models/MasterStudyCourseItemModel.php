<?php

namespace LPImportExport\Migration\Models;

class MasterStudyCourseItemModel {
	const TABLE = 'stm_lms_curriculum_materials';

	private static function get_table() {
		global $wpdb;
		return $wpdb->prefix . self::TABLE;
	}

	/**
	 * @param $post_id
	 * @return int
	 */
	public static function get_course_item_total( $post_id = null ) {
		global $wpdb;

		$table = self::get_table();

		if ( $post_id ) {
			$sql = $wpdb->prepare(
				"SELECT COUNT(*) FROM {$table} WHERE post_id = %s",
				$post_id
			);
		} else {
			$sql = "SELECT COUNT(*) FROM {$table}";
		}

		$total = $wpdb->get_var( $sql );

		return $total ? intval( $total ) : 0;
	}

	public static function get_course_item( int $posts_per_page = 10, int $paged = 1 ) {
		global $wpdb;

		$table  = self::get_table();
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
