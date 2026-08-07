use portable_pty::{native_pty_system, CommandBuilder, MasterPty, PtySize};
use rand::Rng;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::fs;
use std::io::{BufRead, BufReader, Read, Write};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager, Url};

mod annotations;
mod browser;
mod crypto;
mod dictation;
mod docs_index;
mod media;
mod memory;
mod storage;

// Template menu item IDs — must match the keys in [data/templates.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/data/templates.ts).
// The first entry (`home`) is the boot default and gets the initial checkmark.
const TEMPLATE_MENU_IDS: &[&str] = &[
    "tpl_home",
    "tpl_code",
    "tpl_notes",
    "tpl_design",
    "tpl_blank",
];
const DEFAULT_TEMPLATE_ID: &str = "tpl_home";

// Tracks the AI stream currently allowed to emit events. `run_local_model` and
// `run_api_model` each bump `generation` when they start and capture that value;
// their background thread stops emitting ai-chunk/ai-done as soon as the value it
// captured no longer matches (because a newer stream started, or cancel_ai_stream
// bumped it directly). `child` additionally lets cancel kill a local sidecar process
// outright, which unblocks its background thread's blocking stdout read immediately
// instead of waiting for the next read to time out.
#[derive(Default)]
struct AiStreamState {
    generation: AtomicU64,
    child: Mutex<Option<std::process::Child>>,
}

struct TerminalPtySession {
    child: Box<dyn portable_pty::Child + Send + Sync>,
    master: Box<dyn MasterPty + Send>,
    writer: Box<dyn Write + Send>,
}

#[derive(Default)]
struct TerminalPtyState(Mutex<HashMap<String, TerminalPtySession>>);

#[tauri::command]
fn start_dictation(
    app: AppHandle,
    state: tauri::State<dictation::DictationState>,
    locale: String,
) -> Result<(), String> {
    dictation::start(app, &state, locale)
}

#[tauri::command]
fn stop_dictation(state: tauri::State<dictation::DictationState>) -> Result<(), String> {
    dictation::stop(&state, false)
}

#[tauri::command]
fn cancel_dictation(state: tauri::State<dictation::DictationState>) -> Result<(), String> {
    dictation::stop(&state, true)
}

#[derive(Clone)]
struct ApiKeyRevision {
    before: Vec<(String, String)>,
    after: Vec<(String, String)>,
}

#[derive(Default)]
struct ApiKeyHistory {
    revisions: Vec<ApiKeyRevision>,
    current: usize,
}

#[derive(Default)]
struct ApiKeyHistoryState(Mutex<ApiKeyHistory>);

/// Ephemeral login candidates are deliberately native-only.  The content webview may supply a
/// password to the injected bridge, but chrome only ever receives this public metadata.
#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct PendingCredentialPrompt {
    pub window_id: String,
    pub tab_id: String,
    pub origin: String,
    pub username: String,
}

#[allow(
    dead_code,
    reason = "The password-bearing candidate is intentionally unreachable until the trusted native submit detector is implemented."
)]
#[derive(Clone)]
struct PendingCredential {
    prompt: PendingCredentialPrompt,
    password: String,
}

#[derive(Default)]
pub(crate) struct VaultCredentialBridge {
    pending: Mutex<HashMap<(String, String), PendingCredential>>,
    #[allow(
        dead_code,
        reason = "Origin-level decline persistence is reserved for the trusted native submit detector."
    )]
    declined_origins: Mutex<HashSet<String>>,
}

#[derive(Default)]
pub(crate) struct AuthorizedPaths(Mutex<Vec<PathBuf>>);

const AUTHORIZED_PATHS_FILE: &str = "authorized-paths.json";

fn register_authorized_path(state: &AuthorizedPaths, path: &Path) -> Result<(), String> {
    let canonical = path.canonicalize().map_err(|e| e.to_string())?;
    let root = canonical;
    let mut roots = state
        .0
        .lock()
        .map_err(|_| "Authorized path lock poisoned")?;
    if !roots.iter().any(|existing| existing == &root) {
        roots.push(root);
    }
    Ok(())
}

fn persist_authorized_paths(app: &AppHandle, state: &AuthorizedPaths) -> Result<(), String> {
    let app_data = app.path().app_data_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&app_data).map_err(|e| e.to_string())?;
    let roots = state
        .0
        .lock()
        .map_err(|_| "Authorized path lock poisoned")?;
    let serialized: Vec<String> = roots
        .iter()
        .map(|path| path.to_string_lossy().into_owned())
        .collect();
    let json = serde_json::to_vec_pretty(&serialized).map_err(|e| e.to_string())?;
    fs::write(app_data.join(AUTHORIZED_PATHS_FILE), json).map_err(|e| e.to_string())
}

fn restore_authorized_paths(app: &AppHandle, state: &AuthorizedPaths) -> Result<(), String> {
    let path = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .join(AUTHORIZED_PATHS_FILE);
    if !path.exists() {
        return Ok(());
    }
    let bytes = match fs::read(&path) {
        Ok(bytes) => bytes,
        Err(error) => {
            eprintln!("Could not read persisted filesystem grants: {error}");
            return Ok(());
        }
    };
    let stored: Vec<String> = match serde_json::from_slice(&bytes) {
        Ok(stored) => stored,
        Err(error) => {
            eprintln!("Ignoring malformed persisted filesystem grants: {error}");
            let _ = fs::rename(&path, path.with_extension("corrupt.json"));
            return Ok(());
        }
    };
    for candidate in stored
        .into_iter()
        .map(PathBuf::from)
        .filter(|path| path.exists())
    {
        if let Err(error) = register_authorized_path(state, &candidate) {
            eprintln!("Skipping invalid persisted filesystem grant: {error}");
        }
    }
    Ok(())
}

pub(crate) fn register_and_persist_authorized_path(
    app: &AppHandle,
    state: &AuthorizedPaths,
    path: &Path,
) -> Result<(), String> {
    register_authorized_path(state, path)?;
    persist_authorized_paths(app, state)
}

pub(crate) fn revoke_and_persist_authorized_path(
    app: &AppHandle,
    state: &AuthorizedPaths,
    path: &Path,
) -> Result<bool, String> {
    let canonical = path.canonicalize().map_err(|e| e.to_string())?;
    let removed = {
        let mut roots = state
            .0
            .lock()
            .map_err(|_| "Authorized path lock poisoned")?;
        let previous_len = roots.len();
        roots.retain(|root| root != &canonical);
        roots.len() != previous_len
    };
    if removed {
        persist_authorized_paths(app, state)?;
    }
    Ok(removed)
}

#[tauri::command]
fn list_authorized_paths(authorized: tauri::State<AuthorizedPaths>) -> Result<Vec<String>, String> {
    let roots = authorized
        .0
        .lock()
        .map_err(|_| "Authorized path lock poisoned")?;
    Ok(roots
        .iter()
        .map(|path| path.to_string_lossy().into_owned())
        .collect())
}

#[tauri::command]
fn revoke_authorized_path(
    app: AppHandle,
    authorized: tauri::State<AuthorizedPaths>,
    path: String,
) -> Result<bool, String> {
    let requested = Path::new(&path);
    let canonical = requested
        .canonicalize()
        .unwrap_or_else(|_| requested.to_path_buf());
    let removed = {
        let mut roots = authorized
            .0
            .lock()
            .map_err(|_| "Authorized path lock poisoned")?;
        let previous_len = roots.len();
        roots.retain(|root| root != &canonical);
        roots.len() != previous_len
    };
    if removed {
        persist_authorized_paths(&app, &authorized)?;
    }
    Ok(removed)
}

pub(crate) fn authorized_path(
    state: &AuthorizedPaths,
    path: &Path,
    allow_missing: bool,
) -> Result<PathBuf, String> {
    let candidate = if path.exists() {
        path.canonicalize().map_err(|e| e.to_string())?
    } else if allow_missing {
        let parent = path.parent().ok_or("Path has no parent")?;
        let canonical_parent = parent.canonicalize().map_err(|e| e.to_string())?;
        canonical_parent.join(path.file_name().ok_or("Path has no filename")?)
    } else {
        return Err("Path does not exist".to_string());
    };
    let roots = state
        .0
        .lock()
        .map_err(|_| "Authorized path lock poisoned")?;
    if roots.iter().any(|root| candidate.starts_with(root)) {
        Ok(candidate)
    } else {
        Err("Path is outside the folders selected by the user".to_string())
    }
}

fn validate_leaf_name(name: &str) -> Result<&str, String> {
    let trimmed = name.trim();
    if trimmed.is_empty()
        || trimmed == "."
        || trimmed == ".."
        || trimmed.contains('/')
        || trimmed.contains('\\')
        || trimmed.contains('\0')
        || Path::new(trimmed).is_absolute()
    {
        return Err("Name must be a single file or folder name".to_string());
    }
    Ok(trimmed)
}

