"""Tighten pauses / drop retakes without running out of memory.
Usage: python3 cut_pauses.py SRC.mp4 OUTDIR [--keep keep.json]
- Without --keep: detects pauses >=0.30 s (threshold = noise + 35% of speech range) and writes keep.json.
- Video: each kept range is cut to its own file (input seek), then joined + graded.
- Audio: built in ONE atrim filter from the source (audio-only is memory-light). NEVER apply afade on a seeked
  segment file: filter time starts at the seek point, so a fade-out at st=d silences the segment tail (that bug
  dropped whole phrases once)."""
import sys, json, subprocess, wave, os, numpy as np
src, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
run = lambda a: subprocess.run(a, check=True)
if '--keep' in sys.argv:
    keep = json.load(open(sys.argv[sys.argv.index('--keep') + 1]))
else:
    run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-ac', '1', '-ar', '16000', f'{out}/a16.wav'])
    w = wave.open(f'{out}/a16.wav'); A = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    H = 320; db = 20 * np.log10(np.array([np.sqrt(np.mean(A[i:i + H] ** 2)) + 1e-9 for i in range(0, len(A) - H, H)]))
    thr = np.percentile(db, 10) + 0.35 * (np.percentile(db, 70) - np.percentile(db, 10))
    q = db < thr; gaps = []; i = 0
    while i < len(q):
        if q[i]:
            k = i
            while k < len(q) and q[k]: k += 1
            if (k - i) * 0.02 >= 0.30: gaps.append((i * 0.02, k * 0.02))
            i = k
        else: i += 1
    end = len(A) / 16000; keep = []; cur = gaps[0][1] - 0.07 if gaps and gaps[0][0] == 0 else 0.0
    for a, b in gaps:
        if a == 0: continue
        keep.append((cur, a + 0.07)); cur = b - 0.07
    keep.append((cur, end))
    keep = [(round(a * 30) / 30, round(b * 30) / 30) for a, b in keep if b - a > 0.1]
json.dump(keep, open(f'{out}/keep.json', 'w')); print('segments', len(keep), 'total', round(sum(b - a for a, b in keep), 2))
L = []
for i, (a, b) in enumerate(keep):
    pre = max(0, a - 2)
    run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{pre:.4f}', '-i', src, '-ss', f'{a - pre:.4f}', '-t', f'{b - a:.4f}', '-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '14', '-r', '30', '-pix_fmt', 'yuv420p', f'{out}/v{i:02d}.mp4'])
    L.append(f"file 'v{i:02d}.mp4'")
open(f'{out}/list.txt', 'w').write('\n'.join(L))
GRADE = "eq=contrast=1.05:saturation=1.05:gamma=1.02,colorbalance=rs=0.01:bs=-0.015,curves=all='0/0 0.25/0.24 0.5/0.52 0.8/0.82 1/0.98',unsharp=5:5:0.3,format=yuv420p"  # v0.4 natural grade: keeps camera lighting, blacks stay black
run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', f'{out}/list.txt', '-vf', GRADE, '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-g', '15', f'{out}/video.mp4'])
parts = []; lab = ''
for i, (a, b) in enumerate(keep):
    d = b - a; parts.append(f"[0:a]atrim=start={a:.4f}:end={b:.4f},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,afade=t=out:st={d - 0.012:.4f}:d=0.012[a{i}]"); lab += f'[a{i}]'
fc = ';'.join(parts) + f";{lab}concat=n={len(keep)}:v=0:a=1,highpass=f=80,afftdn=nf=-28,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,loudnorm=I=-16:TP=-2:LRA=9,aresample=48000[a]"
open(f'{out}/afc.txt', 'w').write(fc)
run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-filter_complex_script', f'{out}/afc.txt', '-map', '[a]', '-c:a', 'pcm_s16le', f'{out}/voice.wav'])
run(['ffmpeg', '-v', 'error', '-y', '-i', f'{out}/video.mp4', '-i', f'{out}/voice.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', f'{out}/aroll.mp4'])
# dropout check
w = wave.open(f'{out}/voice.wav'); V = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32)
H = 4800; dead = sum(1 for i in range(0, len(V) - H, H) if np.sqrt(np.mean(V[i:i + H] ** 2)) < 1)
print('aroll ready; digital-silence blocks:', dead, '(must be 0)')
# grade check: blacks must not be lifted vs the camera original (washed-out look)
def lum(src, t):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(t), '-i', src, '-frames:v', '1', '-vf', 'scale=270:-2,format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
    a = np.frombuffer(raw, np.uint8).astype(float); return np.percentile(a, 1), np.percentile(a, 50), np.percentile(a, 99)
o, g = lum(src, keep[0][0] + 1), lum(f'{out}/aroll.mp4', 1)
print('grade check p1/p50/p99  original %.0f/%.0f/%.0f  graded %.0f/%.0f/%.0f' % (o + g), '(graded p1 must be <= original p1 + 4)')
