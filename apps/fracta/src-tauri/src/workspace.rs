//! Path-safe, recursive workspace operations for Fracta projects.
//!
//! Markdown remains ordinary files on disk. This module deliberately keeps its
//! contract small and explicit so the Svelte workspace can grow without giving
//! the webview unrestricted filesystem access.

use csv::{ReaderBuilder, WriterBuilder};
use quick_xml::events::{BytesStart, Event};
use quick_xml::Reader as XmlReader;
use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};
use std::fs;
use std::path::{Component, Path, PathBuf};
use std::process::Command;
use std::time::{SystemTime, UNIX_EPOCH};
use zip::ZipArchive;

pub type WorkspaceResult<T> = Result<T, String>;
type LinkMap = std::collections::BTreeMap<String, Vec<String>>;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum FileKind {
    Folder,
    Markdown,
    Text,
    Csv,
    Json,
    Pdf,
    Docx,
    Asset,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceItem {
    pub path: String,
    pub name: String,
    pub kind: FileKind,
    pub size: u64,
    pub modified_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceFile {
    pub path: String,
    pub kind: FileKind,
    pub content: Option<String>,
    pub read_only: bool,
    pub size: u64,
    pub modified_at: u64,
    /// The on-disk text encoding detected when this document was opened. This is
    /// informational to the UI; writes independently re-detect the existing
    /// file before replacing it so a stale client cannot accidentally recode it.
    pub encoding: Option<String>,
    /// The newline convention observed in the file (`lf`, `crlf`, or `cr`).
    pub newline: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CsvConversion {
    pub content: String,
    pub extension: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LinkReport {
    pub path: String,
    pub forward: Vec<String>,
    pub backlinks: Vec<String>,
    pub dead: Vec<String>,
    pub orphan: bool,
    pub suggestions: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphNode {
    pub path: String,
    pub incoming: usize,
    pub outgoing: usize,
    pub orphan: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphReport {
    pub nodes: Vec<GraphNode>,
    pub edges: Vec<(String, String)>,
    pub hubs: Vec<String>,
    pub orphans: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentPreview {
    pub path: String,
    pub kind: FileKind,
    pub text: String,
    pub pages: Option<usize>,
    pub page_texts: Option<Vec<String>>,
    pub docx_blocks: Option<Vec<DocumentBlock>>,
    pub warning: Option<String>,
}

/// A safe, local semantic approximation of the readable DOCX body. It deliberately
/// omits advanced Word layout instead of pretending that extracted text is editable.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentBlock {
    pub kind: String,
    pub level: Option<u8>,
    pub text: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub href: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rows: Option<Vec<Vec<String>>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    /// Archive-relative image targets for locally embedded DOCX media only.
    pub images: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AssetData {
    pub mime: String,
    pub bytes: Vec<u8>,
}

pub fn kind_for(path: &Path, is_dir: bool) -> FileKind {
    if is_dir {
        return FileKind::Folder;
    }
    match path
        .extension()
        .and_then(|extension| extension.to_str())
        .map(str::to_ascii_lowercase)
    {
        Some(extension) if extension == "md" || extension == "mdx" => FileKind::Markdown,
        Some(extension) if extension == "txt" => FileKind::Text,
        Some(extension) if extension == "csv" || extension == "tsv" => FileKind::Csv,
        Some(extension) if extension == "json" => FileKind::Json,
        Some(extension) if extension == "pdf" => FileKind::Pdf,
        Some(extension) if extension == "docx" => FileKind::Docx,
        _ => FileKind::Asset,
    }
}

pub fn resolve(root: &Path, relative: &str) -> WorkspaceResult<PathBuf> {
    let path = Path::new(relative);
    if relative.trim().is_empty() || path.is_absolute() {
        return Err("A non-empty project-relative path is required.".to_string());
    }
    if path
        .components()
        .any(|component| !matches!(component, Component::Normal(_)))
    {
        return Err("Path traversal is not allowed.".to_string());
    }
    let candidate = root.join(path);
    let canonical_root = root
        .canonicalize()
        .map_err(|error| format!("Could not resolve workspace root: {error}"))?;
    // New files do not exist yet, so inspect their nearest existing ancestor.
    // This catches a symlinked folder before a write/create can escape the vault.
    let mut existing = candidate.clone();
    while !existing.exists() {
        if !existing.pop() {
            return Err("Could not resolve a workspace parent directory.".to_string());
        }
    }
    let canonical_existing = existing
        .canonicalize()
        .map_err(|error| format!("Could not resolve workspace path: {error}"))?;
    if !canonical_existing.starts_with(&canonical_root) {
        return Err("Symlinks outside the selected workspace are not allowed.".to_string());
    }
    Ok(candidate)
}

pub fn list(root: &Path) -> WorkspaceResult<Vec<WorkspaceItem>> {
    let mut items = Vec::new();
    let ignored = read_ignore(root);
    walk(root, root, &ignored, &mut items)?;
    items.sort_by(|left, right| left.path.cmp(&right.path));
    Ok(items)
}

fn walk(
    root: &Path,
    directory: &Path,
    ignored: &[String],
    items: &mut Vec<WorkspaceItem>,
) -> WorkspaceResult<()> {
    for entry in fs::read_dir(directory).map_err(|error| error.to_string())? {
        let entry = entry.map_err(|error| error.to_string())?;
        // A symlink can point outside the vault or create a recursive walk. Keep
        // the project tree literal; users can still open a linked item externally.
        if entry
            .file_type()
            .map_err(|error| error.to_string())?
            .is_symlink()
        {
            continue;
        }
        let path = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();
        // Fracta state and hidden system folders should not pollute the content tree.
        if name.starts_with('.') || name == "node_modules" {
            continue;
        }
        let metadata = entry.metadata().map_err(|error| error.to_string())?;
        let relative = path
            .strip_prefix(root)
            .map_err(|error| error.to_string())?
            .to_string_lossy()
            .replace('\\', "/");
        if ignored
            .iter()
            .any(|pattern| ignores(pattern, &relative, &name))
        {
            continue;
        }
        let is_dir = metadata.is_dir();
        items.push(WorkspaceItem {
            path: relative,
            name,
            kind: kind_for(&path, is_dir),
            size: if is_dir { 0 } else { metadata.len() },
            modified_at: metadata.modified().map(to_millis).unwrap_or(0),
        });
        if is_dir {
            walk(root, &path, ignored, items)?;
        }
    }
    Ok(())
}

fn read_ignore(root: &Path) -> Vec<String> {
    fs::read_to_string(root.join(".fractaignore"))
        .unwrap_or_default()
        .lines()
        .map(str::trim)
        .filter(|line| !line.is_empty() && !line.starts_with('#'))
        .map(str::to_string)
        .collect()
}

/// Deliberately small `.fractaignore` grammar: plain file names, project-relative
/// prefixes (`build/`), and a single leading `*` suffix match. It is predictable and
/// avoids treating a project configuration file as a shell expression language.
fn ignores(pattern: &str, relative: &str, name: &str) -> bool {
    let pattern = pattern.trim_start_matches('/');
    if let Some(suffix) = pattern.strip_prefix('*') {
        return name.ends_with(suffix);
    }
    if pattern.ends_with('/') {
        return relative == pattern.trim_end_matches('/') || relative.starts_with(pattern);
    }
    relative == pattern || name == pattern
}

pub fn read(root: &Path, relative: &str) -> WorkspaceResult<WorkspaceFile> {
    let path = resolve(root, relative)?;
    let metadata =
        fs::metadata(&path).map_err(|error| format!("Could not read {relative}: {error}"))?;
    if metadata.is_dir() {
        return Err("Folders cannot be opened as files.".to_string());
    }
    let kind = kind_for(&path, false);
    let (content, encoding, newline) = match kind {
        FileKind::Markdown | FileKind::Text | FileKind::Csv | FileKind::Json => {
            let bytes =
                fs::read(&path).map_err(|error| format!("Could not read {relative}: {error}"))?;
            let (text, encoding) = decode_workspace_text(&bytes)?;
            let newline = detect_newline(&text).map(str::to_string);
            (Some(text), Some(encoding), newline)
        }
        _ => (None, None, None),
    };
    Ok(WorkspaceFile {
        path: relative.to_string(),
        read_only: content.is_none(),
        kind,
        content,
        size: metadata.len(),
        modified_at: metadata.modified().map(to_millis).unwrap_or(0),
        encoding,
        newline,
    })
}

/// Returns PDF bytes only after applying the same vault-containment and file-kind
/// checks as every other workspace operation. The webview uses these bytes with its
/// local renderer; no filesystem path is exposed to JavaScript.
pub fn pdf_bytes(root: &Path, relative: &str) -> WorkspaceResult<Vec<u8>> {
    let path = resolve(root, relative)?;
    if kind_for(&path, false) != FileKind::Pdf {
        return Err("PDF rendering is available for .pdf files only.".to_string());
    }
    fs::read(path).map_err(|error| format!("Could not read PDF: {error}"))
}

/// Reads safe, locally referenced image assets for the Markdown renderer. The file
/// path is still contained in the vault and only common image formats are exposed.
pub fn image_asset(root: &Path, relative: &str) -> WorkspaceResult<AssetData> {
    let path = resolve(root, relative)?;
    let extension = path
        .extension()
        .and_then(|value| value.to_str())
        .unwrap_or_default()
        .to_ascii_lowercase();
    let mime =
        match extension.as_str() {
            "png" => "image/png",
            "jpg" | "jpeg" => "image/jpeg",
            "gif" => "image/gif",
            "webp" => "image/webp",
            "svg" => "image/svg+xml",
            _ => return Err(
                "Inline asset rendering is available for PNG, JPEG, GIF, WebP, and SVG files only."
                    .to_string(),
            ),
        };
    Ok(AssetData {
        mime: mime.to_string(),
        bytes: fs::read(path).map_err(|error| format!("Could not read image asset: {error}"))?,
    })
}

/// Reads locally embedded audio/video only after extension, vault, and size checks.
/// Object URLs keep media bytes inside the WebView; Fracta never hands a host path
/// to the renderer or delegates playback to a remote service.
pub fn media_asset(root: &Path, relative: &str) -> WorkspaceResult<AssetData> {
    const MAX_INLINE_MEDIA_BYTES: u64 = 256 * 1024 * 1024;
    let path = resolve(root, relative)?;
    let extension = path
        .extension()
        .and_then(|value| value.to_str())
        .unwrap_or_default()
        .to_ascii_lowercase();
    let mime = match extension.as_str() {
        "mp3" => "audio/mpeg",
        "m4a" => "audio/mp4",
        "wav" => "audio/wav",
        "ogg" | "oga" => "audio/ogg",
        "flac" => "audio/flac",
        "mp4" | "m4v" => "video/mp4",
        "webm" => "video/webm",
        "ogv" => "video/ogg",
        "mov" => "video/quicktime",
        _ => {
            return Err(
                "Inline media is available for common audio and video formats only.".to_string(),
            )
        }
    };
    let size = fs::metadata(&path)
        .map_err(|error| format!("Could not inspect media asset: {error}"))?
        .len();
    if size > MAX_INLINE_MEDIA_BYTES {
        return Err(
            "This media file is larger than 256 MB. Open it externally instead.".to_string(),
        );
    }
    Ok(AssetData {
        mime: mime.to_string(),
        bytes: fs::read(path).map_err(|error| format!("Could not read media asset: {error}"))?,
    })
}

/// Stores an opaque attachment supplied by a local MCP client. Text formats use
/// `write` so their validation/encoding guarantees remain intact; this narrow path
/// is only for unsupported binary attachments and still uses vault containment.
pub fn write_asset(root: &Path, relative: &str, bytes: &[u8]) -> WorkspaceResult<WorkspaceFile> {
    let path = resolve(root, relative)?;
    if kind_for(&path, false) != FileKind::Asset {
        return Err(
            "Use the structured file writer for Markdown, TXT, CSV/TSV, JSON, DOCX, or PDF paths."
                .to_string(),
        );
    }
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|error| error.to_string())?;
    }
    fs::write(&path, bytes).map_err(|error| error.to_string())?;
    read(root, relative)
}

pub fn write(root: &Path, relative: &str, content: &str) -> WorkspaceResult<WorkspaceFile> {
    let path = resolve(root, relative)?;
    let kind = kind_for(&path, false);
    if !matches!(
        kind,
        FileKind::Markdown | FileKind::Text | FileKind::Csv | FileKind::Json
    ) {
        return Err(
            "Only Markdown, TXT, CSV/TSV, and JSON files can be edited in Fracta.".to_string(),
        );
    }
    if kind == FileKind::Json {
        serde_json::from_str::<Value>(content).map_err(|error| format!("Invalid JSON: {error}"))?;
    }
    if kind == FileKind::Csv {
        validate_csv_quotes(content)?;
        let fallback_delimiter = if path
            .extension()
            .and_then(|extension| extension.to_str())
            .is_some_and(|extension| extension.eq_ignore_ascii_case("tsv"))
        {
            b'\t'
        } else {
            b','
        };
        let delimiter = detect_csv_delimiter(content, fallback_delimiter);
        let mut reader = ReaderBuilder::new()
            .delimiter(delimiter)
            .from_reader(content.as_bytes());
        reader
            .headers()
            .map_err(|error| format!("Invalid CSV headers: {error}"))?;
        for record in reader.records() {
            record.map_err(|error| format!("Invalid CSV record: {error}"))?;
        }
    }
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|error| error.to_string())?;
    }
    let encoded = match fs::read(&path) {
        Ok(existing) => encode_workspace_text(content, &existing)?,
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => content.as_bytes().to_vec(),
        Err(error) => return Err(format!("Could not prepare {relative} for writing: {error}")),
    };
    fs::write(&path, encoded).map_err(|error| error.to_string())?;
    read(root, relative)
}

/// Chooses the most frequent unquoted delimiter on the first record. Extensions
/// remain the fallback, so `.tsv` stays tab-separated even for a one-column file.
fn detect_csv_delimiter(content: &str, fallback: u8) -> u8 {
    let mut counts = [(b',', 0usize), (b';', 0), (b'\t', 0), (b'|', 0)];
    let mut quoted = false;
    let bytes = content.as_bytes();
    let mut index = 0;
    while index < bytes.len() {
        let byte = bytes[index];
        if byte == b'"' {
            if quoted && bytes.get(index + 1) == Some(&b'"') {
                index += 1;
            } else {
                quoted = !quoted;
            }
        } else if !quoted && (byte == b'\n' || byte == b'\r') {
            break;
        } else if !quoted {
            for (candidate, count) in &mut counts {
                if *candidate == byte {
                    *count += 1;
                }
            }
        }
        index += 1;
    }
    counts
        .into_iter()
        .max_by_key(|(_, count)| *count)
        .filter(|(_, count)| *count > 0)
        .map(|(delimiter, _)| delimiter)
        .unwrap_or(fallback)
}

/// Decodes the safe text encodings Fracta promises to preserve. UTF-8 remains
/// the default, while UTF-8 BOM and UTF-16 BOM files round-trip without a
/// surprising conversion. Other legacy encodings stay read-only rather than
/// risking destructive guesses.
fn decode_workspace_text(bytes: &[u8]) -> WorkspaceResult<(String, String)> {
    if bytes.starts_with(&[0xEF, 0xBB, 0xBF]) {
        return String::from_utf8(bytes[3..].to_vec())
            .map(|text| (text, "utf-8-bom".to_string()))
            .map_err(|_| {
                "This UTF-8 BOM file contains invalid text and cannot be edited safely.".to_string()
            });
    }
    if bytes.starts_with(&[0xFF, 0xFE]) {
        if (bytes.len() - 2) % 2 != 0 {
            return Err("This UTF-16LE file has an incomplete final code unit.".to_string());
        }
        let units = bytes[2..]
            .chunks_exact(2)
            .map(|pair| u16::from_le_bytes([pair[0], pair[1]]))
            .collect::<Vec<_>>();
        return String::from_utf16(&units)
            .map(|text| (text, "utf-16le".to_string()))
            .map_err(|_| {
                "This UTF-16LE file contains invalid text and cannot be edited safely.".to_string()
            });
    }
    if bytes.starts_with(&[0xFE, 0xFF]) {
        if (bytes.len() - 2) % 2 != 0 {
            return Err("This UTF-16BE file has an incomplete final code unit.".to_string());
        }
        let units = bytes[2..]
            .chunks_exact(2)
            .map(|pair| u16::from_be_bytes([pair[0], pair[1]]))
            .collect::<Vec<_>>();
        return String::from_utf16(&units)
            .map(|text| (text, "utf-16be".to_string()))
            .map_err(|_| {
                "This UTF-16BE file contains invalid text and cannot be edited safely.".to_string()
            });
    }
    String::from_utf8(bytes.to_vec())
        .map(|text| (text, "utf-8".to_string()))
        .map_err(|_| {
            "This file is not valid UTF-8, UTF-8 BOM, or UTF-16 text and cannot be edited safely."
                .to_string()
        })
}

fn encode_workspace_text(content: &str, existing: &[u8]) -> WorkspaceResult<Vec<u8>> {
    let (_, encoding) = decode_workspace_text(existing)?;
    match encoding.as_str() {
        "utf-8" => Ok(content.as_bytes().to_vec()),
        "utf-8-bom" => {
            let mut output = vec![0xEF, 0xBB, 0xBF];
            output.extend_from_slice(content.as_bytes());
            Ok(output)
        }
        "utf-16le" => {
            let mut output = vec![0xFF, 0xFE];
            for unit in content.encode_utf16() {
                output.extend_from_slice(&unit.to_le_bytes());
            }
            Ok(output)
        }
        "utf-16be" => {
            let mut output = vec![0xFE, 0xFF];
            for unit in content.encode_utf16() {
                output.extend_from_slice(&unit.to_be_bytes());
            }
            Ok(output)
        }
        _ => Err("Unsupported text encoding.".to_string()),
    }
}

fn detect_newline(content: &str) -> Option<&'static str> {
    if content.contains("\r\n") {
        Some("crlf")
    } else if content.contains('\n') {
        Some("lf")
    } else if content.contains('\r') {
        Some("cr")
    } else {
        None
    }
}

fn validate_csv_quotes(content: &str) -> WorkspaceResult<()> {
    let mut quoted = false;
    let mut chars = content.chars().peekable();
    while let Some(character) = chars.next() {
        if character != '"' {
            continue;
        }
        if quoted && chars.peek() == Some(&'"') {
            chars.next();
            continue;
        }
        quoted = !quoted;
    }
    if quoted {
        Err("Invalid CSV record: an opening quote has no matching closing quote.".to_string())
    } else {
        Ok(())
    }
}

pub fn create_folder(root: &Path, relative: &str) -> WorkspaceResult<()> {
    let path = resolve(root, relative)?;
    if path.exists() {
        return Err("A project item already exists at that path.".to_string());
    }
    fs::create_dir_all(&path).map_err(|error| error.to_string())
}

pub fn move_path(root: &Path, from: &str, to: &str) -> WorkspaceResult<()> {
    let source = resolve(root, from)?;
    let target = resolve(root, to)?;
    if target.exists() {
        return Err("The destination already exists.".to_string());
    }
    if let Some(parent) = target.parent() {
        fs::create_dir_all(parent).map_err(|error| error.to_string())?;
    }
    fs::rename(source, target).map_err(|error| error.to_string())
}

pub fn delete_path(root: &Path, relative: &str) -> WorkspaceResult<()> {
    let path = resolve(root, relative)?;
    if !path.exists() {
        return Err("This project item no longer exists.".to_string());
    }
    trash::delete(path).map_err(|error| format!("Could not move item to the system Trash: {error}"))
}

pub fn duplicate_path(root: &Path, relative: &str) -> WorkspaceResult<String> {
    let source = resolve(root, relative)?;
    if source.is_dir() {
        return Err("Duplicate folders by copying their contents explicitly.".to_string());
    }
    let parent = source
        .parent()
        .ok_or_else(|| "Project root files cannot be duplicated.".to_string())?;
    let stem = source
        .file_stem()
        .and_then(|value| value.to_str())
        .ok_or_else(|| "Invalid file name.".to_string())?;
    let extension = source
        .extension()
        .and_then(|value| value.to_str())
        .map(|value| format!(".{value}"))
        .unwrap_or_default();
    let mut index = 1;
    let target = loop {
        let suffix = if index == 1 {
            " copy".to_string()
        } else {
            format!(" copy {index}")
        };
        let candidate = parent.join(format!("{stem}{suffix}{extension}"));
        if !candidate.exists() {
            break candidate;
        }
        index += 1;
    };
    fs::copy(&source, &target).map_err(|error| error.to_string())?;
    target
        .strip_prefix(root)
        .map_err(|error| error.to_string())
        .map(|path| path.to_string_lossy().replace('\\', "/"))
}

pub fn reveal_path(root: &Path, relative: &str) -> WorkspaceResult<()> {
    let path = resolve(root, relative)?;
    if !path.exists() {
        return Err("This project item no longer exists.".to_string());
    }
    #[cfg(target_os = "macos")]
    let result = Command::new("open").arg("-R").arg(&path).status();
    #[cfg(target_os = "windows")]
    let result = Command::new("explorer").arg("/select,").arg(&path).status();
    #[cfg(all(unix, not(target_os = "macos")))]
    let result = Command::new("xdg-open")
        .arg(path.parent().unwrap_or(root))
        .status();
    result
        .map_err(|error| error.to_string())
        .and_then(|status| {
            status
                .success()
                .then_some(())
                .ok_or_else(|| "The operating system could not reveal this item.".to_string())
        })
}

pub fn open_externally(root: &Path, relative: &str) -> WorkspaceResult<()> {
    let path = resolve(root, relative)?;
    if !path.exists() {
        return Err("This project item no longer exists.".to_string());
    }
    #[cfg(target_os = "macos")]
    let result = Command::new("open").arg(&path).status();
    #[cfg(target_os = "windows")]
    let result = Command::new("cmd")
        .args(["/C", "start", "", &path.to_string_lossy()])
        .status();
    #[cfg(all(unix, not(target_os = "macos")))]
    let result = Command::new("xdg-open").arg(&path).status();
    result
        .map_err(|error| error.to_string())
        .and_then(|status| {
            status
                .success()
                .then_some(())
                .ok_or_else(|| "The operating system could not open this item.".to_string())
        })
}

/// Extracts locally readable text for read-only document viewers. The original bytes
/// never leave the device; unsupported drawing/layout features remain visible as an
/// explicit warning instead of being silently misrepresented as editable content.
pub fn preview(root: &Path, relative: &str) -> WorkspaceResult<DocumentPreview> {
    let path = resolve(root, relative)?;
    match kind_for(&path, false) {
        FileKind::Pdf => preview_pdf(&path, relative),
        FileKind::Docx => preview_docx(&path, relative),
        _ => Err("Preview extraction is available for PDF and DOCX files only.".to_string()),
    }
}

/// Reads one embedded DOCX image without exposing archive traversal or arbitrary
/// host files. The renderer turns these bytes into an in-memory object URL.
pub fn docx_image(root: &Path, relative: &str, archive_path: &str) -> WorkspaceResult<AssetData> {
    let path = resolve(root, relative)?;
    if kind_for(&path, false) != FileKind::Docx {
        return Err("Embedded images are available for DOCX files only.".to_string());
    }
    let entry = Path::new(archive_path);
    if !archive_path.starts_with("word/media/")
        || entry
            .components()
            .any(|part| !matches!(part, Component::Normal(_)))
    {
        return Err("Invalid DOCX media path.".to_string());
    }
    let file = fs::File::open(path).map_err(|error| error.to_string())?;
    let mut archive =
        ZipArchive::new(file).map_err(|error| format!("Invalid DOCX archive: {error}"))?;
    let mut image = archive
        .by_name(archive_path)
        .map_err(|_| "This embedded image is unavailable.".to_string())?;
    use std::io::Read;
    let mut bytes = Vec::new();
    image
        .read_to_end(&mut bytes)
        .map_err(|error| error.to_string())?;
    let mime = match Path::new(archive_path)
        .extension()
        .and_then(|extension| extension.to_str())
        .unwrap_or("")
        .to_ascii_lowercase()
        .as_str()
    {
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "gif" => "image/gif",
        "webp" => "image/webp",
        "svg" => "image/svg+xml",
        _ => "application/octet-stream",
    };
    Ok(AssetData {
        mime: mime.to_string(),
        bytes,
    })
}

fn preview_pdf(path: &Path, relative: &str) -> WorkspaceResult<DocumentPreview> {
    let document =
        lopdf::Document::load(path).map_err(|error| format!("Could not open PDF: {error}"))?;
    let page_numbers = document.get_pages().keys().copied().collect::<Vec<_>>();
    let mut text = String::new();
    let mut page_texts = Vec::new();
    for page in &page_numbers {
        match document.extract_text(&[*page]) {
            Ok(page_text) => {
                text.push_str(&page_text);
                text.push('\n');
                page_texts.push(page_text);
            }
            Err(_) => {
                let unavailable = format!("[Text extraction unavailable on page {page}]");
                text.push_str(&format!("\n{unavailable}\n"));
                page_texts.push(unavailable);
            }
        }
    }
    Ok(DocumentPreview {
		path: relative.to_string(), kind: FileKind::Pdf, text, pages: Some(page_numbers.len()), page_texts: Some(page_texts),
		docx_blocks: None,
		warning: Some("Text is extracted locally for search and reading. Complex layouts, forms, annotations, and scans may not reproduce exactly.".to_string()),
	})
}

fn preview_docx(path: &Path, relative: &str) -> WorkspaceResult<DocumentPreview> {
    let file = fs::File::open(path).map_err(|error| error.to_string())?;
    let mut archive =
        ZipArchive::new(file).map_err(|error| format!("Invalid DOCX archive: {error}"))?;
    let relationships = archive
        .by_name("word/_rels/document.xml.rels")
        .ok()
        .and_then(|mut relationships| {
            let mut xml = String::new();
            relationships.read_to_string(&mut xml).ok()?;
            Some(docx_relationships(&xml))
        })
        .unwrap_or_default();
    let mut document = archive
        .by_name("word/document.xml")
        .map_err(|_| "This DOCX does not contain word/document.xml.".to_string())?;
    let mut xml = String::new();
    use std::io::Read;
    document
        .read_to_string(&mut xml)
        .map_err(|error| error.to_string())?;
    let mut reader = XmlReader::from_str(&xml);
    reader.config_mut().trim_text(false);
    let mut text = String::new();
    let mut blocks = Vec::new();
    let mut in_text = false;
    let mut in_paragraph = false;
    let mut paragraph = String::new();
    let mut style = None;
    let mut list_item = false;
    let mut hyperlink_id: Option<String> = None;
    let mut table_depth = 0usize;
    let mut table_rows: Vec<Vec<String>> = Vec::new();
    let mut table_row: Vec<String> = Vec::new();
    let mut table_cell = String::new();
    let mut image_targets: Vec<String> = Vec::new();
    loop {
        match reader.read_event() {
            Ok(Event::Start(event)) if event.name().as_ref() == b"w:p" => {
                in_paragraph = true;
                paragraph.clear();
                style = None;
                list_item = false;
                hyperlink_id = None;
                image_targets.clear();
            }
            Ok(Event::Start(event)) if event.name().as_ref() == b"w:tbl" => {
                table_depth += 1;
                if table_depth == 1 {
                    table_rows.clear();
                }
            }
            Ok(Event::Start(event)) if event.name().as_ref() == b"w:tr" && table_depth > 0 => {
                table_row.clear()
            }
            Ok(Event::Start(event)) if event.name().as_ref() == b"w:tc" && table_depth > 0 => {
                table_cell.clear()
            }
            Ok(Event::Start(event)) if event.name().as_ref() == b"w:hyperlink" => {
                hyperlink_id = docx_attribute(&event, b"r:id")
            }
            Ok(Event::End(event)) if event.name().as_ref() == b"w:hyperlink" => {}
            Ok(Event::Empty(event)) | Ok(Event::Start(event))
                if event.name().as_ref() == b"a:blip" =>
            {
                if let Some(id) = docx_attribute(&event, b"r:embed") {
                    if let Some(target) = relationships
                        .get(&id)
                        .filter(|target| !target.contains("://"))
                    {
                        let target = if target.starts_with("word/") {
                            target.clone()
                        } else {
                            format!("word/{target}")
                        };
                        if target.starts_with("word/media/") {
                            image_targets.push(target);
                        }
                    }
                }
            }
            Ok(Event::Empty(event)) | Ok(Event::Start(event))
                if event.name().as_ref() == b"w:pStyle" =>
            {
                style = docx_attribute(&event, b"w:val");
            }
            Ok(Event::Empty(event)) | Ok(Event::Start(event))
                if event.name().as_ref() == b"w:numPr" =>
            {
                list_item = true
            }
            Ok(Event::Start(event)) if event.name().as_ref() == b"w:t" => in_text = true,
            Ok(Event::End(event)) if event.name().as_ref() == b"w:t" => in_text = false,
            Ok(Event::End(event)) if event.name().as_ref() == b"w:p" => {
                if in_paragraph && (!paragraph.trim().is_empty() || !image_targets.is_empty()) {
                    if table_depth > 0 {
                        if !table_cell.is_empty() {
                            table_cell.push(' ');
                        }
                        table_cell.push_str(paragraph.trim());
                    } else {
                        let (kind, level) = docx_block_type(style.as_deref(), list_item);
                        blocks.push(DocumentBlock {
                            kind,
                            level,
                            text: paragraph.trim().to_string(),
                            href: hyperlink_id
                                .as_ref()
                                .and_then(|id| relationships.get(id))
                                .filter(|target| target.contains("://"))
                                .cloned(),
                            rows: None,
                            images: (!image_targets.is_empty()).then(|| image_targets.clone()),
                        });
                    }
                    text.push_str(paragraph.trim());
                    text.push('\n');
                }
                in_paragraph = false;
            }
            Ok(Event::End(event)) if event.name().as_ref() == b"w:tc" && table_depth > 0 => {
                table_row.push(table_cell.trim().to_string())
            }
            Ok(Event::End(event))
                if event.name().as_ref() == b"w:tr" && table_depth > 0 && !table_row.is_empty() =>
            {
                table_rows.push(table_row.clone())
            }
            Ok(Event::End(event)) if event.name().as_ref() == b"w:tbl" && table_depth > 0 => {
                table_depth -= 1;
                if table_depth == 0 && !table_rows.is_empty() {
                    blocks.push(DocumentBlock {
                        kind: "table".to_string(),
                        level: None,
                        text: String::new(),
                        href: None,
                        rows: Some(table_rows.clone()),
                        images: None,
                    });
                }
            }
            Ok(Event::Text(event)) if in_text => {
                paragraph.push_str(&event.unescape().map_err(|error| error.to_string())?)
            }
            Ok(Event::Eof) => break,
            Err(error) => return Err(format!("Could not parse DOCX document XML: {error}")),
            _ => {}
        }
    }
    Ok(DocumentPreview {
		path: relative.to_string(), kind: FileKind::Docx, text, pages: None, page_texts: None,
		docx_blocks: Some(blocks),
		warning: Some("Text and paragraph structure are rendered locally. Drawing canvases, tracked changes, embedded objects, and advanced Word layout are not shown.".to_string()),
	})
}

fn docx_relationships(xml: &str) -> std::collections::BTreeMap<String, String> {
    let mut reader = XmlReader::from_str(xml);
    let mut relationships = std::collections::BTreeMap::new();
    loop {
        match reader.read_event() {
            Ok(Event::Empty(event)) | Ok(Event::Start(event))
                if event.name().as_ref() == b"Relationship" =>
            {
                let id = docx_attribute(&event, b"Id");
                let target = docx_attribute(&event, b"Target");
                if let (Some(id), Some(target)) = (id, target) {
                    relationships.insert(id, target);
                }
            }
            Ok(Event::Eof) | Err(_) => break,
            _ => {}
        }
    }
    relationships
}

fn docx_attribute(event: &BytesStart<'_>, name: &[u8]) -> Option<String> {
    event.attributes().flatten().find_map(|attribute| {
        (attribute.key.as_ref() == name)
            .then(|| String::from_utf8_lossy(&attribute.value).into_owned())
    })
}

fn docx_block_type(style: Option<&str>, list_item: bool) -> (String, Option<u8>) {
    if list_item {
        return ("list_item".to_string(), None);
    }
    let level = style
        .and_then(|value| value.strip_prefix("Heading"))
        .and_then(|value| value.parse::<u8>().ok())
        .filter(|level| (1..=6).contains(level));
    if level.is_some() {
        ("heading".to_string(), level)
    } else {
        ("paragraph".to_string(), None)
    }
}

/// Builds a local, ordinary-Markdown/wiki-link index on demand. Keeping this in the
/// Rust layer ensures every caller (UI, agent, and future MCP server) agrees on link
/// resolution without exposing arbitrary paths to the webview.
pub fn links(root: &Path, relative: &str) -> WorkspaceResult<LinkReport> {
    let (markdown, outgoing) = link_map(root)?;
    if !markdown.iter().any(|path| path == relative) {
        return Err("Links are available for Markdown documents only.".to_string());
    }
    let forward = outgoing.get(relative).cloned().unwrap_or_default();
    let dead = forward
        .iter()
        .filter(|link| !markdown.contains(link))
        .cloned()
        .collect();
    let backlinks = outgoing
        .iter()
        .filter_map(|(source, targets)| {
            targets
                .contains(&relative.to_string())
                .then_some(source.clone())
        })
        .collect::<Vec<_>>();
    let suggestions = outgoing
        .iter()
        .filter_map(|(source, targets)| {
            (source != relative
                && targets
                    .iter()
                    .any(|target| forward.contains(target) && markdown.contains(target)))
            .then_some(source.clone())
        })
        .take(8)
        .collect::<Vec<_>>();
    let orphan = forward.is_empty() && backlinks.is_empty();
    Ok(LinkReport {
        path: relative.to_string(),
        forward,
        backlinks,
        dead,
        orphan,
        suggestions,
    })
}

pub fn graph(root: &Path) -> WorkspaceResult<GraphReport> {
    let (markdown, outgoing) = link_map(root)?;
    let mut incoming = std::collections::BTreeMap::<String, usize>::new();
    let mut edges = Vec::new();
    for (source, targets) in &outgoing {
        for target in targets {
            if markdown.contains(target) {
                *incoming.entry(target.clone()).or_default() += 1;
                edges.push((source.clone(), target.clone()));
            }
        }
    }
    let mut nodes = markdown
        .into_iter()
        .map(|path| {
            let input = incoming.get(&path).copied().unwrap_or(0);
            let output = outgoing.get(&path).map(Vec::len).unwrap_or(0);
            GraphNode {
                path,
                incoming: input,
                outgoing: output,
                orphan: input == 0 && output == 0,
            }
        })
        .collect::<Vec<_>>();
    nodes.sort_by(|a, b| {
        (b.incoming + b.outgoing)
            .cmp(&(a.incoming + a.outgoing))
            .then_with(|| a.path.cmp(&b.path))
    });
    let hubs = nodes
        .iter()
        .filter(|node| node.incoming + node.outgoing >= 3)
        .map(|node| node.path.clone())
        .collect();
    let orphans = nodes
        .iter()
        .filter(|node| node.orphan)
        .map(|node| node.path.clone())
        .collect();
    Ok(GraphReport {
        nodes,
        edges,
        hubs,
        orphans,
    })
}

fn link_map(root: &Path) -> WorkspaceResult<(Vec<String>, LinkMap)> {
    let markdown = list(root)?
        .into_iter()
        .filter(|item| item.kind == FileKind::Markdown)
        .map(|item| item.path)
        .collect::<Vec<_>>();
    let mut outgoing = LinkMap::new();
    for path in &markdown {
        let content = fs::read_to_string(resolve(root, path)?).unwrap_or_default();
        outgoing.insert(path.clone(), extract_links(&content, path, &markdown));
    }
    Ok((markdown, outgoing))
}

fn extract_links(content: &str, source: &str, known: &[String]) -> Vec<String> {
    let mut targets = Vec::new();
    let mut rest = content;
    while let Some(start) = rest.find("[[") {
        let after = &rest[start + 2..];
        let Some(end) = after.find("]]") else { break };
        let raw = after[..end].split('|').next().unwrap_or("").trim();
        if !raw.is_empty() {
            let candidate = resolve_link(raw, source, known);
            if !targets.contains(&candidate) {
                targets.push(candidate);
            }
        }
        rest = &after[end + 2..];
    }
    let mut rest = content;
    while let Some(start) = rest.find("](") {
        let after = &rest[start + 2..];
        let Some(end) = after.find(')') else { break };
        let raw = after[..end].trim();
        if !raw.is_empty()
            && !raw.contains("://")
            && !raw.starts_with('#')
            && !raw.starts_with("mailto:")
        {
            let raw = raw.split('#').next().unwrap_or("");
            let candidate = resolve_link(raw, source, known);
            if !targets.contains(&candidate) {
                targets.push(candidate);
            }
        }
        rest = &after[end + 1..];
    }
    targets
}

fn resolve_link(raw: &str, source: &str, known: &[String]) -> String {
    let normalized = raw.trim_start_matches('/').replace('\\', "/");
    let direct = if normalized.ends_with(".md") || normalized.ends_with(".mdx") {
        normalized.clone()
    } else {
        format!("{normalized}.md")
    };
    if known.contains(&direct) {
        return direct;
    }
    let sibling = Path::new(source)
        .parent()
        .unwrap_or_else(|| Path::new(""))
        .join(&direct)
        .to_string_lossy()
        .replace('\\', "/");
    if known.contains(&sibling) {
        return sibling;
    }
    known
        .iter()
        .find(|path| {
            Path::new(path).file_stem().and_then(|name| name.to_str()) == Some(normalized.as_str())
        })
        .cloned()
        .unwrap_or(direct)
}

pub fn csv_to_json(
    content: &str,
    delimiter: u8,
    infer_types: bool,
) -> WorkspaceResult<CsvConversion> {
    let mut reader = ReaderBuilder::new()
        .delimiter(delimiter)
        .from_reader(content.as_bytes());
    let headers = reader
        .headers()
        .map_err(|error| format!("Invalid CSV headers: {error}"))?
        .clone();
    let mut names = Vec::with_capacity(headers.len());
    for header in headers.iter() {
        let name = header.trim();
        if name.is_empty() || names.iter().any(|existing: &String| existing == name) {
            return Err("CSV conversion needs unique, non-empty column headers.".to_string());
        }
        names.push(name.to_string());
    }
    let mut rows = Vec::new();
    for result in reader.records() {
        let record = result.map_err(|error| format!("Invalid CSV row: {error}"))?;
        let mut row = Map::new();
        for (index, name) in names.iter().enumerate() {
            let value = record.get(index).unwrap_or("");
            row.insert(name.clone(), csv_value(value, infer_types));
        }
        rows.push(Value::Object(row));
    }
    Ok(CsvConversion {
        content: serde_json::to_string_pretty(&Value::Array(rows))
            .map_err(|error| error.to_string())?,
        extension: "json".to_string(),
    })
}

fn csv_value(value: &str, infer_types: bool) -> Value {
    if !infer_types {
        return Value::String(value.to_string());
    }
    if let Ok(boolean) = value.parse::<bool>() {
        return Value::Bool(boolean);
    }
    if let Ok(number) = value.parse::<i64>() {
        return Value::Number(number.into());
    }
    if let Ok(number) = value.parse::<f64>() {
        if let Some(number) = serde_json::Number::from_f64(number) {
            return Value::Number(number);
        }
    }
    Value::String(value.to_string())
}

pub fn json_to_csv(content: &str, delimiter: u8) -> WorkspaceResult<CsvConversion> {
    let value: Value =
        serde_json::from_str(content).map_err(|error| format!("Invalid JSON: {error}"))?;
    let rows = value
        .as_array()
        .ok_or_else(|| "JSON to CSV requires a top-level array of objects.".to_string())?;
    let mut columns = Vec::<String>::new();
    for row in rows {
        let object = row
            .as_object()
            .ok_or_else(|| "JSON to CSV requires every array item to be an object.".to_string())?;
        for key in object.keys() {
            if !columns.contains(key) {
                columns.push(key.clone());
            }
        }
    }
    let mut writer = WriterBuilder::new()
        .delimiter(delimiter)
        .from_writer(Vec::new());
    writer
        .write_record(&columns)
        .map_err(|error| error.to_string())?;
    for row in rows {
        let object = row.as_object().expect("validated above");
        let values = columns
            .iter()
            .map(|column| object.get(column).map(json_cell).unwrap_or_default());
        writer
            .write_record(values)
            .map_err(|error| error.to_string())?;
    }
    let bytes = writer.into_inner().map_err(|error| error.to_string())?;
    Ok(CsvConversion {
        content: String::from_utf8(bytes).map_err(|error| error.to_string())?,
        extension: "csv".to_string(),
    })
}

fn json_cell(value: &Value) -> String {
    match value {
        Value::Null => String::new(),
        Value::String(value) => value.clone(),
        Value::Bool(value) => value.to_string(),
        Value::Number(value) => value.to_string(),
        Value::Array(_) | Value::Object(_) => serde_json::to_string(value).unwrap_or_default(),
    }
}

fn to_millis(time: SystemTime) -> u64 {
    time.duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis() as u64)
        .unwrap_or(0)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;
    use std::time::{SystemTime, UNIX_EPOCH};
    use zip::{write::SimpleFileOptions, ZipWriter};

    #[test]
    fn rejects_traversal() {
        assert!(resolve(Path::new("/tmp/project"), "../secret").is_err());
        assert!(resolve(Path::new("/tmp/project"), "/secret").is_err());
    }

    #[cfg(unix)]
    #[test]
    fn rejects_symlinked_workspace_escape() {
        use std::os::unix::fs::symlink;
        let nonce = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let root = std::env::temp_dir().join(format!("fracta-symlink-root-{nonce}"));
        let outside = std::env::temp_dir().join(format!("fracta-symlink-outside-{nonce}"));
        fs::create_dir_all(&root).unwrap();
        fs::create_dir_all(&outside).unwrap();
        symlink(&outside, root.join("escape")).unwrap();
        assert!(resolve(&root, "escape/secret.md").is_err());
        assert!(!list(&root)
            .unwrap()
            .iter()
            .any(|item| item.path == "escape"));
        fs::remove_dir_all(root).unwrap();
        fs::remove_dir_all(outside).unwrap();
    }

    #[test]
    fn csv_json_round_trip_preserves_strings_by_default() {
        let json = csv_to_json("id,name\n001,Ada\n", b',', false).unwrap();
        assert!(json.content.contains("\"001\""));
        let csv = json_to_csv(&json.content, b',').unwrap();
        assert_eq!(csv.content, "id,name\n001,Ada\n");
    }

    #[test]
    fn csv_json_requires_resolved_unique_headers() {
        assert!(csv_to_json("id,,id\n001,Ada,002\n", b',', false).is_err());
        let converted = csv_to_json("id,person_id,name\n001,002,Ada\n", b',', false).unwrap();
        assert!(converted.content.contains("\"person_id\": \"002\""));
    }

    #[test]
    fn detects_a_semicolon_csv_dialect_outside_quoted_values() {
        assert_eq!(
            detect_csv_delimiter("id;name;note\n001;Ada;\"x,y\"\n", b','),
            b';'
        );
        assert_eq!(detect_csv_delimiter("one-column\nvalue\n", b'\t'), b'\t');
    }

    #[test]
    fn json_csv_rejects_non_object_rows() {
        assert!(json_to_csv("[1, 2]", b',').is_err());
    }

    #[test]
    fn ignores_project_paths_and_suffixes() {
        assert!(ignores("build/", "build/output.js", "output.js"));
        assert!(ignores("*.tmp", "draft.tmp", "draft.tmp"));
        assert!(!ignores("*.tmp", "draft.md", "draft.md"));
    }

    #[test]
    fn recognizes_wiki_and_standard_markdown_links() {
        let known = vec!["docs/guide.md".to_string()];
        let links = extract_links(
            "[[guide]] and [read](guide.md#section)",
            "docs/index.md",
            &known,
        );
        assert_eq!(links, vec!["docs/guide.md"]);
    }

    #[test]
    fn graph_reports_edges_hubs_and_orphans() {
        let nonce = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let root = std::env::temp_dir().join(format!("fracta-graph-{nonce}"));
        fs::create_dir_all(&root).unwrap();
        fs::write(root.join("hub.md"), "# Hub").unwrap();
        fs::write(root.join("one.md"), "[[hub]]").unwrap();
        fs::write(root.join("two.md"), "[Hub](hub.md)").unwrap();
        fs::write(root.join("alone.md"), "# Alone").unwrap();
        let report = graph(&root).unwrap();
        assert!(report
            .edges
            .iter()
            .any(|edge| edge == &("one.md".to_string(), "hub.md".to_string())));
        assert!(report.orphans.contains(&"alone.md".to_string()));
        fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn creates_nested_folder_without_overwriting() {
        let nonce = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let root = std::env::temp_dir().join(format!("fracta-folder-{nonce}"));
        fs::create_dir_all(&root).unwrap();
        create_folder(&root, "research/clips").unwrap();
        assert!(root.join("research/clips").is_dir());
        assert!(create_folder(&root, "research/clips").is_err());
        fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn refuses_to_write_malformed_csv() {
        let nonce = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let root = std::env::temp_dir().join(format!("fracta-csv-{nonce}"));
        fs::create_dir_all(&root).unwrap();
        assert!(write(&root, "data.csv", "name\n\"unterminated").is_err());
        assert!(!root.join("data.csv").exists());
        fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn asset_writer_cannot_bypass_structured_file_validation() {
        let nonce = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let root = std::env::temp_dir().join(format!("fracta-assets-{nonce}"));
        fs::create_dir_all(&root).unwrap();
        assert!(write_asset(&root, "attachments/blob.bin", &[0, 1, 255]).is_ok());
        assert!(write_asset(&root, "data.json", b"not json").is_err());
        assert_eq!(
            fs::read(root.join("attachments/blob.bin")).unwrap(),
            vec![0, 1, 255]
        );
        fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn media_assets_are_vault_contained_and_extension_restricted() {
        let nonce = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let root = std::env::temp_dir().join(format!("fracta-media-{nonce}"));
        fs::create_dir_all(&root).unwrap();
        fs::write(root.join("clip.mp3"), [1, 2, 3]).unwrap();
        let asset = media_asset(&root, "clip.mp3").unwrap();
        assert_eq!(asset.mime, "audio/mpeg");
        assert_eq!(asset.bytes, vec![1, 2, 3]);
        assert!(media_asset(&root, "clip.exe").is_err());
        assert!(media_asset(&root, "../clip.mp3").is_err());
        fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn utf16_and_bom_text_round_trip_without_reencoding() {
        let nonce = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let root = std::env::temp_dir().join(format!("fracta-encoding-{nonce}"));
        fs::create_dir_all(&root).unwrap();
        let original = vec![0xFF, 0xFE, b'a', 0, b'\r', 0, b'\n', 0];
        fs::write(root.join("legacy.txt"), original).unwrap();
        let loaded = read(&root, "legacy.txt").unwrap();
        assert_eq!(loaded.content.as_deref(), Some("a\r\n"));
        assert_eq!(loaded.encoding.as_deref(), Some("utf-16le"));
        assert_eq!(loaded.newline.as_deref(), Some("crlf"));
        write(&root, "legacy.txt", "b\r\n").unwrap();
        assert_eq!(
            fs::read(root.join("legacy.txt")).unwrap(),
            vec![0xFF, 0xFE, b'b', 0, b'\r', 0, b'\n', 0]
        );

        fs::write(root.join("bom.txt"), [0xEF, 0xBB, 0xBF, b'a', b'\n']).unwrap();
        write(&root, "bom.txt", "b\n").unwrap();
        assert_eq!(
            fs::read(root.join("bom.txt")).unwrap(),
            vec![0xEF, 0xBB, 0xBF, b'b', b'\n']
        );
        fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn csv_write_preserves_utf8_bom_delimiter_and_final_record_style() {
        let nonce = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let root = std::env::temp_dir().join(format!("fracta-csv-dialect-{nonce}"));
        fs::create_dir_all(&root).unwrap();
        fs::write(
            root.join("people.csv"),
            [
                0xEF, 0xBB, 0xBF, b'i', b'd', b';', b'n', b'a', b'm', b'e', b'\r', b'\n', b'0',
                b'0', b'1', b';', b'A', b'd', b'a',
            ],
        )
        .unwrap();
        let file = read(&root, "people.csv").unwrap();
        assert_eq!(file.content.as_deref(), Some("id;name\r\n001;Ada"));
        assert_eq!(file.encoding.as_deref(), Some("utf-8-bom"));
        assert_eq!(file.newline.as_deref(), Some("crlf"));
        write(&root, "people.csv", "id;name\r\n002;Ada").unwrap();
        assert_eq!(
            fs::read(root.join("people.csv")).unwrap(),
            vec![
                0xEF, 0xBB, 0xBF, b'i', b'd', b';', b'n', b'a', b'm', b'e', b'\r', b'\n', b'0',
                b'0', b'2', b';', b'A', b'd', b'a'
            ]
        );
        fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn classifies_docx_heading_list_and_paragraph_blocks() {
        assert_eq!(
            docx_block_type(Some("Heading2"), false),
            ("heading".to_string(), Some(2))
        );
        assert_eq!(docx_block_type(None, true), ("list_item".to_string(), None));
        assert_eq!(
            docx_block_type(Some("BodyText"), false),
            ("paragraph".to_string(), None)
        );
    }

    #[test]
    fn reads_external_links_and_embedded_docx_media_relationships() {
        let relationships = docx_relationships(
            r#"<?xml version="1.0"?><Relationships><Relationship Id="rId1" Target="https://example.com" TargetMode="External"/><Relationship Id="rId2" Target="media/image1.png"/></Relationships>"#,
        );
        assert_eq!(
            relationships.get("rId1"),
            Some(&"https://example.com".to_string())
        );
        assert_eq!(
            relationships.get("rId2"),
            Some(&"media/image1.png".to_string())
        );
    }

    #[test]
    fn reads_docx_archive_structure_and_embedded_image() {
        let nonce = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let root = std::env::temp_dir().join(format!("fracta-docx-{nonce}"));
        fs::create_dir_all(&root).unwrap();
        let file = fs::File::create(root.join("sample.docx")).unwrap();
        let mut archive = ZipWriter::new(file);
        let options = SimpleFileOptions::default();
        archive.start_file("word/document.xml", options).unwrap();
        archive
            .write_all(
                br#"<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><w:body><w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>Field notes</w:t></w:r></w:p><w:p><w:hyperlink r:id="rIdLink"><w:r><w:t>Reference</w:t></w:r></w:hyperlink></w:p><w:p><w:r><w:drawing><a:blip r:embed="rIdImage"/></w:drawing></w:r></w:p><w:p><w:pPr><w:numPr/></w:pPr><w:r><w:t>First point</w:t></w:r></w:p><w:tbl><w:tr><w:tc><w:p><w:r><w:t>Name</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>Role</w:t></w:r></w:p></w:tc></w:tr><w:tr><w:tc><w:p><w:r><w:t>Ada</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>Researcher</w:t></w:r></w:p></w:tc></w:tr></w:tbl></w:body></w:document>"#,
            )
            .unwrap();
        archive
            .start_file("word/_rels/document.xml.rels", options)
            .unwrap();
        archive
            .write_all(
                br#"<?xml version="1.0"?><Relationships><Relationship Id="rIdLink" Target="https://example.com" TargetMode="External"/><Relationship Id="rIdImage" Target="media/image1.png"/></Relationships>"#,
            )
            .unwrap();
        archive
            .start_file("word/media/image1.png", options)
            .unwrap();
        archive.write_all(&[137, 80, 78, 71]).unwrap();
        archive.finish().unwrap();

        let preview = preview(&root, "sample.docx").unwrap();
        let blocks = preview.docx_blocks.unwrap();
        assert_eq!(blocks[0].kind, "heading");
        assert_eq!(blocks[0].level, Some(1));
        assert_eq!(blocks[0].text, "Field notes");
        assert_eq!(blocks[1].href.as_deref(), Some("https://example.com"));
        assert_eq!(
            blocks[2].images.as_deref(),
            Some(&["word/media/image1.png".to_string()][..])
        );
        assert_eq!(blocks[3].kind, "list_item");
        assert_eq!(blocks[3].text, "First point");
        assert_eq!(blocks[4].kind, "table");
        let rows = blocks[4].rows.as_ref().unwrap();
        assert_eq!(rows[0], vec!["Name", "Role"]);
        assert_eq!(rows[1], vec!["Ada", "Researcher"]);
        let image = docx_image(&root, "sample.docx", "word/media/image1.png").unwrap();
        assert_eq!(image.mime, "image/png");
        assert_eq!(image.bytes, vec![137, 80, 78, 71]);
        fs::remove_dir_all(root).unwrap();
    }
}
