// fractalMedia owned-library engine — streams B2–B5 of docs/plans/media-module-plan.md.
//
// The app owns a single library folder at ~/Documents/Gallery/Fracta. Real mirrored
// folders on disk (D1); an id-keyed sqlite catalog for
// items/tags/pins with library-relative paths (D2); a copy/move import engine with
// disk-space preflight, cancellation and progress events (D3); a split thumbnail
// pipeline without ffmpeg (D4); one debounced courtesy watcher that reconciles
// external edits by rescan-and-diff (D10); search indexing into the shared
// storage.rs FTS index under the 'media' source (B5).

use base64::Engine as _;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Mutex;
use std::time::Duration;
use tauri::{AppHandle, Emitter, Manager};

use crate::storage::{self, IndexDocument};
use crate::AuthorizedPaths;

const MEDIA_DATABASE_FILE: &str = "media.sqlite";
const MEDIA_LIBRARY_FILE: &str = "media-library.json";
const MEDIA_THUMBS_DIR: &str = "media-thumbs";
const FS_EVENT: &str = "media://fs-event";
const IMPORT_PROGRESS_EVENT: &str = "media://import-progress";
const RECENT_WINDOW_MS: i64 = 7 * 24 * 60 * 60 * 1000;
// Refuse imports that would leave less than this much free space (D3 preflight).
const DISK_SPACE_MARGIN_BYTES: u64 = 100 * 1024 * 1024;
const WATCHER_DEBOUNCE_MS: u64 = 400;

// ── Media classification (mirrors MEDIA_EXTENSIONS in src/lib/modules/media/types.ts, D5)

const IMAGE_EXTS: &[&str] = &[
    "png", "jpg", "jpeg", "webp", "avif", "heic", "svg", "ico", "bmp", "tiff",
];
const GIF_EXTS: &[&str] = &["gif"];
const VIDEO_EXTS: &[&str] = &["mp4", "mov", "webm", "mkv", "m4v"];

fn kind_for_ext(ext: &str) -> Option<&'static str> {
    let lower = ext.to_ascii_lowercase();
    if IMAGE_EXTS.contains(&lower.as_str()) {
        Some("image")
    } else if GIF_EXTS.contains(&lower.as_str()) {
        Some("gif")
    } else if VIDEO_EXTS.contains(&lower.as_str()) {
        Some("video")
    } else {
        None
    }
}

fn ext_of(name: &str) -> String {
    match name.rsplit_once('.') {
        Some((stem, ext)) if !stem.is_empty() => ext.to_ascii_lowercase(),
        _ => String::new(),
    }
}

// ── Contract types (serde shapes must match src/lib/modules/media/types.ts) ──────

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MediaLibraryInfo {
    pub base_path: String,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MediaFolder {
    pub path: String,
    pub name: String,
    pub children: Vec<MediaFolder>,
    pub media_count: i64,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MediaItem {
    pub id: String,
    pub rel_path: String,
    pub name: String,
    pub kind: String,
    pub ext: String,
    pub size: i64,
    pub added_ms: i64,
    pub modified_ms: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub width: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub height: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub duration_ms: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub thumbnail: Option<String>,
    pub tags: Vec<String>,
    pub pinned: bool,
}

#[derive(Clone, Deserialize)]
#[serde(tag = "type", rename_all = "lowercase")]
pub enum MediaScope {
    Folder { path: String },
    Section { section: MediaSection },
    Tag { tag: String },
}

#[derive(Clone, Copy, PartialEq, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum MediaSection {
    All,
    Recent,
    Untagged,
    Pinned,
}

#[derive(Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MediaQuery {
    pub scope: MediaScope,
    pub sort: String,
    pub descending: bool,
    pub kinds: Option<Vec<String>>,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MediaTag {
    pub tag: String,
    pub count: i64,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MediaImportProgress {
    pub import_id: String,
    pub done: i64,
    pub total: i64,
    pub skipped: i64,
    pub current_name: String,
    pub finished: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MediaFsEvent {
    pub kind: String,
    pub rel_path: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub new_rel_path: Option<String>,
    pub is_directory: bool,
}

// ── Managed state ────────────────────────────────────────────────────────────────

#[derive(Default)]
pub(crate) struct MediaState {
    base: Mutex<Option<PathBuf>>,
    watcher: Mutex<Option<notify_debouncer_mini::Debouncer<notify::RecommendedWatcher>>>,
    cancelled_imports: Mutex<HashSet<String>>,
    import_seq: AtomicU64,
}

fn now_ms() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}

fn generate_item_id() -> String {
    use rand::Rng;
    let noise: u32 = rand::thread_rng().gen();
    format!("med_{:012x}{:08x}", now_ms(), noise)
}

// ── Library base persistence and validation ──────────────────────────────────────

fn media_base(state: &MediaState) -> Result<PathBuf, String> {
    state
        .base
        .lock()
        .map_err(|_| "Media state lock poisoned")?
        .clone()
        .ok_or_else(|| "MEDIA_LIBRARY_NOT_INITIALIZED".to_string())
}

/// The media module owns exactly this directory. Keeping the root deterministic
/// prevents a folder-picker selection such as `~/Documents/Gallery` from granting
/// media mutations over the user's sibling galleries.
fn owned_library_path(home: &Path) -> PathBuf {
    home.join("Documents").join("Gallery").join("Fracta")
}

fn default_library_path(app: &AppHandle) -> Result<PathBuf, String> {
    let home = app.path().home_dir().map_err(|e| e.to_string())?;
    Ok(owned_library_path(&home))
}

fn ensure_default_library(app: &AppHandle) -> Result<PathBuf, String> {
    let base = default_library_path(app)?;
    fs::create_dir_all(&base).map_err(|e| e.to_string())?;
    Ok(base)
}

fn is_owned_library_path(app: &AppHandle, base: &Path) -> Result<bool, String> {
    let expected = default_library_path(app)?;
    let expected = expected.canonicalize().map_err(|e| e.to_string())?;
    let candidate = base.canonicalize().map_err(|e| e.to_string())?;
    Ok(candidate == expected)
}

fn persist_library(app: &AppHandle, base: &Path) -> Result<(), String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let json = serde_json::json!({ "basePath": base.to_string_lossy() });
    fs::write(
        dir.join(MEDIA_LIBRARY_FILE),
        serde_json::to_vec_pretty(&json).map_err(|e| e.to_string())?,
    )
    .map_err(|e| e.to_string())
}

fn load_persisted_library(app: &AppHandle) -> Option<PathBuf> {
    let file = app.path().app_data_dir().ok()?.join(MEDIA_LIBRARY_FILE);
    let bytes = fs::read(file).ok()?;
    let value: serde_json::Value = serde_json::from_slice(&bytes).ok()?;
    let base = PathBuf::from(value.get("basePath")?.as_str()?);
    base.is_dir().then_some(base)
}

/// Validates a library-relative path ('' = root) and resolves it under the base.
/// Rejects '.'/'..'/empty segments and absolute paths; for existing paths, also
/// verifies the canonicalized result stays inside the canonicalized base (symlinks).
fn resolve_rel(base: &Path, rel: &str) -> Result<(String, PathBuf), String> {
    if Path::new(rel).is_absolute() || rel.contains('\\') || rel.contains('\0') {
        return Err(format!("MEDIA_PATH_ESCAPE:{rel}"));
    }
    let trimmed = rel.trim_matches('/');
    if trimmed.is_empty() {
        return Ok((String::new(), base.to_path_buf()));
    }
    let mut segments = Vec::new();
    for seg in trimmed.split('/') {
        if seg.is_empty() || seg == "." || seg == ".." {
            return Err(format!("MEDIA_PATH_ESCAPE:{rel}"));
        }
        segments.push(seg);
    }
    let normalized = segments.join("/");
    let abs = base.join(&normalized);
    if abs.exists() {
        let canonical = abs.canonicalize().map_err(|e| e.to_string())?;
        let canonical_base = base.canonicalize().map_err(|e| e.to_string())?;
        if !canonical.starts_with(&canonical_base) {
            return Err(format!("MEDIA_PATH_ESCAPE:{rel}"));
        }
    }
    Ok((normalized, abs))
}

fn validate_entry_name(name: &str) -> Result<&str, String> {
    let trimmed = name.trim();
    if trimmed.is_empty()
        || trimmed == "."
        || trimmed == ".."
        || trimmed.contains('/')
        || trimmed.contains('\\')
        || trimmed.contains('\0')
    {
        return Err(format!("MEDIA_INVALID_NAME:{name}"));
    }
    Ok(trimmed)
}

fn rel_parent(rel: &str) -> String {
    match rel.rsplit_once('/') {
        Some((parent, _)) => parent.to_string(),
        None => String::new(),
    }
}

fn rel_basename(rel: &str) -> &str {
    match rel.rsplit_once('/') {
        Some((_, name)) => name,
        None => rel,
    }
}

fn is_hidden(name: &str) -> bool {
    name.starts_with('.')
}

// ── Catalog (media.sqlite) ───────────────────────────────────────────────────────

const MEDIA_MIGRATIONS: &[(i64, &str)] = &[(
    1,
    "CREATE TABLE items (
		id TEXT PRIMARY KEY,
		rel_path TEXT UNIQUE NOT NULL,
		kind TEXT NOT NULL,
		ext TEXT NOT NULL,
		size INTEGER NOT NULL,
		added_ms INTEGER NOT NULL,
		modified_ms INTEGER NOT NULL,
		w INTEGER,
		h INTEGER,
		duration_ms INTEGER
	);
	CREATE INDEX idx_items_rel_path ON items(rel_path);
	CREATE TABLE tags (
		item_id TEXT NOT NULL,
		tag TEXT NOT NULL,
		PRIMARY KEY (item_id, tag)
	);
	CREATE TABLE pins (item_id TEXT PRIMARY KEY);",
)];

