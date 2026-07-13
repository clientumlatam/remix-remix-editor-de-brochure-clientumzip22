<?php
/**
 * LearnDash Student Data Migration Class (Refactored)
 *
 * Uses LearnPress Models from inc/Models/UserItems/ for proper data creation.
 *
 * @package LPImportExport\LearnDashMigration
 */

namespace LPImportExport\LearnDashMigration;

use LearnPress\Models\UserItems\UserCourseModel;
use LearnPress\Models\UserItems\UserLessonModel;
use LearnPress\Models\UserItems\UserQuizModel;
use LearnPress\Models\CourseModel;
use LearnPress\Models\CoursePostModel;
use LP_Datetime;

/**
 * Class LearnDashStudentDataMigration
 * Handles migrating LearnDash student progress data to LearnPress using LP Models.
 */
class LearnDashStudentDataMigration {

	/**
	 * Batch size for processing.
	 *
	 * @var int
	 */
	private $batch_size = 20;

	/**
	 * Constructor.
	 */
	public function __construct() {}

	/**
	 * Get user courses with progress.
	 *
	 * @param int   $user_id         User ID.
	 * @param array $course_progress Course progress data from user meta.
	 * @return array
	 */
	private function get_user_courses( $user_id, $course_progress ) {
		$courses_data      = array();
		$processed_courses = array();

		// First, process courses from user meta (_sfwd-course_progress).
		if ( ! empty( $course_progress ) && is_array( $course_progress ) ) {
			foreach ( $course_progress as $course_id => $progress ) {
				$completed_on = learndash_user_get_course_completed_date( $user_id, $course_id );
				$access_from  = ld_course_access_from( $course_id, $user_id );

				$courses_data[]                  = array(
					'course_id'      => $course_id,
					'enrolled_date'  => $access_from ? gmdate( 'Y-m-d H:i:s', $access_from ) : null,
					'completed'      => ! empty( $completed_on ),
					'completed_date' => $completed_on ? gmdate( 'Y-m-d H:i:s', $completed_on ) : null,
					'progress'       => $progress,
				);
				$processed_courses[ $course_id ] = true;
			}
		}

		// Also check wp_learndash_user_activity table for course enrollments.
		$activity_courses = $this->get_courses_from_activity_table( $user_id );
		foreach ( $activity_courses as $activity ) {
			$course_id = (int) $activity['course_id'];

			// Skip if already processed from user meta.
			if ( isset( $processed_courses[ $course_id ] ) ) {
				continue;
			}

			$enrolled_date  = $activity['activity_started'] ? gmdate( 'Y-m-d H:i:s', $activity['activity_started'] ) : null;
			$completed_date = $activity['activity_completed'] ? gmdate( 'Y-m-d H:i:s', $activity['activity_completed'] ) : null;

			$courses_data[]                  = array(
				'course_id'      => $course_id,
				'enrolled_date'  => $enrolled_date,
				'completed'      => ! empty( $activity['activity_completed'] ),
				'completed_date' => $completed_date,
				'progress'       => array(), // No detailed progress from activity table.
			);
			$processed_courses[ $course_id ] = true;
		}

		return $courses_data;
	}

