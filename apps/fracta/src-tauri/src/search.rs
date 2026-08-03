//! Vault-scoped SQLite FTS5 index. The database belongs to Fracta configuration,
//! never the user's project, so ordinary content folders stay portable and clean.

use crate::{
    frontmatter,
    workspace::{self, FileKind},
};
use rusqlite::{params, Connection};
use serde::Serialize;
use std::collections::hash_map::DefaultHasher;
use std::fs;
use std::hash::{Hash, Hasher};
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Serialize)]
pub struct SearchHit {
    pub path: String,
    pub title: String,
    pub excerpt: String,
    pub kind: FileKind,
    pub score: f64,
}

pub fn rebuild(config_dir: &Path, root: &Path) -> Result<usize, String> {
    let connection = open(config_dir, root)?;
    connection
        .execute("DELETE FROM documents", [])
        .map_err(|error| error.to_string())?;
    let mut count = 0;
    for item in workspace::list(root)? {
        if index_item(&connection, root, &item)? {
            count += 1;
        }
    }
    Ok(count)
}

/// Applies a filesystem event to just its affected records. Events commonly carry
/// both halves of a rename; deleting before re-indexing makes either ordering safe.
/// A `.fractaignore` edit changes the meaning of the complete tree, so it correctly
/// falls back to the explicit full rebuild path.
pub fn update_paths(config_dir: &Path, root: &Path, paths: &[PathBuf]) -> Result<usize, String> {
    if paths
        .iter()
        .any(|path| path.file_name().is_some_and(|name| name == ".fractaignore"))
    {
        return rebuild(config_dir, root);
    }
    let connection = open(config_dir, root)?;
    let mut count = 0;
    for path in paths {
        let Ok(relative) = path.strip_prefix(root) else {
            continue;
        };
        let relative = relative.to_string_lossy().replace('\\', "/");
        if relative.is_empty() {
            return rebuild(config_dir, root);
        }
        connection
            .execute(
                "DELETE FROM documents WHERE path = ?1 OR path GLOB ?2",
                params![relative, format!("{}/*", relative)],
            )
            .map_err(|error| error.to_string())?;
        if path.is_dir() {
            for item in workspace::list(root)?
                .into_iter()
                .filter(|item| item.path.starts_with(&format!("{relative}/")))
            {
                if index_item(&connection, root, &item)? {
                    count += 1;
                }
            }
        } else if path.exists() {
            if let Some(item) = workspace::list(root)?
                .into_iter()
                .find(|item| item.path == relative)
            {
                if index_item(&connection, root, &item)? {
                    count += 1;
                }
            }
        }
    }
    Ok(count)
}

fn index_item(
    connection: &Connection,
    root: &Path,
    item: &workspace::WorkspaceItem,
) -> Result<bool, String> {
    if !matches!(
        item.kind,
        FileKind::Markdown
            | FileKind::Text
            | FileKind::Csv
            | FileKind::Json
            | FileKind::Pdf
            | FileKind::Docx
    ) {
        return Ok(false);
    }
    let text = match item.kind {
        FileKind::Pdf | FileKind::Docx => workspace::preview(root, &item.path)
            .map(|preview| preview.text)
            .unwrap_or_default(),
        _ => workspace::read(root, &item.path)
            .ok()
            .and_then(|file| file.content)
            .unwrap_or_default(),
    };
    let document = matches!(item.kind, FileKind::Markdown).then(|| frontmatter::parse(&text));
    let body = document
        .as_ref()
        .map(|document| document.body.as_str())
        .unwrap_or(&text);
    let metadata = document
        .as_ref()
        .map(|document| {
            [
                (!document.meta.title.is_empty())
                    .then(|| format!("title: {}", document.meta.title)),
                (!document.meta.category.is_empty())
                    .then(|| format!("category: {}", document.meta.category)),
                (!document.meta.tags.is_empty())
                    .then(|| format!("tags: {}", document.meta.tags.join(", "))),
            ]
            .into_iter()
            .flatten()
            .collect::<Vec<_>>()
            .join("\n")
        })
        .unwrap_or_default();
    let title = document
        .as_ref()
        .filter(|document| !document.meta.title.is_empty())
        .map(|document| document.meta.title.clone())
        .unwrap_or_else(|| {
            body.lines()
                .find(|line| !line.trim().is_empty())
                .unwrap_or(&item.name)
                .trim()
                .trim_start_matches('#')
                .trim()
                .to_string()
        });
    connection
        .execute(
            "INSERT INTO documents(path, title, metadata, body, kind) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![item.path, title, metadata, body, format!("{:?}", item.kind)],
        )
        .map_err(|error| error.to_string())?;
    Ok(true)
}

