<?php
/**
 * LearnDash Data Dump Class
 *
 * @package LPImportExport\LearnDashMigration
 */

namespace LPImportExport\LearnDashMigration;

use LDLMS_Factory_Post;
use WpProQuiz_Model_QuizMapper;
use WpProQuiz_Model_QuestionMapper;

/**
 * Deprecated
 * Class LearnDashDataDump
 * Handles dumping LearnDash course data for migration to LearnPress.
 */
class LearnDashDataDump {

	/**
	 * Get course data.
	 *
	 * @param \WP_Post $course Course post object.
	 *
	 * @return array
	 */
	public function get_course_data( $course ) {
		$settings      = learndash_get_setting( $course->ID );
		$feature_image = null;
		$thumbnail_id  = get_post_thumbnail_id( $course->ID );

		if ( $thumbnail_id ) {
			$feature_image = wp_get_attachment_url( $thumbnail_id );
		}

		$price = ! empty( $settings['course_price'] ) ? $settings['course_price'] : null;

		return array(
			'id'            => $course->ID,
			'title'         => $course->post_title,
			'slug'          => $course->post_name,
			'status'        => $course->post_status,
			'content'       => $course->post_content,
			'excerpt'       => $course->post_excerpt,
			'author_id'     => $course->post_author,
			'created_at'    => $course->post_date,
			'modified_at'   => $course->post_modified,
			'feature_image' => $feature_image,
			'price'         => $price,
			'settings'      => $settings,
			'meta'          => $this->get_all_meta( $course->ID ),
			'sections'      => $this->dump_sections( $course->ID ),
		);
	}

	/**
	 * Dump course sections with full item data (LP-style structure).
	 *
	 * @param int $course_id Course ID.
	 * @return array Array of sections with embedded items.
	 */
	public function dump_sections( $course_id ) {
		$lessons    = $this->dump_lessons( $course_id );
		$lesson_map = $this->build_lesson_map( $lessons );
		$lesson_ids = $this->get_lesson_ids( $course_id );

		$ld_sections    = $this->get_ld_sections( $course_id );
		$section_bounds = $this->get_section_lesson_boundaries( $ld_sections );
		$ordered_items  = $this->build_ordered_items( $ld_sections, $section_bounds, $lesson_ids );

		$sections_data = $this->build_sections_data( $ordered_items, $lesson_map );

		// Add course-level quizzes as final section.
		$quiz_section = $this->build_quiz_section( $course_id, count( $sections_data ) + 1 );
		if ( $quiz_section ) {
			$sections_data[] = $quiz_section;
		}

		return $sections_data;
	}

	/**
	 * Build lesson lookup map by ID.
	 */
	private function build_lesson_map( array $lessons ): array {
		$map = array();
		foreach ( $lessons as $lesson ) {
			$map[ $lesson['id'] ] = $lesson;
		}
		return $map;
	}

	/**
	 * Get lesson IDs in course order.
	 */
	private function get_lesson_ids( int $course_id ): array {
		if ( function_exists( 'learndash_course_get_steps_by_type' ) ) {
			return learndash_course_get_steps_by_type( $course_id, 'sfwd-lessons' );
		}
		return array();
	}

	/**
	 * Get LearnDash sections sorted by order.
	 */
	private function get_ld_sections( int $course_id ): array {
		$sections = get_post_meta( $course_id, 'course_sections', true );
		if ( is_string( $sections ) ) {
			$sections = json_decode( $sections, true );
		}
		if ( empty( $sections ) || ! is_array( $sections ) ) {
			return array();
		}

		usort( $sections, fn( $a, $b ) => intval( $a['order'] ?? 0 ) <=> intval( $b['order'] ?? 0 ) );
		return $sections;
	}

