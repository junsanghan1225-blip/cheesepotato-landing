#!/usr/bin/env python3
"""소리(또는 영상) → .srt 자막 — faster-whisper(오픈소스, 컴퓨터 안에서 돈다 · 소리가 밖으로 나가지 않는다).
   python3 tools/podcast-whisper.py <입력 파일> <출력 .srt> [모델: small]
   영어 설명에 한국어 표현이 섞인 말이라 언어를 고르지 않고 자동으로 둔다. 틀린 곳은 유튜브 스튜디오에서 고친다. 시험 전 도구(docs/ops/podcast-auto.md)."""
import sys
from faster_whisper import WhisperModel

src, dst = sys.argv[1], sys.argv[2]
model = WhisperModel(sys.argv[3] if len(sys.argv) > 3 else "small", device="cpu", compute_type="int8")
segs, _ = model.transcribe(src, vad_filter=True)

def ts(t):
    ms = int(round(t * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"

with open(dst, "w", encoding="utf-8") as f:
    for i, s in enumerate(segs, 1):
        f.write(f"{i}\n{ts(s.start)} --> {ts(s.end)}\n{s.text.strip()}\n\n")
print("자막", dst)
