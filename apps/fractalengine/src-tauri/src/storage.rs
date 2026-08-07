use std::fs;
use std::time::{SystemTime, UNIX_EPOCH};

use rand::{distributions::Alphanumeric, Rng};
use rusqlite::{params, params_from_iter, types::Value, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

const DATABASE_FILE: &str = "fractalengine.db";
const MAX_SEARCH_LIMIT: i64 = 200;
const DEFAULT_SEARCH_LIMIT: i64 = 50;
const MIGRATIONS: &[(i64, &str)] = &[
    (
        1,
        "CREATE TABLE bookmarks (
        id TEXT PRIMARY KEY,
        url TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        tags TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
    );
    CREATE VIRTUAL TABLE search_index USING fts5(
        title,
        body,
        source UNINDEXED,
        doc_id UNINDEXED,
        path UNINDEXED,
        updated_at UNINDEXED
    );",
    ),
    // v2 — browser history (module-neutral `history_*` tables; browser is the primary writer
    // but any module reads through the history IPC). FTS5 over (url, title) kept in sync by
    // triggers on history_urls — the proven storage FTS pattern (§1a ledger).
    (
        2,
        "CREATE TABLE history_urls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL DEFAULT '',
        favicon_url TEXT,
        visit_count INTEGER NOT NULL DEFAULT 0,
        last_visit_at INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE history_visits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url_id INTEGER NOT NULL REFERENCES history_urls(id) ON DELETE CASCADE,
        visited_at INTEGER NOT NULL,
        transition TEXT NOT NULL DEFAULT 'link'
    );
    CREATE INDEX idx_history_visits_url_id ON history_visits(url_id);
    CREATE INDEX idx_history_visits_visited_at ON history_visits(visited_at);
    CREATE VIRTUAL TABLE history_fts USING fts5(url, title);
    CREATE TRIGGER history_urls_ai AFTER INSERT ON history_urls BEGIN
        INSERT INTO history_fts(rowid, url, title) VALUES (new.id, new.url, new.title);
    END;
    CREATE TRIGGER history_urls_ad AFTER DELETE ON history_urls BEGIN
        DELETE FROM history_fts WHERE rowid = old.id;
    END;
    CREATE TRIGGER history_urls_au AFTER UPDATE ON history_urls BEGIN
        UPDATE history_fts SET url = new.url, title = new.title WHERE rowid = new.id;
    END;",
    ),
    // v3 — browser-stewarded bookmarks remain app-level data. Evolve the v1 table in place;
    // never fork a second bookmark store. SQLite's ADD COLUMN keeps every existing row intact.
    (
        3,
        "CREATE TABLE bookmark_folders (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL COLLATE NOCASE UNIQUE,
        position INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
    );
    ALTER TABLE bookmarks ADD COLUMN favicon_url TEXT;
    ALTER TABLE bookmarks ADD COLUMN folder_id TEXT REFERENCES bookmark_folders(id) ON DELETE SET NULL;
    ALTER TABLE bookmarks ADD COLUMN position INTEGER NOT NULL DEFAULT 0;
    CREATE INDEX idx_bookmarks_folder_position ON bookmarks(folder_id, position, updated_at DESC);
    CREATE INDEX idx_bookmarks_url ON bookmarks(url);",
    ),
];

/// Identical consecutive visits to the same URL within this window collapse into one visit row
/// (title/favicon still refresh) — kills reload spam. §3.3.
const HISTORY_DEBOUNCE_MS: i64 = 3_000;

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchQuery {
    pub query: String,
    pub sources: Option<Vec<String>>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct IndexDocument {
    pub source: String,
    pub doc_id: String,
    pub title: String,
    pub body: String,
    pub path: Option<String>,
    pub updated_at: i64,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BookmarkInput {
    pub url: String,
    pub title: String,
    pub description: Option<String>,
    pub favicon_url: Option<String>,
    pub tags: Option<Vec<String>>,
    pub folder_id: Option<String>,
    pub position: Option<i64>,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchHit {
    pub source: String,
    pub doc_id: String,
    pub title: String,
    pub snippet: String,
    pub score: f64,
    pub path: Option<String>,
    pub updated_at: i64,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Bookmark {
    pub id: String,
    pub url: String,
    pub title: String,
    pub description: String,
    pub favicon_url: Option<String>,
    pub tags: Vec<String>,
    pub folder_id: Option<String>,
    pub position: i64,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BookmarkFolderInput {
    pub name: String,
    pub position: Option<i64>,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BookmarkFolder {
    pub id: String,
    pub name: String,
    pub position: i64,
    pub created_at: i64,
    pub updated_at: i64,
}

/// A visit to record. `favicon_url`/`title` may be empty on the first (nav-committed) call and
/// are refreshed by a later title-changed/favicon-changed call within the debounce window.
#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HistoryVisitInput {
    pub url: String,
    pub title: Option<String>,
    pub favicon_url: Option<String>,
    pub transition: Option<String>,
}

/// A de-duplicated history URL row (one per distinct URL, aggregating its visits).
#[derive(Clone, Debug, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct HistoryEntry {
    pub id: i64,
    pub url: String,
    pub title: String,
    pub favicon_url: Option<String>,
    pub visit_count: i64,
    pub last_visit_at: i64,
}

fn now_millis() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis() as i64)
        .unwrap_or(0)
}

fn open_storage(app: &AppHandle) -> Result<Connection, String> {
    let directory = app
        .path()
        .app_data_dir()
        .map_err(|error| error.to_string())?;
    fs::create_dir_all(&directory).map_err(|error| error.to_string())?;
    let mut connection =
        Connection::open(directory.join(DATABASE_FILE)).map_err(|error| error.to_string())?;
    connection
        .busy_timeout(std::time::Duration::from_secs(5))
        .map_err(|error| error.to_string())?;
    run_migrations(&mut connection)?;
    Ok(connection)
}

fn run_migrations(connection: &mut Connection) -> Result<(), String> {
    connection
        .execute_batch(
            "CREATE TABLE IF NOT EXISTS schema_migrations (
				version INTEGER PRIMARY KEY,
				applied_at INTEGER NOT NULL
			);",
        )
        .map_err(|error| error.to_string())?;

    for (version, sql) in MIGRATIONS {
        let applied = connection
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM schema_migrations WHERE version = ?1)",
                params![version],
                |row| row.get::<_, bool>(0),
            )
            .map_err(|error| error.to_string())?;
        if applied {
            continue;
        }

        let transaction = connection
            .transaction()
            .map_err(|error| error.to_string())?;
        transaction
            .execute_batch(sql)
            .map_err(|error| error.to_string())?;
        transaction
            .execute(
                "INSERT INTO schema_migrations (version, applied_at) VALUES (?1, ?2)",
                params![version, now_millis()],
            )
            .map_err(|error| error.to_string())?;
        transaction.commit().map_err(|error| error.to_string())?;
    }
    Ok(())
}

