mod autotag;
mod frontmatter;
mod gguf;
mod search;
mod vault;
pub mod workspace;

use autotag::{AppRule, AutoTag, Source};
use gguf::{GgufEngine, GgufStatus};
use notify::{RecommendedWatcher, RecursiveMode, Watcher};
use search::SearchHit;
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::sync::{Mutex, OnceLock};
use std::time::{Duration, Instant};
use tauri::{Emitter, Manager, State};
use vault::{Entry, EntrySummary, Vault, VaultResult};
use workspace::{
    AssetData, CsvConversion, DocumentPreview, GraphReport, LinkReport, WorkspaceFile,
    WorkspaceItem, WorkspaceResult,
};

const APP_BUNDLE_ID: &str = "com.fractalmandala.fracta";
static WORKSPACE_WATCHER: OnceLock<Mutex<Option<RecommendedWatcher>>> = OnceLock::new();

/// Whether a vault is configured, and where. The frontend uses this on boot to decide
/// between the folder-picker prompt and the normal UI.
#[derive(serde::Serialize)]
struct VaultStatus {
    configured: bool,
    path: Option<String>,
}

#[derive(serde::Serialize)]
struct TerminalResult {
    stdout: String,
    stderr: String,
    status: Option<i32>,
    timed_out: bool,
}

#[tauri::command]
fn vault_status(vault: State<Vault>) -> VaultStatus {
    let path = vault.current();
    VaultStatus {
        configured: path.is_some(),
        path: path.map(|p| p.display().to_string()),
    }
}

/// Opens a native folder picker and records the chosen directory as the vault.
/// Returns the path, or `None` if the user cancelled.
#[tauri::command]
async fn pick_vault(app: tauri::AppHandle, vault: State<'_, Vault>) -> VaultResult<Option<String>> {
    let folder = rfd::FileDialog::new()
        .set_title("Choose a folder for your Fracta entries")
        .pick_folder();
    let Some(folder) = folder else {
        return Ok(None);
    };
    let config_dir = app_config_dir(&app)?;
    vault.set(&config_dir, folder.clone())?;
    Ok(Some(folder.display().to_string()))
}

#[tauri::command]
fn list_entries(vault: State<Vault>) -> VaultResult<Vec<EntrySummary>> {
    vault.list()
}

#[tauri::command]
fn read_entry(id: String, vault: State<Vault>) -> VaultResult<Entry> {
    vault.read(&id)
}

#[tauri::command]
fn create_entry(vault: State<Vault>) -> VaultResult<String> {
    vault.create()
}

#[tauri::command]
fn write_entry(
    id: String,
    title: String,
    category: String,
    tags: Vec<String>,
    body: String,
    vault: State<Vault>,
) -> VaultResult<Entry> {
    vault.write(&id, &title, &category, tags, &body)
}

#[tauri::command]
fn delete_entry(id: String, vault: State<Vault>) -> VaultResult<()> {
    vault.delete(&id)
}

// --- Recursive workspace -------------------------------------------------------

#[tauri::command]
fn list_workspace(vault: State<Vault>) -> WorkspaceResult<Vec<WorkspaceItem>> {
    workspace::list(&vault.root()?)
}

#[tauri::command]
fn read_workspace_file(path: String, vault: State<Vault>) -> WorkspaceResult<WorkspaceFile> {
    workspace::read(&vault.root()?, &path)
}

#[tauri::command]
fn read_workspace_pdf_bytes(path: String, vault: State<Vault>) -> WorkspaceResult<Vec<u8>> {
    workspace::pdf_bytes(&vault.root()?, &path)
}

#[tauri::command]
fn read_workspace_image_asset(path: String, vault: State<Vault>) -> WorkspaceResult<AssetData> {
    workspace::image_asset(&vault.root()?, &path)
}

#[tauri::command]
fn read_workspace_media_asset(path: String, vault: State<Vault>) -> WorkspaceResult<AssetData> {
    workspace::media_asset(&vault.root()?, &path)
}

