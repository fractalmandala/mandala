# Shradhapp — Unified Editor

## Summary

Shradhapp is a local-first desktop video editor (Tauri + SvelteKit). The app is a single unified workspace: project management, media library, voiceover recording, audio cleanup, timeline editing, and export all live in one screen. There are no separate "Studio" or "Advanced" tabs — the editor IS the app. A left-side panel provides access to media library and recording alongside the timeline.

## Behavior

### 1. Unified Editor Shell

1. The app renders a single screen: a header bar across the top, a collapsible left-side panel, and the timeline editor filling the remaining space. No tab bar, no view switching, no navigation between modes.

2. The header bar renders (left to right): app title, project controls, media actions, editor settings (fps, aspect ratio), spacer, export button. The header height is 48px with `padding-left: 88px` to clear macOS traffic light buttons.

3. The left-side panel is a vertical column with two tabs: **Library** and **Record**. The panel is collapsible via a toggle button in the header or a resize handle at its right edge. When collapsed, the editor fills the full width. The panel's default state is open (visible).

4. The timeline editor occupies all remaining space not claimed by the header and left panel. It provides the full editing surface: preview stage, transport bar, timeline tracks, inspector panel, and asset bin. The app's left-side Library tab supplements (or replaces) the built-in asset bin for media import and browsing.

5. On startup, the app loads the media library and project list from the backend. If a most-recent project exists (the project with the latest `updated_at`), the app auto-opens it. If no projects exist, the app auto-creates a project named "My Video" and opens it.

6. The app never shows an empty-state screen that blocks editing. Even with no media imported, the editor renders with an empty timeline and the left panel is available for importing or recording.

7. The app supports a dark/light theme toggle. The editor area mirrors the app's theme onto the vendored ref-editor's dark mode class.

### 2. Project Management

1. The header shows the current project name as a clickable element. Clicking it opens a project dropdown listing all saved projects (name + last-updated time), sorted by most recently updated first.

2. The project dropdown includes a "+ New project" action at the top. Selecting it prompts for a project name (inline text field in the dropdown or a small dialog). On confirm, the backend creates the project and the editor switches to it.

3. Selecting a project from the dropdown switches the active project. The editor remounts with the new project's timeline data. Any unsaved edits in the previous project are flushed (auto-save) before the switch.

4. The project dropdown includes a "Delete…" option for each non-active project. Selecting it shows a confirmation dialog ("Delete project 'X'? This cannot be undone."). On confirm, the backend deletes the project and it disappears from the list.

5. The active project cannot be deleted from the dropdown. If the user wants to delete the current project, they must first switch to a different one.

6. Renaming a project is available from the project dropdown (a "Rename…" option). It shows an inline rename field. On confirm, the project name updates in the header and dropdown.

7. If the backend fails to list or create projects (e.g. database error), the app shows a toast notification with the error. The editor still renders — the user can still import media and use the timeline, but changes won't persist until a project is available.

### 3. Media Library (Left Panel — Library Tab)

1. The Library tab shows all media items in the user's media bank (videos, images, audio), sorted by most recently imported first. Each item displays: a thumbnail (or kind icon for audio), filename (truncated), duration (for video/audio), and kind badge.

2. A search field at the top of the Library tab filters items by filename in real time as the user types.

3. Filter buttons below the search field let the user show: All, Videos only, Images only, Audio only. Default is All.

4. An "Import" button at the top of the Library tab opens the native file picker filtered to supported media formats (mp4, mov, mkv, avi, webm, png, jpg, gif, mp3, wav, m4a, etc.). On successful import, the new items appear at the top of the library list. The media store reloads.

5. Drag-and-drop of media files onto the Library tab (or anywhere on the app window) triggers the same import flow: the Tauri webview captures the dropped file paths, sends them to the backend `import_files` command, and the new items appear in the library.

6. Selecting a media item in the library shows a detail card below the list (or in a slide-in overlay): full-size thumbnail or waveform preview, filename, path, duration, dimensions, import date, tags, and notes. The detail card includes action buttons:
   - **Add to timeline** — inserts the item into the editor's bin so it can be dragged onto the timeline.
   - **Delete** — removes the media item from the library (confirmation dialog). The item is also removed from any timeline bins that reference it.
   - **Clean audio** — visible only for audio items. Opens the audio cleanup panel (see §5).
   - **Rename** — inline rename of the item's display name.

7. Right-clicking a media item in the library shows a context menu with the same actions as the detail card.

