<?php
/**
 * LearnPress Curriculum Patch
 *
 * Fixes an issue where LearnPress CourseModel caching prevents curriculum from loading.
 * The problem: LP_Course::get_full_sections_and_items_course() uses CourseModel::find(id, true)
 * which caches an empty model before sections are populated.
 *
 * This class hooks into LearnPress and force-loads sections from database when they're empty.
 *
 * @package LearnPress_Import_Export
 * @since 1.0.0
 */

namespace LPImportExport\LearnDashMigration;

defined( 'ABSPATH' ) || exit;

/**
 * Class LP_Curriculum_Patch
 */
class LP_Curriculum_Patch {

	/**
	 * Singleton instance.
	 *
	 * @var LP_Curriculum_Patch
	 */
	private static $instance = null;

	/**
	 * Get singleton instance.
	 *
	 * @return LP_Curriculum_Patch
	 */
	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor - hook into LearnPress.
	 */
	private function __construct() {
		// Hook into course sections filter to fix empty curriculum.
		add_filter( 'learn-press/course-sections', array( $this, 'fix_empty_sections' ), 10, 4 );
	}

	/**
	 * Fix empty sections by loading from database directly.
	 *
	 * @param array  $sections   The sections array (may be empty due to caching bug).
	 * @param int    $course_id  The course ID.
	 * @param string $return     Return type.
	 * @param int    $section_id Specific section ID (0 for all).
	 * @return array Fixed sections array.
	 */
	public function fix_empty_sections( $sections, $course_id, $return, $section_id ) {
		// Only fix if sections are empty but database has data.
		if ( ! empty( $sections ) ) {
			return $sections;
		}

		global $wpdb;

		// Check if this course has sections in the database.
		$db_sections_count = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM {$wpdb->prefix}learnpress_sections WHERE section_course_id = %d",
				$course_id
			)
		);

		// No sections in DB either - nothing to fix.
		if ( ! $db_sections_count ) {
			return $sections;
		}

		// Load sections directly from database.
		$sections_data = $this->load_sections_from_db( $course_id );

		// If we got sections, create LP_Course_Section objects.
		if ( empty( $sections_data ) ) {
			return $sections;
		}

		// Build section objects.
		$fixed_sections = array();
		$position       = 0;

		foreach ( $sections_data as $section_data ) {
			++$position;
			$section_id_key = $section_data['section_id'];

			// Create LP_Course_Section if class exists.
			if ( class_exists( 'LP_Course_Section' ) ) {
				$section_items = array(
					'section_id'          => $section_data['section_id'],
					'section_name'        => $section_data['section_name'],
					'section_course_id'   => $course_id,
					'section_order'       => $section_data['section_order'],
					'section_description' => $section_data['section_description'] ?? '',
					'items'               => $section_data['items'] ?? array(),
				);

				$section = new \LP_Course_Section( $section_items );
				$section->set_position( $position );
				$fixed_sections[ $section_id_key ] = $section;
			}
		}

		return $fixed_sections;
	}

	/**
	 * Load sections and items directly from database.
	 *
	 * @param int $course_id Course ID.
	 * @return array Sections data.
	 */
	private function load_sections_from_db( $course_id ) {
		global $wpdb;

		$sections_data = array();

		// Get sections.
		$sections = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT * FROM {$wpdb->prefix}learnpress_sections 
				WHERE section_course_id = %d 
				ORDER BY section_order",
				$course_id
			)
		);

		if ( empty( $sections ) ) {
			return $sections_data;
		}

		// Get section items.
		$section_ids     = wp_list_pluck( $sections, 'section_id' );
		$section_ids_str = implode( ',', array_map( 'intval', $section_ids ) );

		$items = $wpdb->get_results(
			"SELECT si.*, p.post_title, p.post_type, p.post_status
			FROM {$wpdb->prefix}learnpress_section_items si
			INNER JOIN {$wpdb->posts} p ON si.item_id = p.ID
			WHERE si.section_id IN ({$section_ids_str})
			AND p.post_status = 'publish'
			ORDER BY si.section_id, si.item_order"
		);

		// Group items by section.
		$items_by_section = array();
		foreach ( $items as $item ) {
			if ( ! isset( $items_by_section[ $item->section_id ] ) ) {
				$items_by_section[ $item->section_id ] = array();
			}

			$item_obj             = new \stdClass();
			$item_obj->id         = $item->item_id;
			$item_obj->item_id    = $item->item_id;
			$item_obj->order      = $item->item_order;
			$item_obj->item_order = $item->item_order;
			$item_obj->type       = $item->item_type;
			$item_obj->item_type  = $item->item_type;
			$item_obj->title      = html_entity_decode( $item->post_title );

			$items_by_section[ $item->section_id ][ $item->item_id ] = $item_obj;
		}

		// Build sections data.
		foreach ( $sections as $section ) {
			$section_items = $items_by_section[ $section->section_id ] ?? array();

			$sections_data[] = array(
				'section_id'          => $section->section_id,
				'section_name'        => html_entity_decode( $section->section_name ),
				'section_order'       => $section->section_order,
				'section_description' => html_entity_decode( $section->section_description ?? '' ),
				'items'               => $section_items,
			);
		}

		return $sections_data;
	}
}
