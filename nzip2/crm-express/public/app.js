// Mobile nav
const toggle = document.getElementById('navToggle');
const links  = document.getElementById('navLinks');
toggle?.addEventListener('click', () => {
  links?.classList.toggle('open');
  toggle.classList.toggle('open');
});

// Dropdown keyboard/click support on mobile
document.querySelectorAll('.dropdown-trigger').forEach(btn => {
  btn.addEventListener('click', () => {
    const parent = btn.closest('.nav-dropdown');
    document.querySelectorAll('.nav-dropdown').forEach(d => { if (d !== parent) d.classList.remove('open'); });
    parent?.classList.toggle('open');
  });
});
document.addEventListener('click', e => {
  if (!e.target.closest('.nav-dropdown')) {
    document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
  }
});

// FAQ accordion
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});

// Highlight active nav link
const path = window.location.pathname;
document.querySelectorAll('.dropdown-item, .nav-link').forEach(a => {
  if (a.getAttribute('href') === path) a.style.color = 'var(--blue-light)';
});