	/**
	 * Calculate lesson boundaries for each section.
	 * Returns array of [lesson_start, lesson_end] for each section index.
	 */
	private function get_section_lesson_boundaries( array $sections ): array {
		$bounds = array();
		foreach ( $sections as $i => $section ) {
			$order = intval( $section['order'] ?? 0 );
			$start = $order - $i;

			if ( isset( $sections[ $i + 1 ]['order'] ) ) {
				$end = intval( $sections[ $i + 1 ]['order'] ) - ( $i + 1 );
			} else {
				$end = PHP_INT_MAX;
			}

			$bounds[ $i ] = array(
				'start' => $start,
				'end'   => $end,
			);
		}
		return $bounds;
	}

	/**
	 * Build ordered items list (sections + unassigned lessons).
	 */
	private function build_ordered_items( array $sections, array $bounds, array $lesson_ids ): array {
		$items              = array();
		$lessons_in_section = array();

		// Add sections with their lessons.
		foreach ( $sections as $i => $section ) {
			$section_lessons = array();
			foreach ( $lesson_ids as $idx => $lid ) {
				if ( $idx >= $bounds[ $i ]['start'] && $idx < $bounds[ $i ]['end'] ) {
					$section_lessons[]    = $lid;
					$lessons_in_section[] = $lid;
				}
			}

			$items[] = array(
				'type'       => 'section',
				'position'   => intval( $section['order'] ?? 0 ) + 0.5,
				'title'      => $section['post_title'] ?? '',
				'lesson_ids' => $section_lessons,
			);
		}

		// Add unassigned lessons.
		foreach ( $lesson_ids as $idx => $lid ) {
			if ( ! in_array( $lid, $lessons_in_section, true ) ) {
				$items[] = array(
					'type'      => 'lesson',
					'position'  => $idx,
					'lesson_id' => $lid,
				);
			}
		}

		usort( $items, fn( $a, $b ) => $a['position'] <=> $b['position'] );
		return $items;
	}

	/**
	 * Build final sections data from ordered items.
	 */
	private function build_sections_data( array $ordered_items, array $lesson_map ): array {
		$sections_data = array();
		$section_order = 0;

		foreach ( $ordered_items as $item ) {
			if ( 'section' === $item['type'] ) {
				$section = $this->build_lp_section( $item['title'], $item['lesson_ids'], $lesson_map, ++$section_order );
				if ( $section ) {
					$sections_data[] = $section;
				}
			} else {
				$lesson = $lesson_map[ $item['lesson_id'] ] ?? null;
				if ( $lesson ) {
					$lesson['item_type']  = 'lesson';
					$lesson['item_order'] = 1;
					$sections_data[]      = array(
						'section_name'        => $lesson['title'],
						'section_order'       => ++$section_order,
						'section_description' => '',
						'items'               => array( $lesson ),
					);
				}
			}
		}

		return $sections_data;
	}

	/**
	 * Build a single LP section with its items.
	 */
	private function build_lp_section( string $title, array $lesson_ids, array $lesson_map, int $order ): ?array {
		if ( empty( $lesson_ids ) ) {
			return null;
		}

		$items      = array();
		$item_order = 0;

		foreach ( $lesson_ids as $lid ) {
			if ( isset( $lesson_map[ $lid ] ) ) {
				$lesson               = $lesson_map[ $lid ];
				$lesson['item_type']  = 'lesson';
				$lesson['item_order'] = ++$item_order;
				$items[]              = $lesson;
			}
		}

		if ( empty( $items ) ) {
			return null;
		}

		return array(
			'section_name'        => $title,
			'section_order'       => $order,
			'section_description' => '',
			'items'               => $items,
		);
	}

	/**
	 * Build quiz section for course-level quizzes.
	 */
	private function build_quiz_section( int $course_id, int $order ): ?array {
		$quizzes = $this->dump_quizzes( $course_id, 'course' );
		if ( empty( $quizzes ) ) {
			return null;
		}

		$items = array();
		foreach ( $quizzes as $i => $quiz ) {
			$quiz['item_type']  = 'quiz';
			$quiz['item_order'] = $i + 1;
			$items[]            = $quiz;
		}

		return array(
			'section_name'        => 'Final Quizzes',
			'section_order'       => $order,
			'section_description' => '',
			'items'               => $items,
		);
	}



