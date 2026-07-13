<?php

namespace LPImportExport\Migration\Models;

use MasterStudy\Lms\Enums\QuestionType;

class MasterStudyQuestionModel {
	public static function get_question_total() {
		global $wpdb;

		$types = array( QuestionType::SINGLE_CHOICE, QuestionType::MULTI_CHOICE, QuestionType::TRUE_FALSE, QuestionType::FILL_THE_GAP );

		$placeholders = implode( ',', array_fill( 0, count( $types ), '%s' ) );

		$sql = $wpdb->prepare(
			"
		SELECT COUNT(DISTINCT p.ID)
		FROM {$wpdb->posts} p
		INNER JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id
		WHERE p.post_type = %s
		AND p.post_status = %s
		AND pm.meta_key = %s
		AND pm.meta_value IN ($placeholders)
		",
			array_merge(
				array(
					LP_ADDON_IMPORT_EXPORT_MASTER_STUDY_QUESTION_CPT,
					'publish',
					'type',
				),
				$types
			)
		);

		$total = $wpdb->get_var( $sql );

		return $total ? intval( $total ) : 0;
	}

	public static function get_questions( $offset, $limit ) {
		global $wpdb;

		$types = array(
			QuestionType::SINGLE_CHOICE,
			QuestionType::MULTI_CHOICE,
			QuestionType::TRUE_FALSE,
			QuestionType::FILL_THE_GAP,
		);

		$placeholders = implode( ',', array_fill( 0, count( $types ), '%s' ) );

		$sql = $wpdb->prepare(
			"
		SELECT DISTINCT p.*
		FROM {$wpdb->posts} p
		INNER JOIN {$wpdb->postmeta} pm 
			ON p.ID = pm.post_id
		WHERE p.post_type = %s
		AND p.post_status = %s
		AND pm.meta_key = %s
		AND pm.meta_value IN ($placeholders)
		ORDER BY p.ID ASC
		LIMIT %d OFFSET %d
		",
			array_merge(
				array(
					LP_ADDON_IMPORT_EXPORT_MASTER_STUDY_QUESTION_CPT,
					'publish',
					'type',
				),
				$types,
				array( $limit, $offset )
			)
		);

		return $wpdb->get_results( $sql );
	}
}