#[tauri::command]
fn read_workspace_docx_image(
    path: String,
    archive_path: String,
    vault: State<Vault>,
) -> WorkspaceResult<AssetData> {
    workspace::docx_image(&vault.root()?, &path, &archive_path)
}

/// Replaces the native watcher whenever the selected project changes. Filesystem
/// events are advisory: the frontend re-lists through the normal contained command
/// and keeps a polling fallback for browser preview and transient OS watcher errors.
#[tauri::command]
fn watch_workspace(app: tauri::AppHandle, vault: State<Vault>) -> WorkspaceResult<()> {
    let root = vault.root()?;
    let handle = app.clone();
    let index_root = root.clone();
    let index_config = app_config_dir(&app)?;
    let mut watcher = notify::recommended_watcher(move |event: notify::Result<notify::Event>| {
        if let Ok(event) = event {
            let paths = event
                .paths
                .iter()
                .map(|path| path.display().to_string())
                .collect::<Vec<_>>();
            // Search is derived local state. Keep it fresh at the event boundary
            // without rescanning an otherwise unchanged vault.
            let _ = search::update_paths(&index_config, &index_root, &event.paths);
            let _ = handle.emit("workspace://changed", paths);
        }
    })
    .map_err(|error| format!("Could not start workspace watcher: {error}"))?;
    watcher
        .watch(&root, RecursiveMode::Recursive)
        .map_err(|error| format!("Could not watch workspace: {error}"))?;
    let registry = WORKSPACE_WATCHER.get_or_init(|| Mutex::new(None));
    *registry
        .lock()
        .map_err(|_| "Workspace watcher lock is unavailable.".to_string())? = Some(watcher);
    Ok(())
}

/// A visible, user-triggered project terminal. This intentionally does not expose a
/// persistent hidden shell: every command is supplied by the person at the UI and
/// runs with the selected vault as its working directory.
#[tauri::command]
fn run_workspace_terminal(command: String, vault: State<Vault>) -> WorkspaceResult<TerminalResult> {
    let command = command.trim();
    if command.is_empty() {
        return Err("Enter a command to run in this project.".to_string());
    }
    let root = vault.root()?;
    run_workspace_command(&root, command)
}

/// Opens the desktop webview's native print surface where the runtime supports it.
/// The frontend retains `window.print()` as the documented cross-platform fallback.
#[tauri::command]
fn print_workspace(app: tauri::AppHandle) -> Result<(), String> {
    app.get_webview_window("main")
        .ok_or_else(|| "The primary Fracta window is unavailable.".to_string())?
        .print()
        .map_err(|error| format!("Could not open the native print dialog: {error}"))
}

/// Executes an explicitly requested shell command with bounded runtime and output.
/// Both streams are drained concurrently so a noisy command cannot deadlock while
/// Fracta waits to enforce its timeout.
fn run_workspace_command(root: &std::path::Path, command: &str) -> WorkspaceResult<TerminalResult> {
    #[cfg(target_os = "windows")]
    let child = Command::new("cmd")
        .args(["/C", command])
        .current_dir(root)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn();
    #[cfg(not(target_os = "windows"))]
    let child = Command::new("sh")
        .args(["-lc", command])
        .current_dir(root)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn();
    let mut child = child.map_err(|error| format!("Could not start terminal command: {error}"))?;
    let stdout = child
        .stdout
        .take()
        .ok_or_else(|| "Terminal stdout was unavailable.".to_string())?;
    let stderr = child
        .stderr
        .take()
        .ok_or_else(|| "Terminal stderr was unavailable.".to_string())?;
    let output_reader = std::thread::spawn(move || {
        use std::io::Read;
        let mut bytes = Vec::new();
        let _ = std::io::BufReader::new(stdout).read_to_end(&mut bytes);
        bytes
    });
    let error_reader = std::thread::spawn(move || {
        use std::io::Read;
        let mut bytes = Vec::new();
        let _ = std::io::BufReader::new(stderr).read_to_end(&mut bytes);
        bytes
    });
    const MAX_RUNTIME: Duration = Duration::from_secs(120);
    let started = Instant::now();
    let mut timed_out = false;
    loop {
        if child
            .try_wait()
            .map_err(|error| format!("Could not inspect terminal command: {error}"))?
            .is_some()
        {
            break;
        }
        if started.elapsed() >= MAX_RUNTIME {
            child
                .kill()
                .map_err(|error| format!("Could not stop timed-out terminal command: {error}"))?;
            timed_out = true;
            break;
        }
        std::thread::sleep(Duration::from_millis(40));
    }
    let status = child
        .wait()
        .map_err(|error| format!("Could not finish terminal command: {error}"))?;
    const MAX_OUTPUT: usize = 200_000;
    let bounded = |bytes: Vec<u8>| {
        let mut text = String::from_utf8_lossy(&bytes).into_owned();
        if text.len() > MAX_OUTPUT {
            text.truncate(MAX_OUTPUT);
            text.push_str("\n[Output truncated by Fracta]\n");
        }
        text
    };
    Ok(TerminalResult {
        stdout: bounded(output_reader.join().unwrap_or_default()),
        stderr: bounded(error_reader.join().unwrap_or_default()),
        status: status.code(),
        timed_out,
    })
}

