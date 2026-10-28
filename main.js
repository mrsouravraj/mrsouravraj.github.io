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

const traceButton = document.querySelector('#trace-button');
const traceStatus = document.querySelector('#trace-status');
const nodes = document.querySelectorAll('[data-node]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const steps = [
  ['api', '01 / API validates the request and its identity.'],
  ['queue', '02 / Queue accepts the work for asynchronous processing.'],
  ['worker', '03 / Worker times out. The request is not lost.'],
  ['retry', '04 / Retry with backoff and the same idempotency key.'],
  ['rules', '05 / Validate the result against explicit rules.'],
  ['store', '06 / Persist once. Acknowledge. Request recovered.']
];
traceButton.addEventListener('click', async () => {
  traceButton.disabled = true;
  if (reducedMotion.matches) {
    nodes.forEach(node => node.classList.add('is-active'));
    traceStatus.textContent = 'API → queue → timeout → retry → validate → persist once. Recovered.';
  } else {
    for (const [active, message] of steps) {
      nodes.forEach(node => node.classList.toggle('is-active', node.dataset.node === active));
      traceStatus.textContent = message;
      await new Promise(resolve => setTimeout(resolve, 850));
    }
  }
  traceButton.disabled = false;
  traceButton.innerHTML = 'Run again <span aria-hidden="true">↗</span>';
});

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
