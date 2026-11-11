#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""مولّد صفحات نماذج 11 متقدم Bridge.
   python3 build.py data.json --kind practice|haykal-e|haykal-w [--out DIR] [--img-dir DIR]
يفحص JSON بـ validate.py ثم يكتب DIR/<id>/index.html (الافتراضي DIR=/home/claude/work/models/out)
وينسخ الصور المشار إليها img/xxxxxxxxxxxx.ext من --img-dir (الافتراضي: مجلد img بجوار JSON)."""
import argparse, html, json, os, re, shutil, sys
H = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, H)
from validate import validate, IMGSRC, ID_RE

def rd(p): return open(os.path.join(H, p), encoding='utf-8').read()
B = lambda x: '<bdi dir="ltr">%s</bdi>' % x

def mk(m):
    return 'درجة واحدة' if m == 1 else 'درجتان' if m == 2 else (B(m) + ' درجات') if 3 <= m <= 10 else (B(m) + ' درجة')

def qcount(n):
    return 'سؤال واحد' if n == 1 else 'سؤالان' if n == 2 else (B(n) + ' أسئلة') if n <= 10 else (B(n) + ' سؤالاً')

def build(D, kind):
    qs = D['qs']; n = len(qs)
    items = [q['item'] for q in qs]; a, b = min(items), max(items)
    marks = {q['mark'] for q in qs}
    mtxt = ('لكل سؤال ' + mk(marks.pop())) if len(marks) == 1 else 'وتتفاوت درجات الأسئلة'
    has_inp = any(q['inputs'] for q in qs)
    calc = '<span class="fc">الآلة الحاسبة العلمية مسموحة • <bdi dir="ltr" class="nw">Casio fx-991EX</bdi></span>'
    num = re.match(ID_RE[kind], D['id']).groups()
    if kind == 'practice':
        k = num[2]; ia, ib = num[0], num[1]
        title = 'نموذج التدريب %s • البنود %s إلى %s • الحادي عشر متقدم Bridge | أكاديمية طه للرياضيات' % (k, ia, ib)
        desc = 'تدريب حصري على بنود الهيكل الوزاري %s إلى %s بتصحيح فوري وحل تفصيلي • الحادي عشر متقدم Bridge • أكاديمية طه للرياضيات' % (ia, ib)
        meta = 'تدريب حصري على بنود الهيكل الوزاري • الحادي عشر متقدم Bridge'
        h1 = 'نموذج التدريب %s • البنود %s إلى %s' % (B(k), B(ia), B(ib))
        hsub = 'رياضيات الحادي عشر متقدم Bridge • الهيكل الوزاري'
        facts = '<span class="fc">بلا وقت محدد</span><span class="fc">الدرجة %s</span><span class="fc">%s</span>' % (B(D['total']), qcount(n)) + calc
        how = 'حلّ في ورقتك ثم ' + ('اكتب ناتج كل جزء في خانته بأزرار الرموز' if has_inp else 'اختر الإجابة')
        each = 'سؤال على كل بند بترتيبه، ' if len(set(items)) == n and n > 1 else ''
        intro = '%s على البنود من %s إلى %s، %s%s، بلا وقت محدد. %s، وتظهر درجتك في كل بند والحل التفصيلي بعد التسليم.' % (qcount(n), B(a), B(b), each, mtxt, how)
        go = 'ابدأ التدريب'; stamp = 'stamp_practice'; rev = False
    else:
        hn = num[0]; paper = 'الإلكترونية' if kind == 'haykal-e' else 'المقالية'
        title = 'نموذج الهيكل %s للتدريب • الورقة %s • الحادي عشر متقدم Bridge | أكاديمية طه للرياضيات' % (hn, paper)
        desc = 'نموذج كامل على الهيكل الوزاري بتصحيح فوري • الورقة %s • الحادي عشر متقدم Bridge • أكاديمية طه للرياضيات' % paper
        meta = 'نموذج تدريبي يحاكي الاختبار الوزاري • الحادي عشر متقدم Bridge'
        h1 = 'نموذج الهيكل %s للتدريب • الورقة %s' % (B(hn), paper)
        hsub = 'رياضيات الحادي عشر متقدم Bridge • الهيكل الوزاري'
        facts = '<span class="fc">الزمن %s دقيقة</span><span class="fc">الدرجة %s</span><span class="fc">%s</span>' % (B(D['min']), B(D['total']), qcount(n)) + calc
        if kind == 'haykal-e':
            intro = '%s من نوع الاختيار من متعدد على البنود من %s إلى %s، %s. حلّ في ورقتك ثم اختر الإجابة. ' % (qcount(n), B(a), B(b), mtxt)
        else:
            intro = '%s مقالية على البنود من %s إلى %s، %s. حلّ في ورقتك ثم اكتب ناتج كل جزء في خانته بأزرار الرموز، والتمثيل البياني يكون على ورقة الامتحان. ' % (qcount(n), B(a), B(b), mtxt)
        intro += 'يبدأ المؤقت عند «ابدأ الاختبار» وتُسلَّم الإجابات تلقائياً عند انتهاء الوقت، وتظهر درجتك في كل بند والحل التفصيلي بعد التسليم.'
        go = 'ابدأ الاختبار'; stamp = 'stamp_haykal'; rev = True
    dj = json.dumps(D, ensure_ascii=False).replace('</', '<\\/').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
    eng = rd('assets/engine.js').replace('@@D@@', dj).replace('@@REV@@', 'true' if rev else 'false')
    E = html.escape
    t = rd('template.html')
    rep = {'TITLE': E(title), 'DESC': E(desc), 'ID': D['id'], 'CSS': rd('assets/style.css'),
           'STAMP': rd('assets/%s.txt' % stamp).strip(), 'META': meta, 'H1': h1, 'HSUB': hsub, 'FACTS': facts,
           'INTRO': intro, 'GO': go, 'ENGINE': '@@ENGINE@@',
           'REVLINKS': '<script src="/review-links.js?v=3"></script>\n' if rev else ''}
    for key, v in rep.items(): t = t.replace('@@%s@@' % key, v)
    return t.replace('@@ENGINE@@', eng)

def collect_imgs(D):
    out = set()
    for q in D['qs']:
        for s in [q['stem'], q['img']] + q['opts'] + q['sol']:
            if isinstance(s, str): out.update(m for m in IMGSRC.findall(s) if m.startswith('img/'))
            if isinstance(s, str) and s.startswith('img/'): out.add(s)
    return out

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('json'); ap.add_argument('--kind', required=True, choices=list(ID_RE))
    ap.add_argument('--out', default='/home/claude/work/models/out'); ap.add_argument('--img-dir')
    ar = ap.parse_args()
    D = json.load(open(ar.json, encoding='utf-8'))
    E = validate(D, ar.kind)
    if E:
        for e in E: print('خطأ:', e)
        sys.exit('البناء متوقف: %d خطأ في JSON' % len(E))
    d = os.path.join(ar.out, D['id']); os.makedirs(d, exist_ok=True)
    open(os.path.join(d, 'index.html'), 'w', encoding='utf-8').write(build(D, ar.kind))
    src = ar.img_dir or os.path.join(os.path.dirname(os.path.abspath(ar.json)), 'img')
    for im in sorted(collect_imgs(D)):
        f = os.path.join(src, os.path.basename(im))
        if os.path.exists(f):
            os.makedirs(os.path.join(d, 'img'), exist_ok=True); shutil.copy(f, os.path.join(d, 'img', os.path.basename(im)))
        else: print('تحذير: صورة غير موجودة', f)
    print('كُتب', os.path.join(d, 'index.html'), os.path.getsize(os.path.join(d, 'index.html')), 'بايت')

if __name__ == '__main__': main()
