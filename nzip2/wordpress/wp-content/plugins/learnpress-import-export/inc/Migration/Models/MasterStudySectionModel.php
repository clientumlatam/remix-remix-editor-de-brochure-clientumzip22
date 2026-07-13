<?php

namespace LPImportExport\Migration\Models;

class MasterStudySectionModel {
	const TABLE = 'stm_lms_curriculum_sections';

	private static function get_table() {
		global $wpdb;
		return $wpdb->prefix . self::TABLE;
	}

	public static function get_section_total() {
		global $wpdb;

		$table = self::get_table();
		$sql   = $wpdb->prepare(
			"
        SELECT COUNT(*)
        FROM {$table}
        "
		);

		$total = $wpdb->get_var( $sql );

		return $total ? intval( $total ) : 0;
	}

	/**
	 * @param int $posts_per_page
	 * @param int $paged
	 * @return array|object|\stdClass[]
	 */
	public static function get_sections( int $posts_per_page = 10, int $paged = 1 ) {
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