#[tauri::command]
fn cancel_ai_stream(state: tauri::State<AiStreamState>) -> Result<(), String> {
    state.generation.fetch_add(1, Ordering::SeqCst);
    let mut child_guard = state
        .child
        .lock()
        .map_err(|_| "AI process lock poisoned".to_string())?;
    if let Some(mut child) = child_guard.take() {
        let _ = child.kill();
    }
    Ok(())
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub size: u64,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TerminalPtyEvent {
    pub session_id: String,
    pub kind: String,
    pub data: String,
}

#[tauri::command]
fn terminal_open(
    app: AppHandle,
    cwd: String,
    cols: u16,
    rows: u16,
    authorized: tauri::State<AuthorizedPaths>,
    terminals: tauri::State<TerminalPtyState>,
) -> Result<String, String> {
    let authorized_cwd = authorized_path(&authorized, Path::new(&cwd), false)?;
    if !authorized_cwd.is_dir() {
        return Err("Terminal cwd must be a directory".to_string());
    }

    let pty_system = native_pty_system();
    let pair = pty_system
        .openpty(PtySize {
            rows: rows.max(8),
            cols: cols.max(20),
            pixel_width: 0,
            pixel_height: 0,
        })
        .map_err(|e| e.to_string())?;

    #[cfg(target_os = "windows")]
    let shell = std::env::var("COMSPEC").unwrap_or_else(|_| "cmd.exe".to_string());
    #[cfg(not(target_os = "windows"))]
    let shell = std::env::var("SHELL").unwrap_or_else(|_| "/bin/zsh".to_string());

    let mut command = CommandBuilder::new(shell);
    command.cwd(&authorized_cwd);

    let child = pair
        .slave
        .spawn_command(command)
        .map_err(|e| e.to_string())?;
    let mut reader = pair.master.try_clone_reader().map_err(|e| e.to_string())?;
    let writer = pair.master.take_writer().map_err(|e| e.to_string())?;
    let session_id = format!("term-{}", rand::thread_rng().gen::<u64>());

    terminals
        .0
        .lock()
        .map_err(|_| "Terminal state lock poisoned")?
        .insert(
            session_id.clone(),
            TerminalPtySession {
                child,
                master: pair.master,
                writer,
            },
        );

    let app_for_output = app.clone();
    let output_session_id = session_id.clone();
    std::thread::spawn(move || {
        let mut buffer = [0u8; 4096];
        loop {
            match reader.read(&mut buffer) {
                Ok(0) => break,
                Err(error) => {
                    let _ = app_for_output.emit(
                        "terminal://event",
                        TerminalPtyEvent {
                            session_id: output_session_id.clone(),
                            kind: "error".to_string(),
                            data: error.to_string(),
                        },
                    );
                    break;
                }
                Ok(n) => {
                    let text = String::from_utf8_lossy(&buffer[..n]).to_string();
                    let _ = app_for_output.emit(
                        "terminal://event",
                        TerminalPtyEvent {
                            session_id: output_session_id.clone(),
                            kind: "data".to_string(),
                            data: text,
                        },
                    );
                }
            }
        }
        let _ = app_for_output.emit(
            "terminal://event",
            TerminalPtyEvent {
                session_id: output_session_id,
                kind: "exit".to_string(),
                data: String::new(),
            },
        );
    });

    Ok(session_id)
}

#[tauri::command]
fn terminal_write(
    session_id: String,
    data: String,
    terminals: tauri::State<TerminalPtyState>,
) -> Result<(), String> {
    let mut sessions = terminals
        .0
        .lock()
        .map_err(|_| "Terminal state lock poisoned")?;
    let session = sessions
        .get_mut(&session_id)
        .ok_or("Terminal session is not active")?;
    session
        .writer
        .write_all(data.as_bytes())
        .map_err(|e| e.to_string())?;
    session.writer.flush().map_err(|e| e.to_string())
}

#[tauri::command]
fn terminal_resize(
    session_id: String,
    cols: u16,
    rows: u16,
    terminals: tauri::State<TerminalPtyState>,
) -> Result<(), String> {
    let mut sessions = terminals
        .0
        .lock()
        .map_err(|_| "Terminal state lock poisoned")?;
    let session = sessions
        .get_mut(&session_id)
        .ok_or("Terminal session is not active")?;
    session
        .master
        .resize(PtySize {
            rows: rows.max(8),
            cols: cols.max(20),
            pixel_width: 0,
            pixel_height: 0,
        })
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn terminal_close(
    session_id: String,
    terminals: tauri::State<TerminalPtyState>,
) -> Result<(), String> {
    let mut sessions = terminals
        .0
        .lock()
        .map_err(|_| "Terminal state lock poisoned")?;
    if let Some(mut session) = sessions.remove(&session_id) {
        let _ = session.child.kill();
    }
    Ok(())
}

pub(crate) fn normalize_browser_url(input: &str) -> Result<Url, String> {
    let value = input.trim();
    if value.is_empty() {
        return Url::parse("https://www.google.com").map_err(|e| e.to_string());
    }

    if let Ok(url) = Url::parse(value) {
        if url.scheme() == "http" || url.scheme() == "https" {
            return Ok(url);
        }
    }

    if value.contains('.') && !value.contains(' ') {
        return Url::parse(&format!("https://{}", value)).map_err(|e| e.to_string());
    }

    Url::parse(&format!(
        "https://www.google.com/search?q={}",
        value.replace(' ', "+")
    ))
    .map_err(|e| e.to_string())
}

#[tauri::command]
fn list_directory(
    path: String,
    authorized: tauri::State<AuthorizedPaths>,
) -> Result<Vec<FileEntry>, String> {
    let authorized_dir = match authorized_path(&authorized, Path::new(&path), false) {
        Ok(path) => path,
        Err(error) if error == "Path is outside the folders selected by the user" => {
            return Err(format!("FS_ACCESS_DENIED:{path}"));
        }
        Err(error) => return Err(error),
    };
    let dir = authorized_dir.as_path();
    if !dir.exists() {
        return Err("Directory does not exist".to_string());
    }
    if !dir.is_dir() {
        return Err("Path is not a directory".to_string());
    }

    let entries = fs::read_dir(dir).map_err(|e| e.to_string())?;
    let mut result = Vec::new();

    for entry in entries.flatten() {
        let metadata = entry.metadata().map_err(|e| e.to_string())?;
        let file_name = entry.file_name().to_string_lossy().into_owned();

        // Skip hidden files/directories (like .git, .DS_Store)
        if file_name.starts_with('.') && file_name != ".agents" && file_name != ".superpowers" {
            continue;
        }

        result.push(FileEntry {
            name: file_name,
            path: entry.path().to_string_lossy().into_owned(),
            is_dir: metadata.is_dir(),
            size: metadata.len(),
        });
    }

    // Sort: directories first, then alphabetical files
    result.sort_by(|a, b| {
        if a.is_dir != b.is_dir {
            b.is_dir.cmp(&a.is_dir)
        } else {
            a.name.to_lowercase().cmp(&b.name.to_lowercase())
        }
    });

    Ok(result)
}

#[tauri::command]
fn read_file(path: String, authorized: tauri::State<AuthorizedPaths>) -> Result<String, String> {
    let authorized_file = authorized_path(&authorized, Path::new(&path), false)?;
    let file_path = authorized_file.as_path();
    if !file_path.exists() {
        return Err("File does not exist".to_string());
    }
    fs::read_to_string(file_path).map_err(|e| e.to_string())
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct EnvProvider {
    pub provider: String,
    pub base_url: Option<String>,
    pub model: Option<String>,
    pub api_format: String,
}

struct EnvProviderConfig {
    provider: String,
    api_key: String,
    base_url: Option<String>,
    model: Option<String>,
    api_format: String,
}

/// (api_key, base_url, model, api_format) accumulated per provider suffix while scanning `.env`.
type ProviderAccum = (
    Option<String>,
    Option<String>,
    Option<String>,
    Option<String>,
);

fn default_env_api_format(provider: &str) -> &'static str {
    match provider.to_ascii_lowercase().as_str() {
        "anthropic" | "claude" => "anthropic",
        "gemini" | "google" => "gemini",
        "ollama" => "ollama",
        _ => "openai",
    }
}

fn normalize_env_api_format(provider: &str, explicit: Option<String>) -> String {
    let requested = explicit
        .as_deref()
        .map(str::trim)
        .map(str::to_ascii_lowercase);
    match requested.as_deref() {
        Some("openai" | "anthropic" | "gemini" | "ollama") => requested.unwrap(),
        _ => default_env_api_format(provider).to_string(),
    }
}

/// Reads `<projectRoot>/.env` and groups entries by the suffix after the
/// `API_KEY_` / `API_LINK_` / `API_MODEL_` prefixes into usable provider configs.
/// e.g. `API_KEY_FOO`, `API_LINK_FOO`, `API_MODEL_FOO` -> provider "foo".
fn read_env_provider_configs(project_path: &str) -> Result<Vec<EnvProviderConfig>, String> {
    use std::collections::HashMap;
    if project_path.is_empty() {
        return Ok(vec![]);
    }
    let env_path = Path::new(project_path).join(".env");
    if !env_path.exists() {
        return Ok(vec![]);
    }
    let content = fs::read_to_string(&env_path).map_err(|e| e.to_string())?;
    let mut map: HashMap<String, ProviderAccum> = HashMap::new();

    for raw in content.lines() {
        let line = raw.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }
        let (key, val) = match line.split_once('=') {
            Some(kv) => kv,
            None => continue,
        };
        let key = key.trim();
        let mut val = val.trim().to_string();
        // Strip a single layer of surrounding quotes.
        if val.len() >= 2
            && ((val.starts_with('"') && val.ends_with('"'))
                || (val.starts_with('\'') && val.ends_with('\'')))
        {
            val = val[1..val.len() - 1].to_string();
        }
        if val.is_empty() {
            continue;
        }

        if let Some(p) = key.strip_prefix("API_KEY_") {
            map.entry(p.to_string()).or_default().0 = Some(val);
        } else if let Some(p) = key.strip_prefix("API_LINK_") {
            map.entry(p.to_string()).or_default().1 = Some(val);
        } else if let Some(p) = key.strip_prefix("API_MODEL_") {
            map.entry(p.to_string()).or_default().2 = Some(val);
        } else if let Some(p) = key.strip_prefix("API_FORMAT_") {
            map.entry(p.to_string()).or_default().3 = Some(val);
        }
    }

    let mut out: Vec<EnvProviderConfig> = map
        .into_iter()
        .filter_map(|(provider, (api_key, base_url, model, api_format))| {
            // Only surface a provider that at least has a key.
            api_key.map(|key| EnvProviderConfig {
                provider: provider.to_lowercase(),
                api_key: key,
                base_url,
                model,
                api_format: normalize_env_api_format(&provider, api_format),
            })
        })
        .collect();
    out.sort_by(|a, b| a.provider.cmp(&b.provider));
    Ok(out)
}

#[tauri::command]
fn read_env_providers(
    project_path: String,
    authorized: tauri::State<AuthorizedPaths>,
) -> Result<Vec<EnvProvider>, String> {
    let project = authorized_path(&authorized, Path::new(&project_path), false)?;
    read_env_provider_configs(project.to_string_lossy().as_ref()).map(|providers| {
        providers
            .into_iter()
            .map(|provider| EnvProvider {
                provider: provider.provider,
                base_url: provider.base_url,
                model: provider.model,
                api_format: provider.api_format,
            })
            .collect()
    })
}

// Mechanically rebuilds docs/INDEX.md from existing frontmatter under docs/adr, docs/design,
// docs/routing, and agents/skills-and-agents.json. Does not draft any new frontmatter content —
// see docs_index.rs. No-ops (returns a zeroed report) if the open workspace isn't this repo, since
// this is project tooling for FractalEngine Studio's own docs, not a generic IDE feature. Called
// lazily from the frontend's idle-triggered docs-index watcher (ide.svelte.ts), never on app load.
#[tauri::command]
fn rebuild_docs_index(
    root_path: String,
    authorized: tauri::State<AuthorizedPaths>,
) -> Result<docs_index::DocsIndexReport, String> {
    if root_path.is_empty() || !Path::new(&root_path).join("docs/INDEX.md").exists() {
        return Ok(docs_index::DocsIndexReport::default());
    }
    let root = authorized_path(&authorized, Path::new(&root_path), false)?;
    docs_index::rebuild(root.to_string_lossy().as_ref())
}

#[tauri::command]
fn write_file(
    path: String,
    content: String,
    authorized: tauri::State<AuthorizedPaths>,
) -> Result<(), String> {
    let authorized_file = authorized_path(&authorized, Path::new(&path), true)?;
    let file_path = authorized_file.as_path();
    if let Some(parent) = file_path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    fs::write(file_path, content).map_err(|e| e.to_string())
}

fn create_new_file(path: &Path, content: &str) -> Result<(), String> {
    let mut file = fs::OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(path)
        .map_err(|error| {
            if error.kind() == std::io::ErrorKind::AlreadyExists {
                "A file with that name already exists".to_string()
            } else {
                error.to_string()
            }
        })?;
    file.write_all(content.as_bytes())
        .map_err(|e| e.to_string())?;
    file.sync_all().map_err(|e| e.to_string())
}

#[tauri::command]
fn create_file(
    path: String,
    content: String,
    authorized: tauri::State<AuthorizedPaths>,
) -> Result<(), String> {
    let authorized_file = authorized_path(&authorized, Path::new(&path), true)?;
    create_new_file(&authorized_file, &content)
}

// --- File Management Commands ---

#[tauri::command]
fn rename_file(
    old_path: String,
    new_name: String,
    authorized: tauri::State<AuthorizedPaths>,
) -> Result<(), String> {
    let authorized_old = authorized_path(&authorized, Path::new(&old_path), false)?;
    let old = authorized_old.as_path();
    let parent = old.parent().ok_or("Cannot determine parent directory")?;
    let new = parent.join(validate_leaf_name(&new_name)?);
    if new == old {
        return Ok(());
    }
    if new.exists() {
        return Err("A file or folder with that name already exists".to_string());
    }
    fs::rename(old, &new).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_file(path: String, authorized: tauri::State<AuthorizedPaths>) -> Result<(), String> {
    let authorized_path = authorized_path(&authorized, Path::new(&path), false)?;
    let p = authorized_path.as_path();
    if p.is_dir() {
        fs::remove_dir_all(p).map_err(|e| e.to_string())
    } else {
        fs::remove_file(p).map_err(|e| e.to_string())
    }
}

#[tauri::command]
fn duplicate_file(path: String, authorized: tauri::State<AuthorizedPaths>) -> Result<(), String> {
    let authorized_src = authorized_path(&authorized, Path::new(&path), false)?;
    let src = authorized_src.as_path();
    if !src.exists() {
        return Err("File does not exist".to_string());
    }
    let parent = src.parent().ok_or("Cannot determine parent directory")?;
    let stem = src.file_stem().and_then(|s| s.to_str()).unwrap_or("file");
    let ext = src
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| format!(".{}", e))
        .unwrap_or_default();
    let mut copy_name = format!("{} (copy){}", stem, ext);
    let mut dest = parent.join(&copy_name);
    let mut n = 2;
    while dest.exists() {
        copy_name = format!("{} (copy {}){}", stem, n, ext);
        dest = parent.join(&copy_name);
        n += 1;
    }
    if src.is_dir() {
        copy_dir_recursive(src, &dest)?;
    } else {
        fs::copy(src, &dest).map_err(|e| e.to_string())?;
    }
    Ok(())
}

// Copies a file or directory to an explicit destination path (unlike duplicate_file, which
// always copies alongside the source with a generated "(copy)" name). Used by the file tree's
// copy/cut-paste, which needs to place the clipboard contents under a caller-chosen target
// directory. Directories are copied recursively via copy_dir_recursive; an existing destination
// directory is merged into (files overwritten) rather than rejected, matching duplicate_file's
// and write_file's existing overwrite-on-conflict behavior for files.
#[tauri::command]
fn copy_path(
    source: String,
    dest: String,
    authorized: tauri::State<AuthorizedPaths>,
) -> Result<(), String> {
    let authorized_src = authorized_path(&authorized, Path::new(&source), false)?;
    let authorized_dest = authorized_path(&authorized, Path::new(&dest), true)?;
    copy_path_impl(authorized_src.as_path(), authorized_dest.as_path())
}

fn copy_path_impl(src: &Path, dest_path: &Path) -> Result<(), String> {
    if !src.exists() {
        return Err("Source does not exist".to_string());
    }
    if src.is_dir() {
        copy_dir_recursive(src, dest_path)
    } else {
        if let Some(parent) = dest_path.parent() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
        fs::copy(src, dest_path)
            .map(|_| ())
            .map_err(|e| e.to_string())
    }
}

fn copy_dir_recursive(src: &Path, dest: &Path) -> Result<(), String> {
    fs::create_dir_all(dest).map_err(|e| e.to_string())?;
    for entry in fs::read_dir(src).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let ty = entry.file_type().map_err(|e| e.to_string())?;
        let src_path = entry.path();
        let dest_path = dest.join(entry.file_name());
        if ty.is_dir() {
            copy_dir_recursive(&src_path, &dest_path)?;
        } else {
            fs::copy(&src_path, &dest_path).map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

// --- New AI & Marketplace Tauri Commands ---

#[tauri::command]
async fn select_download_directory(
    app: AppHandle,
    authorized: tauri::State<'_, AuthorizedPaths>,
    title: Option<String>,
) -> Result<Option<String>, String> {
    let dir = rfd::AsyncFileDialog::new()
        .set_title(title.as_deref().unwrap_or("Select Folder"))
        .pick_folder()
        .await;

    if let Some(handle) = &dir {
        register_and_persist_authorized_path(&app, &authorized, handle.path())?;
    }
    Ok(dir.map(|handle| handle.path().to_string_lossy().into_owned()))
}

/// Opens a native folder picker and grants the selected folder. The renderer can request a
/// starting location, but never grants a path until the user explicitly chooses one.
#[tauri::command]
async fn request_directory_access(
    app: AppHandle,
    authorized: tauri::State<'_, AuthorizedPaths>,
    requested_path: String,
) -> Result<Option<String>, String> {
    let mut dialog = rfd::AsyncFileDialog::new().set_title("Grant Folder Access");
    let requested = Path::new(requested_path.trim());
    if !requested_path.trim().is_empty() && requested.is_dir() {
        dialog = dialog.set_directory(requested);
    }
    let selected = dialog.pick_folder().await;
    if let Some(handle) = &selected {
        register_and_persist_authorized_path(&app, &authorized, handle.path())?;
    }
    Ok(selected.map(|handle| handle.path().to_string_lossy().into_owned()))
}

fn get_sidecar_path(app: &AppHandle) -> Result<PathBuf, String> {
    let resource_dir = app.path().resource_dir().map_err(|e| e.to_string())?;

    // Production: resource_dir/bin/llama.cpp/bin/llama-cli
    let bundled = resource_dir
        .join("bin")
        .join("llama.cpp")
        .join("bin")
        .join("llama-cli");
    if bundled.exists() {
        return Ok(bundled);
    }

    // Dev: CARGO_MANIFEST_DIR is src-tauri/ at compile time — survives cargo clean
    let dev = Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("bin")
        .join("llama.cpp")
        .join("bin")
        .join("llama-cli");
    if dev.exists() {
        return Ok(dev);
    }

    Err(format!(
        "llama-cli executable not found. Tried:\n  {:?}\n  {:?}",
        bundled, dev
    ))
}

fn get_sidecar_lib_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let resource_dir = app.path().resource_dir().map_err(|e| e.to_string())?;

    let bundled = resource_dir.join("bin").join("llama.cpp").join("lib");
    if bundled.exists() {
        return Ok(bundled);
    }

    let dev = Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("bin")
        .join("llama.cpp")
        .join("lib");
    if dev.exists() {
        return Ok(dev);
    }

    Err(format!(
        "llama.cpp lib directory not found. Tried:\n  {:?}\n  {:?}",
        bundled, dev
    ))
}

fn get_mlx_python_path(app: &AppHandle) -> Result<PathBuf, String> {
    let resource_dir = app.path().resource_dir().map_err(|e| e.to_string())?;
    let mlx_rel = Path::new("bin")
        .join("mlx")
        .join("python")
        .join("bin")
        .join("python3");

    // Production: resource_dir/bin/mlx/python/bin/python3
    let bundled = resource_dir.join(&mlx_rel);
    if bundled.exists() {
        return Ok(bundled);
    }

    // Dev: CARGO_MANIFEST_DIR is src-tauri/ at compile time — survives cargo clean
    let dev = Path::new(env!("CARGO_MANIFEST_DIR")).join(&mlx_rel);
    if dev.exists() {
        return Ok(dev);
    }

    Err(format!(
        "MLX Python executable not found. Tried:\n  {:?}\n  {:?}",
        bundled, dev
    ))
}

fn get_mlx_home(app: &AppHandle) -> Result<PathBuf, String> {
    let resource_dir = app.path().resource_dir().map_err(|e| e.to_string())?;
    let mlx_rel = Path::new("bin").join("mlx").join("python");

    let bundled = resource_dir.join(&mlx_rel);
    if bundled.exists() {
        return Ok(bundled);
    }

    let dev = Path::new(env!("CARGO_MANIFEST_DIR")).join(&mlx_rel);
    if dev.exists() {
        return Ok(dev);
    }

    Err("MLX Python home not found".to_string())
}

#[tauri::command]
fn run_local_model(
    app_handle: AppHandle,
    state: tauri::State<AiStreamState>,
    authorized: tauri::State<AuthorizedPaths>,
    model_path: String,
    mmproj_path: Option<String>,
    prompt: String,
) -> Result<(), String> {
    let model_path = authorized_path(&authorized, Path::new(&model_path), false)?
        .to_string_lossy()
        .into_owned();
    let mmproj_path = mmproj_path
        .map(|path| authorized_path(&authorized, Path::new(&path), false))
        .transpose()?
        .map(|path| path.to_string_lossy().into_owned());
    let my_generation = state.generation.fetch_add(1, Ordering::SeqCst) + 1;
    if model_path.to_lowercase().ends_with(".safetensors") {
        return Err(
            "Select the MLX model directory, not an individual safetensors file".to_string(),
        );
    }
    let resolved_model_path = model_path.clone();
    let is_gguf = resolved_model_path.to_lowercase().ends_with(".gguf")
        || model_path.to_lowercase().ends_with(".gguf");

    let mut child = if is_gguf {
        let sidecar_path = get_sidecar_path(&app_handle)?;
        let lib_dir = get_sidecar_lib_dir(&app_handle)?;
        let mut cmd = Command::new(sidecar_path);
        cmd.env("DYLD_LIBRARY_PATH", &lib_dir);
        cmd.arg("-m")
            .arg(&resolved_model_path)
            .arg("-p")
            .arg(&prompt)
            .arg("-n")
            .arg("1024")
            .arg("--no-display-prompt")
            .arg("-st")
            .arg("--simple-io");

        if let Some(ref proj) = mmproj_path {
            if !proj.is_empty() {
                cmd.arg("--mmproj").arg(proj);
            }
        }

        cmd.stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| e.to_string())?
    } else {
        let python_path = get_mlx_python_path(&app_handle)?;
        let mlx_home = get_mlx_home(&app_handle)?;
        // VLMs ship a preprocessor_config.json for their image processor;
        // text-only models don't.  Use this to pick the right module.
        let is_vlm = Path::new(&resolved_model_path)
            .join("preprocessor_config.json")
            .exists();
        let module = if is_vlm { "mlx_vlm" } else { "mlx_lm" };
        let mut cmd = Command::new(python_path);
        cmd.env("VIRTUAL_ENV", mlx_home.to_string_lossy().to_string())
            .env("PATH", mlx_home.join("bin").to_string_lossy().to_string())
            .env("PYTHONNOUSERSITE", "1");
        cmd.arg("-m")
            .arg(module)
            .arg("generate")
            .arg("--model")
            .arg(&resolved_model_path)
            .arg("--prompt")
            .arg(&prompt)
            .arg("--max-tokens")
            .arg("1024");
        // mlx_vlm uses --no-verbose (flag), mlx_lm uses --verbose False (value)
        if is_vlm {
            cmd.arg("--no-verbose");
        } else {
            cmd.arg("--verbose").arg("False");
        }
        cmd.stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| e.to_string())?
    };

    let stdout = child
        .stdout
        .take()
        .ok_or("Failed to open stdout".to_string())?;
    let stderr = child.stderr.take();

    // Track this child so cancel_ai_stream can kill it directly — killing it closes
    // its stdout pipe, which unblocks the background thread's blocking read() below
    // immediately instead of leaving it stuck waiting for more output.
    let mut child_guard = state
        .child
        .lock()
        .map_err(|_| "AI process lock poisoned".to_string())?;
    if let Some(mut old_child) = child_guard.replace(child) {
        let _ = old_child.kill();
    }
    drop(child_guard);

    let app_handle_clone = app_handle.clone();

    std::thread::spawn(move || {
        let mut reader = BufReader::new(stdout);
        let mut buffer = [0u8; 128];
        let mut read_error: Option<String> = None;
        let mut emitted_any = false;

        loop {
            match reader.read(&mut buffer) {
                Ok(0) => break,
                Err(e) => {
                    read_error = Some(e.to_string());
                    break;
                }
                Ok(n) => {
                    let state = app_handle_clone.state::<AiStreamState>();
                    if state.generation.load(Ordering::SeqCst) != my_generation {
                        return;
                    }
                    if let Ok(text) = std::str::from_utf8(&buffer[..n]) {
                        emitted_any = true;
                        let _ = app_handle_clone.emit("ai-chunk", text.to_string());
                    }
                }
            }
        }

        // The process exited without producing any output and without a read error —
        // that's almost always a model/binary failure (bad path, bad args, crash). Check
        // stderr for a reason before reporting it as a normal (empty) completion.
        if read_error.is_none() && !emitted_any {
            if let Some(mut err_pipe) = stderr {
                let mut err_text = String::new();
                let _ = err_pipe.read_to_string(&mut err_text);
                let err_text = err_text.trim();
                if !err_text.is_empty() {
                    // Python tracebacks dump many lines; surface only the final
                    // error line (e.g. "ValueError: …") so the UI stays clean.
                    let summary = if err_text.contains("Traceback (most recent call last)") {
                        err_text
                            .lines()
                            .rev()
                            .find(|l| !l.is_empty())
                            .unwrap_or(err_text)
                    } else {
                        err_text
                    };
                    read_error = Some(summary.to_string());
                }
            }
        }

        let state = app_handle_clone.state::<AiStreamState>();
        if state.generation.load(Ordering::SeqCst) != my_generation {
            return;
        }
        if let Some(err) = read_error {
            let _ = app_handle_clone.emit("ai-error", err);
        } else {
            let _ = app_handle_clone.emit("ai-done", ());
        }
    });

    Ok(())
}

