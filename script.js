/* ============================================================
   Pancasila Creative Works — interactions
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- nav stuck state + scroll progress ---------- */
  var nav = document.getElementById('nav');
  var progress = document.getElementById('progress');

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle('is-stuck', y > 24);

    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var pct = h > 0 ? (y / h) * 100 : 0;
      progress.style.width = Math.min(100, Math.max(0, pct)) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById('burger');
  var links = document.getElementById('navLinks');

  function closeMenu() {
    if (!links || !burger) return;
    links.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (burger && links) {
    burger.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });

    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });

    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---------- reveal on scroll ---------- */
  var revealables = document.querySelectorAll('.reveal, [data-reveal]');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var parent = el.parentElement;
        var siblings = parent ? Array.prototype.filter.call(
          parent.children,
          function (c) { return c.classList.contains('reveal') || c.hasAttribute('data-reveal'); }
        ) : [];
        var idx = siblings.indexOf(el);
        var delay = idx > 0 ? Math.min(idx * 80, 320) : 0;
        el.style.transitionDelay = delay + 'ms';
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---------- animated counters ---------- */
  var counters = document.querySelectorAll('[data-count]');

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduceMotion) {
      el.textContent = target + suffix;
      return;
    }
    var start = null;
    var duration = 1500;

    function tick(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else {
        el.textContent = target + suffix;
        document.dispatchEvent(new CustomEvent('pcw:count-done', { detail: el }));
      }
    }
    requestAnimationFrame(tick);
  }

  if (counters.length) {
    if (!('IntersectionObserver' in window)) {
      counters.forEach(animateCount);
    } else {
      var co = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            co.unobserve(entry.target);
          }
        });
      }, { threshold: 0.25, rootMargin: '0px 0px -5% 0px' });

      counters.forEach(function (c) {
        var box = c.getBoundingClientRect();
        if (box.top < window.innerHeight && box.bottom > 0) {
          animateCount(c);
        } else {
          co.observe(c);
        }
      });
    }
  }

  /* ---------- portfolio filter ---------- */
  var filterButtons = document.querySelectorAll('.filter');
  var cards = document.querySelectorAll('#worksGrid .card');

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterButtons.forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');

      var key = btn.getAttribute('data-filter');
      cards.forEach(function (card) {
        var match = key === 'all' || card.getAttribute('data-cat') === key;
        if (match) {
          card.classList.remove('is-hidden');
          card.style.opacity = '0';
          card.style.transform = 'translateY(14px)';
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              card.style.opacity = '1';
              card.style.transform = 'none';
            });
          });
        } else {
          card.classList.add('is-hidden');
        }
      });
    });
  });

  /* ---------- brief form ---------- */
  var form = document.getElementById('briefForm');
  var note = document.getElementById('formNote');
  var summary = document.getElementById('formSummary');
  var summaryList = document.getElementById('formSummaryList');

  function fieldError(field) {
    var value = (field.value || '').trim();
    if (!value) return 'wajib';
    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      return 'email';
    }
    return null;
  }

  var MESSAGES = {
    nama: 'Nama wajib diisi.',
    email: 'Masukkan alamat email yang valid.',
    jenis: 'Pilih salah satu jenis acara.',
    tanggal: 'Masukkan perkiraan tanggal.',
    pesan: 'Ceritakan ringkasan acara Anda.'
  };

  function markError(field, on) {
    var wrap = field.closest('.field');
    if (wrap) wrap.classList.toggle('has-error', on);
    var err = field.getAttribute('aria-describedby');
    var el = err ? document.getElementById(err.split(' ')[0]) : null;
    if (el && el.classList.contains('field__err')) el.hidden = !on;
    if (on) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
  }

  if (form) {
    form.querySelectorAll('input, select, textarea').forEach(function (field) {
      field.addEventListener('input', function () { markError(field, false); });
      field.addEventListener('change', function () { markError(field, false); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var fields = form.querySelectorAll('input, select, textarea');
      var invalid = [];
      var firstInvalid = null;

      fields.forEach(function (field) {
        var bad = !!fieldError(field);
        markError(field, bad);
        if (bad) {
          invalid.push(field);
          if (!firstInvalid) firstInvalid = field;
        }
      });

      // error summary (focusable, linked to fields) — WCAG 2.2 focusable error summary
      if (invalid.length) {
        summaryList.innerHTML = '';
        invalid.forEach(function (field) {
          var li = document.createElement('li');
          var a = document.createElement('a');
          a.href = '#' + field.id;
          a.textContent = MESSAGES[field.id] || 'Kolom ini perlu diperiksa.';
          a.addEventListener('click', function (ev) {
            ev.preventDefault();
            field.focus();
          });
          li.appendChild(a);
          summaryList.appendChild(li);
        });
        summary.hidden = false;

        if (note) {
          note.textContent = 'Terdapat ' + invalid.length + ' kolom yang perlu diperiksa.';
          note.style.color = '#FCA5A5';
        }
        summary.focus();
        return;
      }

      summary.hidden = true;

      var btn = form.querySelector('button[type="submit"] span');
      var original = btn ? btn.textContent : '';
      if (btn) btn.textContent = 'Mengirim…';

      // Demo submit — sambungkan ke endpoint/CRM Anda di sini.
      setTimeout(function () {
        if (btn) btn.textContent = 'Terkirim ✓';
        if (note) {
          note.textContent = 'Terima kasih. Kami akan membalas dalam dua hari kerja.';
          note.style.color = '';
        }
        form.reset();
        document.dispatchEvent(new CustomEvent('pcw:brief-sent'));
        setTimeout(function () {
          if (btn) btn.textContent = original;
        }, 3200);
      }, 700);
    });
  }

  /* ---------- year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- subtle parallax on hero arch ---------- */
  if (!reduceMotion) {
    var arch = document.querySelector('.arch');
    var seal = document.querySelector('.seal');
    var heroVisual = document.querySelector('.hero__visual');

    if (arch && heroVisual) {
      window.addEventListener('scroll', function () {
        var y = window.scrollY || window.pageYOffset;
        if (y > 900) return;
        var shift = y * 0.06;
        arch.style.transform = 'translateY(' + shift + 'px)';
        if (seal) seal.style.transform = 'translateY(' + (shift * -0.5) + 'px)';
      }, { passive: true });
    }
  }
})();
