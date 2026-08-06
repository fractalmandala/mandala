# Desktop Applications

<cite>
**Referenced Files in This Document**
- [fracta tauri.conf.json](file://apps/fracta/src-tauri/tauri.conf.json)
- [shradhapp tauri.conf.json](file://apps/shradhapp/src-tauri/tauri.conf.json)
- [fracta Cargo.toml](file://apps/fracta/src-tauri/Cargo.toml)
- [shradhapp Cargo.toml](file://apps/shradhapp/src-tauri/Cargo.toml)
- [fracta main.rs](file://apps/fracta/src-tauri/src/main.rs)
- [shradhapp main.rs](file://apps/shradhapp/src-tauri/src/main.rs)
- [fracta lib.rs](file://apps/fracta/src-tauri/src/lib.rs)
- [shradhapp lib.rs](file://apps/shradhapp/src-tauri/src/lib.rs)
- [fracta workspace.rs](file://apps/fracta/src-tauri/src/workspace.rs)
- [shradhapp commands.rs](file://apps/shradhapp/src-tauri/src/commands.rs)
- [shradhapp db.rs](file://apps/shradhapp/src-tauri/src/db.rs)
- [shradhapp media_engine.rs](file://apps/shradhapp/src-tauri/src/media_engine.rs)
- [fracta ipc.ts](file://apps/fracta/src/lib/ipc.ts)
- [fracta capabilities default.json](file://apps/fracta/src-tauri/capabilities/default.json)
- [shradhapp capabilities default.json](file://apps/shradhapp/src-tauri/capabilities/default.json)
</cite>

## Table of Contents
1. Introduction
2. Project Structure
3. Core Components
4. Architecture Overview
5. Detailed Component Analysis
6. Dependency Analysis
7. Performance Considerations
8. Troubleshooting Guide
9. Conclusion

## Introduction
This document explains the desktop applications built with Tauri in this monorepo, focusing on two apps: Fracta (a knowledge/workspace app) and Shradhapp (a personal video assembly app). It covers the shared architecture patterns between SvelteKit frontends and Rust/Tauri backends, common approaches for file system operations, database access, cross-platform compatibility, and security boundaries. The content is structured to be accessible to beginners while providing technical depth for experienced developers working with Tauri and Rust.

## Project Structure
Each Tauri app follows a consistent layout:
- Frontend: SvelteKit application under src/
- Backend: Rust crate under src-tauri/ with tauri.conf.json, Cargo.toml, and src/ modules
- Capabilities: Permission sets under src-tauri/capabilities/

```mermaid
graph TB
subgraph "Fracta App"
F_UI["SvelteKit Frontend<br/>src/"]
F_Tauri["Tauri Backend<br/>src-tauri/"]
F_Conf["tauri.conf.json"]
F_Cfg["Cargo.toml"]
F_Caps["capabilities/default.json"]
end
subgraph "Shradhapp App"
S_UI["SvelteKit Frontend<br/>src/"]
S_Tauri["Tauri Backend<br/>src-tauri/"]
S_Conf["tauri.conf.json"]
S_Cfg["Cargo.toml"]
S_Caps["capabilities/default.json"]
end
F_UI --> F_Tauri
S_UI --> S_Tauri
F_Tauri --> F_Conf
F_Tauri --> F_Cfg
F_Tauri --> F_Caps
S_Tauri --> S_Conf
S_Tauri --> S_Cfg
S_Tauri --> S_Caps
```

**Diagram sources**
- [fracta tauri.conf.json](file://apps/fracta/src-tauri/tauri.conf.json)
- [shradhapp tauri.conf.json](file://apps/shradhapp/src-tauri/tauri.conf.json)
- [fracta Cargo.toml](file://apps/fracta/src-tauri/Cargo.toml)
- [shradhapp Cargo.toml](file://apps/shradhapp/src-tauri/Cargo.toml)
- [fracta capabilities default.json](file://apps/fracta/src-tauri/capabilities/default.json)
- [shradhapp capabilities default.json](file://apps/shradhapp/src-tauri/capabilities/default.json)

**Section sources**
- [fracta tauri.conf.json](file://apps/fracta/src-tauri/tauri.conf.json)
- [shradhapp tauri.conf.json](file://apps/shradhapp/src-tauri/tauri.conf.json)

## Core Components
Both apps share a common pattern:
- A minimal main.rs that delegates to a library entry point
- A lib.rs that initializes Tauri, registers state, plugins, and command handlers
- Feature-specific modules implementing business logic (workspace operations, media engine, database)
- Frontend IPC wrappers that call Tauri commands via @tauri-apps/api/core invoke

Key responsibilities:
- Fracta: Workspace filesystem operations, search indexing, auto-tagging rules, local GGUF model server integration, printing, terminal execution sandboxing
- Shradhapp: Media import, thumbnails/waveforms, audio cleanup/tick repair, project CRUD, settings persistence, YouTube channel listing, ffmpeg-based export pipeline

**Section sources**
- [fracta main.rs](file://apps/fracta/src-tauri/src/main.rs)
- [shradhapp main.rs](file://apps/shradhapp/src-tauri/src/main.rs)
- [fracta lib.rs](file://apps/fracta/src-tauri/src/lib.rs)
- [shradhapp lib.rs](file://apps/shradhapp/src-tauri/src/lib.rs)
- [fracta ipc.ts](file://apps/fracta/src/lib/ipc.ts)

## Architecture Overview
The desktop architecture separates UI from privileged operations:
- SvelteKit runs inside the Tauri webview
- All filesystem, DB, and external tool invocations go through typed Tauri commands
- Security is enforced by CSP and capability permissions
- Cross-platform behavior is abstracted behind platform-specific code paths

```mermaid
sequenceDiagram
participant FE as "SvelteKit Frontend"
participant IPC as "Tauri IPC (@tauri-apps/api)"
participant RT as "Rust Runtime"
participant FS as "Filesystem/DB/Tools"
FE->>IPC : invoke("command", args)
IPC->>RT : Dispatch to #[tauri : : command] handler
RT->>FS : Perform secure operation(s)
FS-->>RT : Result or error
RT-->>IPC : Serialized response
IPC-->>FE : Typed Promise result
```

[No sources needed since this diagram shows conceptual workflow, not actual code structure]

## Detailed Component Analysis

### Fracta: Workspace File System and Commands
Fracta exposes a comprehensive set of workspace commands for safe, vault-contained file operations, including reading text with encoding preservation, previewing PDFs and DOCX, asset handling, and recursive traversal with ignore rules.

```mermaid
classDiagram
class Workspace {
+list(root) Vec~WorkspaceItem~
+read(root, relative) WorkspaceFile
+write(root, relative, content) WorkspaceFile
+pdf_bytes(root, relative) Vec~u8~
+image_asset(root, relative) AssetData
+media_asset(root, relative) AssetData
+preview(root, relative) DocumentPreview
+create_folder(root, relative) void
+move_path(root, from, to) void
+delete_path(root, relative) void
+duplicate_path(root, relative) String
+reveal_path(root, relative) void
+open_externally(root, relative) void
}
class Vault {
+current() Option~PathBuf~
+set(config_dir, path) void
+root() PathBuf
}
class AutoTag {
+rules() Vec~AppRule~
+upsert(rule) Vec~AppRule~
+delete(bundle_id) Vec~AppRule~
+current_source() Option~Source~
+tags_for_current() Vec~String~
}
class GgufEngine {
+status() GgufStatus
+load(path) void
+unload() void
}
Workspace --> Vault : "uses root"
```

**Diagram sources**
- [fracta workspace.rs](file://apps/fracta/src-tauri/src/workspace.rs)
- [fracta lib.rs](file://apps/fracta/src-tauri/src/lib.rs)

Key behaviors:
- Path resolution enforces vault containment and prevents symlink escapes
- Text encoding detection preserves UTF-8 BOM and UTF-16 variants; writes re-detect existing encoding
- CSV validation ensures well-formed headers and quotes; delimiter inference supports TSV
- Preview extracts readable text from PDFs and simplified blocks from DOCX without exposing host paths
- Terminal execution is bounded by timeout and output size limits; shells are chosen per OS

Security and safety:
- Only allowed file kinds can be edited; binary assets use a separate write path
- Inline media has a maximum size limit; object URLs keep bytes within the WebView
- Print uses native print surface when available, with window.print fallback

**Section sources**
- [fracta workspace.rs](file://apps/fracta/src-tauri/src/workspace.rs)
- [fracta lib.rs](file://apps/fracta/src-tauri/src/lib.rs)

#### Fracta Command Flow (Example: Read Workspace File)
```mermaid
sequenceDiagram
participant FE as "SvelteKit"
participant IPC as "ipc.ts invoke"
participant CMD as "read_workspace_file"
participant WS as "workspace : : read"
participant FS as "OS FS"
FE->>IPC : readWorkspaceFile(path)
IPC->>CMD : invoke("read_workspace_file", {path})
CMD->>WS : resolve(root, path)
WS->>FS : metadata + read bytes
FS-->>WS : bytes/metadata
WS-->>CMD : WorkspaceFile
CMD-->>IPC : serialized result
IPC-->>FE : Promise<WorkspaceFile>
```

**Diagram sources**
- [fracta ipc.ts](file://apps/fracta/src/lib/ipc.ts)
- [fracta lib.rs](file://apps/fracta/src-tauri/src/lib.rs)
- [fracta workspace.rs](file://apps/fracta/src-tauri/src/workspace.rs)

### Shradhapp: Media Engine, Database, and Commands
Shradhapp centralizes all ffmpeg interactions in a single module, persists data in SQLite, and exposes typed commands for media management, projects, and settings.

```mermaid
classDiagram
class AppState {
+db : Db
+data_dir : PathBuf
+lib_dir : PathBuf
+thumb_dir : PathBuf
+ffmpeg : Result~Ffmpeg,String~
+cancels : HashMap~String,Arc<AtomicBool>~
}
class Ffmpeg {
+locate() Result~Ffmpeg,String~
+probe(input) ProbeInfo
+video_thumbnail(input,out) Result
+image_thumbnail(input,out) Result
+waveform(input,out) Result
+cleanup_audio(input,out) Result
+repair_audio_ticks(input,out) Result
+export(opts,progress,cancel) Result
+export_timeline_v2(opts,progress,cancel) Result
}
class Db {
+open(path) Db
+insert_media(row) Result
+list_media() Vec~MediaRow~
+get_media(id) Result~MediaRow~
+rename_media(id,name) Result
+set_tags(id,tags) Result
+set_notes(id,notes) Result
+delete_media(id) Result~MediaRow~
+upsert_project(id,name,data) Result~ProjectRow~
+list_projects() Vec~ProjectRow~
+get_project(id) Result~ProjectRow~
+delete_project(id) Result
+get_setting(key) Option~SettingRow~
+upsert_setting(key,value) Result~SettingRow~
}
class Commands {
+list_media(state) Vec~MediaRow~
+import_files(state,paths) Vec~MediaRow~
+save_recording(state,b64,ext,name) MediaRow
+cleanup_audio(state,id) CleanupResult
+repair_audio_ticks(state,id) CleanupResult
+list_youtube_channel_videos() Vec~YoutubeVideo~
+get_app_settings(state) AppSettings
+update_app_settings(state,settings) AppSettings
+reset_app_settings(state) AppSettings
+get_runtime_info(state) RuntimeInfo
}
Commands --> AppState : "reads/writes"
Commands --> Ffmpeg : "invokes"
Commands --> Db : "persists"
```

**Diagram sources**
- [shradhapp commands.rs](file://apps/shradhapp/src-tauri/src/commands.rs)
- [shradhapp media_engine.rs](file://apps/shradhapp/src-tauri/src/media_engine.rs)
- [shradhapp db.rs](file://apps/shradhapp/src-tauri/src/db.rs)

Key behaviors:
- ffmpeg discovery searches PATH then platform-specific locations; errors guide installation
- Probing returns duration and dimensions; thumbnails/waveforms generated asynchronously
- Audio cleanup applies filters and loudness normalization; tick repair targets impulsive noise
- Export pipeline normalizes segments, concatenates, and mixes voiceover tracks with progress callbacks
- Settings are normalized and persisted with versioning; runtime info exposes directories and ffmpeg availability

Cross-platform considerations:
- Executable names and fallback directories differ by OS
- Shell invocation for terminal commands chooses cmd/sh based on target_os
- File reveal/open uses open, explorer, or xdg-open depending on platform

**Section sources**
- [shradhapp commands.rs](file://apps/shradhapp/src-tauri/src/commands.rs)
- [shradhapp media_engine.rs](file://apps/shradhapp/src-tauri/src/media_engine.rs)
- [shradhapp db.rs](file://apps/shradhapp/src-tauri/src/db.rs)

#### Shradhapp Command Flow (Example: Import Files)
```mermaid
sequenceDiagram
participant FE as "SvelteKit"
participant IPC as "Tauri invoke"
participant CMD as "import_files"
participant ENG as "Ffmpeg"
participant DB as "Db"
participant FS as "OS FS"
FE->>IPC : import_files(paths)
IPC->>CMD : handler(state, paths)
loop for each path
CMD->>FS : copy to library dir
CMD->>ENG : probe(file)
ENG-->>CMD : duration/dimensions
CMD->>DB : insert MediaRow
end
CMD-->>IPC : Vec~MediaRow~
IPC-->>FE : Promise<Vec~MediaRow~>
```

**Diagram sources**
- [shradhapp commands.rs](file://apps/shradhapp/src-tauri/src/commands.rs)
- [shradhapp media_engine.rs](file://apps/shradhapp/src-tauri/src/media_engine.rs)
- [shradhapp db.rs](file://apps/shradhapp/src-tauri/src/db.rs)

### Shared Patterns Across Apps
- Entry points: main.rs delegates to lib::run(), enabling mobile entry points via cfg attributes
- State management: Tauri .manage() holds long-lived state (Vault, AppState)
- Command registration: generate_handler! maps frontend calls to Rust functions
- Capability-based permissions: explicit allow lists for core, window, dialog, event APIs
- Configuration: tauri.conf.json defines windows, dev/build URLs, CSP, and bundle icons

**Section sources**
- [fracta main.rs](file://apps/fracta/src-tauri/src/main.rs)
- [shradhapp main.rs](file://apps/shradhapp/src-tauri/src/main.rs)
- [fracta lib.rs](file://apps/fracta/src-tauri/src/lib.rs)
- [shradhapp lib.rs](file://apps/shradhapp/src-tauri/src/lib.rs)
- [fracta capabilities default.json](file://apps/fracta/src-tauri/capabilities/default.json)
- [shradhapp capabilities default.json](file://apps/shradhapp/src-tauri/capabilities/default.json)
- [fracta tauri.conf.json](file://apps/fracta/src-tauri/tauri.conf.json)
- [shradhapp tauri.conf.json](file://apps/shradhapp/src-tauri/tauri.conf.json)

## Dependency Analysis
- Fracta dependencies include serde, rusqlite, csv, quick-xml, lopdf, zip, notify, rfd, trash, and Tauri plugins for window state
- Shradhapp dependencies include serde, rusqlite, uuid, base64, reqwest (blocking), and Tauri plugin for dialog

```mermaid
graph LR
FE["SvelteKit Frontend"] --> IPC["@tauri-apps/api/core"]
IPC --> RT["Tauri Runtime"]
RT --> FR["Fracta Lib"]
RT --> SH["Shradhapp Lib"]
FR --> FS["Filesystem"]
FR --> IDX["Search Index"]
SH --> DB["SQLite"]
SH --> FF["FFmpeg/FFprobe"]
SH --> NET["HTTP (reqwest)"]
```

**Diagram sources**
- [fracta Cargo.toml](file://apps/fracta/src-tauri/Cargo.toml)
- [shradhapp Cargo.toml](file://apps/shradhapp/src-tauri/Cargo.toml)

**Section sources**
- [fracta Cargo.toml](file://apps/fracta/src-tauri/Cargo.toml)
- [shradhapp Cargo.toml](file://apps/shradhapp/src-tauri/Cargo.toml)

## Performance Considerations
- Fracta:
  - Workspace watcher updates search index incrementally on events; polling fallback exists for browser previews and transient OS watcher issues
  - Terminal output is bounded in size and time to prevent memory pressure and hangs
  - PDF/DOCX extraction avoids heavy rendering; only text/blocks are returned
- Shradhapp:
  - ffmpeg processes run with progress callbacks and cancellation support
  - Thumbnails/waveforms are generated asynchronously and cached on disk
  - Export pipeline normalizes clips first, then concatenates efficiently; fallback re-encode path improves robustness

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and resolutions:
- Missing ffmpeg:
  - Ensure ffmpeg and ffprobe are installed and discoverable via PATH or standard locations
  - Use get_runtime_info to confirm availability and messages
- Database initialization failures:
  - Check app-data directory permissions; WAL mode is enabled for concurrency
- Workspace path errors:
  - Validate relative paths; ensure no traversal outside vault; check .fractaignore patterns
- Capability errors:
  - Verify capabilities/default.json includes required permissions for dialogs, events, and webview features
- CSP blocking resources:
  - Review tauri.conf.json security.csp directives; allow necessary connect-src origins if needed

**Section sources**
- [shradhapp commands.rs](file://apps/shradhapp/src-tauri/src/commands.rs)
- [shradhapp db.rs](file://apps/shradhapp/src-tauri/src/db.rs)
- [fracta workspace.rs](file://apps/fracta/src-tauri/src/workspace.rs)
- [fracta capabilities default.json](file://apps/fracta/src-tauri/capabilities/default.json)
- [shradhapp capabilities default.json](file://apps/shradhapp/src-tauri/capabilities/default.json)
- [fracta tauri.conf.json](file://apps/fracta/src-tauri/tauri.conf.json)
- [shradhapp tauri.conf.json](file://apps/shradhapp/src-tauri/tauri.conf.json)

## Conclusion
The desktop applications in this monorepo follow a clear, secure, and maintainable pattern: SvelteKit frontends communicate with Rust/Tauri backends through typed commands, keeping privileged operations centralized. Fracta emphasizes safe workspace operations and rich document handling, while Shradhapp focuses on media processing and export pipelines powered by ffmpeg. Both apps leverage capability-based permissions, platform-aware code paths, and persistent storage to deliver cross-platform desktop experiences.