fn open_media_db(app: &AppHandle) -> Result<Connection, String> {
    let directory = app.path().app_data_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&directory).map_err(|e| e.to_string())?;
    let mut connection =
        Connection::open(directory.join(MEDIA_DATABASE_FILE)).map_err(|e| e.to_string())?;
    connection
        .busy_timeout(Duration::from_secs(5))
        .map_err(|e| e.to_string())?;
    connection
        .execute_batch(
            "CREATE TABLE IF NOT EXISTS schema_migrations (
				version INTEGER PRIMARY KEY,
				applied_at INTEGER NOT NULL
			);",
        )
        .map_err(|e| e.to_string())?;
    for (version, sql) in MEDIA_MIGRATIONS {
        let applied = connection
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM schema_migrations WHERE version = ?1)",
                params![version],
                |row| row.get::<_, bool>(0),
            )
            .map_err(|e| e.to_string())?;
        if applied {
            continue;
        }
        let tx = connection.transaction().map_err(|e| e.to_string())?;
        tx.execute_batch(sql).map_err(|e| e.to_string())?;
        tx.execute(
            "INSERT INTO schema_migrations (version, applied_at) VALUES (?1, ?2)",
            params![version, now_ms()],
        )
        .map_err(|e| e.to_string())?;
        tx.commit().map_err(|e| e.to_string())?;
    }
    Ok(connection)
}

fn load_items(connection: &Connection) -> Result<Vec<MediaItem>, String> {
    let mut tag_map: HashMap<String, Vec<String>> = HashMap::new();
    {
        let mut stmt = connection
            .prepare("SELECT item_id, tag FROM tags ORDER BY tag")
            .map_err(|e| e.to_string())?;
        let rows = stmt
            .query_map([], |row| {
                Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
            })
            .map_err(|e| e.to_string())?;
        for row in rows {
            let (item_id, tag) = row.map_err(|e| e.to_string())?;
            tag_map.entry(item_id).or_default().push(tag);
        }
    }
    let mut pin_set: HashSet<String> = HashSet::new();
    {
        let mut stmt = connection
            .prepare("SELECT item_id FROM pins")
            .map_err(|e| e.to_string())?;
        let rows = stmt
            .query_map([], |row| row.get::<_, String>(0))
            .map_err(|e| e.to_string())?;
        for row in rows {
            pin_set.insert(row.map_err(|e| e.to_string())?);
        }
    }
    let mut stmt = connection
        .prepare(
            "SELECT id, rel_path, kind, ext, size, added_ms, modified_ms, w, h, duration_ms
			 FROM items",
        )
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, String>(3)?,
                row.get::<_, i64>(4)?,
                row.get::<_, i64>(5)?,
                row.get::<_, i64>(6)?,
                row.get::<_, Option<i64>>(7)?,
                row.get::<_, Option<i64>>(8)?,
                row.get::<_, Option<i64>>(9)?,
            ))
        })
        .map_err(|e| e.to_string())?;
    let mut items = Vec::new();
    for row in rows {
        let (id, rel_path, kind, ext, size, added_ms, modified_ms, w, h, duration_ms) =
            row.map_err(|e| e.to_string())?;
        let mut tags = tag_map.remove(&id).unwrap_or_default();
        tags.sort();
        items.push(MediaItem {
            name: rel_basename(&rel_path).to_string(),
            pinned: pin_set.contains(&id),
            id,
            rel_path,
            kind,
            ext,
            size,
            added_ms,
            modified_ms,
            width: w,
            height: h,
            duration_ms,
            thumbnail: None,
            tags,
        });
    }
    Ok(items)
}

fn index_media_items(app: &AppHandle, items: &[MediaItem]) {
    let docs: Vec<IndexDocument> = items
        .iter()
        .map(|item| IndexDocument {
            source: "media".to_string(),
            doc_id: item.id.clone(),
            title: item.name.clone(),
            body: item.tags.join(" "),
            path: Some(item.rel_path.clone()),
            updated_at: item.modified_ms,
        })
        .collect();
    if let Err(error) = storage::storage_index_documents(app.clone(), docs) {
        eprintln!("media: search indexing failed: {error}");
    }
}

