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
  book1: {
    title: 'Flip Page', task: 'Task I / Page separation and turning', speed: '1× real time',
    description: 'The robot approaches the book, slows down near the page, and coordinates its fingers to rub and separate a single page before turning it to the left.',
  },
  light: {
    title: 'Screw Light Bulb', task: 'Task II / Wrist and finger coordination', speed: '5×',
    description: 'The robot approaches a light bulb loosely placed in its socket and coordinates its wrist and fingers to screw the bulb into the socket until it lights up.',
  },
  switch: {
    title: 'Toggle Switch', task: 'Task III / Stabilization and thumb actuation', speed: '1× real time',
    description: 'The robot approaches a circuit breaker on the table, stabilizes it with the index and middle fingers, and uses the thumb to firmly push the switch until it is fully turned on.',
  },
  tube: {
    title: 'Liquid Transfer with a Dropper', task: 'Task V / Grasp, draw, transfer, and dispense', speed: '3×',
    description: 'The robot grasps a dropper, inserts it into a flask to draw water, transfers it to a target cup, and dispenses the water without spilling.',
  },
  ball_hard: {
    title: 'Ball Classification · Hard Ball', task: 'Task IV / Material recognition through touch', speed: '3×',
    description: 'The robot approaches visually similar balls made of different materials, infers their material properties through tactile interaction, and sorts them into the corresponding cups. This clip shows the hard-ball case.',
  },
  ball_soft: {
    title: 'Ball Classification · Soft Ball', task: 'Task IV / Material recognition through touch', speed: '3×',
    description: 'The robot approaches visually similar balls made of different materials, infers their material properties through tactile interaction, and sorts them into the corresponding cups. This clip shows the soft-ball case.',
  },
};
const player = document.getElementById('multiview-demo');
const panel = document.getElementById('demo-panel');
const tabs = [...document.querySelectorAll('[data-demo]')];
let activeTask = 'book1';
const playbackStates = new WeakMap();
document.querySelectorAll('.demo-player').forEach(video => {
  const state = {userPaused: false, automaticPause: false, loading: false};
  playbackStates.set(video, state);
  video.addEventListener('pause', () => {
    if (!state.automaticPause && !state.loading) state.userPaused = true;
    state.automaticPause = false;
  });
  video.addEventListener('play', () => { state.userPaused = false; });
  video.addEventListener('loadedmetadata', () => { state.loading = false; });
});

function selectDemo(tab) {
  if (tab.dataset.demo === activeTask) return;
  activeTask = tab.dataset.demo;
  const {title, task, description, speed} = demos[activeTask];
  tabs.forEach(item => {
    item.setAttribute('aria-selected', String(item === tab));
    item.tabIndex = item === tab ? 0 : -1;
  });
  panel.setAttribute('aria-labelledby', tab.id);
  document.getElementById('demo-title').textContent = title;
  document.getElementById('demo-task').textContent = task;
  document.getElementById('demo-description').textContent = description;
  document.getElementById('demo-speed').textContent = `Playback speed: ${speed}.`;
  player.setAttribute('aria-label', `${title}: synchronized robot views and tactile visualization`);
  const state = playbackStates.get(player);
  state.loading = true;
  state.userPaused = false;
  player.poster = `static/images/multiview-v31/${activeTask}.jpg`;
  player.src = `static/videos/multiview-v31/${activeTask}.mp4`;
  player.load();
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
const videoObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    const video = entry.target;
    const state = playbackStates.get(video);
    if (entry.isIntersecting) {
      if (!reducedMotion && !state.userPaused) video.play().catch(() => {});
    } else if (!video.paused) {
      state.automaticPause = true;
      video.pause();
    }
  }
}, {threshold: .3});
document.querySelectorAll('.demo-player').forEach(video => videoObserver.observe(video));

const sectionObserver = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) {
    links.querySelectorAll('a').forEach(link => {
      if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
}, {rootMargin: '-15% 0px -55% 0px'});
document.querySelectorAll('section[id], #overview').forEach(section => sectionObserver.observe(section));
