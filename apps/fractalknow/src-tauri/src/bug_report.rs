//! Real bug report capture. Collects app version, OS, host, recent log
//! lines, and the user-provided message, and writes a JSON report to the
//! app data directory.

use std::fs;
use std::path::PathBuf;

use chrono::Utc;
use serde::Serialize;
use tauri::{AppHandle, Runtime};

use crate::paths;

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct BugReport {
    pub id: String,
    pub app_version: String,
    pub host: String,
    pub os: String,
    pub arch: String,
    pub cwd: String,
    pub user_message: Option<String>,
    pub recent_logs: Vec<String>,
    pub created_at: String,
    pub report_path: String,
}

pub fn build_report<R: Runtime>(
    app: &AppHandle<R>,
    message: Option<String>,
) -> Result<BugReport, String> {
    let id = format!("bug-{}", Utc::now().timestamp_millis());
    let app_version = app.package_info().version.to_string();
    let host = hostname::get()
        .ok()
        .and_then(|name| name.into_string().ok())
        .unwrap_or_else(|| "unknown".to_string());
    let os = std::env::consts::OS.to_string();
    let arch = std::env::consts::ARCH.to_string();
    let cwd = std::env::current_dir()
        .ok()
        .and_then(|p| p.into_os_string().into_string().ok())
        .unwrap_or_default();

    let logs_dir = paths::logs_dir(app)?;
    let mut recent_logs = Vec::new();
    if let Ok(entries) = fs::read_dir(&logs_dir) {
        let mut log_files: Vec<PathBuf> = entries
            .filter_map(|entry| entry.ok().map(|e| e.path()))
            .filter(|path| {
                path.extension()
                    .and_then(|ext| ext.to_str())
                    .map(|ext| ext == "log")
                    .unwrap_or(false)
            })
            .collect();
        log_files.sort();
        if let Some(latest) = log_files.last() {
            recent_logs = crate::crash::tail_log_file(latest, 50).unwrap_or_default();
        }
    }

    let dir = paths::bug_reports_dir(app)?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let report_path = dir.join(format!("{id}.json"));
    let body = serde_json::json!({
        "id": id,
        "appVersion": app_version,
        "host": host,
        "os": os,
        "arch": arch,
        "cwd": cwd,
        "userMessage": message,
        "recentLogs": recent_logs,
        "createdAt": Utc::now().to_rfc3339(),
    });
    fs::write(
        &report_path,
        serde_json::to_string_pretty(&body).map_err(|e| e.to_string())?,
    )
    .map_err(|e| e.to_string())?;

    Ok(BugReport {
        id,
        app_version,
        host,
        os,
        arch,
        cwd,
        user_message: message,
        recent_logs,
        created_at: Utc::now().to_rfc3339(),
        report_path: report_path.to_string_lossy().to_string(),
    })
}
