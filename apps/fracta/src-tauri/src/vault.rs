//! The on-disk vault: a user-chosen folder of `.md` entries.
//!
//! One entry is one file. The vault path is chosen on first launch and remembered in a
//! small `config.json` under the app's config dir. All entry I/O is confined to the
//! chosen folder — a path traversal in an id can never escape it.

use crate::frontmatter::{self, Document, Meta};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};

/// Persisted app config. Only the vault path for now.
#[derive(Debug, Default, Serialize, Deserialize)]
struct Config {
    vault: Option<PathBuf>,
}

/// Runtime handle held in Tauri state.
#[derive(Default)]
pub struct Vault {
    inner: Mutex<Option<PathBuf>>,
}

/// A single entry as the frontend sees it. `id` is the file stem — stable, and the
/// only handle the frontend ever passes back.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Entry {
    pub id: String,
    pub title: String,
    pub category: String,
    pub tags: Vec<String>,
    pub body: String,
    /// Millis since epoch, stored in frontmatter once known.
    pub created_at: u64,
    /// Millis since epoch, stored in frontmatter once known. Drives sidebar ordering.
    pub updated_at: u64,
}

/// Sidebar summary — no body, so listing a large vault stays cheap.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EntrySummary {
    pub id: String,
    pub title: String,
    pub category: String,
    pub tags: Vec<String>,
    pub created_at: u64,
    pub updated_at: u64,
    /// First line or so of the body, for the sidebar preview.
    pub excerpt: String,
}

pub type VaultResult<T> = Result<T, String>;

fn config_path(app_config_dir: &Path) -> PathBuf {
    app_config_dir.join("config.json")
}

fn load_config(app_config_dir: &Path) -> Config {
    fs::read_to_string(config_path(app_config_dir))
        .ok()
        .and_then(|raw| serde_json::from_str(&raw).ok())
        .unwrap_or_default()
}

fn save_config(app_config_dir: &Path, config: &Config) -> VaultResult<()> {
    fs::create_dir_all(app_config_dir).map_err(|e| e.to_string())?;
    let raw = serde_json::to_string_pretty(config).map_err(|e| e.to_string())?;
    fs::write(config_path(app_config_dir), raw).map_err(|e| e.to_string())
}

impl Vault {
    /// Rehydrates the remembered vault path at startup. A path that no longer exists
    /// is treated as unset, so the user is re-prompted rather than hitting errors.
    pub fn restore(&self, app_config_dir: &Path) {
        let config = load_config(app_config_dir);
        if let Some(path) = config.vault {
            if path.is_dir() {
                *self.inner.lock().unwrap() = Some(path);
            }
        }
    }

    pub fn current(&self) -> Option<PathBuf> {
        self.inner.lock().unwrap().clone()
    }

    /// The selected project root for the recursive workspace surface.
    pub fn root(&self) -> VaultResult<PathBuf> {
        self.dir()
    }

    /// Records the chosen folder, creating it if needed, and persists it.
    pub fn set(&self, app_config_dir: &Path, path: PathBuf) -> VaultResult<()> {
        fs::create_dir_all(&path).map_err(|e| format!("Could not create vault folder: {e}"))?;
        let canonical = path.canonicalize().map_err(|e| e.to_string())?;
        save_config(
            app_config_dir,
            &Config {
                vault: Some(canonical.clone()),
            },
        )?;
        *self.inner.lock().unwrap() = Some(canonical);
        Ok(())
    }

    fn dir(&self) -> VaultResult<PathBuf> {
        self.current()
            .ok_or_else(|| "No vault folder has been chosen yet.".to_string())
    }

