/**
 * VELION MALL — script.js
 * Pure vanilla JS / No frameworks
 */

'use strict';

/* ================================================================
   Utility
================================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ================================================================
   1. Navigation — Scroll & Hamburger
================================================================ */
(function initNav() {
  const nav       = $('#nav');
  const hamburger = $('#hamburger');
  const mobileMenu = $('#mobileMenu');
  const mobileLinks = $$('.nav__mobile-link');

  /* Scroll state */
  let lastScrollY = window.scrollY;

  function onScroll() {
    const y = window.scrollY;
    if (y > 48) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
    lastScrollY = y;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // init

  /* Hamburger toggle */
  function openMenu() {
    hamburger.classList.add('is-open');
    mobileMenu.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('is-open');
    mobileMenu.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    if (hamburger.classList.contains('is-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  /* Close on mobile link click */
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  /* Close on outside click */
  document.addEventListener('click', (e) => {
    if (mobileMenu.classList.contains('is-open') &&
        !mobileMenu.contains(e.target) &&
        !hamburger.contains(e.target)) {
      closeMenu();
    }
  });

  /* Close on Escape */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
      closeMenu();
      hamburger.focus();
    }
  });
})();

/* ================================================================
   2. Smooth Scroll for nav links
================================================================ */
(function initSmoothScroll() {
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = $(href);
      if (!target) return;
      e.preventDefault();

      const navHeight = 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ================================================================
   3. Intersection Observer — Scroll Reveal
================================================================ */
(function initReveal() {
  const options = {
    root: null,
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.12,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, options);

  $$('.reveal').forEach(el => observer.observe(el));

  /* Floor building floors — special reveal */
  const floorOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.3,
  };

  const floorObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        $$('.floor__building-floor').forEach(floor => {
          floor.classList.add('is-visible');
        });
        floorObserver.disconnect();
      }
    });
  }, floorOptions);

  const buildingEl = $('.floor__building');
  if (buildingEl) floorObserver.observe(buildingEl);
})();

/* ================================================================
   4. Hero Particles
================================================================ */
(function initParticles() {
  const container = $('#particles');
  if (!container) return;

  const count = 40;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');

    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const size = Math.random() * 2.5 + 1;
    const dur  = (Math.random() * 4 + 3).toFixed(2);
    const delay = (Math.random() * 6).toFixed(2);

    p.style.cssText = `
      left: ${x}%;
      top: ${y}%;
      width: ${size}px;
      height: ${size}px;
      --dur: ${dur}s;
      --delay: ${delay}s;
    `;

    container.appendChild(p);
  }
})();

/* ================================================================
   5. Countdown Timer
================================================================ */
(function initCountdown() {
  const cdDays    = $('#cd-days');
  const cdHours   = $('#cd-hours');
  const cdMinutes = $('#cd-minutes');
  const cdSeconds = $('#cd-seconds');

  if (!cdDays) return;

  // Grand opening: 2026-04-05 00:00:00 JST (UTC+9)
  const targetDate = new Date('2026-04-05T00:00:00+09:00');

  function pad(n) {
    return String(Math.max(0, n)).padStart(2, '0');
  }

  function animateNumber(el, newVal) {
    if (el.dataset.val === newVal) return;
    el.dataset.val = newVal;

    el.style.transform = 'translateY(-4px)';
    el.style.opacity   = '0.4';
    el.style.transition = 'transform .15s ease, opacity .15s ease';

    requestAnimationFrame(() => {
      setTimeout(() => {
        el.textContent = newVal;
        el.style.transform = 'translateY(0)';
        el.style.opacity   = '1';
      }, 150);
    });
  }

  function tick() {
    const now  = new Date();
    const diff = targetDate - now;

    if (diff <= 0) {
      // Already opened
      [cdDays, cdHours, cdMinutes, cdSeconds].forEach(el => {
        el.textContent = '00';
      });
      const label = $('.countdown__label');
      if (label) label.textContent = 'GRAND OPEN — TODAY!';
      return;
    }

    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    animateNumber(cdDays,    pad(days));
    animateNumber(cdHours,   pad(hours));
    animateNumber(cdMinutes, pad(minutes));
    animateNumber(cdSeconds, pad(seconds));
  }

  tick();
  setInterval(tick, 1000);
})();