fn fts_literal_query(query: &str) -> String {
    query
        .split_whitespace()
        .map(|term| {
            term.chars()
                .filter(|character| character.is_alphanumeric() || *character == '_')
                .collect::<String>()
        })
        .filter(|term| !term.is_empty())
        .map(|term| format!("\"{}\"", term.replace('"', "\"\"")))
        .collect::<Vec<_>>()
        .join(" AND ")
}

fn clamp_limit(limit: Option<i64>) -> i64 {
    limit
        .unwrap_or(DEFAULT_SEARCH_LIMIT)
        .clamp(1, MAX_SEARCH_LIMIT)
}

fn clamp_offset(offset: Option<i64>) -> i64 {
    offset.unwrap_or(0).max(0)
}

fn index_documents(connection: &mut Connection, documents: &[IndexDocument]) -> Result<(), String> {
    let transaction = connection
        .transaction()
        .map_err(|error| error.to_string())?;
    for document in documents {
        if document.source != "note" && document.source != "bookmark" && document.source != "media"
        {
            return Err(format!("Unsupported indexed source: {}", document.source));
        }
        transaction
            .execute(
                "DELETE FROM search_index WHERE source = ?1 AND doc_id = ?2",
                params![document.source, document.doc_id],
            )
            .map_err(|error| error.to_string())?;
        transaction
            .execute(
                "INSERT INTO search_index (title, body, source, doc_id, path, updated_at)
				 VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                params![
                    document.title,
                    document.body,
                    document.source,
                    document.doc_id,
                    document.path,
                    document.updated_at
                ],
            )
            .map_err(|error| error.to_string())?;
    }
    transaction.commit().map_err(|error| error.to_string())
}

fn index_bookmark(connection: &Connection, bookmark: &Bookmark) -> Result<(), String> {
    connection
        .execute(
            "DELETE FROM search_index WHERE source = 'bookmark' AND doc_id = ?1",
            params![bookmark.id],
        )
        .map_err(|error| error.to_string())?;
    connection
        .execute(
            "INSERT INTO search_index (title, body, source, doc_id, path, updated_at)
			 VALUES (?1, ?2, 'bookmark', ?3, ?4, ?5)",
            params![
                bookmark.title,
                format!("{} {}", bookmark.description, bookmark.tags.join(" ")),
                bookmark.id,
                bookmark.url,
                bookmark.updated_at
            ],
        )
        .map_err(|error| error.to_string())?;
    Ok(())
}

fn parse_tags(tags: String) -> Result<Vec<String>, rusqlite::Error> {
    serde_json::from_str(&tags).map_err(|error| {
        rusqlite::Error::FromSqlConversionFailure(0, rusqlite::types::Type::Text, Box::new(error))
    })
}

fn bookmark_from_row(row: &rusqlite::Row<'_>) -> Result<Bookmark, rusqlite::Error> {
    let tags: String = row.get(4)?;
    Ok(Bookmark {
        id: row.get(0)?,
        url: row.get(1)?,
        title: row.get(2)?,
        description: row.get(3)?,
        tags: parse_tags(tags)?,
        favicon_url: row.get(5)?,
        folder_id: row.get(6)?,
        position: row.get(7)?,
        created_at: row.get(8)?,
        updated_at: row.get(9)?,
    })
}

fn make_bookmark_id() -> String {
    let suffix: String = rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(6)
        .map(char::from)
        .collect();
    format!("bm_{}_{}", now_millis(), suffix.to_lowercase())
}

fn make_bookmark_folder_id() -> String {
    let suffix: String = rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(6)
        .map(char::from)
        .collect();
    format!("bf_{}_{}", now_millis(), suffix.to_lowercase())
}

type NormalizedBookmarkInput = (
    String,
    String,
    String,
    Option<String>,
    Vec<String>,
    Option<String>,
    i64,
);

fn normalize_bookmark_input(input: BookmarkInput) -> Result<NormalizedBookmarkInput, String> {
    let url = input.url.trim().to_string();
    let title = input.title.trim().to_string();
    if url.is_empty() || title.is_empty() {
        return Err("Bookmark URL and title are required".to_string());
    }
    let description = input.description.unwrap_or_default().trim().to_string();
    let favicon_url = input
        .favicon_url
        .and_then(|favicon| (!favicon.trim().is_empty()).then(|| favicon.trim().to_string()));
    let tags = input
        .tags
        .unwrap_or_default()
        .into_iter()
        .map(|tag| tag.trim().to_string())
        .filter(|tag| !tag.is_empty())
        .collect();
    Ok((
        url,
        title,
        description,
        favicon_url,
        tags,
        input.folder_id,
        input.position.unwrap_or(0),
    ))
}