    /// Resolves an entry id to a path inside the vault, refusing anything that would
    /// escape it. Ids are file stems, never paths.
    fn entry_path(&self, id: &str) -> VaultResult<PathBuf> {
        // Ids are bare file stems. Reject anything with a path separator, a parent
        // reference, a NUL, or a dot-prefix — none can then escape the vault dir.
        if id.is_empty()
            || id.starts_with('.')
            || id.contains(['/', '\\', '\0'])
            || id.contains("..")
        {
            return Err(format!("Invalid entry id: {id:?}"));
        }
        Ok(self.dir()?.join(format!("{id}.md")))
    }

    pub fn list(&self) -> VaultResult<Vec<EntrySummary>> {
        let dir = self.dir()?;
        let mut out = Vec::new();
        for entry in fs::read_dir(&dir).map_err(|e| e.to_string())? {
            let entry = entry.map_err(|e| e.to_string())?;
            let path = entry.path();
            if path.extension().and_then(|e| e.to_str()) != Some("md") {
                continue;
            }
            let Some(id) = path.file_stem().and_then(|s| s.to_str()) else {
                continue;
            };
            let raw = fs::read_to_string(&path).unwrap_or_default();
            let doc = frontmatter::parse(&raw);
            let (created_at, updated_at) = entry_timestamps(&entry, &doc);
            let title = display_title(&doc);
            out.push(EntrySummary {
                id: id.to_string(),
                title,
                category: doc.meta.category,
                tags: doc.meta.tags,
                created_at,
                updated_at,
                excerpt: excerpt(&doc.body),
            });
        }
        // Newest first.
        out.sort_by_key(|e| std::cmp::Reverse(e.updated_at));
        Ok(out)
    }

    pub fn read(&self, id: &str) -> VaultResult<Entry> {
        let path = self.entry_path(id)?;
        let raw = fs::read_to_string(&path).map_err(|e| format!("Could not read entry: {e}"))?;
        let doc = frontmatter::parse(&raw);
        let metadata = fs::metadata(&path).ok();
        let updated_at = doc.meta.updated_at.max(
            metadata
                .as_ref()
                .and_then(|m| m.modified().ok())
                .map(to_millis)
                .unwrap_or(0),
        );
        let created_at = if doc.meta.created_at > 0 {
            doc.meta.created_at
        } else {
            metadata
                .as_ref()
                .and_then(|m| m.created().ok())
                .map(to_millis)
                .unwrap_or(updated_at)
        };
        Ok(Entry {
            id: id.to_string(),
            title: display_title(&doc),
            category: doc.meta.category,
            tags: doc.meta.tags,
            body: doc.body,
            created_at,
            updated_at,
        })
    }

    /// Creates a fresh empty entry and returns its id. The file is written immediately
    /// so the sidebar and autosave have a real target from the first keystroke.
    pub fn create(&self) -> VaultResult<String> {
        let dir = self.dir()?;
        let id = unique_id(&dir);
        let now = current_millis();
        let doc = Document {
            meta: Meta {
                created_at: now,
                updated_at: now,
                ..Default::default()
            },
            body: String::new(),
        };
        fs::write(dir.join(format!("{id}.md")), frontmatter::serialize(&doc))
            .map_err(|e| format!("Could not create entry: {e}"))?;
        Ok(id)
    }

    /// Writes an entry's content. A blank title is derived from the body so the file
    /// always carries one; the derived value is echoed back for the UI to display.
    pub fn write(
        &self,
        id: &str,
        title: &str,
        category: &str,
        tags: Vec<String>,
        body: &str,
    ) -> VaultResult<Entry> {
        let path = self.entry_path(id)?;
        let existing = fs::read_to_string(&path)
            .ok()
            .map(|raw| frontmatter::parse(&raw));
        let metadata = fs::metadata(&path).ok();
        let now = current_millis();
        let created_at = existing
            .as_ref()
            .map(|doc| doc.meta.created_at)
            .filter(|timestamp| *timestamp > 0)
            .or_else(|| {
                metadata
                    .as_ref()
                    .and_then(|m| m.created().ok())
                    .map(to_millis)
            })
            .unwrap_or(now);
        let title = if frontmatter::looks_like_auto_title(title, body) {
            frontmatter::derive_title(body)
        } else {
            title.trim().to_string()
        };
        let doc = Document {
            meta: Meta {
                title: title.clone(),
                category: category.trim().to_string(),
                tags: tags
                    .into_iter()
                    .map(|t| t.trim().to_string())
                    .filter(|t| !t.is_empty())
                    .collect(),
                created_at,
                updated_at: now,
            },
            body: body.to_string(),
        };
        fs::write(&path, frontmatter::serialize(&doc))
            .map_err(|e| format!("Could not save entry: {e}"))?;
        Ok(Entry {
            id: id.to_string(),
            title,
            category: doc.meta.category,
            tags: doc.meta.tags,
            body: doc.body,
            created_at: doc.meta.created_at,
            updated_at: doc.meta.updated_at,
        })
    }

