/* ═══════════════════════════════════════════════
   HEXER · JS
   ═══════════════════════════════════════════════ */

'use strict';

/* ──────────── FORCE START AT HERO ──────────── */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (location.hash) history.replaceState(null, '', location.pathname + location.search);
window.scrollTo(0, 0);
window.addEventListener('load', () => window.scrollTo(0, 0));

/* ──────────── SMOOTH SCROLL ──────────── */
(function initSmoothScroll() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let target = 0;
  let current = 0;
  let running = false;

  window.addEventListener('wheel', (e) => {
    e.preventDefault();
    // Re-sync with the real scroll when idle, so programmatic scrolls
    // (force-start, anchors, ScrollTrigger) aren't undone by a stale target.
    if (!running) { current = target = window.scrollY; }
    target += e.deltaY;
    target = clamp(target, 0, maxScroll());
    if (!running) tick();
  }, { passive: false });

  function maxScroll() {
    return document.documentElement.scrollHeight - window.innerHeight;
  }

  function tick() {
    running = true;
    current += (target - current) * 0.092;
    if (Math.abs(target - current) < 0.4) {
      current = target;
      window.scrollTo(0, current);
      running = false;
      return;
    }
    window.scrollTo(0, current);
    requestAnimationFrame(tick);
  }

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      if (!running) current = window.scrollY;
      target = clamp(
        el.getBoundingClientRect().top + window.scrollY - 80,
        0, maxScroll()
      );
      if (!running) tick();
    });
  });
})();

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

/* ──────────── LOADER ──────────── */
function initLoader() {
  const loader  = document.getElementById('loader');
  const mark    = document.querySelector('.loader-mark');
  const fill    = document.getElementById('loaderFill');
  const tagline = document.querySelector('.loader-tagline');

  const tl = gsap.timeline({
    onComplete() {
      gsap.to(loader, {
        y: '-100%', duration: .9, ease: 'expo.inOut',
        onComplete() {
          loader.style.display = 'none';
          launchSite();
        }
      });
    }
  });

  tl
    .to(mark, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', delay: .25 })
    .to(fill, { width: '100%', duration: 1.3, ease: 'power2.inOut' }, '-=.55')
    .to(tagline, { opacity: 1, y: 0, duration: .6, ease: 'power2.out' }, '-=.85')
    .to({}, { duration: .35 });
}

/* ──────────── SITE LAUNCH ──────────── */
function launchSite() {
  animateOrbs();
  heroReveal();
  initNavbar();
  initCursor();
  initScrollReveal();
  initCardTilt();
  initCounters();
  initRotateWords();
  initMagnetic();
  initTopBar();
  initFAQ();
  initFAB();
  initStepsStack();
  initParallax();

  // ScrollTrigger recalculates layout for the card stack after the loader
  // finishes — re-assert the hero as the starting position so the page never
  // opens mid-page.
  requestAnimationFrame(() => {
    if (window.ScrollTrigger) ScrollTrigger.refresh();
    window.scrollTo(0, 0);
  });
}

/* ──────────── ORBS ──────────── */
function animateOrbs() {
  gsap.to('.orb', {
    opacity: 1, duration: 2.5,
    stagger: .3, ease: 'power2.out'
  });
}

/* ──────────── HERO REVEAL ──────────── */
function heroReveal() {
  document.querySelectorAll('.reveal-hero').forEach(el => {
    const delay = parseInt(el.dataset.delay || 0) / 1000;
    gsap.fromTo(el,
      { opacity: 0, y: 22 },
      { opacity: 1, y: 0, duration: .9, ease: 'expo.out', delay: delay + .1 }
    );
  });
}

/* ──────────── NAVBAR ──────────── */
function initNavbar() {
  const nav    = document.getElementById('navbar');
  const topBar = document.getElementById('topBar');
  let topBarH  = topBar ? topBar.offsetHeight : 0;

  const updateNav = () => {
    const scrolled = window.scrollY > 56;
    nav.classList.toggle('scrolled', scrolled);
    if (topBar && !topBar.classList.contains('hidden')) {
      nav.style.top = topBarH + 'px';
    } else {
      nav.style.top = '0px';
    }
  };

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();
}

/* ──────────── TOP BAR ──────────── */
function initTopBar() {
  const bar   = document.getElementById('topBar');
  const close = document.getElementById('topBarClose');
  const nav   = document.getElementById('navbar');
  if (!bar || !close) return;

  close.addEventListener('click', () => {
    bar.classList.add('hidden');
    if (nav) nav.style.top = '0px';
  });
}

/* ──────────── CUSTOM CURSOR ──────────── */
function initCursor() {
  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursorRing');
  if (!cursor) return;

  let mx = -100, my = -100;
  let rx = -100, ry = -100;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  gsap.ticker.add(() => {
    gsap.set(cursor, { x: mx, y: my });
    rx += (mx - rx) * .14;
    ry += (my - ry) * .14;
    gsap.set(ring, { x: rx, y: ry });
  });

  const hoverEls = 'a, button, .card, .btn-primary, .btn-ghost, .nav-cta, .depo-card, .faq-question, .sistema-card, .resultado-item, .step-card, .sobre-card';
  document.querySelectorAll(hoverEls).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  document.addEventListener('mouseleave', () => {
    gsap.to([cursor, ring], { opacity: 0, duration: .3 });
  });
  document.addEventListener('mouseenter', () => {
    gsap.to([cursor, ring], { opacity: 1, duration: .3 });
  });
}

/* ──────────── SCROLL REVEAL ──────────── */
function initScrollReveal() {
  const options = { threshold: .1, rootMargin: '0px 0px -50px 0px' };

  const srObs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el    = en.target;
      const delay = parseInt(el.dataset.delay || 0);
      setTimeout(() => el.classList.add('visible'), delay);
      srObs.unobserve(el);
    });
  }, options);

  document.querySelectorAll('.sr, .sr-card').forEach(el => srObs.observe(el));
}

