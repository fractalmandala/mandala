//! Project-backed document filesystem: list, read, write, create, rename,
//! delete, and version snapshots under the selected project root.

use std::fs;
use std::path::{Component, Path, PathBuf};

use serde::{Deserialize, Serialize};
use walkdir::WalkDir;

const VERSION_DIR: &str = ".fractalknow/versions";
const MAX_TEXT_BYTES: u64 = 8 * 1024 * 1024;

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ProjectFileEntry {
    pub path: String,
    pub name: String,
    pub kind: String,
    pub size: u64,
    pub extension: String,
    pub binary: bool,
    pub modified_at: Option<String>,
}

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ProjectFileContent {
    pub path: String,
    pub content: String,
    pub size: u64,
    pub binary: bool,
    pub encoding: String,
    pub modified_at: Option<String>,
}

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ProjectVersionEntry {
    pub id: String,
    pub title: String,
    pub created_at: String,
    pub size: u64,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WriteFileInput {
    pub path: String,
    pub content: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PathInput {
    pub path: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateEntryInput {
    pub path: String,
    pub kind: String,
    pub content: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RenameEntryInput {
    pub from: String,
    pub to: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveVersionInput {
    pub path: String,
    pub content: String,
    pub title: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RestoreVersionInput {
    pub path: String,
    pub version_id: String,
}

fn is_binary_extension(ext: &str) -> bool {
    matches!(
        ext,
        "png" | "jpg" | "jpeg" | "gif" | "webp" | "avif" | "pdf" | "zip" | "ico" | "woff" | "woff2"
    )
}

fn normalize_relative(path: &str) -> Result<PathBuf, String> {
    let trimmed = path.trim().trim_start_matches('/');
    if trimmed.is_empty() {
        return Err("Path is empty.".to_string());
    }
    let candidate = PathBuf::from(trimmed);
    if candidate.is_absolute() {
        return Err("Absolute paths are not allowed.".to_string());
    }
    for component in candidate.components() {
        match component {
            Component::Normal(_) | Component::CurDir => {}
            _ => return Err(format!("Unsafe path component in {path}")),
        }
    }
    Ok(candidate)
}

fn resolve_under_root(root: &Path, relative: &str) -> Result<PathBuf, String> {
    let rel = normalize_relative(relative)?;
    let full = root.join(&rel);
    let root_canon = root
        .canonicalize()
        .unwrap_or_else(|_| root.to_path_buf());
    if let Ok(full_canon) = full.canonicalize() {
        if !full_canon.starts_with(&root_canon) {
            return Err("Path escapes project root.".to_string());
        }
        return Ok(full_canon);
    }
    // File may not exist yet (create/write). Ensure parent stays in root.
    if let Some(parent) = full.parent() {
        if parent.exists() {
            let parent_canon = parent
                .canonicalize()
                .map_err(|e| e.to_string())?;
            if !parent_canon.starts_with(&root_canon) {
                return Err("Path escapes project root.".to_string());
            }
        }
    }
    Ok(full)
}

fn modified_at(meta: &fs::Metadata) -> Option<String> {
    meta.modified()
        .ok()
        .and_then(|time| time.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|duration| {
            chrono::DateTime::<chrono::Utc>::from_timestamp(duration.as_secs() as i64, 0)
                .map(|dt| dt.to_rfc3339())
                .unwrap_or_default()
        })
        .filter(|value| !value.is_empty())
}

fn relative_display(root: &Path, full: &Path) -> String {
    full.strip_prefix(root)
        .map(|p| format!("/{}", p.to_string_lossy().replace('\\', "/")))
        .unwrap_or_else(|_| format!("/{}", full.to_string_lossy().replace('\\', "/")))
}

pub fn list_files(root: &Path) -> Result<Vec<ProjectFileEntry>, String> {
    if !root.exists() {
        return Err(format!("Project root does not exist: {}", root.display()));
    }
    let mut entries = Vec::new();
    for item in WalkDir::new(root)
        .into_iter()
        .filter_entry(|e| {
            let name = e.file_name().to_string_lossy();
            name != "node_modules" && name != ".git" && name != "target"
        })
        .filter_map(|e| e.ok())
    {
        let path = item.path();
        if path == root {
            continue;
        }
        let meta = item.metadata().map_err(|e| e.to_string())?;
        let rel = relative_display(root, path);
        let name = path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("")
            .to_string();
        let extension = path
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("")
            .to_lowercase();
        let kind = if meta.is_dir() { "folder" } else { "file" };
        entries.push(ProjectFileEntry {
            path: rel,
            name,
            kind: kind.to_string(),
            size: meta.len(),
            extension: extension.clone(),
            binary: meta.is_file() && is_binary_extension(&extension),
            modified_at: modified_at(&meta),
        });
    }
    entries.sort_by(|a, b| a.path.cmp(&b.path));
    Ok(entries)
}

pub fn read_file(root: &Path, relative: &str) -> Result<ProjectFileContent, String> {
    let full = resolve_under_root(root, relative)?;
    if !full.exists() {
        return Err(format!("File not found: {relative}"));
    }
    let meta = fs::metadata(&full).map_err(|e| e.to_string())?;
    if meta.is_dir() {
        return Err(format!("Path is a directory: {relative}"));
    }
    let extension = full
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();
    let binary = is_binary_extension(&extension);
    if binary {
        return Ok(ProjectFileContent {
            path: relative_display(root, &full),
            content: String::new(),
            size: meta.len(),
            binary: true,
            encoding: "binary".to_string(),
            modified_at: modified_at(&meta),
        });
    }
    if meta.len() > MAX_TEXT_BYTES {
        return Err(format!(
            "File exceeds maximum readable size ({} bytes).",
            MAX_TEXT_BYTES
        ));
    }
    let content = fs::read_to_string(&full).map_err(|e| e.to_string())?;
    Ok(ProjectFileContent {
        path: relative_display(root, &full),
        content,
        size: meta.len(),
        binary: false,
        encoding: "utf-8".to_string(),
        modified_at: modified_at(&meta),
    })
}

pub fn write_file(root: &Path, relative: &str, content: &str) -> Result<ProjectFileContent, String> {
    let full = resolve_under_root(root, relative)?;
    if let Some(parent) = full.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    fs::write(&full, content).map_err(|e| e.to_string())?;
    read_file(root, relative)
}

pub fn create_entry(
    root: &Path,
    relative: &str,
    kind: &str,
    content: Option<&str>,
) -> Result<ProjectFileEntry, String> {
    let full = resolve_under_root(root, relative)?;
    if full.exists() {
        return Err(format!("Path already exists: {relative}"));
    }
    if kind == "folder" {
        fs::create_dir_all(&full).map_err(|e| e.to_string())?;
    } else {
        if let Some(parent) = full.parent() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
        fs::write(&full, content.unwrap_or("")).map_err(|e| e.to_string())?;
    }
    let meta = fs::metadata(&full).map_err(|e| e.to_string())?;
    let extension = full
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();
    Ok(ProjectFileEntry {
        path: relative_display(root, &full),
        name: full
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("")
            .to_string(),
        kind: if meta.is_dir() {
            "folder".to_string()
        } else {
            "file".to_string()
        },
        size: meta.len(),
        extension: extension.clone(),
        binary: meta.is_file() && is_binary_extension(&extension),
        modified_at: modified_at(&meta),
    })
}

pub fn rename_entry(root: &Path, from: &str, to: &str) -> Result<ProjectFileEntry, String> {
    let from_path = resolve_under_root(root, from)?;
    let to_path = resolve_under_root(root, to)?;
    if !from_path.exists() {
        return Err(format!("Source path not found: {from}"));
    }
    if to_path.exists() {
        return Err(format!("Destination already exists: {to}"));
    }
    if let Some(parent) = to_path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    fs::rename(&from_path, &to_path).map_err(|e| e.to_string())?;
    let meta = fs::metadata(&to_path).map_err(|e| e.to_string())?;
    let extension = to_path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();
    Ok(ProjectFileEntry {
        path: relative_display(root, &to_path),
        name: to_path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("")
            .to_string(),
        kind: if meta.is_dir() {
            "folder".to_string()
        } else {
            "file".to_string()
        },
        size: meta.len(),
        extension: extension.clone(),
        binary: meta.is_file() && is_binary_extension(&extension),
        modified_at: modified_at(&meta),
    })
}

pub fn delete_entry(root: &Path, relative: &str) -> Result<(), String> {
    let full = resolve_under_root(root, relative)?;
    if !full.exists() {
        return Err(format!("Path not found: {relative}"));
    }
    if full.is_dir() {
        fs::remove_dir_all(&full).map_err(|e| e.to_string())
    } else {
        fs::remove_file(&full).map_err(|e| e.to_string())
    }
}

fn version_dir_for(root: &Path, relative: &str) -> Result<PathBuf, String> {
    let safe = normalize_relative(relative)?
        .to_string_lossy()
        .replace(['/', '\\'], "__");
    Ok(root.join(VERSION_DIR).join(safe))
}

pub fn list_versions(root: &Path, relative: &str) -> Result<Vec<ProjectVersionEntry>, String> {
    let dir = version_dir_for(root, relative)?;
    if !dir.exists() {
        return Ok(Vec::new());
    }
    let mut versions = Vec::new();
    for entry in fs::read_dir(&dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) != Some("md") {
            continue;
        }
        let meta = entry.metadata().map_err(|e| e.to_string())?;
        let id = path
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("")
            .to_string();
        let created_at = modified_at(&meta).unwrap_or_else(|| chrono::Utc::now().to_rfc3339());
        versions.push(ProjectVersionEntry {
            id: id.clone(),
            title: id,
            created_at,
            size: meta.len(),
        });
    }
    versions.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    Ok(versions)
}

pub fn save_version(
    root: &Path,
    relative: &str,
    content: &str,
    title: Option<&str>,
) -> Result<ProjectVersionEntry, String> {
    let dir = version_dir_for(root, relative)?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let stamp = chrono::Utc::now().format("%Y%m%dT%H%M%S%.3fZ").to_string();
    let id = title
        .map(|t| {
            let cleaned: String = t
                .chars()
                .map(|c| if c.is_ascii_alphanumeric() { c } else { '-' })
                .collect();
            format!("{stamp}-{cleaned}")
        })
        .unwrap_or(stamp);
    let path = dir.join(format!("{id}.md"));
    fs::write(&path, content).map_err(|e| e.to_string())?;
    let meta = fs::metadata(&path).map_err(|e| e.to_string())?;
    Ok(ProjectVersionEntry {
        id,
        title: title.unwrap_or("Version").to_string(),
        created_at: modified_at(&meta).unwrap_or_else(|| chrono::Utc::now().to_rfc3339()),
        size: meta.len(),
    })
}

/// A version id is safe when it names a single file inside the version
/// directory. Legitimate ids (see [`save_version`]) contain digits, `-`, and a
/// `.` from the millisecond timestamp, but never a path separator or a `..`
/// segment. Rejecting those closes a path-traversal (CWE-22) where a
/// webview-supplied `version_id` such as `../../../../etc/passwd` would make
/// `restore_version` read an arbitrary `*.md` file outside the project root.
fn is_safe_version_id(version_id: &str) -> bool {
    !version_id.is_empty()
        && version_id.len() <= 256
        && !version_id.contains('/')
        && !version_id.contains('\\')
        && !version_id.contains('\0')
        && !version_id.contains("..")
}

pub fn restore_version(
    root: &Path,
    relative: &str,
    version_id: &str,
) -> Result<ProjectFileContent, String> {
    if !is_safe_version_id(version_id) {
        return Err("Invalid version id.".to_string());
    }
    let dir = version_dir_for(root, relative)?;
    let path = dir.join(format!("{version_id}.md"));
    if !path.exists() {
        return Err(format!("Version not found: {version_id}"));
    }
    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    write_file(root, relative, &content)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;

    #[test]
    fn writes_and_lists_project_files() {
        let root = env::temp_dir().join(format!("fractalknow-fs-{}", chrono::Utc::now().timestamp_nanos_opt().unwrap_or(0)));
        let _ = fs::remove_dir_all(&root);
        fs::create_dir_all(root.join("content")).unwrap();
        write_file(&root, "content/Hello.md", "# Hello\n").unwrap();
        let listed = list_files(&root).unwrap();
        assert!(listed.iter().any(|e| e.path == "/content/Hello.md"));
        let body = read_file(&root, "content/Hello.md").unwrap();
        assert!(body.content.contains("Hello"));
        let version = save_version(&root, "content/Hello.md", "# Hello v1\n", Some("first")).unwrap();
        let restored = restore_version(&root, "content/Hello.md", &version.id).unwrap();
        assert!(restored.content.contains("v1"));
        let _ = fs::remove_dir_all(&root);
    }

    #[test]
    fn restore_version_rejects_path_traversal() {
        let root = env::temp_dir().join(format!(
            "fractalknow-fs-traversal-{}",
            chrono::Utc::now().timestamp_nanos_opt().unwrap_or(0)
        ));
        let _ = fs::remove_dir_all(&root);
        fs::create_dir_all(&root).unwrap();
        // A version id that tries to climb out of the version directory must be
        // rejected before any filesystem read happens.
        let result = restore_version(&root, "content/Hello.md", "../../../../../../etc/passwd");
        assert!(result.is_err());
        assert!(!is_safe_version_id("../../secret"));
        assert!(!is_safe_version_id("a/b"));
        assert!(!is_safe_version_id(""));
        // The real id shape produced by save_version stays valid.
        assert!(is_safe_version_id("20260731T120000.123Z-first"));
        let _ = fs::remove_dir_all(&root);
    }
}