8. If the media bank is empty, the Library tab shows: "No media yet" with an "Import files" button.

9. The library auto-refreshes when media is imported, deleted, or when a recording is saved — the underlying `mediaStore.load()` is called after each operation.

### 4. Voiceover Recording (Left Panel — Record Tab)

1. The Record tab shows a recording interface: a large record button, elapsed timer, and status indicator. Below the controls, it lists existing audio recordings from the media bank (audio-only items, sorted by most recent).

2. Pressing the record button requests microphone permission (if not already granted). On grant, recording starts immediately: the button changes to a stop button, the timer counts up, and a level meter shows live input volume.

3. If microphone permission is denied, the app shows a clear message: "Microphone access denied. Enable it in System Settings." with no retry button (the user must fix it externally).

4. Pressing the stop button ends the recording. The audio blob is saved to the backend with a timestamped name ("Voiceover — 2026-08-10 14-30-22"). The recording is added to the media bank. If `settings.audio.defaultRepairMode` is `autoAfterRecording`, tick repair runs automatically on the new recording.

5. After recording stops, the UI shows the new recording with two action buttons: **Clean up** (runs `cleanup_audio` — silence removal) and **Repair clicks** (runs `repair_audio_ticks`). Both show a busy spinner while processing and display the result: before/after duration.

6. The recording list below shows each audio item with: filename, duration, and a "Clean" or "Repair" action button. Clicking an item shows its waveform preview and the full set of audio cleanup tools (see §5).

7. The record tab also accepts a command palette trigger: dispatching `start-recording` from the command palette switches to the Record tab and immediately begins recording.

8. If the user switches away from the Record tab while recording is in progress, recording continues in the background. A small indicator dot on the Record tab icon shows recording is active. Switching back shows the timer still counting.

### 5. Audio Cleanup

1. Audio cleanup is available for any audio media item. It is accessed from: (a) the Library tab — select an audio item, click "Clean audio" in the detail card; (b) the Record tab — click a recording in the list; (c) after recording — the post-recording action buttons.

2. When audio cleanup opens, it shows the audio item's waveform visualization (peaks rendered on a canvas), playback controls (play/pause, seek), and a toolbar of cleanup operations.

3. The waveform supports region selection: click and drag to select a time range. The selected region is visually highlighted. Cleanup operations that work on regions (cut, silence, extract, fade) use the selected region as their target.

4. Available audio cleanup and enhancement operations:
   - **Remove silence** — detects silence regions and truncates them. Shows before/after duration. (The "truncate silence" equivalent.)
   - **Noise reduction** — 3-pass noise removal (tonal, broadband, rumble) for background hiss, fan noise, static, and low-level hum.
   - **Noise gate** — mutes audio below a configurable threshold during pauses between speech. Removes room tone, faint movements, breathing during silent gaps.
   - **EQ** — frequency-based equalization: high-pass filter (remove rumble), clarity boost (3-5kHz), mud reduction (200-300Hz).
   - **Repair clicks** — detects and repairs short impulsive clicks/ticks.
   - **Normalize** — adjusts volume to a consistent level.
   - **Compressor** — dynamic range compression for evening out loud/quiet sections.
   - **Reverb / delay / chorus** — audio effects for creative enhancement.
   - **Cut region** — cuts the selected region from the audio. Only enabled when a region is selected.
   - **Silence region** — silences the selected region. Only enabled when a region is selected.
   - **Extract region** — extracts the selected region as a new audio item. Only enabled when a region is selected.
   - **Fade in / Fade out** — applies fade to the start or end of the selected region. Only enabled when a region is selected.
   - **Volume & panning** — per-clip volume and pan controls with fade in/out.
   - **Audio ducking** — auto-reduce background music volume when voice/dialogue plays.

5. Each cleanup operation runs asynchronously. While processing, the button shows a spinner and is disabled. On completion, the waveform refreshes to show the updated audio. A toast notification shows the result (e.g. "Removed 4.2s of silence" or "Repaired 3 clicks").

6. Cleanup operations are non-destructive at the user's choice. Each operation produces a processed result. When the user saves, they choose: **Replace original** (overwrites the source audio file) or **Save as new** (creates a new media item alongside the original). The default is "Save as new."

7. The entire app supports undo/redo for all destructive operations: media delete, audio cleanup, timeline edits (clip add/remove/move/trim/split), project rename/delete. Undo/redo history is per-session and per-project. `Cmd+Z` undoes the last operation; `Cmd+Shift+Z` redoes it. The undo stack shows a brief label of what will be undone (e.g. "Undo: Remove silence").

