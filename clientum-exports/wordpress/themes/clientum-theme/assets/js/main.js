/* Clientum Theme — main.js */
(function () {
  'use strict';

  /* ── Sticky header ── */
  const header = document.getElementById('site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Mobile menu ── */
  const toggle  = document.getElementById('mobile-menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const overlay   = document.getElementById('mobile-overlay');

  function openMenu() {
    toggle.classList.add('open');
    mobileNav.classList.add('open');
    overlay.classList.add('open');
    mobileNav.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    toggle.classList.remove('open');
    mobileNav.classList.remove('open');
    overlay.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  if (toggle) {
    toggle.addEventListener('click', () => toggle.classList.contains('open') ? closeMenu() : openMenu());
  }
  if (overlay) overlay.addEventListener('click', closeMenu);

  /* ── Desktop dropdown accessibility (click toggle on touch devices) ── */
  document.querySelectorAll('.dropdown-toggle').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const item = this.closest('.nav-item');
      const isOpen = item.classList.contains('force-open');
      document.querySelectorAll('.nav-item.force-open').forEach(i => i.classList.remove('force-open'));
      if (!isOpen) item.classList.add('force-open');
      this.setAttribute('aria-expanded', !isOpen);
    });
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.has-dropdown')) {
      document.querySelectorAll('.nav-item.force-open').forEach(i => {
        i.classList.remove('force-open');
        i.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded', 'false');
      });
    }
  });

  /* ── FAQ accordion ── */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', function () {
      const item = this.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      // Toggle current
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ── Contact form ── */
  const contactForm = document.getElementById('clientum-contact-form');
  if (contactForm && typeof clientumData !== 'undefined') {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const submitBtn = this.querySelector('[type="submit"]');
      const msgEl     = document.getElementById('form-message');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando…';

      const data = new FormData(this);
      data.append('action', 'clientum_contact');
      data.append('nonce', clientumData.nonce);

      try {
        const res  = await fetch(clientumData.ajaxUrl, { method: 'POST', body: data });
        const json = await res.json();
        if (json.success) {
          msgEl.className = 'form-message success';
          msgEl.textContent = json.data.message;
          contactForm.reset();
        } else {
          msgEl.className = 'form-message error';
          msgEl.textContent = json.data.message;
        }
      } catch (err) {
        msgEl.className = 'form-message error';
        msgEl.textContent = 'Error de conexión. Por favor intentá de nuevo.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar mensaje';
        msgEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  /* ── Smooth scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const id = this.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) || 68;
        const top = el.getBoundingClientRect().top + window.scrollY - headerH - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ── Intersection observer for fade-in animations ── */
  const style = document.createElement('style');
  style.textContent = `
    .anim-fade { opacity: 0; transform: translateY(24px); transition: opacity .5s ease, transform .5s ease; }
    .anim-fade.visible { opacity: 1; transform: translateY(0); }
  `;
  document.head.appendChild(style);

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.feature-card, .stat-card, .testimonial-card, .blog-card, .course-item, .resource-card').forEach(el => {
    el.classList.add('anim-fade');
    observer.observe(el);
  });

})();
