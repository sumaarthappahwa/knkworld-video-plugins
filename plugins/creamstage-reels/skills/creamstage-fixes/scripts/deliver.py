"""Final delivery encode: loudnorm -14 LUFS, H.264. Two modes:
  python3 deliver.py IN.mp4 OUT.mp4 [--mb 29] [--audio mix.wav]        -> chat PREVIEW sized under --mb
  python3 deliver.py IN.mp4 OUT.mp4 --master [--audio mix.wav]         -> full-quality UPLOAD file (~10-12 Mbps)
--audio replaces the soundtrack (e.g. after mix_audio.py).
Master files bigger than 29 MB are also split into OUT.partNN pieces (byte split, <=28 MB each) for
device_commit_files (30 MB limit). On the user's computer join them with:  cat OUT.part* > OUT.mp4 && rm OUT.part*
(device_bash, inside the connected folder) — no re-encode, identical file."""
import sys, subprocess, json, os
src, out = sys.argv[1:3]; a = sys.argv
aud = a[a.index('--audio') + 1] if '--audio' in a else None
dur = float(json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'json', src], capture_output=True, text=True).stdout)['format']['duration'])
cmd = ['ffmpeg', '-v', 'error', '-y', '-i', src] + (['-i', aud, '-map', '0:v', '-map', '1:a'] if aud else [])
cmd += ['-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709']
if '--master' in a:
    cmd += ['-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-maxrate', '12M', '-bufsize', '24M']
else:
    mb = float(a[a.index('--mb') + 1]) if '--mb' in a else 29
    vk = int(mb * 8192 / dur - 160 - 60)
    if vk < 1800: print('WARNING: only', vk, 'kbps fits — consider a shorter cut or higher --mb')
    vk = min(vk, 6000)
    cmd += ['-c:v', 'libx264', '-preset', 'medium', '-b:v', f'{vk}k', '-maxrate', f'{int(vk * 1.3)}k', '-bufsize', f'{vk * 2}k']
cmd += ['-c:a', 'aac', '-b:a', '192k' if '--master' in a else '160k', '-shortest', '-movflags', '+faststart', out]
subprocess.run(cmd, check=True)
size = os.path.getsize(out) / 1e6
print(f'{out}: {size:.1f} MB, {dur:.1f}s, {size * 8 / dur:.1f} Mbps')
if '--master' in a and size > 29:
    with open(out, 'rb') as fh:
        i = 0
        while (chunk := fh.read(28 * 1000 * 1000)):
            open(f'{out}.part{i:02d}', 'wb').write(chunk); i += 1
    print(f'split into {i} parts: {out}.part00..part{i-1:02d} -> commit each, then on device: cat NAME.part* > NAME && rm NAME.part*')
