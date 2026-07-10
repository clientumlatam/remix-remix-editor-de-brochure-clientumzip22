<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="profile" href="https://gmpg.org/xfn/11">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<header class="site-header" id="site-header">
    <div class="header-inner container">
        <div class="header-brand">
            <?php clientum_logo(); ?>
        </div>

        <nav class="primary-nav" id="primary-nav" aria-label="Menú principal">
            <ul class="nav-menu">

                <li class="nav-item has-dropdown">
                    <button class="nav-link dropdown-toggle" aria-expanded="false">
                        Funciones <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                    <div class="nav-dropdown">
                        <div class="dropdown-grid">
                            <a href="<?php echo esc_url(home_url('/whatsapp')); ?>" class="dropdown-item">
                                <span class="di-icon" style="background:#dcfce7">💬</span>
                                <span class="di-text"><strong>Chatbot WhatsApp 24/7</strong><small>Atención automática sin personal</small></span>
                            </a>
                            <a href="<?php echo esc_url(home_url('/crm-inteligente')); ?>" class="dropdown-item">
                                <span class="di-icon" style="background:#dbeafe">📊</span>
                                <span class="di-text"><strong>CRM Inteligente</strong><small>Pipeline visual de ventas</small></span>
                            </a>
                            <a href="<?php echo esc_url(home_url('/asistente-ia')); ?>" class="dropdown-item">
                                <span class="di-icon" style="background:#ede9fe">🤖</span>
                                <span class="di-text"><strong>Asistente IA</strong><small>Análisis e insights en tiempo real</small></span>
                            </a>
                            <a href="<?php echo esc_url(home_url('/reportes')); ?>" class="dropdown-item">
                                <span class="di-icon" style="background:#fff7ed">📈</span>
                                <span class="di-text"><strong>Reportes Automáticos</strong><small>KPIs y dashboards siempre actualizados</small></span>
                            </a>
                            <a href="<?php echo esc_url(home_url('/automatizacion')); ?>" class="dropdown-item">
                                <span class="di-icon" style="background:#fef9c3">⚡</span>
                                <span class="di-text"><strong>Automatización</strong><small>Flujos sin intervención humana</small></span>
                            </a>
                            <a href="<?php echo esc_url(home_url('/portal-cliente')); ?>" class="dropdown-item">
                                <span class="di-icon" style="background:#cffafe">🌐</span>
                                <span class="di-text"><strong>Portal del Cliente</strong><small>Self-service con tu marca</small></span>
                            </a>
                        </div>
                    </div>
                </li>

                <li class="nav-item has-dropdown">
                    <button class="nav-link dropdown-toggle" aria-expanded="false">
                        Servicios <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                    <div class="nav-dropdown">
                        <div class="dropdown-grid">
                            <a href="<?php echo esc_url(home_url('/integracion-api-gateway')); ?>" class="dropdown-item">
                                <span class="di-icon" style="background:#dbeafe">🔌</span>
                                <span class="di-text"><strong>Integración API Gateway</strong><small>Conectá todos tus sistemas sin código</small></span>
                            </a>
                            <a href="<?php echo esc_url(home_url('/ai-copilot')); ?>" class="dropdown-item">
                                <span class="di-icon" style="background:#ede9fe">🤖</span>
                                <span class="di-text"><strong>Viaweb AI Copilot</strong><small>IA y automatización para tu negocio</small></span>
                            </a>
                            <a href="<?php echo esc_url(home_url('/desarrollo-web-personalizado')); ?>" class="dropdown-item">
                                <span class="di-icon" style="background:#cffafe">💻</span>
                                <span class="di-text"><strong>Desarrollo Web Personalizado</strong><small>Sitios, apps y e-commerce con CRM</small></span>
                            </a>
                            <a href="<?php echo esc_url(home_url('/servicios')); ?>#consultoria" class="dropdown-item">
                                <span class="di-icon" style="background:#dcfce7">💼</span>
                                <span class="di-text"><strong>Consultoría Empresarial</strong><small>Diagnóstico y plan de mejora</small></span>
                            </a>
                            <a href="<?php echo esc_url(home_url('/servicios')); ?>#erp" class="dropdown-item">
                                <span class="di-icon" style="background:#fff7ed">⚙️</span>
                                <span class="di-text"><strong>ERP Personalizado</strong><small>Gestión a medida de tu industria</small></span>
                            </a>
                            <a href="<?php echo esc_url(home_url('/catalogo-servicios')); ?>" class="dropdown-item" style="border-top:1px solid var(--g100);grid-column:1/-1;margin-top:4px;padding-top:12px">
                                <span class="di-icon" style="background:#f0f5ff">📋</span>
                                <span class="di-text"><strong>Ver catálogo completo con precios →</strong><small>Todos los servicios y planes detallados</small></span>
                            </a>
                        </div>
                    </div>
                </li>

                <li class="nav-item has-dropdown">
                    <button class="nav-link dropdown-toggle" aria-expanded="false">
                        Empresa <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                    <div class="nav-dropdown dropdown-narrow">
                        <a href="<?php echo esc_url(home_url('/sobre-nosotros')); ?>" class="dropdown-item">Sobre Nosotros</a>
                        <a href="<?php echo esc_url(home_url('/casos-de-exito')); ?>" class="dropdown-item">Casos de Éxito</a>
                        <a href="<?php echo esc_url(home_url('/blog')); ?>" class="dropdown-item">Blog</a>
                        <a href="<?php echo esc_url(home_url('/comparativa')); ?>" class="dropdown-item">Comparativa</a>
                        <a href="<?php echo esc_url(home_url('/programa-de-socios')); ?>" class="dropdown-item">Programa de Socios</a>
                    </div>
                </li>

                <li class="nav-item has-dropdown">
                    <button class="nav-link dropdown-toggle" aria-expanded="false">
                        Recursos <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                    <div class="nav-dropdown dropdown-narrow">
                        <a href="<?php echo esc_url(home_url('/academia')); ?>" class="dropdown-item">Academia</a>
                        <a href="<?php echo esc_url(home_url('/recursos')); ?>" class="dropdown-item">Recursos gratuitos</a>
                        <a href="<?php echo esc_url(home_url('/faq')); ?>" class="dropdown-item">Preguntas frecuentes</a>
                        <a href="<?php echo esc_url(home_url('/precios')); ?>" class="dropdown-item">Precios</a>
                        <a href="<?php echo esc_url(home_url('/contacto')); ?>" class="dropdown-item">Contacto</a>
                    </div>
                </li>

            </ul>
        </nav>

        <div class="header-actions">
            <a href="<?php echo esc_url(home_url('/login')); ?>" class="btn btn-ghost">Iniciar sesión</a>
            <a href="<?php echo esc_url(home_url('/register')); ?>" class="btn btn-primary">Probar gratis</a>
        </div>

        <button class="mobile-menu-toggle" id="mobile-menu-toggle" aria-label="Abrir menú" aria-expanded="false">
            <span></span><span></span><span></span>
        </button>
    </div>
