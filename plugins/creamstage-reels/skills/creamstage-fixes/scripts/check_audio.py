"""Audio QA for a finished reel. Usage:
  python3 check_audio.py FINAL.mp4 [--ref words.json] [--keep keep.json] [--lang hi] [--chunk 15]
1) Dropouts: counts 0.1 s blocks of digital silence (must be 0) and sudden >35 dB level holes inside speech.
2) Words: Whisper-transcribes the final audio in --chunk second windows; with --ref (transcribe.py output of the
   SOURCE, mapped through --keep if the reel was cut) lists reference words that are missing in each window.
Any missing phrase = audio bug → fix with mix_audio.py + deliver.py --audio (no video re-render)."""
import sys, json, subprocess, re, numpy as np
src = sys.argv[1]; a = sys.argv
opt = lambda k, d=None: a[a.index(k) + 1] if k in a else d
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
A = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768
H = 1600; rms = np.array([np.sqrt(np.mean(A[i:i + H] ** 2)) for i in range(0, len(A) - H, H)])
dead = [round(i * 0.1, 1) for i, r in enumerate(rms) if r < 1e-5]
db = 20 * np.log10(rms + 1e-9); holes = [round(i * 0.1, 1) for i in range(1, len(db) - 1) if db[i - 1] > -28 and db[i + 1] > -28 and db[i] < min(db[i - 1], db[i + 1]) - 35]
print(f'digital-silence blocks: {len(dead)} {dead[:20]}'); print(f'level holes inside speech: {len(holes)} {holes[:20]}')
if '--ref' not in a and '--words' not in a: sys.exit()
from faster_whisper import WhisperModel
m = WhisperModel('large-v3-turbo', device='cpu', compute_type='int8'); C = float(opt('--chunk', 15))
norm = lambda w: re.sub(r'[^\w₹]', '', w.lower())
ref = json.load(open(opt('--ref')))['words'] if '--ref' in a else None
if ref and '--keep' in a:
    keep = json.load(open(opt('--keep')))
    def M(t):
        acc = 0.0
        for x, y in keep:
            if t < x: return None
            if t <= y: return acc + t - x
            acc += y - x
        return None
    ref = [dict(w, s=M(w['s'])) for w in ref]; ref = [w for w in ref if w['s'] is not None]
bad = 0; t = 0.0; L = len(A) / 16000
while t < L:
    seg = A[int(t * 16000):int(min(L, t + C) * 16000)]
    got = ' '.join(s.text for s in m.transcribe(seg, language=opt('--lang', 'hi'), beam_size=5, condition_on_previous_text=False)[0])
    line = f'[{t:5.1f}-{min(L, t + C):5.1f}] {got.strip()}'
    if ref:
        G = set(norm(x) for x in got.split()); exp = [w['w'] for w in ref if t + 0.5 <= w['s'] < t + C - 0.5]
        miss = [w for w in exp if norm(w) and norm(w) not in G]
        if exp and len(miss) / len(exp) > 0.35: bad += 1; line += f'\n   !! missing {len(miss)}/{len(exp)}: {" ".join(miss)}'
    print(line, flush=True); t += C
print('windows flagged:', bad, '(review flagged windows by ear; Hinglish spelling differences cause some noise)')
