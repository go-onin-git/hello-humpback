(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Case film: self-hosted, so there's no third-party player chrome
  const film = document.querySelector('.film');
  film?.querySelector('.film__play').addEventListener('click', () => {
    const video = film.querySelector('video');
    film.classList.add('is-playing');
    video.controls = true;
    video.play();
    video.focus();
  });

  // Data in, story out: link each sighting to the sentence it produced
  const factButtons = document.querySelectorAll('.record__rows button');
  const marks = document.querySelectorAll('.story mark[data-fact]');
  const light = (fact) => {
    factButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.fact === fact)));
    marks.forEach((m) => m.classList.toggle('is-lit', m.dataset.fact === fact));
  };
  factButtons.forEach((b) => {
    b.addEventListener('click', () => light(b.getAttribute('aria-pressed') === 'true' ? null : b.dataset.fact));
    b.addEventListener('mouseenter', () => light(b.dataset.fact));
  });
  marks.forEach((m) => m.addEventListener('mouseenter', () => light(m.dataset.fact)));
  document.querySelector('.trace__grid')?.addEventListener('mouseleave', () => light(null));

  // Count-up for result numbers
  const formatNum = (n, decimals) => n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const countUp = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const final = el.textContent;
    const start = performance.now();
    const dur = 1400;
    // Guarantee the real number lands even if animation frames are throttled
    setTimeout(() => { el.textContent = final; }, dur + 150);
    const tick = (t) => {
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + formatNum(target * eased, decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  // Reveal on scroll
  const revealTargets = document.querySelectorAll('.section-head, .pipe, .how__media figure, .record, .story, .principles li, .rcol, .bigquote, .yours__media, .insight__body, .kpis li, .tails li');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    revealTargets.forEach((el) => el.classList.add('reveal'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        e.target.querySelectorAll('[data-count]').forEach(countUp);
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach((el) => io.observe(el));
  }

  // Highlight the current section in the nav
  const links = [...document.querySelectorAll('.nav__links a')];
  const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const so = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${e.target.id}`));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => so.observe(s));
  }
})();