    pub fn delete(&self, id: &str) -> VaultResult<()> {
        let path = self.entry_path(id)?;
        // Best-effort move to the OS trash; fall back to a hard remove only if the
        // platform trash is unavailable, so a misfire is recoverable where possible.
        match trash::delete(&path) {
            Ok(()) => Ok(()),
            Err(_) => fs::remove_file(&path).map_err(|e| format!("Could not delete entry: {e}")),
        }
    }
}

fn display_title(doc: &Document) -> String {
    if frontmatter::looks_like_auto_title(&doc.meta.title, &doc.body) {
        let derived = frontmatter::derive_title(&doc.body);
        if derived.is_empty() {
            "Untitled".to_string()
        } else {
            derived
        }
    } else {
        doc.meta.title.clone()
    }
}

fn excerpt(body: &str) -> String {
    let text = body
        .lines()
        .map(str::trim)
        .find(|l| !l.is_empty())
        .unwrap_or("");
    let cleaned = text.trim_start_matches('#').trim();
    cleaned.chars().take(120).collect()
}

fn to_millis(t: SystemTime) -> u64 {
    t.duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0)
}

fn current_millis() -> u64 {
    to_millis(SystemTime::now())
}

fn entry_timestamps(entry: &fs::DirEntry, doc: &Document) -> (u64, u64) {
    let metadata = entry.metadata().ok();
    let updated_at = doc.meta.updated_at.max(
        metadata
            .as_ref()
            .and_then(|m| m.modified().ok())
            .map(to_millis)
            .unwrap_or(0),
    );
    let created_at = if doc.meta.created_at > 0 {
        doc.meta.created_at
    } else {
        metadata
            .as_ref()
            .and_then(|m| m.created().ok())
            .map(to_millis)
            .unwrap_or(updated_at)
    };
    (created_at, updated_at)
}

/// A short, sortable, collision-free id: `YYYYMMDDhhmmss`-ish from epoch millis in
/// base36, plus a numeric suffix if two entries are created in the same millisecond.
fn unique_id(dir: &Path) -> String {
    let base = radix36(
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_millis() as u64)
            .unwrap_or(0),
    );
    if !dir.join(format!("{base}.md")).exists() {
        return base;
    }
    for suffix in 1.. {
        let candidate = format!("{base}-{suffix}");
        if !dir.join(format!("{candidate}.md")).exists() {
            return candidate;
        }
    }
    unreachable!()
}