</header>

<div class="mobile-nav" id="mobile-nav" aria-hidden="true">
    <div class="mobile-nav-inner">
        <div class="mobile-nav-section">
            <p class="mobile-nav-label">Funciones</p>
            <a href="<?php echo esc_url(home_url('/whatsapp')); ?>">Chatbot WhatsApp 24/7</a>
            <a href="<?php echo esc_url(home_url('/crm-inteligente')); ?>">CRM Inteligente</a>
            <a href="<?php echo esc_url(home_url('/asistente-ia')); ?>">Asistente IA</a>
            <a href="<?php echo esc_url(home_url('/reportes')); ?>">Reportes Automáticos</a>
            <a href="<?php echo esc_url(home_url('/automatizacion')); ?>">Automatización</a>
            <a href="<?php echo esc_url(home_url('/portal-cliente')); ?>">Portal del Cliente</a>
        </div>
        <div class="mobile-nav-section">
            <p class="mobile-nav-label">Servicios</p>
            <a href="<?php echo esc_url(home_url('/integracion-api-gateway')); ?>">🔌 Integración API Gateway</a>
            <a href="<?php echo esc_url(home_url('/ai-copilot')); ?>">🤖 Viaweb AI Copilot</a>
            <a href="<?php echo esc_url(home_url('/desarrollo-web-personalizado')); ?>">💻 Desarrollo Web Personalizado</a>
            <a href="<?php echo esc_url(home_url('/servicios')); ?>">Consultoría y ERP</a>
            <a href="<?php echo esc_url(home_url('/catalogo-servicios')); ?>">📋 Catálogo con precios</a>
        </div>
        <div class="mobile-nav-section">
            <p class="mobile-nav-label">Empresa</p>
            <a href="<?php echo esc_url(home_url('/sobre-nosotros')); ?>">Sobre Nosotros</a>
            <a href="<?php echo esc_url(home_url('/casos-de-exito')); ?>">Casos de Éxito</a>
            <a href="<?php echo esc_url(home_url('/blog')); ?>">Blog</a>
            <a href="<?php echo esc_url(home_url('/comparativa')); ?>">Comparativa</a>
            <a href="<?php echo esc_url(home_url('/programa-de-socios')); ?>">Programa de Socios</a>
        </div>
        <div class="mobile-nav-section">
            <p class="mobile-nav-label">Recursos</p>
            <a href="<?php echo esc_url(home_url('/academia')); ?>">Academia</a>
            <a href="<?php echo esc_url(home_url('/recursos')); ?>">Recursos gratuitos</a>
            <a href="<?php echo esc_url(home_url('/faq')); ?>">FAQ</a>
            <a href="<?php echo esc_url(home_url('/precios')); ?>">Precios</a>
        </div>
        <div class="mobile-nav-actions">
            <a href="<?php echo esc_url(home_url('/login')); ?>" class="btn btn-outline w-full">Iniciar sesión</a>
            <a href="<?php echo esc_url(home_url('/register')); ?>" class="btn btn-primary w-full">Probar gratis 14 días</a>
        </div>
    </div>
</div>
<div class="mobile-overlay" id="mobile-overlay"></div>