// `download_model`/`install_skill` fetch URLs that can originate from LLM output or
// remote skill listings, not just direct user input — restrict them to public http(s)
// hosts so they can't be used to reach loopback/private/link-local services (SSRF).
// `run_api_model`'s base_url is deliberately exempt: pointing it at localhost (Ollama,
// LM Studio, etc.) is the whole point of that feature.
fn validate_public_url(url_str: &str) -> Result<(), String> {
    let parsed = Url::parse(url_str).map_err(|e| format!("Invalid URL: {}", e))?;
    if parsed.scheme() != "http" && parsed.scheme() != "https" {
        return Err(format!("Unsupported URL scheme: {}", parsed.scheme()));
    }
    let host = parsed
        .host_str()
        .ok_or_else(|| "URL has no host".to_string())?;
    let port = parsed.port_or_known_default().unwrap_or(80);
    use std::net::ToSocketAddrs;
    let addrs = (host, port)
        .to_socket_addrs()
        .map_err(|e| format!("Could not resolve host: {}", e))?;
    for addr in addrs {
        let blocked = match addr.ip() {
            std::net::IpAddr::V4(v4) => {
                v4.is_loopback() || v4.is_private() || v4.is_link_local() || v4.is_unspecified()
            }
            std::net::IpAddr::V6(v6) => {
                v6.is_loopback() || v6.is_unspecified() || (v6.segments()[0] & 0xfe00) == 0xfc00
            }
        };
        if blocked {
            return Err(format!(
                "URL resolves to a disallowed address: {}",
                addr.ip()
            ));
        }
    }
    Ok(())
}