	/**
	 * Dump lessons for a course.
	 *
	 * @param int $course_id Course ID.
	 *
	 * @return array
	 */
	public function dump_lessons( $course_id ) {
		$lessons_data = array();

		// Use LearnDash's native function to get lessons.
		if ( ! function_exists( 'learndash_course_get_steps_by_type' ) ) {
			return $lessons_data;
		}

		$lesson_ids = learndash_course_get_steps_by_type( $course_id, 'sfwd-lessons' );

		if ( empty( $lesson_ids ) ) {
			return $lessons_data;
		}

		foreach ( $lesson_ids as $lesson_id ) {
			$lesson_post = get_post( $lesson_id );

			if ( ! $lesson_post ) {
				continue;
			}

			$lessons_data[] = array(
				'id'       => $lesson_post->ID,
				'title'    => $lesson_post->post_title,
				'slug'     => $lesson_post->post_name,
				'status'   => $lesson_post->post_status,
				'content'  => $lesson_post->post_content,
				'order'    => $lesson_post->menu_order,
				'settings' => learndash_get_setting( $lesson_post->ID ),
				'meta'     => $this->get_all_meta( $lesson_post->ID ),
				'topics'   => $this->dump_topics( $lesson_post->ID, $course_id ),
				'quizzes'  => $this->dump_quizzes( $lesson_post->ID, 'lesson' ),
			);
		}

		return $lessons_data;
	}

	/**
	 * Dump topics for a lesson.
	 *
	 * @param int $lesson_id Lesson ID.
	 * @param int $course_id Course ID.
	 *
	 * @return array
	 */
	public function dump_topics( $lesson_id, $course_id ) {
		$topics_data = array();

		// Use LearnDash's native function to get topics.
		if ( ! function_exists( 'learndash_get_topic_list' ) ) {
			return $topics_data;
		}

		$topics = learndash_get_topic_list( $lesson_id, $course_id );

		if ( empty( $topics ) ) {
			return $topics_data;
		}

		foreach ( $topics as $topic ) {
			$topic_post = is_object( $topic ) ? $topic : get_post( $topic );

			if ( ! $topic_post ) {
				continue;
			}

			$topics_data[] = array(
				'id'       => $topic_post->ID,
				'title'    => $topic_post->post_title,
				'slug'     => $topic_post->post_name,
				'status'   => $topic_post->post_status,
				'content'  => $topic_post->post_content,
				'order'    => $topic_post->menu_order,
				'settings' => learndash_get_setting( $topic_post->ID ),
				'meta'     => $this->get_all_meta( $topic_post->ID ),
				'quizzes'  => $this->dump_quizzes( $topic_post->ID, 'topic' ),
			);
		}

		return $topics_data;
	}