8. After cleanup, the cleaned audio item is automatically available in the editor's bin (via the media store refresh). If the item was already on the timeline, the timeline references the updated file.

### 6. Timeline Editing + Export

1. The timeline editor is the core of the app. It provides: multi-track timeline with unlimited video, audio, image, text, and graphics tracks; real-time preview with GPU acceleration; precision editing with frame-accurate scrubbing, cut, trim, split, and ripple delete.

2. **Transitions and effects**: crossfade, dip to black/white, wipe, slide transitions between clips. Video effects: brightness, contrast, saturation, blur, sharpen, glow, vignette, chroma key. Blend modes. Speed control 0.25x-4x with audio pitch preservation. Crop and transform with position, scale, rotation.

3. **Text and graphics**: rich text editor with 20+ animations (typewriter, fade, slide, bounce, pop, elastic, glitch). Shape tools (rectangle, circle, arrow, polygon, star). SVG import. Background generator (solid, gradients, mesh, patterns). Keyframe animation system with 20+ easing curves.

4. **Color grading**: color wheels (lift, gamma, gain), HSL adjustments, curves editor, LUT import, built-in presets.

5. The left-side Library tab replaces any built-in asset bin. Media items added from the library appear in the editor's bin data. Dragging from the library onto the timeline adds a clip.

6. FPS and aspect ratio controls live in the header bar. Changes apply to the editor immediately.

7. The Export button in the header triggers the export flow: pick a save path via native dialog, build the export. Supports MP4 (H.264/H.265), WebM (VP8/VP9/AV1), ProRes. Quality presets: 4K@60fps, 1080p, 720p, 480p. Custom bitrate, frame rate, codec options. Audio export: MP3, WAV, AAC, FLAC, OGG. Progress tracking with cancel support.

8. Export errors display as a dismissible error message.

### 7. Keyboard Shortcuts

1. `Cmd+N` — create a new project.
2. `Cmd+O` — open project dropdown (focus the project selector).
3. `Cmd+I` — import media (open file picker).
4. `Cmd+R` — switch to Record tab.
5. `Cmd+Shift+E` — export current project.
6. `Cmd+,` — open settings (future).
7. `Cmd+Shift+P` — open command palette (if implemented).
8. `Space` — play/pause in the timeline (when editor is focused).

### 8. State Transitions

1. **App launch → project loaded**: Backend lists projects → most recent project auto-opens → editor mounts with that project's timeline → library loads media items.

2. **No projects exist → auto-create**: Backend returns empty project list → app creates "My Video" → editor mounts with empty timeline → library shows empty state with import button.

3. **Import media → library updates → editor bin updates**: User imports files → backend `import_files` → media store reloads → library list shows new items → if the editor is mounted, its bin data includes the new items (via `{#key mediaKey}` remount or reactive bin rebuild).

4. **Record → save → library updates → cleanup available**: User records audio → stop → backend `save_recording` → media store reloads → recording appears in Record tab list and Library tab → cleanup buttons available.

5. **Clean audio → waveform updates → library refreshes**: User runs cleanup operation → backend processes → new `MediaItem` returned → waveform refreshes → media store reloads → updated item available in library and timeline.

6. **Switch project → editor remounts**: User selects different project from dropdown → flush current project's auto-save → `activeProject.current` changes → `{#key project.id}` remounts editor with new timeline data.

### 9. Audio Workspace (Harmonized Wavacity)

1. The workspace tab bar shows three tabs: **Video Editor**, **Motion Design**, **Audio**. All three tabs share the same segmented-control styling, typography (Inter, 13px, semibold when active), accent color (emerald), and charcoal surface they sit on. The tab bar is the single navigation surface for the entire app — there is no mode-specific chrome.

2. Switching to the Audio tab replaces the editor surface with the audio workspace. The switch is instantaneous (no loading screen unless the iframe is still cold-loading); the title bar and its project dropdown remain visible and unchanged across the tab transition.

3. The audio workspace renders Wavacity (Audacity compiled to WASM) **inside a themed frame** that visually belongs to the editor. The frame:
   - Has the same charcoal background (`--bg-1`) as the video editor's panels.
   - Carries a slim top chrome strip: the label "Audio" in `fg-2`, a status pill (`Ready` / `Processing…` / `Unsaved changes`), and two action buttons — **Import to Video Editor** and **Save to Disk** — styled identically to the Export button (ToolcraftButton, secondary variant, emerald icon).
   - Uses the same `9px` corner radius, `1px` border in `--border`, and `--shadow-sm` used by other editor panels.
   - Has no visible "frame" border around the iframe itself — the iframe sits edge-to-edge inside the themed container.