fn unindex_media_items(app: &AppHandle, ids: Vec<String>) {
    if ids.is_empty() {
        return;
    }
    if let Err(error) = storage::storage_remove_documents(app.clone(), "media".to_string(), ids) {
        eprintln!("media: search unindexing failed: {error}");
    }
}

fn emit_fs_event(app: &AppHandle, event: MediaFsEvent) {
    let _ = app.emit(FS_EVENT, event);
}

fn emit_import_progress(app: &AppHandle, progress: MediaImportProgress) {
    let _ = app.emit(IMPORT_PROGRESS_EVENT, progress);
}

// ── Scanning and reconciliation (D10 courtesy watcher) ───────────────────────────

struct ScannedFile {
    rel_path: String,
    size: i64,
    modified_ms: i64,
}

fn scan_media_files(base: &Path) -> Vec<ScannedFile> {
    let mut found = Vec::new();
    let mut stack = vec![base.to_path_buf()];
    while let Some(dir) = stack.pop() {
        let Ok(entries) = fs::read_dir(&dir) else {
            continue;
        };
        for entry in entries.flatten() {
            let path = entry.path();
            let name = entry.file_name().to_string_lossy().into_owned();
            if is_hidden(&name) {
                continue;
            }
            if path.is_dir() {
                stack.push(path);
                continue;
            }
            if kind_for_ext(&ext_of(&name)).is_none() {
                continue;
            }
            let Ok(rel) = path.strip_prefix(base) else {
                continue;
            };
            let rel_path = rel.to_string_lossy().replace('\\', "/");
            let metadata = entry.metadata().ok();
            let size = metadata.as_ref().map(|m| m.len() as i64).unwrap_or(0);
            let modified_ms = metadata
                .and_then(|m| m.modified().ok())
                .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                .map(|d| d.as_millis() as i64)
                .unwrap_or_else(now_ms);
            found.push(ScannedFile {
                rel_path,
                size,
                modified_ms,
            });
        }
    }
    found
}

/// Rescan-and-diff: disk is truth, catalog follows. New files gain catalog rows and
/// 'created' events; vanished files lose rows/thumbs/index docs and get 'removed'.
/// App-initiated mutations update the catalog first, so the watcher's follow-up
/// reconcile finds no diff — reconciliation is idempotent by construction.
fn reconcile_catalog(app: &AppHandle, base: &Path) -> Result<(), String> {
    let connection = open_media_db(app)?;
    let scanned = scan_media_files(base);
    let scanned_by_rel: HashMap<&str, &ScannedFile> =
        scanned.iter().map(|f| (f.rel_path.as_str(), f)).collect();

    let mut existing: HashMap<String, (String, i64, i64)> = HashMap::new(); // rel → (id, size, modified)
    {
        let mut stmt = connection
            .prepare("SELECT rel_path, id, size, modified_ms FROM items")
            .map_err(|e| e.to_string())?;
        let rows = stmt
            .query_map([], |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, i64>(2)?,
                    row.get::<_, i64>(3)?,
                ))
            })
            .map_err(|e| e.to_string())?;
        for row in rows {
            let (rel, id, size, modified) = row.map_err(|e| e.to_string())?;
            existing.insert(rel, (id, size, modified));
        }
    }

    // A Finder rename arrives as one vanished path and one new path. Match only
    // unambiguous size+mtime pairs so tags, pins and thumbnail identity survive;
    // ambiguous copies deliberately fall back to create/remove rather than guessing.
    let mut rename_from_by_to: HashMap<String, String> = HashMap::new();
    let missing: Vec<(&String, &(String, i64, i64))> = existing
        .iter()
        .filter(|(rel, _)| !scanned_by_rel.contains_key(rel.as_str()))
        .collect();
    let added: Vec<&ScannedFile> = scanned
        .iter()
        .filter(|file| !existing.contains_key(&file.rel_path))
        .collect();
    for file in added {
        let candidates: Vec<&String> = missing
            .iter()
            .filter(|(_, (_, size, modified))| *size == file.size && *modified == file.modified_ms)
            .map(|(rel, _)| *rel)
            .collect();
        if candidates.len() == 1 {
            rename_from_by_to.insert(file.rel_path.clone(), candidates[0].clone());
        }
    }

    let mut created = Vec::new();
    let mut renamed_to = Vec::new();
    for file in &scanned {
        match existing.get(file.rel_path.as_str()) {
            None => {
                if let Some(previous_rel) = rename_from_by_to.get(&file.rel_path) {
                    let (id, _, _) = existing.get(previous_rel).expect("rename source exists");
                    connection.execute(
                        "UPDATE items SET rel_path = ?1, size = ?2, modified_ms = ?3 WHERE id = ?4",
                        params![file.rel_path, file.size, file.modified_ms, id],
                    ).map_err(|e| e.to_string())?;
                    renamed_to.push(file.rel_path.clone());
                    emit_fs_event(
                        app,
                        MediaFsEvent {
                            kind: "renamed".into(),
                            rel_path: previous_rel.clone(),
                            new_rel_path: Some(file.rel_path.clone()),
                            is_directory: false,
                        },
                    );
                    continue;
                }
                let ext = ext_of(rel_basename(&file.rel_path));
                let Some(kind) = kind_for_ext(&ext) else {
                    continue;
                };
                let id = generate_item_id();
                connection
                    .execute(
                        "INSERT INTO items (id, rel_path, kind, ext, size, added_ms, modified_ms)
						 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                        params![
                            id,
                            file.rel_path,
                            kind,
                            ext,
                            file.size,
                            now_ms(),
                            file.modified_ms
                        ],
                    )
                    .map_err(|e| e.to_string())?;
                created.push(file.rel_path.clone());
            }
            Some((_, size, _)) if *size != file.size => {
                connection
                    .execute(
                        "UPDATE items SET size = ?1, modified_ms = ?2 WHERE rel_path = ?3",
                        params![file.size, file.modified_ms, file.rel_path],
                    )
                    .map_err(|e| e.to_string())?;
                emit_fs_event(
                    app,
                    MediaFsEvent {
                        kind: "modified".into(),
                        rel_path: file.rel_path.clone(),
                        new_rel_path: None,
                        is_directory: false,
                    },
                );
            }
            _ => {}
        }
    }

    let mut removed_ids = Vec::new();
    for (rel, (id, _, _)) in &existing {
        if rename_from_by_to.values().any(|source| source == rel) {
            continue;
        }
        if !scanned_by_rel.contains_key(rel.as_str()) {
            connection
                .execute("DELETE FROM items WHERE id = ?1", params![id])
                .map_err(|e| e.to_string())?;
            connection
                .execute("DELETE FROM tags WHERE item_id = ?1", params![id])
                .map_err(|e| e.to_string())?;
            connection
                .execute("DELETE FROM pins WHERE item_id = ?1", params![id])
                .map_err(|e| e.to_string())?;
            let _ = fs::remove_file(thumb_path(app, id));
            removed_ids.push(id.clone());
            emit_fs_event(
                app,
                MediaFsEvent {
                    kind: "removed".into(),
                    rel_path: rel.clone(),
                    new_rel_path: None,
                    is_directory: false,
                },
            );
        }
    }
    unindex_media_items(app, removed_ids);

    if !created.is_empty() || !renamed_to.is_empty() {
        let items = load_items(&connection)?;
        let fresh: Vec<MediaItem> = items
            .into_iter()
            .filter(|i| created.contains(&i.rel_path) || renamed_to.contains(&i.rel_path))
            .collect();
        index_media_items(app, &fresh);
        for rel in created {
            emit_fs_event(
                app,
                MediaFsEvent {
                    kind: "created".into(),
                    rel_path: rel,
                    new_rel_path: None,
                    is_directory: false,
                },
            );
        }
    }
    Ok(())
}