fn validate_api_url(url_str: &str) -> Result<(), String> {
    let parsed = Url::parse(url_str).map_err(|e| format!("Invalid URL: {}", e))?;
    if parsed.scheme() != "http" && parsed.scheme() != "https" {
        return Err(format!("Unsupported URL scheme: {}", parsed.scheme()));
    }
    Ok(())
}

#[tauri::command]
fn download_model(
    app_handle: AppHandle,
    authorized: tauri::State<AuthorizedPaths>,
    url: String,
    target_path: String,
) -> Result<(), String> {
    validate_public_url(&url)?;
    let path = authorized_path(&authorized, Path::new(&target_path), true)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    let app_handle_clone = app_handle.clone();

    std::thread::spawn(move || {
        let result = (|| -> Result<(), String> {
            // Redirects must not be followed blindly: validation only covers the original URL,
            // while a redirect could otherwise target loopback or private network services.
            let agent = ureq::AgentBuilder::new().redirects(0).build();
            let response = agent.get(&url).call().map_err(|e| e.to_string())?;

            let total_size = response
                .header("content-length")
                .and_then(|val| val.parse::<u64>().ok())
                .unwrap_or(0);

            let mut reader = response.into_reader();
            let partial_path = PathBuf::from(format!("{}.part", path.display()));
            let mut file = fs::File::create(&partial_path).map_err(|e| e.to_string())?;

            let mut buffer = [0u8; 16384]; // 16KB download buffer
            let mut downloaded = 0u64;

            loop {
                let n = reader.read(&mut buffer).map_err(|e| e.to_string())?;
                if n == 0 {
                    break;
                }
                file.write_all(&buffer[..n]).map_err(|e| e.to_string())?;
                downloaded += n as u64;

                if total_size > 0 {
                    let progress = (downloaded as f64 / total_size as f64 * 100.0) as u32;
                    let _ = app_handle_clone.emit("download-progress", progress);
                }
            }
            file.sync_all().map_err(|e| e.to_string())?;
            fs::rename(&partial_path, &path).map_err(|e| e.to_string())?;
            Ok(())
        })();

        match result {
            Ok(()) => {
                let _ = app_handle_clone.emit("download-done", target_path);
            }
            Err(e) => {
                let partial_path = PathBuf::from(format!("{}.part", path.display()));
                let _ = fs::remove_file(partial_path);
                let _ = app_handle_clone.emit("download-error", e);
            }
        }
    });

    Ok(())
}

fn safe_descendant_dir(root: &Path, segments: &[&str]) -> Result<PathBuf, String> {
    let root = root.canonicalize().map_err(|e| e.to_string())?;
    let mut target_dir = root.clone();
    for segment in segments {
        let candidate = target_dir.join(segment);
        if !candidate.exists() {
            fs::create_dir(&candidate).map_err(|e| e.to_string())?;
        }
        let canonical = candidate.canonicalize().map_err(|e| e.to_string())?;
        if !canonical.starts_with(&root) {
            return Err("Destination escapes the selected workspace".to_string());
        }
        if !canonical.is_dir() {
            return Err("Destination contains a non-directory path".to_string());
        }
        target_dir = canonical;
    }
    Ok(target_dir)
}

#[tauri::command]
fn install_skill(
    authorized: tauri::State<'_, AuthorizedPaths>,
    url: String,
    name: String,
    workspace_path: String,
) -> Result<(), String> {
    validate_public_url(&url)?;
    if name.is_empty() || name.contains('/') || name.contains('\\') || name.contains("..") {
        return Err(format!("Invalid skill name: {}", name));
    }

    // See download_model: do not allow a validated public URL to redirect to a private host.
    let agent = ureq::AgentBuilder::new().redirects(0).build();
    let response = agent.get(&url).call().map_err(|e| e.to_string())?;

    const MAX_SKILL_BYTES: u64 = 1_048_576;
    let mut content = String::new();
    response
        .into_reader()
        .take(MAX_SKILL_BYTES + 1)
        .read_to_string(&mut content)
        .map_err(|e| e.to_string())?;
    if content.len() as u64 > MAX_SKILL_BYTES {
        return Err("Skill file exceeds the 1 MiB download limit".to_string());
    }

    // Resolve installation relative to the user-selected workspace, never the process cwd.
    let workspace = authorized_path(&authorized, Path::new(&workspace_path), false)?;
    let target_dir = safe_descendant_dir(&workspace, &["agents", "skills", name.as_str()])?;
    let target_path = target_dir.join("SKILL.md");
    create_new_file(&target_path, &content).map_err(|error| {
        if error == "A file with that name already exists" {
            "Skill is already installed in this workspace".to_string()
        } else {
            error
        }
    })
}

fn get_password_db_path(app_handle: &AppHandle) -> Result<PathBuf, String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;
    if !app_data_dir.exists() {
        let _ = fs::create_dir_all(&app_data_dir);
    }
    Ok(app_data_dir.join("passwords.json"))
}

fn legacy_password_db_path() -> Option<PathBuf> {
    std::env::current_dir()
        .ok()
        .map(|dir| dir.join("passwords.json"))
}

const VAULT_KEY_ACCOUNT: &str = "vault-master-key";
// Single stable keychain account holding the AES key that encrypts the provider
// API-keys file. One keychain item for all keys (created once) — same envelope
// pattern the password vault and chat memory use — instead of one keychain item
// per key, which forced a fresh OS permission prompt on every model added.
const API_KEYS_KEY_ACCOUNT: &str = "api-keys-master-key";

// The vault (password items, provider API keys) is bulk data that can exceed what some OS
// keychains allow in a single entry (Windows Credential Manager caps a credential blob at
// 2560 bytes). So instead of putting the vault directly in the keychain, we generate a
// small AES-256 key, store *that* in the keychain (fits everywhere), and use it to encrypt
// the vault file at rest on disk. See crypto.rs for the shared key/encrypt/decrypt helpers
// (memory.rs reuses the same pattern, with its own separate key, for chat content).
fn encrypt_vault(plaintext: &str) -> Result<String, String> {
    let key = crypto::get_or_create_key(VAULT_KEY_ACCOUNT)?;
    crypto::encrypt_with_key(plaintext, &key)
}

fn decrypt_vault(encoded: &str) -> Result<String, String> {
    let key = crypto::get_or_create_key(VAULT_KEY_ACCOUNT)?;
    crypto::decrypt_with_key(encoded, &key)
}

// Atomic write (temp file + rename) so a crash mid-write can't leave a truncated/corrupt
// vault file, with owner-only permissions on unix.
fn write_vault_file(path: &Path, content: &str) -> Result<(), String> {
    let tmp_path = path.with_extension("tmp");
    fs::write(&tmp_path, content).map_err(|e| e.to_string())?;
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        fs::set_permissions(&tmp_path, fs::Permissions::from_mode(0o600))
            .map_err(|e| e.to_string())?;
    }
    fs::rename(&tmp_path, path).map_err(|e| e.to_string())
}

#[tauri::command]
fn load_password_database(app_handle: AppHandle) -> Result<String, String> {
    let db_path = get_password_db_path(&app_handle)?;
    if db_path.exists()
        || legacy_password_db_path()
            .as_ref()
            .is_some_and(|path| path.exists())
    {
        let raw = if db_path.exists() {
            fs::read_to_string(&db_path).map_err(|e| e.to_string())?
        } else {
            let legacy_path =
                legacy_password_db_path().ok_or("Could not resolve legacy vault path")?;
            let raw = fs::read_to_string(&legacy_path).map_err(|e| e.to_string())?;
            // Preserve encrypted legacy data verbatim; plaintext is encrypted below. Remove
            // the working-directory copy only after the app-data write succeeds.
            write_vault_file(&db_path, &raw)?;
            fs::remove_file(legacy_path).map_err(|e| e.to_string())?;
            raw
        };
        // One-time migration: a pre-existing file from before encryption was added is
        // plaintext JSON (starts with '{'). Re-encrypt it in place; still return the
        // (now-migrated) plaintext to the caller for this one load.
        if raw.trim_start().starts_with('{') {
            let encrypted = encrypt_vault(&raw)?;
            write_vault_file(&db_path, &encrypted)?;
            return Ok(raw);
        }
        decrypt_vault(&raw)
    } else {
        Ok(r#"{"encrypted":false,"folders":[],"items":[]}"#.to_string())
    }
}

#[tauri::command]
fn save_password_database(app_handle: AppHandle, content: String) -> Result<(), String> {
    let db_path = get_password_db_path(&app_handle)?;
    let encrypted = encrypt_vault(&content)?;
    write_vault_file(&db_path, &encrypted)
}

#[derive(Clone, Debug, Deserialize, Serialize)]
struct VaultLoginUri {
    uri: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
struct VaultLogin {
    #[serde(default)]
    username: String,
    #[serde(default)]
    password: String,
    #[serde(default)]
    totp: String,
    #[serde(default)]
    uris: Vec<VaultLoginUri>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
struct VaultEntry {
    id: String,
    #[serde(rename = "type")]
    item_type: i64,
    #[serde(default)]
    name: String,
    #[serde(default)]
    login: Option<VaultLogin>,
    #[serde(rename = "creationDate", default)]
    creation_date: String,
    #[serde(rename = "revisionDate", default)]
    revision_date: String,
}

#[derive(Debug, Deserialize, Serialize)]
struct VaultFile {
    #[serde(default)]
    encrypted: bool,
    #[serde(default)]
    folders: Vec<serde_json::Value>,
    #[serde(default)]
    items: Vec<VaultEntry>,
}

/// The only credential shape available to browser/autofill Rust.  This is intentionally not
/// serializable: no Tauri command can accidentally return a password to the chrome webview.
#[derive(Clone)]
pub(crate) struct ResolvedVaultCredential {
    pub username: String,
    pub password: String,
    pub uris: Vec<String>,
}

fn read_vault_file(app: &AppHandle) -> Result<VaultFile, String> {
    let raw = load_password_database(app.clone())?;
    parse_vault_file(&raw)
}

fn parse_vault_file(raw: &str) -> Result<VaultFile, String> {
    serde_json::from_str(raw).map_err(|_| "Password database has an invalid structure".to_string())
}

#[allow(
    dead_code,
    reason = "Used by the trusted native credential-capture bridge when it is enabled."
)]
fn save_vault_file(app: &AppHandle, file: &VaultFile) -> Result<(), String> {
    let content = serde_json::to_string_pretty(file).map_err(|error| error.to_string())?;
    save_password_database(app.clone(), content)
}

/// Rust-side id -> credential resolver used exclusively by `browser::autofill`.  The frontend
/// supplies an opaque entry id; plaintext never crosses the renderer/native boundary.
pub(crate) fn resolve_vault_credential(
    app: &AppHandle,
    entry_id: &str,
) -> Result<ResolvedVaultCredential, String> {
    if entry_id.trim().is_empty() {
        return Err("Vault entry id is required".into());
    }
    let file = read_vault_file(app)?;
    let login = file
        .items
        .into_iter()
        .find(|entry| entry.id == entry_id && entry.item_type == 1)
        .and_then(|entry| entry.login)
        .ok_or_else(|| "Vault entry was not found".to_string())?;
    if login.password.is_empty() {
        return Err("Vault entry has no password".into());
    }
    Ok(ResolvedVaultCredential {
        username: login.username,
        password: login.password,
        uris: login.uris.into_iter().map(|uri| uri.uri).collect(),
    })
}

#[allow(
    dead_code,
    reason = "Used by the trusted native credential-capture bridge when it is enabled."
)]
fn declined_origins_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|error| error.to_string())?;
    fs::create_dir_all(&dir).map_err(|error| error.to_string())?;
    Ok(dir.join("vault-declined-origins.json"))
}

#[allow(
    dead_code,
    reason = "Used by the trusted native credential-capture bridge when it is enabled."
)]
fn normalize_credential_origin(origin: &str) -> Result<String, String> {
    let url =
        Url::parse(origin).map_err(|_| "Credential origin must be a valid URL".to_string())?;
    if url.scheme() != "https" && url.scheme() != "http" {
        return Err("Credential origin must use http or https".into());
    }
    let host = url
        .host_str()
        .ok_or("Credential origin must include a host")?;
    Ok(format!(
        "{}://{}{}",
        url.scheme(),
        host,
        url.port()
            .map(|port| format!(":{port}"))
            .unwrap_or_default()
    ))
}