/* ──────────── 3D CARD TILT ──────────── */
function initCardTilt() {
  const tiltEls = document.querySelectorAll('.card, .depo-card, .sistema-card, .resultado-item');

  tiltEls.forEach(el => {
    el.addEventListener('mousemove', e => {
      const r  = el.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
      const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
      gsap.to(el, {
        rotateX: -dy * 6,
        rotateY:  dx * 6,
        transformPerspective: 900,
        ease: 'power1.out',
        duration: .4
      });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, { rotateX: 0, rotateY: 0, duration: .7, ease: 'elastic.out(1,.5)' });
    });
  });
}

/* ──────────── COUNTER ANIMATION ──────────── */
function initCounters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el     = en.target;
      const target = parseInt(el.dataset.target);
      const dur    = 1800;
      const start  = performance.now();
      const easeOut = t => 1 - Math.pow(1 - t, 3);

      const update = now => {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.round(easeOut(p) * target);
        if (p < 1) requestAnimationFrame(update);
      };
      requestAnimationFrame(update);
      obs.unobserve(el);
    });
  }, { threshold: .5 });

  document.querySelectorAll('.count, .count-r').forEach(el => obs.observe(el));
}

/* ──────────── ROTATING HIGHLIGHT WORDS ──────────── */
function initRotateWords() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const setup = () => {
    document.querySelectorAll('.rotate').forEach(el => {
      const words = (el.dataset.words || '').split(',').map(w => w.trim()).filter(Boolean);
      if (!words.length) return;
      const interval = parseInt(el.dataset.interval, 10) || 2500;

      // Build word nodes (replaces the static fallback word)
      el.innerHTML = '';
      const nodes = words.map(w => {
        const s = document.createElement('span');
        s.className = 'rw';
        s.textContent = w;
        s.setAttribute('aria-hidden', 'true');   // only the active word is exposed
        el.appendChild(s);
        return s;
      });

      const show = (n) => { n.classList.add('active'); n.removeAttribute('aria-hidden'); };

      // Measure each word's real width (fonts already loaded → no clipping)
      el.classList.add('init', 'js-ready');
      nodes.forEach(n => { n._w = n.offsetWidth; });

      let cur = 0;
      show(nodes[0]);
      el.style.width = nodes[0]._w + 'px';
      void el.offsetWidth;            // force reflow
      el.classList.remove('init');

      if (reduce) return;             // static first word, no cycling

      setInterval(() => {
        const prev = cur;
        cur = (cur + 1) % nodes.length;

        // Hold the container at least as wide as the outgoing word so it is
        // never clipped horizontally mid-transition (prevents stray rectangles).
        el.style.width = Math.max(nodes[prev]._w, nodes[cur]._w) + 'px';

        nodes[prev].classList.remove('active');   // old rises and fades out
        nodes[prev].classList.add('exit');
        nodes[prev].setAttribute('aria-hidden', 'true');
        show(nodes[cur]);                          // new enters from below (150ms delay via CSS)

        setTimeout(() => {
          nodes[prev].classList.remove('exit');
          el.style.width = nodes[cur]._w + 'px';   // settle snug to the new word
        }, 360);
      }, interval);
    });
  };

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(setup);
  else setup();
}

