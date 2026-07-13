<?php
/**
 * LearnPress Import Export Functions
 *
 * Define common functions for both front-end and back-end
 *
 * @author   ThimPress
 * @package  LearnPress/Import-Export/Functions
 * @version  3.0.0
 */

// Prevent loading this file directly
defined( 'ABSPATH' ) || exit;

if ( ! function_exists( 'lpie_admin_view' ) ) {
	/**
	 * Admin view.
	 *
	 * @param $name
	 * @param string $args
	 */
	function lpie_admin_view( $name, $args = '' ) {
		if ( ! preg_match( '~.php$~', $name ) ) {
			$name .= '.php';
		}
		if ( is_array( $args ) ) {
			extract( $args );
		}

		$path = realpath( LP_ADDON_IMPORT_EXPORT_INC . "admin/views/{$name}" );
		if ( ! $path || ! file_exists( $path ) ) {
			return;
		}

		$path = preg_replace( '/\.\.+/', '', $path );

		include $path;
	}
}

if ( ! class_exists( 'lpie_get_export_source' ) ) {
	/**
	 * Get export sources (learnpress or other systems).
	 *
	 * @return mixed
	 */
	function lpie_get_export_source() {
		$source = array(
			'learnpress' => 'Learnpress',
		);

		return apply_filters( 'lpie_export_source', $source );
	}
}

if ( ! function_exists( 'lpie_get_exporter' ) ) {
	/**
	 * Get export provider class.
	 *
	 * @param $name
	 *
	 * @return mixed
	 */
	function lpie_get_exporter( $name ) {
		$provider = apply_filters( 'lpie_export_provider_class', 'LP_Export_' . $name . '_Provider', $name );
		if ( ! class_exists( $provider ) ) {
			return $provider;
		}

		return new $provider();
	}
}

if ( ! function_exists( 'lpie_root_path' ) ) {
	/**
	 * Get root path.
	 *
	 * @param string $a
	 *
	 * @return mixed
	 */
	function lpie_root_path( $a = 'basedir' ) {
		$upload_dir = wp_upload_dir();

		return $upload_dir[ $a ];
	}
}

if ( ! function_exists( 'lpie_root_url' ) ) {
	/**
	 * Get root url.
	 *
	 * @param string $a
	 *
	 * @return mixed
	 */
	function lpie_root_url( $a = 'baseurl' ) {
		$upload_dir = wp_upload_dir();

		return $upload_dir[ $a ];
	}
}

if ( ! function_exists( 'lpie_import_path' ) ) {
	/**
	 * Get import path.
	 *
	 * @param bool $root
	 *
	 * @return string
	 */
	function lpie_import_path( $root = true ) {
		return $root ? lpie_root_path() . '/learnpress/import' : 'learnpress/import';
	}
}

if ( ! function_exists( 'lpie_export_path' ) ) {
	/**
	 * Get export path.
	 *
	 * @param bool $root
	 *
	 * @return string
	 */
	function lpie_export_path( $root = true ) {
		return $root ? lpie_root_path() . '/learnpress/export' : 'learnpress/export';
	}
}

