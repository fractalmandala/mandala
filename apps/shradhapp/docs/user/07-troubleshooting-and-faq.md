---
title: Troubleshooting & FAQ
description: Plain-language fixes for microphone, FFmpeg, permission and export problems, plus answers to common questions.
category: user
id: 7
---

# Troubleshooting & FAQ

Something not working? Find your symptom below — most fixes take less than a minute.

## The microphone is blocked

**What you see:** after clicking the record button, the message *"The microphone is
blocked. Please allow microphone access for this app and try again."*

**Fix:**

- **On a Mac:** open **System Settings → Privacy & Security → Microphone**, find Mom
  Video Studio in the list, and switch it on. Then try recording again.
- **On Windows:** open **Settings → Privacy & security → Microphone**, make sure
  microphone access and "Let apps access your microphone" are on.

The app only ever uses the microphone while you're recording a voiceover.

## "Couldn't find ffmpeg on this computer"

**What you see:** a message mentioning ffmpeg when importing, cleaning up a
recording, or exporting.

**Fix:** install FFmpeg, then fully quit and restart the app.

- **On a Mac:** open Terminal, type `brew install ffmpeg`, press Enter.
- **On Windows:** install FFmpeg and put it either on the system PATH or in the
  folder `C:\ffmpeg\bin` (other standard locations such as
  `C:\Program Files\ffmpeg\bin` are found automatically too).

The app looks for ffmpeg first on the PATH and then in the usual install folders, so
a standard installation is always found after a restart.

## The file-picker or save window doesn't open

**What you see:** clicking **Add videos, photos or audio** or choosing where to save
an export does nothing, or shows a permission error.

**Fix:** fully quit the app and open it again. If it still happens, the app's
permission settings may have been damaged — ask whoever installed the app to check
its configuration (technically: the `capabilities/default.json` file grants the open,
save and message dialogs).

## Export problems

- **"Add at least one clip before exporting" / "Add at least one clip first."** —
  your video has no clips. Add some from the Media Bank strip.
- **"One of the clips is no longer in the Media Bank. Remove it and try again."** —
  media used by this video was deleted from the bank. In the clip list, remove the
  row marked **"⚠️ This media was removed from the bank"**, then export again.
- **"The folder you chose for the export doesn't exist."** — the folder you picked in
  the save window has been moved or renamed. Choose a different folder.
- **"The voiceover must be an audio file."** — the item picked as voiceover isn't an
  audio file. Pick a recording or another audio item instead.
- **Export seems stuck** — very long videos simply take a while; watch the stage
  message. If it's truly stuck, press **Cancel** and try again.

## Where are my files stored?

Everything the app owns lives in its own application-data folder:

- **On a Mac:** `~/Library/Application Support/com.momvideostudio.app/`
- **On Windows:** `C:\Users\<you>\AppData\Roaming\com.momvideostudio.app\`

Inside you'll find:

- `media_bank.db` — the app's catalog (names, tags, notes, projects),
- `library/` — the app's **copies** of your imported files and your recordings,
- `thumbnails/` — the little preview pictures and waveforms.

Your **original** files, wherever they were, are never touched by importing or by
removing something from the bank. Exported videos are saved wherever you chose in the
save window.

## Common questions

**Do I need an account or internet?**
No. The app is fully local — no accounts, no cloud. Internet is never required for
anything in the current version.

**Does importing duplicate my files?**
It makes one copy inside the app's `library/` folder. If disk space is tight, import
from their permanent home (e.g. your Pictures folder) rather than keeping extra
copies around.

**I deleted something from the bank by accident — is my original gone?**
No. Removing from the bank only deletes the app's copy. Your original file is
untouched; just import it again.

**Can I get my recordings out of the app?**
Yes — they're ordinary audio files in the `library/` folder shown above. Easier still:
cleaned voiceovers appear in the Media Bank, and you can find them there by the
`#voiceover` tag.

**Why is my cleaned voiceover shorter than the original?**
Because cleaning trims the silence from the start and end. The app always shows you
*before → after* so nothing is a surprise. Both versions are kept.

**Can two videos share the same clips?**
Yes — projects point at the bank, so one clip can star in many videos. See
[Managing your projects](./06-managing-projects.md).

**Why can't I add a song into the clip list?**
Audio clips join a video as the **voiceover** track, not as list items — pick it in
the Voiceover dropdown. Richer audio options are planned for a future version.