#[allow(
    dead_code,
    reason = "Used by the trusted native credential-capture bridge when it is enabled."
)]
fn load_declined_origins(app: &AppHandle) -> HashSet<String> {
    let Ok(path) = declined_origins_path(app) else {
        return HashSet::new();
    };
    let Ok(content) = fs::read_to_string(path) else {
        return HashSet::new();
    };
    serde_json::from_str::<Vec<String>>(&content)
        .unwrap_or_default()
        .into_iter()
        .filter_map(|origin| normalize_credential_origin(&origin).ok())
        .collect()
}

#[allow(
    dead_code,
    reason = "Used by the trusted native credential-capture bridge when it is enabled."
)]
fn persist_declined_origins(app: &AppHandle, origins: &HashSet<String>) -> Result<(), String> {
    let path = declined_origins_path(app)?;
    let mut values: Vec<_> = origins.iter().cloned().collect();
    values.sort();
    let content = serde_json::to_string_pretty(&values).map_err(|error| error.to_string())?;
    write_vault_file(&path, &content)
}

#[allow(
    dead_code,
    reason = "Used by the trusted native credential-capture bridge when it is enabled."
)]
fn vault_entry_matches_origin(entry: &VaultEntry, origin: &str, username: &str) -> bool {
    entry.item_type == 1
        && entry.login.as_ref().is_some_and(|login| {
            login.username == username
                && login.uris.iter().any(|uri| {
                    normalize_credential_origin(&uri.uri)
                        .is_ok_and(|stored_origin| stored_origin == origin)
                })
        })
}

/// Called only by the native submit-detection bridge.  It never emits the password; A8 emits
/// the returned `PendingCredentialPrompt` as a browser event after this function succeeds.
#[allow(
    dead_code,
    reason = "Called only by the future trusted native submit detector, never web content."
)]
pub(crate) fn hold_credential_candidate(
    app: &AppHandle,
    window_id: String,
    tab_id: String,
    origin: String,
    username: String,
    password: String,
) -> Result<Option<PendingCredentialPrompt>, String> {
    if password.is_empty() {
        return Ok(None);
    }
    let origin = normalize_credential_origin(&origin)?;
    let bridge = app.state::<VaultCredentialBridge>();
    let mut declined = bridge
        .declined_origins
        .lock()
        .map_err(|_| "Vault decline state lock poisoned")?;
    if declined.is_empty() {
        *declined = load_declined_origins(app);
    }
    if declined.contains(&origin) {
        return Ok(None);
    }
    let prompt = PendingCredentialPrompt {
        window_id: window_id.clone(),
        tab_id: tab_id.clone(),
        origin,
        username,
    };
    bridge
        .pending
        .lock()
        .map_err(|_| "Vault candidate state lock poisoned")?
        .insert(
            (window_id, tab_id),
            PendingCredential {
                prompt: prompt.clone(),
                password,
            },
        );
    Ok(Some(prompt))
}

#[allow(
    dead_code,
    reason = "Called only by the future native prompt dispatcher."
)]
pub(crate) fn pending_credential_prompt(
    app: AppHandle,
    window_id: String,
    tab_id: String,
) -> Result<Option<PendingCredentialPrompt>, String> {
    let bridge = app.state::<VaultCredentialBridge>();
    let prompt = bridge
        .pending
        .lock()
        .map_err(|_| "Vault candidate state lock poisoned")?
        .get(&(window_id, tab_id))
        .map(|candidate| candidate.prompt.clone());
    Ok(prompt)
}

/// Teardown hook for tab/window close or a cancelled prompt. This drops the only native copy of
/// the submitted password without persisting either a credential or a decline decision.
pub(crate) fn discard_credential_candidate(
    app: &AppHandle,
    window_id: &str,
    tab_id: &str,
) -> Result<(), String> {
    app.state::<VaultCredentialBridge>()
        .pending
        .lock()
        .map_err(|_| "Vault candidate state lock poisoned")?
        .remove(&(window_id.to_string(), tab_id.to_string()));
    Ok(())
}

#[allow(
    dead_code,
    reason = "Called only by the future native prompt dispatcher."
)]
pub(crate) fn save_credential_candidate(
    app: AppHandle,
    window_id: String,
    tab_id: String,
    name: Option<String>,
) -> Result<bool, String> {
    let bridge = app.state::<VaultCredentialBridge>();
    let candidate = bridge
        .pending
        .lock()
        .map_err(|_| "Vault candidate state lock poisoned")?
        .get(&(window_id.clone(), tab_id.clone()))
        .cloned();
    let Some(candidate) = candidate else {
        return Ok(false);
    };
    let mut file = read_vault_file(&app)?;
    let timestamp = chrono_free_timestamp();
    let id = format!(
        "fractal-{}",
        rand::thread_rng()
            .sample_iter(&rand::distributions::Alphanumeric)
            .take(24)
            .map(char::from)
            .collect::<String>()
    );
    let requested_name = name.filter(|value| !value.trim().is_empty());
    if let Some(existing) = file.items.iter_mut().find(|entry| {
        vault_entry_matches_origin(entry, &candidate.prompt.origin, &candidate.prompt.username)
    }) {
        let login = existing
            .login
            .as_mut()
            .expect("matched entries have a login");
        login.password = candidate.password;
        existing.revision_date = timestamp;
        if let Some(name) = requested_name {
            existing.name = name;
        }
    } else {
        file.items.push(VaultEntry {
            id,
            item_type: 1,
            name: requested_name.unwrap_or_else(|| candidate.prompt.origin.clone()),
            login: Some(VaultLogin {
                username: candidate.prompt.username,
                password: candidate.password,
                totp: String::new(),
                uris: vec![VaultLoginUri {
                    uri: candidate.prompt.origin,
                }],
            }),
            creation_date: timestamp.clone(),
            revision_date: timestamp,
        });
    }
    save_vault_file(&app, &file)?;
    bridge
        .pending
        .lock()
        .map_err(|_| "Vault candidate state lock poisoned")?
        .remove(&(window_id, tab_id));
    Ok(true)
}

#[allow(
    dead_code,
    reason = "Called only by the future native prompt dispatcher."
)]
pub(crate) fn decline_credential_candidate(
    app: AppHandle,
    window_id: String,
    tab_id: String,
) -> Result<bool, String> {
    let bridge = app.state::<VaultCredentialBridge>();
    let candidate = bridge
        .pending
        .lock()
        .map_err(|_| "Vault candidate state lock poisoned")?
        .get(&(window_id.clone(), tab_id.clone()))
        .cloned();
    let Some(candidate) = candidate else {
        return Ok(false);
    };
    let mut declined = bridge
        .declined_origins
        .lock()
        .map_err(|_| "Vault decline state lock poisoned")?;
    if declined.is_empty() {
        *declined = load_declined_origins(&app);
    }
    declined.insert(candidate.prompt.origin);
    persist_declined_origins(&app, &declined)?;
    bridge
        .pending
        .lock()
        .map_err(|_| "Vault candidate state lock poisoned")?
        .remove(&(window_id, tab_id));
    Ok(true)
}

#[allow(
    dead_code,
    reason = "Used by the trusted native credential-capture bridge when it is enabled."
)]
fn chrono_free_timestamp() -> String {
    chrono::Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Millis, true)
}

// Provider API keys are stored the same way as the password vault and chat memory
// (crypto.rs envelope encryption): the raw keys live AES-256-GCM encrypted in a single
// app-data file, and only the AES key sits in the OS keychain under one stable account.
// This is the pattern desktop apps (VS Code / Electron safeStorage) use — one keychain
// grant, not one per secret. The frontend never persists the raw key: it holds only the
// credential id used to look the key up here.
fn get_api_keys_path(app: &AppHandle) -> Result<PathBuf, String> {
    let app_data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    if !app_data_dir.exists() {
        let _ = fs::create_dir_all(&app_data_dir);
    }
    Ok(app_data_dir.join("api-keys.json"))
}

// Load the credential-id -> plaintext-key map, decrypting each stored value.
fn load_api_keys(app: &AppHandle) -> Result<std::collections::HashMap<String, String>, String> {
    let path = get_api_keys_path(app)?;
    if !path.exists() {
        return Ok(std::collections::HashMap::new());
    }
    let raw = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    if raw.trim().is_empty() {
        return Ok(std::collections::HashMap::new());
    }
    let stored: std::collections::HashMap<String, String> =
        serde_json::from_str(&raw).map_err(|e| e.to_string())?;
    let key = crypto::get_or_create_key(API_KEYS_KEY_ACCOUNT)?;
    let mut plain = std::collections::HashMap::with_capacity(stored.len());
    for (credential_id, encrypted) in stored {
        plain.insert(credential_id, crypto::decrypt_with_key(&encrypted, &key)?);
    }
    Ok(plain)
}

// Persist the credential-id -> plaintext-key map, encrypting each value.
fn save_api_keys(
    app: &AppHandle,
    keys: &std::collections::HashMap<String, String>,
) -> Result<(), String> {
    let key = crypto::get_or_create_key(API_KEYS_KEY_ACCOUNT)?;
    let mut stored = std::collections::HashMap::with_capacity(keys.len());
    for (credential_id, plaintext) in keys {
        stored.insert(
            credential_id.clone(),
            crypto::encrypt_with_key(plaintext, &key)?,
        );
    }
    let json = serde_json::to_string(&stored).map_err(|e| e.to_string())?;
    let path = get_api_keys_path(app)?;
    fs::write(&path, json).map_err(|e| e.to_string())
}

#[tauri::command]
fn save_api_key(app_handle: AppHandle, provider: String, key: String) -> Result<(), String> {
    write_api_key(&app_handle, &provider, &key)
}

fn write_api_key(app: &AppHandle, credential_id: &str, key: &str) -> Result<(), String> {
    let mut keys = load_api_keys(app)?;
    if key.is_empty() {
        keys.remove(credential_id);
    } else {
        keys.insert(credential_id.to_string(), key.to_string());
    }
    save_api_keys(app, &keys)
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ApiKeyChange {
    credential_id: String,
    key: String,
}

fn write_api_key_set(
    app: &AppHandle,
    values: &[(String, String)],
    rollback: &[(String, String)],
) -> Result<(), String> {
    for (index, (credential_id, key)) in values.iter().enumerate() {
        if let Err(error) = write_api_key(app, credential_id, key) {
            for (rollback_id, rollback_key) in rollback.iter().take(index) {
                let _ = write_api_key(app, rollback_id, rollback_key);
            }
            return Err(error);
        }
    }
    Ok(())
}

#[tauri::command]
fn apply_api_key_changes(
    app_handle: AppHandle,
    changes: Vec<ApiKeyChange>,
    history: tauri::State<ApiKeyHistoryState>,
) -> Result<usize, String> {
    let mut history = history
        .0
        .lock()
        .map_err(|_| "API key history lock poisoned")?;
    if changes.is_empty() {
        return Ok(history.current);
    }
    let mut previous = Vec::with_capacity(changes.len());
    for change in &changes {
        previous.push((
            change.credential_id.clone(),
            read_api_key(&app_handle, &change.credential_id)?,
        ));
    }
    for (index, change) in changes.iter().enumerate() {
        if let Err(error) = write_api_key(&app_handle, &change.credential_id, &change.key) {
            for (credential_id, key) in previous.iter().take(index + 1) {
                let _ = write_api_key(&app_handle, credential_id, key);
            }
            return Err(error);
        }

        // Read the key back so the renderer never persists a selectable model whose
        // secret didn't actually store. The store is a synchronous encrypted file, so
        // one read-back is authoritative — no keychain-consistency race to retry. The
        // key never crosses the IPC boundary: comparison happens entirely here.
        let readback = read_api_key(&app_handle, &change.credential_id);
        if readback.as_deref() != Ok(change.key.as_str()) {
            for (credential_id, key) in previous.iter().take(index + 1) {
                let _ = write_api_key(&app_handle, credential_id, key);
            }
            return Err(match readback {
                Err(error) => error,
                Ok(_) => format!(
                    "Could not verify the saved key for {}",
                    change.credential_id
                ),
            });
        }
    }
    let current = history.current;
    history.revisions.truncate(current);
    history.revisions.push(ApiKeyRevision {
        before: previous,
        after: changes
            .into_iter()
            .map(|change| (change.credential_id, change.key))
            .collect(),
    });
    history.current += 1;
    Ok(history.current)
}

#[tauri::command]
fn restore_api_key_revision(
    app_handle: AppHandle,
    revision: usize,
    history: tauri::State<ApiKeyHistoryState>,
) -> Result<(), String> {
    let mut history = history
        .0
        .lock()
        .map_err(|_| "API key history lock poisoned")?;
    if revision > history.revisions.len() {
        return Err("Unknown API key revision".to_string());
    }
    while history.current > revision {
        let entry = history.revisions[history.current - 1].clone();
        write_api_key_set(&app_handle, &entry.before, &entry.after)?;
        history.current -= 1;
    }
    while history.current < revision {
        let entry = history.revisions[history.current].clone();
        write_api_key_set(&app_handle, &entry.after, &entry.before)?;
        history.current += 1;
    }
    Ok(())
}

fn read_api_key(app: &AppHandle, credential_id: &str) -> Result<String, String> {
    Ok(load_api_keys(app)?
        .get(credential_id)
        .cloned()
        .unwrap_or_default())
}

#[tauri::command]
async fn select_file(
    app: AppHandle,
    authorized: tauri::State<'_, AuthorizedPaths>,
    title: Option<String>,
) -> Result<Option<String>, String> {
    let file = rfd::AsyncFileDialog::new()
        .set_title(title.as_deref().unwrap_or("Select File to Attach"))
        .pick_file()
        .await;

    if let Some(handle) = &file {
        register_and_persist_authorized_path(&app, &authorized, handle.path())?;
    }
    Ok(file.map(|handle| handle.path().to_string_lossy().into_owned()))
}

// Joins a base host with a versioned API path without doubling the version segment when the
// caller's own base_url already includes it — e.g. a `.env` link of `https://host/zen/v1` plus
// the `openai` branch's `v1/chat/completions` path used to produce `.../zen/v1/v1/chat/completions`.
// Many OpenAI-compatible gateways (OpenRouter, self-hosted routers, etc.) are configured with the
// `/v1` already in their base URL, so this has to be tolerated rather than assumed away.
fn join_api_path(host: &str, version_segment: &str, rest: &str) -> String {
    let host = host.trim_end_matches('/');
    if host
        .rsplit('/')
        .next()
        .map(|seg| seg.eq_ignore_ascii_case(version_segment))
        .unwrap_or(false)
    {
        format!("{}/{}", host, rest)
    } else {
        format!("{}/{}/{}", host, version_segment, rest)
    }
}

fn default_provider_host(provider: &str) -> Option<&'static str> {
    match provider {
        "openai" => Some("https://api.openai.com"),
        "deepseek" => Some("https://api.deepseek.com"),
        "xai" => Some("https://api.x.ai"),
        "zai" | "z.ai" => Some("https://api.z.ai"),
        "anthropic" => Some("https://api.anthropic.com"),
        "gemini" => Some("https://generativelanguage.googleapis.com"),
        "ollama" => Some("http://localhost:11434"),
        _ => None,
    }
}