if ( ! function_exists( 'lpie_filesystem' ) ) {
	/**
	 * WP Filesystem.
	 *
	 * @return mixed
	 */
	function lpie_filesystem() {
		if ( ! function_exists( 'WP_Filesystem' ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
		}
		global $wp_filesystem;
		WP_Filesystem();

		return $wp_filesystem;
	}
}

if ( ! function_exists( 'lpie_mkdir' ) ) {
	/**
	 * Make directory.
	 *
	 * @param $dir
	 *
	 * @return string
	 */
	function lpie_mkdir( $dir ) {
		if ( wp_mkdir_p( lpie_root_path() . '/' . $dir ) ) {
			return $dir;
		}
		if ( $filesystem = lpie_filesystem() ) {
			if ( ! $filesystem->is_dir( lpie_root_path() . '/' . $dir ) ) {
				$folders = explode( '/', $dir );
				$return  = '';
				for ( $i = 0, $n = sizeof( $folders ); $i < $n; $i ++ ) {
					$subdir    = join( '/', array_slice( $folders, 0, $i + 1 ) );
					$make_path = lpie_root_path() . '/' . $subdir;
					if ( $filesystem->mkdir( $make_path, true ) ) {
						$return = $subdir;
						@$filesystem->chmod( $make_path, 0755 );
					} else {
						echo sprintf( __( 'Can not create dir [%d]', 'learnpress-import-export' ), $make_path ) . "\n";
					}
				}

				return $return;
			} else {
				return $dir;
			}
		} else {
			_e( 'Error with WP_Filesystem', 'learnpress-import-export' );
		}

		return $dir;
	}
}

if ( ! function_exists( 'lpie_put_contents' ) ) {
	/**
	 * Put content.
	 *
	 * @param $file
	 * @param $contents
	 */
	function lpie_put_contents( $file, $contents ) {
		if ( $filesystem = lpie_filesystem() ) {
			$file_dir = dirname( $file );
			lpie_mkdir( $file_dir );
			$filesystem->put_contents( lpie_root_path() . '/' . $file, $contents );
		}
	}
}

if ( ! function_exists( 'lpie_get_contents' ) ) {
	/**
	 * Get contents.
	 *
	 * @param $file
	 *
	 * @return mixed
	 */
	function lpie_get_contents( $file ) {
		if ( $filesystem = lpie_filesystem() ) {
			return $filesystem->get_contents( lpie_root_path() . '/' . $file );
		}

		return null;
	}
}

if ( ! function_exists( '' ) ) {
	/**
	 * Delete file.
	 *
	 * @param $file
	 */
	function lpie_delete_file( $file ) {
		if ( $filesystem = lpie_filesystem() ) {
			unlink( lpie_root_path() . '/' . $file );
		}
	}
}

if ( ! function_exists( 'lpie_get_export_files' ) ) {
	/**
	 * Get export files.
	 *
	 * @return array
	 */
	function lpie_get_export_files() {
		$files      = array();
		$filesystem = lpie_filesystem();
		if ( $filesystem ) {
			$list = $filesystem->dirlist( lpie_root_path() . '/learnpress/export' );
			if ( $list ) {
				foreach ( $list as $file ) {
					if ( ! preg_match( '!\.xml$!', $file['name'] ) ) {
						continue;
					}
					$files[] = $file;
				}
			}
			usort( $files, '_lpie_sort_files' );
		}

		return $files;
	}
}

if ( ! function_exists( 'lpie_get_import_files' ) ) {
	/**
	 * Get import files.
	 *
	 * @return array
	 */
	function lpie_get_import_files() {
		$files = array();
		if ( $filesystem = lpie_filesystem() ) {
			$list = $filesystem->dirlist( lpie_root_path() . '/learnpress/import' );
			if ( $list ) {
				foreach ( $list as $file ) {
					// if ( ! preg_match( "/!\.xml$!,|,!\.csv$!/", $file['name'] ) ) {
					//  continue;
					// }
					$files[] = $file;
				}
			}
			usort( $files, '_lpie_sort_files' );

		} else {
			_e( 'FileSystem error!', 'learnpress-import-export' );
		}

		return $files;
	}
}

if ( ! function_exists( 'lpie_get_url' ) ) {
	/**
	 * Get file url.
	 *
	 * @param $file
	 *
	 * @return string
	 */
	function lpie_get_url( $file ) {
		return lpie_root_path( 'baseurl' ) . '/' . $file;
	}
}

if ( ! function_exists( 'lpie_export_header' ) ) {
	/**
	 * Export header.
	 *
	 * @param $filename
	 */
	function lpie_export_header( $filename ) {
		header( 'Content-Description: File Transfer' );
		header( 'Content-Disposition: attachment; filename=' . $filename );
		header( 'Content-Type: text/xml; charset=' . get_option( 'blog_charset' ), true );
	}
}

if ( ! function_exists( 'lpie_get_current_tab' ) ) {
	/**
	 * Admin current tab.
	 *
	 * @return string
	 */
	function lpie_get_current_tab() {
		//$current_tab = ! empty( $_REQUEST['tab'] ) ? $_REQUEST['tab'] : 'export';
		return LP_Request::get_param( 'tab', 'export', 'key' );
	}
}

if ( ! function_exists( 'lpie_get_import_instructors' ) ) {
	/**
	 * Get import instructors.
	 *
	 * @param $file
	 *
	 * @return bool
	 * @throws Exception
	 */
	function lpie_get_import_instructors( $file ) {
		$xml_file = lpie_root_path() . '/learnpress/' . $file;
		if ( ! file_exists( $xml_file ) ) {
			throw new Exception( sprintf( __( 'The file %s doesn\'t exists', 'learnpress-import-export' ), $xml_file ) );
		}
		$parser = new LPR_Export_Import_Parser();
		$data   = $parser->parse( $xml_file );
		if ( ! empty( $data['authors'] ) ) {
			return $data['authors'];
		}

		return false;
	}
}

if ( ! function_exists( '_lpie_sort_files' ) ) {
	/**
	 * Sort files.
	 *
	 * @param $a
	 * @param $b
	 *
	 * @return bool
	 */
	function _lpie_sort_files( $a, $b ) {
		return $b['lastmodunix'] - $a['lastmodunix'];
	}
}

if ( ! function_exists( 'lpie_safe_maybe_unserialize' ) ) {
	/**
	 * Safely deserialize a value without instantiating PHP objects.
	 *
	 * Uses PHP's engine-level 'allowed_classes' => false option (available since
	 * PHP 7.0, the minimum WordPress 6.x requires). The PHP engine replaces every
	 * O: and C: token — at any nesting depth inside arrays — with an
	 * __PHP_Incomplete_Class stub. No magic methods (__wakeup, __destruct,
	 * __toString) fire at any level.
	 *
	 * Drop-in replacement for maybe_unserialize(). Non-string values and
	 * strings that are not serialized are returned unchanged.
	 *
	 * Used by the WXR importer and all migration controllers so the logic
	 * lives in exactly one place.
	 *
	 * @since 4.1.5
	 *
	 * @param mixed $value Raw value (serialized string or plain scalar/array).
	 *
	 * @return mixed Deserialized array/scalar (no live objects), or the original value.
	 */
	function lpie_safe_maybe_unserialize( $value ) {
		if ( ! is_string( $value ) || ! is_serialized( $value ) ) {
			return $value;
		}

		// Engine-level object block: every O:/C: token at any depth becomes
		// __PHP_Incomplete_Class — no magic methods can fire.
		// phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.serialize_unserialize
		$result = unserialize( $value, array( 'allowed_classes' => false ) );

		// unserialize() returns false on malformed input.
		// Guard the legitimate serialize(false) === 'b:0;' case.
		return ( false === $result && 'b:0;' !== $value ) ? $value : $result;
	}
}