fn start_watcher(app: &AppHandle, state: &MediaState, base: &Path) {
    let app_handle = app.clone();
    let watch_base = base.to_path_buf();
    let debouncer = notify_debouncer_mini::new_debouncer(
        Duration::from_millis(WATCHER_DEBOUNCE_MS),
        move |result: notify_debouncer_mini::DebounceEventResult| {
            if result.is_ok() {
                if let Err(error) = reconcile_catalog(&app_handle, &watch_base) {
                    eprintln!("media: watcher reconcile failed: {error}");
                }
            }
        },
    );
    match debouncer {
        Ok(mut debouncer) => {
            if let Err(error) = debouncer
                .watcher()
                .watch(base, notify::RecursiveMode::Recursive)
            {
                eprintln!("media: could not watch library: {error}");
                return;
            }
            if let Ok(mut slot) = state.watcher.lock() {
                *slot = Some(debouncer);
            }
        }
        Err(error) => eprintln!("media: could not create watcher: {error}"),
    }
}

fn stop_watcher(state: &MediaState) {
    if let Ok(mut slot) = state.watcher.lock() {
        *slot = None;
    }
}

fn activate_library(
    app: &AppHandle,
    state: &MediaState,
    authorized: &AuthorizedPaths,
    base: &Path,
) -> Result<(), String> {
    if !is_owned_library_path(app, base)? {
        return Err("MEDIA_LIBRARY_OUTSIDE_OWNED_ROOT".to_string());
    }
    crate::register_and_persist_authorized_path(app, authorized, base)?;
    let scope = app.asset_protocol_scope();
    let _ = scope.allow_directory(base, true);
    if let Ok(thumbs) = app.path().app_data_dir().map(|d| d.join(MEDIA_THUMBS_DIR)) {
        let _ = fs::create_dir_all(&thumbs);
        let _ = scope.allow_directory(&thumbs, false);
    }
    persist_library(app, base)?;
    if let Ok(mut slot) = state.base.lock() {
        *slot = Some(base.to_path_buf());
    }
    reconcile_catalog(app, base)?;
    stop_watcher(state);
    start_watcher(app, state, base);
    Ok(())
}

/// Called from lib.rs setup: restores a previously chosen library on launch.
pub(crate) fn restore_media_library(app: &AppHandle) {
    // A previous version allowed the picker to persist a parent directory such as
    // ~/Documents/Gallery. Never reactivate that broad grant; create and use only
    // the owned Fracta child instead.
    let base = match ensure_default_library(app) {
        Ok(base) => base,
        Err(error) => {
            eprintln!("media: could not create default library: {error}");
            return;
        }
    };
    let state = app.state::<MediaState>();
    let authorized = app.state::<AuthorizedPaths>();
    if let Some(legacy_base) = load_persisted_library(app) {
        if legacy_base != base {
            if let Err(error) =
                crate::revoke_and_persist_authorized_path(app, &authorized, &legacy_base)
            {
                eprintln!("media: could not revoke legacy library grant: {error}");
            }
        }
    }
    if let Err(error) = activate_library(app, &state, &authorized, &base) {
        eprintln!("media: could not restore library: {error}");
    }
}

// ── Commands: library lifecycle ──────────────────────────────────────────────────

#[tauri::command]
pub(crate) fn media_get_library(
    state: tauri::State<'_, MediaState>,
) -> Result<Option<MediaLibraryInfo>, String> {
    Ok(state
        .base
        .lock()
        .map_err(|_| "Media state lock poisoned")?
        .as_ref()
        .map(|base| MediaLibraryInfo {
            base_path: base.to_string_lossy().into_owned(),
        }))
}

#[tauri::command]
pub(crate) async fn media_init_library(
    app: AppHandle,
    state: tauri::State<'_, MediaState>,
    authorized: tauri::State<'_, AuthorizedPaths>,
) -> Result<Option<MediaLibraryInfo>, String> {
    if let Some(existing) = media_get_library(state.clone())? {
        return Ok(Some(existing));
    }
    let base = ensure_default_library(&app)?;
    activate_library(&app, &state, &authorized, &base)?;
    Ok(Some(MediaLibraryInfo {
        base_path: base.to_string_lossy().into_owned(),
    }))
}

#[tauri::command]
pub(crate) async fn media_relocate_library(
    app: AppHandle,
    state: tauri::State<'_, MediaState>,
    authorized: tauri::State<'_, AuthorizedPaths>,
) -> Result<Option<MediaLibraryInfo>, String> {
    let base = ensure_default_library(&app)?;
    activate_library(&app, &state, &authorized, &base)?;
    Ok(Some(MediaLibraryInfo {
        base_path: base.to_string_lossy().into_owned(),
    }))
}

// ── Commands: tree and listing ───────────────────────────────────────────────────

fn build_tree(base: &Path, rel: &str, counts: &HashMap<String, i64>) -> MediaFolder {
    let abs = if rel.is_empty() {
        base.to_path_buf()
    } else {
        base.join(rel)
    };
    let mut children = Vec::new();
    if let Ok(entries) = fs::read_dir(&abs) {
        let mut dirs: Vec<String> = entries
            .flatten()
            .filter(|e| e.path().is_dir())
            .map(|e| e.file_name().to_string_lossy().into_owned())
            .filter(|name| !is_hidden(name))
            .collect();
        dirs.sort();
        for dir in dirs {
            let child_rel = if rel.is_empty() {
                dir.clone()
            } else {
                format!("{rel}/{dir}")
            };
            children.push(build_tree(base, &child_rel, counts));
        }
    }
    let name = if rel.is_empty() {
        base.file_name()
            .map(|n| n.to_string_lossy().into_owned())
            .unwrap_or_else(|| "Library".to_string())
    } else {
        rel_basename(rel).to_string()
    };
    MediaFolder {
        path: rel.to_string(),
        name,
        children,
        media_count: counts.get(rel).copied().unwrap_or(0),
    }
}

