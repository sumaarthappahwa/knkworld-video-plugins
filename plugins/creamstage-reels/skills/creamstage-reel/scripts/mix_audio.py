"""Rebuild the final mix fast without re-rendering video: voice.wav + every <Audio> in src/Sfx.tsx.
Usage: python3 mix_audio.py voice.wav proj/src/Sfx.tsx proj/public/sfx out_mix.wav"""
import re, subprocess, sys
voice, sfx_tsx, sfx_dir, out = sys.argv[1:5]
ev = re.findall(r'sfx/([^"]+)"\)\} from=\{(\d+)\} volume=\{([\d.]+)\}', open(sfx_tsx).read())
inp = ['-i', voice]; fc = []; mix = ['[0:a]']
for k, (n, fr, v) in enumerate(ev):
    inp += ['-i', f'{sfx_dir}/{n}']; ms = int(int(fr) / 30 * 1000)
    fc.append(f'[{k + 1}:a]aresample=48000,volume={v},adelay={ms}|{ms}[s{k}]'); mix.append(f'[s{k}]')
fc.append(f"{''.join(mix)}amix=inputs={len(mix)}:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11[a]")
open('/tmp/mixfc.txt', 'w').write(';'.join(fc))
subprocess.run(['ffmpeg', '-v', 'error', '-y'] + inp + ['-filter_complex_script', '/tmp/mixfc.txt', '-map', '[a]', '-ar', '48000', out], check=True)
print(len(ev), 'sfx mixed ->', out)