pub fn search(config_dir: &Path, root: &Path, query: &str) -> Result<Vec<SearchHit>, String> {
    if query.trim().is_empty() {
        return Ok(Vec::new());
    }
    let connection = open(config_dir, root)?;
    let count: i64 = connection
        .query_row("SELECT count(*) FROM documents", [], |row| row.get(0))
        .map_err(|error| error.to_string())?;
    if count == 0 {
        rebuild(config_dir, root)?;
    }
    let mut statement = connection.prepare(
		"SELECT path, title, snippet(documents, 3, '<mark>', '</mark>', '…', 18), kind, bm25(documents, 2.0, 8.0, 4.0, 5.0) FROM documents WHERE documents MATCH ?1 ORDER BY bm25(documents, 2.0, 8.0, 4.0, 5.0) LIMIT 50"
	).map_err(|error| error.to_string())?;
    let rows = statement
        .query_map([fts_query(query)], |row| {
            let kind = match row.get::<_, String>(3)?.as_str() {
                "Markdown" => FileKind::Markdown,
                "Text" => FileKind::Text,
                "Csv" => FileKind::Csv,
                "Json" => FileKind::Json,
                "Pdf" => FileKind::Pdf,
                "Docx" => FileKind::Docx,
                _ => FileKind::Asset,
            };
            Ok(SearchHit {
                path: row.get(0)?,
                title: row.get(1)?,
                excerpt: row.get(2)?,
                kind,
                score: row.get(4)?,
            })
        })
        .map_err(|error| error.to_string())?;
    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|error| error.to_string())
}

fn open(config_dir: &Path, root: &Path) -> Result<Connection, String> {
    let directory = config_dir.join("search");
    fs::create_dir_all(&directory).map_err(|error| error.to_string())?;
    let mut hasher = DefaultHasher::new();
    root.canonicalize()
        .unwrap_or_else(|_| root.to_path_buf())
        .to_string_lossy()
        .hash(&mut hasher);
    let path: PathBuf = directory.join(format!("{:016x}.sqlite3", hasher.finish()));
    let connection = Connection::open(path).map_err(|error| error.to_string())?;
    // FTS virtual tables cannot gain columns in place. A schema check lets a
    // previous Fracta index upgrade safely: it is derived state and will rebuild
    // from the vault, never user content.
    if connection
        .prepare("SELECT metadata FROM documents LIMIT 0")
        .is_err()
    {
        connection
            .execute("DROP TABLE IF EXISTS documents", [])
            .map_err(|error| error.to_string())?;
    }
    connection.execute_batch("CREATE VIRTUAL TABLE IF NOT EXISTS documents USING fts5(path, title, metadata, body, kind UNINDEXED);")
		.map_err(|error| format!("SQLite FTS5 is unavailable: {error}"))?;
    Ok(connection)
}