fn radix36(mut n: u64) -> String {
    const DIGITS: &[u8; 36] = b"0123456789abcdefghijklmnopqrstuvwxyz";
    if n == 0 {
        return "0".to_string();
    }
    let mut buf = Vec::new();
    while n > 0 {
        buf.push(DIGITS[(n % 36) as usize]);
        n /= 36;
    }
    buf.reverse();
    String::from_utf8(buf).unwrap()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rejects_traversal_ids() {
        let v = Vault::default();
        *v.inner.lock().unwrap() = Some(std::env::temp_dir());
        for bad in ["../escape", "a/b", "..", "with\0null", ""] {
            assert!(v.entry_path(bad).is_err(), "{bad:?} should be rejected");
        }
        assert!(v.entry_path("2024-note").is_ok());
    }

    #[test]
    fn radix36_is_stable() {
        assert_eq!(radix36(0), "0");
        assert_eq!(radix36(35), "z");
        assert_eq!(radix36(36), "10");
    }

    fn temp_vault() -> (Vault, PathBuf) {
        let stamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let dir = std::env::temp_dir().join(format!("fracta-test-{stamp}"));
        fs::create_dir_all(&dir).unwrap();
        let vault = Vault::default();
        *vault.inner.lock().unwrap() = Some(dir.clone());
        (vault, dir)
    }

    #[test]
    fn full_entry_lifecycle_on_disk() {
        let (vault, dir) = temp_vault();

        // Create → a real .md file exists immediately.
        let id = vault.create().unwrap();
        let path = dir.join(format!("{id}.md"));
        assert!(path.exists());

        // Write with a blank title → title is derived from the first body line, and the
        // file carries exactly the specified frontmatter shape.
        vault
            .write(
                &id,
                "",
                "Research",
                vec!["ai".into(), "notes".into()],
                "# Speed matters\n\nThe body text.",
            )
            .unwrap();

        let raw = fs::read_to_string(&path).unwrap();
        assert!(
            raw.starts_with("---\n"),
            "must open with frontmatter: {raw:?}"
        );
        assert!(raw.contains("title: Speed matters"));
        assert!(raw.contains("created_at:"));
        assert!(raw.contains("updated_at:"));
        assert!(raw.contains("category: Research"));
        assert!(raw.contains("tags: [ai, notes]"));
        assert!(raw.contains("\n---\n"));
        assert!(raw.contains("# Speed matters"));

        // Read back → structured fields match.
        let entry = vault.read(&id).unwrap();
        assert_eq!(entry.title, "Speed matters");
        assert_eq!(entry.category, "Research");
        assert_eq!(entry.tags, vec!["ai", "notes"]);
        assert!(entry.body.contains("The body text."));
        assert!(entry.created_at > 0);
        assert!(entry.updated_at >= entry.created_at);

        // List → one summary, newest-first ordering holds.
        let list = vault.list().unwrap();
        assert_eq!(list.len(), 1);
        assert_eq!(list[0].id, id);
        assert_eq!(list[0].title, "Speed matters");

        // Delete → gone.
        vault.delete(&id).unwrap();
        assert!(!path.exists());
        assert!(vault.list().unwrap().is_empty());

        fs::remove_dir_all(&dir).ok();
    }

    #[test]
    fn explicit_title_overrides_derivation() {
        let (vault, dir) = temp_vault();
        let id = vault.create().unwrap();
        vault
            .write(&id, "My Title", "", vec![], "# Different heading\n\nbody")
            .unwrap();
        let raw = fs::read_to_string(dir.join(format!("{id}.md"))).unwrap();
        assert!(raw.contains("title: My Title"));
        // No category/tags supplied → those keys are omitted entirely.
        assert!(!raw.contains("category:"));
        assert!(!raw.contains("tags:"));
        fs::remove_dir_all(&dir).ok();
    }

    #[test]
    fn legacy_auto_title_is_reassigned_to_current_limit() {
        let (vault, dir) = temp_vault();
        let id = vault.create().unwrap();
        let body =
            "# I'll port the Sidebar component following the skill. Let me start with Step 0 —\n\nbody";
        let saved = vault
            .write(
                &id,
                "I'll port the Sidebar component following the skill. Let me start with Step 0 —",
                "",
                vec![],
                body,
            )
            .unwrap();
        assert_eq!(saved.title, "I'll port the Sidebar component follo...");
        let raw = fs::read_to_string(dir.join(format!("{id}.md"))).unwrap();
        assert!(raw.contains("title: I'll port the Sidebar component follo..."));
        fs::remove_dir_all(&dir).ok();
    }
}
