#!/usr/bin/env python3
"""Render the Dubrovnik tour tracks with one ElevenLabs voice. Usage: python3 render.py <out dir>"""
import json, os, ssl, sys, time, urllib.request, subprocess, pathlib, concurrent.futures as cf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from narration import TRACKS, SAY
KEY = os.environ["ELEVENLABS_API_KEY"]
VOICE = os.environ.get("TOUR_VOICE", "iP95p4xoKVk53GoZ742B")  # Chris: charming, down-to-earth, American
ctx = ssl.create_default_context(cafile="/root/.ccr/ca-bundle.crt")
out = pathlib.Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
def spoken(t):
    for a, b in SAY.items(): t = t.replace(a, b)
    return " ".join(t.split("\n\n")).strip()
def one(tr):
    slug, title, sub, text = tr
    body = json.dumps({"text": spoken(text), "model_id": "eleven_multilingual_v2",
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.8, "style": 0.3, "use_speaker_boost": True}}).encode()
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_128",
        data=body, method="POST", headers={"xi-api-key": KEY, "Content-Type": "application/json", "Accept": "audio/mpeg"})
    raw = out / f"{slug}.raw.mp3"
    for a in range(4):
        try:
            raw.write_bytes(urllib.request.urlopen(req, context=ctx, timeout=300).read()); break
        except Exception as e:
            if a == 3: raise
            time.sleep(3 * 2 ** a)
    final = out / f"{slug}.mp3"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw), "-af", "loudnorm=I=-15:TP=-1.5:LRA=11",
        "-ac", "1", "-b:a", "96k", "-metadata", f"title={title}", "-metadata", "artist=Dubrovnik walk for Kim and Dave",
        "-metadata", "album=Dubrovnik Old Town", str(final)], check=True)
    raw.unlink()
    d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(final)],
        capture_output=True, text=True).stdout)
    return slug, len(spoken(text)), round(d, 1)
with cf.ThreadPoolExecutor(3) as ex:
    res = list(ex.map(one, TRACKS))
json.dump({"voice": VOICE, "model": "eleven_multilingual_v2", "tracks": res, "characters": sum(r[1] for r in res)},
    open(out / "eleven_usage.json", "w"), indent=1)
for r in res: print(r)
