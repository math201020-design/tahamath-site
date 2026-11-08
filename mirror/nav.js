/* أكاديمية طه للرياضيات • التنقل المشترك لكل صفحات tahamath.com
   تستدعيه كل صفحة بسطر واحد قبل </body>:  <script src="/nav.js?v=3" defer></script>
   (يُرفع رقم الإصدار في كل الصفحات مع كل تعديل على هذا الملف)
   - «الصفحة السابقة» في كل صفحة غير الرئيسية.
   - «الصفحة الرئيسية» عندما تكون الصفحة على عمق مستويين أو أكثر من الرئيسية.
   - «أعد الاختبار» في الاختبارات والتدريبات بعد البدء، وفي بطاقة النتيجة.
   - «شاركنا رأيك» في بطاقة النتيجة لكل اختبار تفاعلي، ويفتح صفحة /reviews/.
   - «🎖️ شهادتي» وأطول سلسلة إجابات صحيحة في بطاقة النتيجة (الإصدار 2، 6 نوفمبر 2026).
   - بطاقة النتيجة وجدول البنود في أول شاشة بعد التسليم فقط، وبقية الشاشات سؤال واحد بحكمه وحله (الإصدار 3، 6 نوفمبر 2026). */
(function () {
  'use strict';
  var HOME = '/';
  var REVIEWS = '/reviews/';
  var PREFILL = 'tmn-prefill';

  var parts = location.pathname.replace(/\/index\.html?$/i, '/').split('/').filter(Boolean);
  if (parts.length && /^404\.html?$/i.test(parts[parts.length - 1])) parts.pop();
  var depth = parts.length;
  /* صفحة 404: قد يكون الرابط المطلوب غير موجود، فلا يُبنى عليه رابط «السابقة» */
  var is404 = document.body.hasAttribute('data-404') || /^الصفحة غير موجودة/.test(document.title);
  if (is404 && depth < 1) depth = 1;

  /* اختبار تفاعلي؟ (يُعرف بوجود مفتاح حفظ الإجابات وبطاقة النتيجة في الصفحة) */
  var key = null;
  try { key = (typeof KEY === 'string') ? KEY : null; } catch (e) { key = null; }
  var result = document.getElementById('result');
  var isTest = !!(key && result);

  function readState() {
    try { var s = localStorage.getItem(key); return s ? JSON.parse(s) : null; } catch (e) { return null; }
  }

  /* ---------- الأنماط ---------- */
  var css =
    '.tmn-strip{direction:rtl;background:#fff;border-bottom:1px solid #D5DCE8;font-family:inherit;position:static;width:auto;margin:0}' +
    '.tmn-in{max-width:860px;margin:0 auto;padding:8px 16px;display:flex;flex-wrap:wrap;gap:8px;align-items:center}' +
    '.tmn-b{display:inline-flex;align-items:center;gap:6px;font:inherit;font-size:14px;font-weight:700;line-height:1.4;' +
      'color:#1E3A6C;background:#fff;border:1.5px solid #1E3A6C;border-radius:999px;padding:6px 14px;min-height:36px;' +
      'text-decoration:none;cursor:pointer;white-space:nowrap;width:auto;margin:0;box-shadow:none;text-transform:none;letter-spacing:normal}' +
    '.tmn-b:hover{background:#EEF2F8}' +
    '.tmn-b:focus-visible{outline:3px solid #D4A843;outline-offset:2px}' +
    '.tmn-b.tmn-gold{background:#D4A843;border-color:#D4A843;color:#0E1C3A}' +
    '.tmn-b.tmn-gold:hover{background:#E2BC5E}' +
    '.tmn-b.tmn-warn{border-color:#C0392B;color:#C0392B}' +
    '.tmn-b[hidden]{display:none}' +
    '.tmn-end{margin-inline-start:auto}' +
    '.tmn-arr{direction:ltr;unicode-bidi:isolate}' +
    '.tmn-act{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:14px}' +
    '@media (max-width:420px){.tmn-in{gap:6px;padding:7px 12px}.tmn-strip .tmn-b{font-size:13px;padding:5px 10px;gap:4px;min-height:34px}}' +
    '.tmn-streak{margin-top:6px;font-weight:700;color:#8A6300}' +
    '.tmn-modal{position:fixed;top:0;right:0;bottom:0;left:0;z-index:1000;background:rgba(14,28,58,.78);display:flex;align-items:center;justify-content:center;padding:16px;direction:rtl}' +
    '.tmn-mbox{background:#fff;border-radius:16px;padding:14px;max-width:460px;width:100%;max-height:100%;overflow:auto;text-align:center;font-family:inherit}' +
    '.tmn-mimg{display:block;width:100%;height:auto;border-radius:8px}' +
    '.tmn-mwait{margin:10px 0 0;font-size:13px;color:#5A6472}' +
    '@media print{.tmn-strip,.tmn-act,.tmn-modal{display:none!important}}';

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  /* ---------- «الصفحة السابقة» ---------- */
  function parentUrl() {
    if (depth <= 1 || is404) return HOME;
    return '/' + parts.slice(0, -1).join('/') + '/';
  }
  function goBack(ev) {
    if (ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey || ev.button) return;
    var ref = '';
    try { ref = document.referrer ? new URL(document.referrer).origin : ''; } catch (e) { ref = ''; }
    if (ref === location.origin && history.length > 1) { ev.preventDefault(); history.back(); }
    /* وإلا فينتقل المتصفح عبر الرابط إلى الصفحة الأعلى */
  }

  /* ---------- «أعد الاختبار» ---------- */
  function retryButton(cls) {
    var RW = /\/(band-|practice-|prac-)/.test(location.pathname) ? 'أعد التدريب' : 'أعد الاختبار';
    var b = el('button', 'tmn-b ' + (cls || ''), RW);
    b.type = 'button';
    b.setAttribute('aria-live', 'polite');
    var armed = false, t = null;
    b.addEventListener('click', function () {
      if (!armed) {
        armed = true; b.textContent = 'اضغط للتأكيد'; b.classList.add('tmn-warn');
        t = setTimeout(function () { armed = false; b.textContent = RW; b.classList.remove('tmn-warn'); }, 4000);
        return;
      }
      clearTimeout(t);
      var s = readState();
      try { if (s && (s.name || s.sec)) sessionStorage.setItem(PREFILL, JSON.stringify({ name: s.name || '', sec: s.sec || '' })); } catch (e) {}
      var kill = function () { try { localStorage.removeItem(key); } catch (e) {} };
      kill();
      /* تُسجَّل بعد مستمعي الصفحة، فتمسح أي حفظ أخير قبل المغادرة */
      ['beforeunload', 'pagehide'].forEach(function (ev) { window.addEventListener(ev, kill); });
      location.replace(location.pathname);
    });
    return b;
  }

  function prefill() {
    var p = null;
    try { p = JSON.parse(sessionStorage.getItem(PREFILL) || 'null'); sessionStorage.removeItem(PREFILL); } catch (e) { p = null; }
    if (!p) return;
    var nm = document.getElementById('nm'), sec = document.getElementById('sec');
    if (nm && !nm.value) nm.value = p.name;
    if (sec && !sec.value) sec.value = p.sec;
    window.scrollTo(0, 0);
  }


  /* ---------- أطول سلسلة إجابات صحيحة (من حكم كل سؤال بعد التسليم) ---------- */
  /* الصحيح كاملاً يزيد السلسلة، والخطأ يقطعها، والجزئي لا يزيدها ولا يقطعها */
  function bestStreak() {
    var dots = document.querySelectorAll('#dots .dot');
    var best = 0, cur = 0;
    for (var i = 0; i < dots.length; i++) {
      var d = dots[i].classList;
      if (d.contains('ok')) { cur++; if (cur > best) best = cur; }
      else if (!d.contains('half')) cur = 0;
    }
    return { best: best, total: dots.length };
  }

  function scoreNums() {
    var big = result && result.querySelector('.score .big');
    var m = big ? big.textContent.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/) : null;
    if (!m) return null;
    var got = parseFloat(m[1]), tot = parseFloat(m[2]);
    if (!tot) return null;
    return { got: got, tot: tot, pct: Math.round(got / tot * 100), raw: got / tot * 100 };
  }

  function testTitle() {
    var h = result && result.querySelector('.score h3');
    var t = h ? h.textContent : document.title;
    return t.replace(/^\s*بطاقة النتيجة\s*•\s*/, '').replace(/\s+/g, ' ').trim();
  }

  function verifyCode() {
    var c = result && result.querySelector('.score .code');
    return c ? c.textContent.trim() : '';
  }

  /* خمس درجات للشهادة */
  var TIERS = [
    [90, 'شهادة تميّز', 'أداء استثنائي يليق بالمتميّزين، ومستوى يؤهّلك للاختبار الوزاري.'],
    [80, 'شهادة امتياز', 'فهم عميق وحل متقن. راجع أخطاءك القليلة لتصل إلى القمة.'],
    [70, 'شهادة تفوّق', 'مستوى قوي. خطوة أخرى من التدريب لتصبح من المتميّزين.'],
    [50, 'شهادة تقدير', 'بداية جيدة ومجهود واضح. راجع الحلول التفصيلية ثم أعد المحاولة.'],
    [0, 'شهادة مثابرة', 'كل محاولة تقرّبك من هدفك. راجع الحلول وأعد الاختبار، وستتقدّم.']
  ];
  function tierOf(p) { for (var i = 0; i < TIERS.length; i++) if (p >= TIERS[i][0]) return TIERS[i]; return TIERS[TIERS.length - 1]; }

  function wrap(ctx, text, maxW, maxLines) {
    var words = text.split(' '), lines = [], line = '';
    for (var i = 0; i < words.length; i++) {
      var t = line ? line + ' ' + words[i] : words[i];
      if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = words[i]; } else line = t;
    }
    if (line) lines.push(line);
    if (lines.length > maxLines) { lines = lines.slice(0, maxLines); lines[maxLines - 1] += '…'; }
    return lines;
  }

  function drawCert(done, fail) {
    var s = readState() || {}, sc = scoreNums();
    if (!sc) return fail();
    var st = bestStreak(), tier = tierOf(sc.raw), code = verifyCode();
    var W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H; c.dir = 'rtl';
    var x = c.getContext('2d');
    var font = (getComputedStyle(document.body).fontFamily || 'sans-serif');
    var F = function (w, px) { return w + ' ' + px + 'px ' + font; };
    var gold = tier[0] >= 90, MW = W - 200;
    /* الخلفية والإطار */
    var g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1E3A6C'); g.addColorStop(1, '#0E1C3A');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.strokeStyle = '#D4A843'; x.lineWidth = 10; x.strokeRect(34, 34, W - 68, H - 68);
    x.lineWidth = 2; x.strokeRect(54, 54, W - 108, H - 108);
    /* علامة مائية */
    x.save(); x.globalAlpha = 0.05; x.fillStyle = '#FFFFFF'; x.font = F('700', 70); x.textAlign = 'center';
    x.translate(W / 2, H / 2); x.rotate(-0.42);
    for (var k = -3; k <= 3; k++) x.fillText('tahamath.com', 0, k * 210);
    x.restore();
    x.direction = 'rtl'; x.textAlign = 'center';
    /* الختم */
    var y = 110;
    var stamp = document.querySelector('img.stamp');
    if (stamp && stamp.complete && stamp.naturalWidth) {
      var sh = Math.round(230 * stamp.naturalHeight / stamp.naturalWidth);
      try { x.drawImage(stamp, W / 2 - 115, y, 230, sh); y += sh + 25; } catch (e) { y += 20; }
    } else y += 20;
    x.fillStyle = '#F0CD78'; x.font = F('700', 40); x.fillText('أكاديمية طه للرياضيات', W / 2, y + 30, MW); y += 118;
    x.fillStyle = gold ? '#F0CD78' : '#FFFFFF'; x.font = F('800', 84); x.fillText(tier[1], W / 2, y, MW); y += 100;
    x.fillStyle = '#D9E1EE'; x.font = F('400', 34); x.fillText('تُمنح إلى', W / 2, y); y += 84;
    /* الاسم: يُصغَّر الخط حتى يتسع داخل الإطار */
    var nm = String(s.name || '').replace(/\s+/g, ' ').trim();
    nm = nm ? Array.from(nm).slice(0, 40).join('') : 'متدرّب أكاديمية طه';
    var fs = 64; x.font = F('700', fs);
    while (fs > 40 && x.measureText(nm).width > MW) { fs -= 4; x.font = F('700', fs); }
    x.fillStyle = '#FFFFFF'; x.fillText(nm, W / 2, y, MW); y += 80;
    x.fillStyle = '#D9E1EE'; x.font = F('400', 32);
    var tl = wrap(x, 'تقديراً لإتمام ' + testTitle(), W - 220, 2);
    for (var i = 0; i < tl.length; i++) { x.fillText(tl[i], W / 2, y, W - 220); y += 48; }
    y += 52;
    /* النتيجة */
    x.fillStyle = 'rgba(212,168,67,.14)'; x.fillRect(150, y - 60, W - 300, 150);
    x.strokeStyle = '#D4A843'; x.lineWidth = 2; x.strokeRect(150, y - 60, W - 300, 150);
    x.direction = 'ltr'; x.fillStyle = '#F0CD78'; x.font = F('800', 70);
    x.fillText(sc.got + ' / ' + sc.tot + '   (' + sc.pct + '%)', W / 2, y + 30, W - 320);
    x.direction = 'rtl'; x.fillStyle = '#FFFFFF'; x.font = F('400', 30);
    if (st.total) x.fillText('🔥 أطول سلسلة إجابات صحيحة: ' + st.best + ' من ' + st.total, W / 2, y + 74, W - 320);
    y += 165;
    x.fillStyle = '#D9E1EE'; x.font = F('400', 32);
    var ml = wrap(x, tier[2], W - 240, 2);
    for (var j = 0; j < ml.length; j++) { x.fillText(ml[j], W / 2, y, W - 240); y += 44; }
    /* التذييل */
    var d = new Date(), ds = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    x.fillStyle = '#D4A843'; x.font = F('700', 34); x.fillText('الأستاذ محمد طه', W / 2, H - 182);
    x.fillStyle = '#D9E1EE'; x.font = F('400', 28);
    x.direction = 'ltr'; x.fillText(code ? ds + '   •   ' + code : ds, W / 2, H - 138, MW);
    x.direction = 'rtl'; x.fillStyle = '#F0CD78'; x.font = F('700', 34);
    x.fillText('تدرّب مجاناً على tahamath.com', W / 2, H - 94, MW);
    x.fillStyle = 'rgba(255,255,255,.55)'; x.font = F('400', 22);
    x.fillText('© أكاديمية طه للرياضيات • جميع الحقوق محفوظة', W / 2, H - 66, MW);
    try { c.toBlob(function (b) { if (!b) return fail(); done(b, tier, sc); }, 'image/png'); } catch (e) { fail(); }
  }

  function shareText(sc, tier) {
    return '🎖️ حصلت على «' + tier[1] + '» بنتيجة ' + sc.got + ' من ' + sc.tot + ' في ' + testTitle() +
      '\nتدرّب مجاناً مع تصحيح فوري وحل تفصيلي:\n' + location.origin + location.pathname + '?utm_source=certificate';
  }

  function openWa(text) {
    var u = 'https://wa.me/?text=' + encodeURIComponent(text);
    var w = window.open(u, '_blank', 'noopener');
    if (!w) location.href = u;
  }

  function openCert() {
    if (document.querySelector('.tmn-modal')) return;
    var opener = document.activeElement, url = null;
    var m = el('div', 'tmn-modal'); m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', 'شهادتي');
    var box = el('div', 'tmn-mbox'); box.tabIndex = -1;
    var wait = el('p', 'tmn-mwait', 'جارٍ تجهيز الشهادة…'); wait.setAttribute('aria-live', 'polite');
    var row = el('div', 'tmn-act');
    var cl = el('button', 'tmn-b', 'إغلاق'); cl.type = 'button';
    row.appendChild(cl); box.appendChild(wait); box.appendChild(row); m.appendChild(box);
    document.body.appendChild(m); box.focus();
    var onKey = function (e) {
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'Tab') {   /* يبقى التنقل داخل النافذة */
        var f = box.querySelectorAll('a,button'); if (!f.length) return;
        var a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    };
    var close = function () {
      document.removeEventListener('keydown', onKey);
      if (url) URL.revokeObjectURL(url);
      m.remove();
      if (opener && opener.focus) opener.focus();
    };
    document.addEventListener('keydown', onKey);
    cl.addEventListener('click', close);
    m.addEventListener('click', function (e) { if (e.target === m) close(); });
    var fail = function () { wait.textContent = 'تعذّر تجهيز الشهادة. أعد المحاولة بعد قليل.'; cl.focus(); };
    var go = function () {
      drawCert(function (blob, tier, sc) {
        url = URL.createObjectURL(blob);
        var img = el('img', 'tmn-mimg'); img.src = url; img.alt = tier[1];
        box.insertBefore(img, wait);
        wait.textContent = 'إن لم يبدأ الحفظ، فاضغط مطوّلاً على الصورة واختر حفظها أو تنزيلها.';
        box.appendChild(wait);
        var fname = 'tahamath-certificate.png';
        var save = el('a', 'tmn-b tmn-gold', '⬇️ حفظ الصورة'); save.href = url; save.download = fname;
        var shr = el('button', 'tmn-b', '📤 مشاركة'); shr.type = 'button';
        shr.addEventListener('click', function () {
          var text = shareText(sc, tier), file = null;
          try { file = new File([blob], fname, { type: 'image/png' }); } catch (e) {}
          if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({ title: 'شهادتي', text: text, files: [file] }).catch(function (e) { if (!e || e.name !== 'AbortError') openWa(text); });
            return;
          }
          openWa(text);
        });
        row.insertBefore(shr, cl); row.insertBefore(save, shr);
        save.focus();
      }, fail);
    };
    var fam = getComputedStyle(document.body).fontFamily;
    if (document.fonts && document.fonts.load) {
      Promise.all(['400 32px', '700 64px', '800 84px'].map(function (s) { return document.fonts.load(s + ' ' + fam, 'أبج 0123'); })).then(go, go);
    } else go();
  }

  function streakLine() {
    var st = bestStreak();
    if (!st.total || !result) return;
    var card = result.querySelector('.score') || result;
    if (card.querySelector('.tmn-streak')) return;
    var p = el('div', 'tmn-streak', '🔥 أطول سلسلة إجابات صحيحة: ' + st.best + ' من ' + st.total);
    var big = card.querySelector('.big');
    if (big && big.nextSibling) card.insertBefore(p, big.nextSibling); else card.appendChild(p);
  }

  /* ---------- بطاقة النتيجة ---------- */
  function addResultActions() {
    if (!result || !result.classList.contains('show')) return;
    var card = result.querySelector('.score') || result;
    if (card.querySelector('.tmn-act')) return;
    var row = el('div', 'tmn-act');
    if (scoreNums()) {
      var ce = el('button', 'tmn-b tmn-gold', '🎖️ شهادتي'); ce.type = 'button';
      ce.addEventListener('click', openCert);
      row.appendChild(ce);
    }
    var gr = parts[0];
    if (/^g1[12]-(general|advanced)$/.test(gr)) { var mk = el('a', 'tmn-b', '📋 كل أخطائي'); mk.href = '/' + gr + '/mistakes/'; row.appendChild(mk); }
    var rv = el('a', 'tmn-b', 'شاركنا رأيك');
    rv.href = REVIEWS;
    row.appendChild(rv);
    row.appendChild(retryButton());
    card.appendChild(row);
  }

  /* ---------- البناء ---------- */
  function build() {
    var style = el('style'); style.textContent = css; document.head.appendChild(style);

    var stripRetry = null;
    if (depth >= 1) {
      var strip = el('nav', 'tmn-strip');
      strip.setAttribute('aria-label', 'التنقل');
      var inner = el('div', 'tmn-in');

      var back = el('a', 'tmn-b');
      back.href = parentUrl();
      var arr = el('span', 'tmn-arr', '→'); arr.setAttribute('aria-hidden', 'true');
      back.appendChild(arr);
      back.appendChild(document.createTextNode('الصفحة السابقة'));
      back.addEventListener('click', goBack);
      inner.appendChild(back);

      if (depth >= 2 && !is404) {   /* صفحة 404 فيها زر «العودة إلى الرئيسية» */
        var home = el('a', 'tmn-b', 'الصفحة الرئيسية');
        home.href = HOME;
        inner.appendChild(home);
      }

      if (isTest) {
        stripRetry = retryButton('tmn-end');
        inner.appendChild(stripRetry);
      }

      strip.appendChild(inner);
      if (is404) {   /* محتوى صفحة 404 في وسط الشاشة، فيُثبَّت الشريط أعلاها */
        strip.style.cssText = 'position:absolute;top:0;left:0;right:0;z-index:10';
        document.body.style.paddingTop = '72px';
      }
      document.body.insertBefore(strip, document.body.firstChild);
    }

    if (!isTest) return;

    prefill();

    var start = document.getElementById('start');
    /* بطاقة النتيجة وجدول البنود في أول شاشة بعد التسليم فقط (السؤال الأول)، وتختفي في شاشات الأسئلة التالية.
       بعد إعادة تحميل الصفحة تظهر البطاقة حتى ينتقل الطالب بين الأسئلة. */
    var reviewMoved = false;
    function reviewView() {
      var s = readState();
      var done = !!(s && s.done) && result.classList.contains('show');
      var cur = (s && +s.cur) || 0;
      var hide = done && reviewMoved && cur > 0;
      if ((result.style.display === 'none') === hide) return;
      if (hide) {
        var r = result.getBoundingClientRect(), h = result.offsetHeight;
        result.style.display = 'none';
        if (r.top < 0) window.scrollBy(0, -h);   /* لا قفزة في الصفحة (Safari لا يعوّضها) */
      } else {
        result.style.display = '';
      }
    }
    try {
      var nativeSet = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k, v) {
        nativeSet.apply(this, arguments);
        try {
          if (k === key && this === window.localStorage) { reviewMoved = true; reviewView(); }
        } catch (e) {}
      };
    } catch (e) {}
    function refresh() {
      reviewView();
      var s = readState();
      var started = (s && s.t0) || (start && start.classList.contains('hidden'));
      if (stripRetry) stripRetry.hidden = !started;
      if (result.classList.contains('show')) streakLine();
      addResultActions();
    }
    refresh();
    var mo = new MutationObserver(refresh);
    mo.observe(result, { attributes: true, attributeFilter: ['class'], childList: true, subtree: true });
    if (start) mo.observe(start, { attributes: true, attributeFilter: ['class'] });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