#[tauri::command]
pub(crate) fn media_list_tree(
    app: AppHandle,
    state: tauri::State<'_, MediaState>,
) -> Result<MediaFolder, String> {
    let base = media_base(&state)?;
    let connection = open_media_db(&app)?;
    let mut counts: HashMap<String, i64> = HashMap::new();
    {
        let mut stmt = connection
            .prepare("SELECT rel_path FROM items")
            .map_err(|e| e.to_string())?;
        let rows = stmt
            .query_map([], |row| row.get::<_, String>(0))
            .map_err(|e| e.to_string())?;
        for row in rows {
            let rel = row.map_err(|e| e.to_string())?;
            *counts.entry(rel_parent(&rel)).or_insert(0) += 1;
        }
    }
    Ok(build_tree(&base, "", &counts))
}

#[tauri::command]
pub(crate) fn media_list_items(
    app: AppHandle,
    state: tauri::State<'_, MediaState>,
    query: MediaQuery,
) -> Result<Vec<MediaItem>, String> {
    let base = media_base(&state)?;
    let connection = open_media_db(&app)?;
    let mut items = load_items(&connection)?;
    match &query.scope {
        MediaScope::Folder { path } => {
            let (folder, _) = resolve_rel(&base, path)?;
            items.retain(|i| rel_parent(&i.rel_path) == folder);
        }
        MediaScope::Tag { tag } => items.retain(|i| i.tags.contains(tag)),
        MediaScope::Section { section } => match section {
            MediaSection::All => {}
            MediaSection::Recent => {
                let cutoff = now_ms() - RECENT_WINDOW_MS;
                items.retain(|i| i.added_ms >= cutoff);
            }
            MediaSection::Untagged => items.retain(|i| i.tags.is_empty()),
            MediaSection::Pinned => items.retain(|i| i.pinned),
        },
    }
    if let Some(kinds) = &query.kinds {
        if !kinds.is_empty() {
            items.retain(|i| kinds.contains(&i.kind));
        }
    }
    items.sort_by(|a, b| {
        let ordering = match query.sort.as_str() {
            "added" => a.added_ms.cmp(&b.added_ms),
            "modified" => a.modified_ms.cmp(&b.modified_ms),
            "size" => a.size.cmp(&b.size),
            "kind" => a.kind.cmp(&b.kind).then_with(|| a.name.cmp(&b.name)),
            _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
        };
        if query.descending {
            ordering.reverse()
        } else {
            ordering
        }
    });
    Ok(items)
}

#[tauri::command]
pub(crate) fn media_list_all_tags(app: AppHandle) -> Result<Vec<MediaTag>, String> {
    let connection = open_media_db(&app)?;
    let mut stmt = connection
        .prepare("SELECT tag, COUNT(*) FROM tags GROUP BY tag ORDER BY tag")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |row| {
            Ok(MediaTag {
                tag: row.get(0)?,
                count: row.get(1)?,
            })
        })
        .map_err(|e| e.to_string())?;
    let mut tags = Vec::new();
    for row in rows {
        tags.push(row.map_err(|e| e.to_string())?);
    }
    Ok(tags)
}

// ── Commands: import engine (D3) ─────────────────────────────────────────────────

struct PlannedImport {
    source: PathBuf,
    file_name: String,
    kind: &'static str,
    size: u64,
}

fn plan_import(source_paths: &[String]) -> (Vec<PlannedImport>, i64) {
    let mut planned = Vec::new();
    let mut skipped: i64 = 0;
    let mut stack: Vec<PathBuf> = source_paths.iter().map(PathBuf::from).collect();
    while let Some(path) = stack.pop() {
        let name = path
            .file_name()
            .map(|n| n.to_string_lossy().into_owned())
            .unwrap_or_default();
        if name.is_empty() || is_hidden(&name) {
            continue;
        }
        if path.is_dir() {
            if let Ok(entries) = fs::read_dir(&path) {
                for entry in entries.flatten() {
                    stack.push(entry.path());
                }
            }
            continue;
        }
        if !path.is_file() {
            continue;
        }
        match kind_for_ext(&ext_of(&name)) {
            Some(kind) => {
                let size = fs::metadata(&path).map(|m| m.len()).unwrap_or(0);
                planned.push(PlannedImport {
                    source: path,
                    file_name: name,
                    kind,
                    size,
                });
            }
            None => skipped += 1,
        }
    }
    (planned, skipped)
}

/// Picks a collision-free destination inside `dir` ("name 2.ext", "name 3.ext", …).
fn unique_dest(dir: &Path, file_name: &str) -> PathBuf {
    let candidate = dir.join(file_name);
    if !candidate.exists() {
        return candidate;
    }
    let (stem, ext) = match file_name.rsplit_once('.') {
        Some((stem, ext)) if !stem.is_empty() => (stem.to_string(), Some(ext.to_string())),
        _ => (file_name.to_string(), None),
    };
    for suffix in 2.. {
        let name = match &ext {
            Some(ext) => format!("{stem} {suffix}.{ext}"),
            None => format!("{stem} {suffix}"),
        };
        let candidate = dir.join(&name);
        if !candidate.exists() {
            return candidate;
        }
    }
    unreachable!()
}

fn move_or_copy(source: &Path, dest: &Path, mode: &str) -> Result<(), String> {
    if mode == "move" {
        if fs::rename(source, dest).is_ok() {
            return Ok(());
        }
        // Cross-device move: copy then remove.
        fs::copy(source, dest).map_err(|e| e.to_string())?;
        fs::remove_file(source).map_err(|e| e.to_string())
    } else {
        fs::copy(source, dest)
            .map(|_| ())
            .map_err(|e| e.to_string())
    }
}

