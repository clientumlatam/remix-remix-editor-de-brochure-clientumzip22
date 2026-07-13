<?php

use LPImportExport\Migration\Helpers\Plugin;

$is_tutor_active = Plugin::is_tutor_active();
$config_data     = array();

if ( $is_tutor_active ) {
	$config_data['tutor'] = array(
		'title' => esc_html__( 'Tutor LMS', 'learnpress-import-export' ),
		'name'  => 'tutor',
		'icon'  => LP_ADDON_IMPORT_EXPORT_ASSETS_URL . '/images/tutor-128x128.jpg',
		'url'   => add_query_arg(
			array(
				'page' => 'lp-migration-tool',
				'tab'  => 'tutor',
			),
			admin_url( 'admin.php' )
		),
		'desc'  => esc_html__( 'Migrate the Tutor data to LearnPress with the LearnPress Migration Tool.', 'learnpress-import-export' ),
	);
}

if ( Plugin::is_learndash_active() ) {
	$config_data['learndash'] = array(
		'title' => esc_html__( 'LearnDash', 'learnpress-import-export' ),
		'name'  => 'learndash',
		'icon'  => LP_ADDON_IMPORT_EXPORT_ASSETS_URL . '/images/learndash-128x128.png',
		'url'   => add_query_arg(
			array(
				'page' => 'lp-migration-tool',
				'tab'  => 'learndash',
			),
			admin_url( 'admin.php' )
		),
		'desc'  => esc_html__( 'Migrate the LearnDash data to LearnPress with the LearnPress Migration Tool.', 'learnpress-import-export' ),
	);
}

if ( Plugin::is_master_study_active() ) {
	$config_data['master_study'] = array(
		'title' => esc_html__( 'MasterStudy', 'learnpress-import-export' ),
		'name'  => 'master_study',
		'icon'  => '',
		'url'   => add_query_arg(
			array(
				'page' => 'lp-migration-tool',
				'tab'  => 'master_study',
			),
			admin_url( 'admin.php' )
		),
		'desc'  => esc_html__( 'Migrate the MasterStudy data to LearnPress with the LearnPress Migration Tool.', 'learnpress-import-export' ),
	);
}

return apply_filters(
	'learnpress-import-export/filter/config/migration-plugin',
	$config_data
);