fn add_bookmark_to(connection: &mut Connection, input: BookmarkInput) -> Result<Bookmark, String> {
    let (url, title, description, favicon_url, tags, folder_id, position) =
        normalize_bookmark_input(input)?;
    if let Some(folder_id) = &folder_id {
        let exists: bool = connection
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM bookmark_folders WHERE id = ?1)",
                params![folder_id],
                |row| row.get(0),
            )
            .map_err(|error| error.to_string())?;
        if !exists {
            return Err("Bookmark folder not found".to_string());
        }
    }
    let now = now_millis();
    let bookmark = Bookmark {
        id: make_bookmark_id(),
        url,
        title,
        description,
        favicon_url,
        tags,
        folder_id,
        position,
        created_at: now,
        updated_at: now,
    };
    let transaction = connection
        .transaction()
        .map_err(|error| error.to_string())?;
    transaction
        .execute(
            "INSERT INTO bookmarks (id, url, title, description, tags, favicon_url, folder_id, position, created_at, updated_at)
			 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            params![
                bookmark.id,
                bookmark.url,
                bookmark.title,
                bookmark.description,
                serde_json::to_string(&bookmark.tags).map_err(|error| error.to_string())?,
                bookmark.favicon_url,
                bookmark.folder_id,
                bookmark.position,
                bookmark.created_at,
                bookmark.updated_at
            ],
        )
        .map_err(|error| error.to_string())?;
    index_bookmark(&transaction, &bookmark)?;
    transaction.commit().map_err(|error| error.to_string())?;
    Ok(bookmark)
}

fn update_bookmark_in(
    connection: &mut Connection,
    id: String,
    input: BookmarkInput,
) -> Result<Bookmark, String> {
    let (url, title, description, favicon_url, tags, folder_id, position) =
        normalize_bookmark_input(input)?;
    if let Some(folder_id) = &folder_id {
        let exists: bool = connection
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM bookmark_folders WHERE id = ?1)",
                params![folder_id],
                |row| row.get(0),
            )
            .map_err(|error| error.to_string())?;
        if !exists {
            return Err("Bookmark folder not found".to_string());
        }
    }
    let now = now_millis();
    let transaction = connection
        .transaction()
        .map_err(|error| error.to_string())?;
    let changed = transaction
		.execute(
			"UPDATE bookmarks SET url = ?1, title = ?2, description = ?3, tags = ?4, favicon_url = ?5, folder_id = ?6, position = ?7, updated_at = ?8 WHERE id = ?9",
			params![url, title, description, serde_json::to_string(&tags).map_err(|error| error.to_string())?, favicon_url, folder_id, position, now, id],
		)
		.map_err(|error| error.to_string())?;
    if changed == 0 {
        return Err("Bookmark not found".to_string());
    }
    let bookmark = transaction
		.query_row(
			"SELECT id, url, title, description, tags, favicon_url, folder_id, position, created_at, updated_at FROM bookmarks WHERE id = ?1",
			params![id],
			bookmark_from_row,
		)
		.map_err(|error| error.to_string())?;
    index_bookmark(&transaction, &bookmark)?;
    transaction.commit().map_err(|error| error.to_string())?;
    Ok(bookmark)
}

fn delete_bookmark_from(connection: &mut Connection, id: String) -> Result<(), String> {
    let transaction = connection
        .transaction()
        .map_err(|error| error.to_string())?;
    transaction
        .execute("DELETE FROM bookmarks WHERE id = ?1", params![id])
        .map_err(|error| error.to_string())?;
    transaction
        .execute(
            "DELETE FROM search_index WHERE source = 'bookmark' AND doc_id = ?1",
            params![id],
        )
        .map_err(|error| error.to_string())?;
    transaction.commit().map_err(|error| error.to_string())
}

