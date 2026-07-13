
<footer class="site-footer">
    <div class="container">
        <div class="footer-top">
            <div class="footer-newsletter-col">
                <h4>Newsletter</h4>
                <p style="font-size:.85rem;color:var(--g400);margin-bottom:12px">Consejos de IA para PyMEs, sin spam.</p>
                <?php echo do_shortcode('[aime_subscribe title="" description="" button_text="Suscribirme" show_name="0"]'); ?>
            </div>

            <div class="footer-brand-col">
                <?php clientum_logo(); ?>
                <p class="footer-desc">La plataforma de IA para PyMEs argentinas. Automatizá la atención, gestioná ventas y facturá desde un solo lugar.</p>
                <div class="footer-contact-info">
                    <a href="mailto:<?php echo esc_attr(clientum_email()); ?>"><?php echo esc_html(clientum_email()); ?></a>
                    <a href="tel:+542984510883"><?php echo esc_html(clientum_phone()); ?></a>
                    <a href="<?php echo esc_url(clientum_whatsapp()); ?>" target="_blank" rel="noopener">WhatsApp</a>
                </div>
            </div>

            <div class="footer-nav-col">
                <h4>Funciones</h4>
                <ul>
                    <li><a href="<?php echo esc_url(home_url('/whatsapp')); ?>">Chatbot WhatsApp 24/7</a></li>
                    <li><a href="<?php echo esc_url(home_url('/crm-inteligente')); ?>">CRM Inteligente</a></li>
                    <li><a href="<?php echo esc_url(home_url('/asistente-ia')); ?>">Asistente IA</a></li>
                    <li><a href="<?php echo esc_url(home_url('/reportes')); ?>">Reportes Automáticos</a></li>
                    <li><a href="<?php echo esc_url(home_url('/automatizacion')); ?>">Automatización</a></li>
                    <li><a href="<?php echo esc_url(home_url('/portal-cliente')); ?>">Portal del Cliente</a></li>
                </ul>
            </div>

            <div class="footer-nav-col">
                <h4>Servicios</h4>
                <ul>
                    <li><a href="<?php echo esc_url(home_url('/servicios')); ?>#consultoria">Consultoría Empresarial</a></li>
                    <li><a href="<?php echo esc_url(home_url('/servicios')); ?>#erp">ERP Personalizado</a></li>
                    <li><a href="<?php echo esc_url(home_url('/servicios')); ?>#implementacion">Implementación y Soporte</a></li>
                    <li><a href="<?php echo esc_url(home_url('/servicios')); ?>#marketing">Marketing Digital</a></li>
                    <li><a href="<?php echo esc_url(home_url('/servicios')); ?>#integracion">Integración de Tecnología</a></li>
                    <li><a href="<?php echo esc_url(home_url('/servicios')); ?>#web">Desarrollo Web</a></li>
                </ul>
            </div>

            <div class="footer-nav-col">
                <h4>Empresa</h4>
                <ul>
                    <li><a href="<?php echo esc_url(home_url('/sobre-nosotros')); ?>">Sobre Nosotros</a></li>
                    <li><a href="<?php echo esc_url(home_url('/casos-de-exito')); ?>">Casos de Éxito</a></li>
                    <li><a href="<?php echo esc_url(home_url('/blog')); ?>">Blog</a></li>
                    <li><a href="<?php echo esc_url(home_url('/comparativa')); ?>">Comparativa</a></li>
                    <li><a href="<?php echo esc_url(home_url('/programa-de-socios')); ?>">Programa de Socios</a></li>
                </ul>
            </div>

            <div class="footer-nav-col">
                <h4>Recursos</h4>
                <ul>
                    <li><a href="<?php echo esc_url(home_url('/academia')); ?>">Academia</a></li>
                    <li><a href="<?php echo esc_url(home_url('/recursos')); ?>">Recursos gratuitos</a></li>
                    <li><a href="<?php echo esc_url(home_url('/faq')); ?>">Preguntas frecuentes</a></li>
                    <li><a href="<?php echo esc_url(home_url('/precios')); ?>">Precios</a></li>
                    <li><a href="<?php echo esc_url(home_url('/contacto')); ?>">Contacto</a></li>
                </ul>
            </div>
        </div>

        <div class="footer-bottom">
            <p>&copy; <?php echo date('Y'); ?> Clientum. Todos los derechos reservados.</p>
            <div class="footer-legal">
                <a href="<?php echo esc_url(home_url('/politica-de-privacidad')); ?>">Política de Privacidad</a>
                <a href="<?php echo esc_url(home_url('/terminos-de-servicio')); ?>">Términos de Servicio</a>
            </div>
        </div>
    </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
