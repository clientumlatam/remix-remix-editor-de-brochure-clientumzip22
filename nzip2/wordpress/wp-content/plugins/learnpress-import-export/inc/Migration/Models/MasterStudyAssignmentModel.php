<?php

namespace LPImportExport\Migration\Models;

class MasterStudyAssignmentModel {
	const TABLE = 'stm_lms_user_assignments';

	private static function get_table() {
		global $wpdb;
		return $wpdb->prefix . self::TABLE;
	}

	/**
	 * @param int $course_id
	 * @param int $student_id
	 * @return array|object|\stdClass|null
	 */
	public static function get_assignment( int $course_id, int $student_id ) {
		global $wpdb;
		$table = self::get_table();

		$query = $wpdb->prepare(
			"SELECT * FROM {$table} WHERE course_id = %d AND user_id = %d LIMIT 1",
			$course_id,
			$student_id
		);

		return $wpdb->get_row( $query );
	}
}
