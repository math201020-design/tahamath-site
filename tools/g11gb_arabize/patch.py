#!/usr/bin/env python3
# Arabize \text{} in g11-general-bridge haykal-* / prac-* pages and patch the in-page engine (12 Nov 2026)
import re, glob, os, sys, hashlib, json
H = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, H)
from dict import D
ROOT = os.path.abspath(os.path.join(H, '..', '..', 'site', 'g11-general-bridge'))
ENG = open(os.path.join(H, 'engine_patch.js'), encoding='utf8').read()
CSS = ("\n.ar{unicode-bidi:isolate;direction:rtl;margin:0 .25em;display:inline-block;max-width:100%}\n.sol .ln.rtl{direction:rtl;text-align:right}\n"
       ".afr{display:inline-flex;flex-direction:column;vertical-align:middle;text-align:center;margin:0 .25em;direction:ltr}\n"
       ".afr>span{padding:0 .3em;white-space:nowrap}.afr>span:first-child{border-bottom:1.5px solid currentColor}\n")
files = sorted(glob.glob(ROOT + '/haykal-*/index.html') + glob.glob(ROOT + '/prac-*/index.html'))
for f in files:
    s = open(f, encoding='utf8').read()
    if 'function arTex' in s: continue
    s = re.sub(r'\\\\text\{([^{}]*)\}', lambda m: '\\\\text{%s}' % D.get(m.group(1), m.group(1)), s)
    a = s.index('function tm(t) {'); b = s.index('// teacher 6 Nov 2026 20:31')
    s = s[:a] + ENG + s[b:]
    assert s.count('esc(q.stem).replace') == 1 and s.count('${m(s.t)}</div>`;') == 1
    s = s.replace('esc(q.stem).replace', 'stemH(q.stem).replace')
    s = s.replace('h += `<div class="ln">${m(s.t)}</div>`;', 'h += solLine(s.t);')
    s = s.replace('</style>', CSS + '</style>', 1)
    open(f, 'w', encoding='utf8').write(s)
    print('patched', os.path.relpath(f, ROOT))
