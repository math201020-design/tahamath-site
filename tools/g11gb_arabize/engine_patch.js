// ---- Arabic-safe rendering of \text{..} (MathJax SVG cannot shape Arabic): split the line, Arabic goes to HTML spans ----
function hasAr(t) { return /\\text\{[^{}]*[؀-ۿ]/.test(t); }
function arSpan(s) { return '<span class="ar">' + esc(s.trim()) + '</span>'; }
function findAr(t) {   // first \frac{..}{..} with Arabic text in a group
  let from = 0;
  for (;;) {
    const i = t.indexOf('\\frac{', from); if (i < 0) return null;
    let j = i + 5; const g = [];
    for (let k = 0; k < 2; k++) {
      if (t[j] !== '{') return null;
      let d = 0; const s = j;
      for (; j < t.length; j++) { if (t[j] === '{') d++; else if (t[j] === '}') { d--; if (!d) break; } }
      g.push(t.slice(s + 1, j)); j++;
    }
    if (hasAr(g[0]) || hasAr(g[1])) return { i, e: j, a: g[0], b: g[1] };
    from = i + 6;
  }
}
function arTex(t, disp) {   // -> {h: html, math: has a maths part}
  const mp = s => (s.replace(/\\[ ,;:!]|\\q?quad|\s/g, '') ? '\\(' + (disp ? '\\displaystyle ' : '') + esc(s) + '\\)' : '');
  if (!hasAr(t)) { const h = mp(t); return { h, math: h ? 1 : 0 }; }
  const f = findAr(t);
  if (f) {
    const L = arTex(t.slice(0, f.i), disp), R = arTex(t.slice(f.e), disp), A = arTex(f.a, false), B = arTex(f.b, false);
    return { h: L.h + '<span class="afr"><span>' + A.h + '</span><span>' + B.h + '</span></span>' + R.h, math: 1 };
  }
  let out = '', last = 0, math = 0, mm; const re = /\\text\{([^{}]*[؀-ۿ][^{}]*)\}/g;
  while ((mm = re.exec(t))) { const p = mp(t.slice(last, mm.index)); if (p) math = 1; out += p + arSpan(mm[1]); last = re.lastIndex; }
  const p = mp(t.slice(last)); if (p) math = 1;
  return { h: out + p, math };
}
function tm(t) { return arTex(t, !hasAr(t)).h; }   // options, boxed answers, step labels
function solLine(t) { const r = arTex(t, true); return '<div class="ln' + (r.math ? '' : ' rtl') + '">' + r.h + '</div>'; }
function stemH(s) {   // stem: only the \( .. \) pieces holding Arabic text are split
  let out = '', last = 0, mm; const re = /\\\((.*?)\\\)/gs;
  while ((mm = re.exec(s))) { out += esc(s.slice(last, mm.index)) + (hasAr(mm[1]) ? arTex(mm[1], false).h : esc(mm[0])); last = re.lastIndex; }
  return out + esc(s.slice(last));
}
