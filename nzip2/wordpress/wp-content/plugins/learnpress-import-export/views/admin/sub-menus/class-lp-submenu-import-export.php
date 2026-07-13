<?php

/**
 * Class LP_Submenu_Import_Export
 */
class LP_Submenu_Import_Export extends LP_Abstract_Submenu {
	/**
	 * LP_Submenu_Import_Export constructor.
	 */
	public function __construct() {
		$this->id         = 'learnpress-import-export';
		$this->menu_title = __( 'Import/Export', 'learnpress-import-export' );
		$this->page_title = __( 'Import/Export', 'learnpress-import-export' );
		$this->priority   = 30;
		$this->callback   = array( 'LP_Addon_Import_Export', 'admin_page' );

		parent::__construct();
	}
}

return new LP_Submenu_Import_Export();
