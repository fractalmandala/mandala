//! Bundled skills/agents/commands pipeline: ships the investigation-curated
//! skill set inside the app and materializes it into each opened project so
//! the existing document/sidebar pipeline surfaces it (read-only v1).
//!
//! Layout inside a project root:
//!   .ok/skills/bundled/<source>/<name>/...   (three sources: agentic, curated, bosses)
//!   .ok/agents/bundled/<name>.md
//!   .ok/commands/bundled/<name>.md
//!   .ok/bundled/.marker.json                 (sync marker; idempotency)
//!
//! Everything under `.ok/**/bundled/` is app-managed: sync deletes and
//! rewrites it on version change. User edits there are intentionally lost.

use std::fs;
use std::path::{Path, PathBuf};

use serde::Serialize;

/// Bump when bundle contents or layout change; projects with an older marker
/// re-sync on next open.
const BUNDLED_VERSION: u32 = 1;

const MARKER_REL: &str = ".ok/bundled/.marker.json";

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct BundleSyncReport {
    pub version: u32,
    pub files_copied: u64,
    pub skipped: bool,
    pub reason: Option<String>,
}

/// Resolve the app-side bundle source directory.
/// Dev: `<crate>/../bundled` (repo checkout). Packaged: `Resources/bundled`
/// next to the executable (declared as a Tauri bundle resource).
fn bundle_source_dir() -> Result<PathBuf, String> {
    let dev = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../bundled");
    if dev.is_dir() {
        return Ok(dev);
    }
    if let Ok(exe) = std::env::current_exe() {
        // macOS: .app/Contents/MacOS/<exe> → .app/Contents/Resources/bundled
        if let Some(macos_dir) = exe.parent() {
            let resources = macos_dir.join("../Resources/bundled");
            if resources.is_dir() {
                return Ok(resources);
            }
            // Linux/Windows: resource dir beside the executable.
            let beside = macos_dir.join("bundled");
            if beside.is_dir() {
                return Ok(beside);
            }
        }
    }
    Err("Bundled skills directory not found (dev ../bundled or app Resources/bundled).".to_string())
}

fn marker_path(root: &Path) -> PathBuf {
    root.join(MARKER_REL)
}

fn marker_version(root: &Path) -> Option<u32> {
    let raw = fs::read_to_string(marker_path(root)).ok()?;
    let parsed: serde_json::Value = serde_json::from_str(&raw).ok()?;
    parsed.get("version")?.as_u64().map(|v| v as u32)
}

/// Recursively copy `src` into `dst`, replacing `dst` entirely. Returns the
/// number of files copied. Both paths are constructed by this module only
/// (never from user input), so confinement is by construction under `root`.
fn replace_dir(src: &Path, dst: &Path, files_copied: &mut u64) -> Result<(), String> {
    if !src.is_dir() {
        return Ok(()); // optional bundle layer (e.g. no agents dir) — fine
    }
    if dst.exists() {
        fs::remove_dir_all(dst).map_err(|e| format!("Failed to clear {}: {e}", dst.display()))?;
    }
    fs::create_dir_all(dst).map_err(|e| format!("Failed to create {}: {e}", dst.display()))?;
    for entry in fs::read_dir(src).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let from = entry.path();
        let to = dst.join(entry.file_name());
        if from.is_dir() {
            copy_recursive(&from, &to, files_copied)?;
        } else {
            fs::copy(&from, &to)
                .map_err(|e| format!("Failed to copy {} → {}: {e}", from.display(), to.display()))?;
            *files_copied += 1;
        }
    }
    Ok(())
}

fn copy_recursive(src: &Path, dst: &Path, files_copied: &mut u64) -> Result<(), String> {
    fs::create_dir_all(dst).map_err(|e| e.to_string())?;
    for entry in fs::read_dir(src).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let from = entry.path();
        let to = dst.join(entry.file_name());
        if from.is_dir() {
            copy_recursive(&from, &to, files_copied)?;
        } else {
            fs::copy(&from, &to)
                .map_err(|e| format!("Failed to copy {} → {}: {e}", from.display(), to.display()))?;
            *files_copied += 1;
        }
    }
    Ok(())
}

/// Materialize the bundled pipeline into the project. Idempotent: a project
/// whose marker matches BUNDLED_VERSION is skipped cheaply (source resolution
/// is deferred until after the skip check so packaged apps without the
/// resource don't error on already-synced projects).
pub fn sync(root: &Path) -> Result<BundleSyncReport, String> {
    if marker_version(root) == Some(BUNDLED_VERSION) {
        return Ok(BundleSyncReport {
            version: BUNDLED_VERSION,
            files_copied: 0,
            skipped: true,
            reason: Some("already at bundle version".to_string()),
        });
    }
    let source = bundle_source_dir()?;
    sync_from(&source, root)
}

