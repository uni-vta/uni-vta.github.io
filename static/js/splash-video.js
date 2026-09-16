document.addEventListener('DOMContentLoaded', () => {
  const splash = document.querySelector('.video-splash');
  const video = document.getElementById('splashVideo');
  const task = document.getElementById('splashTask');
  const speed = document.getElementById('splashSpeed');

  if (!splash || !video || !task || !speed) return;

  const clips = [
    { end: 9.4, task: 'Flip Page', speed: '1× Speed' },
    { end: 25.3, task: 'Screw Light Bulb', speed: '2× Speed' },
    { end: 29.8, task: 'Toggle Switch', speed: '2× Speed' },
    { end: 35.5, task: 'Ball Classification', speed: '2× Speed' },
    { end: Infinity, task: 'Liquid Transfer', speed: '2× Speed' }
  ];

  let activeClip = -1;

  function updateClipLabel() {
    const index = clips.findIndex((clip) => video.currentTime < clip.end);
    if (index === activeClip || index < 0) return;
    activeClip = index;
    task.textContent = clips[index].task;
    speed.textContent = clips[index].speed;
  }

  function updateSplashState() {
    document.body.classList.toggle('past-splash', window.scrollY > splash.offsetHeight * 0.78);
  }

  function startVideo() {
    splash.classList.add('video-ready');
    video.muted = true;
    video.play().catch(() => {});
    updateClipLabel();
  }

  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    startVideo();
  } else {
    video.addEventListener('loadeddata', startVideo, { once: true });
    video.addEventListener('canplay', startVideo, { once: true });
  }

  splash.addEventListener('pointerdown', () => {
    if (video.paused) startVideo();
  });
  video.addEventListener('timeupdate', updateClipLabel);
  video.addEventListener('seeked', updateClipLabel);
  window.addEventListener('scroll', updateSplashState, { passive: true });
  window.addEventListener('resize', updateSplashState);
  updateSplashState();
});
