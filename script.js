/* ═══════════════════════════════════════════════════════════
   HEXER · JS v2.0
   Assinatura "Blueprint → Construído".
   Regra: motion serve clareza e confiança. Anima uma vez.
   Só transform e opacity. GSAP/ScrollTrigger apenas onde o
   scroll comanda (timeline do método, marquee).
   ═══════════════════════════════════════════════════════════ */

'use strict';

const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ──────────── LOADER (intro) ────────────
   Cobre a tela em lime, revela o logo + barra de progresso e sobe.
   A entrada do hero fica pausada (CSS) até o loader terminar.        */
(function initLoader() {
  const root = document.documentElement;
  const loader = document.getElementById('loader');
  if (!loader) { root.classList.remove('is-loading'); return; }

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    loader.classList.add('done');            // sobe (translateY -100%)
    root.classList.remove('is-loading');     // libera a animação do hero
    loader.addEventListener('transitionend', () => { loader.style.display = 'none'; }, { once: true });
  };

  if (REDUCE) { loader.style.display = 'none'; root.classList.remove('is-loading'); return; }

  setTimeout(finish, 1850);   // conclui após a barra encher
  setTimeout(finish, 3200);   // trava de segurança
})();

/* ──────────── NAVBAR ──────────── */
(function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  const update = () => nav.classList.toggle('scrolled', window.scrollY > 24);
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ──────────── MOBILE MENU ──────────── */
(function initMobileMenu() {
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('mobileMenu');
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

  toggle.addEventListener('click', () =>
    document.body.classList.contains('menu-open') ? close() : open());
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 768) close(); });
})();

/* ──────────── REVEAL + BLUEPRINT BUILD (uma vez) ────────────
   .sr        → fade + translateY(24px)
   .draw-card → traço de planta (dash-offset) e depois o preenchimento
   .section-h2 (dentro de .sr) → sublinha lime se desenha              */
(function initReveal() {
  const els = document.querySelectorAll('.sr, .draw-card');
  if (!('IntersectionObserver' in window) || REDUCE) {
    els.forEach(el => el.classList.add('visible', 'built'));
    return;
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('visible', 'built');
      obs.unobserve(en.target);          // anima UMA vez, sem re-trigger
    });
  }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => obs.observe(el));
})();

/* ──────────── TIMELINE DO MÉTODO · palco da assinatura ────────────
   A linha se constrói conforme o scroll; cada etapa "acende" quando
   o preenchimento alcança o seu nó (inativa = traço, ativa = lime). */
(function initMetodo() {
  const wrap = document.getElementById('mtWrap');
  const fill = document.getElementById('mtFill');
  if (!wrap || !fill) return;

  const steps = Array.from(wrap.querySelectorAll('.mt-step'));

  // 1) reveal — cada etapa aparece conforme entra na viewport
  if ('IntersectionObserver' in window && !REDUCE) {
    const revObs = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        revObs.unobserve(en.target);
      });
    }, { threshold: .2, rootMargin: '0px 0px -60px 0px' });
    steps.forEach(s => revObs.observe(s));
  } else {
    steps.forEach(s => s.classList.add('in'));
  }

  // sem GSAP / reduced motion: mostra tudo pronto
  if (REDUCE || !window.gsap || !window.ScrollTrigger) {
    steps.forEach(s => s.classList.add('active', 'in'));
    fill.style.transform = 'scaleY(1)';
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // 2) trilho que se constrói no scroll + nós que acendem ao serem alcançados
  ScrollTrigger.create({
    trigger: wrap,
    start: 'top 72%',
    end: 'bottom 55%',
    scrub: .6,
    onUpdate(self) {
      gsap.set(fill, { scaleY: self.progress });
      const railTop = wrap.getBoundingClientRect().top;
      const railH = wrap.offsetHeight;
      const reachY = railTop + railH * self.progress;
      steps.forEach(step => {
        const node = step.querySelector('.mt-node');
        const nodeY = node.getBoundingClientRect().top + 8;
        step.classList.toggle('active', reachY >= nodeY);
      });
    }
  });

  // 3) parallax sutil no card (profundidade) — roda no .mt-card, enquanto o
  //    reveal roda no <li> pai e o hover usa só sombra/borda: nada colide.
  if (!window.matchMedia('(max-width: 768px)').matches) {
    steps.forEach(step => {
      const card = step.querySelector('.mt-card');
      gsap.fromTo(card, { y: 26 }, {
        y: -26, ease: 'none',
        scrollTrigger: { trigger: step, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }
})();

/* ──────────── MARQUEE · loop com aceleração suave no scroll ──────────── */
(function initMarquee() {
  const track = document.getElementById('marqueeTrack');
  if (!track || REDUCE || !window.gsap) return; // fallback: animação CSS

  track.classList.add('js-driven');

  const half = () => track.scrollWidth / 2;
  let x = 0;
  let speed = .55;              // px/frame base
  let boost = 0;                // aceleração vinda do scroll
  let hover = false;
  let lastY = window.scrollY;

  track.closest('.marquee-strip').addEventListener('mouseenter', () => { hover = true; });
  track.closest('.marquee-strip').addEventListener('mouseleave', () => { hover = false; });

  window.addEventListener('scroll', () => {
    const dy = Math.abs(window.scrollY - lastY);
    lastY = window.scrollY;
    boost = Math.min(boost + dy * .02, 2.2);
  }, { passive: true });

  gsap.ticker.add(() => {
    boost *= .94;                                  // decai suavemente
    const target = hover ? .08 : speed + boost;    // pausa suave no hover
    x -= target;
    const h = half();
    if (h > 0 && -x >= h) x += h;
    gsap.set(track, { x });
  });
})();

/* ──────────── FAQ · abre/fecha com height animada ──────────── */
(function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      items.forEach(i => {
        const b = i.querySelector('.faq-question');
        const a = i.querySelector('.faq-answer');
        if (b && a) { b.setAttribute('aria-expanded', 'false'); a.classList.remove('open'); }
      });
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        answer.classList.add('open');
      }
    });
  });
})();

/* ──────────── FAB WHATSAPP · aparece após 50% de scroll ──────────── */
(function initFAB() {
  const fab = document.getElementById('fabWa');
  if (!fab) return;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    fab.classList.toggle('visible', max > 0 && window.scrollY / max >= .5);
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
})();
