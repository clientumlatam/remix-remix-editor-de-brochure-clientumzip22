<?php

namespace LPImportExport\Migration\Helpers;

class Plugin {
	public static function is_lp_active() {
		return is_plugin_active( 'learnpress/learnpress.php' );
	}

//	public static function is_lp_assignments_active() {
//		return is_plugin_active( 'learnpress-assignments/learnpress-assignments.php' );
//	}

	public static function is_tutor_active() {
		return is_plugin_active( 'tutor/tutor.php' );
	}

	public static function is_learndash_active() {
		return is_plugin_active( 'sfwd-lms/sfwd_lms.php' );
	}

	public static function is_master_study_active() {
		return is_plugin_active( 'masterstudy-lms-learning-management-system/masterstudy-lms-learning-management-system.php' );
	}
}