4. Inside the iframe, Wavacity's UI is restyled to match the editor's palette:
   - Background surfaces remap from Wavacity's default dark to the editor's `--bg-1` / `--bg-2` / `--bg-3`.
   - Wavacity's blue accent is replaced with the editor's emerald `--accent` (`#10b981` / oklch `0.7 0.15 162`).
   - Track backgrounds, selected clip color, playhead color, waveform color, and toolbar hover states all follow the editor's token set.
   - Typography is Inter (matching the editor) instead of Wavacity's default sans-serif.
   - Toolbar iconography keeps Wavacity's built-in SVGs but strokes are recolored to `--fg-2` (default) and `--fg` (hover/active).
   - Menu bar, status bar, and modal dialogs all inherit the dark charcoal + emerald palette.
   - Scrollbars, focus rings, and selection highlights match the editor's `--accent-glow`.

5. While the user works in Wavacity, the workspace chrome updates reactively:
   - **Status pill**: `Ready` when Wavacity has no unsaved edits; `Unsaved changes` when Wavacity marks the project dirty (detected via postMessage); `Processing…` while Wavacity is running an effect.
   - **Import to Video Editor** button: disabled when there are no audio tracks in Wavacity; enabled otherwise.
   - **Save to Disk** button: always enabled; delegates to the native save dialog and writes the current mixdown.

6. **Import to Video Editor** exports the current Wavacity mixdown as a single audio file (WAV by default, or the format chosen in Settings → Audio → Export format). The export is intercepted by the desktop download handler, saved to `<app-data>/imports/`, and auto-imported into the open video project as a new media item. A toast confirms "Audio imported — <filename>" and the app switches back to the Video Editor tab with the new audio item visible in the media library.

7. If the user is in the Audio tab and has no open project (e.g., they launched into Wavacity before opening anything), the **Import to Video Editor** button prompts: "Open or create a project to import this audio." The user can pick from the project dropdown (which remains accessible) or create a new project from the same header.

8. Audio cleanup operations performed in Wavacity (noise reduction, normalize, EQ, compression, etc.) are non-destructive to the original source files. Wavacity's File → Export produces the processed result; the source media library items are not mutated.

9. The audio workspace is responsive: resizing the window (splitting, fullscreen, panel toggles) reflows the iframe proportionally. The chrome strip stays 40px tall; the iframe fills the remaining height. No horizontal scrollbars appear inside the frame; Wavacity handles its own horizontal scrolling of tracks.

10. Keyboard shortcuts:
    - `Cmd+3` focuses the Audio tab (matches the tab position).
    - `Cmd+1` focuses Video Editor, `Cmd+2` focuses Motion Design.
    - Inside Wavacity, the standard Audacity shortcuts apply (`Space` play/pause, `Cmd+Z` undo, `Cmd+Shift+E` export). Wavacity's own shortcut cheatsheet is accessible from its Help menu.
    - When focus is inside the iframe, the editor's global shortcuts (`Cmd+N`, `Cmd+O`, `Cmd+,`) are still honored via the Tauri menu layer.

11. **Accessibility**: the iframe carries `title="Wavacity audio editor"`, `aria-label="Audio workspace"`, and `role="application"`. The workspace chrome's status pill uses `role="status"` with `aria-live="polite"` so screen readers announce transitions. Focus moving between the chrome buttons and the iframe is indicated by a visible focus ring in `--accent`.

12. **Offline / load failure**: if Wavacity fails to load (network down, SSL failure, CDN unavailable), the audio workspace shows an inline error panel (matching the editor's error-boundary styling) with a **Retry** button. The user can still use the Video Editor and Motion Design tabs normally — the audio workspace failure does not affect them.

13. **Theming**: the audio workspace respects the editor's dark/light toggle. In light mode, Wavacity's surfaces remap to the light-theme tokens (`--bg: #f4f4f6`, `--accent: #10b981`, light borders). In dark mode (the default and the shipped mode), the charcoal+emerald tokens apply.

14. **No Wavacity branding leaks into the editor chrome**: Wavacity's name does not appear in the tab label (the tab is "Audio", not "Wavacity"), the title bar, or any user-facing string. The about/help page inside Wavacity may retain its own attribution — this is acceptable.
