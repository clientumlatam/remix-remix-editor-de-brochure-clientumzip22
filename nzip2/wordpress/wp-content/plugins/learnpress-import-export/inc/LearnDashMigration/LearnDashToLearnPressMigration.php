<?php
/**
 * LearnDash to LearnPress Migration Class (Refactored)
 *
 * Uses LearnPress Models from inc/Models/ for proper data creation.
 *
 * @package LPImportExport\LearnDashMigration
 */

namespace LPImportExport\LearnDashMigration;

use LearnPress\Models\PostModel;
use LearnPress\Models\CoursePostModel;
use LearnPress\Models\LessonPostModel;
use LearnPress\Models\QuizPostModel;
use LearnPress\Models\CourseSectionModel;
use LearnPress\Models\CourseSectionItemModel;
use LearnPress\Models\Question\QuestionPostModel;
use LearnPress\Models\Question\QuestionAnswerModel;
use LearnPress\Models\Quiz\QuizQuestionModel;
use LearnPress\Databases\QuizQuestionsDB;
use LearnPress\Databases\PostDB;
use LP_Course_Post_Type;

/**
 * Class LearnDashToLearnPressMigration
 * Handles migrating LearnDash course content to LearnPress using LP Models.
 */
class LearnDashToLearnPressMigration {

	/**
	 * Mapping of LearnDash IDs to LearnPress IDs.
	 *
	 * @var array
	 */
	private $mapping = array(
		'courses'      => array(),
		'lessons'      => array(),
		'topics'       => array(),
		'quizzes'      => array(),
		'quiz_pro'     => array(),
		'questions'    => array(),
		'question_pro' => array(),
		'sections'     => array(),
	);

