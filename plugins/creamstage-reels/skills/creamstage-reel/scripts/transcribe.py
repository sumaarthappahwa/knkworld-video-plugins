"""Word-level transcription. Usage: python3 transcribe.py audio16k.wav out.json [lang=hi] [model=large-v3-turbo]
Feeds raw numpy audio (avoids PyAV version issues). If a stretch comes back empty, re-run that window alone with --from/--to."""
import sys, json, wave, numpy as np
from faster_whisper import WhisperModel
src, out = sys.argv[1], sys.argv[2]
lang = sys.argv[3] if len(sys.argv) > 3 else 'hi'
model = sys.argv[4] if len(sys.argv) > 4 else 'large-v3-turbo'
w = wave.open(src); A = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
m = WhisperModel(model, device='cpu', compute_type='int8')
segs, info = m.transcribe(A, word_timestamps=True, language=lang, condition_on_previous_text=False, beam_size=5, vad_filter=False)
words = []
for s in segs:
    print(f"[{s.start:.2f}-{s.end:.2f}] {s.text}", flush=True)
    for x in s.words: words.append({'w': x.word, 's': round(x.start, 3), 'e': round(x.end, 3), 'p': round(x.probability, 3)})
json.dump({'lang': info.language, 'words': words}, open(out, 'w'), ensure_ascii=False)
