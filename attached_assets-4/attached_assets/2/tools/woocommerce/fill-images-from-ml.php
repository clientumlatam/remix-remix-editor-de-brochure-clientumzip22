<?php
/**
 * Clientum - Completa imágenes desde MercadoLibre en un CSV de exportación de WooCommerce.
 *
 * Uso:
 *   php fill-images-from-ml.php input.csv output.csv
 *
 * - Lee la columna "Nombre" de cada fila.
 * - Si la columna "Imágenes" ya tiene algo, la deja como está (no pisa nada).
 * - Busca en MercadoLibre (sitio configurable abajo) y si encuentra resultado,
 *   escribe la URL de la imagen en la columna "Imágenes".
 * - Va guardando progreso fila por fila en output.csv, así si se corta a mitad
 *   de camino podés cortar y resumir (ver RESUME más abajo).
 * - Genera además un log.csv con: ID, Nombre, Resultado.
 *
 * Requisitos: PHP con extensión curl habilitada (php -m | grep curl).
 */

const SITE_ID = 'MLA'; // Argentina. MLM México, MCO Colombia, MLC Chile, MLU Uruguay, etc.
const DELAY_MICROSECONDS = 350000; // pausa entre requests (350ms) para no pegarle fuerte a la API de ML
const COL_ID = 0;
const COL_NOMBRE = 4;
const COL_IMAGENES = 30;

if ( $argc < 3 ) {
    fwrite( STDERR, "Uso: php fill-images-from-ml.php input.csv output.csv\n" );
    exit( 1 );
}

$input_path  = $argv[1];
$output_path = $argv[2];
$log_path    = preg_replace( '/\.csv$/i', '', $output_path ) . '-log.csv';

if ( ! file_exists( $input_path ) ) {
    fwrite( STDERR, "No existe el archivo: $input_path\n" );
    exit( 1 );
}

// --- RESUME: si output.csv ya existe (corrida anterior cortada), seguimos desde ahí ---
$already_processed_ids = [];
$resume = false;
if ( file_exists( $output_path ) ) {
    $resume = true;
    $rh = fopen( $output_path, 'r' );
    fgetcsv( $rh ); // header
    while ( ( $row = fgetcsv( $rh ) ) !== false ) {
        if ( isset( $row[ COL_ID ] ) ) {
            $already_processed_ids[ $row[ COL_ID ] ] = $row;
        }
    }
    fclose( $rh );
    echo "Resumiendo: " . count( $already_processed_ids ) . " filas ya procesadas anteriormente.\n";
}

$in = fopen( $input_path, 'r' );
// Saca el BOM UTF-8 si existe
$bom = fread( $in, 3 );
if ( $bom !== "\xEF\xBB\xBF" ) rewind( $in );

$header = fgetcsv( $in );
$total_rows = 0;
$tmp = fopen( $input_path, 'r' );
while ( fgetcsv( $tmp ) !== false ) $total_rows++;
fclose( $tmp );
$total_rows--; // descontar header

$out = fopen( $output_path, 'w' );
fputcsv( $out, $header );

$log = fopen( $log_path, $resume ? 'a' : 'w' );
if ( ! $resume ) fputcsv( $log, [ 'ID', 'Nombre', 'Resultado' ] );

$i = 0;
$matched = 0;
$skipped_had_image = 0;
$not_found = 0;

while ( ( $row = fgetcsv( $in ) ) !== false ) {
    $i++;
    $id = $row[ COL_ID ] ?? '';
    $nombre = $row[ COL_NOMBRE ] ?? '';

    // Resume: si ya estaba procesada, usar la fila guardada y seguir.
    if ( $resume && isset( $already_processed_ids[ $id ] ) ) {
        fputcsv( $out, $already_processed_ids[ $id ] );
        continue;
    }

    echo "[$i/$total_rows] $nombre ... ";

    if ( ! empty( $row[ COL_IMAGENES ] ) ) {
        echo "ya tenía imagen, omitido\n";
        fputcsv( $log, [ $id, $nombre, 'Ya tenía imagen' ] );
        $skipped_had_image++;
        fputcsv( $out, $row );
        continue;
    }

    if ( trim( $nombre ) === '' ) {
        echo "sin nombre, omitido\n";
        fputcsv( $log, [ $id, $nombre, 'Sin nombre' ] );
        fputcsv( $out, $row );
        continue;
    }

    $image_url = ml_search_image( $nombre );

    if ( $image_url ) {
        $row[ COL_IMAGENES ] = $image_url;
        echo "✅ encontrada\n";
        fputcsv( $log, [ $id, $nombre, 'Encontrada: ' . $image_url ] );
        $matched++;
    } else {
        echo "sin resultados\n";
        fputcsv( $log, [ $id, $nombre, 'Sin resultados en ML' ] );
        $not_found++;
    }

    fputcsv( $out, $row );
    fflush( $out );
    fflush( $log );

    usleep( DELAY_MICROSECONDS );
}

fclose( $in );
fclose( $out );
fclose( $log );

echo "\n--- Listo ---\n";
echo "Imágenes encontradas: $matched\n";
echo "Ya tenían imagen (omitidas): $skipped_had_image\n";
echo "Sin resultados en ML: $not_found\n";
echo "CSV final: $output_path\n";
echo "Log detallado: $log_path\n";

/**
 * Busca un texto en MercadoLibre y devuelve la URL de la mejor imagen disponible.
 */
function ml_search_image( $query ) {
    $search_url = sprintf(
        'https://api.mercadolibre.com/sites/%s/search?q=%s&limit=1',
        SITE_ID,
        rawurlencode( $query )
    );

    $body = http_get( $search_url );
    if ( ! $body ) return null;

    $data = json_decode( $body, true );
    if ( empty( $data['results'][0]['id'] ) ) return null;

    $item_id = $data['results'][0]['id'];

    // Pedimos el detalle del item para sacar la foto en HD (pictures[0]).
    $detail_body = http_get( 'https://api.mercadolibre.com/items/' . $item_id );
    if ( $detail_body ) {
        $detail = json_decode( $detail_body, true );
        if ( ! empty( $detail['pictures'][0]['url'] ) ) {
            return $detail['pictures'][0]['url'];
        }
    }

    // Fallback al thumbnail del resultado de búsqueda (mejorando resolución del nombre de archivo).
    if ( ! empty( $data['results'][0]['thumbnail'] ) ) {
        return str_replace( '-I.jpg', '-O.jpg', $data['results'][0]['thumbnail'] );
    }

    return null;
}

function http_get( $url ) {
    $ch = curl_init( $url );
    curl_setopt_array( $ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_USERAGENT      => 'Mozilla/5.0 (Clientum image fetch script)',
    ] );
    $response = curl_exec( $ch );
    $code = curl_getinfo( $ch, CURLINFO_HTTP_CODE );
    curl_close( $ch );

    if ( $code !== 200 ) return null;
    return $response;
}