	/**
	 * Question type mapping from LearnDash to LearnPress.
	 *
	 * @var array
	 */
	private $question_type_map = array(
		'single'             => 'single_choice',
		'multiple'           => 'multi_choice',
		'free_answer'        => 'fill_in_blanks',
		'sort_answer'        => 'sorting_choice',
		'cloze_answer'       => 'fill_in_blanks',
		'matrix_sort_answer' => 'matching_sorting',
	);

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->mapping = get_option( 'learndash_migration_mapping', $this->mapping );
	}

	/**
	 * Migrate a single LearnDash course by its ID.
	 *
	 * Static helper method to manually migrate a specific course.
	 * Usage: LearnDashToLearnPressMigration::migrate_course_by_id( 12345 );
	 *
	 * @param int  $ld_course_id LearnDash course ID.
	 * @param bool $force        Force re-migration even if already migrated.
	 * @return int|false LearnPress course ID on success, false on failure.
	 */
	public static function migrate_course_by_id( int $ld_course_id, bool $force = false ) {
		$course = get_post( $ld_course_id );

		if ( ! $course || 'sfwd-courses' !== $course->post_type ) {
			error_log( "migrate_course_by_id: Invalid LearnDash course ID: {$ld_course_id}" );
			return false;
		}

		// Check if already migrated
		$existing_lp_id = get_post_meta( $ld_course_id, '_lp_course_id', true );
		if ( $existing_lp_id && ! $force ) {
			error_log( "migrate_course_by_id: Course {$ld_course_id} already migrated to LP course {$existing_lp_id}. Use force=true to re-migrate." );
			return (int) $existing_lp_id;
		}

		// Build course data using LearnDashDataDump
		$dumper         = new LearnDashDataDump();
		$ld_course_data = $dumper->get_course_data( $course );

		// If force and existing LP course, delete it first
		if ( $existing_lp_id && $force ) {
			global $wpdb;

			// Delete section items and sections
			$sections = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT section_id FROM {$wpdb->prefix}learnpress_sections WHERE section_course_id = %d",
					$existing_lp_id
				)
			);

			foreach ( $sections as $section ) {
				$wpdb->delete( $wpdb->prefix . 'learnpress_section_items', array( 'section_id' => $section->section_id ) );
			}
			$wpdb->delete( $wpdb->prefix . 'learnpress_sections', array( 'section_course_id' => $existing_lp_id ) );

			wp_delete_post( $existing_lp_id, true );
			delete_post_meta( $ld_course_id, '_lp_course_id' );
		}

		// Migrate
		$migrator     = new self();
		$lp_course_id = $migrator->migrate_course( $ld_course_data );

		if ( $lp_course_id ) {
			error_log( "migrate_course_by_id: Successfully migrated LD course {$ld_course_id} to LP course {$lp_course_id}" );
		}

		return $lp_course_id;
	}

	/**
	 * Migrate a course from LearnDash to LearnPress.
	 *
	 * @param array $ld_course LearnDash course data.
	 * @return int|false LearnPress course ID or false on failure.
	 */
	public function migrate_course( $ld_course ) {
		try {
			// Create course using CoursePostModel.
			$coursePostModel               = new CoursePostModel();
			$coursePostModel->post_title   = $ld_course['title'];
			$coursePostModel->post_name    = $ld_course['slug'];
			$coursePostModel->post_content = $ld_course['content'] ?? '';
			$coursePostModel->post_excerpt = $ld_course['excerpt'] ?? '';
			$coursePostModel->post_status  = $ld_course['status'];
			$coursePostModel->post_author  = $ld_course['author_id'] ?? get_current_user_id();
			$coursePostModel->save();

			$lp_course_id = $coursePostModel->get_id();

			if ( ! $lp_course_id ) {
				return false;
			}

			// Set course meta using CoursePostModel API.
			$coursePostModel->save_meta_value_by_key( '_ld_course_id', $ld_course['id'], true );
			$coursePostModel->save_meta_value_by_key( CoursePostModel::META_KEY_DURATION, '10 week', true );
			$coursePostModel->save_meta_value_by_key( CoursePostModel::META_KEY_LEVEL, 'all', true );

			if ( ! empty( $ld_course['feature_image'] ) ) {
				$attachment_id = attachment_url_to_postid( $ld_course['feature_image'] );
				if ( $attachment_id ) {
					set_post_thumbnail( $lp_course_id, $attachment_id );
				}
			}

			if ( ! empty( $ld_course['price'] ) ) {
				$coursePostModel->save_meta_value_by_key( CoursePostModel::META_KEY_REGULAR_PRICE, $ld_course['price'], true );
				$coursePostModel->save();
			}

			// Reverse mapping on LD entity.
			update_post_meta( $ld_course['id'], '_lp_course_id', $lp_course_id );

			$this->mapping['courses'][ $ld_course['id'] ] = $lp_course_id;

			// Migrate course content with section-aware logic.
			$this->migrate_course_content( $ld_course, $coursePostModel );

			update_option( 'learndash_migration_mapping', $this->mapping );

			// Clear LearnPress caches.
			$this->clear_course_cache( $lp_course_id );

			return $lp_course_id;

		} catch ( \Exception $e ) {
			error_log( 'LearnDash Migration Error: ' . $e->getMessage() );
			return false;
		}
	}

	/**
	 * Migrate course content from new section-centric structure.
	 *
	 * Iterates over sections from dump_sections() which now contain:
	 * - section_name, section_order, section_description
	 * - items[] with item_type ('lesson' or 'quiz') and full item data
	 *
	 * @param array           $ld_course   LearnDash course data.
	 * @param CoursePostModel $coursePostModel LearnPress course model.
	 */
	private function migrate_course_content( $ld_course, CoursePostModel $coursePostModel ) {
		$sections = $ld_course['sections'] ?? array();

		foreach ( $sections as $section ) {
			// Create LP section.
			$lpSection = $coursePostModel->add_section(
				array(
					'section_name'        => $section['section_name'],
					'section_description' => $section['section_description'] ?? '',
				)
			);

			$section_id = $lpSection->get_section_id();

			// Process items in order.
			foreach ( $section['items'] ?? array() as $item ) {
				$item_type = $item['item_type'] ?? '';

				if ( 'lesson' === $item_type ) {
					// Migrate lesson with its topics and quizzes.
					$this->migrate_lesson_with_items( $item, $lpSection );
				} elseif ( 'quiz' === $item_type ) {
					// Migrate quiz directly to LP quiz.
					$this->migrate_quiz( $item, $lpSection );
				}
			}
		}
	}

	/**
	 * Migrate lesson and all its child items (topics, quizzes) into a section.
	 *
	 * @param array              $ld_lesson    LearnDash lesson data.
	 * @param CourseSectionModel $sectionModel Section model.
	 */
	private function migrate_lesson_with_items( $ld_lesson, CourseSectionModel $sectionModel ) {
		// Migrate the lesson itself.
		$this->migrate_lesson( $ld_lesson, $sectionModel );

		// Migrate topics as lessons in the same section.
		if ( ! empty( $ld_lesson['topics'] ) ) {
			foreach ( $ld_lesson['topics'] as $ld_topic ) {
				$this->migrate_topic( $ld_topic, $sectionModel );
			}
		}

		// Migrate lesson quizzes in the same section.
		if ( ! empty( $ld_lesson['quizzes'] ) ) {
			foreach ( $ld_lesson['quizzes'] as $ld_quiz ) {
				$this->migrate_quiz( $ld_quiz, $sectionModel );
			}
		}
	}

	/**
	 * Migrate a lesson using CourseSectionModel::create_item_and_add().
	 *
	 * @param array              $ld_lesson     LearnDash lesson data.
	 * @param CourseSectionModel $sectionModel  Section model.
	 * @return int|false LearnPress lesson ID or false on failure.
	 */
	private function migrate_lesson( $ld_lesson, CourseSectionModel $sectionModel ) {
		try {
			// Create lesson and add to section using CourseSectionModel API.
			$sectionItemModel = $sectionModel->create_item_and_add(
				array(
					'item_type'    => LP_LESSON_CPT,
					'item_title'   => $ld_lesson['title'],
					'item_content' => $ld_lesson['content'] ?? '',
				)
			);

			$lp_lesson_id = $sectionItemModel->item_id;

			if ( ! $lp_lesson_id ) {
				return false;
			}

			// Set lesson meta.
			update_post_meta( $lp_lesson_id, '_ld_lesson_id', $ld_lesson['id'] );
			update_post_meta( $ld_lesson['id'], '_lp_lesson_id', $lp_lesson_id );

			// Migrate Elementor page builder data if exists.
			$this->migrate_elementor_data( $ld_lesson['id'], $lp_lesson_id );

			$this->mapping['lessons'][ $ld_lesson['id'] ] = $lp_lesson_id;

			return $lp_lesson_id;
		} catch ( \Exception $e ) {
			error_log( 'Lesson migration error: ' . $e->getMessage() );
			return false;
		}
	}

	/**
	 * Migrate a topic (converted to lesson in LearnPress) using CourseSectionModel::create_item_and_add().
	 *
	 * @param array              $ld_topic      LearnDash topic data.
	 * @param CourseSectionModel $sectionModel  Section model.
	 * @return int|false LearnPress lesson ID or false on failure.
	 */
	private function migrate_topic( $ld_topic, CourseSectionModel $sectionModel ) {
		try {
			// Create lesson from topic and add to section using CourseSectionModel API.
			$sectionItemModel = $sectionModel->create_item_and_add(
				array(
					'item_type'    => LP_LESSON_CPT,
					'item_title'   => $ld_topic['title'],
					'item_content' => $ld_topic['content'] ?? '',
				)
			);

			$lp_lesson_id = $sectionItemModel->item_id;

			if ( ! $lp_lesson_id ) {
				return false;
			}

			// Set topic meta.
			update_post_meta( $lp_lesson_id, '_ld_topic_id', $ld_topic['id'] );
			update_post_meta( $ld_topic['id'], '_lp_lesson_id', $lp_lesson_id );

			// Migrate Elementor page builder data if exists.
			$this->migrate_elementor_data( $ld_topic['id'], $lp_lesson_id );

			$this->mapping['topics'][ $ld_topic['id'] ] = $lp_lesson_id;

			return $lp_lesson_id;
		} catch ( \Exception $e ) {
			error_log( 'Topic migration error: ' . $e->getMessage() );
			return false;
		}
	}

	/**
	 * Migrate a quiz using CourseSectionModel::create_item_and_add() and QuizPostModel.
	 *
	 * @param array              $ld_quiz       LearnDash quiz data.
	 * @param CourseSectionModel $sectionModel  Section model.
	 * @return int|false LearnPress quiz ID or false on failure.
	 */
	private function migrate_quiz( $ld_quiz, CourseSectionModel $sectionModel ) {
		try {
			// Create quiz and add to section using CourseSectionModel API.
			$sectionItemModel = $sectionModel->create_item_and_add(
				array(
					'item_type'    => LP_QUIZ_CPT,
					'item_title'   => $ld_quiz['title'],
					'item_content' => $ld_quiz['content'] ?? '',
				)
			);

			$lp_quiz_id = $sectionItemModel->item_id;

			if ( ! $lp_quiz_id ) {
				return false;
			}

			// Get QuizPostModel for further operations.
			$quizPostModel = QuizPostModel::find( $lp_quiz_id );

			// Set quiz meta using QuizPostModel API.
			$quizPostModel->save_meta_value_by_key( '_ld_quiz_id', $ld_quiz['id'], true );

			if ( isset( $ld_quiz['quiz_pro_id'] ) ) {
				$this->mapping['quiz_pro'][ $ld_quiz['quiz_pro_id'] ] = $lp_quiz_id;
			}

			$duration = $ld_quiz['pro_quiz']['time_limit'] ?? 0;
			$quizPostModel->save_meta_value_by_key( QuizPostModel::META_KEY_DURATION, $duration > 0 ? "{$duration} minute" : '0 minute', true );
			$quizPostModel->save_meta_value_by_key( QuizPostModel::META_KEY_PASSING_GRADE, 60, true );
			$quizPostModel->save_meta_value_by_key( QuizPostModel::META_KEY_REVIEW, 'yes', true );

			$this->mapping['quizzes'][ $ld_quiz['id'] ] = $lp_quiz_id;
			update_post_meta( $ld_quiz['id'], '_lp_quiz_id', $lp_quiz_id );

			// Migrate questions using QuizPostModel.
			if ( ! empty( $ld_quiz['questions'] ) && $quizPostModel ) {
				$this->migrate_questions( $ld_quiz['questions'], $quizPostModel );
			}

			return $lp_quiz_id;
		} catch ( \Exception $e ) {
			error_log( 'Quiz migration error: ' . $e->getMessage() );
			return false;
		}
	}

	/**
	 * Migrate questions for a quiz using QuizPostModel::create_question_and_add().
	 *
	 * @param array         $questions      Array of LearnDash question data.
	 * @param QuizPostModel $quizPostModel  LearnPress quiz model.
	 */
	private function migrate_questions( $questions, QuizPostModel $quizPostModel ) {
		$lp_quiz_id = $quizPostModel->get_id();

		foreach ( $questions as $ld_question ) {
			$ld_type = $ld_question['pro_question']['answer_type'] ?? 'single';

			if ( ! isset( $this->question_type_map[ $ld_type ] ) ) {
				continue;
			}

			$lp_type          = $this->question_type_map[ $ld_type ];
			$question_content = $ld_question['content'] ?? $ld_question['pro_question']['question'] ?? '';

			try {
				// For simple question types (single, multi, sorting), use QuizPostModel API.
				if ( in_array( $lp_type, array( 'single_choice', 'multi_choice', 'sorting_choice' ), true ) ) {
					// Prepare question options from LD answers.
					$question_options = array();
					$answers          = $ld_question['answers']['options'] ?? $ld_question['answers'] ?? array();

					foreach ( $answers as $answer ) {
						$is_correct         = ( 'sorting_choice' === $lp_type || ! empty( $answer['is_correct'] ) ) ? 'yes' : '';
						$question_options[] = array(
							'title'   => $answer['answer'] ?? $answer['title'] ?? $answer['text'] ?? '',
							'is_true' => $is_correct,
						);
					}

					// Create question and add to quiz using QuizPostModel API.
					$quizQuestionModel = $quizPostModel->create_question_and_add(
						array(
							'question_title'   => $ld_question['title'],
							'question_type'    => $lp_type,
							'question_content' => $question_content,
							'question_options' => $question_options,
						)
					);

					$lp_question_id = $quizQuestionModel->question_id;

					if ( $lp_question_id ) {
						// Set additional meta.
						update_post_meta( $lp_question_id, '_ld_question_id', $ld_question['id'] );
						update_post_meta( $lp_question_id, '_lp_mark', $ld_question['pro_question']['points'] ?? 1 );

						if ( isset( $ld_question['question_pro_id'] ) ) {
							update_post_meta( $lp_question_id, '_ld_question_pro_id', $ld_question['question_pro_id'] );
						}

						if ( ! empty( $ld_question['pro_question']['tip_msg'] ) ) {
							update_post_meta( $lp_question_id, '_lp_hint', $ld_question['pro_question']['tip_msg'] );
						}

						if ( ! empty( $ld_question['pro_question']['correct_msg'] ) ) {
							update_post_meta( $lp_question_id, '_lp_explanation', $ld_question['pro_question']['correct_msg'] );
						}

						update_post_meta( $ld_question['id'], '_lp_question_id', $lp_question_id );
						$this->mapping['questions'][ $ld_question['id'] ] = $lp_question_id;
					}
				} else {
					// For complex types (FIB, matching_sorting), use manual creation.
					$lp_question_id = $this->create_complex_question( $ld_question, $lp_quiz_id, $lp_type, $ld_type );

					if ( $lp_question_id ) {
						$this->mapping['questions'][ $ld_question['id'] ] = $lp_question_id;
					}
				}
			} catch ( \Exception $e ) {
				error_log( 'Question migration error: ' . $e->getMessage() );
				continue;
			}
		}
	}

	/**
	 * Create complex question types (FIB, matching) that need special handling.
	 *
	 * @param array  $ld_question LearnDash question data.
	 * @param int    $lp_quiz_id  LearnPress quiz ID.
	 * @param string $lp_type     LearnPress question type.
	 * @param string $ld_type     LearnDash question type.
	 * @return int|false LearnPress question ID or false on failure.
	 */
	private function create_complex_question( $ld_question, $lp_quiz_id, $lp_type, $ld_type ) {
		// Create question using QuestionPostModel for complex types.
		$questionModel               = new QuestionPostModel();
		$questionModel->post_title   = $ld_question['title'];
		$questionModel->post_content = $ld_question['content'] ?? $ld_question['pro_question']['question'] ?? '';
		$questionModel->post_status  = $ld_question['status'] ?? 'publish';
		$questionModel->post_author  = get_current_user_id();
		$questionModel->save();

		$lp_question_id = $questionModel->get_id();

		if ( ! $lp_question_id ) {
			return false;
		}

		// Set question meta using QuestionPostModel API.
		$questionModel->save_meta_value_by_key( '_ld_question_id', $ld_question['id'], true );
		$questionModel->save_meta_value_by_key( QuestionPostModel::META_KEY_TYPE, $lp_type, true );
		$questionModel->save_meta_value_by_key( QuestionPostModel::META_KEY_MARK, $ld_question['pro_question']['points'] ?? 1, true );

		if ( isset( $ld_question['question_pro_id'] ) ) {
			$questionModel->save_meta_value_by_key( '_ld_question_pro_id', $ld_question['question_pro_id'], true );
		}

		if ( ! empty( $ld_question['pro_question']['tip_msg'] ) ) {
			$questionModel->save_meta_value_by_key( QuestionPostModel::META_KEY_HINT, $ld_question['pro_question']['tip_msg'], true );
		}

		if ( ! empty( $ld_question['pro_question']['correct_msg'] ) ) {
			$questionModel->save_meta_value_by_key( QuestionPostModel::META_KEY_EXPLANATION, $ld_question['pro_question']['correct_msg'], true );
		}

		update_post_meta( $ld_question['id'], '_lp_question_id', $lp_question_id );

		// Link question to quiz using QuizQuestionModel.
		$quizQuestionsDB = QuizQuestionsDB::getInstance();
		$max_order       = $quizQuestionsDB->get_last_number_order( $lp_quiz_id );

		$quizQuestionModel                 = new QuizQuestionModel();
		$quizQuestionModel->quiz_id        = $lp_quiz_id;
		$quizQuestionModel->question_id    = $lp_question_id;
		$quizQuestionModel->question_order = $max_order + 1;
		$quizQuestionModel->save();

		// Migrate answers based on question type.
		if ( 'fill_in_blanks' === $lp_type ) {
			if ( 'cloze_answer' === $ld_type ) {
				$fib_content = $ld_question['answers']['options'][0]['answer'] ?? $ld_question['title'] ?? '';
				if ( ! empty( $fib_content ) ) {
					$this->migrate_fib_answers( $fib_content, $lp_question_id );
				}
			} elseif ( 'free_answer' === $ld_type ) {
				$expected_answer  = $ld_question['answers']['options'][0]['answer'] ?? '';
				$question_content = $ld_question['content'] ?? $ld_question['pro_question']['question'] ?? '';
				if ( ! empty( $expected_answer ) ) {
					$this->migrate_free_answer_to_fib( $question_content, $expected_answer, $lp_question_id );
				}
			}
		} elseif ( 'matching_sorting' === $lp_type ) {
			if ( ! empty( $ld_question['answers']['options'] ) ) {
				$this->migrate_matching_sorting_answers( $ld_question['answers']['options'], $lp_question_id );
			}
		}

		return $lp_question_id;
	}

	/**
	 * Migrate answers for a question using QuestionAnswerModel.
	 *
	 * @param array  $options        Answer options.
	 * @param int    $lp_question_id LearnPress question ID.
	 * @param string $lp_type        LearnPress question type.
	 */
	private function migrate_answers( $options, $lp_question_id, $lp_type ) {
		foreach ( $options as $index => $answer ) {
			$is_correct  = ( 'sorting_choice' === $lp_type || ! empty( $answer['is_correct'] ) ) ? 'yes' : '';
			$answer_text = $answer['answer'] ?? $answer['title'] ?? $answer['text'] ?? 'Option ' . ( $index + 1 );

			try {
				$answerModel              = new QuestionAnswerModel();
				$answerModel->question_id = $lp_question_id;
				$answerModel->title       = $answer_text;
				$answerModel->value       = function_exists( 'learn_press_random_value' )
					? learn_press_random_value( 10 )
					: substr( md5( uniqid( wp_rand(), true ) ), 0, 10 );
				$answerModel->is_true     = $is_correct;
				$answerModel->order       = $index + 1;
				$answerModel->save();
			} catch ( \Exception $e ) {
				// Fallback to direct insert.
				global $wpdb;
				$wpdb->insert(
					$wpdb->prefix . 'learnpress_question_answers',
					array(
						'question_id' => $lp_question_id,
						'title'       => $answer_text,
						'value'       => function_exists( 'learn_press_random_value' )
						? learn_press_random_value( 10 )
						: substr( md5( uniqid( wp_rand(), true ) ), 0, 10 ),
						'is_true'     => $is_correct,
						'order'       => $index + 1,
					),
					array( '%d', '%s', '%s', '%s', '%d' )
				);
			}
		}
	}

	/**
	 * Migrate matching/sorting answers for a question.
	 *
	 * Handles matrix_sort_answer from LearnDash, creating LP answers with _match_target metadata.
	 * LearnDash stores: answer = left column, sort_string = right column (match target).
	 *
	 * @param array $options        Answer options from LearnDash.
	 * @param int   $lp_question_id LearnPress question ID.
	 */
	private function migrate_matching_sorting_answers( $options, $lp_question_id ) {
		foreach ( $options as $index => $answer ) {
			// LearnDash: 'answer' is left column, 'sort_string' is right column (match target).
			$left_text  = $answer['answer'] ?? $answer['title'] ?? $answer['text'] ?? 'Item ' . ( $index + 1 );
			$right_text = $answer['sort_string'] ?? '';

			// Generate a unique value for this answer.
			$answer_value = function_exists( 'learn_press_random_value' )
				? learn_press_random_value( 10 )
				: substr( md5( uniqid( wp_rand(), true ) ), 0, 10 );

			try {
				$answerModel              = new QuestionAnswerModel();
				$answerModel->question_id = $lp_question_id;
				$answerModel->title       = $left_text;
				$answerModel->value       = $answer_value;
				$answerModel->is_true     = 'yes'; // All matching pairs are "correct".
				$answerModel->order       = $index + 1;
				$answerModel->save();

				// Save _match_target metadata with JSON structure.
				if ( ! empty( $right_text ) ) {
					$match_target_data = wp_json_encode(
						array(
							'id'    => $answer_value, // Use answer value as match ID.
							'title' => $right_text,
						)
					);
					$answerModel->save_meta_value_by_key( '_match_target', $match_target_data );
				}
			} catch ( \Exception $e ) {
				// Fallback to direct insert.
				global $wpdb;

				$wpdb->insert(
					$wpdb->prefix . 'learnpress_question_answers',
					array(
						'question_id' => $lp_question_id,
						'title'       => $left_text,
						'value'       => $answer_value,
						'is_true'     => 'yes',
						'order'       => $index + 1,
					),
					array( '%d', '%s', '%s', '%s', '%d' )
				);

				$answer_id = $wpdb->insert_id;

				// Save _match_target metadata directly.
				if ( ! empty( $right_text ) && $answer_id ) {
					$match_target_data = wp_json_encode(
						array(
							'id'    => $answer_value,
							'title' => $right_text,
						)
					);

					$wpdb->insert(
						$wpdb->prefix . 'learnpress_question_answermeta',
						array(
							'learnpress_question_answer_id' => $answer_id,
							'meta_key'   => '_match_target',
							'meta_value' => $match_target_data,
						),
						array( '%d', '%s', '%s' )
					);
				}
			}
		}
	}

	/**
	 * Migrate FIB (Fill in Blanks) answers.
	 *
	 * Converts LearnDash {placeholder} format to LearnPress [fib fill="" id="" ] format.
	 * Also creates the _blanks meta data required by LearnPress.
	 *
	 * @param string $content        The question content with {placeholder} syntax.
	 * @param int    $lp_question_id LearnPress question ID.
	 */
	private function migrate_fib_answers( $content, $lp_question_id ) {
		// Pattern to match LearnDash cloze placeholders: {answer}
		$pattern = '/\{([^}]+)\}/';

		$blanks_meta = array();

		// Convert {placeholder} to [fib fill="" id="" ] format.
		$converted_content = preg_replace_callback(
			$pattern,
			function ( $matches ) use ( &$blanks_meta ) {
				$fill = $matches[1];
				// Generate unique ID for each blank.
				$id = function_exists( 'learn_press_random_value' )
					? learn_press_random_value( 10 )
					: substr( md5( uniqid( wp_rand(), true ) ), 0, 12 );

				// Store blank meta.
				$blanks_meta[ $id ] = array(
					'id'         => $id,
					'fill'       => html_entity_decode( $fill ),
					'match_case' => 0,
					'comparison' => 'equal',
				);

				return '[fib fill="' . esc_attr( $fill ) . '" id="' . $id . '" ]';
			},
			$content
		);

		// Strip HTML tags but keep the text structure.
		$converted_content = wp_strip_all_tags( $converted_content );

		try {
			// Create answer record in learnpress_question_answers.
			$answerModel              = new QuestionAnswerModel();
			$answerModel->question_id = $lp_question_id;
			$answerModel->title       = $converted_content;
			$answerModel->value       = function_exists( 'learn_press_random_value' )
				? learn_press_random_value( 10 )
				: substr( md5( uniqid( wp_rand(), true ) ), 0, 10 );
			$answerModel->is_true     = '';
			$answerModel->order       = 1;
			$answerModel->save();

			// Save _blanks meta data.
			if ( ! empty( $blanks_meta ) ) {
				$answerModel->save_meta_value_by_key( QuestionAnswerModel::META_KEY_BLANKS, $blanks_meta );
			}
		} catch ( \Exception $e ) {
			// Fallback to direct insert.
			global $wpdb;

			$value = function_exists( 'learn_press_random_value' )
				? learn_press_random_value( 10 )
				: substr( md5( uniqid( wp_rand(), true ) ), 0, 10 );

			$wpdb->insert(
				$wpdb->prefix . 'learnpress_question_answers',
				array(
					'question_id' => $lp_question_id,
					'title'       => $converted_content,
					'value'       => $value,
					'is_true'     => '',
					'order'       => 1,
				),
				array( '%d', '%s', '%s', '%s', '%d' )
			);

			$answer_id = $wpdb->insert_id;

			// Save _blanks meta data directly.
			if ( ! empty( $blanks_meta ) && $answer_id ) {
				$wpdb->insert(
					$wpdb->prefix . 'learnpress_question_answermeta',
					array(
						'learnpress_question_answer_id' => $answer_id,
						'meta_key'                      => '_blanks',
						'meta_value'                    => maybe_serialize( $blanks_meta ),
					),
					array( '%d', '%s', '%s' )
				);
			}
		}
	}

	/**
	 * Migrate free_answer questions to fill_in_blanks format.
	 *
	 * For free_answer questions, LearnDash stores only the expected answer text.
	 * We need to embed this answer into the question content as a FIB blank.
	 * The format becomes: "question_text [fib fill=\"expected_answer\" id=\"unique_id\" ]"
	 *
	 * @param string $question_content The original question content/text(example: Paris|paris|PARIS).
	 * @param string $expected_answer  The expected answer from LearnDash.
	 * @param int    $lp_question_id   LearnPress question ID.
	 */
	private function migrate_free_answer_to_fib( $question_content, $expected_answer, $lp_question_id ) {
		// LearnDash free_answer may have multiple accepted answers separated by pipe (|).
		// LearnPress fill_in_blanks only supports one answer per blank, so use the first non-empty one.
		$answer_parts = explode( '|', $expected_answer );
		// Trim whitespace and filter out empty values.
		$answer_parts = array_values( array_filter( array_map( 'trim', $answer_parts ), 'strlen' ) );

		if ( empty( $answer_parts ) ) {
			return;
		}

		$primary_answer = $answer_parts[0];

		// Generate unique ID for the blank.
		$blank_id = function_exists( 'learn_press_random_value' )
			? learn_press_random_value( 10 )
			: substr( md5( uniqid( wp_rand(), true ) ), 0, 12 );

		// Create the FIB shortcode with the first (primary) answer.
		$fib_shortcode = '[fib fill="' . esc_attr( $primary_answer ) . '" id="' . $blank_id . '" ]';

		// Build the converted content: question text followed by blank.
		// Strip HTML tags but keep the text structure.
		$clean_content = wp_strip_all_tags( $question_content );

		// Append the FIB blank to the question content.
		$converted_content = trim( $clean_content ) . ' ' . $fib_shortcode;

		// Build blanks meta data with the primary answer.
		$blanks_meta = array(
			$blank_id => array(
				'id'         => $blank_id,
				'fill'       => html_entity_decode( $primary_answer ),
				'match_case' => 0,
				'comparison' => 'equal',
			),
		);

		try {
			// Create answer record in learnpress_question_answers.
			$answerModel              = new QuestionAnswerModel();
			$answerModel->question_id = $lp_question_id;
			$answerModel->title       = $converted_content;
			$answerModel->value       = function_exists( 'learn_press_random_value' )
				? learn_press_random_value( 10 )
				: substr( md5( uniqid( wp_rand(), true ) ), 0, 10 );
			$answerModel->is_true     = '';
			$answerModel->order       = 1;
			$answerModel->save();

			// Save _blanks meta data.
			if ( ! empty( $blanks_meta ) ) {
				$answerModel->save_meta_value_by_key( QuestionAnswerModel::META_KEY_BLANKS, $blanks_meta );
			}
		} catch ( \Exception $e ) {
			// Fallback to direct insert.
			global $wpdb;

			$value = function_exists( 'learn_press_random_value' )
				? learn_press_random_value( 10 )
				: substr( md5( uniqid( wp_rand(), true ) ), 0, 10 );

			$wpdb->insert(
				$wpdb->prefix . 'learnpress_question_answers',
				array(
					'question_id' => $lp_question_id,
					'title'       => $converted_content,
					'value'       => $value,
					'is_true'     => '',
					'order'       => 1,
				),
				array( '%d', '%s', '%s', '%s', '%d' )
			);

			$answer_id = $wpdb->insert_id;

			// Save _blanks meta data directly.
			if ( ! empty( $blanks_meta ) && $answer_id ) {
				$wpdb->insert(
					$wpdb->prefix . 'learnpress_question_answermeta',
					array(
						'learnpress_question_answer_id' => $answer_id,
						'meta_key'                      => '_blanks',
						'meta_value'                    => maybe_serialize( $blanks_meta ),
					),
					array( '%d', '%s', '%s' )
				);
			}
		}
	}

	/**
	 * Clear LearnPress caches for a course.
	 *
	 * @param int $lp_course_id Course ID.
	 */
	private function clear_course_cache( $lp_course_id ) {
		delete_post_meta( $lp_course_id, '_lp_info_extra_fast_query' );

		if ( class_exists( 'LP_Course_Cache' ) ) {
			$lp_course_cache = \LP_Course_Cache::instance();
			$lp_course_cache->clear( "courseModel/find/id/{$lp_course_id}" );
			$lp_course_cache->clear( "{$lp_course_id}/sections_items" );
		}

		if ( class_exists( 'Thim_Cache_DB' ) ) {
			\Thim_Cache_DB::instance()->remove_cache( "learn_press/course/courseModel/find/id/{$lp_course_id}" );
			\Thim_Cache_DB::instance()->remove_cache( "learn_press/course/{$lp_course_id}/sections_items" );
		}

		wp_cache_delete( $lp_course_id, 'posts' );
		wp_cache_delete( $lp_course_id, 'post_meta' );
		clean_post_cache( $lp_course_id );
	}

	/**
	 * Migrate Elementor page builder data from source to target post.
	 *
	 * Copies all Elementor-related post meta so lessons built with Elementor
	 * render correctly in LearnPress.
	 *
	 * @param int $source_id Source post ID (LearnDash lesson/topic).
	 * @param int $target_id Target post ID (LearnPress lesson).
	 */
	private function migrate_elementor_data( $source_id, $target_id ) {
		// Elementor meta keys that need to be copied.
		$elementor_meta_keys = array(
			'_elementor_data',           // Main Elementor JSON data.
			'_elementor_edit_mode',      // Edit mode flag.
			'_elementor_template_type',  // Template type.
			'_elementor_version',        // Elementor version.
			'_elementor_pro_version',    // Elementor Pro version.
			'_elementor_css',            // Compiled CSS.
			'_elementor_page_settings',  // Page settings.
			'_elementor_controls_usage', // Controls usage data.
		);

		foreach ( $elementor_meta_keys as $meta_key ) {
			$meta_value = get_post_meta( $source_id, $meta_key, true );

			if ( ! empty( $meta_value ) ) {
				// CRITICAL: Use wp_slash() to preserve escaped characters in Elementor JSON data.
				// WordPress update_post_meta() strips slashes, which corrupts Elementor widget settings.
				update_post_meta( $target_id, $meta_key, wp_slash( $meta_value ) );
			}
		}

		// If Elementor data exists, ensure the post uses Elementor's content rendering.
		$elementor_data = get_post_meta( $source_id, '_elementor_data', true );
		if ( ! empty( $elementor_data ) ) {
			// Set edit mode to 'builder' so Elementor knows to render the content.
			update_post_meta( $target_id, '_elementor_edit_mode', 'builder' );
		}
	}
}