// Each parameter maps directly to a named key in the frontend's `invoke('run_api_model', {...})`
// call — bundling them into a struct would just move the same fields one level down and
// require updating every call site for no real gain, so this allow matches Tauri's common
// convention for commands rather than restructuring the IPC shape.
#[allow(clippy::too_many_arguments)]
async fn run_api_model_with_key(
    app_handle: AppHandle,
    state: tauri::State<'_, AiStreamState>,
    provider: String,
    api_key: String,
    model: String,
    prompt: String,
    system_prompt: Option<String>,
    base_url: Option<String>,
    is_full_url: bool,
) -> Result<(), String> {
    if let Some(ref base) = base_url {
        validate_api_url(base)?;
    }

    let my_generation = state.generation.fetch_add(1, Ordering::SeqCst) + 1;
    let provider = provider.to_lowercase();

    let (url, headers, body) = match provider.as_str() {
        "openai" | "deepseek" | "xai" | "zai" | "z.ai" => {
            let default_host =
                default_provider_host(&provider).expect("matched provider has a host");
            let host = base_url.unwrap_or_else(|| default_host.to_string());
            let url = if is_full_url {
                host
            } else {
                join_api_path(&host, "v1", "chat/completions")
            };
            let auth = format!("Bearer {}", api_key);
            let mut messages = serde_json::json!([]);
            if let Some(ref sys) = system_prompt {
                messages.as_array_mut().unwrap().push(serde_json::json!({
                    "role": "system",
                    "content": sys
                }));
            }
            messages.as_array_mut().unwrap().push(serde_json::json!({
                "role": "user",
                "content": prompt
            }));

            let body = serde_json::json!({
                "model": model,
                "messages": messages,
                "stream": true,
                "stream_options": { "include_usage": true }
            });

            (
                url,
                vec![
                    ("Authorization", auth),
                    ("Content-Type", "application/json".to_string()),
                ],
                body,
            )
        }
        "anthropic" => {
            let host =
                base_url.unwrap_or_else(|| default_provider_host("anthropic").unwrap().to_string());
            let url = if is_full_url {
                host
            } else {
                join_api_path(&host, "v1", "messages")
            };
            let body = serde_json::json!({
                "model": model,
                "messages": [{
                    "role": "user",
                    "content": prompt
                }],
                "system": system_prompt,
                "max_tokens": 4096,
                "stream": true
            });

            (
                url,
                vec![
                    ("x-api-key", api_key),
                    ("anthropic-version", "2023-06-01".to_string()),
                    ("Content-Type", "application/json".to_string()),
                ],
                body,
            )
        }
        "gemini" => {
            let host =
                base_url.unwrap_or_else(|| default_provider_host("gemini").unwrap().to_string());
            let url = if is_full_url {
                let separator = if host.contains('?') { '&' } else { '?' };
                format!("{host}{separator}key={api_key}")
            } else {
                join_api_path(
                    &host,
                    "v1beta",
                    &format!("models/{}:streamGenerateContent?key={}", model, api_key),
                )
            };
            let contents = serde_json::json!([
                {
                    "role": "user",
                    "parts": [{"text": prompt}]
                }
            ]);

            let mut body = serde_json::json!({
                "contents": contents
            });

            if let Some(ref sys) = system_prompt {
                body["systemInstruction"] = serde_json::json!({
                    "parts": [{"text": sys}]
                });
            }

            (
                url,
                vec![("Content-Type", "application/json".to_string())],
                body,
            )
        }
        "ollama" => {
            let host =
                base_url.unwrap_or_else(|| default_provider_host("ollama").unwrap().to_string());
            let url = if is_full_url {
                host
            } else {
                format!("{}/api/generate", host.trim_end_matches('/'))
            };
            let body = serde_json::json!({
                "model": model,
                "prompt": prompt,
                "system": system_prompt,
                "stream": true
            });

            (
                url,
                vec![("Content-Type", "application/json".to_string())],
                body,
            )
        }
        _ => return Err(format!("Unsupported provider: {}", provider)),
    };

    let app_handle_clone = app_handle.clone();

    std::thread::spawn(move || {
        // Bound the connection and any gap between chunks so a dead/unreachable
        // endpoint can't hang this thread forever — the original bug report was a
        // stream that got stuck with no way to recover short of restarting the app.
        let agent = ureq::AgentBuilder::new()
            .timeout_connect(std::time::Duration::from_secs(15))
            .timeout_read(std::time::Duration::from_secs(60))
            .build();
        let mut request = agent.post(&url);

        for (k, v) in headers {
            request = request.set(k, &v);
        }

        // A failed request (bad key, unreachable host, 4xx/5xx, etc.) used to be dropped
        // silently here — the command had already returned Ok(()), so the frontend never
        // learned anything went wrong and just sat there "thinking" forever. Surface it.
        let response = match request.send_json(body) {
            Ok(r) => r,
            Err(e) => {
                if app_handle_clone
                    .state::<AiStreamState>()
                    .generation
                    .load(Ordering::SeqCst)
                    == my_generation
                {
                    let _ = app_handle_clone.emit("ai-error", e.to_string());
                }
                return;
            }
        };
        let reader = BufReader::new(response.into_reader());

        // Exact token usage, captured per provider/apiFormat as the stream flows.
        let mut input_tokens: i64 = 0;
        let mut output_tokens: i64 = 0;
        let mut got_usage = false;
        let mut stream_error: Option<String> = None;

        for line_result in reader.lines() {
            // Stop request (or a newer stream superseding this one) — abandon
            // immediately without emitting any further chunks/done/usage/error.
            if app_handle_clone
                .state::<AiStreamState>()
                .generation
                .load(Ordering::SeqCst)
                != my_generation
            {
                return;
            }

            let line = match line_result {
                Ok(l) => l,
                Err(e) => {
                    stream_error = Some(e.to_string());
                    break;
                }
            };

            let trimmed = line.trim();
            if trimmed.is_empty() {
                continue;
            }

            let chunk = match provider.as_str() {
                "openai" | "deepseek" | "xai" | "zai" | "z.ai" => {
                    if let Some(data_str) = trimmed.strip_prefix("data: ") {
                        if data_str == "[DONE]" {
                            None
                        } else if let Ok(json) = serde_json::from_str::<serde_json::Value>(data_str)
                        {
                            // The usage object arrives in a final chunk (empty choices) when
                            // stream_options.include_usage is set.
                            if let Some(usage) = json.get("usage").filter(|u| u.is_object()) {
                                if let Some(v) = usage["prompt_tokens"].as_i64() {
                                    input_tokens = v;
                                    got_usage = true;
                                }
                                if let Some(v) = usage["completion_tokens"].as_i64() {
                                    output_tokens = v;
                                    got_usage = true;
                                }
                            }
                            json["choices"][0]["delta"]["content"]
                                .as_str()
                                .map(|s| s.to_string())
                        } else {
                            None
                        }
                    } else {
                        None
                    }
                }
                "anthropic" => {
                    if let Some(data_str) = trimmed.strip_prefix("data: ") {
                        if let Ok(json) = serde_json::from_str::<serde_json::Value>(data_str) {
                            match json["type"].as_str() {
                                Some("message_start") => {
                                    if let Some(v) =
                                        json["message"]["usage"]["input_tokens"].as_i64()
                                    {
                                        input_tokens = v;
                                        got_usage = true;
                                    }
                                }
                                Some("message_delta") => {
                                    if let Some(v) = json["usage"]["output_tokens"].as_i64() {
                                        output_tokens = v;
                                        got_usage = true;
                                    }
                                }
                                _ => {}
                            }
                            if json["type"] == "content_block_delta" {
                                json["delta"]["text"].as_str().map(|s| s.to_string())
                            } else {
                                None
                            }
                        } else {
                            None
                        }
                    } else {
                        None
                    }
                }
                "gemini" => {
                    let clean = trimmed
                        .trim_start_matches('[')
                        .trim_start_matches(',')
                        .trim_end_matches(']')
                        .trim_end_matches(',');

                    if let Ok(json) = serde_json::from_str::<serde_json::Value>(clean) {
                        if let Some(meta) = json.get("usageMetadata").filter(|m| m.is_object()) {
                            if let Some(v) = meta["promptTokenCount"].as_i64() {
                                input_tokens = v;
                                got_usage = true;
                            }
                            if let Some(v) = meta["candidatesTokenCount"].as_i64() {
                                output_tokens = v;
                                got_usage = true;
                            }
                        }
                        json["candidates"][0]["content"]["parts"][0]["text"]
                            .as_str()
                            .map(|s| s.to_string())
                    } else {
                        None
                    }
                }
                "ollama" => {
                    if let Ok(json) = serde_json::from_str::<serde_json::Value>(trimmed) {
                        if json["done"].as_bool().unwrap_or(false) {
                            if let Some(v) = json["prompt_eval_count"].as_i64() {
                                input_tokens = v;
                                got_usage = true;
                            }
                            if let Some(v) = json["eval_count"].as_i64() {
                                output_tokens = v;
                                got_usage = true;
                            }
                        }
                        json["response"].as_str().map(|s| s.to_string())
                    } else {
                        None
                    }
                }
                _ => None,
            };

            if let Some(text) = chunk {
                let _ = app_handle_clone.emit("ai-chunk", text);
            }
        }

        if app_handle_clone
            .state::<AiStreamState>()
            .generation
            .load(Ordering::SeqCst)
            != my_generation
        {
            return;
        }
        if let Some(err) = stream_error {
            let _ = app_handle_clone.emit("ai-error", err);
        } else {
            if got_usage {
                let _ = app_handle_clone.emit(
                    "ai-usage",
                    serde_json::json!({
                        "inputTokens": input_tokens,
                        "outputTokens": output_tokens
                    }),
                );
            }
            let _ = app_handle_clone.emit("ai-done", ());
        }
    });

    Ok(())
}

