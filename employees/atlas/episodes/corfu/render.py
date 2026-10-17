#!/usr/bin/env python3
"""Render the Corfu tour tracks with one ElevenLabs voice. Usage: python3 render.py <out dir>
Same voice, model and settings as ../dubrovnik/render.py. Also writes the one-file version (Corfu-Walk-All-Stops.mp3).
Check the plan first: GET /v1/user/subscription (character_limit - character_count must exceed the total in usage)."""
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
    final = out / f"{slug}.mp3"
    if final.exists() and "--force" not in sys.argv:  # never pay twice for a track already rendered
        d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(final)],
            capture_output=True, text=True).stdout)
        return slug, 0, round(d, 1)
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
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw), "-af", "loudnorm=I=-15:TP=-1.5:LRA=11",
        "-ac", "1", "-b:a", "96k", "-metadata", f"title={title}", "-metadata", "artist=Corfu walk for Kim and Dave",
        "-metadata", "album=Corfu Old Town", str(final)], check=True)
    raw.unlink()
    d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(final)],
        capture_output=True, text=True).stdout)
    return slug, len(spoken(text)), round(d, 1)
with cf.ThreadPoolExecutor(3) as ex:
    res = list(ex.map(one, TRACKS))
# One combined file: every stop in order with two seconds of quiet between them.
gap = out / "_gap.mp3"
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", "2",
    "-b:a", "96k", str(gap)], check=True)
lst = out / "_list.txt"
lst.write_text("".join(f"file '{(out / (r[0] + '.mp3')).resolve()}'\nfile '{gap.resolve()}'\n" for r in res))
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(lst), "-ac", "1", "-b:a", "96k",
    "-metadata", "title=Corfu Walk, All Stops", "-metadata", "artist=Corfu walk for Kim and Dave",
    "-metadata", "album=Corfu Old Town", str(out / "Corfu-Walk-All-Stops.mp3")], check=True)
gap.unlink(); lst.unlink()
json.dump({"voice": VOICE, "model": "eleven_multilingual_v2", "tracks": res, "characters": sum(r[1] for r in res)},
    open(out / "eleven_usage.json", "w"), indent=1)
for r in res: print(r)