fn fts_query(query: &str) -> String {
    query
        .split_whitespace()
        .map(|term| format!("\"{}\"*", term.replace('"', "")))
        .collect::<Vec<_>>()
        .join(" AND ")
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::{SystemTime, UNIX_EPOCH};

    fn temporary(name: &str) -> PathBuf {
        let nonce = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        std::env::temp_dir().join(format!("fracta-{name}-{nonce}"))
    }

    #[test]
    fn rebuilds_and_ranks_local_document_content() {
        let root = temporary("vault");
        let config = temporary("config");
        fs::create_dir_all(&root).unwrap();
        fs::write(
            root.join("garden.md"),
            "# Garden plan\n\nPlant native ferns beside the pond.",
        )
        .unwrap();
        fs::write(root.join("chores.txt"), "Buy soil").unwrap();
        assert_eq!(rebuild(&config, &root).unwrap(), 2);
        let hits = search(&config, &root, "native ferns").unwrap();
        assert_eq!(hits.first().map(|hit| hit.path.as_str()), Some("garden.md"));
        assert!(hits[0].excerpt.contains("<mark>"));
        fs::remove_dir_all(root).unwrap();
        fs::remove_dir_all(config).unwrap();
    }

    #[test]
    fn indexes_canonical_vault_path_and_markdown_metadata() {
        let root = temporary("metadata-vault");
        let config = temporary("metadata-config");
        fs::create_dir_all(&root).unwrap();
        fs::write(
            root.join("field-notes.md"),
            "---\ntitle: Soil observations\ncategory: garden\ntags: [perennial, native]\n---\n\nOrdinary prose without the tag name.",
        ).unwrap();
        rebuild(&config, &root).unwrap();
        let hits = search(&config, &root, "perennial").unwrap();
        assert_eq!(
            hits.first().map(|hit| hit.path.as_str()),
            Some("field-notes.md")
        );
        assert_eq!(hits[0].title, "Soil observations");
        fs::remove_dir_all(root).unwrap();
        fs::remove_dir_all(config).unwrap();
    }

    #[test]
    fn filesystem_updates_only_replace_affected_search_records() {
        let root = temporary("incremental-vault");
        let config = temporary("incremental-config");
        fs::create_dir_all(&root).unwrap();
        let path = root.join("changing.txt");
        fs::write(&path, "first phrase").unwrap();
        rebuild(&config, &root).unwrap();
        fs::write(&path, "second phrase").unwrap();
        assert_eq!(
            update_paths(&config, &root, std::slice::from_ref(&path)).unwrap(),
            1
        );
        assert!(search(&config, &root, "first").unwrap().is_empty());
        assert_eq!(
            search(&config, &root, "second").unwrap()[0].path,
            "changing.txt"
        );
        fs::remove_dir_all(root).unwrap();
        fs::remove_dir_all(config).unwrap();
    }

    #[test]
    fn filesystem_rename_and_delete_do_not_leave_stale_search_paths() {
        let root = temporary("rename-delete-vault");
        let config = temporary("rename-delete-config");
        fs::create_dir_all(&root).unwrap();
        let original = root.join("draft.txt");
        let renamed = root.join("published.txt");
        fs::write(&original, "evergreen archive").unwrap();
        rebuild(&config, &root).unwrap();

        fs::rename(&original, &renamed).unwrap();
        update_paths(&config, &root, &[original.clone(), renamed.clone()]).unwrap();
        let after_rename = search(&config, &root, "evergreen").unwrap();
        assert_eq!(after_rename.len(), 1);
        assert_eq!(after_rename[0].path, "published.txt");

        fs::remove_file(&renamed).unwrap();
        update_paths(&config, &root, &[renamed]).unwrap();
        assert!(search(&config, &root, "evergreen").unwrap().is_empty());
        fs::remove_dir_all(root).unwrap();
        fs::remove_dir_all(config).unwrap();
    }

    #[test]
    fn indexes_text_with_the_same_utf16_decoder_as_the_editor() {
        let root = temporary("utf16-vault");
        let config = temporary("utf16-config");
        fs::create_dir_all(&root).unwrap();
        // UTF-16LE BOM followed by "fern".
        fs::write(
            root.join("legacy.txt"),
            [0xFF, 0xFE, b'f', 0, b'e', 0, b'r', 0, b'n', 0],
        )
        .unwrap();
        rebuild(&config, &root).unwrap();
        assert_eq!(
            search(&config, &root, "fern").unwrap()[0].path,
            "legacy.txt"
        );
        fs::remove_dir_all(root).unwrap();
        fs::remove_dir_all(config).unwrap();
    }
}
