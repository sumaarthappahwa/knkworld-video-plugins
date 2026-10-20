"""Render a Remotion composition in N chunks (avoids compositor OOM/SIGKILL) and join them.
Usage: python3 render_chunks.py PROJDIR COMPOSITION OUT.mp4 [--chunks 2] [--only 1]
--only K re-renders just chunk K (1-based) and re-joins — use when a fix touches one part only.
Chunks are kept in PROJDIR/out/chunkK.mp4. Run under nohup for long reels and poll the log."""
import sys, subprocess, json, os
proj, comp, out = sys.argv[1:4]; a = sys.argv
n = int(a[a.index('--chunks') + 1]) if '--chunks' in a else 2
only = int(a[a.index('--only') + 1]) if '--only' in a else None
B = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
os.makedirs(f'{proj}/out', exist_ok=True)
meta = subprocess.run(['npx', 'remotion', 'compositions', '--browser-executable=' + B], cwd=proj, capture_output=True, text=True).stdout
dur = next(int(l.split()[3]) for l in meta.splitlines() if l.strip().startswith(comp + ' '))
step = -(-dur // n); files = []
for k in range(n):
    s, e = k * step, min(dur - 1, (k + 1) * step - 1); f = f'{proj}/out/chunk{k + 1}.mp4'; files.append(f)
    if only and only != k + 1 and os.path.exists(f): continue
    print(f'chunk {k + 1}/{n}: frames {s}-{e}', flush=True)
    subprocess.run(['npx', 'remotion', 'render', comp, f, f'--frames={s}-{e}', '--concurrency=2', '--crf=16', '--offthreadvideo-cache-size-in-bytes=400000000', '--browser-executable=' + B, '--log=error'], cwd=proj, check=True)
open(f'{proj}/out/chunks.txt', 'w').write('\n'.join(f"file '{os.path.abspath(f)}'" for f in files))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', f'{proj}/out/chunks.txt', '-c', 'copy', out], check=True)
print('joined ->', out, '(', dur, 'frames ) — now run deliver.py')