fn search_all(connection: &Connection, query: SearchQuery) -> Result<Vec<SearchHit>, String> {
    let match_query = fts_literal_query(&query.query);
    if match_query.is_empty() {
        return Ok(Vec::new());
    }
    let sources = query.sources.unwrap_or_default();
    let mut values = vec![Value::Text(match_query)];
    let source_filter = if sources.is_empty() {
        String::new()
    } else {
        values.extend(sources.iter().cloned().map(Value::Text));
        let placeholders = (2..sources.len() + 2)
            .map(|index| format!("?{index}"))
            .collect::<Vec<_>>()
            .join(", ");
        format!(" AND source IN ({placeholders})")
    };
    values.push(Value::Integer(clamp_limit(query.limit)));
    values.push(Value::Integer(clamp_offset(query.offset)));
    let limit_index = values.len() - 1;
    let offset_index = values.len();
    let sql = format!(
		"SELECT source, doc_id, title, snippet(search_index, 1, '«', '»', '…', 12), -bm25(search_index), path, updated_at
		 FROM search_index WHERE search_index MATCH ?1{source_filter}
		 ORDER BY bm25(search_index) LIMIT ?{limit_index} OFFSET ?{offset_index}"
	);
    let mut statement = connection
        .prepare(&sql)
        .map_err(|error| error.to_string())?;
    let hits = statement
        .query_map(params_from_iter(values), |row| {
            Ok(SearchHit {
                source: row.get(0)?,
                doc_id: row.get(1)?,
                title: row.get(2)?,
                snippet: row.get(3)?,
                score: row.get(4)?,
                path: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .map_err(|error| error.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|error| error.to_string())?;
    Ok(hits)
}

fn history_entry_from_row(row: &rusqlite::Row<'_>) -> Result<HistoryEntry, rusqlite::Error> {
    Ok(HistoryEntry {
        id: row.get(0)?,
        url: row.get(1)?,
        title: row.get(2)?,
        favicon_url: row.get(3)?,
        visit_count: row.get(4)?,
        last_visit_at: row.get(5)?,
    })
}

const HISTORY_COLUMNS: &str = "id, url, title, favicon_url, visit_count, last_visit_at";

/// Record a visit. Upserts the URL row, appends a visit (unless debounced), and returns the
/// aggregated entry. This is the single write path — capture happens Rust-side (A7 calls this
/// on nav-committed / title-changed), never from the page or the chrome.
fn record_visit_in(
    connection: &mut Connection,
    input: HistoryVisitInput,
) -> Result<HistoryEntry, String> {
    let url = input.url.trim().to_string();
    if url.is_empty() {
        return Err("History visit requires a URL".to_string());
    }
    let title = input.title.unwrap_or_default();
    let favicon = input.favicon_url.filter(|f| !f.trim().is_empty());
    let transition = input.transition.unwrap_or_else(|| "link".to_string());
    let now = now_millis();

    let transaction = connection
        .transaction()
        .map_err(|error| error.to_string())?;

    let existing = transaction
        .query_row(
            "SELECT id, last_visit_at FROM history_urls WHERE url = ?1",
            params![url],
            |row| Ok((row.get::<_, i64>(0)?, row.get::<_, i64>(1)?)),
        )
        .ok();

    let url_id = match existing {
        Some((id, last_visit_at)) => {
            let debounced = now - last_visit_at < HISTORY_DEBOUNCE_MS;
            if !debounced {
                transaction
                    .execute(
                        "INSERT INTO history_visits (url_id, visited_at, transition) VALUES (?1, ?2, ?3)",
                        params![id, now, transition],
                    )
                    .map_err(|error| error.to_string())?;
            }
            // Refresh title only when a non-empty one is supplied; always bump last_visit_at and
            // favicon (when supplied). visit_count only grows on a non-debounced visit.
            transaction
                .execute(
                    "UPDATE history_urls
                     SET title = CASE WHEN ?2 <> '' THEN ?2 ELSE title END,
                         favicon_url = COALESCE(?3, favicon_url),
                         last_visit_at = ?4,
                         visit_count = visit_count + ?5
                     WHERE id = ?1",
                    params![id, title, favicon, now, if debounced { 0 } else { 1 }],
                )
                .map_err(|error| error.to_string())?;
            id
        }
        None => {
            transaction
                .execute(
                    "INSERT INTO history_urls (url, title, favicon_url, visit_count, last_visit_at)
                     VALUES (?1, ?2, ?3, 1, ?4)",
                    params![url, title, favicon, now],
                )
                .map_err(|error| error.to_string())?;
            let id = transaction.last_insert_rowid();
            transaction
                .execute(
                    "INSERT INTO history_visits (url_id, visited_at, transition) VALUES (?1, ?2, ?3)",
                    params![id, now, transition],
                )
                .map_err(|error| error.to_string())?;
            id
        }
    };

    let entry = transaction
        .query_row(
            &format!("SELECT {HISTORY_COLUMNS} FROM history_urls WHERE id = ?1"),
            params![url_id],
            history_entry_from_row,
        )
        .map_err(|error| error.to_string())?;
    transaction.commit().map_err(|error| error.to_string())?;
    Ok(entry)
}

fn search_history_in(
    connection: &Connection,
    query: &str,
    limit: Option<i64>,
) -> Result<Vec<HistoryEntry>, String> {
    let match_query = fts_literal_query(query);
    if match_query.is_empty() {
        return Ok(Vec::new());
    }
    // Rank by FTS relevance, tie-broken by recency and frequency (frecency-ish).
    let sql = format!(
        "SELECT {cols}
         FROM history_fts
         JOIN history_urls ON history_urls.id = history_fts.rowid
         WHERE history_fts MATCH ?1
         ORDER BY bm25(history_fts), history_urls.last_visit_at DESC, history_urls.visit_count DESC
         LIMIT ?2",
        cols = HISTORY_COLUMNS
            .split(", ")
            .map(|c| format!("history_urls.{c}"))
            .collect::<Vec<_>>()
            .join(", "),
    );
    let mut statement = connection
        .prepare(&sql)
        .map_err(|error| error.to_string())?;
    let rows = statement
        .query_map(
            params![match_query, clamp_limit(limit)],
            history_entry_from_row,
        )
        .map_err(|error| error.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|error| error.to_string())?;
    Ok(rows)
}

fn recent_history_in(
    connection: &Connection,
    limit: Option<i64>,
) -> Result<Vec<HistoryEntry>, String> {
    let mut statement = connection
        .prepare(&format!(
            "SELECT {HISTORY_COLUMNS} FROM history_urls ORDER BY last_visit_at DESC, id DESC LIMIT ?1"
        ))
        .map_err(|error| error.to_string())?;
    let rows = statement
        .query_map(params![clamp_limit(limit)], history_entry_from_row)
        .map_err(|error| error.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|error| error.to_string())?;
    Ok(rows)
}

fn delete_history_url_in(connection: &mut Connection, id: i64) -> Result<(), String> {
    let transaction = connection
        .transaction()
        .map_err(|error| error.to_string())?;
    // Explicit visit deletion (we don't rely on PRAGMA foreign_keys being on); the AFTER DELETE
    // trigger removes the FTS row.
    transaction
        .execute("DELETE FROM history_visits WHERE url_id = ?1", params![id])
        .map_err(|error| error.to_string())?;
    transaction
        .execute("DELETE FROM history_urls WHERE id = ?1", params![id])
        .map_err(|error| error.to_string())?;
    transaction.commit().map_err(|error| error.to_string())
}

/// Clear visits in [from, to] (either bound optional; both absent = clear all). URL rows whose
/// visits are fully removed are deleted (emptying their FTS rows via trigger); rows that keep
/// some visits have their `visit_count` / `last_visit_at` recomputed so aggregates stay honest.
fn clear_history_range_in(
    connection: &mut Connection,
    from: Option<i64>,
    to: Option<i64>,
) -> Result<(), String> {
    let transaction = connection
        .transaction()
        .map_err(|error| error.to_string())?;
    transaction
        .execute(
            "DELETE FROM history_visits
             WHERE (?1 IS NULL OR visited_at >= ?1) AND (?2 IS NULL OR visited_at <= ?2)",
            params![from, to],
        )
        .map_err(|error| error.to_string())?;
    transaction
        .execute(
            "UPDATE history_urls SET
                 visit_count = (SELECT COUNT(*) FROM history_visits WHERE url_id = history_urls.id),
                 last_visit_at = COALESCE(
                     (SELECT MAX(visited_at) FROM history_visits WHERE url_id = history_urls.id),
                     last_visit_at)",
            [],
        )
        .map_err(|error| error.to_string())?;
    transaction
        .execute("DELETE FROM history_urls WHERE visit_count = 0", [])
        .map_err(|error| error.to_string())?;
    transaction.commit().map_err(|error| error.to_string())
}

#[tauri::command]
pub fn storage_search_all(app: AppHandle, query: SearchQuery) -> Result<Vec<SearchHit>, String> {
    let connection = open_storage(&app)?;
    search_all(&connection, query)
}

#[tauri::command]
pub fn storage_index_documents(app: AppHandle, docs: Vec<IndexDocument>) -> Result<(), String> {
    let mut connection = open_storage(&app)?;
    index_documents(&mut connection, &docs)
}

#[tauri::command]
pub fn storage_remove_documents(
    app: AppHandle,
    source: String,
    doc_ids: Vec<String>,
) -> Result<(), String> {
    let mut connection = open_storage(&app)?;
    let transaction = connection
        .transaction()
        .map_err(|error| error.to_string())?;
    for doc_id in doc_ids {
        transaction
            .execute(
                "DELETE FROM search_index WHERE source = ?1 AND doc_id = ?2",
                params![source, doc_id],
            )
            .map_err(|error| error.to_string())?;
    }
    transaction.commit().map_err(|error| error.to_string())
}

#[tauri::command]
pub fn bookmark_list(app: AppHandle, folder_id: Option<String>) -> Result<Vec<Bookmark>, String> {
    let connection = open_storage(&app)?;
    let mut statement = connection
		.prepare("SELECT id, url, title, description, tags, favicon_url, folder_id, position, created_at, updated_at FROM bookmarks WHERE (?1 IS NULL OR folder_id = ?1) ORDER BY position ASC, updated_at DESC, id DESC")
		.map_err(|error| error.to_string())?;
    let bookmarks = statement
        .query_map(params![folder_id], bookmark_from_row)
        .map_err(|error| error.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|error| error.to_string())?;
    Ok(bookmarks)
}

#[tauri::command]
pub fn bookmark_for_url(app: AppHandle, url: String) -> Result<Option<Bookmark>, String> {
    let connection = open_storage(&app)?;
    connection.query_row(
        "SELECT id, url, title, description, tags, favicon_url, folder_id, position, created_at, updated_at FROM bookmarks WHERE url = ?1",
        params![url.trim()],
        bookmark_from_row,
    ).optional().map_err(|error| error.to_string())
}

#[tauri::command]
pub fn bookmark_add(app: AppHandle, input: BookmarkInput) -> Result<Bookmark, String> {
    let mut connection = open_storage(&app)?;
    add_bookmark_to(&mut connection, input)
}

#[tauri::command]
pub fn bookmark_update(
    app: AppHandle,
    id: String,
    input: BookmarkInput,
) -> Result<Bookmark, String> {
    let mut connection = open_storage(&app)?;
    update_bookmark_in(&mut connection, id, input)
}

#[tauri::command]
pub fn bookmark_delete(app: AppHandle, id: String) -> Result<(), String> {
    let mut connection = open_storage(&app)?;
    delete_bookmark_from(&mut connection, id)
}

fn bookmark_folder_from_row(row: &rusqlite::Row<'_>) -> Result<BookmarkFolder, rusqlite::Error> {
    Ok(BookmarkFolder {
        id: row.get(0)?,
        name: row.get(1)?,
        position: row.get(2)?,
        created_at: row.get(3)?,
        updated_at: row.get(4)?,
    })
}

#[tauri::command]
pub fn bookmark_folder_list(app: AppHandle) -> Result<Vec<BookmarkFolder>, String> {
    let connection = open_storage(&app)?;
    let mut statement = connection.prepare(
        "SELECT id, name, position, created_at, updated_at FROM bookmark_folders ORDER BY position ASC, name COLLATE NOCASE ASC"
    ).map_err(|error| error.to_string())?;
    let folders = statement
        .query_map([], bookmark_folder_from_row)
        .map_err(|error| error.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|error| error.to_string())?;
    Ok(folders)
}

#[tauri::command]
pub fn bookmark_folder_add(
    app: AppHandle,
    input: BookmarkFolderInput,
) -> Result<BookmarkFolder, String> {
    let name = input.name.trim().to_string();
    if name.is_empty() {
        return Err("Bookmark folder name is required".to_string());
    }
    let now = now_millis();
    let folder = BookmarkFolder {
        id: make_bookmark_folder_id(),
        name,
        position: input.position.unwrap_or(0),
        created_at: now,
        updated_at: now,
    };
    let connection = open_storage(&app)?;
    connection.execute("INSERT INTO bookmark_folders (id, name, position, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![folder.id, folder.name, folder.position, folder.created_at, folder.updated_at])
        .map_err(|error| if error.to_string().contains("UNIQUE") { "Bookmark folder already exists".to_string() } else { error.to_string() })?;
    Ok(folder)
}

#[tauri::command]
pub fn bookmark_folder_update(
    app: AppHandle,
    id: String,
    input: BookmarkFolderInput,
) -> Result<BookmarkFolder, String> {
    let name = input.name.trim().to_string();
    if name.is_empty() {
        return Err("Bookmark folder name is required".to_string());
    }
    let connection = open_storage(&app)?;
    let current: BookmarkFolder = connection
        .query_row(
            "SELECT id, name, position, created_at, updated_at FROM bookmark_folders WHERE id = ?1",
            params![id],
            bookmark_folder_from_row,
        )
        .map_err(|_| "Bookmark folder not found".to_string())?;
    let position = input.position.unwrap_or(current.position);
    let now = now_millis();
    connection
        .execute(
            "UPDATE bookmark_folders SET name = ?1, position = ?2, updated_at = ?3 WHERE id = ?4",
            params![name, position, now, id],
        )
        .map_err(|error| {
            if error.to_string().contains("UNIQUE") {
                "Bookmark folder already exists".to_string()
            } else {
                error.to_string()
            }
        })?;
    Ok(BookmarkFolder {
        name,
        position,
        updated_at: now,
        ..current
    })
}

#[tauri::command]
pub fn bookmark_folder_delete(app: AppHandle, id: String) -> Result<(), String> {
    let mut connection = open_storage(&app)?;
    let transaction = connection
        .transaction()
        .map_err(|error| error.to_string())?;
    let changed = transaction
        .execute("DELETE FROM bookmark_folders WHERE id = ?1", params![id])
        .map_err(|error| error.to_string())?;
    if changed == 0 {
        return Err("Bookmark folder not found".to_string());
    }
    transaction
        .execute(
            "UPDATE bookmarks SET folder_id = NULL, updated_at = ?1 WHERE folder_id = ?2",
            params![now_millis(), id],
        )
        .map_err(|error| error.to_string())?;
    transaction.commit().map_err(|error| error.to_string())
}

// ── History (module-neutral `history_*` surface, §3.3) ────────────────────────
// `history_record_visit` is the Rust-internal capture path A7's browser/history.rs calls on
// nav-committed / title-changed; it is a command so the single writer stays on the native side.

#[tauri::command]
pub fn history_record_visit(
    app: AppHandle,
    input: HistoryVisitInput,
) -> Result<HistoryEntry, String> {
    let mut connection = open_storage(&app)?;
    record_visit_in(&mut connection, input)
}

#[tauri::command]
pub fn history_search(
    app: AppHandle,
    query: String,
    limit: Option<i64>,
) -> Result<Vec<HistoryEntry>, String> {
    let connection = open_storage(&app)?;
    search_history_in(&connection, &query, limit)
}

#[tauri::command]
pub fn history_recent(app: AppHandle, limit: Option<i64>) -> Result<Vec<HistoryEntry>, String> {
    let connection = open_storage(&app)?;
    recent_history_in(&connection, limit)
}

#[tauri::command]
pub fn history_delete_url(app: AppHandle, id: i64) -> Result<(), String> {
    let mut connection = open_storage(&app)?;
    delete_history_url_in(&mut connection, id)
}

#[tauri::command]
pub fn history_clear_range(
    app: AppHandle,
    from: Option<i64>,
    to: Option<i64>,
) -> Result<(), String> {
    let mut connection = open_storage(&app)?;
    clear_history_range_in(&mut connection, from, to)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn database() -> Connection {
        let mut connection = Connection::open_in_memory().expect("open in-memory SQLite");
        run_migrations(&mut connection).expect("run migration");
        connection
    }

    fn note(id: &str, title: &str, body: &str) -> IndexDocument {
        IndexDocument {
            source: "note".to_string(),
            doc_id: id.to_string(),
            title: title.to_string(),
            body: body.to_string(),
            path: Some(format!("/vault/{id}")),
            updated_at: 1,
        }
    }

    #[test]
    fn bundled_sqlite_supports_fts5() {
        let connection = Connection::open_in_memory().expect("open in-memory SQLite");
        connection
            .execute_batch("CREATE VIRTUAL TABLE t USING fts5(x)")
            .expect("bundled SQLite must support FTS5");
    }

    #[test]
    fn migrations_are_idempotent() {
        let mut connection = database();
        run_migrations(&mut connection).expect("run migration again");
        let count: i64 = connection
            .query_row(
                "SELECT COUNT(*) FROM schema_migrations WHERE version = 1",
                [],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(count, 1);
    }

    #[test]
    fn bookmark_v1_database_evolves_in_place_to_v3() {
        let mut connection = Connection::open_in_memory().unwrap();
        connection.execute_batch(
            "CREATE TABLE schema_migrations (version INTEGER PRIMARY KEY, applied_at INTEGER NOT NULL);
             CREATE TABLE bookmarks (
                 id TEXT PRIMARY KEY, url TEXT NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL,
                 tags TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
             );
             CREATE VIRTUAL TABLE search_index USING fts5(title, body, source UNINDEXED, doc_id UNINDEXED, path UNINDEXED, updated_at UNINDEXED);
             INSERT INTO schema_migrations (version, applied_at) VALUES (1, 1);
             INSERT INTO bookmarks (id, url, title, description, tags, created_at, updated_at)
             VALUES ('bm_old', 'https://old.example', 'Old', 'kept', '[\"legacy\"]', 1, 2);"
        ).unwrap();
        run_migrations(&mut connection).unwrap();

        let migrated = connection.query_row(
            "SELECT id, url, title, description, tags, favicon_url, folder_id, position, created_at, updated_at FROM bookmarks WHERE id = 'bm_old'",
            [], bookmark_from_row,
        ).unwrap();
        assert_eq!(migrated.tags, vec!["legacy"]);
        assert_eq!(migrated.favicon_url, None);
        assert_eq!(migrated.folder_id, None);
        assert_eq!(migrated.position, 0);
        let v3: bool = connection
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM schema_migrations WHERE version = 3)",
                [],
                |row| row.get(0),
            )
            .unwrap();
        assert!(v3);
    }

    #[test]
    fn bookmark_folder_and_v2_fields_round_trip() {
        let mut connection = database();
        let now = now_millis();
        let folder = BookmarkFolder {
            id: "bf_test".to_string(),
            name: "Research".to_string(),
            position: 4,
            created_at: now,
            updated_at: now,
        };
        connection.execute("INSERT INTO bookmark_folders (id, name, position, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)", params![folder.id, folder.name, folder.position, folder.created_at, folder.updated_at]).unwrap();
        let bookmark = add_bookmark_to(
            &mut connection,
            BookmarkInput {
                url: "https://example.com/path".to_string(),
                title: "Example".to_string(),
                description: None,
                favicon_url: Some("https://example.com/favicon.ico".to_string()),
                tags: Some(vec!["reference".to_string()]),
                folder_id: Some("bf_test".to_string()),
                position: Some(7),
            },
        )
        .unwrap();
        assert_eq!(bookmark.folder_id.as_deref(), Some("bf_test"));
        assert_eq!(bookmark.position, 7);
        assert_eq!(
            bookmark.favicon_url.as_deref(),
            Some("https://example.com/favicon.ico")
        );
        delete_bookmark_from(&mut connection, bookmark.id).unwrap();
        connection
            .execute("DELETE FROM bookmark_folders WHERE id = 'bf_test'", [])
            .unwrap();
    }

    #[test]
    fn bookmark_crud_round_trip_and_delete_removes_index() {
        let mut connection = database();
        let created = add_bookmark_to(
            &mut connection,
            BookmarkInput {
                url: "https://example.com".to_string(),
                title: "Example".to_string(),
                description: Some("A useful page".to_string()),
                favicon_url: None,
                tags: Some(vec!["reference".to_string(), "web".to_string()]),
                folder_id: None,
                position: None,
            },
        )
        .unwrap();
        assert_eq!(created.tags, vec!["reference", "web"]);
        let updated = update_bookmark_in(
            &mut connection,
            created.id.clone(),
            BookmarkInput {
                url: "https://example.org".to_string(),
                title: "Updated".to_string(),
                description: None,
                favicon_url: None,
                tags: Some(vec!["changed".to_string()]),
                folder_id: None,
                position: None,
            },
        )
        .unwrap();
        assert_eq!(updated.title, "Updated");
        delete_bookmark_from(&mut connection, created.id.clone()).unwrap();
        let count: i64 = connection
            .query_row(
                "SELECT COUNT(*) FROM search_index WHERE source = 'bookmark' AND doc_id = ?1",
                params![created.id],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(count, 0);
    }

    #[test]
    fn reindex_replaces_and_search_marks_snippet() {
        let mut connection = database();
        index_documents(
            &mut connection,
            &[
                note("a.md", "Alpha", "first searchable passage"),
                note("a.md", "Alpha", "replacement searchable passage"),
            ],
        )
        .unwrap();
        let count: i64 = connection
            .query_row(
                "SELECT COUNT(*) FROM search_index WHERE source = 'note' AND doc_id = 'a.md'",
                [],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(count, 1);
        let mut statement = connection.prepare("SELECT snippet(search_index, 1, '«', '»', '…', 12) FROM search_index WHERE search_index MATCH ?1").unwrap();
        let snippet: String = statement
            .query_row(params![fts_literal_query("replacement")], |row| row.get(0))
            .unwrap();
        assert!(snippet.contains("«replacement»"));
    }

    #[test]
    fn operator_input_is_literal_and_limit_is_clamped() {
        assert_eq!(fts_literal_query("a\" OR b*"), "\"a\" AND \"OR\" AND \"b\"");
        assert_eq!(clamp_limit(Some(999)), 200);
        assert_eq!(clamp_offset(Some(-3)), 0);
    }

    #[test]
    fn search_filters_sources_clamps_limit_and_does_not_interpret_operators() {
        let mut connection = database();
        let mut documents = (0..205)
            .map(|index| note(&format!("note-{index}.md"), "Needle", "needle reference"))
            .collect::<Vec<_>>();
        documents.push(IndexDocument {
            source: "bookmark".to_string(),
            doc_id: "bm_search".to_string(),
            title: "Needle bookmark".to_string(),
            body: "needle reference".to_string(),
            path: Some("https://example.com".to_string()),
            updated_at: 1,
        });
        documents.push(note("only-a.md", "A", "a"));
        documents.push(note("only-b.md", "B", "b"));
        index_documents(&mut connection, &documents).unwrap();

        let hits = search_all(
            &connection,
            SearchQuery {
                query: "needle".to_string(),
                sources: Some(vec!["note".to_string()]),
                limit: Some(999),
                offset: None,
            },
        )
        .unwrap();
        assert_eq!(hits.len(), 200);
        assert!(hits.iter().all(|hit| hit.source == "note"));

        let injected = search_all(
            &connection,
            SearchQuery {
                query: "a\" OR b*".to_string(),
                sources: None,
                limit: None,
                offset: None,
            },
        )
        .unwrap();
        assert!(injected.is_empty());
    }

    // ── History ───────────────────────────────────────────────────────────────

    fn visit(url: &str, title: &str) -> HistoryVisitInput {
        HistoryVisitInput {
            url: url.to_string(),
            title: Some(title.to_string()),
            favicon_url: None,
            transition: None,
        }
    }

    fn history_fts_count(connection: &Connection) -> i64 {
        connection
            .query_row("SELECT COUNT(*) FROM history_fts", [], |row| row.get(0))
            .unwrap()
    }

    fn visit_row_count(connection: &Connection) -> i64 {
        connection
            .query_row("SELECT COUNT(*) FROM history_visits", [], |row| row.get(0))
            .unwrap()
    }

    #[test]
    fn history_migration_v2_applied() {
        let connection = database();
        let count: i64 = connection
            .query_row(
                "SELECT COUNT(*) FROM schema_migrations WHERE version = 2",
                [],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(count, 1);
    }

    #[test]
    fn record_visit_upserts_and_debounces() {
        let mut connection = database();
        let first =
            record_visit_in(&mut connection, visit("https://example.com", "Example")).unwrap();
        assert_eq!(first.visit_count, 1);
        // Immediate re-visit is debounced: no new visit row, count unchanged, title refreshes.
        let second = record_visit_in(
            &mut connection,
            visit("https://example.com", "Example Home"),
        )
        .unwrap();
        assert_eq!(second.id, first.id);
        assert_eq!(second.visit_count, 1);
        assert_eq!(second.title, "Example Home");
        assert_eq!(visit_row_count(&connection), 1);

        // A visit outside the debounce window bumps the count and adds a row.
        connection
            .execute(
                "UPDATE history_urls SET last_visit_at = last_visit_at - 10000 WHERE id = ?1",
                params![first.id],
            )
            .unwrap();
        let third =
            record_visit_in(&mut connection, visit("https://example.com", "Example")).unwrap();
        assert_eq!(third.visit_count, 2);
        assert_eq!(visit_row_count(&connection), 2);
    }

    #[test]
    fn record_visit_keeps_fts_in_sync_and_search_ranks() {
        let mut connection = database();
        record_visit_in(
            &mut connection,
            visit("https://rust-lang.org", "Rust Programming Language"),
        )
        .unwrap();
        record_visit_in(&mut connection, visit("https://svelte.dev", "Svelte")).unwrap();
        assert_eq!(history_fts_count(&connection), 2);

        let hits = search_history_in(&connection, "rust", Some(10)).unwrap();
        assert_eq!(hits.len(), 1);
        assert_eq!(hits[0].url, "https://rust-lang.org");

        // Title change (within debounce) must update the FTS row too.
        record_visit_in(
            &mut connection,
            visit("https://svelte.dev", "Svelte Cybernetically enhanced"),
        )
        .unwrap();
        let hits = search_history_in(&connection, "cybernetically", Some(10)).unwrap();
        assert_eq!(hits.len(), 1);
        assert_eq!(hits[0].url, "https://svelte.dev");
    }

    #[test]
    fn recent_history_orders_by_last_visit() {
        let mut connection = database();
        let a = record_visit_in(&mut connection, visit("https://a.com", "A")).unwrap();
        record_visit_in(&mut connection, visit("https://b.com", "B")).unwrap();
        // Force a.com to be most-recent.
        connection
            .execute(
                "UPDATE history_urls SET last_visit_at = 99999999999999 WHERE id = ?1",
                params![a.id],
            )
            .unwrap();
        let recent = recent_history_in(&connection, Some(10)).unwrap();
        assert_eq!(recent.len(), 2);
        assert_eq!(recent[0].url, "https://a.com");
    }

    #[test]
    fn delete_url_removes_visits_and_fts() {
        let mut connection = database();
        let e = record_visit_in(&mut connection, visit("https://gone.com", "Gone")).unwrap();
        delete_history_url_in(&mut connection, e.id).unwrap();
        assert_eq!(history_fts_count(&connection), 0);
        assert_eq!(visit_row_count(&connection), 0);
        assert!(search_history_in(&connection, "gone", Some(10))
            .unwrap()
            .is_empty());
    }

    #[test]
    fn clear_range_bounds_and_empties_fts() {
        let mut connection = database();
        let keep = record_visit_in(&mut connection, visit("https://keep.com", "Keep")).unwrap();
        let drop = record_visit_in(&mut connection, visit("https://drop.com", "Drop")).unwrap();
        // Stamp visits at known times.
        connection
            .execute(
                "UPDATE history_visits SET visited_at = 1000 WHERE url_id = ?1",
                params![keep.id],
            )
            .unwrap();
        connection
            .execute(
                "UPDATE history_visits SET visited_at = 5000 WHERE url_id = ?1",
                params![drop.id],
            )
            .unwrap();
        // Clear only [4000, 6000] — removes drop.com, keeps keep.com.
        clear_history_range_in(&mut connection, Some(4000), Some(6000)).unwrap();
        let remaining = recent_history_in(&connection, Some(10)).unwrap();
        assert_eq!(remaining.len(), 1);
        assert_eq!(remaining[0].url, "https://keep.com");
        assert_eq!(history_fts_count(&connection), 1);

        // Clear all — FTS fully emptied.
        clear_history_range_in(&mut connection, None, None).unwrap();
        assert_eq!(history_fts_count(&connection), 0);
        assert_eq!(visit_row_count(&connection), 0);
    }

    #[test]
    fn record_visit_rejects_blank_url_and_search_ignores_operators() {
        let mut connection = database();
        assert!(record_visit_in(&mut connection, visit("   ", "Blank")).is_err());
        record_visit_in(&mut connection, visit("https://example.com", "Example")).unwrap();
        // FTS operator injection is neutralized (same guarantee as search_all).
        assert!(search_history_in(&connection, "a\" OR b*", Some(10))
            .unwrap()
            .is_empty());
        // Limit is clamped, not trusted.
        record_visit_in(&mut connection, visit("https://two.com", "Example Two")).unwrap();
        let hits = search_history_in(&connection, "example", Some(999)).unwrap();
        assert_eq!(hits.len(), 2);
    }
}
