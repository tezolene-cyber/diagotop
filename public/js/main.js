document.addEventListener('DOMContentLoaded', () => {
  // Menu burger
  const burger = document.querySelector('.burger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      requestAnimationFrame(() => {
        const isOpen = mobileMenu.classList.toggle('open');
        burger.setAttribute('aria-expanded', isOpen);
      });
    });
  }

  // Animations via IntersectionObserver
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.anim').forEach(el => observer.observe(el));

  // Bouton retour en haut avec throttle
  const scrollBtn = document.getElementById('scroll-top');
  if (scrollBtn) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          scrollBtn.style.display = window.scrollY > 400 ? 'flex' : 'none';
          ticking = false;
        });
        ticking = true;
      }
    });
    scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // Liens d'ancrage fluides
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });
});