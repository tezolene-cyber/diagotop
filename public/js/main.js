document.addEventListener('DOMContentLoaded', () => {
  // Menu burger
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

  // Animations via IntersectionObserver (déjà asynchrone)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.anim').forEach(el => observer.observe(el));

  // Bouton retour en haut
  const scrollBtn = document.getElementById('scroll-top');
  if (scrollBtn) {
    window.addEventListener('scroll', () => {
      setTimeout(() => {
        scrollBtn.style.display = window.scrollY > 400 ? 'flex' : 'none';
      }, 0);
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