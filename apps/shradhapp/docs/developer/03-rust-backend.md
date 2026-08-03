---
title: Rust backend
description: Module map, the full typed Tauri command surface, the audio cleanup filter chain, the export pipeline, and ffmpeg discovery.
category: developer
id: 3
---

# Rust backend

The backend is a single crate (`src-tauri/`, lib name `mom_video_studio_lib`) with
four modules. The frontend never shells out; every capability below is reached only
through the typed commands.

## Module map

| File | Responsibility |
| --- | --- |
| `lib.rs` | App builder: dialog plugin, app-data dir setup (`library/`, `thumbnails/`), `Db::open`, `Ffmpeg::locate`, `AppState` management, `invoke_handler` registry of all 15 commands. |
| `commands.rs` | The typed `#[tauri::command]` surface plus `AppState`, import pipeline, project serde types, export orchestration and cancellation. |
| `media_engine.rs` | **The only module that spawns ffmpeg/ffprobe.** Typed ops: `probe`, `video_thumbnail`, `image_thumbnail`, `waveform`, `cleanup_audio`, `export`. |
| `db.rs` | `rusqlite` (bundled SQLite, WAL mode): `media` and `projects` tables, `MediaRow`/`ProjectRow`, all CRUD. |

`AppState` (managed in setup):

```rust
pub struct AppState {
    pub db: Mutex<Db>,
    pub lib_dir: PathBuf,                 // $APPDATA/library
    pub thumb_dir: PathBuf,               // $APPDATA/thumbnails
    pub ffmpeg: Result<Ffmpeg, String>,   // Err = friendly "install ffmpeg" message
    pub cancels: Mutex<HashMap<String, Arc<AtomicBool>>>, // export cancel flags by id
}
```

## Command surface (all 15)

Registered in `lib.rs` via `tauri::generate_handler!`; names are the exact invoke
names used by `src/lib/backend/tauri.ts`.

| Command | Signature (Rust, simplified) | What it does |
| --- | --- | --- |
| `list_media` | `(state) -> Vec<MediaRow>` | All media rows, newest first. |
| `import_files` | `(state, paths: Vec<String>) -> Vec<MediaRow>` | Imports each path via `import_one`: kind check by extension, copy into `library/` as `{uuid8}-{sanitized-name}`, `probe` for duration/dimensions, generate thumbnail, insert row. Partial failures are collected; returns `Err` only if *everything* failed. |
| `rename_media` | `(state, id, name)` | Trims; rejects empty names. |
| `set_tags` | `(state, id, tags: Vec<String>)` | Normalizes tags: trim, strip leading `#`, lowercase, drop empties. |
| `set_notes` | `(state, id, notes)` | Stores free-text notes. |
| `delete_media` | `(state, id)` | Deletes the DB row, then removes the library copy and its thumbnail. Originals elsewhere are untouched. |
| `save_recording` | `(state, data_b64, ext, name) -> MediaRow` | Base64-decodes the webview recording, writes `library/{uuid8}-recording.{ext}`, probes it, makes a waveform, inserts a row tagged `["voiceover"]`, filename `{name}.{ext}`. |
| `cleanup_audio` | `(state, id) -> CleanupResult` | Runs the cleanup chain (below) to `library/{uuid8}-cleaned.m4a`, probes before/after durations, inserts a new row named `{base} (cleaned).m4a` tagged `["voiceover"]`, returns `{ cleaned, before_duration, after_duration }`. The source is never modified. |
| `list_projects` | `(state) -> Vec<ProjectRecord>` | All projects, most recently updated first; `data` JSON is parsed into `ProjectData`. |
| `create_project` | `(state, name) -> ProjectRecord` | New v1 `ProjectData` (empty clips, no voiceover; empty name → `"Untitled video"`), new UUID, upsert. |
| `update_project` | `(state, id, data: ProjectData)` | Write-path guard: forces `data.version = 1`, bumps `updated_at`, upserts as a JSON blob. |
| `delete_project` | `(state, id)` | Deletes the project row. |
| `duplicate_project` | `(state, id) -> ProjectRecord` | Deep copy named `{name} copy` with fresh id and timestamps. |
| `export_project` | `async (app, state, id, data, preset, keep_audio, out_path)` | See export pipeline below. Runs on `spawn_blocking`; emits `"export-progress"` events. |
| `cancel_export` | `(state, id)` | Sets the `AtomicBool` for that export id; the ffmpeg runner kills the process. |

Supporting details worth knowing:

- `kind_from_ext` maps extensions to kinds — video: mp4/mov/mkv/avi/webm/m4v/mpg/mpeg;
  image: png/jpg/jpeg/gif/bmp/webp/heic; audio: mp3/wav/m4a/aac/ogg/flac/opus.
  Anything else is rejected with a friendly message.
- `sanitize` strips filename-hostile characters (keeps alphanumerics, `- _ . space`),
  caps at 120 chars, falls back to `"media"`.
- Project serde types live in `commands.rs` and mirror `src/lib/backend/types.ts`:
  `Clip { media_id, trim_start, trim_end }`,
  `ProjectData { version, name, clips, voiceover_media_id, created_at, updated_at }`,
  `ProjectRecord { id, name, data, created_at, updated_at }`.

## Audio cleanup filter chain