fn sync_from(source: &Path, root: &Path) -> Result<BundleSyncReport, String> {
    if !root.exists() {
        return Err(format!("Project root does not exist: {}", root.display()));
    }
    if marker_version(root) == Some(BUNDLED_VERSION) {
        return Ok(BundleSyncReport {
            version: BUNDLED_VERSION,
            files_copied: 0,
            skipped: true,
            reason: Some("already at bundle version".to_string()),
        });
    }

    let mut files_copied: u64 = 0;
    replace_dir(&source.join("skills"), &root.join(".ok/skills/bundled"), &mut files_copied)?;
    replace_dir(&source.join("agents"), &root.join(".ok/agents/bundled"), &mut files_copied)?;
    replace_dir(
        &source.join("commands"),
        &root.join(".ok/commands/bundled"),
        &mut files_copied,
    )?;

    let marker_dir = root.join(".ok/bundled");
    fs::create_dir_all(&marker_dir).map_err(|e| e.to_string())?;
    let marker = serde_json::json!({
        "version": BUNDLED_VERSION,
        "filesCopied": files_copied,
        "syncedAt": chrono::Utc::now().to_rfc3339(),
        "note": "App-managed. Contents under .ok/**/bundled/ are replaced on sync; do not edit.",
    });
    fs::write(marker_path(root), serde_json::to_string_pretty(&marker).map_err(|e| e.to_string())?)
        .map_err(|e| e.to_string())?;

    Ok(BundleSyncReport {
        version: BUNDLED_VERSION,
        files_copied,
        skipped: false,
        reason: None,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;

    struct TestDirs {
        source: PathBuf,
        project: PathBuf,
    }

    impl TestDirs {
        fn new(tag: &str) -> Self {
            let stamp = chrono::Utc::now().timestamp_nanos_opt().unwrap_or(0);
            let base = env::temp_dir().join(format!("fractalknow-bundled-{tag}-{stamp}"));
            let _ = fs::remove_dir_all(&base);
            let source = base.join("source");
            let project = base.join("project");
            fs::create_dir_all(&project).unwrap();
            write_file(&source.join("skills/agentic/demo/SKILL.md"), "# Demo");
            write_file(&source.join("agents/reviewer.md"), "# Reviewer");
            write_file(&source.join("commands/review.md"), "# Review");
            Self { source, project }
        }
    }

    impl Drop for TestDirs {
        fn drop(&mut self) {
            if let Some(base) = self.source.parent() {
                let _ = fs::remove_dir_all(base);
            }
        }
    }

    fn write_file(path: &Path, content: &str) {
        fs::create_dir_all(path.parent().unwrap()).unwrap();
        fs::write(path, content).unwrap();
    }

    #[test]
    fn first_sync_copies_and_marks() {
        let dirs = TestDirs::new("first");
        let report = sync_from(&dirs.source, &dirs.project).unwrap();
        assert!(!report.skipped);
        assert_eq!(report.files_copied, 3);
        assert!(dirs.project.join(".ok/skills/bundled/agentic/demo/SKILL.md").exists());
        assert!(dirs.project.join(".ok/agents/bundled/reviewer.md").exists());
        assert!(dirs.project.join(".ok/commands/bundled/review.md").exists());
        assert_eq!(marker_version(&dirs.project), Some(BUNDLED_VERSION));
    }

    #[test]
    fn second_sync_is_skipped() {
        let dirs = TestDirs::new("second");
        sync_from(&dirs.source, &dirs.project).unwrap();
        let report = sync_from(&dirs.source, &dirs.project).unwrap();
        assert!(report.skipped);
        assert_eq!(report.files_copied, 0);
    }

    #[test]
    fn version_bump_resyncs_and_replaces_stale_files() {
        let dirs = TestDirs::new("bump");
        sync_from(&dirs.source, &dirs.project).unwrap();
        // Stale file from an older bundle + an older marker version.
        let stale = dirs.project.join(".ok/skills/bundled/old/SKILL.md");
        write_file(&stale, "stale");
        fs::write(
            marker_path(&dirs.project),
            serde_json::to_string(&serde_json::json!({ "version": 0 })).unwrap(),
        )
        .unwrap();
        let report = sync_from(&dirs.source, &dirs.project).unwrap();
        assert!(!report.skipped);
        assert!(!stale.exists(), "stale bundled content must be replaced");
    }

    #[test]
    fn missing_root_errors() {
        let dirs = TestDirs::new("missing");
        let missing = dirs.source.join("does-not-exist");
        assert!(sync_from(&dirs.source, &missing).is_err());
    }
}
