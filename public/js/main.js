document.addEventListener('DOMContentLoaded', () => {
  // ---------- Menu burger ----------
  const burger = document.querySelector('.burger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      setTimeout(() => {
        const isOpen = mobileMenu.classList.toggle('open');
        burger.setAttribute('aria-expanded', isOpen);
      }, 0);
    });
  }

  // ---------- Animations (déjà asynchrone) ----------
  const animObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.anim').forEach(el => animObserver.observe(el));

  // ---------- Bouton "Retour en haut" via sentinelle ----------
  const scrollBtn = document.getElementById('scroll-top');
  const sentinel = document.getElementById('top-sentinel');
  if (scrollBtn && sentinel) {
    const sentinelObserver = new IntersectionObserver(([entry]) => {
      // si la sentinelle n'est plus visible, on affiche le bouton
      scrollBtn.style.display = entry.isIntersecting ? 'none' : 'flex';
    }, { threshold: 0 });
    sentinelObserver.observe(sentinel);

    scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ---------- Liens d'ancrage (délégation) ----------
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (anchor) {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});