---
title: Data model & project format
description: SQLite schema, the versioned JSON project format with a real example, the media bank directory layout, and tag conventions.
category: developer
id: 5
---

# Data model & project format

All persistent state lives under the Tauri `app_data_dir` for identifier
`com.momvideostudio.app`:

- macOS: `~/Library/Application Support/com.momvideostudio.app/`
- Windows: `%APPDATA%\com.momvideostudio.app\` (e.g. `C:\Users\<you>\AppData\Roaming\...`)

Created at startup in `lib.rs`; nothing is written outside this tree except files the
user explicitly exports.

```
$APPDATA/
├── media_bank.db        # SQLite (WAL mode)
├── library/             # copies of imported media + recordings (originals untouched)
└── thumbnails/          # {id}.jpg for video/image, {id}.png waveforms for audio
```

## SQLite schema

`db.rs` opens `media_bank.db` with `PRAGMA journal_mode = WAL` and creates:

```sql
CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,            -- UUID v4
  kind TEXT NOT NULL,             -- "video" | "image" | "audio"
  filename TEXT NOT NULL,         -- display name (renameable)
  path TEXT NOT NULL,             -- absolute path of the library copy
  imported_at INTEGER NOT NULL,   -- epoch millis
  duration REAL,                  -- seconds; NULL for images
  width INTEGER,
  height INTEGER,
  tags TEXT NOT NULL DEFAULT '[]',-- JSON array of strings
  notes TEXT NOT NULL DEFAULT '',
  thumb_path TEXT                 -- absolute path into thumbnails/, nullable
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,            -- UUID v4
  name TEXT NOT NULL,
  data TEXT NOT NULL,             -- versioned ProjectData JSON blob (see below)
  created_at INTEGER NOT NULL,    -- epoch millis
  updated_at INTEGER NOT NULL
);
```

Notes:

- The schema is created idempotently on first run; there is no migration framework
  yet — schema changes would be added to the `execute_batch` in `Db::open`.
- `upsert_project` preserves the original `created_at` on conflict and always bumps
  `updated_at`; `list_media` orders by `imported_at DESC`, `list_projects` by
  `updated_at DESC`.
- `tags` is a JSON string column, deserialized with `serde_json` (invalid JSON →
  empty array). `width`/`height` are `i64` in Rust but originate from ffprobe `u32`.

## Project format (version 1)

Projects are stored as JSON in `projects.data`. The type is defined twice and kept in
sync: `ProjectData` in `src-tauri/src/commands.rs` and in
`src/lib/backend/types.ts`.

```json
{
  "version": 1,
  "name": "Lily's birthday",
  "clips": [
    { "media_id": "9f2c1a7e-3b…", "trim_start": 0, "trim_end": 8.2 },
    { "media_id": "41d07b55-c9…", "trim_start": 2.0, "trim_end": 6.5 },
    { "media_id": "b83e90d1-77…", "trim_start": 0, "trim_end": 3 }
  ],
  "voiceover_media_id": "5ac4f2d8-ee…",
  "created_at": 1746374400000,
  "updated_at": 1746378120000
}
```

Field semantics:

- `version` — currently always `1`. The write path (`update_project`) **forces**
  `data.version = 1`, so a future v2 has a guaranteed migration hook.
- `clips[]` — ordered; playback order is array order.
- `trim_start` / `trim_end` — seconds. For video/audio these select the used span
  (enforced: `trim_end ≥ trim_start + 0.1` at export). For images, `trim_start` is
  always `0` and `trim_end` is the still-segment length (UI default 3 s, export
  clamps to ≥ 0.5 s).
- `voiceover_media_id` — `null` or the id of a media row whose `kind` is `"audio"`;
  validated at export time.
- Timestamps are epoch millis (`db::now()`).
- `clips` reference media by id only — deleting bank media does not cascade; the UI
  shows a "removed from the bank" marker and export fails fast with a friendly error.

The returned API record is `ProjectRecord { id, name, data, created_at, updated_at }`
where `name`/`updated_at` mirror the JSON blob (kept in sync by the commands).

## Library file layout

Files are copied into `library/` on import — never moved or mutated in place:

| Source | Destination pattern |
| --- | --- |
| Imported file `Family clip.MP4` | `library/{uuid8}-Family clip.MP4` (8-char UUID prefix + sanitized original name, ≤ 120 chars) |
| Saved recording | `library/{uuid8}-recording.{webm|m4a|ogg}` |
| Cleaned voiceover | `library/{uuid8}-cleaned.m4a` |

Display names (`filename`) are stored in the DB, so renames never touch the file on
disk. `delete_media` removes the row, the library copy and the thumbnail.

## Tag conventions

- Normalized on write (`set_tags`): trimmed, leading `#` stripped, lowercased,
  empties dropped.
- UI displays tags as `#tag`; the bank's tag filter menu is built from the union of
  all tags.
- Reserved-by-convention tag: **`voiceover`** — applied automatically by
  `save_recording` and `cleanup_audio`. Nothing enforces it, but the UI and docs rely
  on it to find recordings.

Related: [Rust backend](./03-rust-backend.md) · [Architecture](./01-architecture-overview.md)
