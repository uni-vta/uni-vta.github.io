const nav = document.getElementById('siteNav');
const progress = document.getElementById('progressBar');
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

function onScroll() {
  nav.classList.toggle('scrolled', scrollY > 12);
  const total = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = `${total > 0 ? scrollY / total * 100 : 0}%`;
}
addEventListener('scroll', onScroll, {passive: true});
onScroll();
toggle.addEventListener('click', () => {
  toggle.setAttribute('aria-expanded', String(links.classList.toggle('open')));
});
links.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  links.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}));

const demos = {
  book1: ['Flip Page', 'Rub, separate, and turn a single page.', '1× real-time duration'],
  light: ['Screw Light Bulb', 'Coordinate wrist rotation and fingertip contact.', '5× playback'],
  switch: ['Toggle Switch', 'Stabilize the breaker and actuate the switch.', '1× real-time duration'],
  tube: ['Liquid Transfer', 'Draw, move, and dispense liquid with a dropper.', '3× playback'],
  ball_hard: ['Ball Classification · Hard Ball', 'Use contact feedback to identify a rigid object.', '3× playback'],
  ball_soft: ['Ball Classification · Soft Ball', 'Use contact feedback to identify a compliant object.', '3× playback'],
  book2: ['Generalization Test', 'Flip a page under changing illumination.', '1× real-time duration'],
};
const player = document.getElementById('multiview-demo');
const panel = document.getElementById('demo-panel');
const tabs = [...document.querySelectorAll('[data-demo]')];
let userPaused = false;
let programmaticPause = false;
let activeTask = 'book1';

function selectDemo(tab) {
  if (tab.dataset.demo === activeTask) return;
  activeTask = tab.dataset.demo;
  const [title, description, speed] = demos[activeTask];
  tabs.forEach(item => {
    item.setAttribute('aria-selected', String(item === tab));
    item.tabIndex = item === tab ? 0 : -1;
  });
  panel.setAttribute('aria-labelledby', tab.id);
  document.getElementById('demo-title').textContent = title;
  document.getElementById('demo-description').textContent = description;
  document.getElementById('demo-speed').textContent = speed;
  player.setAttribute('aria-label', `${title}: synchronized robot views and tactile visualization`);
  player.poster = `static/images/multiview/${activeTask}.jpg`;
  player.src = `static/videos/multiview/${activeTask}.mp4`;
  player.load();
  userPaused = false;
  if (!reducedMotion) player.play().catch(() => {});
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectDemo(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    tabs[next].focus();
    selectDemo(tabs[next]);
  });
});
player.addEventListener('pause', () => {
  if (!programmaticPause) userPaused = true;
  programmaticPause = false;
});
player.addEventListener('play', () => { userPaused = false; });
const videoObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      if (!reducedMotion && !userPaused) player.play().catch(() => {});
    } else if (!player.paused) {
      programmaticPause = true;
      player.pause();
    }
  }
}, {threshold: .3});
videoObserver.observe(player);

const sectionObserver = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) {
    links.querySelectorAll('a').forEach(link => {
      if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
}, {rootMargin: '-15% 0px -55% 0px'});
document.querySelectorAll('section[id], #overview').forEach(section => sectionObserver.observe(section));
