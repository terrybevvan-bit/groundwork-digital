/* Progressive enhancement only: all content is visible without JavaScript. */
(() => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.06 });
  const elements = document.querySelectorAll('.content-section, .cta-band, .services-grid > *, .work-grid > *, .blog-grid > *, .pricing-grid > *');
  elements.forEach(element => {
    // Never hide something the visitor is already looking at.
    if (element.getBoundingClientRect().top < innerHeight) return;
    if (element.parentElement.matches('.services-grid, .work-grid, .blog-grid, .pricing-grid')) {
      const columns = getComputedStyle(element.parentElement).gridTemplateColumns.split(' ').length;
      const index = Array.from(element.parentElement.children).indexOf(element);
      element.style.setProperty('--stagger', `${(index % columns) * 60}ms`);
    }
    element.classList.add('reveal');
    observer.observe(element);
  });
  motion.addEventListener('change', event => {
    if (event.matches) {
      elements.forEach(element => element.classList.add('in'));
      observer.disconnect();
    }
  });
})();