	/**
	 * Check if user has any LearnDash activity in the activity table.
	 *
	 * @param int $user_id User ID.
	 * @return bool True if user has activity.
	 */
	private function user_has_ld_activity( $user_id ) {
		global $wpdb;

		$table = $wpdb->prefix . 'learndash_user_activity';

		// Check if table exists.
		if ( ! $wpdb->get_var( "SHOW TABLES LIKE '{$table}'" ) ) {
			return false;
		}

		$count = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM {$table} WHERE user_id = %d AND activity_type = 'course'",
				$user_id
			)
		);

		return $count > 0;
	}

	/**
	 * Get course enrollments from wp_learndash_user_activity table.
	 *
	 * @param int $user_id User ID.
	 * @return array Array of course activity records.
	 */
	private function get_courses_from_activity_table( $user_id ) {
		global $wpdb;

		$table = $wpdb->prefix . 'learndash_user_activity';

		// Check if table exists.
		if ( ! $wpdb->get_var( "SHOW TABLES LIKE '{$table}'" ) ) {
			return array();
		}

		return $wpdb->get_results(
			$wpdb->prepare(
				"SELECT course_id, activity_started, activity_completed, activity_status 
				 FROM {$table} 
				 WHERE user_id = %d AND activity_type = 'course'
				 ORDER BY activity_id DESC",
				$user_id
			),
			ARRAY_A
		);
	}

	/**
	 * Get user quiz attempts.
	 *
	 * @param int   $user_id       User ID.
	 * @param array $quiz_attempts Quiz attempts data.
	 * @return array
	 */
	private function get_user_quiz_attempts( $user_id, $quiz_attempts ) {
		if ( empty( $quiz_attempts ) || ! is_array( $quiz_attempts ) ) {
			return array();
		}

		return $quiz_attempts;
	}

	/**
	 * Migrate users directly without JSON dump files.
	 *
	 * Fetches users from database, builds their progress data, and migrates immediately.
	 * This is the real-time migration approach (Option A).
	 *
	 * @param int $paged  Current page number (1-indexed).
	 * @param int $number Number of users to process per batch.
	 * @return array Contains 'processed' count and 'has_more' boolean.
	 */
	public function migrate_users_direct( $paged, $number ) {
		$offset = ( $paged - 1 ) * $number;

		$users = get_users(
			array(
				'number'  => $number,
				'offset'  => $offset,
				'orderby' => 'ID',
				'order'   => 'ASC',
			)
		);

		$processed = 0;

		foreach ( $users as $user ) {
			$has_progress = get_user_meta( $user->ID, '_sfwd-course_progress', true );
			$has_quizzes  = get_user_meta( $user->ID, '_sfwd-quizzes', true );
			$has_activity = $this->user_has_ld_activity( $user->ID );

			// Skip users with no LearnDash data.
			if ( empty( $has_progress ) && empty( $has_quizzes ) && ! $has_activity ) {
				continue;
			}

			// Build and migrate user data directly.
			$user_data = array(
				'id'               => $user->ID,
				'enrolled_courses' => $this->get_user_courses( $user->ID, $has_progress ),
				'quiz_attempts'    => $this->get_user_quiz_attempts( $user->ID, $has_quizzes ),
			);

			$this->migrate_user_data( $user_data );
			++$processed;
		}

		return array(
			'processed' => $processed,
			'has_more'  => count( $users ) === $number,
		);
	}

	/**
	 * Migrate single user data.
	 *
	 * @param array $user_data User data.
	 */
	private function migrate_user_data( $user_data ) {
		global $wpdb;

		$user_id = $user_data['id'];

		foreach ( $user_data['enrolled_courses'] as $course ) {
			$lp_course_id = get_post_meta( $course['course_id'], '_lp_course_id', true );

			if ( empty( $lp_course_id ) ) {
				continue;
			}

			$user_item_id = $this->migrate_enrollment( $user_id, $lp_course_id, $course );

			if ( ! $user_item_id ) {
				continue;
			}

			// Clear student count cache for this course so count_students() returns correct value.
			$this->clear_course_student_cache( $lp_course_id );

			if ( ! empty( $course['progress']['lessons'] ) ) {
				$this->migrate_lessons( $user_id, $course['progress']['lessons'], $lp_course_id, $user_item_id );
			}

			if ( ! empty( $course['progress']['topics'] ) ) {
				foreach ( $course['progress']['topics'] as $topics ) {
					$this->migrate_lessons( $user_id, $topics, $lp_course_id, $user_item_id, true );
				}
			}
		}

		foreach ( $user_data['quiz_attempts'] as $attempt ) {
			$ld_quiz_id = $attempt['quiz'] ?? 0;
			$lp_quiz_id = $ld_quiz_id ? get_post_meta( $ld_quiz_id, '_lp_quiz_id', true ) : 0;

			if ( empty( $lp_quiz_id ) ) {
				continue;
			}

			$lp_course_id = ( $attempt['course'] ?? 0 ) ? get_post_meta( $attempt['course'], '_lp_course_id', true ) : 0;
			$parent_id    = 0;

			if ( $lp_course_id ) {
				$parent_id = $wpdb->get_var(
					$wpdb->prepare(
						"SELECT user_item_id FROM {$wpdb->prefix}learnpress_user_items WHERE user_id = %d AND item_id = %d AND item_type = 'lp_course'",
						$user_id,
						$lp_course_id
					)
				);
			}

			$this->migrate_quiz_attempt( $user_id, $lp_quiz_id, $lp_course_id, $parent_id, $attempt );
		}
	}

	/**
	 * Migrate course enrollment.
	 *
	 * @param int   $user_id      User ID.
	 * @param int   $lp_course_id LearnPress course ID.
	 * @param array $course       Course data.
	 * @return int|false User item ID or false if already exists.
	 */
	private function migrate_enrollment( $user_id, $lp_course_id, $course ) {
		// Check if already exists using UserCourseModel.
		$existing = UserCourseModel::find( $user_id, $lp_course_id, false );

		if ( $existing instanceof UserCourseModel ) {
			return $existing->get_user_item_id();
		}

		$userCourse             = new UserCourseModel();
		$userCourse->user_id    = $user_id;
		$userCourse->item_id    = $lp_course_id;
		$userCourse->start_time = $course['enrolled_date'] ?? current_time( 'mysql' );
		$userCourse->end_time   = $course['completed_date'] ?? null;
		$userCourse->status     = $course['completed'] ? 'finished' : 'enrolled';
		$userCourse->graduation = $course['completed'] ? 'passed' : 'in-progress';
		$userCourse->save();

		$user_item_id = $userCourse->get_user_item_id();

		// Calculate and save course results from LearnDash progress data.
		if ( $user_item_id && ! empty( $course['progress'] ) ) {
			$this->calculate_and_save_course_results(
				$user_id,
				$lp_course_id,
				$user_item_id,
				$course['progress'],
				$course['completed']
			);
		}

		return $user_item_id;
	}

	/**
	 * Calculate and save course results after enrollment migration.
	 *
	 * Mirrors LearnPress\Models\UserItems\UserCourseModel::calculate_course_results()
	 * but uses LearnDash source data for completed/total items.
	 *
	 * @param int   $user_id       User ID.
	 * @param int   $lp_course_id  LearnPress course ID.
	 * @param int   $user_item_id  LearnPress user_item_id for the course enrollment.
	 * @param array $ld_progress   LearnDash progress array with 'completed' and 'total' keys.
	 * @param bool  $is_finished   Whether the course is finished.
	 */
	private function calculate_and_save_course_results( $user_id, $lp_course_id, $user_item_id, $ld_progress, $is_finished ) {
		global $wpdb;

		// Get LearnPress course model for evaluation type and passing condition.
		$courseModel = CourseModel::find( $lp_course_id, true );
		if ( ! $courseModel ) {
			return;
		}

		// Calculate progress from LearnDash data.
		$completed = isset( $ld_progress['completed'] ) ? (int) $ld_progress['completed'] : 0;
		$total     = isset( $ld_progress['total'] ) ? (int) $ld_progress['total'] : 0;
		$result    = $total > 0 ? round( ( $completed / $total ) * 100, 2 ) : 0;

		// Get LP course item counts for reference.
		$count_items = $courseModel->count_items();

		// Determine if passed based on passing condition.
		$passing_condition = $courseModel->get_passing_condition();
		$pass              = $result >= $passing_condition ? 1 : 0;

		// If already finished in LearnDash, respect that status.
		if ( $is_finished ) {
			$pass   = 1;
			$result = max( $result, $passing_condition );
		}

		// Get evaluation type from course settings.
		$evaluate_type = $courseModel->get_meta_value_by_key(
			CoursePostModel::META_KEY_EVALUATION_TYPE,
			'evaluate_lesson'
		);

		// Build items breakdown (approximate from LD data).
		$items = array(
			'lesson' => array(
				'completed' => isset( $ld_progress['lessons'] ) ? count( array_filter( $ld_progress['lessons'] ) ) : 0,
				'passed'    => isset( $ld_progress['lessons'] ) ? count( array_filter( $ld_progress['lessons'] ) ) : 0,
				'total'     => $courseModel->count_items( LP_LESSON_CPT ),
			),
			'quiz'   => array(
				'completed' => 0, // Quiz progress handled separately.
				'passed'    => 0,
				'total'     => $courseModel->count_items( LP_QUIZ_CPT ),
			),
		);

		// Build result data matching LP's format.
		$result_data = array(
			'count_items'     => $count_items,
			'completed_items' => $completed,
			'items'           => $items,
			'evaluate_type'   => $evaluate_type,
			'pass'            => $pass,
			'result'          => $result,
		);

		// Insert or update in learnpress_user_item_results table using LP's DB class.
		\LP_User_Items_Result_DB::instance()->update( $user_item_id, wp_json_encode( $result_data ) );
	}

	/**
	 * Migrate lessons progress.
	 *
	 * @param int   $user_id      User ID.
	 * @param array $items        Lesson items.
	 * @param int   $lp_course_id LearnPress course ID.
	 * @param int   $parent_id    Parent item ID.
	 * @param bool  $is_topic     Whether items are topics.
	 */
	private function migrate_lessons( $user_id, $items, $lp_course_id, $parent_id, $is_topic = false ) {
		foreach ( $items as $ld_id => $completed ) {
			$lp_id = get_post_meta( $ld_id, '_lp_lesson_id', true );

			if ( empty( $lp_id ) ) {
				continue;
			}

			// Check if already exists using UserLessonModel.
			$existing = UserLessonModel::find_user_item(
				$user_id,
				$lp_id,
				LP_LESSON_CPT,
				$lp_course_id,
				LP_COURSE_CPT,
				false
			);

			if ( $existing instanceof UserLessonModel ) {
				continue;
			}

			$userLesson             = new UserLessonModel();
			$userLesson->user_id    = $user_id;
			$userLesson->item_id    = $lp_id;
			$userLesson->start_time = current_time( 'mysql' );
			$userLesson->end_time   = $completed ? current_time( 'mysql' ) : null;
			$userLesson->status     = $completed ? 'completed' : 'started';
			$userLesson->graduation = $completed ? 'passed' : 'in-progress';
			$userLesson->ref_id     = $lp_course_id;
			$userLesson->parent_id  = $parent_id;
			$userLesson->save();
		}
	}

	/**
	 * Migrate quiz attempt.
	 *
	 * @param int   $user_id      User ID.
	 * @param int   $lp_quiz_id   LearnPress quiz ID.
	 * @param int   $lp_course_id LearnPress course ID.
	 * @param int   $parent_id    Parent item ID.
	 * @param array $attempt      Quiz attempt data.
	 */
	private function migrate_quiz_attempt( $user_id, $lp_quiz_id, $lp_course_id, $parent_id, $attempt ) {
		$passed     = ! empty( $attempt['pass'] );
		$time_spent = $attempt['timespent'] ?? 0;

		$userQuiz             = new UserQuizModel();
		$userQuiz->user_id    = $user_id;
		$userQuiz->item_id    = $lp_quiz_id;
		$userQuiz->start_time = isset( $attempt['started'] ) ? gmdate( 'Y-m-d H:i:s', $attempt['started'] ) : current_time( 'mysql' );
		$userQuiz->end_time   = isset( $attempt['completed'] ) ? gmdate( 'Y-m-d H:i:s', $attempt['completed'] ) : current_time( 'mysql' );
		$userQuiz->status     = 'completed';
		$userQuiz->graduation = $passed ? 'passed' : 'failed';
		$userQuiz->ref_id     = $lp_course_id;
		$userQuiz->parent_id  = $parent_id;
		$userQuiz->save();

		$user_item_id = $userQuiz->get_user_item_id();

		if ( ! $user_item_id ) {
			return;
		}

		// Fetch detailed question statistics from LearnDash.
		$questions_data = $this->build_questions_result( $attempt, $lp_quiz_id );

		// Calculate question stats.
		$question_count    = count( $questions_data );
		$question_correct  = 0;
		$question_wrong    = 0;
		$question_answered = 0;
		$user_mark         = 0;
		$total_mark        = 0;

		foreach ( $questions_data as $q ) {
			if ( ! empty( $q['answered'] ) ) {
				++$question_answered;
			}
			if ( ! empty( $q['correct'] ) ) {
				++$question_correct;
			} else {
				++$question_wrong;
			}
			$user_mark  += $q['user_mark'] ?? 0;
			$total_mark += $q['mark'] ?? 0;
		}

		// Format time_spend as to LP_Datetime
		$time_spend_duration = new LP_Datetime( $time_spent );

		// Get passing grade from quiz meta.
		$passing_grade = get_post_meta( $lp_quiz_id, '_lp_passing_grade', true );
		$passing_grade = $passing_grade ? $passing_grade . '%' : '60%';

		// Store quiz result using direct DB.
		global $wpdb;
		$result_data = array(
			'questions'         => $questions_data,
			'mark'              => $total_mark ?: ( $attempt['total_points'] ?? 0 ),
			'user_mark'         => $user_mark ?: ( $attempt['points'] ?? 0 ),
			'minus_point'       => 0,
			'question_count'    => $question_count,
			'question_empty'    => $question_count - $question_answered,
			'question_answered' => $question_answered,
			'question_wrong'    => $question_wrong,
			'question_correct'  => $question_correct,
			'status'            => '',
			'result'            => $attempt['percentage'] ?? 0,
			'time_spend'        => $time_spend_duration->format( 'H:i:s' ),
			'passing_grade'     => $passing_grade,
			'pass'              => $passed ? 1 : 0,
		);

		$wpdb->insert(
			$wpdb->prefix . 'learnpress_user_item_results',
			array(
				'user_item_id' => $user_item_id,
				'result'       => wp_json_encode( $result_data ),
			)
		);
	}

	/**
	 * Build questions result data from LearnDash statistics.
	 *
	 * @param array $attempt    LearnDash quiz attempt data.
	 * @param int   $lp_quiz_id LearnPress quiz ID.
	 * @return array Questions data keyed by LP question ID.
	 */
	private function build_questions_result( $attempt, $lp_quiz_id ) {
		$questions        = array();
		$statistic_ref_id = $attempt['statistic_ref_id'] ?? 0;

		if ( empty( $statistic_ref_id ) ) {
			return $questions;
		}

		// Get detailed question statistics from LearnDash.
		$ld_question_stats = $this->get_ld_question_statistics( $statistic_ref_id );

		if ( empty( $ld_question_stats ) ) {
			return $questions;
		}

		foreach ( $ld_question_stats as $stat ) {
			$ld_pro_question_id  = $stat['question_id'];
			$ld_question_post_id = $stat['question_post_id'];

			// Get LP question ID from mapping.
			$lp_question_id = $this->get_lp_question_id( $ld_pro_question_id, $ld_question_post_id );

			if ( empty( $lp_question_id ) ) {
				continue;
			}

			// Build question result.
			$question_result = $this->build_single_question_result( $stat, $lp_question_id );

			if ( ! empty( $question_result ) ) {
				$questions[ $lp_question_id ] = $question_result;
			}
		}

		return $questions;
	}

	/**
	 * Get LD question statistics from pro quiz tables.
	 *
	 * @param int $statistic_ref_id LearnDash statistic reference ID.
	 * @return array Question statistics.
	 */
	private function get_ld_question_statistics( $statistic_ref_id ) {
		global $wpdb;

		$table_stat = $wpdb->prefix . 'learndash_pro_quiz_statistic';

		// Check if table exists.
		$table_exists = $wpdb->get_var( "SHOW TABLES LIKE '{$table_stat}'" );
		if ( ! $table_exists ) {
			return array();
		}

		return $wpdb->get_results(
			$wpdb->prepare(
				"SELECT * FROM {$table_stat} WHERE statistic_ref_id = %d",
				$statistic_ref_id
			),
			ARRAY_A
		);
	}

	/**
	 * Get LP question ID from LD pro question ID or post ID.
	 *
	 * @param int $ld_pro_question_id  LearnDash pro question ID.
	 * @param int $ld_question_post_id LearnDash question post ID.
	 * @return int|null LP question ID.
	 */
	private function get_lp_question_id( $ld_pro_question_id, $ld_question_post_id ) {
		global $wpdb;

		// Method 1: Get from LD question post ID directly via _lp_question_id.
		if ( $ld_question_post_id ) {
			$lp_question_id = get_post_meta( $ld_question_post_id, '_lp_question_id', true );
			if ( $lp_question_id ) {
				return (int) $lp_question_id;
			}
		}

		// Method 2: Find LP question by _ld_question_pro_id meta (stored during content migration).
		if ( $ld_pro_question_id ) {
			$lp_question_id = $wpdb->get_var(
				$wpdb->prepare(
					"SELECT post_id FROM {$wpdb->postmeta} 
					 WHERE meta_key = '_ld_question_pro_id' AND meta_value = %d 
					 LIMIT 1",
					$ld_pro_question_id
				)
			);

			if ( $lp_question_id ) {
				return (int) $lp_question_id;
			}
		}

		// Method 3: Find LD question post by question_pro_id, then get _lp_question_id.
		if ( $ld_pro_question_id ) {
			$ld_question_post_id = $wpdb->get_var(
				$wpdb->prepare(
					"SELECT post_id FROM {$wpdb->postmeta} 
					 WHERE meta_key = 'question_pro_id' AND meta_value = %d 
					 LIMIT 1",
					$ld_pro_question_id
				)
			);

			if ( $ld_question_post_id ) {
				$lp_question_id = get_post_meta( $ld_question_post_id, '_lp_question_id', true );
				if ( $lp_question_id ) {
					return (int) $lp_question_id;
				}
			}
		}

		return null;
	}

	/**
	 * Build single question result from LD statistics.
	 *
	 * @param array $stat           LD question statistic row.
	 * @param int   $lp_question_id LP question ID.
	 * @return array Question result data.
	 */
	private function build_single_question_result( $stat, $lp_question_id ) {
		$correct_count   = (int) ( $stat['correct_count'] ?? 0 );
		$incorrect_count = (int) ( $stat['incorrect_count'] ?? 0 );
		$answer_data     = $stat['answer_data'] ?? '';

		// Get LP question details.
		$lp_question_type = get_post_meta( $lp_question_id, '_lp_type', true );
		$lp_mark          = (float) get_post_meta( $lp_question_id, '_lp_mark', true ) ?: 1;
		$lp_explanation   = get_post_meta( $lp_question_id, '_lp_explanation', true ) ?: '';

		// Determine if correct.
		$is_correct = $correct_count > 0 && 0 === $incorrect_count;

		// Parse answer_data.
		$answered = array();
		$options  = array();

		if ( ! empty( $answer_data ) ) {
			$parsed_answer = $this->parse_ld_answer_data( $answer_data );
			if ( null !== $parsed_answer ) {
				// Build answered array and options based on question type.
				list( $answered, $options ) = $this->convert_answer_to_lp_format(
					$parsed_answer,
					$lp_question_id,
					$lp_question_type
				);
			}
		}

		return array(
			'answered'    => $answered,
			'correct'     => $is_correct,
			'mark'        => $lp_mark,
			'user_mark'   => $is_correct ? $lp_mark : 0,
			'explanation' => $lp_explanation,
			'options'     => $options,
		);
	}

	/**
	 * Parse LD answer_data (can be JSON or serialized).
	 *
	 * @param string $answer_data Raw answer data from LD.
	 * @return mixed Parsed answer data.
	 */
	private function parse_ld_answer_data( $answer_data ) {
		if ( empty( $answer_data ) ) {
			return null;
		}

		// Try JSON first.
		$parsed = json_decode( $answer_data, true );
		if ( JSON_ERROR_NONE === json_last_error() ) {
			return $parsed;
		}

		// Try safe-unserialize (blocks object injection via crafted serialized strings).
		$parsed = lpie_safe_maybe_unserialize( $answer_data );
		if ( $parsed !== $answer_data ) {
			return $parsed;
		}

		return null;
	}

	/**
	 * Convert LD answer format to LP format.
	 *
	 * @param mixed  $ld_answers     Parsed LD answer data.
	 * @param int    $lp_question_id LP question ID.
	 * @param string $lp_type        LP question type.
	 * @return array [answered, options].
	 */
	private function convert_answer_to_lp_format( $ld_answers, $lp_question_id, $lp_type ) {
		global $wpdb;

		$answered = array();
		$options  = array();

		// Get LP question answers.
		$lp_answers = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT * FROM {$wpdb->prefix}learnpress_question_answers 
				 WHERE question_id = %d ORDER BY `order` ASC",
				$lp_question_id
			),
			ARRAY_A
		);

		if ( empty( $lp_answers ) ) {
			return array( $answered, $options );
		}

		switch ( $lp_type ) {
			case 'single_choice':
				// LD stores as [0,1,0,0] where index = answer position, value = 1 if selected.
				// For single_choice, answered is a string (single value).
				if ( is_array( $ld_answers ) ) {
					foreach ( $ld_answers as $index => $selected ) {
						if ( $selected && isset( $lp_answers[ $index ] ) ) {
							$answered = $lp_answers[ $index ]['value']; // String, not array.
							break; // Only one answer for single choice.
						}
					}
				}
				break;

			case 'multi_choice':
				// For multi_choice, answered is an array.
				if ( is_array( $ld_answers ) ) {
					foreach ( $ld_answers as $index => $selected ) {
						if ( $selected && isset( $lp_answers[ $index ] ) ) {
							$answered[] = $lp_answers[ $index ]['value'];
						}
					}
				}
				break;

			case 'sorting_choice':
				if ( is_array( $ld_answers ) ) {
					foreach ( $lp_answers as $index => $lp_answer ) {
						if ( isset( $ld_answers[ $index ] ) ) {
							$answered[] = $lp_answer['value'];
						}
					}
				}
				break;

			case 'matching_sorting':
				$answered = $this->build_matching_answer( $ld_answers, $lp_answers, $lp_question_id );
				$options  = $this->build_matching_options( $lp_answers, $lp_question_id );
				break;

			case 'fill_in_blanks':
				// LP FIB expects: array( 'blank_id_1' => 'user_answer', 'blank_id_2' => 'user_answer' )
				// Get blank IDs from the _blanks meta stored in learnpress_question_answermeta.
				if ( ! empty( $lp_answers[0] ) ) {
					$answer_id   = $lp_answers[0]['question_answer_id'];
					$blanks_meta = get_metadata( 'learnpress_question_answer', $answer_id, '_blanks', true );

					if ( ! empty( $blanks_meta ) && is_array( $blanks_meta ) ) {
						$blank_ids = array_keys( $blanks_meta );

						// Map LD indexed answers to LP blank IDs.
						if ( is_array( $ld_answers ) ) {
							$index = 0;
							foreach ( $blank_ids as $blank_id ) {
								if ( isset( $ld_answers[ $index ] ) ) {
									$answered[ $blank_id ] = $ld_answers[ $index ];
								}
								++$index;
							}
						} elseif ( is_string( $ld_answers ) && ! empty( $blank_ids[0] ) ) {
							// Single answer case.
							$answered[ $blank_ids[0] ] = $ld_answers;
						}
					} else {
						// Fallback: pass through as-is if blanks meta not found.
						if ( is_array( $ld_answers ) ) {
							$answered = $ld_answers;
						} elseif ( is_string( $ld_answers ) ) {
							$answered = array( $ld_answers );
						}
					}
				}
				break;

			default:
				if ( is_array( $ld_answers ) ) {
					foreach ( $lp_answers as $index => $lp_answer ) {
						if ( isset( $ld_answers[ $index ] ) ) {
							$answered[] = $lp_answer['value'];
						}
					}
				}
				break;
		}

		return array( $answered, $options );
	}

	/**
	 * Build matching answer array for matching_sorting questions.
	 *
	 * @param mixed $ld_answers     LD answer data.
	 * @param array $lp_answers     LP question answers.
	 * @param int   $lp_question_id LP question ID.
	 * @return array Answered values.
	 */
	private function build_matching_answer( $ld_answers, $lp_answers, $lp_question_id ) {
		$answered = array();

		foreach ( $lp_answers as $lp_answer ) {
			$answered[] = $lp_answer['value'];
		}

		return $answered;
	}

	/**
	 * Build matching options with shuffled_targets for display.
	 *
	 * @param array $lp_answers     LP question answers.
	 * @param int   $lp_question_id LP question ID.
	 * @return array Options array.
	 */
	private function build_matching_options( $lp_answers, $lp_question_id ) {
		$options = array();

		// Build shuffled targets (all targets in shuffled order).
		$all_targets = array();
		foreach ( $lp_answers as $lp_answer ) {
			$match_target  = get_metadata( 'learnpress_question_answer', $lp_answer['question_answer_id'], '_match_target', true );
			$all_targets[] = array(
				'value'        => $lp_answer['value'],
				'match_target' => $match_target ?: '',
				'order'        => (int) $lp_answer['order'],
			);
		}

		shuffle( $all_targets );

		foreach ( $lp_answers as $lp_answer ) {
			$match_target = get_metadata( 'learnpress_question_answer', $lp_answer['question_answer_id'], '_match_target', true );

			$options[] = array(
				'title'            => $lp_answer['title'],
				'value'            => $lp_answer['value'],
				'is_true'          => $lp_answer['is_true'] ?: '',
				'match_target'     => $match_target ?: '',
				'order'            => (int) $lp_answer['order'],
				'shuffled_targets' => $all_targets,
			);
		}

		return $options;
	}

	/**
	 * Clear student count cache for a course.
	 *
	 * This ensures CourseModel::count_students() returns correct values after migration.
	 *
	 * @param int $lp_course_id LearnPress course ID.
	 */
	private function clear_course_student_cache( $lp_course_id ) {
		// Clear LP_Course_Cache.
		if ( class_exists( 'LP_Course_Cache' ) ) {
			$lp_course_cache = \LP_Course_Cache::instance();
			$lp_course_cache->clean_total_students_enrolled_or_purchased( $lp_course_id );
			$lp_course_cache->clean_total_students_enrolled( $lp_course_id );
		}

		// Clear Thim_Cache_DB if available.
		if ( class_exists( 'Thim_Cache_DB' ) ) {
			\Thim_Cache_DB::instance()->remove_cache( "learn_press/course/{$lp_course_id}/total-students-enrolled-or-purchased" );
			\Thim_Cache_DB::instance()->remove_cache( "learn_press/course/{$lp_course_id}/total-students-enrolled" );
		}

		// Clear LP_Cache static cache.
		if ( class_exists( 'LP_Cache' ) ) {
			\LP_Cache::cache_load_first( 'clear', "{$lp_course_id}/total-students-enrolled-or-purchased" );
			\LP_Cache::cache_load_first( 'clear', "{$lp_course_id}/total-students-enrolled" );
		}
	}
}