#[allow(clippy::too_many_arguments)]
#[tauri::command]
async fn run_api_model(
    app_handle: AppHandle,
    state: tauri::State<'_, AiStreamState>,
    provider: String,
    credential_id: Option<String>,
    model: String,
    prompt: String,
    system_prompt: Option<String>,
    base_url: Option<String>,
    is_full_url: Option<bool>,
) -> Result<(), String> {
    let normalized = provider.to_lowercase();
    let api_key = if normalized == "ollama" {
        String::new()
    } else {
        let credential = credential_id
            .filter(|value| !value.trim().is_empty())
            .ok_or_else(|| format!("No credential is configured for {}", provider))?;
        let key = read_api_key(&app_handle, &credential)?;
        if key.is_empty() {
            return Err(format!("No keychain credential found for {}", credential));
        }
        key
    };
    run_api_model_with_key(
        app_handle,
        state,
        normalized,
        api_key,
        model,
        prompt,
        system_prompt,
        base_url,
        is_full_url.unwrap_or(false),
    )
    .await
}

// Keep project .env credentials on the native side. The renderer receives provider metadata
// only, then asks this command to stream a selected provider by name.
#[tauri::command]
async fn run_env_model(
    app_handle: AppHandle,
    state: tauri::State<'_, AiStreamState>,
    authorized: tauri::State<'_, AuthorizedPaths>,
    project_path: String,
    provider: String,
    prompt: String,
    system_prompt: Option<String>,
) -> Result<(), String> {
    let project = authorized_path(&authorized, Path::new(&project_path), false)?;
    let normalized = provider.to_lowercase();
    let config = read_env_provider_configs(project.to_string_lossy().as_ref())?
        .into_iter()
        .find(|config| config.provider == normalized)
        .ok_or_else(|| format!(".env provider not found: {}", provider))?;
    let model = config
        .model
        .ok_or_else(|| format!("API_MODEL_{} is required", provider.to_uppercase()))?;
    run_api_model_with_key(
        app_handle,
        state,
        config.api_format,
        config.api_key,
        model,
        prompt,
        system_prompt,
        config.base_url,
        false,
    )
    .await
}

#[tauri::command]
async fn select_save_file(
    app: AppHandle,
    title: String,
    default_name: String,
    extension: String,
    authorized: tauri::State<'_, AuthorizedPaths>,
) -> Result<Option<String>, String> {
    let file = rfd::AsyncFileDialog::new()
        .set_title(&title)
        .set_file_name(&default_name)
        .add_filter(&extension, &[&extension])
        .save_file()
        .await;

    if let Some(parent) = file.as_ref().and_then(|handle| handle.path().parent()) {
        register_and_persist_authorized_path(&app, &authorized, parent)?;
    }
    Ok(file.map(|handle| handle.path().to_string_lossy().into_owned()))
}

#[tauri::command]
async fn select_open_file(
    app: AppHandle,
    title: String,
    extension: String,
    authorized: tauri::State<'_, AuthorizedPaths>,
) -> Result<Option<String>, String> {
    let file = rfd::AsyncFileDialog::new()
        .set_title(&title)
        .add_filter(&extension, &[&extension])
        .pick_file()
        .await;

    if let Some(handle) = &file {
        register_and_persist_authorized_path(&app, &authorized, handle.path())?;
    }
    Ok(file.map(|handle| handle.path().to_string_lossy().into_owned()))
}

fn search_workspace_files_recursive(
    directory: &Path,
    query: &str,
    limit: usize,
    results: &mut Vec<FileEntry>,
) -> Result<(), String> {
    if results.len() >= limit {
        return Ok(());
    }
    for entry in fs::read_dir(directory).map_err(|e| e.to_string())? {
        if results.len() >= limit {
            break;
        }
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        let name = entry.file_name().to_string_lossy().into_owned();
        if entry.file_type().map_err(|e| e.to_string())?.is_dir() {
            if matches!(name.as_str(), "node_modules" | ".git" | "target" | "build") {
                continue;
            }
            search_workspace_files_recursive(&path, query, limit, results)?;
        } else if name.to_lowercase().contains(query) {
            let size = entry.metadata().map(|meta| meta.len()).unwrap_or(0);
            results.push(FileEntry {
                name,
                path: path.to_string_lossy().into_owned(),
                is_dir: false,
                size,
            });
        }
    }
    Ok(())
}

#[tauri::command]
fn search_workspace_files(
    root: String,
    query: String,
    limit: Option<usize>,
    authorized: tauri::State<AuthorizedPaths>,
) -> Result<Vec<FileEntry>, String> {
    if root.is_empty() {
        return Ok(vec![]);
    }
    let root = authorized_path(&authorized, Path::new(&root), false)?;
    let mut results = Vec::new();
    search_workspace_files_recursive(
        &root,
        &query.to_lowercase(),
        limit.unwrap_or(8).clamp(1, 50),
        &mut results,
    )?;
    Ok(results)
}

#[tauri::command]
fn path_exists(path: String, authorized: tauri::State<AuthorizedPaths>) -> Result<bool, String> {
    if path.is_empty() || !Path::new(&path).exists() {
        return Ok(false);
    }
    authorized_path(&authorized, Path::new(&path), false).map(|_| true)
}

#[tauri::command]
fn list_ollama_models(base_url: String) -> Result<Vec<String>, String> {
    let url = format!("{}/api/tags", base_url.trim_end_matches('/'));
    let response: serde_json::Value = ureq::AgentBuilder::new()
        .timeout(std::time::Duration::from_secs(2))
        .build()
        .get(&url)
        .call()
        .map_err(|e| format!("Could not reach Ollama at {url}: {e}"))?
        .into_json()
        .map_err(|e| format!("Invalid Ollama response: {e}"))?;
    Ok(response
        .get("models")
        .and_then(serde_json::Value::as_array)
        .map(|models| {
            models
                .iter()
                .filter_map(|model| {
                    model
                        .get("name")
                        .and_then(serde_json::Value::as_str)
                        .map(str::to_owned)
                })
                .collect()
        })
        .unwrap_or_default())
}

/// Syncs the Window menu template checkmarks with the frontend's active template id.
/// Called from the app state `$effect` whenever `activeTemplateId` changes.
/// Unknown `template_id` values leave every template unchecked.
#[tauri::command]
fn set_active_template_menu(app: AppHandle, template_id: String) -> Result<(), String> {
    let menu = app
        .menu()
        .ok_or_else(|| "App menu is not set".to_string())?;
    for id in TEMPLATE_MENU_IDS {
        let id_str: &str = id;
        if let Some(item) = menu.get(id_str) {
            if let Some(check) = item.as_check_menuitem() {
                check
                    .set_checked(id_str == template_id)
                    .map_err(|e| e.to_string())?;
            }
        }
    }
    Ok(())
}

