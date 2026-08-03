---
title: Building & packaging
description: Producing installers with tauri build, macOS/Windows specifics, mic permission, asset protocol scope, and the current external-FFmpeg requirement.
category: developer
id: 6
---

# Building & packaging

## Build command

```bash
pnpm tauri build
```

This runs `beforeBuildCommand` (`pnpm build`, i.e. SvelteKit/Vite build via
`@sveltejs/adapter-static` → `dist/`, matched by `frontendDist: "../dist"`), compiles
the Rust crate in release mode, and bundles installers. `tauri.conf.json` sets
`"bundle": { "active": true, "targets": "all" }` with the icon `icons/icon.png`.

**Outputs per platform:**

- **macOS:** `.app` bundle and `.dmg` image.
- **Windows:** `.msi` and NSIS installers — **build on Windows** to produce them;
  cross-compiling the Windows targets from macOS is not a supported path here.

App identity: `productName` "Shradhapp", identifier
`com.momvideostudio.app`, version `0.1.0`.

## macOS specifics

- **Microphone permission:** `src-tauri/Info.plist` declares
  `NSMicrophoneUsageDescription` = *"Shradhapp needs the microphone to record
  your voiceovers."* Without this the app would be killed on first
  `getUserMedia`; with it, macOS shows the standard consent prompt. If you change the
  recording UX, keep the string accurate.
- FFmpeg discovery prefers Homebrew locations (`/opt/homebrew/bin` on Apple Silicon,
  `/usr/local/bin` on Intel) after `PATH`.

## Windows specifics

- Build the Windows installers on a Windows machine with Rust and the Tauri
  prerequisites installed.
- FFmpeg is found on `PATH` or at `C:\ffmpeg\bin`, `C:\Program Files\ffmpeg\bin`,
  `C:\Program Files (x86)\ffmpeg\bin`, `%LOCALAPPDATA%\ffmpeg\bin`,
  `%LOCALAPPDATA%\Programs\ffmpeg\bin`, or Chocolatey's `%ProgramData%\chocolatey\bin`
  (see `fallback_dirs()` in `media_engine.rs`). Executable names get the `.exe`
  suffix automatically via `exe_name()`.
- WebView2 is a Tauri runtime prerequisite on Windows; the installers handle it.

## Permissions & protocol scope (applies to packaged apps)

- `src-tauri/capabilities/default.json` ships in the bundle and grants the `main`
  window core APIs, event listening (`core:event:default` — required for
  `export-progress`), and the dialog plugin's open/save/message permissions
  (`dialog:allow-open`, `dialog:allow-save`, `dialog:allow-message`). Removing any of
  these breaks the corresponding UI silently at runtime.
- `tauri.conf.json` enables the **asset protocol** with scope `["$APPDATA/**"]`. All
  media playback and thumbnails in the webview go through `convertFileSrc`, so the
  scope must keep covering the app-data dir. If you ever store media elsewhere,
  extend the scope or previews will fail to load.

## FFmpeg: currently external, bundling planned

**Current state:** FFmpeg is **not** bundled. The app locates `ffmpeg`/`ffprobe` on
the host at startup (`Ffmpeg::locate`), and every ffmpeg-dependent action degrades to
a friendly error when they're absent. End users must install FFmpeg themselves
(`brew install ffmpeg` on macOS; on PATH or `C:\ffmpeg\bin` on Windows).

**Planned:** per-platform bundling of ffmpeg/ffprobe into the installers so the user
installs nothing (a locked decision in `plan.md`: *"FFmpeg bundled in installer"*).
When implementing, extend `Ffmpeg::locate()` to check a bundled sidecar/resource path
**before** `PATH`, and register the binaries with Tauri's bundle resources. The rest
of the pipeline needs no changes — everything already goes through the `Ffmpeg`
struct.

## Release checklist

1. `cd src-tauri && cargo test --test media_engine -- --nocapture` (needs ffmpeg).
2. `pnpm tauri build` on macOS and on Windows.
3. Smoke-test the packaged app: import, record (mic prompt), clean up, export all
   three presets, cancel an export.
4. Confirm the packaged app works **without** ffmpeg installed and shows the friendly
   missing-ffmpeg message — then with it.

Related: [Development setup](./02-development-setup.md) · [Roadmap](./07-roadmap.md)
