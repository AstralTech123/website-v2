/* ============================================================
   ASTRAL TECH ADVISORS — main.js
   Particle Canvas · Warp Launch · Shooting Stars · Constellation
   Scroll-Reveal · Navbar · Mobile Menu
   ============================================================ */

'use strict';

/* ── Utilities ── */
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

/* ============================================================
   1. FULL-PAGE BACKGROUND STAR CANVAS
      Gentle twinkling stars visible across every section
   ============================================================ */
(function initBgStars() {
  const canvas = $('#bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, stars = [];
  let t = 0;
  const STAR_COUNT = 120;

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight - 70;
  }

  function createStar() {
    return {
      x:     rnd(0, W),
      y:     rnd(0, H),
      r:     rnd(0.2, 1.1),
      alpha: rnd(0.08, 0.35),
      speed: rnd(0.0002, 0.0009),
      phase: rnd(0, Math.PI * 2),
      drift: rnd(-0.025, 0.025),
      color: Math.random() > 0.87 ? '#06B6D4'
           : Math.random() > 0.93 ? '#C084FC'
           : '#FFFFFF',
    };
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    for (const s of stars) {
      const a = s.alpha * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle   = s.color;
      ctx.beginPath();

      if (s.r > 1.3) {
        /* 4-pointed sparkle for larger stars */
        const len = s.r * 2.5;
        ctx.moveTo(s.x,       s.y - len);
        ctx.lineTo(s.x + 0.5, s.y - 0.5);
        ctx.lineTo(s.x + len, s.y);
        ctx.lineTo(s.x + 0.5, s.y + 0.5);
        ctx.lineTo(s.x,       s.y + len);
        ctx.lineTo(s.x - 0.5, s.y + 0.5);
        ctx.lineTo(s.x - len, s.y);
        ctx.lineTo(s.x - 0.5, s.y - 0.5);
        ctx.closePath();
      } else {
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.restore();

      s.x += s.drift;
      if (s.x < -5) s.x = W + 5;
      if (s.x > W + 5) s.x = -5;
    }

    t++;
    requestAnimationFrame(draw);
  }

  function handleResize() {
    clearTimeout(handleResize._t);
    handleResize._t = setTimeout(() => {
      resize();
      stars = Array.from({ length: STAR_COUNT }, createStar);
    }, 200);
  }

  resize();
  stars = Array.from({ length: STAR_COUNT }, createStar);
  draw();
  window.addEventListener('resize', handleResize);
})();


/* (Hero starfield canvas removed — replaced by background video) */


/* ============================================================
   3. NAVBAR — scroll behaviour & highlight
   ============================================================ */
(function initNavbar() {
  const nav = $('#navbar');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* Highlight active nav link based on section in view */
  const sections = $$('section[id]');
  const navLinks = $$('.nav-links a');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => a.removeAttribute('aria-current'));
        const active = navLinks.find(a => a.getAttribute('href') === '#' + entry.target.id);
        if (active) active.setAttribute('aria-current', 'page');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));
})();


/* ============================================================
   4. MOBILE HAMBURGER MENU
   ============================================================ */
(function initMobileMenu() {
  const btn   = $('#hamburger');
  const links = $('#nav-links');
  if (!btn || !links) return;

  let isOpen = false;

  function toggle() {
    isOpen = !isOpen;
    links.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));

    /* Animate hamburger to X */
    const spans = $$('span', btn);
    if (isOpen) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  }

  btn.addEventListener('click', toggle);

  /* Close when a nav link is clicked */
  $$('a', links).forEach(a => a.addEventListener('click', () => {
    if (isOpen) toggle();
  }));

  /* Close on Escape */
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) toggle(); });
})();


/* ============================================================
   5. SCROLL-REVEAL using IntersectionObserver
   ============================================================ */
(function initScrollReveal() {
  const revealEls = $$('.reveal');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => observer.observe(el));
})();


/* ============================================================
   6. SERVICE DETAIL TOGGLE (accordion)
   ============================================================ */
(function initServiceToggle() {
  const toggles = $$('.service-toggle');
  if (!toggles.length) return;

  toggles.forEach(btn => {
    const detail = btn.parentElement.querySelector('.service-detail');
    if (!detail) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      /* Close all others (accordion) */
      toggles.forEach(other => {
        other.setAttribute('aria-expanded', 'false');
        const od = other.parentElement.querySelector('.service-detail');
        if (od) od.classList.remove('open');
      });

      /* Toggle clicked */
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        detail.classList.add('open');
      }
    });
  });
})();


/* ============================================================
   7. HERO PARALLAX — subtle mouse-track
   ============================================================ */
(function initHeroParallax() {
  const hero = $('.hero');
  const orbs = $$('.hero .orb');
  if (!hero || !orbs.length) return;

  const FACTOR = 18;

  document.addEventListener('mousemove', e => {
    if (window.scrollY > window.innerHeight) return;
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;
    orbs.forEach((orb, i) => {
      const dir = i % 2 === 0 ? 1 : -1;
      orb.style.transform = `translate(${dx * FACTOR * dir}px, ${dy * FACTOR * dir}px)`;
    });
  });
})();


/* ============================================================
   7. CONTACT FORM — client-side submit feedback
   ============================================================ */
(function initContactForm() {
  const form = $('#contact-form');
  const btn  = $('#form-submit-btn');
  if (!form || !btn) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Sending… ⟳';
    btn.disabled = true;
    btn.style.opacity = '0.7';

    /* Simulate network delay (would be replaced with fetch to backend) */
    setTimeout(() => {
      btn.innerHTML = '✓ Message Sent!';
      btn.style.opacity = '1';
      form.reset();
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }, 3000);
    }, 1200);
  });
})();


/* ============================================================
   8. NEWSLETTER FORM — feedback
   ============================================================ */
(function initNewsletter() {
  const form = $('#newsletter-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = $('button', form);
    btn.textContent = '✓ Done!';
    form.reset();
    setTimeout(() => { btn.textContent = 'Sign Up'; }, 3000);
  });
})();