/* ================================================================
   6. Shop Filter (Tabs)
================================================================ */
(function initShopFilter() {
  const tabs  = $$('.shops__tab');
  const cards = $$('.shop-card');

  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const filter = this.dataset.filter;

      /* Update active tab */
      tabs.forEach(t => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      this.classList.add('is-active');
      this.setAttribute('aria-selected', 'true');

      /* Filter cards */
      cards.forEach(card => {
        const cat = card.dataset.category;

        if (filter === 'all' || cat === filter) {
          card.classList.remove('is-hidden');
          /* Re-trigger reveal animation */
          card.classList.remove('is-visible');
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              card.classList.add('is-visible');
            });
          });
        } else {
          card.classList.add('is-hidden');
        }
      });
    });
  });
})();

/* ================================================================
   7. Floor Guide — Hover Sync
================================================================ */
(function initFloorSync() {
  const floorItems    = $$('.floor__item');
  const buildingFloors = $$('.floor__building-floor');

  /* Map floor data attribute to building floor index */
  const floorMap = {
    'b1': 6,
    '1':  5,
    '2':  4,
    '3':  3,
    '4':  2,
    '5':  1,
    '6':  0,
  };

  floorItems.forEach(item => {
    const floorKey = String(item.dataset.floor);

    item.addEventListener('mouseenter', () => {
      const idx = floorMap[floorKey];
      if (idx === undefined) return;

      buildingFloors.forEach((bf, i) => {
        bf.classList.toggle('is-active', i === idx);
      });
    });

    item.addEventListener('mouseleave', () => {
      buildingFloors.forEach(bf => bf.classList.remove('is-active'));
    });
  });
})();

/* ================================================================
   8. Page Top Button
================================================================ */
(function initPageTop() {
  const btn = $('#pageTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('is-visible');
    } else {
      btn.classList.remove('is-visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ================================================================
   9. Active Nav Link (Intersection)
================================================================ */
(function initActiveNav() {
  const sections  = $$('section[id]');
  const navLinks  = $$('.nav__link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          link.classList.toggle('is-active', href === `#${id}`);
        });
      }
    });
  }, {
    rootMargin: '-40% 0px -50% 0px',
    threshold: 0,
  });

  sections.forEach(sec => observer.observe(sec));
})();

/* ================================================================
   10. Hero title — stagger letter animation on load
================================================================ */
(function initHeroLetters() {
  const mainTitle = $('.hero__title-main');
  if (!mainTitle) return;

  const text = mainTitle.textContent;
  mainTitle.innerHTML = text.split('').map((ch, i) => {
    const delay = (i * 0.06 + 0.3).toFixed(2);
    return `<span style="display:inline-block; opacity:0; transform:translateY(20px); animation: letterIn .6s ${delay}s forwards cubic-bezier(0,.75,.4,1)">${ch}</span>`;
  }).join('');

  /* Inject keyframe if not present */
  if (!$('#hero-letter-style')) {
    const style = document.createElement('style');
    style.id = 'hero-letter-style';
    style.textContent = `
      @keyframes letterIn {
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }
})();

/* ================================================================
   11. Reveal hero content on DOMContentLoaded
================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  /* Trigger hero reveals immediately (not waiting for scroll) */
  const heroReveals = $$('.hero .reveal');
  heroReveals.forEach((el, i) => {
    const delay = (i * 0.18 + 0.1).toFixed(2);
    el.style.transitionDelay = `${delay}s`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.classList.add('is-visible');
      });
    });
  });
});