#[tauri::command]
pub(crate) fn media_import(
    app: AppHandle,
    state: tauri::State<'_, MediaState>,
    source_paths: Vec<String>,
    dest_folder_path: String,
    mode: String,
) -> Result<String, String> {
    let base = media_base(&state)?;
    let (dest_rel, dest_abs) = resolve_rel(&base, &dest_folder_path)?;
    if !dest_abs.is_dir() {
        return Err(format!("MEDIA_NO_SUCH_FOLDER:{dest_folder_path}"));
    }
    let import_id = format!(
        "imp_{}_{}",
        now_ms(),
        state.import_seq.fetch_add(1, Ordering::SeqCst)
    );
    let app_handle = app.clone();
    let import_id_task = import_id.clone();
    let mode_task = mode;
    let sources = source_paths;

    tauri::async_runtime::spawn_blocking(move || {
        let media_state = app_handle.state::<MediaState>();
        let (planned, skipped) = plan_import(&sources);
        let total = planned.len() as i64;

        // D3 preflight: refuse a copy that cannot fit (moves within a volume are free).
        if mode_task == "copy" {
            let needed: u64 = planned.iter().map(|p| p.size).sum();
            let available = fs2::available_space(&dest_abs).unwrap_or(u64::MAX);
            if available < needed + DISK_SPACE_MARGIN_BYTES {
                emit_import_progress(
                    &app_handle,
                    MediaImportProgress {
                        import_id: import_id_task,
                        done: 0,
                        total,
                        skipped,
                        current_name: String::new(),
                        finished: true,
                        error: Some("insufficient-disk-space".into()),
                    },
                );
                return;
            }
        }

        let mut done: i64 = 0;
        for entry in planned {
            let cancelled = media_state
                .cancelled_imports
                .lock()
                .map(|set| set.contains(&import_id_task))
                .unwrap_or(false);
            if cancelled {
                emit_import_progress(
                    &app_handle,
                    MediaImportProgress {
                        import_id: import_id_task.clone(),
                        done,
                        total,
                        skipped,
                        current_name: String::new(),
                        finished: true,
                        error: Some("cancelled".into()),
                    },
                );
                return;
            }
            let dest = unique_dest(&dest_abs, &entry.file_name);
            let dest_name = dest
                .file_name()
                .map(|n| n.to_string_lossy().into_owned())
                .unwrap_or_else(|| entry.file_name.clone());
            match move_or_copy(&entry.source, &dest, &mode_task) {
                Ok(()) => {
                    let rel_path = if dest_rel.is_empty() {
                        dest_name.clone()
                    } else {
                        format!("{dest_rel}/{dest_name}")
                    };
                    let insert = open_media_db(&app_handle).and_then(|connection| {
                        let id = generate_item_id();
                        let ext = ext_of(&dest_name);
                        connection
                            .execute(
                                "INSERT INTO items (id, rel_path, kind, ext, size, added_ms, modified_ms)
								 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                                params![id, rel_path, entry.kind, ext, entry.size as i64, now_ms(), now_ms()],
                            )
                            .map_err(|e| e.to_string())?;
                        let items = load_items(&connection)?;
                        if let Some(item) = items.into_iter().find(|i| i.id == id) {
                            index_media_items(&app_handle, &[item]);
                        }
                        Ok(())
                    });
                    if let Err(error) = insert {
                        eprintln!("media: import catalog insert failed: {error}");
                    }
                    done += 1;
                    emit_import_progress(
                        &app_handle,
                        MediaImportProgress {
                            import_id: import_id_task.clone(),
                            done,
                            total,
                            skipped,
                            current_name: dest_name.clone(),
                            finished: false,
                            error: None,
                        },
                    );
                    emit_fs_event(
                        &app_handle,
                        MediaFsEvent {
                            kind: "created".into(),
                            rel_path: if dest_rel.is_empty() {
                                dest_name
                            } else {
                                format!("{dest_rel}/{dest_name}")
                            },
                            new_rel_path: None,
                            is_directory: false,
                        },
                    );
                }
                Err(error) => {
                    eprintln!("media: import of {:?} failed: {error}", entry.source);
                }
            }
        }
        emit_import_progress(
            &app_handle,
            MediaImportProgress {
                import_id: import_id_task,
                done,
                total,
                skipped,
                current_name: String::new(),
                finished: true,
                error: None,
            },
        );
    });
    Ok(import_id)
}

#[tauri::command]
pub(crate) fn media_cancel_import(
    state: tauri::State<'_, MediaState>,
    import_id: String,
) -> Result<(), String> {
    state
        .cancelled_imports
        .lock()
        .map_err(|_| "Media state lock poisoned")?
        .insert(import_id);
    Ok(())
}

#[tauri::command]
pub(crate) async fn media_pick_import_sources(kind: String) -> Result<Option<Vec<String>>, String> {
    let picked: Option<Vec<PathBuf>> = if kind == "folder" {
        rfd::AsyncFileDialog::new()
            .set_title("Import Folder into Fracta")
            .pick_folders()
            .await
            .map(|handles| handles.iter().map(|h| h.path().to_path_buf()).collect())
    } else {
        let all_exts: Vec<&str> = IMAGE_EXTS
            .iter()
            .chain(GIF_EXTS.iter())
            .chain(VIDEO_EXTS.iter())
            .copied()
            .collect();
        rfd::AsyncFileDialog::new()
            .set_title("Import Files into Fracta")
            .add_filter("Media", &all_exts)
            .pick_files()
            .await
            .map(|handles| handles.iter().map(|h| h.path().to_path_buf()).collect())
    };
    Ok(picked.map(|paths| {
        paths
            .iter()
            .map(|p| p.to_string_lossy().into_owned())
            .collect()
    }))
}

// ── Commands: folder and entry operations ────────────────────────────────────────

#[tauri::command]
pub(crate) fn media_create_folder(
    app: AppHandle,
    state: tauri::State<'_, MediaState>,
    parent_path: String,
    name: String,
) -> Result<(), String> {
    let base = media_base(&state)?;
    let (parent_rel, parent_abs) = resolve_rel(&base, &parent_path)?;
    if !parent_abs.is_dir() {
        return Err(format!("MEDIA_NO_SUCH_FOLDER:{parent_path}"));
    }
    let leaf = validate_entry_name(&name)?;
    let target = parent_abs.join(leaf);
    if target.exists() {
        return Err(format!("MEDIA_FOLDER_EXISTS:{leaf}"));
    }
    fs::create_dir(&target).map_err(|e| e.to_string())?;
    let rel_path = if parent_rel.is_empty() {
        leaf.to_string()
    } else {
        format!("{parent_rel}/{leaf}")
    };
    emit_fs_event(
        &app,
        MediaFsEvent {
            kind: "created".into(),
            rel_path,
            new_rel_path: None,
            is_directory: true,
        },
    );
    Ok(())
}

