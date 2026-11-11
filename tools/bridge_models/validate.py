#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""فحص JSON نموذج 11 متقدم Bridge قبل البناء.  الاستعمال:
   python3 validate.py file.json [--kind practice|haykal-e|haykal-w]
يعيد رمز خروج 1 عند وجود أخطاء."""
import json, re, sys

AR = re.compile(r'[\u0600-\u06FF]')
HINDI = re.compile(r'[\u0660-\u0669\u06F0-\u06F9]')
FUNCS = {'sin','cos','tan','cot','sec','csc','ln','log','lim','max','min','exp','det','arcsin','arccos','arctan','sinh','cosh','tanh','mod'}
TEXTCMD = re.compile(r'\\(?:text|mathrm|textbf|mbox|operatorname|mathit|textit)\{([^{}]*)\}')
ARCMD = re.compile(r'\\AR\{([^{}]*)\}')
REF = re.compile(r'^(الكتاب ص \d+( • .+)?|من إعداد المعلم)$')
IMGSRC = re.compile(r'(?:src|SRC)\s*=\s*["\']?([^"\'\s>]+)')
IMGOK = re.compile(r'^img/[0-9a-f]{12}\.(png|webp|jpg|jpeg)$')
ID_RE = {'practice': r'^practice-(\d+)-(\d+)-(\d+)$', 'haykal-e': r'^haykal-(\d+)$', 'haykal-w': r'^haykal-(\d+)-written$'}
MARK_BY_ITEM = lambda it: 3 if 1 <= it <= 20 else (8 if 21 <= it <= 25 else None)
HAYKAL = {'haykal-e': dict(n=20, mark=3, total=60, min=90, lo=1, hi=20),
          'haykal-w': dict(n=5, mark=8, total=40, min=60, lo=21, hi=25)}


def infer_kind(i):
    for k, r in ID_RE.items():
        if re.match(r, str(i)):
            return k
    return None


def latin_in_text(s, mathfield):
    """كلمات إنجليزية: داخل \\text{} وشبهها، وفي النص العادي (خارج الرياضيات والوسوم) لحقول HTML."""
    bad = []
    for m in TEXTCMD.finditer(s):
        for w in re.findall(r'[A-Za-z]{2,}', m.group(1)):
            if w.lower() not in FUNCS:
                bad.append(w)
    if not mathfield:
        t = re.sub(r'<[^>]*>', ' ', s)
        t = re.sub(r'\\\(.*?\\\)|\\\[.*?\\\]', ' ', t, flags=re.S)
        for w in re.findall(r'[A-Za-z]{2,}', t):
            if not w.isupper() and w.lower() not in FUNCS:
                bad.append(w)
    return bad


def top_split(s, seps):
    out, d, cur = [], 0, ''
    for ch in s:
        if ch in '{([': d += 1
        if ch in '})]': d -= 1
        if ch in seps and d == 0:
            out.append(cur); cur = ''
        else:
            cur += ch
    out.append(cur)
    return [x for x in out]


def norm_opt(o):
    t = re.sub(r'\\(?:[ ,;!:]|q?quad|displaystyle|left|right|tfrac|dfrac)', lambda m: '\\frac' if 'frac' in m.group(0) else '', o)
    t = re.sub(r'\s+', '', t)
    m = re.match(r'^\\\{(.*)\\\}$', t)
    if m:
        return ('set', frozenset(top_split(m.group(1), ',')))
    parts = [p for p in top_split(t, ';') if p]
    return ('parts', frozenset(parts))


def balanced(s):
    d = 0
    i = 0
    while i < len(s):
        c = s[i]
        if c == '\\': i += 2; continue
        if c == '{': d += 1
        if c == '}':
            d -= 1
            if d < 0: return False
        i += 1
    return d == 0


def validate(D, kind=None):
    E = []
    err = E.append
    if not isinstance(D, dict):
        return ['الجذر ليس كائناً']
    for k in ('id', 'cp', 'min', 'qs', 'total'):
        if k not in D: err('D ينقصه الحقل: ' + k)
    if E: return E
    pid = D['id']
    if not isinstance(pid, str) or not re.match(r'^[a-z0-9-]+$', pid):
        err('id يجب أن يكون بالحروف [a-z0-9-] فقط: %r' % pid)
    kind = kind or infer_kind(pid)
    if kind not in ID_RE:
        err('نوع الصفحة غير معروف أو id لا يطابق أي نمط'); return E
    if not re.match(ID_RE[kind], str(pid)):
        err('id لا يطابق نمط النوع %s: %s' % (kind, pid))
    if not (isinstance(D['cp'], str) and re.match(r'^[A-Z0-9-]+$', D['cp'])):
        err('cp يجب أن يكون نصاً بحروف كبيرة وأرقام وشرطة')
    qs = D['qs']
    if not isinstance(qs, list) or not qs:
        err('qs قائمة فارغة'); return E
    if not isinstance(D['min'], int): err('min يجب أن يكون عدداً صحيحاً')
    # --- الزمن والدرجات حسب النوع
    if kind == 'practice':
        if D['min'] != 0: err('نموذج التدريب بلا مؤقت: min=0')
        if len(qs) != 5: err('نموذج التدريب 5 أسئلة (وُجد %d)' % len(qs))
    else:
        h = HAYKAL[kind]
        if D['min'] != h['min']: err('زمن %s يجب أن يكون %d دقيقة' % (kind, h['min']))
        if len(qs) != h['n']: err('عدد أسئلة %s يجب أن يكون %d (وُجد %d)' % (kind, h['n'], len(qs)))
        if D['total'] != h['total']: err('total في %s يجب أن يكون %d' % (kind, h['total']))
    # --- الأسئلة
    need = {'item': int, 'mark': int, 'stem': str, 'tex': str, 'img': str, 'opts': list, 'ans': str,
            'inputs': list, 'note': str, 'remember': str, 'sol': list, 'ref': str, 'out_ar': str,
            'lesson': str, 'lvl': str}
    msum = 0
    prev = []
    items = []
    for i, q in enumerate(qs, 1):
        P = 'س%d: ' % i
        if not isinstance(q, dict): err(P + 'ليس كائناً'); continue
        for k, t in need.items():
            if k not in q: err(P + 'ينقصه الحقل ' + k)
            elif not isinstance(q[k], t) or (t is int and isinstance(q[k], bool)): err(P + 'نوع الحقل %s غير صحيح' % k)
        if any(k not in q or not isinstance(q[k], need[k]) for k in need): continue
        items.append(q['item'])
        msum += q['mark']
        if q['mark'] <= 0: err(P + 'mark يجب أن يكون موجباً')
        exp = MARK_BY_ITEM(q['item'])
        if exp is None: err(P + 'item خارج 1-25')
        elif q['mark'] != exp: err(P + 'درجة البند %d يجب أن تكون %d (وُجد %d)' % (q['item'], exp, q['mark']))
        if kind in HAYKAL:
            h = HAYKAL[kind]
            if not (h['lo'] <= q['item'] <= h['hi']): err(P + 'item يجب أن يكون %d-%d في %s' % (h['lo'], h['hi'], kind))
            if kind == 'haykal-e' and q['item'] != i: err(P + 'ترتيب البنود: يجب item=%d' % i)
            if kind == 'haykal-w' and q['item'] != 20 + i: err(P + 'ترتيب البنود: يجب item=%d' % (20 + i))
        if not q['stem'].strip(): err(P + 'stem فارغ')
        if not q['out_ar'].strip() or not AR.search(q['out_ar']): err(P + 'out_ar مطلوب وبالعربية')
        if not REF.match(q['ref']): err(P + 'ref يجب أن يكون «الكتاب ص n» أو «من إعداد المعلم»: %r' % q['ref'])
        if not q['sol']: err(P + 'sol فارغ')
        if 'out_en' in q and not isinstance(q['out_en'], str): err(P + 'out_en نص')
        if 'terms' in q and not (isinstance(q['terms'], list) and all(isinstance(t, list) and len(t) == 2 for t in q['terms'])):
            err(P + 'terms قائمة أزواج [عربي، إنجليزي]')
        # حقول العرض
        disp = [('stem', q['stem']), ('tex', q['tex']), ('note', q['note']), ('remember', q['remember']), ('out_ar', q['out_ar'])]
        disp += [('opts[%d]' % j, o) for j, o in enumerate(q['opts']) if isinstance(o, str)]
        disp += [('sol[%d]' % j, s) for j, s in enumerate(q['sol']) if isinstance(s, str)]
        for j, f in enumerate(q['inputs']):
            if isinstance(f, dict) and isinstance(f.get('label'), str): disp.append(('inputs[%d].label' % j, f['label']))
        for name, s in disp:
            if s.lstrip().startswith('<img') and name.startswith(('opts', 'sol')):
                pass
            if HINDI.search(s): err(P + name + ': أرقام هندية؛ استعمل الأرقام الإنجليزية')
            if name != 'out_ar' or True:
                lw = latin_in_text(s, name in ('tex',) or name.startswith(('opts', 'sol', 'inputs')))
                if lw: err(P + name + ': نص إنجليزي: ' + ', '.join(sorted(set(lw))))
            for m in TEXTCMD.finditer(s):
                if AR.search(m.group(1)): err(P + name + ': \\text فيه حروف عربية (استعمل \\AR{...})')
            for m in ARCMD.finditer(s):
                if re.search(r'[-−–]\s*[\d(\\A-Za-z]', m.group(1)): err(P + name + ': علامة سالب داخل \\AR (أخرجها خارجه)')
                if '\\' in m.group(1): err(P + name + ': \\AR يقبل نصاً عربياً بلا أوامر TeX')
            if name in ('tex',) or name.startswith(('opts', 'sol', 'inputs')):
                if not s.lstrip().startswith('<img') and not balanced(re.sub(r'<[^>]*>', '', s)): err(P + name + ': أقواس {} غير متوازنة')
            if s.count('\\(') != s.count('\\)'): err(P + name + ': \\( و \\) غير متطابقتين')
            for src in IMGSRC.findall(s):
                if not src.startswith('data:') and not IMGOK.match(src): err(P + name + ': اسم الصورة يجب img/ + 12 خانة سداسية + امتداد: ' + src)
        if q['img'] and not q['img'].startswith('data:') and not IMGOK.match(q['img']):
            err(P + 'img: اسم الصورة يجب img/ + 12 خانة سداسية + امتداد، أو data URI')
        # نوع السؤال
        if q['inputs']:
            if q['opts']: err(P + 'سؤال المدخلات يجب أن تكون opts فيه []')
            if q['ans'] != '': err(P + 'سؤال المدخلات يجب أن يكون ans=""')
            s2 = 0
            for j, f in enumerate(q['inputs']):
                Q = P + 'inputs[%d]: ' % j
                if not isinstance(f, dict): err(Q + 'ليس كائناً'); continue
                for k in ('label', 'ans', 'show', 'tol', 'mark'):
                    if k not in f: err(Q + 'ينقصه ' + k)
                if isinstance(f.get('mark'), int) and f['mark'] > 0: s2 += f['mark']
                else: err(Q + 'mark صحيح موجب')
                if not isinstance(f.get('ans'), (int, float)) or isinstance(f.get('ans'), bool): err(Q + 'ans رقم')
                if not isinstance(f.get('tol'), (int, float)): err(Q + 'tol رقم')
                if not isinstance(f.get('show'), str) or not f.get('show', '').strip(): err(Q + 'show نص غير فارغ')
            if s2 != q['mark']: err(P + 'مجموع درجات الخانات %d لا يساوي mark=%d' % (s2, q['mark']))
        else:
            if len(q['opts']) != 4: err(P + 'يلزم 4 خيارات (وُجد %d)' % len(q['opts']))
            if q['ans'] not in list('ABCD'): err(P + 'ans يجب أن يكون A-D')
            ks = [norm_opt(o) for o in q['opts'] if isinstance(o, str)]
            if len(set(ks)) != len(ks): err(P + 'خيارات مكررة (كنصوص أو كمجموعات)')
            prev.append(q['ans'])
            if len(prev) >= 3 and prev[-1] == prev[-2] == prev[-3]: err(P + 'ثلاث إجابات متتالية متطابقة: ' + prev[-1])
        if q['inputs']: prev = []
    if msum != D['total']: err('مجموع mark = %d لا يساوي total = %d' % (msum, D['total']))
    if kind == 'practice' and len(set(items)) != len(items): err('بنود مكررة في نموذج التدريب')
    return list(dict.fromkeys(E))


if __name__ == '__main__':
    a = sys.argv[1:]
    kind = None
    if '--kind' in a:
        kind = a[a.index('--kind') + 1]; del a[a.index('--kind'):a.index('--kind') + 2]
    if not a:
        print(__doc__); sys.exit(2)
    D = json.load(open(a[0], encoding='utf-8'))
    E = validate(D, kind)
    for e in E: print('خطأ:', e)
    print('النتيجة:', 'مرفوض (%d خطأ)' % len(E) if E else 'سليم')
    sys.exit(1 if E else 0)