fn create_menu<R: tauri::Runtime>(
    app: &tauri::App<R>,
) -> Result<tauri::menu::Menu<R>, tauri::Error> {
    let handle = app.handle();

    #[cfg(target_os = "macos")]
    let app_menu = tauri::menu::SubmenuBuilder::new(handle, "FractalEngine")
        .about(None)
        .separator()
        .services()
        .separator()
        .hide()
        .hide_others()
        .show_all()
        .separator()
        .quit()
        .build()?;

    let file_menu = tauri::menu::SubmenuBuilder::new(handle, "File")
        .item(&tauri::menu::MenuItem::with_id(
            handle,
            "open_file",
            "Open File...",
            true,
            Some("CmdOrCtrl+O"),
        )?)
        .item(&tauri::menu::MenuItem::with_id(
            handle,
            "open_folder",
            "Open Folder...",
            true,
            Some("CmdOrCtrl+Shift+O"),
        )?)
        .item(&tauri::menu::MenuItem::with_id(
            handle,
            "open_vault",
            "Open Vault...",
            true,
            Some("CmdOrCtrl+Alt+O"),
        )?)
        .item(&tauri::menu::MenuItem::with_id(
            handle,
            "add_folder_to_vault",
            "Add Folder to Vault...",
            true,
            Some("CmdOrCtrl+Alt+A"),
        )?)
        .separator()
        .item(&tauri::menu::MenuItem::with_id(
            handle,
            "save_as_vault",
            "Save Current as Vault...",
            true,
            Some("CmdOrCtrl+Alt+S"),
        )?)
        .separator()
        .close_window()
        .build()?;

    let edit_menu = tauri::menu::SubmenuBuilder::new(handle, "Edit")
        .undo()
        .redo()
        .separator()
        .cut()
        .copy()
        .paste()
        .select_all()
        .build()?;

    let view_menu = tauri::menu::SubmenuBuilder::new(handle, "View")
        .fullscreen()
        .build()?;

    // Window menu: template navigation (CheckMenuItem) above standard Minimize/Maximize.
    // The checkmark on the active template is kept in sync from the frontend via the
    // `set_active_template_menu` Tauri command (see canvas.svelte.ts $effect).
    let window_menu = tauri::menu::SubmenuBuilder::new(handle, "Window")
        .item(&tauri::menu::CheckMenuItem::with_id(
            handle,
            "tpl_home",
            "Home",
            true,
            DEFAULT_TEMPLATE_ID == "tpl_home",
            None::<&str>,
        )?)
        .item(&tauri::menu::CheckMenuItem::with_id(
            handle,
            "tpl_code",
            "Code — Classic",
            true,
            DEFAULT_TEMPLATE_ID == "tpl_code",
            None::<&str>,
        )?)
        .item(&tauri::menu::CheckMenuItem::with_id(
            handle,
            "tpl_notes",
            "Notes / Wiki",
            true,
            DEFAULT_TEMPLATE_ID == "tpl_notes",
            None::<&str>,
        )?)
        .item(&tauri::menu::CheckMenuItem::with_id(
            handle,
            "tpl_design",
            "Design",
            true,
            DEFAULT_TEMPLATE_ID == "tpl_design",
            None::<&str>,
        )?)
        .item(&tauri::menu::CheckMenuItem::with_id(
            handle,
            "tpl_blank",
            "Blank Canvas",
            true,
            DEFAULT_TEMPLATE_ID == "tpl_blank",
            None::<&str>,
        )?)
        .separator()
        .minimize()
        .item(&tauri::menu::PredefinedMenuItem::maximize(handle, None)?)
        .build()?;

    let help_menu = tauri::menu::SubmenuBuilder::new(handle, "Help")
        .item(&tauri::menu::MenuItem::with_id(
            handle,
            "about",
            "About",
            true,
            None::<&str>,
        )?)
        .build()?;

    let mut builder = tauri::menu::MenuBuilder::new(handle);
    #[cfg(target_os = "macos")]
    {
        builder = builder.item(&app_menu);
    }

    let menu = builder
        .item(&file_menu)
        .item(&edit_menu)
        .item(&view_menu)
        .item(&window_menu)
        .item(&help_menu)
        .build()?;

    Ok(menu)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .manage(AiStreamState::default())
        .manage(dictation::DictationState::default())
        .manage(browser::BrowserRegistry::default())
        .manage(browser::session::BrowserSessionStore::default())
        .manage(VaultCredentialBridge::default())
        .manage(ApiKeyHistoryState::default())
        .manage(AuthorizedPaths::default())
        .manage(TerminalPtyState::default())
        .manage(media::MediaState::default())
        .setup(|app| {
            restore_authorized_paths(app.handle(), &app.state::<AuthorizedPaths>())?;
            media::restore_media_library(app.handle());
            app.state::<browser::session::BrowserSessionStore>()
                .initialize(app.handle())?;
            let menu = create_menu(app)?;
            app.set_menu(menu)?;

            // Listen to native menu events and emit them to the frontend webview
            let app_handle = app.handle().clone();
            app.on_menu_event(move |_window, event| {
                let id = event.id.as_ref();
                let _ = app_handle.emit("menu-event", id.to_string());
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            list_directory,
            list_authorized_paths,
            revoke_authorized_path,
            read_file,
            write_file,
            create_file,
            terminal_open,
            terminal_write,
            terminal_resize,
            terminal_close,
            rename_file,
            delete_file,
            duplicate_file,
            copy_path,
            select_download_directory,
            request_directory_access,
            run_local_model,
            download_model,
            install_skill,
            load_password_database,
            save_password_database,
            save_api_key,
            apply_api_key_changes,
            restore_api_key_revision,
            browser::browser_window_open,
            browser::browser_window_state,
            browser::browser_window_close,
            browser::browser_session_restore_enabled,
            browser::browser_set_session_restore,
            browser::browser_toggle_focus,
            browser::browser_tab_create,
            browser::browser_tab_close,
            browser::browser_tab_activate,
            browser::browser_tab_reorder,
            browser::browser_tab_reopen_closed,
            browser::browser_navigate,
            browser::browser_reload,
            browser::browser_stop,
            browser::browser_go_back,
            browser::browser_go_forward,
            browser::browser_set_viewport_bounds,
            browser::browser_set_chrome_overlay,
            browser::browser_autofill,
            select_file,
            run_api_model,
            run_env_model,
            cancel_ai_stream,
            start_dictation,
            stop_dictation,
            cancel_dictation,
            select_save_file,
            select_open_file,
            search_workspace_files,
            path_exists,
            list_ollama_models,
            set_active_template_menu,
            read_env_providers,
            rebuild_docs_index,
            memory::open_project_memory,
            memory::append_message,
            memory::list_sessions,
            memory::load_session,
            memory::create_checkpoint,
            memory::restore_checkpoint,
            annotations::annotations_list,
            annotations::annotations_upsert,
            annotations::annotations_delete,
            storage::storage_search_all,
            storage::storage_index_documents,
            storage::storage_remove_documents,
            media::media_get_library,
            media::media_init_library,
            media::media_relocate_library,
            media::media_list_tree,
            media::media_list_items,
            media::media_list_all_tags,
            media::media_import,
            media::media_cancel_import,
            media::media_pick_import_sources,
            media::media_create_folder,
            media::media_rename_entry,
            media::media_move_entries,
            media::media_trash_entries,
            media::media_set_tags,
            media::media_set_pinned,
            media::media_get_thumbnail,
            media::media_save_video_thumbnail,
            media::media_set_video_probe,
            storage::bookmark_list,
            storage::bookmark_for_url,
            storage::bookmark_add,
            storage::bookmark_update,
            storage::bookmark_delete,
            storage::bookmark_folder_list,
            storage::bookmark_folder_add,
            storage::bookmark_folder_update,
            storage::bookmark_folder_delete,
            storage::history_record_visit,
            storage::history_search,
            storage::history_recent,
            storage::history_delete_url,
            storage::history_clear_range
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod join_api_path_tests {
    use super::*;

    #[test]
    fn appends_v1_when_absent() {
        assert_eq!(
            join_api_path("https://api.openai.com", "v1", "chat/completions"),
            "https://api.openai.com/v1/chat/completions"
        );
    }

    #[test]
    fn does_not_double_v1_when_base_url_already_has_it() {
        // The exact case reported: a `.env` link of https://opencode.ai/zen/v1 used to
        // produce https://opencode.ai/zen/v1/v1/chat/completions (404) instead of this.
        assert_eq!(
            join_api_path("https://opencode.ai/zen/v1", "v1", "chat/completions"),
            "https://opencode.ai/zen/v1/chat/completions"
        );
    }

    #[test]
    fn tolerates_trailing_slash() {
        assert_eq!(
            join_api_path("https://opencode.ai/zen/v1/", "v1", "chat/completions"),
            "https://opencode.ai/zen/v1/chat/completions"
        );
    }

    #[test]
    fn every_renderer_provider_has_a_native_default_host() {
        for provider in [
            "openai",
            "anthropic",
            "gemini",
            "deepseek",
            "xai",
            "zai",
            "ollama",
        ] {
            assert!(
                default_provider_host(provider).is_some(),
                "missing host for {provider}"
            );
        }
        assert_eq!(default_provider_host("z.ai"), default_provider_host("zai"));
        assert!(default_provider_host("unknown").is_none());
    }

    #[test]
    fn environment_provider_formats_are_explicit_or_safely_inferred() {
        assert_eq!(default_env_api_format("ANTHROPIC"), "anthropic");
        assert_eq!(default_env_api_format("GEMINI"), "gemini");
        assert_eq!(default_env_api_format("OPENROUTER"), "openai");
        assert_eq!(
            normalize_env_api_format("router", Some("anthropic".to_string())),
            "anthropic"
        );
        assert_eq!(
            normalize_env_api_format("router", Some("unsupported".to_string())),
            "openai"
        );
    }
}

#[cfg(test)]
mod url_validation_tests {
    use super::*;

    #[test]
    fn validate_public_url_accepts_https() {
        assert!(validate_public_url("https://example.com/model.gguf").is_ok());
    }

    #[test]
    fn validate_public_url_rejects_non_http_scheme() {
        assert!(validate_public_url("file:///etc/passwd").is_err());
        assert!(validate_public_url("javascript:alert(1)").is_err());
    }

    #[test]
    fn validate_public_url_rejects_loopback() {
        assert!(validate_public_url("http://localhost/secret").is_err());
        assert!(validate_public_url("http://127.0.0.1:8080/secret").is_err());
    }

    #[test]
    fn validate_public_url_rejects_private_ranges() {
        assert!(validate_public_url("http://10.0.0.1/internal").is_err());
        assert!(validate_public_url("http://192.168.1.1/internal").is_err());
        assert!(validate_public_url("http://169.254.169.254/latest/meta-data/").is_err());
        // cloud metadata endpoint
    }

    #[test]
    fn validate_api_url_allows_localhost_for_local_models() {
        // Deliberately permissive — this is the Ollama/LM Studio pathway, unlike
        // validate_public_url used for download_model/install_skill.
        assert!(validate_api_url("http://localhost:11434").is_ok());
    }

    #[test]
    fn validate_api_url_rejects_non_http_scheme() {
        assert!(validate_api_url("file:///etc/passwd").is_err());
    }
}

#[cfg(test)]
mod copy_path_tests {
    use super::*;

    // No tempfile crate in this workspace — each test gets its own subdirectory under the
    // OS temp dir, named after the test itself so parallel `cargo test` runs don't collide.
    fn scratch_dir(name: &str) -> PathBuf {
        let dir = std::env::temp_dir().join(format!("fractalengine_copy_path_test_{}", name));
        let _ = fs::remove_dir_all(&dir);
        fs::create_dir_all(&dir).unwrap();
        dir
    }

    #[test]
    fn copies_a_single_file() {
        let dir = scratch_dir("single_file");
        let src = dir.join("a.txt");
        fs::write(&src, "hello").unwrap();
        let dest = dir.join("sub").join("b.txt");

        copy_path_impl(&src, &dest).unwrap();

        assert_eq!(fs::read_to_string(&dest).unwrap(), "hello");
        assert!(src.exists(), "copy should not remove the source");
        let _ = fs::remove_dir_all(&dir);
    }

    #[test]
    fn copies_a_directory_recursively() {
        let dir = scratch_dir("directory");
        let src = dir.join("srcdir");
        fs::create_dir_all(src.join("nested")).unwrap();
        fs::write(src.join("top.txt"), "top").unwrap();
        fs::write(src.join("nested").join("deep.txt"), "deep").unwrap();
        let dest = dir.join("destdir");

        copy_path_impl(&src, &dest).unwrap();

        assert_eq!(fs::read_to_string(dest.join("top.txt")).unwrap(), "top");
        assert_eq!(
            fs::read_to_string(dest.join("nested").join("deep.txt")).unwrap(),
            "deep"
        );
        let _ = fs::remove_dir_all(&dir);
    }

    #[test]
    fn rejects_a_missing_source() {
        let dir = scratch_dir("missing_source");
        let src = dir.join("does-not-exist.txt");
        let dest = dir.join("dest.txt");

        assert!(copy_path_impl(&src, &dest).is_err());
        let _ = fs::remove_dir_all(&dir);
    }
}

#[cfg(test)]
mod authorized_path_tests {
    use super::*;

    #[test]
    fn rejects_invalid_leaf_names() {
        for name in ["", ".", "..", "a/b", "a\\b", "a\0b"] {
            assert!(validate_leaf_name(name).is_err(), "accepted {name:?}");
        }
        assert_eq!(validate_leaf_name(" note.md ").unwrap(), "note.md");
    }

    #[test]
    fn contains_existing_and_new_paths_to_an_authorized_root() {
        let root = std::env::temp_dir().join("fractalengine_authorized_path_test");
        let outside = std::env::temp_dir().join("fractalengine_authorized_path_outside");
        let _ = fs::remove_dir_all(&root);
        let _ = fs::remove_dir_all(&outside);
        fs::create_dir_all(&root).unwrap();
        fs::create_dir_all(&outside).unwrap();

        let state = AuthorizedPaths::default();
        register_authorized_path(&state, &root).unwrap();
        assert!(authorized_path(&state, &root.join("new.md"), true).is_ok());
        assert!(authorized_path(&state, &outside.join("new.md"), true).is_err());

        let _ = fs::remove_dir_all(&root);
        let _ = fs::remove_dir_all(&outside);
    }
}

#[cfg(test)]
mod exclusive_create_and_destination_tests {
    use super::*;

    fn temp_dir(label: &str) -> PathBuf {
        std::env::temp_dir().join(format!(
            "fractalengine-{}-{}-{}",
            label,
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ))
    }

    #[test]
    fn exclusive_create_never_overwrites_an_existing_note() {
        let dir = temp_dir("exclusive-create");
        fs::create_dir_all(&dir).unwrap();
        let note = dir.join("note.md");
        create_new_file(&note, "original").unwrap();
        let error = create_new_file(&note, "replacement").unwrap_err();
        assert!(error.contains("already exists"));
        assert_eq!(fs::read_to_string(&note).unwrap(), "original");
        let _ = fs::remove_dir_all(dir);
    }

    #[cfg(unix)]
    #[test]
    fn safe_descendant_rejects_a_symlink_escape() {
        use std::os::unix::fs::symlink;

        let root = temp_dir("skill-root");
        let outside = temp_dir("skill-outside");
        fs::create_dir_all(root.join("agents")).unwrap();
        fs::create_dir_all(&outside).unwrap();
        symlink(&outside, root.join("agents").join("skills")).unwrap();
        let error = safe_descendant_dir(&root, &["agents", "skills", "unsafe-skill"]).unwrap_err();
        assert!(error.contains("escapes"));
        let _ = fs::remove_dir_all(root);
        let _ = fs::remove_dir_all(outside);
    }
}

#[cfg(test)]
mod vault_credential_bridge_tests {
    use super::*;

    #[test]
    fn accepts_only_web_origins_and_strips_path_credentials_and_query() {
        assert_eq!(
            normalize_credential_origin("https://alice:secret@example.com:8443/login?q=1").unwrap(),
            "https://example.com:8443"
        );
        assert!(normalize_credential_origin("file:///tmp/login.html").is_err());
        assert!(normalize_credential_origin("javascript:alert(1)").is_err());
        assert!(normalize_credential_origin("not a url").is_err());
    }

    #[test]
    fn preserves_bitwarden_login_fields_when_parsing_for_native_resolution() {
        let file = parse_vault_file(r#"{"encrypted":false,"folders":[],"items":[{"id":"entry-1","type":1,"name":"Example","login":{"username":"alice","password":"secret","totp":"JBSWY3DPEHPK3PXP","uris":[{"uri":"https://example.com/login"}]},"creationDate":"2026-01-01T00:00:00.000Z","revisionDate":"2026-01-01T00:00:00.000Z"}]}"#).unwrap();
        let entry = &file.items[0];
        assert_eq!(entry.login.as_ref().unwrap().username, "alice");
        assert_eq!(entry.login.as_ref().unwrap().totp, "JBSWY3DPEHPK3PXP");
        assert_eq!(
            entry.login.as_ref().unwrap().uris[0].uri,
            "https://example.com/login"
        );
    }

    #[test]
    fn rejects_malformed_vault_data_without_a_partial_result() {
        assert!(parse_vault_file(r#"{"items":"not-an-array"}"#).is_err());
        assert!(parse_vault_file("not json").is_err());
    }

    #[test]
    fn upsert_match_requires_same_normalized_origin_and_username() {
        let file = parse_vault_file(r#"{"items":[{"id":"entry-1","type":1,"login":{"username":"alice","password":"secret","uris":[{"uri":"https://example.com/login"}]}}]}"#).unwrap();
        let entry = &file.items[0];
        assert!(vault_entry_matches_origin(
            entry,
            "https://example.com",
            "alice"
        ));
        assert!(!vault_entry_matches_origin(
            entry,
            "https://example.com",
            "bob"
        ));
        assert!(!vault_entry_matches_origin(
            entry,
            "https://evil-example.com",
            "alice"
        ));
    }
}
