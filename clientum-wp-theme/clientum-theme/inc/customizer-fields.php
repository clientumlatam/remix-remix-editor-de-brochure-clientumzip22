<?php
/**
 * Extended Customizer fields for Clientum theme.
 * Included from functions.php via require_once.
 */
if (!defined('ABSPATH')) exit;

// Hero section customizer controls
function clientum_customizer_hero(WP_Customize_Manager $wp_customize): void {
    $wp_customize->add_section('clientum_hero', [
        'title'    => 'Hero / Portada',
        'priority' => 25,
    ]);
    $hero_fields = [
        'clientum_hero_badge'   => ['label' => 'Badge de Hero (texto pequeño arriba)', 'default' => 'Plataforma All-in-One para PyMEs'],
        'clientum_cta_primary'  => ['label' => 'CTA Primario (texto del botón)', 'default' => 'Ver Servicios'],
        'clientum_cta_secondary'=> ['label' => 'CTA Secundario (texto del botón)', 'default' => 'Solicitar Demo'],
        'clientum_hero_badge1'  => ['label' => 'Badge 1 (debajo del hero)', 'default' => 'Sin contrato mínimo'],
        'clientum_hero_badge2'  => ['label' => 'Badge 2 (debajo del hero)', 'default' => 'Implementado en 5 días'],
        'clientum_hero_badge3'  => ['label' => 'Badge 3 (debajo del hero)', 'default' => 'Soporte en español 24/7'],
    ];
    foreach ($hero_fields as $id => $args) {
        $wp_customize->add_setting($id, ['default' => $args['default'], 'sanitize_callback' => 'sanitize_text_field']);
        $wp_customize->add_control($id, ['label' => $args['label'], 'section' => 'clientum_hero', 'type' => 'text']);
    }
}
add_action('customize_register', 'clientum_customizer_hero');

// Social proof strip
function clientum_customizer_social(WP_Customize_Manager $wp_customize): void {
    $wp_customize->add_section('clientum_social_proof', [
        'title'    => 'Tira de Social Proof',
        'priority' => 26,
    ]);
    for ($i = 1; $i <= 6; $i++) {
        $wp_customize->add_setting("clientum_industry_{$i}", ['default' => '', 'sanitize_callback' => 'sanitize_text_field']);
        $wp_customize->add_control("clientum_industry_{$i}", ['label' => "Industria {$i}", 'section' => 'clientum_social_proof', 'type' => 'text']);
    }
}
add_action('customize_register', 'clientum_customizer_social');
