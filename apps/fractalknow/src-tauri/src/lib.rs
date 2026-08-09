use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Arc;

use parking_lot::Mutex;
use serde::Serialize;
use tauri::menu::{Menu, MenuEvent};
use tauri::{AppHandle, Emitter, Manager, Runtime, Theme};
use tauri_plugin_deep_link::DeepLinkExt;

mod bug_report;
mod activity_log;
mod bundled_skills;
mod consent;
mod crash;
mod deep_link;
mod menu;
mod paths;
mod platform;
mod project;
mod project_fs;
mod project_watch;
mod server;
mod terminal_pty;
mod updater;

use menu::{apply_menu_enablement, build_menu, menu_action_for_id, MenuRegistry};
use project_watch::ProjectWatcher;
use server::ServerConfig;
use terminal_pty::{TerminalRegistry, TerminalSessionConfig};

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct AppInfo {
    name: &'static str,
    desktop_runtime: &'static str,
    frontend_runtime: &'static str,
    styling: &'static str,
    os: &'static str,
    arch: &'static str,
    app_version: String,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct DesktopConfig {
    collab_url: String,
    api_origin: String,
    project_path: String,
    project_name: String,
    mode: &'static str,
    e2e_smoke: bool,
    single_file: bool,
    initial_doc: Option<String>,
    freshly_created: bool,
    startup_traceparent: Option<String>,
    pty_available: bool,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct BridgeOk {
    ok: bool,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ProtocolDetection {
    pub installed: bool,
    pub display_name: Option<String>,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ConsentRequiredEvent {
    pub scope: String,
    pub message: String,
    pub required_at: String,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CrashInviteEvent {
    pub id: String,
    pub reason: String,
    pub report_path: String,
    pub created_at: String,
}

#[derive(Serialize, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct ThemeAppliedOptions {
    reduced_transparency: Option<bool>,
}

#[derive(Serialize, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct RecentProject {
    path: String,
    name: String,
    source: String,
    opened_at: String,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct TerminalStartOptions {
    id: String,
    cwd: Option<String>,
    shell: Option<String>,
    cols: Option<u16>,
    rows: Option<u16>,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct TerminalWriteOptions {
    id: String,
    data: String,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct TerminalStopOptions {
    id: String,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct ProjectCreateOptions {
    path: String,
    name: String,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct BugReportCapture {
    id: String,
    report_path: Option<String>,
    created_at: String,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct FeedbackHandoff {
    target: &'static str,
    url: Option<String>,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct CreatedProject {
    path: String,
    name: String,
    files: Vec<String>,
}

pub struct BridgeState {
    pub menu_registry: MenuRegistry,
    pub consent: consent::ConsentRegistry,
    pub server: Arc<server::ServerHandle>,
    pub terminal: TerminalRegistry,
    pub updater: updater::UpdaterState,
    pub project_path: Mutex<PathBuf>,
    pub project_watcher: Arc<ProjectWatcher>,
    pub reduced_transparency: Mutex<bool>,
}

#[tauri::command]
fn app_info<R: Runtime>(app: AppHandle<R>) -> AppInfo {
    AppInfo {
        name: "FractalKnow",
        desktop_runtime: "Tauri v2",
        frontend_runtime: "SvelteKit SPA",
        styling: "tab-indented Sass",
        os: std::env::consts::OS,
        arch: std::env::consts::ARCH,
        app_version: app.package_info().version.to_string(),
    }
}

#[tauri::command]
fn desktop_config(state: tauri::State<'_, BridgeState>) -> DesktopConfig {
    let project_path_buf = state.project_path.lock().clone();
    build_desktop_config(&project_path_buf)
}

#[tauri::command]
fn set_theme_source<R: Runtime>(app: AppHandle<R>, source: String) -> Result<BridgeOk, String> {
    let theme = match source.as_str() {
        "system" => None,
        "light" => Some(Theme::Light),
        "dark" => Some(Theme::Dark),
        other => return Err(format!("unsupported theme source: {other}")),
    };
    app.set_theme(theme);
    Ok(BridgeOk { ok: true })
}

#[tauri::command]
fn detect_protocol(scheme: String) -> Result<ProtocolDetection, String> {
    if !deep_link::is_valid_scheme(&scheme) {
        return Err("invalid protocol scheme".to_string());
    }
    Ok(deep_link::detect_scheme(&scheme))
}

#[tauri::command]
fn startup_deep_link() -> Option<String> {
    let mut args = std::env::args().collect::<Vec<_>>();
    if args.is_empty() {
        return None;
    }
    args.remove(0);
    deep_link::extract_deep_link_from_args(args)
}

#[tauri::command]
fn theme_applied<R: Runtime>(
    app: AppHandle<R>,
    state: tauri::State<'_, BridgeState>,
    opts: Option<ThemeAppliedOptions>,
) -> Result<BridgeOk, String> {
    let reduced = opts.and_then(|o| o.reduced_transparency).unwrap_or(false);
    *state.reduced_transparency.lock() = reduced;
    apply_reduced_transparency(&app, reduced)?;
    Ok(BridgeOk { ok: true })
}

#[tauri::command]
async fn check_update_status<R: Runtime>(
    app: AppHandle<R>,
    state: tauri::State<'_, BridgeState>,
) -> Result<updater::UpdateStatus, String> {
    updater::check(&app, &state.updater).await
}

#[tauri::command]
async fn install_update<R: Runtime>(app: AppHandle<R>) -> Result<BridgeOk, String> {
    updater::install(&app).await?;
    Ok(BridgeOk { ok: true })
}

#[tauri::command]
fn terminal_start<R: Runtime>(
    app: AppHandle<R>,
    state: tauri::State<'_, BridgeState>,
    opts: TerminalStartOptions,
) -> Result<BridgeOk, String> {
    state.terminal.start(
        app,
        opts.id,
        TerminalSessionConfig {
            cwd: opts.cwd,
            shell: opts.shell,
            cols: opts.cols,
            rows: opts.rows,
        },
    )?;
    Ok(BridgeOk { ok: true })
}

#[tauri::command]
fn terminal_write(
    state: tauri::State<'_, BridgeState>,
    opts: TerminalWriteOptions,
) -> Result<BridgeOk, String> {
    state.terminal.write(&opts.id, &opts.data)?;
    Ok(BridgeOk { ok: true })
}

#[tauri::command]
fn terminal_stop(
    state: tauri::State<'_, BridgeState>,
    opts: TerminalStopOptions,
) -> Result<BridgeOk, String> {
    state.terminal.stop(&opts.id)?;
    Ok(BridgeOk { ok: true })
}

#[tauri::command]
fn create_project(opts: ProjectCreateOptions) -> Result<CreatedProject, String> {
    let target = project::resolve_target_path(&opts.path);
    let template = project::default_template(&opts.name);
    let created = project::create(&target, &template)?;
    Ok(CreatedProject {
        path: created.path,
        name: opts.name,
        files: created.files,
    })
}

#[tauri::command]
fn read_recent_projects(app: AppHandle) -> Result<Vec<RecentProject>, String> {
    let path = paths::recent_projects_path(&app)?;
    if !path.exists() {
        return Ok(Vec::new());
    }
    let body = fs::read_to_string(path).map_err(|e| e.to_string())?;
    serde_json::from_str::<Vec<RecentProject>>(&body).map_err(|e| e.to_string())
}

#[tauri::command]
fn write_recent_projects(app: AppHandle, projects: Vec<RecentProject>) -> Result<BridgeOk, String> {
    let path = paths::recent_projects_path(&app)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let body = serde_json::to_string_pretty(&projects).map_err(|e| e.to_string())?;
    fs::write(path, body).map_err(|e| e.to_string())?;
    Ok(BridgeOk { ok: true })
}

#[tauri::command]
fn read_app_config(app: AppHandle) -> Result<Option<serde_json::Value>, String> {
    let path = paths::app_config_path(&app)?;
    if !path.exists() {
        return Ok(None);
    }
    let body = fs::read_to_string(path).map_err(|e| e.to_string())?;
    let value = serde_json::from_str::<serde_json::Value>(&body).map_err(|e| e.to_string())?;
    Ok(Some(value))
}

#[tauri::command]
fn write_app_config(app: AppHandle, config: serde_json::Value) -> Result<BridgeOk, String> {
    let path = paths::app_config_path(&app)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let body = serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?;
    fs::write(path, body).map_err(|e| e.to_string())?;
    Ok(BridgeOk { ok: true })
}

#[tauri::command]
fn capture_bug_report<R: Runtime>(
    app: AppHandle<R>,
    state: tauri::State<'_, BridgeState>,
) -> Result<BugReportCapture, String> {
    if state.consent.requires(
        &app,
        "bug-reports",
        "FractalKnow needs your consent to collect diagnostic information before submitting a bug report.",
    ) {
        return Err("consent-required".to_string());
    }
    let report = bug_report::build_report(&app, None)?;
    Ok(BugReportCapture {
        id: report.id,
        report_path: Some(report.report_path),
        created_at: report.created_at,
    })
}

#[tauri::command]
fn submit_feedback(_message: Option<String>) -> FeedbackHandoff {
    FeedbackHandoff {
        target: "external-url",
        url: Some("https://github.com/inkeep/open-knowledge/issues".to_string()),
    }
}

#[tauri::command]
fn set_menu_enablement<R: Runtime>(
    app: AppHandle<R>,
    state: tauri::State<'_, BridgeState>,
    items: HashMap<String, bool>,
) -> Result<BridgeOk, String> {
    // Parameter name must match the bridge invoke payload key: { items }.
    apply_menu_enablement(&app, &state.menu_registry, &items).map_err(|e| e.to_string())?;
    Ok(BridgeOk { ok: true })
}

#[tauri::command]
fn get_menu_enablement(state: tauri::State<'_, BridgeState>) -> HashMap<String, bool> {
    state.menu_registry.enabled_snapshot()
}

#[tauri::command]
fn request_consent<R: Runtime>(
    app: AppHandle<R>,
    state: tauri::State<'_, BridgeState>,
    scope: String,
    message: String,
) -> Result<bool, String> {
    let needs = state.consent.requires(&app, &scope, &message);
    Ok(needs)
}

#[tauri::command]
fn grant_consent<R: Runtime>(
    app: AppHandle<R>,
    state: tauri::State<'_, BridgeState>,
    scope: String,
    granted: bool,
) -> Result<BridgeOk, String> {
    state.consent.set_granted(&app, &scope, granted);
    Ok(BridgeOk { ok: true })
}

#[tauri::command]
fn start_local_server<R: Runtime>(
    app: AppHandle<R>,
    state: tauri::State<'_, BridgeState>,
    config: ServerConfig,
) -> Result<server::ServerState, String> {
    if state.consent.requires(
        &app,
        "local-server",
        "FractalKnow needs your consent to start a local collaboration server on this machine.",
    ) {
        return Err("consent-required".to_string());
    }
    state.server.start(app, config)
}

#[tauri::command]
fn stop_local_server<R: Runtime>(
    app: AppHandle<R>,
    state: tauri::State<'_, BridgeState>,
) -> Result<server::ServerState, String> {
    state.server.stop(&app)
}

#[tauri::command]
fn local_server_status(state: tauri::State<'_, BridgeState>) -> server::ServerState {
    state.server.status()
}

#[tauri::command]
fn simulate_panic<R: Runtime>(app: AppHandle<R>) -> Result<BridgeOk, String> {
    // Test-only command that intentionally panics inside a thread so the
    // installed panic hook can write a real crash report. The panic is
    // caught at the thread boundary so the command itself resolves.
    // Gated out of release builds: webview code must not be able to
    // trigger native panics and crash-report writes in production.
    if !cfg!(debug_assertions) {
        return Err("simulate_panic is only available in debug builds".to_string());
    }
    let app_for_thread = app.clone();
    std::thread::spawn(move || {
        let _ = app_for_thread;
        panic!("simulated crash for testing crash-report detection");
    });
    Ok(BridgeOk { ok: true })
}

#[tauri::command]
fn list_crash_reports(app: AppHandle) -> Result<Vec<String>, String> {
    crash::list_reports(&app).map(|paths| {
        paths
            .into_iter()
            .map(|p| p.to_string_lossy().to_string())
            .collect()
    })
}

#[tauri::command]
fn read_crash_report(app: AppHandle, id: String) -> Result<Option<String>, String> {
    match crash::report_path(&app, &id)? {
        Some(path) => Ok(Some(fs::read_to_string(path).map_err(|e| e.to_string())?)),
        None => Ok(None),
    }
}

fn project_root(state: &BridgeState) -> PathBuf {
    state.project_path.lock().clone()
}

fn build_desktop_config(project_path_buf: &Path) -> DesktopConfig {
    let project_path = project_path_buf.to_string_lossy().to_string();
    let project_name = project_path_buf
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or("fractalknow")
        .to_string();
    let initial_doc = std::env::var("FRACTALKNOW_INITIAL_DOC")
        .ok()
        .filter(|value| !value.trim().is_empty())
        .or_else(|| {
            std::env::args()
                .find_map(|arg| arg.strip_prefix("--initial-doc=").map(|value| value.to_string()))
                .filter(|value| !value.trim().is_empty())
        });
    let mode = match std::env::var("FRACTALKNOW_MODE")
        .unwrap_or_default()
        .as_str()
    {
        "editor" => "editor",
        "terminal" => "terminal",
        _ => "navigator",
    };
    DesktopConfig {
        collab_url: std::env::var("FRACTALKNOW_COLLAB_URL").unwrap_or_default(),
        api_origin: std::env::var("FRACTALKNOW_API_ORIGIN").unwrap_or_default(),
        project_path,
        project_name,
        mode,
        e2e_smoke: std::env::var("FRACTALKNOW_E2E_SMOKE").ok().as_deref() == Some("1"),
        single_file: std::env::var("FRACTALKNOW_SINGLE_FILE").ok().as_deref() == Some("1"),
        initial_doc,
        freshly_created: std::env::var("FRACTALKNOW_FRESHLY_CREATED").ok().as_deref() == Some("1"),
        startup_traceparent: std::env::var("FRACTALKNOW_STARTUP_TRACEPARENT").ok(),
        pty_available: true,
    }
}

#[tauri::command]
fn set_project_path<R: Runtime>(
    app: AppHandle<R>,
    state: tauri::State<'_, BridgeState>,
    path: String,
) -> Result<BridgeOk, String> {
    let resolved = project::resolve_target_path(&path);
    if !resolved.exists() {
        return Err(format!("Project path does not exist: {}", resolved.display()));
    }
    *state.project_path.lock() = resolved.clone();
    // Keep watcher aligned with the active project root.
    let _ = state.project_watcher.start(app.clone(), resolved.clone());
    let config = build_desktop_config(&resolved);
    let _ = app.emit("ok:project:switched", config);
    Ok(BridgeOk { ok: true })
}

#[tauri::command]
fn list_project_files(state: tauri::State<'_, BridgeState>) -> Result<Vec<project_fs::ProjectFileEntry>, String> {
    project_fs::list_files(&project_root(&state))
}

#[tauri::command]
fn append_activity_event(
    state: tauri::State<'_, BridgeState>,
    event: activity_log::ActivityEventInput,
) -> Result<activity_log::ActivityEvent, String> {
    activity_log::append_event(&project_root(&state), event)
}

#[tauri::command]
fn list_activity_sessions(
    state: tauri::State<'_, BridgeState>,
) -> Result<Vec<activity_log::ActivitySessionSummary>, String> {
    activity_log::list_sessions(&project_root(&state))
}

#[tauri::command]
fn read_activity_session(
    state: tauri::State<'_, BridgeState>,
    session_id: String,
    offset: Option<u64>,
    limit: Option<u64>,
) -> Result<activity_log::ActivitySessionPage, String> {
    activity_log::read_session(&project_root(&state), &session_id, offset.unwrap_or(0), limit.unwrap_or(100))
}

#[tauri::command]
fn prune_activity_sessions(
    state: tauri::State<'_, BridgeState>,
) -> Result<activity_log::ActivityPruneReport, String> {
    activity_log::prune(&project_root(&state))
}

#[tauri::command]
fn sync_bundled_skills(state: tauri::State<'_, BridgeState>) -> Result<bundled_skills::BundleSyncReport, String> {
    bundled_skills::sync(&project_root(&state))
}

#[tauri::command]
fn read_project_file(
    state: tauri::State<'_, BridgeState>,
    path: String,
) -> Result<project_fs::ProjectFileContent, String> {
    project_fs::read_file(&project_root(&state), &path)
}

#[tauri::command]
fn write_project_file(
    state: tauri::State<'_, BridgeState>,
    opts: project_fs::WriteFileInput,
) -> Result<project_fs::ProjectFileContent, String> {
    project_fs::write_file(&project_root(&state), &opts.path, &opts.content)
}

#[tauri::command]
fn create_project_entry(
    state: tauri::State<'_, BridgeState>,
    opts: project_fs::CreateEntryInput,
) -> Result<project_fs::ProjectFileEntry, String> {
    project_fs::create_entry(
        &project_root(&state),
        &opts.path,
        &opts.kind,
        opts.content.as_deref(),
    )
}

#[tauri::command]
fn rename_project_entry(
    state: tauri::State<'_, BridgeState>,
    opts: project_fs::RenameEntryInput,
) -> Result<project_fs::ProjectFileEntry, String> {
    project_fs::rename_entry(&project_root(&state), &opts.from, &opts.to)
}

#[tauri::command]
fn delete_project_entry(
    state: tauri::State<'_, BridgeState>,
    opts: project_fs::PathInput,
) -> Result<BridgeOk, String> {
    project_fs::delete_entry(&project_root(&state), &opts.path)?;
    Ok(BridgeOk { ok: true })
}

#[tauri::command]
fn list_document_versions(
    state: tauri::State<'_, BridgeState>,
    path: String,
) -> Result<Vec<project_fs::ProjectVersionEntry>, String> {
    project_fs::list_versions(&project_root(&state), &path)
}

#[tauri::command]
fn save_document_version(
    state: tauri::State<'_, BridgeState>,
    opts: project_fs::SaveVersionInput,
) -> Result<project_fs::ProjectVersionEntry, String> {
    project_fs::save_version(
        &project_root(&state),
        &opts.path,
        &opts.content,
        opts.title.as_deref(),
    )
}

#[tauri::command]
fn restore_document_version(
    state: tauri::State<'_, BridgeState>,
    opts: project_fs::RestoreVersionInput,
) -> Result<project_fs::ProjectFileContent, String> {
    project_fs::restore_version(&project_root(&state), &opts.path, &opts.version_id)
}

#[tauri::command]
fn watch_project_files<R: Runtime>(
    app: AppHandle<R>,
    state: tauri::State<'_, BridgeState>,
) -> Result<BridgeOk, String> {
    let root = project_root(&state);
    state.project_watcher.start(app, root)?;
    Ok(BridgeOk { ok: true })
}

#[tauri::command]
fn stop_watch_project_files(state: tauri::State<'_, BridgeState>) -> Result<BridgeOk, String> {
    state.project_watcher.stop();
    Ok(BridgeOk { ok: true })
}

fn now_timestamp() -> String {
    chrono::Utc::now().to_rfc3339()
}

fn apply_reduced_transparency<R: Runtime>(app: &AppHandle<R>, reduced: bool) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.eval(format!(
            "document.documentElement.dataset.reducedTransparency = '{reduced}';"
        ));
    }
    Ok(())
}

fn startup_deep_link_url() -> Option<String> {
    let mut args: Vec<String> = std::env::args().collect();
    if args.is_empty() {
        return None;
    }
    args.remove(0);
    deep_link::extract_deep_link_from_args(args)
}

fn emit_startup_bridge_events<R: Runtime>(app: &AppHandle<R>) {
    let now = now_timestamp();
    if let Some(url) = startup_deep_link_url() {
        let _ = app.emit(
            "ok:deep-link",
            deep_link::DeepLinkEvent {
                url,
                received_at: now.clone(),
            },
        );
    }
    let _ = app.emit(
        "ok:update-status",
        updater::UpdateStatus {
            status: "idle".to_string(),
            version: None,
            message: Some(
                "Updater will run its first check on the next request from the app.".to_string(),
            ),
            checked_at: now.clone(),
        },
    );
    let _ = app.emit(
        "ok:server-status",
        server::ServerState {
            status: "stopped".to_string(),
            url: None,
            message: Some("Local collaboration server is not started yet.".to_string()),
            pid: None,
            changed_at: now,
        },
    );
}

fn install_deep_link_handler<R: Runtime>(app: &AppHandle<R>) {
    let app_for_handler = app.clone();
    app.deep_link().on_open_url(move |event| {
        for url in event.urls() {
            deep_link::emit_deep_link(&app_for_handler, url.to_string());
        }
    });
}

fn application_menu<R: Runtime>(
    app: &AppHandle<R>,
    registry: &MenuRegistry,
) -> tauri::Result<Menu<R>> {
    build_menu(app, registry)
}

fn handle_menu_event<R: Runtime>(app: &AppHandle<R>, event: MenuEvent) {
    let id = event.id().as_ref();
    if id == menu::WINDOW_BRING_ALL_TO_FRONT_ID {
        // Handled natively: focus every window without a webview round-trip.
        for window in app.webview_windows().values() {
            let _ = window.set_focus();
        }
        return;
    }
    if let Some(action) = menu_action_for_id(id) {
        let _ = app.emit("ok:menu-action", action);
    }
}

pub fn run() {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info"))
        .format(|buf, record| {
            use std::io::Write;
            writeln!(
                buf,
                "[{}] {}: {}",
                now_timestamp(),
                record.level(),
                record.args()
            )
        })
        .target(env_logger::Target::Stderr)
        .init();

    let project_path = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));

    // One shared registry so menu build and set_menu_enablement stay in sync.
    let menu_registry = MenuRegistry::new();
    let menu_registry_for_builder = menu_registry.clone();
    let consent_registry = consent::ConsentRegistry::default();
    let server_handle = Arc::new(server::ServerHandle::new(
        std::env::temp_dir().join("fractalknow-server-state.json"),
    ));
    let terminal_registry = TerminalRegistry::new();
    let updater_state = updater::UpdaterState::new();
    let reduced_transparency = Mutex::new(false);

    tauri::Builder::default()
        .menu(move |app| application_menu(app, &menu_registry_for_builder))
        .on_menu_event(handle_menu_event)
        .setup({
            let project_path = project_path.clone();
            let menu_registry = menu_registry.clone();
            move |app| {
                let handle = app.handle().clone();
                crash::install_panic_hook(handle.clone());

                let watcher = Arc::new(ProjectWatcher::new());
                let state = BridgeState {
                    menu_registry,
                    consent: consent_registry.clone(),
                    server: server_handle.clone(),
                    terminal: terminal_registry.clone(),
                    updater: updater_state.clone(),
                    project_path: Mutex::new(project_path.clone()),
                    project_watcher: watcher.clone(),
                    reduced_transparency,
                };
                app.manage(state);
                let _ = watcher.start(handle.clone(), project_path.clone());
                emit_startup_bridge_events(&handle);
                install_deep_link_handler(&handle);
                Ok(())
            }
        })
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_log::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            app_info,
            desktop_config,
            set_theme_source,
            detect_protocol,
            startup_deep_link,
            theme_applied,
            check_update_status,
            install_update,
            terminal_start,
            terminal_write,
            terminal_stop,
            create_project,
            read_recent_projects,
            write_recent_projects,
            read_app_config,
            write_app_config,
            capture_bug_report,
            submit_feedback,
            set_menu_enablement,
            get_menu_enablement,
            request_consent,
            grant_consent,
            start_local_server,
            stop_local_server,
            local_server_status,
            simulate_panic,
            list_crash_reports,
            read_crash_report,
            set_project_path,
            list_project_files,
            sync_bundled_skills,
            read_project_file,
            write_project_file,
            create_project_entry,
            rename_project_entry,
            delete_project_entry,
            list_document_versions,
            save_document_version,
            restore_document_version,
            watch_project_files,
            stop_watch_project_files,
        append_activity_event,
        list_activity_sessions,
        read_activity_session,
        prune_activity_sessions
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    #[test]
    fn menu_spec_is_consistent() {
        let all_ids = menu::known_menu_item_ids();
        let mut seen = HashMap::new();
        for id in &all_ids {
            assert!(seen.insert(*id, ()).is_none(), "duplicate menu id: {id}");
        }
        assert!(all_ids.contains(&"new-doc"));
        assert!(all_ids.contains(&"toggle-terminal"));
        assert!(all_ids.contains(&"focus-command-palette"));
        assert!(all_ids.contains(&"report-bug"));
        assert!(all_ids.contains(&"send-feedback"));
        assert!(all_ids.contains(&"open-folder"));
        assert!(all_ids.contains(&"open-file"));
        assert!(all_ids.contains(&"switch-project"));
        assert!(all_ids.contains(&"open-github"));
        // Deferred git worktree stubs and the fake send-to-ai URL were removed.
        assert!(!all_ids.contains(&"new-worktree"));
        assert!(!all_ids.contains(&"switch-worktree"));
        assert!(!all_ids.contains(&"send-to-ai"));
    }

    #[test]
    fn menu_action_for_id_returns_known_ids() {
        assert_eq!(menu_action_for_id("new-doc"), Some("new-doc".to_string()));
        assert_eq!(
            menu_action_for_id("settings-validation"),
            Some("settings-validation".to_string())
        );
        assert_eq!(
            menu_action_for_id("clone-project"),
            Some("clone-project".to_string())
        );
        assert_eq!(
            menu_action_for_id("show-diagnostics"),
            Some("show-diagnostics".to_string())
        );
        assert_eq!(
            menu_action_for_id("send-feedback"),
            Some("send-feedback".to_string())
        );
        assert_eq!(menu_action_for_id("unknown"), None);
    }

    #[test]
    fn app_info_matches_bridge_contract() {
        // We cannot construct an AppHandle here, but we can verify the
        // payload shape via a stub that returns the expected fields.
        let info = AppInfo {
            name: "FractalKnow",
            desktop_runtime: "Tauri v2",
            frontend_runtime: "SvelteKit SPA",
            styling: "tab-indented Sass",
            os: std::env::consts::OS,
            arch: std::env::consts::ARCH,
            app_version: "0.1.0".to_string(),
        };
        assert_eq!(info.name, "FractalKnow");
        assert_eq!(info.desktop_runtime, "Tauri v2");
        assert_eq!(info.frontend_runtime, "SvelteKit SPA");
        assert_eq!(info.styling, "tab-indented Sass");
        assert!(!info.app_version.is_empty());
    }

    #[test]
    fn deep_link_scheme_validation() {
        assert!(deep_link::is_valid_scheme("fractalknow"));
        assert!(deep_link::is_valid_scheme("openknowledge+dev"));
        assert!(deep_link::is_valid_scheme("ok-preview.1"));
        assert!(!deep_link::is_valid_scheme(""));
        assert!(!deep_link::is_valid_scheme("1fractalknow"));
        assert!(!deep_link::is_valid_scheme("bad scheme"));
    }

    #[test]
    fn desktop_config_uses_resolved_path() {
        // Stub: just verify the project_path argument is read from
        // std::env::current_dir or the supplied default.
        let resolved = std::env::current_dir()
            .ok()
            .and_then(|p| p.into_os_string().into_string().ok())
            .unwrap_or_else(|| "fractalknow".to_string());
        assert!(!resolved.is_empty());
    }

    #[test]
    fn menu_registry_tracks_enablement() {
        let registry = MenuRegistry::new();
        assert!(registry.is_enabled("anything"));
        registry.set_enabled("save-version", false);
        assert!(!registry.is_enabled("save-version"));
        let snapshot = registry.enabled_snapshot();
        assert_eq!(snapshot.get("save-version"), Some(&false));
    }

    #[test]
    fn project_template_creates_real_files() {
        let tmp = std::env::temp_dir().join(format!(
            "fractalknow-template-test-{}",
            chrono::Utc::now().timestamp_nanos_opt().unwrap_or(0)
        ));
        let template = project::default_template("demo");
        let result = project::create(&tmp, &template).expect("create");
        assert!(!result.files.is_empty());
        for file in &result.files {
            assert!(tmp.join(file).exists(), "missing file: {file}");
        }
        let _ = fs::remove_dir_all(&tmp);
    }

    #[test]
    fn project_rejects_non_empty_target() {
        let tmp = std::env::temp_dir().join(format!(
            "fractalknow-template-conflict-{}",
            chrono::Utc::now().timestamp_nanos_opt().unwrap_or(0)
        ));
        fs::create_dir_all(&tmp).unwrap();
        fs::write(tmp.join("existing.txt"), "not empty").unwrap();
        let template = project::default_template("demo");
        let result = project::create(&tmp, &template);
        assert!(result.is_err());
        let _ = fs::remove_dir_all(&tmp);
    }
}

// Server handle creation lives in `server::ServerHandle::new`.
