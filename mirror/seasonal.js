/* احتفال عيد الاتحاد الـ55: مؤقت حتى 25 نوفمبر 2026 ثم يختفي وحده. لا حركة ولا صوت ولا نوافذ أثناء الحل. */
(function () {
  'use strict';
  var END = Date.UTC(2026, 10, 25, 20, 0, 0);   /* 26 نوفمبر 2026 00:00 بتوقيت الإمارات */
  if (Date.now() >= END) return;
  var parts = location.pathname.replace(/\/index\.html?$/i, '/').split('/').filter(Boolean);
  var GR = /^g1[12]-[a-z-]+$/.test(parts[0] || '') ? parts[0] : '';
  var SC = 'tmn-sc', HD = 'tmn-honor-done', PG = 'tmn-prog';

  function lsGet(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }

  var css = document.createElement('style');
  css.textContent =
    '.uae-strip{height:4px;background:linear-gradient(90deg,#E4002B 0 22%,#00732F 22% 48%,#fff 48% 74%,#000 74% 100%);box-shadow:inset 0 -1px 0 #D5DCE8}' +
    '.uae-line{direction:rtl;margin:0;padding:6px 16px;text-align:center;font-size:13px;line-height:1.5;color:#5A6472;background:#fff;border-bottom:1px solid #D5DCE8}' +
    '.uae-line b{color:#0E1C3A}' +
    '.uae-next{direction:rtl;margin:12px 0 0;padding:10px 14px;border:1.5px solid #D4A843;border-inline-start-width:5px;border-radius:12px;background:#FFF7E2;color:#0E1C3A;font-size:15px;line-height:1.7;text-align:right}' +
    '.uae-next a{display:inline-block;margin-top:4px;font-weight:800;color:#0E1C3A;text-decoration:underline;text-underline-offset:3px}' +
    '@media print{.uae-strip,.uae-line,.uae-next{display:none!important}}';
  document.head.appendChild(css);

  /* شريط الاتحاد الرفيع (4 بكسل) وسطر واحد صغير في صفحات الصفوف فقط */
  function decorate() {
    if (document.querySelector('.uae-strip')) return;
    var s = el('div', 'uae-strip'); s.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(s, document.body.firstChild);
    if (parts.length === 1 && /^g1[12]-(general|advanced)$/.test(parts[0])) {
      var p = el('p', 'uae-line');
      p.innerHTML = 'عيد الاتحاد الـ<bdi dir="ltr">55</bdi> يقترب • <b>استعد لاختبار الرياضيات بثقة</b>';
      var top = document.querySelector('.tmn-strip');
      if (top && top.parentNode) top.parentNode.insertBefore(p, top.nextSibling); else s.parentNode.insertBefore(p, s.nextSibling);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', decorate); else decorate();
  window.addEventListener('load', function () {
    var s = document.querySelector('.uae-strip');
    if (s && s.parentNode === document.body && document.body.firstChild !== s) document.body.insertBefore(s, document.body.firstChild);
  });

  /* ---------- الشهادة: طبعة الاتحاد (تُستدعى من nav.js داخل رسم الشهادة) ---------- */
  function cert(x, W, H, font) {
    var cols = ['#E4002B', '#00732F', '#FFFFFF', '#000000'], x0 = 74, w = W - 148, wt = [0.22, 0.26, 0.26, 0.26], cx = x0;
    for (var i = 0; i < 4; i++) { x.fillStyle = cols[i]; x.fillRect(cx, 64, w * wt[i], 9); cx += w * wt[i]; }
    x.save(); x.direction = 'rtl'; x.textAlign = 'center';
    x.fillStyle = '#F0CD78'; x.font = '700 27px ' + font;
    x.fillText('احتفالاً بعيد الاتحاد الـ55', W / 2, 100, W - 240);
    x.restore();
  }

  /* ---------- «خطوتك التالية» على بطاقة النتيجة ---------- */
  function done(k) {
    var hd = (lsGet(HD) || {})[GR] || {}, pr = (lsGet(PG) || {})[GR] || {};
    if (pr[k] === -1) return false;
    return pr[k] > 0 || !!hd['/' + GR + '/band-' + k + '/'];
  }
  function box(card, row, html, href, ev) {
    var d = el('div', 'uae-next'); d.setAttribute('role', 'note');
    var t = el('span'); t.innerHTML = html; d.appendChild(t);
    if (href) {
      d.appendChild(document.createElement('br'));
      var a = el('a', '', href[1]); a.href = href[0]; a.setAttribute('data-umami-event', 'uae-next'); a.setAttribute('data-umami-event-kind', ev || '');
      d.appendChild(a);
    }
    card.insertBefore(d, row && row.parentNode === card ? row : null);
  }
  function nextBand(gr, n, mine, cb) {
    var k = n + 1, tries = 0;
    (function step() {
      while (k <= n + 40 && done(k)) k++;
      if (k > n + 40 || tries > 5) return cb(null);
      var cand = k; tries++; k++;
      fetch('/' + gr + '/band-' + cand + '/', { method: 'HEAD', cache: 'force-cache' })
        .then(function (r) { if (r.ok) cb(cand); else step(); }).catch(function () { cb(null); });
    })();
  }
  function weakest(mine, lo, hi, skip) {
    var best = null;
    Object.keys(mine).forEach(function (p) {
      var m = p.match(/\/band-(\d+)\/$/); if (!m) return;
      var k = +m[1], v = mine[p] && mine[p].pct;
      if (k === skip || k < lo || k > hi || typeof v !== 'number' || v >= 70) return;
      if (!best || v < best.v) best = { k: k, v: v };
    });
    return best;
  }
  function result(card, sc, path, row) {
    if (!GR || !sc || !card) return;
    var all = lsGet(SC); if (!all || typeof all !== 'object') all = {};
    var mine = all[GR] && typeof all[GR] === 'object' ? all[GR] : {};
    mine[path] = { pct: sc.pct, ts: Date.now() }; all[GR] = mine; lsSet(SC, all);
    var pct = sc.pct, m;
    if ((m = path.match(/\/band-(\d+)\/$/))) {
      var n = +m[1];
      if (pct < 70) { box(card, row, '🎯 نتيجتك <bdi dir="ltr">' + pct + '%</bdi>. راجع الحل التفصيلي أسفل ثم أعد البند، فالإعادة بعد المراجعة ترفع نتيجتك.'); return; }
      var w = weakest(mine, 1, 999, n);
      if (w) { box(card, row, '🎯 بندك الأنسب الآن: <b>البند <bdi dir="ltr">' + w.k + '</bdi></b> (آخر نتيجة <bdi dir="ltr">' + w.v + '%</bdi>).', ['/' + GR + '/band-' + w.k + '/', 'ابدأ البند ' + w.k + ' ←'], 'weak'); return; }
      nextBand(GR, n, mine, function (k) {
        if (k) box(card, row, '✅ أحسنت. تابع بخطوة واحدة.', ['/' + GR + '/band-' + k + '/', 'البند ' + k + ' ←'], 'next');
        else box(card, row, '👏 أنهيت ما بعد هذا البند. جرّب نموذج التدريب أو نموذج الهيكل من صفحة الصف.', ['/' + GR + '/', 'صفحة الصف ←'], 'models');
      });
      return;
    }
    if ((m = path.match(/\/practice-(\d+)-(\d+)-\d+\/$/))) {
      var s = +m[1], e = +m[2], w2 = weakest(mine, s, e, -1);
      if (w2) box(card, row, '🎯 ركّز على <b>البند <bdi dir="ltr">' + w2.k + '</bdi></b> (آخر نتيجة <bdi dir="ltr">' + w2.v + '%</bdi>) ثم أعد هذا النموذج.', ['/' + GR + '/band-' + w2.k + '/', 'ابدأ البند ' + w2.k + ' ←'], 'weak');
      else if (pct >= 80) box(card, row, '✅ مستوى قوي في البنود <bdi dir="ltr">' + s + '–' + e + '</bdi>. انتقل إلى المجموعة التالية.', ['/' + GR + '/', 'صفحة الصف ←'], 'next');
      else box(card, row, '🎯 راجع أخطاءك في «كل أخطائي» ثم أعد النموذج لترفع نتيجتك.', ['/' + GR + '/mistakes/', 'كل أخطائي ←'], 'mistakes');
      return;
    }
    if (/\/haykal-\d+(-written)?\/$/.test(path)) {
      if (pct >= 90) box(card, row, '🏅 نتيجة ممتازة. جرّب نموذجاً آخر بزمن الاختبار الحقيقي.', ['/' + GR + '/', 'صفحة الصف ←'], 'next');
      else box(card, row, '🎯 راجع «كل أخطائي» ثم أعد البنود الأضعف قبل النموذج التالي.', ['/' + GR + '/mistakes/', 'كل أخطائي ←'], 'mistakes');
    }
  }

  window.tmnSeason = { cert: cert, result: result };
})();
