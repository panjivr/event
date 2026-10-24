/* ============================================================
   Pancasila Creative Works — delight.js
   Micro-interaction & motion. Dipakai situs utama & playbook.

   Patokan dari ui-ux-pro-max:
   - Magnetic hanya 1-2 elemen fokus per layar
   - SplitText hanya judul pendek (<8 kata), teks tetap terbaca
   - Hover tidak boleh jadi satu-satunya umpan balik (ada ripple + toast)
   - Semua mati saat prefers-reduced-motion
   ============================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var raf = function (fn) { return window.requestAnimationFrame(fn); };

  /* ============================================================
     1. (dinonaktifkan) Kursor kustom — diganti fokus-visible terarah
     ============================================================ */

  /* ============================================================
     2. Sorot penjejak di hero
     ============================================================ */
  var hero = document.querySelector('.hero');
  if (hero && fine && !reduce) {
    var glow = document.createElement('div');
    glow.className = 'hero__glow';
    glow.setAttribute('aria-hidden', 'true');
    hero.insertBefore(glow, hero.firstChild);

    var pending = false;
    hero.addEventListener('pointermove', function (e) {
      if (pending) return;
      pending = true;
      raf(function () {
        var r = hero.getBoundingClientRect();
        glow.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 100) + '%');
        glow.style.setProperty('--gy', ((e.clientY - r.top) / r.height * 100) + '%');
        pending = false;
      });
    }, { passive: true });
  }

  /* ============================================================
     3. Tombol magnetik — hanya elemen fokus (maks 2 per layar)
     ============================================================ */
  if (fine && !reduce) {
    Array.prototype.forEach.call(document.querySelectorAll('.magnetic'), function (el) {
      var strength = 0.28;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - r.left - r.width / 2) * strength;
        var dy = (e.clientY - r.top - r.height / 2) * strength;
        el.classList.add('is-magnet');
        el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      });
      el.addEventListener('pointerleave', function () {
        el.classList.remove('is-magnet');
        el.style.transform = '';
      });
    });
  }

  /* ============================================================
     4. Ripple pada tombol — umpan balik klik yang jelas
     ============================================================ */
  if (!reduce) {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.btn') : null;
      if (!btn) return;
      var r = btn.getBoundingClientRect();
      var size = Math.max(r.width, r.height);
      var ink = document.createElement('span');
      ink.className = 'ripple';
      ink.style.width = ink.style.height = size + 'px';
      ink.style.left = (e.clientX - r.left - size / 2) + 'px';
      ink.style.top = (e.clientY - r.top - size / 2) + 'px';
      btn.appendChild(ink);
      setTimeout(function () { ink.remove(); }, 650);
    });
  }

  /* ============================================================
     5. Judul pecah per kata (lalu per huruf di dalam kata)
     Kata dibungkus inline-block => perilaku wrap identik dengan
     teks asli, jadi judul tidak pernah patah di tempat salah.
     ============================================================ */
  if (!reduce) {
    Array.prototype.forEach.call(document.querySelectorAll('.hero__title .line'), function (line, li) {
      var text = line.textContent;
      if (!text || text.length > 40) return;          // hanya judul pendek
      if (line.querySelector('em')) return;           // biarkan penekanan tetap utuh

      var words = text.split(' ');
      var wrap = document.createElement('span');
      wrap.className = 'split';
      var idx = 0;

      words.forEach(function (word, wi) {
        var w = document.createElement('span');
        w.className = 'word';
        Array.prototype.forEach.call(word, function (ch) {
          var s = document.createElement('span');
          s.className = 'ch';
          s.textContent = ch;
          s.style.transitionDelay = (li * 90 + idx * 26) + 'ms';
          idx++;
          w.appendChild(s);
        });
        wrap.appendChild(w);
        if (wi < words.length - 1) {
          wrap.appendChild(document.createTextNode(' '));
        }
      });

      line.textContent = '';
      line.appendChild(wrap);
      setTimeout(function () { wrap.classList.add('is-in'); }, 120 + li * 90);
    });
  }

  /* ============================================================
     6. Tilt halus pada kartu karya (6 kartu, aman untuk JS)
     ============================================================ */
  if (fine && !reduce) {
    Array.prototype.forEach.call(document.querySelectorAll('.card'), function (card) {
      var art = card.querySelector('.card__art');
      if (!art) return;
      var ticking = false;
      card.addEventListener('pointermove', function (e) {
        if (ticking) return;
        ticking = true;
        raf(function () {
          var r = card.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width - 0.5;
          var py = (e.clientY - r.top) / r.height - 0.5;
          art.style.transform =
            'perspective(900px) rotateY(' + (px * 3.2).toFixed(2) + 'deg) ' +
            'rotateX(' + (-py * 3.2).toFixed(2) + 'deg) scale(1.012)';
          ticking = false;
        });
      });
      card.addEventListener('pointerleave', function () {
        art.style.transform = '';
      });
    });
  }

  /* ============================================================
     7. (dinonaktifkan) Konfeti — diganti umpan balik halus di form
     ============================================================ */

  /* ============================================================
     8. Umpan balik filter (toast) — hover tidak jadi satu-satunya
     ============================================================ */
  var toast = null, toastTimer = null;
  document.addEventListener('click', function (e) {
    var f = e.target.closest ? e.target.closest('.filter') : null;
    if (!f) return;
    var label = f.textContent.trim();
    if (!label || label.toLowerCase() === 'semua') return;
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'filter-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = 'Menampilkan: ' + label;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-on'); }, 1800);
  });

  /* ============================================================
     9. Angka statistik "pop" saat selesai menghitung
     ============================================================ */
  document.addEventListener('pcw:count-done', function (e) {
    var el = e.detail;
    if (!el) return;
    el.classList.remove('is-done');
    // paksa reflow agar animasi bisa berulang
    void el.offsetWidth;
    el.classList.add('is-done');
  });

  /* ============================================================
     10. Tombol ke-atas dengan cincin kemajuan (playbook)
     ============================================================ */
  if (document.querySelector('.shell') && !document.querySelector('.totop')) {
    var fab = document.createElement('a');
    fab.className = 'totop';
    fab.href = '#main';
    fab.setAttribute('aria-label', 'Kembali ke atas');
    fab.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '<svg class="totop__ring" viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="19"/></svg>';
    document.body.appendChild(fab);

    var ringSvg = fab.querySelector('.totop__ring circle');
    var C = 2 * Math.PI * 19;
    ringSvg.style.strokeDasharray = C;
    ringSvg.style.strokeDashoffset = C;

    var onScroll = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? Math.min(window.scrollY / h, 1) : 0;
      ringSvg.style.strokeDashoffset = (C * (1 - p)).toFixed(1);
      fab.classList.toggle('is-on', window.scrollY > 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    fab.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      var main = document.getElementById('main');
      if (main) main.focus({ preventScroll: true });
    });
  }
})();
