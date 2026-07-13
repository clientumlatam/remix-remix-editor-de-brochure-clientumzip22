<?php

namespace LPImportExport\Migration\Models;

class MasterStudyUserAnswerModel {

	const TABLE = 'stm_lms_user_answers';
	private static function get_table() {
		global $wpdb;
		return $wpdb->prefix . self::TABLE;
	}

	public static function get_quiz_answers( $course_id, $quiz_id ) {
		global $wpdb;

		$table = self::get_table();

		return $wpdb->get_results(
			$wpdb->prepare(
				"SELECT *
             FROM {$table}
             WHERE course_id = %d
             AND quiz_id = %d
             ",
				$course_id,
				$quiz_id
			),
			ARRAY_A
		);
	}
}
