//! App-data directory helpers used by the bridge.

use std::path::PathBuf;
use tauri::{AppHandle, Manager, Runtime};

pub fn app_data_dir<R: Runtime>(app: &AppHandle<R>) -> Result<PathBuf, String> {
    app.path().app_data_dir().map_err(|e| e.to_string())
}

pub fn crash_reports_dir<R: Runtime>(app: &AppHandle<R>) -> Result<PathBuf, String> {
    Ok(app_data_dir(app)?.join("crash-reports"))
}

pub fn bug_reports_dir<R: Runtime>(app: &AppHandle<R>) -> Result<PathBuf, String> {
    Ok(app_data_dir(app)?.join("bug-reports"))
}

pub fn logs_dir<R: Runtime>(app: &AppHandle<R>) -> Result<PathBuf, String> {
    Ok(app_data_dir(app)?.join("logs"))
}

pub fn recent_projects_path<R: Runtime>(app: &AppHandle<R>) -> Result<PathBuf, String> {
    Ok(app_data_dir(app)?.join("recent-projects.json"))
}

pub fn app_config_path<R: Runtime>(app: &AppHandle<R>) -> Result<PathBuf, String> {
    Ok(app_data_dir(app)?.join("app-config.json"))
}

pub fn consent_state_path<R: Runtime>(app: &AppHandle<R>) -> Result<PathBuf, String> {
    Ok(app_data_dir(app)?.join("consent.json"))
}

pub fn server_state_path<R: Runtime>(app: &AppHandle<R>) -> Result<PathBuf, String> {
    Ok(app_data_dir(app)?.join("server-state.json"))
}

#[allow(dead_code)]
pub fn updater_state_path<R: Runtime>(app: &AppHandle<R>) -> Result<PathBuf, String> {
    Ok(app_data_dir(app)?.join("updater-state.json"))
}
