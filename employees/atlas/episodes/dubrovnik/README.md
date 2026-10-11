# Dubrovnik walking tour (Kim and Dave Williams, cruise stop Monday 12 October 2026)

Live: https://london-rome-thenhome.netlify.app/dubrovnik/ (repo EdenExec/Kim-Dave-Do-Europe, Netlify deploys main).
Eight tracks, 23 minutes, ElevenLabs voice "Chris" (iP95p4xoKVk53GoZ742B), eleven_multilingual_v2, 19,615 characters
on the existing Creator plan (no new spend). `narration.py` is the corrected text; `handoff-scripts.md` is the draft it came
from; corrections are listed at the top of `narration.py`. Re-render: `python3 render.py <out dir>`, copy the MP3s to
`dubrovnik/audio/` in the trip repo, push to main.
The page: one card per stop (play, -15/+15, resume, Walk here map link, Save audio), a whole-route map, one combined
file, and "Save the tour for offline" (service worker with byte-range support so iPhone Safari plays cached audio).
