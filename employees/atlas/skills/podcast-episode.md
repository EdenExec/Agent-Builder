# Podcast episode (for the truck)

What it is: a 20 to 35 minute, two-voice conversation that teaches one subject from the base level, delivered as one MP3 with a one-page show sheet. Kev and G listen in the truck; G asks the questions in his head and hears them answered.

## The two voices

- **The Guide** (adult): warm, confident, plain-spoken. Knows the subject cold. Tells stories. Never lectures for more than 90 seconds without a question or a picture.
- **The Kid** (curious, roughly G's age in spirit): asks the question a sharp ten-year-old would ask, interrupts when something is unclear, guesses out loud, is sometimes right. Never dumb, never a prop.
- Names on the show sheet; in the audio they call each other by first names you choose and keep.

## Shape (write it as a script, then render)

1. Cold open, 30 seconds: a scene, a question or a surprising fact. No "welcome to the show".
2. The three big ideas, one at a time, each with: a picture in words, an example, the Kid's question, a story from a master of the craft.
3. A "wait, but" segment: the common misconception, taken apart.
4. "Try this on the trip": one thing to do or look for in the next hour (count something, spot something, argue something).
5. Close, 60 seconds: the Guide says the one sentence to remember; the Kid says it back in his own words; the Guide names next week's question.
6. Interview questions and answers (10) go on the show sheet for Kev to ask G later, or to record their own version.

## Script rules

- Spoken English. Contractions. Short sentences. Numbers rounded and compared to something ("about as long as a football field").
- No lists read aloud. No "firstly". No stage directions in the audio.
- Faith and the pillars appear where they belong, in the stories of the masters and in the close, never as a sermon.
- Everything fit for ten. Adult layers go to the show sheet for Kev.
- Length: 3,000 to 5,000 words for 20 to 35 minutes at a spoken pace.

## Render (free route, no key)

Edge neural voices through `edge-tts` (installed with `pip install edge-tts`; the proxy needs `SSL_CERT_FILE=/root/.ccr/ca-bundle.crt`). Default voices: Guide `en-US-AndrewMultilingualNeural` at `+3%`, Kid `en-US-BrianNeural` at `+5%` (test others in `edge_tts.list_voices()` and record a better pair in memory). Write the script as alternating lines `GUIDE:` / `KID:`, render each line to its own MP3, then concatenate with ffmpeg (`concat` demuxer, `-c copy`), adding 350 ms of silence between turns and a 1.5 s pause at segment breaks. Normalise loudness (`loudnorm`). Name it `<slug>-episode.mp3`. Check the duration with `ffprobe` and listen to the first minute (transcribe a sample back if you cannot listen).

Paid voices (ElevenLabs, OpenAI, Google) are a `spend` QC item: queue it with the per-episode cost, never buy.

## Deliver

The MP3 (via Artifact `files` or the Drive connector if small enough; else the file card), the show sheet PDF (title, the three ideas, the ten interview questions with answers, sources, "G's pick"), and the script as Markdown. Score against `rubrics/podcast.md` and say the score.