	/**
	 * Dump quizzes for a parent.
	 *
	 * @param int    $parent_id Parent ID.
	 * @param string $parent_type Parent type (course, lesson, topic).
	 *
	 * @return array
	 */
	public function dump_quizzes( $parent_id, $parent_type ) {
		$quizzes = array();

		// For course-level quizzes, use steps function.
		if ( 'course' === $parent_type ) {
			if ( ! function_exists( 'learndash_course_get_steps_by_type' ) ) {
				return $quizzes;
			}

			$quiz_ids = learndash_course_get_steps_by_type( $parent_id, 'sfwd-quiz' );

			// Filter to only get quizzes directly attached to course (not lessons).
			$quiz_ids = array_filter(
				$quiz_ids,
				function ( $quiz_id ) use ( $parent_id ) {
					$quiz_course_id = learndash_get_setting( $quiz_id, 'course' );
					$quiz_lesson_id = learndash_get_setting( $quiz_id, 'lesson' );

					// Only include if course matches and no lesson association.
					return intval( $quiz_course_id ) === intval( $parent_id ) && empty( $quiz_lesson_id );
				}
			);

			foreach ( $quiz_ids as $quiz_id ) {
				$quiz_post = get_post( $quiz_id );

				if ( ! $quiz_post ) {
					continue;
				}

				$quiz_pro_id = learndash_get_setting( $quiz_post->ID, 'quiz_pro' );
				$quizzes[]   = array(
					'id'          => $quiz_post->ID,
					'title'       => $quiz_post->post_title,
					'slug'        => $quiz_post->post_name,
					'status'      => $quiz_post->post_status,
					'content'     => $quiz_post->post_content,
					'order'       => $quiz_post->menu_order,
					'quiz_pro_id' => $quiz_pro_id,
					'settings'    => learndash_get_setting( $quiz_post->ID ),
					'meta'        => $this->get_all_meta( $quiz_post->ID ),
					'pro_quiz'    => $this->get_pro_quiz_data( $quiz_pro_id ),
					'questions'   => $this->dump_questions( $quiz_post->ID, $quiz_pro_id ),
				);
			}

			return $quizzes;
		}

		// For lesson/topic quizzes, use quiz list function.
		if ( ! function_exists( 'learndash_get_lesson_quiz_list' ) ) {
			return $quizzes;
		}

		$quiz_list = learndash_get_lesson_quiz_list( $parent_id );

		if ( empty( $quiz_list ) ) {
			return $quizzes;
		}

		foreach ( $quiz_list as $quiz_item ) {
			$quiz_post = isset( $quiz_item['post'] ) ? $quiz_item['post'] : null;

			if ( ! $quiz_post ) {
				continue;
			}

			$quiz_pro_id = learndash_get_setting( $quiz_post->ID, 'quiz_pro' );
			$quizzes[]   = array(
				'id'          => $quiz_post->ID,
				'title'       => $quiz_post->post_title,
				'slug'        => $quiz_post->post_name,
				'status'      => $quiz_post->post_status,
				'content'     => $quiz_post->post_content,
				'order'       => $quiz_post->menu_order,
				'quiz_pro_id' => $quiz_pro_id,
				'settings'    => learndash_get_setting( $quiz_post->ID ),
				'meta'        => $this->get_all_meta( $quiz_post->ID ),
				'pro_quiz'    => $this->get_pro_quiz_data( $quiz_pro_id ),
				'questions'   => $this->dump_questions( $quiz_post->ID, $quiz_pro_id ),
			);
		}

		return $quizzes;
	}

	/**
	 * Get Pro Quiz data.
	 *
	 * @param int $quiz_pro_id Pro Quiz ID.
	 *
	 * @return array|null
	 */
	private function get_pro_quiz_data( $quiz_pro_id ) {
		if ( empty( $quiz_pro_id ) || ! class_exists( 'WpProQuiz_Model_QuizMapper' ) ) {
			return null;
		}

		$quiz_mapper = new WpProQuiz_Model_QuizMapper();
		$quiz        = $quiz_mapper->fetch( $quiz_pro_id );

		if ( ! $quiz ) {
			return null;
		}

		return array(
			'id'              => $quiz->getId(),
			'name'            => $quiz->getName(),
			'text'            => $quiz->getText(),
			'result_text'     => $quiz->getResultText(),
			'title_hidden'    => $quiz->isTitleHidden(),
			'question_random' => $quiz->isQuestionRandom(),
			'answer_random'   => $quiz->isAnswerRandom(),
			'time_limit'      => $quiz->getTimeLimit(),
			'statistics_on'   => $quiz->isStatisticsOn(),
		);
	}

