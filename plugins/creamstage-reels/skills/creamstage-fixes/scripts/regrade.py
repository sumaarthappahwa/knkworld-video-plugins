"""Re-grade the A-roll without re-cutting. Usage:
  python3 regrade.py CUTDIR [--preset natural|bright|brighter|neutral|warm] [--grade "ffmpeg,filters"] [--compare 3.0]
CUTDIR = the cut_pauses.py output (v00.mp4.. + list.txt + voice.wav). Rewrites CUTDIR/video.mp4 + aroll.mp4.
--compare T writes CUTDIR/compare.jpg (left: ungraded, right: new grade) at T s — LOOK at it before re-rendering.
Then copy aroll.mp4 to proj/public/ and re-render (render_chunks.py)."""
import sys, subprocess, os
d = sys.argv[1]; a = sys.argv
P = {
 'natural':  "eq=contrast=1.05:saturation=1.05:gamma=1.02,colorbalance=rs=0.01:bs=-0.015,curves=all='0/0 0.25/0.24 0.5/0.52 0.8/0.82 1/0.98',unsharp=5:5:0.3",
 'bright':   "eq=contrast=1.03:brightness=0.03:saturation=1.06:gamma=1.07,colorbalance=rs=0.025:gs=0.01:bs=-0.035:rm=0.015:bm=-0.02,curves=all='0/0.015 0.5/0.535 1/1',unsharp=5:5:0.4",
 'brighter': "eq=contrast=1.02:brightness=0.05:saturation=1.04:gamma=1.13,colorbalance=rs=0.015:bs=-0.025:rm=0.01:bm=-0.015,curves=all='0/0.02 0.5/0.56 1/1',unsharp=5:5:0.4",
 'neutral':  "eq=contrast=1.02:brightness=0.02:saturation=1.0:gamma=1.04,unsharp=5:5:0.3",
 'warm':     "eq=contrast=1.04:brightness=0.03:saturation=1.08:gamma=1.06,colorbalance=rs=0.04:gs=0.015:bs=-0.05:rm=0.02:bm=-0.03,unsharp=5:5:0.4",
}
g = a[a.index('--grade') + 1] if '--grade' in a else P[a[a.index('--preset') + 1] if '--preset' in a else 'natural']
run = lambda x: subprocess.run(x, check=True)
run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', f'{d}/list.txt', '-vf', g + ',format=yuv420p', '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-g', '15', f'{d}/video.mp4'])
run(['ffmpeg', '-v', 'error', '-y', '-i', f'{d}/video.mp4', '-i', f'{d}/voice.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', f'{d}/aroll.mp4'])
if '--compare' in a:
    t = a[a.index('--compare') + 1]
    run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-ss', t, '-i', f'{d}/list.txt', '-ss', t, '-i', f'{d}/video.mp4', '-filter_complex', '[0:v]scale=540:-2[l];[1:v]scale=540:-2[r];[l][r]hstack', '-frames:v', '1', f'{d}/compare.jpg'])
    print('compare ->', f'{d}/compare.jpg')
print('regraded ->', f'{d}/aroll.mp4')