`media_engine::cleanup_audio` (invoked by the `cleanup_audio` command) applies, in
order, and encodes AAC 160 kbps into `.m4a`:

```
highpass=f=80
afftdn=nf=-25
silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.25:stop_periods=-1:stop_threshold=-45dB:stop_silence=0.4
loudnorm=I=-16:TP=-1.5:LRA=11
```

i.e. rumble cut → light FFT denoise → leading-silence trim (and trailing via
`stop_periods=-1`) → EBU-ish loudness normalization.

## Export pipeline

`export_project` first resolves every `media_id` through the DB (failing fast if a
clip's media was deleted from the bank), classifies each clip into an
`ExportSegment` — `Video { input, trim_start, trim_end, has_audio }`,
`Still { input, duration }`, or `AudioOnly { input, trim_start, trim_end }` — resolves
the optional voiceover path (must be kind `audio`), maps the preset via
`preset_dims` (`mp4-small` → 1280×720 CRF 28; `mp4-full` and `mov` → 1920×1080
CRF 18), validates the output folder, registers a cancel flag, then calls
`Ffmpeg::export` on a blocking thread.

`Ffmpeg::export` works in a per-process temp dir (`$TMP/mvs-export-{pid}`, always
cleaned up):

1. **Per-segment normalize (0% → 90%, stage "Preparing clips").** Each segment is
   rendered to `seg-NNN.mp4` with
   `scale=W:H:force_original_aspect_ratio=decrease, pad=W:H:(ow-iw)/2:(oh-ih)/2, setsar=1, fps=30, format=yuv420p`,
   encoded `libx264 -preset veryfast -crf {crf}` + AAC 44.1 kHz stereo +
   `+faststart`. Videos are trimmed with `-ss/-t`; when the clip has audio and
   `keep_original_audio` is set the original track is mapped, otherwise a silent
   `anullsrc` track is synthesized. Stills are looped for `duration`; audio-only
   segments get a black `color=` canvas. Uniform codec/params make step 2 cheap.
2. **Concat (90% → 94%, "Joining clips").** Concat demuxer over `concat.txt` with
   `-c copy`; on failure it falls back to a full re-encode
   (`libx264 veryfast crf 18` + AAC).
3. **Audio finishing + final container (94% → 100%, "Mixing audio" → "Finishing up").**
   - voiceover + keep original:
     `[0:a]volume=0.35[a0];[1:a]loudnorm[a1];[a0][a1]amix=inputs=2:duration=first:dropout_transition=3[outa]`
     (original ducked to 35%, voiceover loudnormed, mixed), video stream-copied.
   - voiceover, replace: voiceover `loudnorm`ed, mapped over the video, `-t` clamped
     to the joined duration.
   - no voiceover, keep: `-c copy`.
   - no voiceover, mute: `-an`, video stream-copied.

**Progress & cancellation.** Long ffmpeg runs go through `run_with_progress`, which
adds `-progress pipe:1 -nostats`, parses `out_time_us=` (and `out_time_ms=`, which is
actually microseconds in ffmpeg's output) against the expected duration, drains
stderr on a side thread so a full pipe can't block ffmpeg, and polls the cancel flag
each line — on cancel it kills the child and returns `"Export cancelled"`. The
command layer converts fractions to `"export-progress"` events
`{ id, percent, stage }` via `app.emit`. Non-progress ffmpeg calls use `run_quiet`,
which returns the last 4 stderr lines on failure.

## ffmpeg/ffprobe discovery

`Ffmpeg::locate()` at startup, first match wins:

1. `PATH` (via `find_on_path`, honoring `.exe` on Windows).
2. Platform fallbacks (`fallback_dirs()`): macOS `/opt/homebrew/bin`,
   `/usr/local/bin`, `/usr/bin`; Windows `C:\ffmpeg\bin`,
   `C:\Program Files\ffmpeg\bin`, `C:\Program Files (x86)\ffmpeg\bin`,
   `%LOCALAPPDATA%\ffmpeg\bin`, `%LOCALAPPDATA%\Programs\ffmpeg\bin`,
   `%ProgramData%\chocolatey\bin`; Linux `/usr/bin`, `/usr/local/bin`, `/snap/bin`.
3. If ffmpeg is found but ffprobe isn't, the sibling `ffprobe[.exe]` next to ffmpeg
   is tried before giving up with the `FFMPEG_MISSING` message.

## Thumbnails and waveforms

- `video_thumbnail`: frame at `-ss 1`, `scale=320:-2`, `-q:v 4` → `{id}.jpg`
  (retries without the seek for very short clips).
- `image_thumbnail`: same scale into `{id}.jpg`.
- `waveform`: `showwavespic=s=320x120:split_channels=0:colors=0xd96f4e` → `{id}.png`.

## Permissions

`src-tauri/capabilities/default.json` grants the `main` window: `core:default`,
`core:event:default`, `core:webview:default`, `dialog:default`, `dialog:allow-open`,
`dialog:allow-save`, `dialog:allow-message`. The event permission is what lets the
frontend `listen('export-progress', …)`; the dialog permissions back
`pickImport`/`pickSavePath`. Media playback in the webview works because
`tauri.conf.json` enables the asset protocol scoped to `$APPDATA/**` and the frontend
uses `convertFileSrc`.

Related: [Data model & project format](./05-data-model-and-project-format.md) ·
[Frontend](./04-frontend.md)