#[tauri::command]
fn preview_workspace_document(
    path: String,
    vault: State<Vault>,
) -> WorkspaceResult<DocumentPreview> {
    workspace::preview(&vault.root()?, &path)
}

#[tauri::command]
fn write_workspace_file(
    path: String,
    content: String,
    app: tauri::AppHandle,
    vault: State<Vault>,
) -> WorkspaceResult<WorkspaceFile> {
    let root = vault.root()?;
    let written = workspace::write(&root, &path, &content)?;
    let _ = search::update_paths(&app_config_dir(&app)?, &root, &[root.join(&path)]);
    Ok(written)
}

#[tauri::command]
fn create_workspace_folder(path: String, vault: State<Vault>) -> WorkspaceResult<()> {
    workspace::create_folder(&vault.root()?, &path)
}

#[tauri::command]
fn move_workspace_path(from: String, to: String, vault: State<Vault>) -> WorkspaceResult<()> {
    workspace::move_path(&vault.root()?, &from, &to)
}

#[tauri::command]
fn delete_workspace_path(path: String, vault: State<Vault>) -> WorkspaceResult<()> {
    workspace::delete_path(&vault.root()?, &path)
}

#[tauri::command]
fn duplicate_workspace_path(path: String, vault: State<Vault>) -> WorkspaceResult<String> {
    workspace::duplicate_path(&vault.root()?, &path)
}

#[tauri::command]
fn reveal_workspace_path(path: String, vault: State<Vault>) -> WorkspaceResult<()> {
    workspace::reveal_path(&vault.root()?, &path)
}

#[tauri::command]
fn open_workspace_externally(path: String, vault: State<Vault>) -> WorkspaceResult<()> {
    workspace::open_externally(&vault.root()?, &path)
}

#[tauri::command]
fn workspace_links(path: String, vault: State<Vault>) -> WorkspaceResult<LinkReport> {
    workspace::links(&vault.root()?, &path)
}

#[tauri::command]
fn workspace_graph(vault: State<Vault>) -> WorkspaceResult<GraphReport> {
    workspace::graph(&vault.root()?)
}

#[tauri::command]
fn rebuild_workspace_index(app: tauri::AppHandle, vault: State<Vault>) -> Result<usize, String> {
    search::rebuild(&app_config_dir(&app)?, &vault.root()?)
}

#[tauri::command]
fn search_workspace(
    query: String,
    app: tauri::AppHandle,
    vault: State<Vault>,
) -> Result<Vec<SearchHit>, String> {
    search::search(&app_config_dir(&app)?, &vault.root()?, &query)
}

#[tauri::command]
fn convert_csv_to_json(
    content: String,
    delimiter: Option<String>,
    infer_types: bool,
) -> WorkspaceResult<CsvConversion> {
    let delimiter = delimiter
        .as_deref()
        .and_then(|value| value.as_bytes().first().copied())
        .unwrap_or(b',');
    workspace::csv_to_json(&content, delimiter, infer_types)
}