/// Applies a rel-path prefix move to the catalog (folder rename/move), returning
/// affected items for reindexing.
fn migrate_catalog_prefix(
    connection: &Connection,
    from_rel: &str,
    to_rel: &str,
) -> Result<(), String> {
    let like = format!("{}/%", from_rel.replace('%', "\\%").replace('_', "\\_"));
    let mut stmt = connection
        .prepare(
            "SELECT id, rel_path FROM items WHERE rel_path = ?1 OR rel_path LIKE ?2 ESCAPE '\\'",
        )
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(params![from_rel, like], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
        })
        .map_err(|e| e.to_string())?;
    for row in rows {
        let (id, rel) = row.map_err(|e| e.to_string())?;
        let new_rel = format!("{to_rel}{}", &rel[from_rel.len()..]);
        connection
            .execute(
                "UPDATE items SET rel_path = ?1, modified_ms = ?2 WHERE id = ?3",
                params![new_rel, now_ms(), id],
            )
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

fn relocate_entry(
    app: &AppHandle,
    base: &Path,
    from_rel: &str,
    to_rel: &str,
) -> Result<(), String> {
    let from_abs = base.join(from_rel);
    let to_abs = base.join(to_rel);
    if to_abs.exists() {
        return Err(format!("MEDIA_DEST_EXISTS:{to_rel}"));
    }
    let is_directory = from_abs.is_dir();
    fs::rename(&from_abs, &to_abs).map_err(|e| e.to_string())?;
    let connection = open_media_db(app)?;
    migrate_catalog_prefix(&connection, from_rel, to_rel)?;
    // Reindex everything under the new prefix (path column stores rel_path).
    let items = load_items(&connection)?;
    let moved: Vec<MediaItem> = items
        .into_iter()
        .filter(|i| i.rel_path == to_rel || i.rel_path.starts_with(&format!("{to_rel}/")))
        .collect();
    index_media_items(app, &moved);
    emit_fs_event(
        app,
        MediaFsEvent {
            kind: "renamed".into(),
            rel_path: from_rel.to_string(),
            new_rel_path: Some(to_rel.to_string()),
            is_directory,
        },
    );
    Ok(())
}

#[tauri::command]
pub(crate) fn media_rename_entry(
    app: AppHandle,
    state: tauri::State<'_, MediaState>,
    rel_path: String,
    new_name: String,
) -> Result<String, String> {
    let base = media_base(&state)?;
    let (from_rel, from_abs) = resolve_rel(&base, &rel_path)?;
    if from_rel.is_empty() {
        return Err("MEDIA_CANNOT_RENAME_ROOT".to_string());
    }
    if !from_abs.exists() {
        return Err(format!("MEDIA_NO_SUCH_ENTRY:{rel_path}"));
    }
    let leaf = validate_entry_name(&new_name)?;
    let parent = rel_parent(&from_rel);
    let to_rel = if parent.is_empty() {
        leaf.to_string()
    } else {
        format!("{parent}/{leaf}")
    };
    if to_rel != from_rel {
        relocate_entry(&app, &base, &from_rel, &to_rel)?;
    }
    Ok(to_rel)
}

#[tauri::command]
pub(crate) fn media_move_entries(
    app: AppHandle,
    state: tauri::State<'_, MediaState>,
    rel_paths: Vec<String>,
    dest_folder_path: String,
) -> Result<(), String> {
    let base = media_base(&state)?;
    let (dest_rel, dest_abs) = resolve_rel(&base, &dest_folder_path)?;
    if !dest_abs.is_dir() {
        return Err(format!("MEDIA_NO_SUCH_FOLDER:{dest_folder_path}"));
    }
    for rel_path in rel_paths {
        let (from_rel, from_abs) = resolve_rel(&base, &rel_path)?;
        if from_rel.is_empty() {
            return Err("MEDIA_CANNOT_MOVE_ROOT".to_string());
        }
        if !from_abs.exists() {
            return Err(format!("MEDIA_NO_SUCH_ENTRY:{rel_path}"));
        }
        if dest_rel == from_rel || dest_rel.starts_with(&format!("{from_rel}/")) {
            return Err(format!("MEDIA_MOVE_INTO_SELF:{rel_path}"));
        }
        let to_rel = if dest_rel.is_empty() {
            rel_basename(&from_rel).to_string()
        } else {
            format!("{dest_rel}/{}", rel_basename(&from_rel))
        };
        if to_rel != from_rel {
            relocate_entry(&app, &base, &from_rel, &to_rel)?;
        }
    }
    Ok(())
}

#[tauri::command]
pub(crate) fn media_trash_entries(
    app: AppHandle,
    state: tauri::State<'_, MediaState>,
    rel_paths: Vec<String>,
) -> Result<(), String> {
    let base = media_base(&state)?;
    for rel_path in rel_paths {
        let (target_rel, target_abs) = resolve_rel(&base, &rel_path)?;
        if target_rel.is_empty() {
            return Err("MEDIA_CANNOT_TRASH_ROOT".to_string());
        }
        if !target_abs.exists() {
            return Err(format!("MEDIA_NO_SUCH_ENTRY:{rel_path}"));
        }
        let is_directory = target_abs.is_dir();
        trash::delete(&target_abs).map_err(|e| e.to_string())?;
        let connection = open_media_db(&app)?;
        let like = format!("{}/%", target_rel.replace('%', "\\%").replace('_', "\\_"));
        let mut removed_ids = Vec::new();
        {
            let mut stmt = connection
                .prepare("SELECT id FROM items WHERE rel_path = ?1 OR rel_path LIKE ?2 ESCAPE '\\'")
                .map_err(|e| e.to_string())?;
            let rows = stmt
                .query_map(params![target_rel, like], |row| row.get::<_, String>(0))
                .map_err(|e| e.to_string())?;
            for row in rows {
                removed_ids.push(row.map_err(|e| e.to_string())?);
            }
        }
        for id in &removed_ids {
            connection
                .execute("DELETE FROM items WHERE id = ?1", params![id])
                .map_err(|e| e.to_string())?;
            connection
                .execute("DELETE FROM tags WHERE item_id = ?1", params![id])
                .map_err(|e| e.to_string())?;
            connection
                .execute("DELETE FROM pins WHERE item_id = ?1", params![id])
                .map_err(|e| e.to_string())?;
            let _ = fs::remove_file(thumb_path(&app, id));
        }
        unindex_media_items(&app, removed_ids);
        emit_fs_event(
            &app,
            MediaFsEvent {
                kind: "removed".into(),
                rel_path: target_rel,
                new_rel_path: None,
                is_directory,
            },
        );
    }
    Ok(())
}

// ── Commands: annotations ────────────────────────────────────────────────────────

#[tauri::command]
pub(crate) fn media_set_tags(
    app: AppHandle,
    item_ids: Vec<String>,
    add_tags: Vec<String>,
    remove_tags: Vec<String>,
) -> Result<(), String> {
    let connection = open_media_db(&app)?;
    for id in &item_ids {
        let exists: bool = connection
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM items WHERE id = ?1)",
                params![id],
                |row| row.get(0),
            )
            .map_err(|e| e.to_string())?;
        if !exists {
            return Err(format!("MEDIA_NO_SUCH_ITEM:{id}"));
        }
        for tag in &remove_tags {
            connection
                .execute(
                    "DELETE FROM tags WHERE item_id = ?1 AND tag = ?2",
                    params![id, tag],
                )
                .map_err(|e| e.to_string())?;
        }
        for tag in &add_tags {
            let trimmed = tag.trim();
            if trimmed.is_empty() {
                continue;
            }
            connection
                .execute(
                    "INSERT OR IGNORE INTO tags (item_id, tag) VALUES (?1, ?2)",
                    params![id, trimmed],
                )
                .map_err(|e| e.to_string())?;
        }
        connection
            .execute(
                "UPDATE items SET modified_ms = ?1 WHERE id = ?2",
                params![now_ms(), id],
            )
            .map_err(|e| e.to_string())?;
    }
    let items = load_items(&connection)?;
    let touched: Vec<MediaItem> = items
        .into_iter()
        .filter(|i| item_ids.contains(&i.id))
        .collect();
    index_media_items(&app, &touched);
    Ok(())
}

