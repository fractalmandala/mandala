//! Crash detection and crash report capture.
//!
//! A real crash report includes the panic message, location, app version,
//! recent log lines, and basic host information. Reports are written to
//! the app data directory and the `ok:crash-invite` event is emitted.

use std::fs::{self, File, OpenOptions};
use std::io::{BufRead, BufReader, Write};
use std::path::PathBuf;
use std::sync::Mutex;

use chrono::Utc;
use serde::Serialize;
use tauri::{AppHandle, Emitter, Runtime};

use crate::paths;

const RING_BUFFER_SIZE: usize = 200;
const CRASH_REPORT_PREFIX: &str = "crash-";

static LOG_RING: Mutex<Vec<String>> = Mutex::new(Vec::new());

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CrashReport {
    pub id: String,
    pub reason: String,
    pub location: Option<String>,
    pub app_version: String,
    pub host: String,
    pub os: String,
    pub recent_logs: Vec<String>,
    pub created_at: String,
}

/// Records a log line into the in-memory ring buffer for crash report context.
#[allow(dead_code)]
pub fn record_log_line(line: &str) {
    if let Ok(mut buffer) = LOG_RING.lock() {
        buffer.push(line.to_string());
        let len = buffer.len();
        if len > RING_BUFFER_SIZE {
            let excess = len - RING_BUFFER_SIZE;
            buffer.drain(0..excess);
        }
    }
}

/// Installs a panic hook that writes a crash report and emits the
/// `ok:crash-invite` event before re-raising the original panic.
pub fn install_panic_hook<R: Runtime>(app: AppHandle<R>) {
    let app_for_hook = app.clone();
    std::panic::set_hook(Box::new(move |info| {
        let location = info
            .location()
            .map(|loc| format!("{}:{}:{}", loc.file(), loc.line(), loc.column()));
        let reason = if let Some(s) = info.payload().downcast_ref::<&str>() {
            (*s).to_string()
        } else if let Some(s) = info.payload().downcast_ref::<String>() {
            s.clone()
        } else {
            "Panic occurred in native runtime".to_string()
        };

        let report = match build_report(app_for_hook.clone(), &reason, location.as_deref()) {
            Ok(report) => report,
            Err(error) => {
                eprintln!("failed to build crash report: {error}");
                return;
            }
        };

        if let Err(error) = write_report(&app_for_hook, &report) {
            eprintln!("failed to write crash report: {error}");
            return;
        }

        let event = crate::CrashInviteEvent {
            id: report.id.clone(),
            reason: report.reason.clone(),
            report_path: format!("crash-reports/{}.json", report.id),
            created_at: report.created_at.clone(),
        };
        let _ = app_for_hook.emit("ok:crash-invite", event);
    }));
}

pub fn build_report<R: Runtime>(
    app: AppHandle<R>,
    reason: &str,
    location: Option<&str>,
) -> Result<CrashReport, String> {
    let id = format!("{}{}", CRASH_REPORT_PREFIX, Utc::now().timestamp_millis());
    let host = hostname::get()
        .ok()
        .and_then(|name| name.into_string().ok())
        .unwrap_or_else(|| "unknown".to_string());
    let os = format!(
        "{} {}",
        std::env::consts::OS,
        sysinfo::System::kernel_version().unwrap_or_default()
    );
    let recent_logs = LOG_RING.lock().map(|b| b.clone()).unwrap_or_default();
    let app_version = app.package_info().version.to_string();

    Ok(CrashReport {
        id,
        reason: reason.to_string(),
        location: location.map(|s| s.to_string()),
        app_version,
        host,
        os,
        recent_logs,
        created_at: Utc::now().to_rfc3339(),
    })
}

pub fn write_report<R: Runtime>(
    app: &AppHandle<R>,
    report: &CrashReport,
) -> Result<PathBuf, String> {
    let dir = paths::crash_reports_dir(app)?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let path = dir.join(format!("{}.json", report.id));
    let body = serde_json::to_string_pretty(report).map_err(|e| e.to_string())?;
    fs::write(&path, body).map_err(|e| e.to_string())?;
    Ok(path)
}

/// A crash-report id is safe when it is a single, non-empty path component
/// (alphanumeric plus `-`/`_`). This is exactly the shape produced by
/// [`build_report`] (`crash-<millis>`) and rejects the `..`, `/`, and
/// absolute-path payloads a compromised webview could otherwise pass to
/// `read_crash_report` to escape the crash-reports directory (CWE-22).
fn is_safe_report_id(id: &str) -> bool {
    !id.is_empty()
        && id.len() <= 128
        && id
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || matches!(c, '-' | '_'))
}

/// Returns the path to a stored crash report, or `None` if it does not exist.
pub fn report_path<R: Runtime>(app: &AppHandle<R>, id: &str) -> Result<Option<PathBuf>, String> {
    if !is_safe_report_id(id) {
        return Err("Invalid crash report id.".to_string());
    }
    let dir = paths::crash_reports_dir(app)?;
    let path = dir.join(format!("{id}.json"));
    if path.exists() {
        Ok(Some(path))
    } else {
        Ok(None)
    }
}

/// Lists all stored crash reports, newest first.
pub fn list_reports<R: Runtime>(app: &AppHandle<R>) -> Result<Vec<PathBuf>, String> {
    let dir = paths::crash_reports_dir(app)?;
    if !dir.exists() {
        return Ok(Vec::new());
    }
    let mut entries: Vec<PathBuf> = fs::read_dir(&dir)
        .map_err(|e| e.to_string())?
        .filter_map(|entry| entry.ok().map(|e| e.path()))
        .filter(|path| {
            path.extension()
                .and_then(|ext| ext.to_str())
                .map(|ext| ext == "json")
                .unwrap_or(false)
        })
        .collect();
    entries.sort_by(|a, b| b.file_name().cmp(&a.file_name()));
    Ok(entries)
}

/// Helper for tests: append a synthetic line to a log file so we can verify
/// that the bug report includes the most recent log lines.
#[allow(dead_code)]
pub fn append_to_log_file(path: &PathBuf, line: &str) -> std::io::Result<()> {
    let mut file = OpenOptions::new().create(true).append(true).open(path)?;
    writeln!(file, "{line}")?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn safe_report_id_accepts_generated_ids_and_rejects_traversal() {
        // The shape build_report produces.
        assert!(is_safe_report_id("crash-1717171717171"));
        // Traversal / absolute / separator payloads are refused.
        assert!(!is_safe_report_id("../../../../etc/hosts"));
        assert!(!is_safe_report_id("/etc/hosts"));
        assert!(!is_safe_report_id("a/b"));
        assert!(!is_safe_report_id("a.b"));
        assert!(!is_safe_report_id(""));
    }
}

/// Reads the trailing N lines from a log file for inclusion in a bug report.
pub fn tail_log_file(path: &PathBuf, max_lines: usize) -> std::io::Result<Vec<String>> {
    if !path.exists() {
        return Ok(Vec::new());
    }
    let file = File::open(path)?;
    let reader = BufReader::new(file);
    let all: Vec<String> = reader.lines().map_while(Result::ok).collect();
    let start = all.len().saturating_sub(max_lines);
    Ok(all[start..].to_vec())
}
