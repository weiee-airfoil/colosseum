/* Colosseum — page behaviour. Deliberately small: the design does the work. */
(function () {
  'use strict';

  /* Mobile navigation */
  var burger = document.querySelector('.masthead__burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.getAttribute('data-open') === 'true';
      nav.setAttribute('data-open', String(!open));
      burger.setAttribute('aria-expanded', String(!open));
      burger.textContent = open ? 'Menu' : 'Close';
    });
  }

  /* Staggered reveal on scroll */
  var targets = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    targets.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        // Stagger within a batch so a grid resolves as a wave, not a flash.
        entry.target.style.transitionDelay = Math.min(i * 55, 330) + 'ms';
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* Countdown, where a page has one. Counts to the close of submissions. */
  var units = document.querySelectorAll('[data-count]');
  if (units.length) {
    // These are design comps, so the clock is anchored relative to page load
    // rather than to a fixed date — otherwise every screen reads 00:00:00:00
    // the moment the season passes. Swap this for the real deadline on build.
    var deadline = Date.now() + ((40 * 24 + 18) * 60 + 52) * 60000 + 9000;
    var pad = function (n) { return String(Math.max(0, n)).padStart(2, '0'); };
    var tick = function () {
      var left = Math.max(0, deadline - Date.now());
      var s = Math.floor(left / 1000);
      var map = {
        days: Math.floor(s / 86400),
        hours: Math.floor(s / 3600) % 24,
        mins: Math.floor(s / 60) % 60,
        secs: s % 60
      };
      units.forEach(function (el) {
        var v = map[el.getAttribute('data-count')];
        if (v !== undefined) el.textContent = pad(v);
      });
    };
    tick();
    setInterval(tick, 1000);
  }
})();
