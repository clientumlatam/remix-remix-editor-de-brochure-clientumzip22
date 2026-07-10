/* Clientum WordPress Theme — Main JS */
(function () {
  'use strict';

  // ── Mobile Menu ──────────────────────────────────────────────────────────────
  const mobileBtn  = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const iconOpen   = document.getElementById('menu-icon-open');
  const iconClose  = document.getElementById('menu-icon-close');

  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
      const isOpen = !mobileMenu.classList.contains('hidden');
      mobileMenu.classList.toggle('hidden', isOpen);
      iconOpen  && iconOpen.classList.toggle('hidden', !isOpen);
      iconClose && iconClose.classList.toggle('hidden', isOpen);
    });
  }

  // ── FAQ Accordion ─────────────────────────────────────────────────────────────
  document.querySelectorAll('.faq-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const content  = btn.nextElementSibling;
      const icon     = btn.querySelector('.faq-icon');
      const expanded = btn.getAttribute('aria-expanded') === 'true';

      // Close all others
      document.querySelectorAll('.faq-toggle').forEach(other => {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          other.nextElementSibling?.classList.add('hidden');
          other.querySelector('.faq-icon')?.classList.remove('rotate-180');
        }
      });

      btn.setAttribute('aria-expanded', String(!expanded));
      content?.classList.toggle('hidden', expanded);
      icon?.classList.toggle('rotate-180', !expanded);
    });
  });

  // ── Smooth Scroll for anchor links ──────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Close mobile menu if open
        mobileMenu && mobileMenu.classList.add('hidden');
      }
    });
  });

  // ── Header Scroll Effect ─────────────────────────────────────────────────────
  const header = document.getElementById('site-header');
  if (header) {
    let lastY = 0;
    window.addEventListener('scroll', () => {
      const currentY = window.scrollY;
      header.classList.toggle('shadow-md', currentY > 50);
      lastY = currentY;
    }, { passive: true });
  }

  // ── AJAX Contact Form (main contact section) ─────────────────────────────────
  function setupForm(formId, errorId, successId, btnId) {
    const form    = document.getElementById(formId);
    const errorEl = document.getElementById(errorId);
    const successEl = document.getElementById(successId);
    const btn     = document.getElementById(btnId);
    if (!form) return;

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (errorEl)   errorEl.classList.add('hidden');
      if (successEl) successEl.classList.add('hidden');
      if (btn) { btn.disabled = true; btn.textContent = 'Enviando…'; }

      const data = new FormData(form);
      data.append('action', 'clientum_contact');
      // Grab nonce from either nonce field in the form
      const nonceField = form.querySelector('[name="clientum_nonce_field"], [name="clientum_nonce_contact"]');
      if (nonceField) data.set('nonce', nonceField.value);

      try {
        const res  = await fetch(clientumData.ajaxUrl, { method: 'POST', body: data });
        const json = await res.json();
        if (json.success) {
          if (successEl) successEl.classList.remove('hidden');
          form.reset();
        } else {
          if (errorEl) { errorEl.textContent = json.data?.message || 'Error al enviar.'; errorEl.classList.remove('hidden'); }
        }
      } catch {
        if (errorEl) { errorEl.textContent = 'Error de conexión. Intentá de nuevo.'; errorEl.classList.remove('hidden'); }
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label || 'Enviar'; }
      }
    });
  }

  setupForm('hero-contact-form',  'hero-form-error',     'hero-form-success',    'hero-form-btn');
  setupForm('main-contact-form',  'contact-form-error',  'contact-form-success', 'contact-form-btn');

  // ── Newsletter Form ──────────────────────────────────────────────────────────
  const nlForm    = document.getElementById('newsletter-form');
  const nlEmail   = document.getElementById('newsletter-email');
  const nlSuccess = document.getElementById('newsletter-success');

  if (nlForm) {
    nlForm.addEventListener('submit', async e => {
      e.preventDefault();
      const formData = new FormData();
      formData.append('action', 'clientum_newsletter');
      formData.append('email', nlEmail.value);
      formData.append('nonce', clientumData.nonce);

      try {
        const res  = await fetch(clientumData.ajaxUrl, { method: 'POST', body: formData });
        const json = await res.json();
        if (json.success) {
          nlSuccess && nlSuccess.classList.remove('hidden');
          nlForm.reset();
          setTimeout(() => nlSuccess && nlSuccess.classList.add('hidden'), 5000);
        }
      } catch { /* silent */ }
    });
  }

  // ── Pricing Configurator ──────────────────────────────────────────────────────
  const projectSlider = document.getElementById('project-slider');
  const pageSlider    = document.getElementById('page-slider');
  const planOutput    = document.getElementById('plan-output');

  function updatePlan() {
    if (!projectSlider || !pageSlider || !planOutput) return;
    const p  = parseInt(projectSlider.value);
    const pg = parseInt(pageSlider.value);
    document.getElementById('project-count') && (document.getElementById('project-count').textContent = p);
    document.getElementById('page-count')    && (document.getElementById('page-count').textContent = pg);

    let name, price, desc;
    if (p <= 20 && pg <= 20) {
      name = 'Clientum Mini';  price = '$20';  desc = 'Ideal para iniciar tus proyectos o landing pages sencillas.';
    } else if (p <= 50 && pg <= 50) {
      name = 'Clientum Small'; price = '$50';  desc = 'Recomendado para marcas y PyMEs en crecimiento continuo.';
    } else {
      name = 'Clientum Large'; price = '$100'; desc = 'Escalabilidad masiva y herramientas empresariales sin límites.';
    }
    if (planOutput) {
      planOutput.innerHTML = `<span class="font-black text-[#1A3461]">${name}</span> — <span class="text-emerald-600 font-bold">${price}/mes</span> <br><span class="text-slate-500 text-xs">${desc}</span>`;
    }
  }

  projectSlider && projectSlider.addEventListener('input', updatePlan);
  pageSlider    && pageSlider.addEventListener('input', updatePlan);
  updatePlan();

  // ── Portfolio Industry Filter ─────────────────────────────────────────────────
  document.querySelectorAll('.industry-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      document.querySelectorAll('.industry-filter-btn').forEach(b => b.classList.remove('active', 'bg-[#1A3461]', 'text-white'));
      btn.classList.add('active', 'bg-[#1A3461]', 'text-white');
      document.querySelectorAll('.portfolio-item').forEach(item => {
        const match = filter === 'todos' || item.dataset.industry === filter;
        item.style.display = match ? '' : 'none';
      });
    });
  });

  // ── Intersection Observer for animations ─────────────────────────────────────
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-4');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      el.classList.add('opacity-0', 'translate-y-4', 'transition-all', 'duration-500');
      observer.observe(el);
    });
  }

})();
