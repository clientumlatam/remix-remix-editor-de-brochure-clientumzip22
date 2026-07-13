<?php

namespace LPImportExport\Migration\Controllers;

use Exception;
use LearnPress\Models\CourseModel;
use LearnPress\Models\CoursePostModel;
use LearnPress\Models\UserItemMeta\UserQuizMetaModel;
use LearnPressAssignment\Models\UserAssignmentModel;
use LP_Background_Single_Course;
use LP_Datetime;
use LP_Question;
use LP_Quiz;
use LP_Quiz_CURD;
use LP_User_Items_Result_DB;
use LPImportExport\Migration\Helpers\MasterStudy;
use LPImportExport\Migration\Models\LPAssignmentModel;
use LPImportExport\Migration\Helpers\RestApi;
use LPImportExport\Migration\Models\LPQuestionAnswerModel;
use LPImportExport\Migration\Models\MasterStudyAssignmentModel;
use LPImportExport\Migration\Models\MasterStudyCourseItemModel;
use LPImportExport\Migration\Models\MasterStudyCourseModel;
use LPImportExport\Migration\Models\MasterStudyQuestionModel;
use LPImportExport\Migration\Models\MasterStudySectionModel;
use LPImportExport\Migration\Models\MasterStudyUserAnswerModel;
use MasterStudy\Lms\Enums\QuestionType;
use STM_LMS_Lesson;
use WP_Query;
use WP_REST_Server;
use LPImportExport\Migration\Helpers\General;
use LearnPress\Models\UserItems\UserItemModel;
use LP_User_Item_Quiz;

class MasterStudyMigrationController {

