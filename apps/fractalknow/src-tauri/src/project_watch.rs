//! Project file watcher. Emits `ok:project-files-changed` when the project
//! tree mutates so the shell can reconcile dirty editor state.

use std::path::{Path, PathBuf};
use std::time::Duration;

use notify::{RecommendedWatcher, RecursiveMode};
use notify_debouncer_mini::{new_debouncer, DebouncedEventKind, Debouncer};
use parking_lot::Mutex;
use serde::Serialize;
use tauri::{AppHandle, Emitter, Runtime};

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ProjectFilesChangedEvent {
    pub root: String,
    pub paths: Vec<String>,
    pub kind: String,
    pub changed_at: String,
}

fn is_path_ignored(root: &Path, display: &str) -> bool {
    let lower = display.to_lowercase();
    if lower.contains("/.git/") || lower.contains("/node_modules/") || lower.contains("/target/") || lower.contains("/.ok/cache/") {
        return true;
    }
    let okignore_path = root.join(".okignore");
    if okignore_path.exists() {
        if let Ok(content) = std::fs::read_to_string(okignore_path) {
            for line in content.lines() {
                let trimmed = line.trim();
                if trimmed.is_empty() || trimmed.starts_with('#') {
                    continue;
                }
                let clean = trimmed.trim_end_matches('/');
                if !clean.is_empty() && (display.contains(clean) || display.ends_with(clean)) {
                    return true;
                }
            }
        }
    }
    false
}

pub struct ProjectWatcher {
    inner: Mutex<Option<ActiveWatcher>>,
}

struct ActiveWatcher {
    root: PathBuf,
    // Keep the debouncer alive for the lifetime of the watch.
    _debouncer: Debouncer<RecommendedWatcher>,
}

impl ProjectWatcher {
    pub fn new() -> Self {
        Self {
            inner: Mutex::new(None),
        }
    }

    pub fn stop(&self) {
        *self.inner.lock() = None;
    }

    pub fn start<R: Runtime>(&self, app: AppHandle<R>, root: PathBuf) -> Result<(), String> {
        if !root.exists() {
            return Err(format!("Cannot watch missing project root: {}", root.display()));
        }

        self.stop();

        let app_handle = app.clone();
        let watched_root = root.clone();
        let mut debouncer = new_debouncer(
            Duration::from_millis(250),
            move |result: Result<Vec<notify_debouncer_mini::DebouncedEvent>, _>| {
                let Ok(events) = result else {
                    return;
                };
                let mut paths = Vec::new();
                for event in events {
                    if event.kind != DebouncedEventKind::Any {
                        continue;
                    }
                    if let Ok(rel) = event.path.strip_prefix(&watched_root) {
                        let display = format!("/{}", rel.to_string_lossy().replace('\\', "/"));
                        if is_path_ignored(&watched_root, &display) {
                            continue;
                        }
                        if !paths.contains(&display) {
                            paths.push(display);
                        }
                    }
                }
                if paths.is_empty() {
                    return;
                }
                let payload = ProjectFilesChangedEvent {
                    root: watched_root.to_string_lossy().to_string(),
                    paths,
                    kind: "changed".to_string(),
                    changed_at: chrono::Utc::now().to_rfc3339(),
                };
                let _ = app_handle.emit("ok:project-files-changed", payload);
            },
        )
        .map_err(|e| e.to_string())?;

        debouncer
            .watcher()
            .watch(Path::new(&root), RecursiveMode::Recursive)
            .map_err(|e| e.to_string())?;

        *self.inner.lock() = Some(ActiveWatcher {
            root,
            _debouncer: debouncer,
        });
        Ok(())
    }

    pub fn is_watching(&self, root: &Path) -> bool {
        self.inner
            .lock()
            .as_ref()
            .map(|active| active.root == root)
            .unwrap_or(false)
    }
}

impl Default for ProjectWatcher {
    fn default() -> Self {
        Self::new()
    }
}