#[tauri::command]
fn convert_json_to_csv(
    content: String,
    delimiter: Option<String>,
) -> WorkspaceResult<CsvConversion> {
    let delimiter = delimiter
        .as_deref()
        .and_then(|value| value.as_bytes().first().copied())
        .unwrap_or(b',');
    workspace::json_to_csv(&content, delimiter)
}

// --- Auto-tag rules ---------------------------------------------------------------

#[tauri::command]
fn list_app_rules(autotag: State<AutoTag>) -> Vec<AppRule> {
    autotag.rules()
}

#[tauri::command]
fn upsert_app_rule(rule: AppRule, autotag: State<AutoTag>) -> Vec<AppRule> {
    autotag.upsert(rule)
}

#[tauri::command]
fn delete_app_rule(bundle_id: String, autotag: State<AutoTag>) -> Vec<AppRule> {
    autotag.delete(&bundle_id)
}

/// The app the current clipboard content came from, if known. Drives the UI hint.
#[tauri::command]
fn current_clipboard_source(autotag: State<AutoTag>) -> Option<Source> {
    autotag.current_source()
}

/// Tags an active rule assigns to the current clipboard — merged into an entry on paste.
#[tauri::command]
fn autotags_now(autotag: State<AutoTag>) -> Vec<String> {
    autotag.tags_for_current()
}

// --- Local GGUF (llama-server) ------------------------------------------------

#[tauri::command]
fn gguf_status(engine: State<GgufEngine>) -> GgufStatus {
    engine.status()
}

#[tauri::command]
fn pick_gguf() -> Option<String> {
    gguf::pick_gguf_file().map(|p| p.display().to_string())
}

/// Load a GGUF by path. Blocking until the local server is ready — run from async cmd.
#[tauri::command]
async fn gguf_load(path: String, engine: State<'_, GgufEngine>) -> Result<GgufStatus, String> {
    let path = PathBuf::from(path);
    let engine = engine.inner().clone();
    tauri::async_runtime::spawn_blocking(move || engine.load(path))
        .await
        .map_err(|e| format!("Load task failed: {e}"))?
}

#[tauri::command]
fn gguf_unload(engine: State<GgufEngine>) -> Result<(), String> {
    engine.unload()
}

fn app_config_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_config_dir()
        .map_err(|e| format!("No config directory: {e}"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default();

    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    {
        builder = builder.plugin(tauri_plugin_window_state::Builder::default().build());
    }

    builder
        .manage(Vault::default())
        .manage(AutoTag::new(APP_BUNDLE_ID))
        .manage(GgufEngine::default())
        .setup(|app| {
            let handle = app.handle();
            if let Ok(dir) = app_config_dir(handle) {
                app.state::<Vault>().restore(&dir);
                app.state::<AutoTag>().init(&dir);
            }
            // Start watching the clipboard for source attribution.
            autotag::spawn_watch(app.state::<AutoTag>().inner().clone());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            vault_status,
            pick_vault,
            list_entries,
            read_entry,
            create_entry,
            write_entry,
            delete_entry,
            list_workspace,
            read_workspace_file,
            read_workspace_pdf_bytes,
            read_workspace_image_asset,
            read_workspace_media_asset,
            read_workspace_docx_image,
            watch_workspace,
            run_workspace_terminal,
            print_workspace,
            preview_workspace_document,
            write_workspace_file,
            create_workspace_folder,
            move_workspace_path,
            delete_workspace_path,
            duplicate_workspace_path,
            reveal_workspace_path,
            open_workspace_externally,
            workspace_links,
            workspace_graph,
            rebuild_workspace_index,
            search_workspace,
            convert_csv_to_json,
            convert_json_to_csv,
            list_app_rules,
            upsert_app_rule,
            delete_app_rule,
            current_clipboard_source,
            autotags_now,
            gguf_status,
            pick_gguf,
            gguf_load,
            gguf_unload,
        ])
        .run(tauri::generate_context!())
        .expect("error while running fracta");
}