	public function __construct() {
		add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );
	}

	public function register_rest_routes() {
		register_rest_route(
			RestApi::generate_namespace(),
			'/migrate/master-study',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'permission_callback' => function () {
						return current_user_can( 'manage_options' );
					},
					'callback'            => array( $this, 'migrate' ),
				),
			)
		);

		register_rest_route(
			RestApi::generate_namespace(),
			'/delete-migrated-data/master-study',
			array(
				'methods'             => WP_REST_Server::DELETABLE,
				'permission_callback' => function () {
					return current_user_can( 'manage_options' );
				},
				'callback'            => array( $this, 'delete_migrated_data' ),
			),
		);
	}

	/**
	 * @param \WP_REST_Request $request
	 *
	 * @return \WP_REST_Response
	 */
	public function delete_migrated_data( \WP_REST_Request $request ) {
		$courses  = get_option( 'master_study_migrated_course', array() );
		$sections = get_option( 'master_study_migrated_section', array() );
		$lessons  = get_option( 'master_study_migrated_lesson', array() );

		$quizzes     = get_option( 'master_study_migrated_quiz', array() );
		$assignments = get_option( 'master_study_migrated_assignment', array() );
		$questions   = get_option( 'master_study_migrated_question', array() );

		global $wpdb;
		$wpdb->query( 'START TRANSACTION' );
		try {
			foreach ( $courses as $course ) {
				if ( $course['lp_course_id'] ) {
					wp_delete_post( $course['lp_course_id'], true );
				}
			}

			foreach ( $sections as $section ) {
				$section_curd = new \LP_Section_CURD( $section['lp_section_id'] );
				$section_curd->delete( $section['lp_section_id'] );
			}

			foreach ( $lessons as $lesson ) {
				if ( $lesson['lp_lesson_id'] ) {
					wp_delete_post( $lesson['lp_lesson_id'], true );
				}
			}

			foreach ( $quizzes as $quiz ) {
				if ( $quiz['lp_quiz_id'] ) {
					wp_delete_post( $quiz['lp_quiz_id'], true );
				}
			}

			foreach ( $assignments as $assignment ) {
				if ( $assignment['lp_assignment_id'] ) {
					wp_delete_post( $assignment['lp_assignment_id'], true );
				}
			}

			foreach ( $questions as $question ) {
				if ( $question['lp_question_id'] ) {
					wp_delete_post( $question['lp_question_id'], true );
				}
			}

			delete_option( 'master_study_migrate_user_id' );
			delete_option( 'master_study_migrate_time' );

			delete_option( 'master_study_migrated_course' );
			delete_option( 'master_study_migrated_section' );
			delete_option( 'master_study_migrated_lesson' );
			delete_option( 'master_study_migrated_quiz' );
			delete_option( 'master_study_migrated_assignment' );
			delete_option( 'master_study_migrated_question' );
			delete_option( 'master_study_migrated_process_course_data' );
			$wpdb->query( 'COMMIT' );
		} catch ( Exception $e ) {
			$wpdb->query( 'ROLLBACK' );

			return RestApi::error( esc_html__( 'Clear failed!', 'learnpress-import-export' ) );
		}

		$current_master_study_course_total = MasterStudyCourseModel::get_course_total();
		$data                              = array(
			'master_study_course_total' => $current_master_study_course_total,
		);

		return RestApi::success( esc_html__( 'Clear successfully!', 'learnpress-import-export' ), $data );
	}

	/**
	 * @return false|string
	 */
	public function get_migrate_success_html() {
		$migrated_course_total   = MasterStudy::migrated_course_total();
		$migrated_lesson_total   = MasterStudy::migrated_lesson_total();
		$migrated_quiz_total     = MasterStudy::migrated_quiz_total();
		$migrated_question_total = MasterStudy::migrated_question_total();

		ob_start();
		?>
		<div class="title">
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path fill-rule="evenodd" clip-rule="evenodd"
						d="M8 1.33333C4.3181 1.33333 1.33333 4.3181 1.33333 8C1.33333 11.6819 4.3181 14.6667 8 14.6667C11.6819 14.6667 14.6667 11.6819 14.6667 8C14.6667 4.3181 11.6819 1.33333 8 1.33333ZM0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8Z"
						fill="#34C759"/>
				<path
						d="M11.0685 5.4759L7.54764 9.62136L5.58892 7.66984C5.37262 7.45166 5.03615 7.4759 4.81985 7.66984C4.60355 7.88802 4.62758 8.22742 4.81985 8.4456L7.01891 10.6153C7.16311 10.7608 7.35538 10.8335 7.54764 10.8335C7.73991 10.8335 7.93218 10.7608 8.07638 10.6153L11.8376 6.2759C12.0539 6.05772 12.0539 5.71833 11.8376 5.50014C11.6213 5.28196 11.2848 5.28196 11.0685 5.4759Z"
						fill="#34C759"/>
			</svg>
			<div class="text">
				<span><?php esc_html_e( 'Migration Successful!', 'learnpress-import-export' ); ?></span>
				<p><?php esc_html_e( 'The migration from MasterStudy LMS to LearnPress is successfully done.', 'learnpress-import-export' ); ?></p>
			</div>
		</div>
		<ul>
			<li>
				<?php printf( esc_html__( 'Courses Migrated: %s', 'learnpress-import-export' ), $migrated_course_total ); ?>
			</li>
			<li>
				<?php printf( esc_html__( 'Lessons Migrated: %s', 'learnpress-import-export' ), $migrated_lesson_total ); ?>
			</li>
			<li>
				<?php printf( esc_html__( 'Quizzes Migrated: %s', 'learnpress-import-export' ), $migrated_quiz_total ); ?>
			</li>
			<li>
				<?php printf( esc_html__( 'Questions Migrated: %s', 'learnpress-import-export' ), $migrated_question_total ); ?>
			</li>
		</ul>
		<?php

		return ob_get_clean();
	}

	/**
	 * @param \WP_REST_Request $request
	 *
	 * @return \WP_REST_Response
	 */
	public function migrate( \WP_REST_Request $request ) {
		try {
			if ( ! current_user_can( 'manage_options' ) ) {
				throw new Exception( __( 'You are not allowed to migrate.', 'learnpress-import-export' ), 403 );
			}

			if ( empty( MasterStudyCourseModel::get_course_total() ) ) {
				throw new Exception( __( 'There are no master study courses.', 'learnpress-import-export' ), 404 );
			}

			$params         = $request->get_params();
			$migrate_item   = $params['item'] ?? 'course';
			$paged          = $params['paged'] ?? 1;
			$posts_per_page = $params['number'] ?? 10;

			if ( get_option( 'master_study_migrate_time' ) && $migrate_item === 'course' && $paged === 1 ) { // First migrate request
				throw new Exception( __( 'The courses have been migrated.', 'learnpress-import-export' ), 404 );
			}

			if ( empty( $migrate_item ) ) {
				throw new Exception( __( 'Course item is required.', 'learnpress-import-export' ), 400 );
			}

			//Course
			if ( $migrate_item === 'course' ) {
				return $this->migrate_course( $paged, $posts_per_page );
			} elseif ( $migrate_item === 'section' ) {
				return $this->migrate_section( $paged, $posts_per_page );
			} elseif ( $migrate_item === 'course_item' ) { //Migrate Lesson, quiz, assignment
				return $this->migrate_course_item( $paged, $posts_per_page );
			} elseif ( $migrate_item === 'question' ) {
				return $this->migrate_question( $paged, $posts_per_page );
			} elseif ( $migrate_item === 'course_process' ) {
				return $this->migrate_course_process( $paged, $posts_per_page );
			}
		} catch ( Exception $e ) {

			return RestApi::error( $e->getMessage(), $e->getCode() );
		}
	}

	/**
	 * @param $paged
	 * @param $posts_per_page
	 *
	 * @return \WP_REST_Response
	 * @throws Exception
	 */
	public function migrate_course( $paged, $posts_per_page ) {
		$lp_course_curd           = new \LP_Course_CURD();
		$master_study_course_args = array(
			'post_type'      => LP_ADDON_IMPORT_EXPORT_MASTER_STUDY_COURSE_CPT,
			'paged'          => $paged,
			'posts_per_page' => $posts_per_page,
			'post_status'    => 'any',
		);

		$query = new WP_Query( $master_study_course_args );

		if ( $query->have_posts() ) {
			while ( $query->have_posts() ) {
				$query->the_post();
				$master_study_course_id = get_the_ID();

				$lp_course_id = $this->get_migrated_lp_course( $master_study_course_id )['lp_course_id'] ?? '';

				$master_study_course_author_id = get_the_author_meta( 'ID' );

				$master_study_course_title   = get_the_title();
				$master_study_course_content = get_the_content();
				$master_study_course_status  = get_post_status();

				//Course complete status migration
				//Course enrolled

				//Create lp course
				if ( empty( $lp_course_id ) ) {
					$lp_course_args = array(
						'title'   => $master_study_course_title,
						'content' => $master_study_course_content,
						'status'  => $master_study_course_status,
						'author'  => $master_study_course_author_id,
					);

					$lp_course_id = $lp_course_curd->create( $lp_course_args );
					$this->add_migrated_course_item( $master_study_course_id, $lp_course_id );
				}

				//Course data
				$this->migrate_course_meta_data( $master_study_course_id, $lp_course_id );
			}

			if ( $paged === 1 ) {
				$this->update_migrate_option();
			}
		}
		$data = array();

		$data['max_page']              = $query->max_num_pages;
		$data['post_count']            = $query->post_count;
		$data['migrated_course_total'] = MasterStudy::migrated_course_total();

		if ( $query->post_count === $posts_per_page ) {
			$data['next_migrate_item'] = 'course';
			$data['next_page']         = $paged + 1;

			return RestApi::success( esc_html__( 'Migrated course!', 'learnpress-import-export' ), $data );
		}

		$data['next_migrate_item'] = 'section';
		$data['next_page']         = 1;

		return RestApi::success( esc_html__( 'All course migrated!', 'learnpress-import-export' ), $data );
	}

	/**
	 * @param $paged
	 * @param $posts_per_page
	 *
	 * @return \WP_REST_Response
	 */
	public function migrate_section( $paged, $posts_per_page ) {
		$master_study_section_total = MasterStudySectionModel::get_section_total();
		$master_study_sections      = MasterStudySectionModel::get_sections( $posts_per_page, $paged );

		if ( ! empty( $master_study_sections ) ) {
			foreach ( $master_study_sections as $master_study_section ) {
				$master_study_section_id = $master_study_section->id;
				$lp_section_id           = $this->get_migrated_lp_section( $master_study_section_id )['lp_section_id'] ?? '';
				$master_study_course_id  = $master_study_section->course_id;
				$master_study_course_id  = intval( $master_study_course_id );
				$lp_course_id            = $this->get_migrated_lp_course( $master_study_course_id )['lp_course_id'] ?? '';

				if ( empty( $lp_course_id ) ) {
					continue;
				}

				$section_curd = new \LP_Section_CURD( $lp_course_id );
				//Add lp section

				if ( empty( $lp_section_id ) ) {
					$lp_section_args = array(
						'section_course_id'   => $lp_course_id,
						'section_name'        => $master_study_section->title,
						'section_order'       => intval( $master_study_section->order ),
						'section_description' => '',
					);

					$section       = $section_curd->create( $lp_section_args );
					$lp_section_id = $section['section_id'];

					$this->add_migrated_section_item( $master_study_section_id, $lp_section_id, intval( $lp_course_id ) );
				}
			}
		}

		$data['max_page']               = ceil( $master_study_section_total / $posts_per_page );
		$data['post_count']             = count( $master_study_sections );
		$data['migrated_section_total'] = MasterStudy::migrated_section_total();

		if ( $data['post_count'] === $posts_per_page ) {
			$data['next_migrate_item'] = 'section';
			$data['next_page']         = $paged + 1;

			return RestApi::success( esc_html__( 'Migrated section!', 'learnpress-import-export' ), $data );
		}

		$data['next_migrate_item'] = 'course_item';
		$data['next_page']         = 1;

		return RestApi::success( esc_html__( 'All section migrated!', 'learnpress-import-export' ), $data );
	}

	/**
	 * @param $paged
	 * @param $posts_per_page
	 *
	 * @return \WP_REST_Response
	 * @throws Exception
	 */
	public function migrate_course_item( $paged, $posts_per_page ) {
		//Get master study lesson or quiz
		$master_study_course_items = MasterStudyCourseItemModel::get_course_item( $posts_per_page, $paged );

		if ( ! empty( $master_study_course_items ) ) {
			foreach ( $master_study_course_items as $master_study_course_item ) {
				$master_study_item_id        = $master_study_course_item->post_id;
				$master_study_item_post_type = $master_study_course_item->post_type;
				$master_study_section_id     = $master_study_course_item->section_id;

				$master_study_section_id = intval( $master_study_section_id );
				$migrated_section        = $this->get_migrated_lp_section( $master_study_section_id );

				$lp_section_id = $migrated_section['lp_section_id'] ?? '';
				$lp_course_id  = $migrated_section['lp_course_id'] ?? '';

				if ( empty( $lp_section_id ) || empty( $lp_course_id ) ) {
					continue;
				}

				$section_curd = new \LP_Section_CURD( $lp_course_id );

				if ( $master_study_item_post_type === LP_ADDON_IMPORT_EXPORT_MASTER_STUDY_LESSON_CPT ) {
					$migrate_item_type   = 'lesson';
					$migrated_item_total = $this->get_migrated_lp_lesson_total( $master_study_item_id );
				} elseif ( $master_study_item_post_type === LP_ADDON_IMPORT_EXPORT_MASTER_STUDY_QUIZ_CPT ) {
					$migrate_item_type   = 'quiz';
					$migrated_item_total = $this->get_migrated_lp_quiz_total( $master_study_item_id );
				} else {
					$migrate_item_type   = 'assignment';
					$migrated_item_total = $this->get_migrated_lp_assignment_total( $master_study_item_id );
				}

				$master_study_item_obj = get_post( $master_study_item_id );
				$new_item_id           = null;

				if ( $migrated_item_total < MasterStudyCourseItemModel::get_course_item_total( $master_study_item_id ) ) {
					//Add lesson or quiz
					$lp_item_args = array(
						'title'   => $master_study_item_obj->post_title,
						'content' => apply_filters( 'the_content', $master_study_item_obj->post_content ),
						'status'  => $master_study_item_obj->post_status,
					);

					if ( in_array(
						$master_study_item_post_type,
						array(
							LP_ADDON_IMPORT_EXPORT_MASTER_STUDY_LESSON_CPT,
							LP_ADDON_IMPORT_EXPORT_MASTER_STUDY_QUIZ_CPT,
						)
					) ) {
						$lp_item_args['type'] = $master_study_item_post_type === LP_ADDON_IMPORT_EXPORT_MASTER_STUDY_LESSON_CPT ? LP_LESSON_CPT : LP_QUIZ_CPT;
						$new_items            = $section_curd->new_item(
							$lp_section_id,
							$lp_item_args
						);

						$new_item    = end( $new_items );
						$new_item_id = $new_item['id'] ?? '';

					} elseif ( $master_study_item_post_type === LP_ADDON_IMPORT_EXPORT_MASTER_STUDY_ASSIGNMENT_CPT ) {
						$new_item_id = LPAssignmentModel::create( $lp_item_args );
						$items       = array(
							array(
								'type' => 'lp_assignment',
								'id'   => $new_item_id,
							),
						);

						$section_curd->add_items_section( $lp_section_id, $items );
					}

					if ( $migrate_item_type === 'lesson' ) {
						$this->add_migrated_lesson_item( $master_study_item_id, $new_item_id, $lp_course_id, $lp_section_id );
					} elseif ( $migrate_item_type === 'quiz' ) {
						$this->add_migrated_quiz_item( $master_study_item_id, $new_item_id, $lp_course_id, $lp_section_id );
					} else {
						$this->add_migrated_assignment_item( $master_study_item_id, $new_item_id, $lp_course_id, $lp_section_id );
					}
				}

				//Lesson or quiz meta data
				$lp_course_item_meta = array();

				if ( $master_study_item_post_type === LP_ADDON_IMPORT_EXPORT_MASTER_STUDY_LESSON_CPT ) {
					//Preview
					$master_study_lesson_preview = get_post_meta( $master_study_item_id, 'preview', true );
					if ( ! empty( $master_study_lesson_preview ) && $master_study_lesson_preview === 'on' ) {
						$lp_course_item_meta['preview'] = 'yes';
					}
				} elseif ( $master_study_item_post_type === LP_ADDON_IMPORT_EXPORT_MASTER_STUDY_QUIZ_CPT ) {
					//Duration
					$lp_duration = '10 minute'; // default

					$master_study_quiz_duration      = get_post_meta( $master_study_item_id, 'duration', true );
					$master_study_quiz_duration_unit = get_post_meta( $master_study_item_id, 'duration_measure', true );
					if ( ! empty( $master_study_quiz_duration ) ) {
						$lp_duration = $master_study_quiz_duration . ' ' . rtrim( $master_study_quiz_duration_unit, 's' );
					}
					$lp_course_item_meta['duration'] = $lp_duration;

					//Passing grade
					$master_study_passing_grade           = get_post_meta( $master_study_item_id, 'passing_grade', true );
					$lp_course_item_meta['passing_grade'] = $master_study_passing_grade;

					//Retake count
					$master_study_quiz_attempts = get_post_meta( $master_study_item_id, 'quiz_attempts', true );
					$master_study_attempts      = get_post_meta( $master_study_item_id, 'attempts', true );
					if ( ! empty( $master_study_quiz_attempts ) && ! empty( $master_study_attempts ) ) {
						$lp_course_item_meta['retake_count'] = $master_study_attempts;
					} else {
						$lp_course_item_meta['retake_count'] = -1;
					}
				} elseif ( $master_study_item_post_type === LP_ADDON_IMPORT_EXPORT_MASTER_STUDY_ASSIGNMENT_CPT ) {  // assignment
					//Attachments
					$master_study_assignment_attachments = get_post_meta( $master_study_item_id, 'assignment_files', true );
					$lp_course_item_meta['attachments']  = json_decode( $master_study_assignment_attachments, true );

					//Duration
					$master_study_assignment_duration_value = get_post_meta( $master_study_item_id, 'time_limit', true );
					$master_study_assignment_duration_time  = get_post_meta( $master_study_item_id, 'time_limit_unit', true );

					$master_study_assignment_duration_value = trim( $master_study_assignment_duration_value );
					$master_study_assignment_duration_time  = trim( $master_study_assignment_duration_time );

					$lp_course_item_meta['duration'] = $master_study_assignment_duration_value . ' ' . rtrim( $master_study_assignment_duration_time, 's' );

					//Passing grade
					$master_study_passing_grade           = get_post_meta( $master_study_item_id, 'passing_grade', true );
					$lp_course_item_meta['passing_grade'] = $master_study_passing_grade;

					//Attempts
					$master_study_assignment_attempts = get_post_meta( $master_study_item_id, 'assignment_tries', true );
					if ( ! empty( $master_study_assignment_attempts ) ) {
						$lp_course_item_meta['retake_count'] = $master_study_assignment_attempts;
					} else {
						$lp_course_item_meta['retake_count'] = -1;
					}
				}

				//Section item meta data
				if ( $new_item_id && count( $lp_course_item_meta ) ) {
					foreach ( $lp_course_item_meta as $key => $value ) {
						update_post_meta( $new_item_id, '_lp_' . $key, $value );
					}
				}
			}
		}

		$post_count                     = is_array( $master_study_course_items ) ? count( $master_study_course_items ) : 0;
		$master_study_course_item_total = MasterStudyCourseItemModel::get_course_item_total();

		$data['max_page']                   = ceil( $master_study_course_item_total / $posts_per_page );
		$data['post_count']                 = $post_count;
		$data['migrated_course_item_total'] = MasterStudy::migrated_course_item_total();

		if ( $post_count === $posts_per_page ) {
			$data['next_migrate_item'] = 'course_item';
			$data['next_page']         = $paged + 1;

			return RestApi::success( esc_html__( 'Migrated course item!', 'learnpress-import-export' ), $data );
		}

		$data['next_migrate_item'] = 'question';
		$data['next_page']         = 1;

		return RestApi::success( esc_html__( 'All course item migrated!', 'learnpress-import-export' ), $data );
	}

	/**
	 * @param $paged
	 * @param $posts_per_page
	 *
	 * @return \WP_REST_Response
	 */
	public function migrate_question( $paged, $posts_per_page ) {
		global $wpdb;
		$question_curd          = new \LP_Question_CURD();
		$offset                 = ( $paged - 1 ) * $posts_per_page;
		$limit                  = $posts_per_page;
		$master_study_questions = MasterStudyQuestionModel::get_questions( $offset, $limit );

		if ( count( $master_study_questions ) ) {
			foreach ( $master_study_questions as $master_study_question ) {
				$master_study_question_id    = $master_study_question->ID;
				$master_study_question_title = $master_study_question->post_title;
				$master_study_question_des   = '';
				$master_study_question_type  = get_post_meta( $master_study_question_id, 'type', true );

				if ( $master_study_question_type === QuestionType::SINGLE_CHOICE ) {
					$lp_question_type = 'single_choice';
				} elseif ( $master_study_question_type === QuestionType::MULTI_CHOICE ) {
					$lp_question_type = 'multi_choice';
				} elseif ( $master_study_question_type === QuestionType::TRUE_FALSE ) {
					$lp_question_type = 'true_or_false';
				} elseif ( $master_study_question_type === QuestionType::FILL_THE_GAP ) {
					$lp_question_type = 'fill_in_blanks';
				} else {
					$lp_question_type = '';
				}

				$lp_question_args = array(
					'id'             => '',
					'status'         => 'publish',
					'type'           => $lp_question_type,
					'title'          => strip_tags( html_entity_decode( $master_study_question_title ) ),
					'content'        => $master_study_question_des,
					'create_answers' => false,
				);

				$lp_question    = $question_curd->create( $lp_question_args );
				$lp_question_id = $lp_question->get_id();

				$master_study_quizzes = get_posts(
					[
						'post_type'      => LP_ADDON_IMPORT_EXPORT_MASTER_STUDY_QUIZ_CPT,
						'posts_per_page' => -1,
						'meta_query'     => [
							[
								'key'     => 'questions',
								'value'   => $master_study_question_id,
								'compare' => 'LIKE',
							],
						],
					]
				);

				if ( ! empty( $master_study_quizzes ) && count( $master_study_quizzes ) > 0 ) {
					foreach ( $master_study_quizzes as $master_study_quiz ) {
						//Create question tương ứng với số lượng quiz có chứa question
						if ( $lp_question_id ) {
							// add default meta for new lesson
							$default_meta = LP_Question::get_default_meta();

							if ( is_array( $default_meta ) ) {
								foreach ( $default_meta as $key => $value ) {
									update_post_meta( $lp_question_id, '_lp_' . $key, $value );
								}
							}

							if ( ! empty( $lp_question_type ) ) {
								update_post_meta( $lp_question_id, '_lp_type', $lp_question_type );
								$question = LP_Question::get_question( $lp_question_id, array( 'type' => $lp_question_type ) );
								$question->set_type( $lp_question_type );
							}
						}

						$master_study_quiz_id = $master_study_quiz->ID;
						//Get question ids of quiz
						$question_ids = explode( ',', get_post_meta( $master_study_quiz_id, 'questions', true ) );

						$master_study_question_order = array_search( $master_study_question_id, $question_ids );
						if ( $master_study_question_order !== false ) {
							$master_study_question_order = $master_study_question_order + 1;
						} else {
							$master_study_question_order = 1;
						}

						$lp_question_order   = $master_study_question_order;
						$migrated_lp_quizzes = $this->get_migrated_lp_quiz( $master_study_quiz_id );

						foreach ( $migrated_lp_quizzes as $migrated_lp_quiz ) {
							$lp_quiz_id    = $migrated_lp_quiz['lp_quiz_id'] ?? '';
							$lp_course_id  = $migrated_lp_quiz['lp_course_id'] ?? '';
							$lp_section_id = $migrated_lp_quiz['lp_section_id'] ?? '';

							if ( empty( $lp_quiz_id ) || empty( $lp_course_id ) || empty( $lp_section_id ) ) {
								continue;
							}

							if ( $lp_question_id ) {
								// add question to quiz
								$quiz_curd = new LP_Quiz_CURD();
								$quiz_curd->add_question(
									$lp_quiz_id,
									$lp_question_id,
									array(
										'order' => $lp_question_order,
									)
								);
							}

							$this->add_migrated_question_item(
								$master_study_question_id,
								$lp_question_id,
								$lp_course_id,
								$lp_section_id,
								$lp_quiz_id
							);
						}

						//Question meta

						//Question answer
						$master_study_question_answers = get_post_meta( $master_study_question_id, 'answers', true );
						$lp_question_ans_order         = 1;
						$lp_question_answer_meta_data  = array();

						foreach ( $master_study_question_answers as $master_study_question_answer ) {
							$title   = strip_tags( $master_study_question_answer['text'] );
							$is_true = $master_study_question_answer['isTrue'];
							if ( ! empty( $is_true ) ) {
								$is_true = 'yes';
							}

							$value = learn_press_random_value();
							if ( $master_study_question_type === QuestionType::FILL_THE_GAP ) {
								$parts  = explode( '|', $title );
								$result = '';
								foreach ( $parts as $index => $part ) {
									if ( $index % 2 == 0 ) {
										$result .= $part;
									} else {
										$fill_value = trim( $part );
										$unique_id  = General::get_unique_id( 12 );

										$result .= '[fib fill="' . $fill_value . '" id="' . $unique_id . '"]';

										$lp_question_answer_meta_data[ $unique_id ] = array(
											'fill'       => $fill_value,
											'id'         => $unique_id,
											'comparison' => '',
											'match_case' => 0,
											'index'      => ( $index + 1 ) / 2,
											'open'       => '',
										);
									}
								}

								$title   = $result;
								$is_true = '';
							}

							if ( empty( $title ) ) {
								continue;
							}

							$lp_question_ans_data = array(
								'question_id' => $lp_question_id,
								'title'       => $title,
								'value'       => $value,
								'is_true'     => $is_true,
								'order'       => $lp_question_ans_order,
							);

							$wpdb->insert(
								$wpdb->learnpress_question_answers,
								$lp_question_ans_data,
								array( '%d', '%s', '%s', '%s', '%d' )
							);

							$lp_question_answer_id = $wpdb->insert_id;
							$this->add_migrated_question_answer_item(
								$master_study_question_id,
								$master_study_quiz_id,
								$title,
								$lp_question_answer_id
							);

							if ( $master_study_question_type === QuestionType::FILL_THE_GAP ) {
								learn_press_update_question_answer_meta( $lp_question_answer_id, '_blanks', $lp_question_answer_meta_data );
							}

							$lp_question_ans_order = $lp_question_ans_order + 1;
						}
					}
				} else {
					$this->add_migrated_question_item(
						$master_study_question_id,
						$lp_question_id,
						0,
						0,
						0
					);
				}
			}
		}

		$post_count              = is_array( $master_study_questions ) ? count( $master_study_questions ) : 0;
		$migrated_question_total = MasterStudy::migrated_question_total();
		$total_question          = MasterStudyQuestionModel::get_question_total();

		$data['max_page']                = ceil( $total_question / $posts_per_page );
		$data['post_count']              = $post_count;
		$data['migrated_question_total'] = $migrated_question_total;

		if ( $post_count === $posts_per_page ) {
			$data['next_migrate_item'] = 'question';
			$data['next_page']         = $paged + 1;

			return RestApi::success( esc_html__( 'Migrated question!', 'learnpress-import-export' ), $data );
		}

		$migrated_course = MasterStudy::migrated_course();
		foreach ( $migrated_course as $value ) {
			$lp_course_id = $value ['lp_course_id'];
			$bg           = LP_Background_Single_Course::instance();
			$bg->data(
				array(
					'handle_name' => 'save_post',
					'course_id'   => $lp_course_id,
					'data'        => [],
				)
			)->dispatch();
		}

		$data['next_migrate_item'] = 'course_process';
		$data['next_page']         = 1;

		return RestApi::success( esc_html__( 'Migrated all question!', 'learnpress-import-export' ), $data );
	}

	/**
	 * @param $paged
	 * @param $posts_per_page
	 * @return \WP_REST_Response
	 * @throws Exception
	 */
	public function migrate_course_process( $paged, $posts_per_page ) {
		$master_study_migrated_process_course_data = get_option( 'master_study_migrated_process_course_data', array() );

		//Course enrolled
		$master_study_process_courses = MasterStudyCourseModel::get_process_course_item( $posts_per_page, $paged );

		if ( $master_study_process_courses ) {
			foreach ( $master_study_process_courses as $master_study_process_course ) {
				$master_study_course_id         = $master_study_process_course->course_id;
				$master_study_course_start_time = $master_study_process_course->start_time;

				$lp_course_id = $this->get_migrated_lp_course( $master_study_course_id )['lp_course_id'];

				if ( empty( $lp_course_id ) ) { // If not migrate course => ignore
					continue;
				}

				$master_study_student_id = $master_study_process_course->user_id;  // also is lp_course_student id

				$lp_student = learn_press_get_user( $master_study_student_id );
				//              $master_study_instructor_id = $lp_instructor_id = get_post_field( 'post_author', $master_study_course_id );

				//Enrolled course
				$user_course_item_data = array(
					'user_id'    => $master_study_student_id,
					'item_id'    => $lp_course_id,
					'start_time' => gmdate( LP_Datetime::$format, $master_study_course_start_time ),
					'item_type'  => LP_COURSE_CPT,
					'status'     => LP_COURSE_ENROLLED,
					'graduation' => LP_COURSE_GRADUATION_IN_PROGRESS,
					'ref_id'     => 0,
					'ref_type'   => 'lp_order',
					'parent_id'  => 0,
				);

				$course_item_exist = UserItemModel::find_user_item(
					$master_study_student_id,
					$lp_course_id,
					LP_COURSE_CPT,
					$ref_id        = 0,
					$ref_type      = 'lp_order',
					false
				);

				if ( $course_item_exist ) {
					$user_course_item_data['user_item_id'] = $course_item_exist->get_user_item_id();
				}

				$user_course_item = new UserItemModel( $user_course_item_data );
				$user_course_item->save();

				$user_course_item_id = $user_course_item->get_user_item_id();
				//Lesson
				$migrated_lessons = $this->get_lessons_by_lp_course_parent_id( $lp_course_id );

				foreach ( $migrated_lessons as $migrated_lesson ) {
					$master_study_lesson_id           = $migrated_lesson['master_study_lesson_id'];
					$lp_lesson_id                     = $migrated_lesson['lp_lesson_id'];
					$master_study_is_completed_lesson = STM_LMS_Lesson::is_lesson_completed( $master_study_student_id, $master_study_course_id, $master_study_lesson_id );
					$lesson_already_completed         = stm_lms_get_user_lesson( $master_study_student_id, $master_study_course_id, $master_study_lesson_id, array( 'lesson_id' ) );

					if ( $master_study_is_completed_lesson ) {
						$user_lesson_item_data = array(
							'user_id'    => $master_study_student_id,
							'item_id'    => $lp_lesson_id,
							'start_time' => gmdate( LP_Datetime::$format, get_the_time( 'U', $lesson_already_completed['start_time'] ) ),
							'end_time'   => gmdate( LP_Datetime::$format, $lesson_already_completed['end_time'] ),
							'item_type'  => LP_LESSON_CPT,
							'status'     => LP_ITEM_COMPLETED,
							'graduation' => 'passed',
							'ref_id'     => $lp_course_id,
							'ref_type'   => LP_COURSE_CPT,
							'parent_id'  => $user_course_item_id,
						);

						$user_lesson_item = new UserItemModel( $user_lesson_item_data );
						$user_lesson_item->save();
					}
				}

				//Quiz
				$migrated_quizzes = $this->get_quizzes_by_lp_course_parent_id( $lp_course_id );

				foreach ( $migrated_quizzes as $migrated_quiz ) {
					$master_study_quiz_id = $migrated_quiz['master_study_quiz_id'];
					$lp_quiz_id           = $migrated_quiz['lp_quiz_id'];
					$lp_quiz              = LP_Quiz::get_quiz( $lp_quiz_id );
					$lp_question_ids      = $lp_quiz->get_question_ids();

					//Quiz Attempt
					$master_study_quiz_attempts = stm_lms_get_user_all_course_quizzes( $master_study_student_id, $master_study_course_id, $master_study_quiz_id, array(), false );

					$master_study_quiz_attempt_count = count( $master_study_quiz_attempts );

					//                  $quiz_data   = ( new CoursePlayerRepository() )->get_quiz_data( $master_study_quiz_id, $master_study_student_id );
					//                  $master_study_quiz_attempts      = $quiz_data['attempts_left'] ?? 0;

					if ( $master_study_quiz_attempt_count ) {
						$user_quiz_item_data = array(
							'user_id'    => $master_study_student_id,
							'item_id'    => $lp_quiz_id,
							'start_time' => null,
							'end_time'   => null,
							'item_type'  => LP_QUIZ_CPT,
							'status'     => LP_ITEM_STARTED,
							'graduation' => LP_GRADUATION_IN_PROGRESS,
							'ref_id'     => $lp_course_id,
							'ref_type'   => LP_COURSE_CPT,
							'parent_id'  => $user_course_item_id,
						);

						$user_quiz_item = new UserItemModel( $user_quiz_item_data );
						$user_quiz_item->save();

						$user_quiz_item_id = $user_quiz_item->get_user_item_id();

						foreach ( $master_study_quiz_attempts as $master_study_quiz_attempt ) {
							$master_study_quiz_is_start = $master_study_quiz_attempt->progress !== 100;
							//                          $master_study_quiz_is_end = $master_study_quiz_attempt->attempt_status === 100;
							//                          $master_study_quiz_attempt_id = $master_study_quiz_attempt->attempt_id;
							$master_study_quiz_start_time = $master_study_quiz_attempt->created_at ?? null;
							$master_study_quiz_end_time   = null;

							$user_quiz_item->status     = $master_study_quiz_is_start ? LP_ITEM_STARTED : LP_ITEM_COMPLETED;
							$user_quiz_item->start_time = $master_study_quiz_start_time;
							$user_quiz_item->end_time   = $master_study_quiz_end_time;

							$master_study_quiz_attempt_answers = MasterStudyUserAnswerModel::get_quiz_answers( $master_study_course_id, $master_study_quiz_id );
							$lp_answered                       = array();

							foreach ( $master_study_quiz_attempt_answers as $master_study_quiz_attempt_answer ) {
								$master_study_question_id = $master_study_quiz_attempt_answer->question_id;
								$master_study_quiz_id     = $master_study_quiz_attempt_answer->quiz_id;
								$lp_question_id           = $this->get_migrated_lp_question( $master_study_question_id )['lp_question_id'];

								$master_study_user_answer  = lpie_safe_maybe_unserialize( $master_study_quiz_attempt_answer->user_answer );
								// Canonical variable used throughout the answer-mapping block below.
								$master_study_given_answer = $master_study_user_answer;

								$master_study_question_type = get_post_meta( $master_study_question_id, 'type', true );

								if ( $master_study_question_type === QuestionType::SINGLE_CHOICE ) {
									$lp_answer_id = $this->get_migrated_lp_question_answer( $master_study_question_id, $master_study_quiz_id, $master_study_user_answer )['lp_question_answer_id'];
									$lp_answer    = LPQuestionAnswerModel::get_answer_by_answer_id( $lp_answer_id, true );
									if ( $lp_answer ) {
										$lp_answered[ $lp_question_id ] = $lp_answer->value;
									}
								} elseif ( $master_study_question_type === QuestionType::MULTI_CHOICE ) {
									if ( ! empty( $master_study_user_answer ) ) {
										if ( is_string( $master_study_user_answer ) ) {
											$master_study_given_answer = explode( ',', $master_study_user_answer );
										}

										$lp_multi_choice_answered = array();
										foreach ( $master_study_given_answer as $master_study_answer_item ) {
											$lp_answer_id = $this->get_migrated_lp_question_answer( $master_study_question_id, $master_study_quiz_id, $master_study_answer_item )['lp_question_answer_id'];
											$lp_answer    = LPQuestionAnswerModel::get_answer_by_answer_id( $lp_answer_id, true );
											if ( $lp_answer ) {
												$lp_multi_choice_answered[] = $lp_answer->value;
											}
										}
										$lp_answered[ $lp_question_id ] = $lp_multi_choice_answered;
									}
								} elseif ( $master_study_question_type === QuestionType::TRUE_FALSE ) {
									$lp_answer_id = $this->get_migrated_lp_question_answer( $master_study_question_id, $master_study_quiz_id, $master_study_user_answer )['lp_question_answer_id'];
									$lp_answer    = LPQuestionAnswerModel::get_answer_by_answer_id( $lp_answer_id, true );

									if ( $lp_answer ) {
										$lp_answered[ $lp_question_id ] = $lp_answer->value;
									}
								} elseif ( $master_study_question_type === QuestionType::FILL_THE_GAP ) {

									if ( ! empty( $master_study_user_answer ) ) {
										if ( is_string( $master_study_user_answer ) ) {
											$master_study_given_answer = explode( ',', $master_study_user_answer );
										}

										$lp_fill_in_blank_answered = array();

										foreach ( $master_study_given_answer as $key => $master_study_answer_value ) {
											$lp_answer = LPQuestionAnswerModel::get_answer_by_question_id( $lp_question_id, true );
											if ( $lp_answer ) {
												$lp_answer_id   = $lp_answer->question_answer_id;
												$lp_answer_meta = LPQuestionAnswerModel::get_question_answer_meta( $lp_answer_id, '_blanks', true );

												if ( $lp_answer_meta ) {
													$lp_answer_meta = lpie_safe_maybe_unserialize( $lp_answer_meta );
													if ( ! is_object( $lp_answer_meta ) || ! isset( $lp_answer_meta->meta_value ) ) {
														continue;
													}
													preg_match_all( '/id="([a-f0-9]+)"/', $lp_answer_meta->meta_value, $matches );
													$lp_answer_ids = $matches[1] ?? array();
													$lp_answer_id  = $lp_answer_ids[ $key ] ?? '';
													if ( empty( $lp_answer_id ) ) {
														continue;
													}
													$lp_fill_in_blank_answered[ $lp_answer_id ] = $master_study_answer_value;
												}
											}
										}
										$lp_answered[ $lp_question_id ] = $lp_fill_in_blank_answered;
									}
								} else {
									continue;
								}
							}

							$lp_user_quiz = new LP_User_Item_Quiz( $lp_quiz_id );
							$lp_user_quiz->set_start_time( $master_study_quiz_start_time );
							$lp_user_quiz->set_end_time( $master_study_quiz_end_time );
							$result = $lp_user_quiz->calculate_quiz_result( $lp_answered );

							LP_User_Items_Result_DB::instance()->insert( $user_quiz_item_id, wp_json_encode( $result ) );
							$user_quiz_item->graduation = empty( $result['pass'] ) ? 'failed' : 'passed';

							$user_quiz_item->save();
						}

						//Retake quiz
						if ( $master_study_quiz_attempt_count > 1 ) {
							$user_quiz_retaken_new                          = new UserQuizMetaModel();
							$user_quiz_retaken_new->learnpress_user_item_id = $user_quiz_item_id;
							$user_quiz_retaken_new->meta_key                = UserQuizMetaModel::KEY_RETAKEN_COUNT;
							$user_quiz_retaken_new->meta_value              = $master_study_quiz_attempt_count - 1;
							$user_quiz_retaken_new->save();
						}
					}
				}

				//Assignment
				if ( is_plugin_active( 'learnpress-assignments/learnpress-assignments.php' ) ) {
					$migrated_assignments = $this->get_assignments_by_lp_course_parent_id( $lp_course_id );
					foreach ( $migrated_assignments as $migrated_assignment ) {
						$lp_assignment_id = $migrated_assignment['lp_assignment_id'];

						$master_study_assignment = MasterStudyAssignmentModel::get_assignment( $master_study_course_id, $master_study_student_id );

						if ( $master_study_assignment ) {
							$user_assign_item_data = array(
								'user_id'    => $master_study_student_id,
								'item_id'    => $lp_assignment_id,
								'start_time' => '',
								'end_time'   => '',
								'item_type'  => 'lp_assignment',
								'status'     => 'started',
								'graduation' => null,
								'ref_id'     => $lp_course_id,
								'ref_type'   => LP_COURSE_CPT,
								'parent_id'  => $user_course_item_id,
							);

							$master_study_is_completed_assignment = in_array( $master_study_assignment->status, array( 'not_passed', 'passed' ) );
							if ( $master_study_is_completed_assignment ) {
								$user_assign_item_data['end_time'] = '';
								$user_assign_item_data['status']   = 'completed';
							}

							$user_assign_item = new UserItemModel( $user_assign_item_data );
							$user_assign_item->save();

							$userAssignmentModel             = UserAssignmentModel::find( $user_assign_item->user_id, $lp_course_id, $user_assign_item->item_id, true );
							$master_study_user_assignment_id = $master_study_assignment->user_assignment_id;
							$master_study_user_assignment    = get_post( $master_study_user_assignment_id );
							//Note
							$master_study_assign_content = apply_filters( 'post_content', get_the_content( $master_study_user_assignment->post_content ) );

							$userAssignmentModel->set_meta_value_for_key( $userAssignmentModel::META_KEY_ANSWER_NOTE, $master_study_assign_content, true );
							//Attachments
							$master_study_assign_attachments = get_post_meta( $master_study_user_assignment_id, 'instructor_attachments', true );

							$lp_assign_attachments = array();
							if ( ! empty( $master_study_assign_attachments ) && is_array( $master_study_assign_attachments ) ) {
								foreach ( $master_study_assign_attachments as $master_study_assign_attachment ) {
									$file_uploaded = [
										'filename'   => $master_study_assign_attachment->name,
										'file'       => str_replace( ABSPATH, '', $master_study_assign_attachment->url ),
										'url'        => str_replace( get_site_url(), '', $master_study_assign_attachment->url ),
										'type'       => $master_study_assign_attachment->type,
										'size'       => filesize( $master_study_assign_attachment->url ),
										'saved_time' => '',
									];
									$lp_assign_attachments[ md5( $file_uploaded['file'] ) ] = $file_uploaded;
								}
							}

							$userAssignmentModel->set_meta_value_for_key( $userAssignmentModel::META_KEY_ANSWER_UPLOAD, $lp_assign_attachments, true );
						}
					}
				}

				//Finish course
				$master_study_is_completed_course = $master_study_process_course->progress_percent === 100;

				if ( $master_study_is_completed_course ) {
					$lp_student->finish_course( $lp_course_id );
					$user_course = $lp_student->get_course_data( $lp_course_id );
					$user_course->set_end_time( gmdate( LP_Datetime::$format, strtotime( $master_study_process_course->end_time ?? '' ) ) );
				}

				$master_study_migrated_process_course_data[] = array(
					'lp_course_id'           => $lp_course_id,
					'master_study_course_id' => $master_study_course_id,
					'user_id'                => $master_study_student_id,
				);
			}

			update_option( 'master_study_migrated_process_course_data', $master_study_migrated_process_course_data );
		}

		$data                              = array();
		$master_study_course_process_total = MasterStudyCourseModel::get_process_course_total();
		$data['max_page']                  = ceil( $master_study_course_process_total / $posts_per_page );

		$data['post_count']                    = count( $master_study_process_courses );
		$data['migrated_course_process_total'] = count( get_option( 'master_study_migrated_process_course_data', array() ) );

		if ( $data['post_count'] === $posts_per_page ) {
			$data['next_migrate_item'] = 'section';
			$data['next_page']         = $paged + 1;

			return RestApi::success( esc_html__( 'Migrated course process!', 'learnpress-import-export' ), $data );
		}

		$data['migrate_success_html'] = $this->get_migrate_success_html();
		$data['next_migrate_item']    = false;
		$data['next_page']            = 1;

		return RestApi::success( esc_html__( 'All data migrated successfully.', 'learnpress-import-export' ), $data );
	}

	/**
	 * @param $master_study_course_id
	 * @param $lp_course_id
	 *
	 * @return void
	 * @throws Exception
	 */
	public function migrate_course_meta_data( $master_study_course_id, $lp_course_id ) {
		//Price
		$master_study_course_price      = get_post_meta( $master_study_course_id, 'price', true );
		$master_study_course_sale_price = get_post_meta( $master_study_course_id, 'sale_price', true );

		//Update
		if ( $master_study_course_price ) {
			update_post_meta( $lp_course_id, '_lp_regular_price', $master_study_course_price );
		}

		if ( $master_study_course_sale_price ) {
			update_post_meta( $lp_course_id, '_lp_sale_price', $master_study_course_sale_price );
		}

		//Thumbnail
		$course_thumbnail = get_post_meta( $master_study_course_id, '_thumbnail_id', true );
		if ( ! empty( $course_thumbnail ) ) {
			update_post_meta( $lp_course_id, '_thumbnail_id', $course_thumbnail );
		}

		//Duration
		$master_study_course_duration = get_post_meta( $master_study_course_id, 'duration_info', true );
		if ( ! empty( $master_study_course_duration ) ) {
			update_post_meta( $lp_course_id, '_lp_duration', $this->get_lp_duration( $master_study_course_duration ) );
		}

		//Level
		$master_study_course_level = get_post_meta( $master_study_course_id, 'level', true );

		if ( $master_study_course_level ) {
			if ( $master_study_course_level === 'advanced' ) {
				$lp_level = 'expert';
			} else {
				$lp_level = '';
			}

			update_post_meta( $lp_course_id, '_lp_level', $lp_level );
		}

		$coursePostModel = new CoursePostModel( get_post( $lp_course_id ) );
		$courseModelNew  = new CourseModel( $coursePostModel );
		$courseModelNew->save();
	}

	/**
	 * @param $master_study_course_duration
	 * @return int|string
	 */
	public function get_lp_duration( $master_study_course_duration ) {
		$master_study_course_duration = trim( strtolower( $master_study_course_duration ) );
		$parts                        = explode( ' ', $master_study_course_duration );

		if ( count( $parts ) != 2 ) {
			return 0;
		}

		$value = (int) $parts[0];
		$unit  = $parts[1];

		$valid_units = [
			'week'    => 'week',
			'weeks'   => 'week',
			'day'     => 'day',
			'days'    => 'day',
			'hour'    => 'hour',
			'hours'   => 'hour',
			'minute'  => 'minute',
			'minutes' => 'minute',
		];

		if ( ! isset( $valid_units[ $unit ] ) ) {
			return 0;
		}

		return $value . ' ' . $valid_units[ $unit ];
	}


	/**
	 * @return void
	 */
	public function update_migrate_option() {
		update_option( 'master_study_migrate_user_id', get_current_user_id() );
		update_option( 'master_study_migrate_time', current_time( 'timestamp' ) );
	}

	/**
	 * @param $course_parent_id
	 *
	 * @return array
	 */
	public function get_lessons_by_lp_course_parent_id( $course_parent_id ) {
		$results                      = array();
		$master_study_migrated_lesson = get_option( 'master_study_migrated_lesson', array() );

		foreach ( $master_study_migrated_lesson as $value ) {
			if ( $value['lp_course_id'] === $course_parent_id ) {
				$results[] = $value;
			}
		}

		return array_values( $results );
	}

	/**
	 * @param $course_parent_id
	 * @return array
	 */
	public function get_quizzes_by_lp_course_parent_id( $course_parent_id ) {
		$results                    = array();
		$master_study_migrated_quiz = get_option( 'master_study_migrated_quiz', array() );

		foreach ( $master_study_migrated_quiz as $value ) {
			if ( $value['lp_course_id'] === $course_parent_id ) {
				$results[] = $value;
			}
		}

		return array_values( $results );
	}


	/**
	 * @param $course_parent_id
	 *
	 * @return array
	 */
	public function get_assignments_by_lp_course_parent_id( $course_parent_id ) {
		$results                          = array();
		$master_study_migrated_assignment = get_option( 'master_study_migrated_assignment', array() );

		foreach ( $master_study_migrated_assignment as $value ) {
			if ( $value['lp_course_id'] === $course_parent_id ) {
				$results[] = $value;
			}
		}

		return array_values( $results );
	}

	/**
	 * @param $master_study_item_id
	 * @param $lp_item_id
	 *
	 * @return void
	 */
	public function add_migrated_course_item( $master_study_item_id, $lp_item_id ) {
		$master_study_migrated_course = get_option( 'master_study_migrated_course', array() );

		$master_study_migrated_course[] = array(
			'master_study_course_id' => intval( $master_study_item_id ),
			'lp_course_id'           => intval( $lp_item_id ),
		);

		update_option( 'master_study_migrated_course', $master_study_migrated_course );
	}

	/**
	 * @param $master_study_course_id
	 *
	 * @return mixed|string
	 */
	public function get_migrated_lp_course( $master_study_course_id ) {
		$master_study_migrated_course = get_option( 'master_study_migrated_course', array() );
		foreach ( $master_study_migrated_course as $value ) {
			if ( $value['master_study_course_id'] === intval( $master_study_course_id ) ) {
				return $value;
			}
		}

		return array();
	}

	/**
	 * @param $master_study_section_id
	 * @param $lp_section_id
	 * @param int $lp_course_id
	 *
	 * @return void
	 */
	public function add_migrated_section_item( $master_study_section_id, $lp_section_id, int $lp_course_id = 0 ) {
		$master_study_migrated_section = get_option( 'master_study_migrated_section', array() );

		$master_study_migrated_section[] = array(
			'master_study_section_id' => intval( $master_study_section_id ),
			'lp_section_id'           => intval( $lp_section_id ),
			'lp_course_id'            => $lp_course_id,
		);

		update_option( 'master_study_migrated_section', $master_study_migrated_section );
	}

	/**
	 * @param $master_study_section_id
	 *
	 * @return array|mixed
	 */
	public function get_migrated_lp_section( $master_study_section_id ) {
		$master_study_migrated_section = get_option( 'master_study_migrated_section', array() );
		foreach ( $master_study_migrated_section as $value ) {
			if ( $value['master_study_section_id'] === intval( $master_study_section_id ) ) {
				return $value;
			}
		}

		return array();
	}

	/**
	 * @param $master_study_lesson_id
	 * @param $lp_lesson_id
	 * @param int $lp_course_id
	 * @param int $lp_section_id
	 *
	 * @return void
	 */
	public function add_migrated_lesson_item( $master_study_lesson_id, $lp_lesson_id, int $lp_course_id = 0, int $lp_section_id = 0 ) {
		$master_study_migrated_lesson = get_option( 'master_study_migrated_lesson', array() );

		$master_study_migrated_lesson[] = array(
			'master_study_lesson_id' => intval( $master_study_lesson_id ),
			'lp_lesson_id'           => intval( $lp_lesson_id ),
			'lp_course_id'           => $lp_course_id,
			'lp_section_id'          => $lp_section_id,
		);

		update_option( 'master_study_migrated_lesson', $master_study_migrated_lesson );
	}

	/**
	 * @param $master_study_lesson_id
	 * @return int
	 */
	public function get_migrated_lp_lesson_total( $master_study_lesson_id ) {
		$total                        = 0;
		$master_study_migrated_lesson = get_option( 'master_study_migrated_lesson', array() );
		foreach ( $master_study_migrated_lesson as $value ) {
			if ( $value['master_study_lesson_id'] === intval( $master_study_lesson_id ) ) {
				++$total;
			}
		}

		return $total;
	}

	/**
	 * @param $master_study_quiz_id
	 * @param $lp_quiz_id
	 * @param int $lp_course_id
	 * @param int $lp_section_id
	 *
	 * @return void
	 */
	public function add_migrated_quiz_item( $master_study_quiz_id, $lp_quiz_id, int $lp_course_id = 0, int $lp_section_id = 0 ) {
		$master_study_migrated_quiz = get_option( 'master_study_migrated_quiz', array() );

		$master_study_migrated_quiz[] = array(
			'master_study_quiz_id' => intval( $master_study_quiz_id ),
			'lp_quiz_id'           => intval( $lp_quiz_id ),
			'lp_course_id'         => $lp_course_id,
			'lp_section_id'        => $lp_section_id,
		);

		update_option( 'master_study_migrated_quiz', $master_study_migrated_quiz );
	}

	/**
	 * @param $master_study_quiz_id
	 * @return array
	 */
	public function get_migrated_lp_quiz( $master_study_quiz_id ) {
		$master_study_migrated_quiz = get_option( 'master_study_migrated_quiz', array() );

		$migrated_lp_quizzes = array();
		foreach ( $master_study_migrated_quiz as $value ) {
			if ( intval( $value['master_study_quiz_id'] ) === intval( $master_study_quiz_id ) ) {
				$migrated_lp_quizzes[] = $value;
			}
		}

		return array_values( $migrated_lp_quizzes );
	}

	/**
	 * @param $master_study_quiz_id
	 * @return int
	 */
	public function get_migrated_lp_quiz_total( $master_study_quiz_id ) {
		$total                      = 0;
		$master_study_migrated_quiz = get_option( 'master_study_migrated_quiz', array() );
		foreach ( $master_study_migrated_quiz as $value ) {
			if ( $value['master_study_quiz_id'] === intval( $master_study_quiz_id ) ) {
				++$total;
			}
		}

		return $total;
	}

	/**
	 * @param $master_study_assignment_id
	 * @param $lp_assignment_id
	 * @param int $lp_course_id
	 * @param int $lp_section_id
	 *
	 * @return void
	 */
	public function add_migrated_assignment_item( $master_study_assignment_id, $lp_assignment_id, int $lp_course_id = 0, int $lp_section_id = 0 ) {
		$master_study_migrated_assignment = get_option( 'master_study_migrated_assignment', array() );

		$master_study_migrated_assignment[] = array(
			'master_study_assignment_id' => intval( $master_study_assignment_id ),
			'lp_assignment_id'           => intval( $lp_assignment_id ),
			'lp_course_id'               => $lp_course_id,
			'lp_section_id'              => $lp_section_id,
		);

		update_option( 'master_study_migrated_assignment', $master_study_migrated_assignment );
	}

	/**
	 * @param $master_study_assignment_id
	 * @return int
	 */
	public function get_migrated_lp_assignment_total( $master_study_assignment_id ) {
		$total                            = 0;
		$master_study_migrated_assignment = get_option( 'master_study_migrated_assignment', array() );
		foreach ( $master_study_migrated_assignment as $value ) {
			if ( $value['master_study_assignment_id'] === intval( $master_study_assignment_id ) ) {
				++$total;
			}
		}

		return $total;
	}


	/**
	 * @param $master_study_question_id
	 * @param $lp_question_id
	 * @param int $lp_course_id
	 * @param int $lp_section_id
	 * @param int $lp_quiz_id
	 *
	 * @return void
	 */
	public function add_migrated_question_item( $master_study_question_id, $lp_question_id, int $lp_course_id = 0, int $lp_section_id = 0, int $lp_quiz_id = 0 ) {
		$master_study_migrated_question = get_option( 'master_study_migrated_question', array() );

		$master_study_migrated_question[] = array(
			'master_study_question_id' => intval( $master_study_question_id ),
			'lp_question_id'           => intval( $lp_question_id ),
			'lp_course_id'             => $lp_course_id,
			'lp_section_id'            => $lp_section_id,
			'lp_quiz_id'               => $lp_quiz_id,
		);

		update_option( 'master_study_migrated_question', $master_study_migrated_question );
	}

	/**
	 * @param $master_study_question_id
	 *
	 * @return array|mixed
	 */
	public function get_migrated_lp_question( $master_study_question_id ) {
		$master_study_migrated_question = get_option( 'master_study_migrated_question', array() );
		foreach ( $master_study_migrated_question as $value ) {
			if ( $value['master_study_question_id'] === intval( $master_study_question_id ) ) {
				return $value;
			}
		}

		return array();
	}

	/**
	 * @param $master_study_question_id
	 * @param $master_study_quiz_id
	 * @param string $title
	 * @param $lp_question_answer_id
	 * @return void
	 */
	public function add_migrated_question_answer_item(
		$master_study_question_id,
		$master_study_quiz_id,
		string $title,
		$lp_question_answer_id
	) {
		$master_study_migrated_question_answer = get_option( 'master_study_migrated_question_answer', array() );

		$master_study_migrated_question_answer[] = array(
			'master_study_question_id' => intval( $master_study_question_id ),
			'master_study_quiz_id'     => intval( $master_study_quiz_id ),
			'master_study_title'       => $title,
			'lp_question_answer_id'    => intval( $lp_question_answer_id ),
		);

		update_option( 'master_study_migrated_question_answer', $master_study_migrated_question_answer );
	}

	/**
	 * @param $master_study_question_id
	 * @param $master_study_quiz_id
	 * @param string $title
	 * @return array|mixed
	 */
	public function get_migrated_lp_question_answer(
		$master_study_question_id,
		$master_study_quiz_id,
		string $title
	) {
		$master_study_migrated_question = get_option( 'master_study_migrated_question_answer', array() );
		foreach ( $master_study_migrated_question as $value ) {
			if ( $value['master_study_question_id'] === intval( $master_study_question_id ) &&
				$value['master_study_quiz_id'] === intval( $master_study_quiz_id ) &&
				$value['master_study_title'] === $title ) {
				return $value;
			}
		}

		return array();
	}
}
