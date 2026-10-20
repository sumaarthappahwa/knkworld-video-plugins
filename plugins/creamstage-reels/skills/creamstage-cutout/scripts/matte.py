"""Cut the speaker out of a video range with Robust Video Matting (ONNX, CPU).
Usage: python3 matte.py SRC.mp4 START END OUT_fg.webm [--model rvm.onnx] [--work 540]
Writes a transparent VP9 WebM (yuva420p) of only the person, same size/fps as SRC, for START..END seconds.
Use it as a top layer over text placed behind the speaker ("text behind you")."""
import sys, subprocess, numpy as np, onnxruntime as ort, os
src, t0, t1, out = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
model = sys.argv[sys.argv.index('--model') + 1] if '--model' in sys.argv else os.path.join(os.path.dirname(__file__), 'rvm.onnx')
work = int(sys.argv[sys.argv.index('--work') + 1]) if '--work' in sys.argv else 540
probe = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate', '-of', 'csv=p=0', src], capture_output=True, text=True).stdout.strip().split(',')
W, H = int(probe[0]), int(probe[1]); fps = probe[2]
w = work; h = int(round(H * w / W / 2) * 2)
sess = ort.InferenceSession(model, providers=['CPUExecutionProvider'])
rec = [np.zeros([1, 1, 1, 1], dtype=np.float32)] * 4
ratio = np.array([0.5], dtype=np.float32)
dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-ss', str(t0), '-to', str(t1), '-i', src, '-vf', f'scale={w}:{h}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
full = subprocess.Popen(['ffmpeg', '-v', 'error', '-ss', str(t0), '-to', str(t1), '-i', src, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', f'{W}x{H}', '-r', fps, '-i', '-', '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '4M', '-deadline', 'realtime', '-cpu-used', '8', '-auto-alt-ref', '0', out], stdin=subprocess.PIPE)
n = 0
while True:
    small = dec.stdout.read(w * h * 3); big = full.stdout.read(W * H * 3)
    if len(small) < w * h * 3 or len(big) < W * H * 3: break
    x = np.frombuffer(small, np.uint8).reshape(h, w, 3).transpose(2, 0, 1)[None].astype(np.float32) / 255
    fgr, pha, *rec = sess.run(None, {'src': x, 'r1i': rec[0], 'r2i': rec[1], 'r3i': rec[2], 'r4i': rec[3], 'downsample_ratio': ratio})
    a = pha[0, 0]
    # upscale alpha to full res (nearest 2x blocks then smooth via ffmpeg-free bilinear)
    ys = np.linspace(0, h - 1, H); xs = np.linspace(0, w - 1, W)
    y0 = np.floor(ys).astype(int); x0 = np.floor(xs).astype(int); y1 = np.minimum(y0 + 1, h - 1); x1 = np.minimum(x0 + 1, w - 1)
    wy = (ys - y0)[:, None]; wx = (xs - x0)[None, :]
    A = (a[y0][:, x0] * (1 - wy) * (1 - wx) + a[y1][:, x0] * wy * (1 - wx) + a[y0][:, x1] * (1 - wy) * wx + a[y1][:, x1] * wy * wx)
    rgba = np.dstack([np.frombuffer(big, np.uint8).reshape(H, W, 3), (np.clip(A, 0, 1) * 255).astype(np.uint8)])
    enc.stdin.write(rgba.tobytes()); n += 1
enc.stdin.close(); enc.wait(); print('frames', n, '->', out)
