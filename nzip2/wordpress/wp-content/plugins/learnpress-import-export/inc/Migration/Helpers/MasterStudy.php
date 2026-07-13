<?php

namespace LPImportExport\Migration\Helpers;

use LPImportExport\Migration\Models\MasterStudyCourseItemModel;
use LPImportExport\Migration\Models\MasterStudyCourseModel;
use LPImportExport\Migration\Models\MasterStudyQuestionModel;
use LPImportExport\Migration\Models\MasterStudySectionModel;

class MasterStudy {

	public static function migrated_course() {
		return get_option( 'master_study_migrated_course', array() );
	}

	public static function migrated_section() {
		return get_option( 'master_study_migrated_section', array() );
	}

	public static function migrated_lesson() {
		return get_option( 'master_study_migrated_lesson', array() );
	}

	public static function migrated_quiz() {
		return get_option( 'master_study_migrated_quiz', array() );
	}

	public static function migrated_assignment() {
		return get_option( 'master_study_migrated_assignment', array() );
	}

	public static function migrated_question() {
		return get_option( 'master_study_migrated_question', array() );
	}

	public static function migrated_course_total() {
		return count( self::migrated_course() );
	}

	public static function migrated_section_total() {
		return count( self::migrated_section() );
	}

	public static function migrated_lesson_total() {
		return count( self::migrated_lesson() );
	}

	public static function migrated_quiz_total() {
		return count( self::migrated_quiz() );
	}

	public static function migrated_assignment_total() {
		return count( self::migrated_assignment() );
	}

	public static function migrated_course_item_total() {
		return self::migrated_lesson_total() + self::migrated_quiz_total() + self::migrated_assignment_total();
	}

	public static function migrated_question_total() {
		$migrated_questions = self::migrated_question();

		$total                     = 0;
		$master_study_question_ids = array();
		foreach ( $migrated_questions as $migrated_question ) {
			if ( ! in_array( $migrated_question['master_study_question_id'], $master_study_question_ids ) ) {
				$total                       = $total + 1;
				$master_study_question_ids[] = $migrated_question['master_study_question_id'];
			}
		}

		return $total;
	}

	/**
	 * @return array
	 */
	public static function get_data() {
		$data                          = array();
		$data['course_total']          = MasterStudyCourseModel::get_course_total();
		$data['migrated_course']       = self::migrated_course();
		$data['migrated_course_total'] = self::migrated_course_total();

		$data['section_total']          = MasterStudySectionModel::get_section_total();
		$data['migrated_section']       = self::migrated_section();
		$data['migrated_section_total'] = self::migrated_section_total();

		$data['course_item_total']          = MasterStudyCourseItemModel::get_course_item_total();
		$data['migrated_lesson']            = self::migrated_lesson();
		$data['migrated_quiz']              = self::migrated_quiz();
		$data['migrated_assignment']        = self::migrated_assignment();
		$data['migrated_course_item_total'] = self::migrated_course_item_total();

		$data['question_total']          = MasterStudyQuestionModel::get_question_total();
		$data['migrated_question']       = self::migrated_question();
		$data['migrated_question_total'] = self::migrated_question_total();

		$data['master_study_migrate_time']    = get_option( 'master_study_migrate_time', 0 );
		$data['master_study_migrate_user_id'] = get_option( 'master_study_migrate_user_id', 0 );

		$master_study_migrated_process_course_data          = get_option( 'master_study_migrated_process_course_data', array() );
		$data['master_study_migrated_process_course_total'] = count( $master_study_migrated_process_course_data );
		$data['master_study_process_course_total']          = MasterStudyCourseModel::get_process_course_total();

		return $data;
	}
}
