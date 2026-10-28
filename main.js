'use strict';

document.body.classList.add('js');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
function closeMenu(returnFocus = false) {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
  navigation.classList.remove('is-open');
  if (returnFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  navigation.classList.toggle('is-open', open);
});
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
window.matchMedia('(min-width: 681px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

const filters = document.querySelectorAll('[data-filter]');
const projects = document.querySelectorAll('#projects [data-category]');
const projectCollections = document.querySelectorAll('[data-project-collection]');
document.querySelector('#project-total').textContent = String(projects.length).padStart(2, '0');
filters.forEach(button => button.addEventListener('click', () => {
  filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
  let count = 0;
  projects.forEach(project => {
    project.hidden = button.dataset.filter !== 'all' && project.dataset.category !== button.dataset.filter;
    if (!project.hidden) count++;
  });
  projectCollections.forEach(collection => {
    collection.hidden = !Array.from(collection.querySelectorAll('[data-category]')).some(project => !project.hidden);
  });
  document.querySelector('#project-count').textContent = `${count} ${count === 1 ? 'project' : 'projects'}`;
}));

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealTargets = document.querySelectorAll(
  '.featured-work, .work-grid .work-card, .stack-card, .project-grid .project-card, .timeline-row, .article-row'
);
let revealObserver;

function updateRevealMotion() {
  if (revealObserver) revealObserver.disconnect();
  document.body.classList.remove('motion-ready');
  revealTargets.forEach(target => {
    target.classList.remove('scroll-reveal', 'is-visible');
    target.style.removeProperty('--reveal-delay');
  });
  if (reducedMotion.matches || !('IntersectionObserver' in window)) return;

  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -48px 0px', threshold: 0.08 });

  revealTargets.forEach((target, index) => {
    target.classList.add('scroll-reveal');
    target.style.setProperty('--reveal-delay', `${(index % 4) * 70}ms`);
    revealObserver.observe(target);
  });
  document.body.classList.add('motion-ready');
}

updateRevealMotion();
reducedMotion.addEventListener('change', updateRevealMotion);
const portrait = document.querySelector('.hero-portrait');
if (portrait && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  glow.setAttribute('aria-hidden', 'true');
  document.body.append(glow);
  document.addEventListener('pointermove', event => {
    if (reducedMotion.matches) return;
    glow.style.setProperty('--cursor-x', `${event.clientX}px`);
    glow.style.setProperty('--cursor-y', `${event.clientY}px`);
  }, { passive: true });
  portrait.addEventListener('pointermove', event => {
    if (reducedMotion.matches) return;
    const rect = portrait.getBoundingClientRect();
    portrait.style.setProperty('--tilt-x', `${((event.clientY - rect.top) / rect.height - .5) * -5}deg`);
    portrait.style.setProperty('--tilt-y', `${((event.clientX - rect.left) / rect.width - .5) * 5}deg`);
  }, { passive: true });
  portrait.addEventListener('pointerleave', () => {
    portrait.style.removeProperty('--tilt-x');
    portrait.style.removeProperty('--tilt-y');
  });
}
if ('IntersectionObserver' in window) {
  const sectionLinks = Array.from(navigation.querySelectorAll('a'));
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        sectionLinks.forEach(link => {
          if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      }
    });
  }, { rootMargin: '-15% 0px -60% 0px', threshold: 0 });
  sectionLinks.forEach(link => {
    const target = document.querySelector(link.hash);
    if (target) sectionObserver.observe(target);
  });
}
document.querySelector('#year').textContent = new Date().getFullYear();