#[tauri::command]
pub(crate) fn media_set_pinned(
    app: AppHandle,
    item_ids: Vec<String>,
    pinned: bool,
) -> Result<(), String> {
    let connection = open_media_db(&app)?;
    for id in &item_ids {
        if pinned {
            connection
                .execute(
                    "INSERT OR IGNORE INTO pins (item_id) VALUES (?1)",
                    params![id],
                )
                .map_err(|e| e.to_string())?;
        } else {
            connection
                .execute("DELETE FROM pins WHERE item_id = ?1", params![id])
                .map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

// ── Commands: thumbnails and probes (D4) ─────────────────────────────────────────

fn thumb_path(app: &AppHandle, item_id: &str) -> PathBuf {
    app.path()
        .app_data_dir()
        .map(|d| d.join(MEDIA_THUMBS_DIR).join(format!("{item_id}.jpg")))
        .unwrap_or_else(|_| PathBuf::from(format!("{item_id}.jpg")))
}

#[tauri::command]
pub(crate) fn media_get_thumbnail(
    app: AppHandle,
    state: tauri::State<'_, MediaState>,
    item_id: String,
    max_edge: u32,
) -> Result<String, String> {
    let base = media_base(&state)?;
    let cache = thumb_path(&app, &item_id);
    if cache.is_file() {
        return Ok(cache.to_string_lossy().into_owned());
    }
    let connection = open_media_db(&app)?;
    let rel_path: String = connection
        .query_row(
            "SELECT rel_path FROM items WHERE id = ?1",
            params![item_id],
            |row| row.get(0),
        )
        .map_err(|_| format!("MEDIA_NO_SUCH_ITEM:{item_id}"))?;
    let (_, abs) = resolve_rel(&base, &rel_path)?;
    let max_edge = max_edge.clamp(32, 1024);
    let image = image::open(&abs).map_err(|e| format!("MEDIA_THUMBNAIL_FAILED:{e}"))?;
    let thumb = image.thumbnail(max_edge, max_edge).to_rgb8();
    if let Some(parent) = cache.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let file = fs::File::create(&cache).map_err(|e| e.to_string())?;
    let mut writer = std::io::BufWriter::new(file);
    let encoder = image::codecs::jpeg::JpegEncoder::new_with_quality(&mut writer, 80);
    thumb
        .write_with_encoder(encoder)
        .map_err(|e| format!("MEDIA_THUMBNAIL_FAILED:{e}"))?;
    Ok(cache.to_string_lossy().into_owned())
}

#[tauri::command]
pub(crate) fn media_save_video_thumbnail(
    app: AppHandle,
    item_id: String,
    jpeg_base64: String,
) -> Result<String, String> {
    let connection = open_media_db(&app)?;
    let exists: bool = connection
        .query_row(
            "SELECT EXISTS(SELECT 1 FROM items WHERE id = ?1)",
            params![item_id],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;
    if !exists {
        return Err(format!("MEDIA_NO_SUCH_ITEM:{item_id}"));
    }
    let bytes = base64::engine::general_purpose::STANDARD
        .decode(jpeg_base64.trim())
        .map_err(|e| e.to_string())?;
    let cache = thumb_path(&app, &item_id);
    if let Some(parent) = cache.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    fs::write(&cache, bytes).map_err(|e| e.to_string())?;
    Ok(cache.to_string_lossy().into_owned())
}

#[tauri::command]
pub(crate) fn media_set_video_probe(
    app: AppHandle,
    item_id: String,
    width: i64,
    height: i64,
    duration_ms: i64,
) -> Result<(), String> {
    let connection = open_media_db(&app)?;
    let updated = connection
        .execute(
            "UPDATE items SET w = ?1, h = ?2, duration_ms = ?3 WHERE id = ?4",
            params![width, height, duration_ms, item_id],
        )
        .map_err(|e| e.to_string())?;
    if updated == 0 {
        return Err(format!("MEDIA_NO_SUCH_ITEM:{item_id}"));
    }
    Ok(())
}

// ── Tests ────────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn classifies_extensions_like_the_frozen_ts_table() {
        assert_eq!(kind_for_ext("jpg"), Some("image"));
        assert_eq!(kind_for_ext("JPG"), Some("image"));
        assert_eq!(kind_for_ext("svg"), Some("image"));
        assert_eq!(kind_for_ext("gif"), Some("gif"));
        assert_eq!(kind_for_ext("mp4"), Some("video"));
        assert_eq!(kind_for_ext("mov"), Some("video"));
        assert_eq!(kind_for_ext("txt"), None);
        assert_eq!(kind_for_ext(""), None);
    }

    #[test]
    fn rejects_path_escapes_and_accepts_contained_paths() {
        let base = std::env::temp_dir();
        assert!(resolve_rel(&base, "../outside").is_err());
        assert!(resolve_rel(&base, "a/../../b").is_err());
        assert!(resolve_rel(&base, "/etc/passwd").is_err());
        assert!(resolve_rel(&base, "a\\b").is_err());
        let (rel, abs) = resolve_rel(&base, "nested/dir/").expect("contained path accepted");
        assert_eq!(rel, "nested/dir");
        assert!(abs.starts_with(&base));
        let (root_rel, root_abs) = resolve_rel(&base, "").expect("root accepted");
        assert_eq!(root_rel, "");
        assert_eq!(root_abs, base);
    }

    #[test]
    fn owned_library_is_nested_under_documents_gallery_only() {
        let home = Path::new("/Users/example");
        assert_eq!(
            owned_library_path(home),
            PathBuf::from("/Users/example/Documents/Gallery/Fracta")
        );
    }

    #[test]
    fn validates_entry_names() {
        assert!(validate_entry_name("holiday").is_ok());
        assert!(validate_entry_name(" spaced ").is_ok());
        assert!(validate_entry_name("").is_err());
        assert!(validate_entry_name("..").is_err());
        assert!(validate_entry_name("a/b").is_err());
        assert!(validate_entry_name("a\\b").is_err());
    }

    #[test]
    fn collision_suffixes_never_overwrite() {
        let dir = std::env::temp_dir().join(format!("media-test-{}", now_ms()));
        fs::create_dir_all(&dir).unwrap();
        fs::write(dir.join("pic.jpg"), b"a").unwrap();
        let second = unique_dest(&dir, "pic.jpg");
        assert_eq!(second.file_name().unwrap().to_string_lossy(), "pic 2.jpg");
        fs::write(&second, b"b").unwrap();
        let third = unique_dest(&dir, "pic.jpg");
        assert_eq!(third.file_name().unwrap().to_string_lossy(), "pic 3.jpg");
        let _ = fs::remove_dir_all(&dir);
    }

    #[test]
    fn rel_helpers_split_paths() {
        assert_eq!(rel_parent("a/b/c.jpg"), "a/b");
        assert_eq!(rel_parent("c.jpg"), "");
        assert_eq!(rel_basename("a/b/c.jpg"), "c.jpg");
        assert_eq!(rel_basename("c.jpg"), "c.jpg");
        assert_eq!(ext_of("photo.JPG"), "jpg");
        assert_eq!(ext_of("no-extension"), "");
        assert_eq!(ext_of(".hidden"), "");
    }
}
