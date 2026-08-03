# Shradhapp — 3-Phase Plan

**Goal:** One app where Mom records voiceovers, cleans audio, assembles videos/images, exports — plus a permanent media bank. macOS + Windows, personal use only, local-first.

**Stack:** Tauri 2 + Svelte · SQLite (media bank + projects) · FFmpeg (bundled) · Rust backend

---

## Phase 1 — "Assembler"

Kill the app-hopping. Simple but daily-usable.

- Media bank: import video/image/audio; SQLite metadata (tags, date, duration); thumbnails; search; reuse
- Voiceover recorder: mic → auto light cleanup (noise gate, normalize, trim silence via FFmpeg) → saved into bank
- Simple assembler: ordered clip list, numeric start/end trims, one voiceover track, export
- Export presets: "MP4 1080p", "MP4 small (WhatsApp)" — no codec jargon

**Architecture seeds (critical for later phases):**
- Versioned JSON project format (`"version": 1`)
- Single typed Rust `media_engine` module wrapping all FFmpeg calls — UI never shells out
- Command-stack undo/redo from day one

## Phase 2 — "Real Editor"

Full timeline, scoped to her workflow (not CapCut).

- Multi-track drag-and-drop timeline: edge-trim, split at playhead, snapping, zoom
- Real preview: low-res proxies via FFmpeg for smooth scrubbing
- Audio: waveforms, volume envelopes, fades, better denoise, per-clip gain
- Titles + simple transitions (only if she asks)
- Projects: save/open, autosave, duplicate, reuse old sequences
- Export queue + format options

**Hardest part:** compiling timeline → FFmpeg render pipeline (filtergraph or segment-concat). Budget real time.

## Phase 3 — "AI Studio"

100% all-in-one. She never leaves the app.

- Settings → her own API keys (OS keychain, provider-agnostic)
- AI chat sidebar that acts on the timeline via the same command stack as the UI
- Text-to-image / text-to-video via APIs → straight into media bank
- Assistive AI: Whisper transcription (local option), silence auto-cut, captions

**Key rule:** AI layer calls the same typed commands as the UI. No parallel code path.

---

## Locked decisions

1. Tauri 2 + Svelte; FFmpeg bundled in installer (she installs nothing)
2. SQLite from day one — media bank is the backbone
3. Project format versioned from v1
4. Local-first: no accounts, no cloud; network only for opt-in AI APIs