/* ──────────── MAGNETIC BUTTONS ──────────── */
function initMagnetic() {
  document.querySelectorAll('.btn-primary, .nav-cta').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r  = el.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) * .28;
      const dy = (e.clientY - r.top  - r.height / 2) * .28;
      gsap.to(el, { x: dx, y: dy, duration: .45, ease: 'power2.out' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: .7, ease: 'elastic.out(1,.55)' });
    });
  });
}

/* ──────────── PROCESSO · CARD STACK ON SCROLL ──────────── */
function initStepsStack() {
  if (window.matchMedia('(max-width: 768px)').matches) return;

  const wrap  = document.getElementById('stepsPinWrap');
  const cards = gsap.utils.toArray('.step-card');
  if (!wrap || cards.length < 2) return;

  gsap.registerPlugin(ScrollTrigger);
  gsap.set(cards.slice(1), { y: '110vh' });

  ScrollTrigger.create({
    trigger: wrap,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate(self) {
      const n     = cards.length;
      const total = self.progress * (n - 1);

      cards.forEach((card, i) => {
        if (i > 0) {
          const enter = clamp(total - (i - 1), 0, 1);
          gsap.set(card, { y: (1 - enter) * 110 + 'vh' });
        }
        if (i < n - 1) {
          const dim = clamp(total - i, 0, 1);
          gsap.set(card, {
            scale: 1 - dim * .07,
            opacity: 1 - dim * .45,
            filter: `brightness(${1 - dim * .25})`
          });
        }
      });
    }
  });
}

/* ──────────── PARALLAX SCROLLING ──────────── */
function initParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const heroST = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };

  // Hero depth: the decorative background lags behind while the content lifts
  // and fades out — classic scroll parallax. Both targets are transform-free in
  // CSS, so they don't fight the orb breathing/mousemove animations.
  gsap.to('.hero-bg', { yPercent: 28, ease: 'none', scrollTrigger: heroST });
  gsap.to('.hero-content', { yPercent: -14, opacity: .2, ease: 'none', scrollTrigger: heroST });

  // CTA section: decorative orb drifts as the section passes through the viewport.
  gsap.to('.cta-orb-2', {
    yPercent: 30, ease: 'none',
    scrollTrigger: { trigger: '.cta-final', start: 'top bottom', end: 'bottom top', scrub: true }
  });

  // Generic opt-in: any element with data-parallax="N" drifts ±N% as it scrolls
  // through the viewport (positive N enters from below, exits upward).
  gsap.utils.toArray('[data-parallax]').forEach(el => {
    const amount = parseFloat(el.dataset.parallax) || 12;
    gsap.fromTo(el,
      { yPercent: amount },
      {
        yPercent: -amount, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
      }
    );
  });
}

/* ──────────── FAQ ACCORDION ──────────── */
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');

  items.forEach(item => {
    const btn    = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Close all
      items.forEach(i => {
        const b = i.querySelector('.faq-question');
        const a = i.querySelector('.faq-answer');
        if (b && a) {
          b.setAttribute('aria-expanded', 'false');
          a.classList.remove('open');
        }
      });

      // Open clicked if it was closed
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        answer.classList.add('open');
      }
    });
  });
}

/* ──────────── FLOATING WHATSAPP BUTTON ──────────── */
function initFAB() {
  const fab = document.querySelector('.fab-wa');
  if (!fab) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      fab.classList.toggle('visible', !en.isIntersecting);
    });
  }, { threshold: .5 });

  const hero = document.getElementById('hero');
  if (hero) obs.observe(hero);
}

/* ──────────── ORB PARALLAX ──────────── */
document.addEventListener('mousemove', e => {
  const cx = window.innerWidth  / 2;
  const cy = window.innerHeight / 2;
  const dx = (e.clientX - cx) / cx;
  const dy = (e.clientY - cy) / cy;
  gsap.to('.orb-2', { x: dx *  28, y: dy *  28, duration: 2.4, ease: 'power1.out' });
  gsap.to('.orb-3', { x: dx * -14, y: dy *  16, duration: 2.0, ease: 'power1.out' });
});

/* ──────────── MOBILE MENU ──────────── */
function initMobileMenu() {
  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('mobileMenu');
  if (!toggle || !menu) return;

  const close = () => {
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
    menu.setAttribute('aria-hidden', 'true');
  };
  const open = () => {
    document.body.classList.add('menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fechar menu');
    menu.setAttribute('aria-hidden', 'false');
  };

  toggle.addEventListener('click', () => {
    document.body.classList.contains('menu-open') ? close() : open();
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  // Close if resizing back up to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) close();
  });
}

/* ──────────── BOOT ──────────── */
window.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initMobileMenu();
});
