# Bundled ffmpeg binaries

This directory holds ffmpeg/ffprobe binaries that are bundled with the Shradhapp installer via Tauri 2's `bundle.resources` configuration.

## Placement

| Platform | Files to place here |
|----------|-------------------|
| macOS    | `ffmpeg`, `ffprobe` |
| Windows  | `ffmpeg.exe`, `ffprobe.exe` |

The Tauri build maps this directory to `ffmpeg/` inside the installed app, next to the main executable.

## Download sources

- **Windows**: static builds from <https://www.gyan.dev/ffmpeg/builds/> (get the "release full" zip and extract `ffmpeg.exe` + `ffprobe.exe` from `bin/`)
- **macOS**: static builds from <https://evermeet.cx/ffmpeg/> (download both ffmpeg and ffprobe)

## Notes

- The build will only produce a working installer when the binaries are actually present in this directory.
- During development (`cargo tauri dev`), the app falls back to system PATH and platform-typical locations if bundled binaries are missing.
- Use a recent stable ffmpeg release (6.x or 7.x recommended).