	/**
	 * Dump questions for a quiz.
	 *
	 * @param int $quiz_id Quiz post ID.
	 * @param int $quiz_pro_id Pro Quiz ID.
	 *
	 * @return array
	 */
	public function dump_questions( $quiz_id, $quiz_pro_id ) {
		$questions = array();

		if ( ! class_exists( 'LDLMS_Factory_Post' ) ) {
			return $questions;
		}

		$ld_quiz_questions_object = LDLMS_Factory_Post::quiz_questions( $quiz_id );

		if ( ! $ld_quiz_questions_object ) {
			return $questions;
		}

		$question_posts = $ld_quiz_questions_object->get_questions();

		if ( empty( $question_posts ) ) {
			return $questions;
		}

		$question_mapper = new WpProQuiz_Model_QuestionMapper();

		foreach ( $question_posts as $question_post_id => $question_pro_id ) {
			$question_post = get_post( $question_post_id );

			if ( ! $question_post ) {
				continue;
			}

			$pro_question = ! empty( $question_pro_id ) ? $question_mapper->fetch( $question_pro_id ) : null;

			$questions[] = array(
				'id'              => $question_post->ID,
				'title'           => $question_post->post_title,
				'slug'            => $question_post->post_name,
				'status'          => $question_post->post_status,
				'content'         => $question_post->post_content,
				'order'           => $question_post->menu_order,
				'question_pro_id' => $question_pro_id,
				'settings'        => learndash_get_setting( $question_post->ID ),
				'meta'            => $this->get_all_meta( $question_post->ID ),
				'pro_question'    => $this->get_pro_question_data( $pro_question ),
				'answers'         => $this->get_question_answers( $pro_question ),
			);
		}

		return $questions;
	}

	/**
	 * Get Pro Question data.
	 *
	 * @param \WpProQuiz_Model_Question|null $pro_question Pro Question object.
	 *
	 * @return array|null
	 */
	private function get_pro_question_data( $pro_question ) {
		if ( ! $pro_question || ! is_a( $pro_question, 'WpProQuiz_Model_Question' ) ) {
			return null;
		}

		return array(
			'id'          => $pro_question->getId(),
			'quiz_id'     => $pro_question->getQuizId(),
			'answer_type' => $pro_question->getAnswerType(),
			'points'      => $pro_question->getPoints(),
		);
	}

	/**
	 * Get question answers.
	 *
	 * @param \WpProQuiz_Model_Question|null $pro_question Pro Question object.
	 *
	 * @return array
	 */
	private function get_question_answers( $pro_question ) {
		if ( ! $pro_question || ! is_a( $pro_question, 'WpProQuiz_Model_Question' ) ) {
			return array();
		}

		$answer_data = $pro_question->getAnswerData();

		if ( empty( $answer_data ) ) {
			return array();
		}

		$answers = array();

		foreach ( $answer_data as $index => $answer ) {
			if ( ! is_a( $answer, 'WpProQuiz_Model_AnswerTypes' ) ) {
				continue;
			}

			$answers[] = array(
				'index'       => $index,
				'answer'      => $answer->getAnswer(),
				'sort_string' => $answer->getSortString(), // Match target for matrix_sort_answer questions.
				'is_html'     => $answer->isHtml(),
				'points'      => $answer->getPoints(),
				'is_correct'  => $answer->isCorrect(),
			);
		}

		return array(
			'type'    => $pro_question->getAnswerType(),
			'options' => $answers,
		);
	}

	/**
	 * Get all post meta.
	 *
	 * @param int $post_id Post ID.
	 *
	 * @return array
	 */
	private function get_all_meta( $post_id ) {
		$meta       = get_post_meta( $post_id );
		$clean_meta = array();

		foreach ( $meta as $key => $values ) {
			if ( strpos( $key, '_edit_' ) === 0 || '_wp_old_slug' === $key ) {
				continue;
			}
			$clean_meta[ $key ] = count( $values ) === 1 ? lpie_safe_maybe_unserialize( $values[0] ) : array_map( 'lpie_safe_maybe_unserialize', $values );
		}

		return $clean_meta;
	}
}
