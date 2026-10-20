import json
keep = json.load(open('/home/claude/prod/cut/keep.json'))
def M(t):
    acc = 0.0
    for a, b in keep:
        if t < a: return round(acc, 3)
        if t <= b: return round(acc + (t - a), 3)
        acc += b - a
    return round(acc, 3)
TOTAL = round(sum(b - a for a, b in keep), 3)

P = [
 (0.0, [('Tum',0.0),('*export',0.16),('ke',0.70),('liye',0.86)]),
 (1.06, [('kuch',1.06),('acche',1.42),('*products',1.98)]),
 (2.46, [('ki',2.46),('talaash',2.62),('mein',3.04),('ho',3.20)]),
 (3.34, [('So,',3.34),('you',3.46),('must',3.66),('*consider',3.86)]),
 (4.36, [('this',4.36),('*product',4.66)]),
 (5.08, [('Ye',5.08),('hai',5.66),('*block',5.84),('*print',6.30),('*bandana',6.70)]),
 (7.72, [('aur',7.72),('ise',8.04),('*scarf',8.26),('bhi',8.78)]),
 (8.98, [('tum',8.98),('bol',9.24),('sakte',9.54),('ho',9.90)]),
 (10.02, [('aur',10.02),('iski',10.5),('bahut',10.92),('*demand',11.32),('hai',11.84)]),
 (12.0, [('*UK',12.0),('aur',12.46),('*European',13.24)]),
 (13.82, [('market',13.82),('ke',14.32),('andar',14.6)]),
 (14.96, [('aur',14.96),('*retail',15.30),('mein',15.84),('aasaani',16.24),('se',16.86)]),
 (17.08, [('*₹900,',17.08),('*₹1000,',17.98),('*₹1200',18.58)]),
 (18.94, [('rupaye',18.94),('mein',19.92),('bik',20.04),('jaata',20.28),('hai',20.5)]),
 (20.70, [('*Whereas',20.70),('ye',21.44),('India',22.18),('ke',22.64),('andar',22.78)]),
 (23.08, [('tumhe',23.08),('*₹40,',23.38),('*₹45',24.20),('mein',25.06),('bhi',25.26)]),
 (25.42, [('*wholesale',25.42),('mein',25.78),('aasaani',26.12),('se',26.6),('mil',26.76),('jayega',26.94)]),
 (27.30, [('Isko',27.30),('aasaani',27.52),('se',27.92),('tum',28.10)]),
 (28.28, [('*Jaipur',28.28),('ya',28.84),('*Gujarat',29.06)]),
 (29.6, [('se',29.6),('bhi',29.7),('*source',29.78),('kar',30.28),('sakte',30.5),('ho',30.7)]),
 (30.88, [('jahan',30.88),('pe',31.28),('ye',31.40),('*bandana',31.58),('*print',32.08)]),
 (32.38, [('sabse',32.38),('zyada',33.06),('bikte',33.54),('hain',33.8)]),
 (33.98, [('aur',33.98),('bahut',34.18),('aasaani',34.46),('se',34.86)]),
 (35.0, [('mil',35.0),('jaate',35.16),('hain',35.4)]),
 (35.58, [('*IndiaMART',35.58),('se',36.48),('bhi',36.64)]),
 (36.78, [('tum',36.78),('iske',36.92),('liye',37.24),('*suppliers',37.36),('dhoondh',37.82),('sakte',38.1),('ho',38.3)]),
 (38.56, [('Toh',38.56),('*jaldi',39.02),('*shuru',39.56),('*karo',39.84)]),
 (40.10, [('kyunki',40.10),('*low',40.40),('*competition',40.72),('hai',41.3)]),
 (41.6, [('aur',41.6),('*high',42.16),('*margin',42.66),('wala',43.5),('product',43.78),('hai',44.2)]),
 (44.4, [('aur',44.4),('ise',44.88),('tum',45.12),('aasaani',45.28),('se',45.78)]),
 (45.96, [('*B2B',45.96),('mein',46.46),('bhi',46.55),('iske',46.64),('*order',47.02)]),
 (47.22, [('leke',47.22),('aa',47.56),('sakte',47.66),('ho',47.9)]),
 (48.12, [('Aise',48.12),('hi',48.7),('*interesting',48.94)]),
 (49.72, [('product',49.72),('ke',50.1),('*ideas',50.3)]),
 (50.82, [('tumhe',50.82),('yahin',51.16),('milte',51.62),('hain',51.9)]),
 (52.28, [('So,',52.28),('*follow',52.54),('karna',52.92),('mat',53.2),('bhoolna',53.38)]),
]
CAP_END = 53.58
out = ["// Generated — captions on the edited timeline (seconds). a = accent.",
       "export type W = {t: string; s: number; a?: boolean};", "export type Page = {s: number; words: W[]};", "export const PAGES: Page[] = ["]
for s, ws in P:
    items = ["{t: %s, s: %.3f%s}" % (json.dumps(t.lstrip('*'), ensure_ascii=False), M(ts), ', a: true' if t.startswith('*') else '') for t, ts in ws]
    out.append("  {s: %.3f, words: [%s]}," % (M(s), ', '.join(items)))
out += ["];", "export const CAPTIONS_END = %.3f;" % M(CAP_END)]
open('/home/claude/prod/proj/src/captions.ts', 'w').write('\n'.join(out) + '\n')

CUES = dict(titleIn=0.2, productIn=5.0, block=5.84, scarf=8.26, demandIn=10.0, demand=11.32, uk=12.0, europe=13.24, demandOut=14.9,
  retailIn=14.9, retail=15.3, p900=17.08, p1000=17.98, p1200=18.58, compareIn=20.6, whereas=20.7, p40=23.38, p45=24.2, wholesale=25.42,
  sourceIn=27.25, jaipur=28.28, gujarat=29.06, source=29.78, hub=31.58, imIn=35.5, suppliers=37.36, checkIn=38.5, low=40.4, high=42.16, b2b=45.96, order=47.02,
  checkOut=48.05, interesting=48.94, follow=52.54, ctaIn=53.5, difficulty=54.96, comment=55.96, top10=60.58, typeStart=60.7, typeEnd=62.6, followBtn=64.16, end=65.5)
C = {k: M(v) for k, v in CUES.items()}; C['end'] = TOTAL
open('/home/claude/prod/proj/src/cues.ts', 'w').write("export const C = {\n" + ''.join("  %s: %.3f,\n" % kv for kv in C.items()) + "};\nexport const TOTAL = %.3f;\n" % TOTAL)
json.dump(C, open('/home/claude/prod/cues.json', 'w')); print('total', TOTAL); print(C)
