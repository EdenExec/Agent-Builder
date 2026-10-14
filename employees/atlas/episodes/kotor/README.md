# Kotor walking tour (Kim and Dave Williams, cruise stop Wednesday 14 October 2026)

Not yet live. Radar deploys after Kev approves: copy `site/kotor/` (index.html, sw.js, audio/) into the trip repo
(EdenExec/Kim-Dave-Do-Europe) as `kotor/`, add a link on the trip guide next to the Dubrovnik one, push to main.
Port: the ship (Celebrity Ascent, per cruisetimetables.com) calls at **Bar**, 07:00 to 19:00, not Kotor; Kotor is
1 1/4 to 1 1/2 hours by road. The page's "Good to know" says so; the narration works however they reach the Sea Gate.
Seven tracks, 19 minutes, ElevenLabs voice "Chris" (iP95p4xoKVk53GoZ742B), eleven_multilingual_v2, 16,938 characters
on the existing Creator plan (no new spend). `narration.py` is the text sent to ElevenLabs, with the fact-check notes at
the top; `handoff-scripts.md` is the readable script with sources. Re-render: `python3 render.py <out dir>` (skips tracks
already in <out dir>; `--force` re-renders), then copy the MP3s to `site/kotor/audio/`. MP3s are gitignored.
The page is the Dubrovnik page with Kotor stops: play, -15/+15, resume, Walk here, Save audio, whole-route map, one
combined file, and "Save the tour for offline" (service worker scoped to `/kotor/`, cache `ktr-v1`).
