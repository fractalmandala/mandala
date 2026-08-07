// ADR-011 Phase 1 — per-project local memory storage (SQLite via rusqlite).
//
// One database per project at `<projectRoot>/.fractal/memory.db`, created lazily.
// Stores chat sessions + messages so conversations survive reload, and supports
// "checkpoint" markers (a message id) that the UI can restore to. Phase 2+ tables
// (memory_items / embeddings / extraction) are intentionally NOT created here.
//
// All commands take `project_path`; an empty path is a graceful no-op so the app
// keeps working in browser/mock mode and before any folder is opened.

use std::fs;
use std::path::Path;
use std::time::{SystemTime, UNIX_EPOCH};

use rusqlite::{params, Connection};
use serde::Serialize;

use crate::{authorized_path, crypto, AuthorizedPaths};
use tauri::{AppHandle, Manager};

const MEMORY_KEY_ACCOUNT: &str = "memory-master-key";
const MESSAGE_ENCRYPTION_MIGRATION: &str = "message-encryption-envelope-v1";
const MAX_MESSAGE_PLAINTEXT_BYTES: usize = 2 * 1024 * 1024;
const MAX_STORED_MESSAGE_BYTES: usize = 3 * 1024 * 1024;
const UNAVAILABLE_MESSAGE: &str =
    "[Encrypted message unavailable: the stored key or payload is invalid.]";
const OVERSIZED_MESSAGE: &str = "[Message unavailable: stored payload exceeds the safety limit.]";

fn now_millis() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}

// Chat message content is the actually-sensitive part of this database (session ids,
// timestamps, and roles stay plaintext so they're still queryable/sortable); this
// encrypts just that column, reusing the vault's AES-256-GCM-with-keychain-key pattern
// but under its own separate key so compromising one doesn't expose the other.
fn encrypt_content(plaintext: &str) -> Result<String, String> {
    if plaintext.len() > MAX_MESSAGE_PLAINTEXT_BYTES {
        return Err(format!(
            "Message content exceeds the {} byte persistence limit",
            MAX_MESSAGE_PLAINTEXT_BYTES
        ));
    }
    let key = crypto::get_or_create_key(MEMORY_KEY_ACCOUNT)?;
    crypto::encrypt_with_key(plaintext, &key)
}

fn decrypt_content(stored: &str) -> String {
    if stored.len() > MAX_STORED_MESSAGE_BYTES {
        return OVERSIZED_MESSAGE.to_string();
    }
    if !crypto::is_encrypted_envelope(stored) {
        return stored.to_string();
    }
    match crypto::get_or_create_key(MEMORY_KEY_ACCOUNT) {
        Ok(key) => crypto::decrypt_with_key(stored, &key)
            .unwrap_or_else(|_| UNAVAILABLE_MESSAGE.to_string()),
        Err(_) => UNAVAILABLE_MESSAGE.to_string(),
    }
}

// Runs once per database. Envelope classification is structural rather than authenticated:
// a row written with a lost/rotated key is already ciphertext and must remain byte-for-byte
// unchanged. Treating every authentication failure as plaintext caused exponential database
// growth because each app/HMR reload encrypted the previous ciphertext again.
fn migrate_plaintext_messages_with_key(
    conn: &mut Connection,
    key: &[u8; 32],
) -> Result<(), String> {
    let already_applied = conn
        .query_row(
            "SELECT EXISTS(SELECT 1 FROM memory_migrations WHERE id = ?1)",
            params![MESSAGE_ENCRYPTION_MIGRATION],
            |row| row.get::<_, bool>(0),
        )
        .map_err(|e| e.to_string())?;
    if already_applied {
        return Ok(());
    }

    let transaction = conn.transaction().map_err(|e| e.to_string())?;
    let updates: Vec<(String, String)> = {
        let mut statement = transaction
            .prepare("SELECT id, content FROM messages")
            .map_err(|e| e.to_string())?;
        let mut rows = statement.query([]).map_err(|e| e.to_string())?;
        let mut updates = Vec::new();
        while let Some(row) = rows.next().map_err(|e| e.to_string())? {
            let id: String = row.get(0).map_err(|e| e.to_string())?;
            let content: String = row.get(1).map_err(|e| e.to_string())?;
            if crypto::is_encrypted_envelope(&content) {
                continue;
            }
            if content.len() > MAX_MESSAGE_PLAINTEXT_BYTES {
                continue;
            }
            updates.push((id, crypto::encrypt_with_key(&content, key)?));
        }
        updates
    };

    for (id, encrypted) in updates {
        transaction
            .execute(
                "UPDATE messages SET content = ?1 WHERE id = ?2",
                params![encrypted, id],
            )
            .map_err(|e| e.to_string())?;
    }
    transaction
        .execute(
            "INSERT INTO memory_migrations (id, applied_at) VALUES (?1, ?2)",
            params![MESSAGE_ENCRYPTION_MIGRATION, now_millis()],
        )
        .map_err(|e| e.to_string())?;
    transaction.commit().map_err(|e| e.to_string())
}

fn migrate_plaintext_messages(conn: &mut Connection) -> Result<(), String> {
    let key = crypto::get_or_create_key(MEMORY_KEY_ACCOUNT)?;
    migrate_plaintext_messages_with_key(conn, &key)
}

fn open_db(project_path: &str) -> Result<Connection, String> {
    let dir = Path::new(project_path).join(".fractal");
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let mut conn = Connection::open(dir.join("memory.db")).map_err(|e| e.to_string())?;
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            title TEXT,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
         );
         CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at INTEGER NOT NULL
         );
         CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
         CREATE TABLE IF NOT EXISTS checkpoints (
            id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL,
            message_id TEXT NOT NULL,
            label TEXT,
            created_at INTEGER NOT NULL
         );
         CREATE TABLE IF NOT EXISTS memory_migrations (
            id TEXT PRIMARY KEY,
            applied_at INTEGER NOT NULL
         );",
    )
    .map_err(|e| e.to_string())?;

    // Migration: `model` was added after the original schema shipped — older databases
    // won't have it yet. SQLite has no "ADD COLUMN IF NOT EXISTS", so just attempt it and
    // ignore the "duplicate column" error on a DB that already has it.
    let _ = conn.execute("ALTER TABLE sessions ADD COLUMN model TEXT", []);
    migrate_plaintext_messages(&mut conn)?;

    Ok(conn)
}

fn memory_root(
    app: &AppHandle,
    authorized: &AuthorizedPaths,
    project_path: &str,
) -> Result<String, String> {
    if project_path.is_empty() {
        let dir = app
            .path()
            .app_data_dir()
            .map_err(|e| e.to_string())?
            .join("global-memory");
        fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
        return Ok(dir.to_string_lossy().into_owned());
    }
    let project = authorized_path(authorized, Path::new(project_path), false)?;
    Ok(project.to_string_lossy().into_owned())
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionRow {
    pub id: String,
    pub title: Option<String>,
    pub created_at: i64,
    pub updated_at: i64,
    pub message_count: i64,
    pub preview: Option<String>,
    // The model active when this session was first created — set once at session
    // creation, not updated on later messages, so it reflects how the chat started.
    pub model: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MessageRow {
    pub id: String,
    pub role: String,
    pub content: String,
    pub created_at: i64,
}

async fn run_memory_task<T, F>(task: &'static str, work: F) -> Result<T, String>
where
    T: Send + 'static,
    F: FnOnce() -> Result<T, String> + Send + 'static,
{
    tauri::async_runtime::spawn_blocking(work)
        .await
        .map_err(|error| format!("{task} task failed: {error}"))?
}

#[tauri::command]
pub async fn open_project_memory(
    app: AppHandle,
    project_path: String,
    authorized: tauri::State<'_, AuthorizedPaths>,
) -> Result<(), String> {
    let project_path = memory_root(&app, &authorized, &project_path)?;

    // Opening an existing project also migrates old plaintext chat messages. That can
    // involve encrypting a large history, so it must never run in Tauri's WebView/IPC
    // event loop: on macOS that blocks AppKit and turns the entire window into a
    // spinning beachball before the frontend can render.
    run_memory_task("Open project memory", move || {
        open_db(&project_path).map(|_| ())
    })
    .await?;
    Ok(())
}

#[tauri::command]
// Tauri command arguments are the renderer IPC contract; grouping them would
// change the generated payload shape and break the shared gateway.
#[allow(clippy::too_many_arguments)]
pub async fn append_message(
    app: AppHandle,
    project_path: String,
    authorized: tauri::State<'_, AuthorizedPaths>,
    session_id: String,
    message_id: String,
    role: String,
    content: String,
    model: Option<String>,
) -> Result<(), String> {
    if session_id.is_empty() {
        return Ok(());
    }
    let root = memory_root(&app, &authorized, &project_path)?;
    run_memory_task("Append message", move || {
        let conn = open_db(&root)?;
        let now = now_millis();
        conn.execute(
            "INSERT OR IGNORE INTO sessions (id, title, model, created_at, updated_at) VALUES (?1, NULL, ?2, ?3, ?3)",
            params![session_id, model, now],
        )
        .map_err(|e| e.to_string())?;
        conn.execute(
            "UPDATE sessions SET updated_at = ?1 WHERE id = ?2",
            params![now, session_id],
        )
        .map_err(|e| e.to_string())?;
        let stored_content = encrypt_content(&content)?;
        conn.execute(
            "INSERT OR REPLACE INTO messages (id, session_id, role, content, created_at) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![message_id, session_id, role, stored_content, now],
        )
        .map_err(|e| e.to_string())?;
        Ok(())
    })
    .await
}

#[tauri::command]
pub async fn list_sessions(
    app: AppHandle,
    project_path: String,
    authorized: tauri::State<'_, AuthorizedPaths>,
) -> Result<Vec<SessionRow>, String> {
    let root = memory_root(&app, &authorized, &project_path)?;
    run_memory_task("List sessions", move || {
        let conn = open_db(&root)?;
        let mut stmt = conn
            .prepare(
                "SELECT s.id, s.title, s.created_at, s.updated_at,
                        (SELECT COUNT(*) FROM messages m WHERE m.session_id = s.id),
                        (SELECT CASE WHEN length(content) <= ?1 THEN content ELSE NULL END
                         FROM messages m2 WHERE m2.session_id = s.id ORDER BY m2.rowid ASC LIMIT 1),
                        s.model
                 FROM sessions s
                 ORDER BY s.updated_at DESC",
            )
            .map_err(|e| e.to_string())?;
        let rows = stmt
            .query_map(params![MAX_STORED_MESSAGE_BYTES as i64], |r| {
                Ok(SessionRow {
                    id: r.get(0)?,
                    title: r.get(1)?,
                    created_at: r.get(2)?,
                    updated_at: r.get(3)?,
                    message_count: r.get(4)?,
                    preview: r.get(5)?,
                    model: r.get(6)?,
                })
            })
            .map_err(|e| e.to_string())?;
        let mut out = Vec::new();
        for row in rows {
            let mut session = row.map_err(|e| e.to_string())?;
            session.preview = session.preview.map(|p| decrypt_content(&p));
            out.push(session);
        }
        Ok(out)
    })
    .await
}

#[tauri::command]
pub async fn load_session(
    app: AppHandle,
    project_path: String,
    authorized: tauri::State<'_, AuthorizedPaths>,
    session_id: String,
) -> Result<Vec<MessageRow>, String> {
    let root = memory_root(&app, &authorized, &project_path)?;
    run_memory_task("Load session", move || {
        let conn = open_db(&root)?;
        let mut stmt = conn
            .prepare(
                "SELECT id, role,
                        CASE WHEN length(content) <= ?2 THEN content ELSE NULL END,
                        created_at
                 FROM messages WHERE session_id = ?1 ORDER BY rowid ASC",
            )
            .map_err(|e| e.to_string())?;
        let rows = stmt
            .query_map(params![session_id, MAX_STORED_MESSAGE_BYTES as i64], |r| {
                let stored: Option<String> = r.get(2)?;
                Ok(MessageRow {
                    id: r.get(0)?,
                    role: r.get(1)?,
                    content: stored.unwrap_or_else(|| OVERSIZED_MESSAGE.to_string()),
                    created_at: r.get(3)?,
                })
            })
            .map_err(|e| e.to_string())?;
        let mut out = Vec::new();
        for row in rows {
            let mut message = row.map_err(|e| e.to_string())?;
            message.content = decrypt_content(&message.content);
            out.push(message);
        }
        Ok(out)
    })
    .await
}

#[tauri::command]
pub async fn create_checkpoint(
    app: AppHandle,
    project_path: String,
    authorized: tauri::State<'_, AuthorizedPaths>,
    session_id: String,
    message_id: String,
    label: String,
) -> Result<(), String> {
    let root = memory_root(&app, &authorized, &project_path)?;
    run_memory_task("Create checkpoint", move || {
        let conn = open_db(&root)?;
        let now = now_millis();
        let cp_id = format!("cp_{}_{}", session_id, now);
        conn.execute(
            "INSERT OR REPLACE INTO checkpoints (id, session_id, message_id, label, created_at) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![cp_id, session_id, message_id, label, now],
        )
        .map_err(|e| e.to_string())?;
        Ok(())
    })
    .await
}

#[tauri::command]
pub async fn restore_checkpoint(
    app: AppHandle,
    project_path: String,
    authorized: tauri::State<'_, AuthorizedPaths>,
    session_id: String,
    message_id: String,
) -> Result<(), String> {
    let root = memory_root(&app, &authorized, &project_path)?;
    run_memory_task("Restore checkpoint", move || {
        let conn = open_db(&root)?;
        // Delete every message inserted after the checkpoint marker (ordered by rowid).
        conn.execute(
            "DELETE FROM messages
             WHERE session_id = ?1
               AND rowid > (SELECT rowid FROM messages WHERE id = ?2)",
            params![session_id, message_id],
        )
        .map_err(|e| e.to_string())?;
        Ok(())
    })
    .await
}

#[cfg(test)]
mod tests {
    use super::*;

    fn migration_db() -> Connection {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch(
            "CREATE TABLE messages (
                id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at INTEGER NOT NULL
             );
             CREATE TABLE memory_migrations (
                id TEXT PRIMARY KEY,
                applied_at INTEGER NOT NULL
             );",
        )
        .unwrap();
        conn
    }

    fn insert_message(conn: &Connection, id: &str, content: &str) {
        conn.execute(
            "INSERT INTO messages (id, session_id, role, content, created_at)
             VALUES (?1, 'session', 'user', ?2, 1)",
            params![id, content],
        )
        .unwrap();
    }

    fn stored_content(conn: &Connection, id: &str) -> String {
        conn.query_row(
            "SELECT content FROM messages WHERE id = ?1",
            params![id],
            |row| row.get(0),
        )
        .unwrap()
    }

    #[test]
    fn plaintext_migration_is_transactional_and_one_time() {
        let mut conn = migration_db();
        let key = [7u8; 32];
        insert_message(&conn, "plain", "hello");

        migrate_plaintext_messages_with_key(&mut conn, &key).unwrap();
        let encrypted = stored_content(&conn, "plain");
        assert!(crypto::is_encrypted_envelope(&encrypted));
        assert_eq!(crypto::decrypt_with_key(&encrypted, &key).unwrap(), "hello");

        migrate_plaintext_messages_with_key(&mut conn, &[9u8; 32]).unwrap();
        assert_eq!(stored_content(&conn, "plain"), encrypted);
    }

    #[test]
    fn authentication_failure_never_reencrypts_ciphertext() {
        let mut conn = migration_db();
        let ciphertext = crypto::encrypt_with_key("secret", &[1u8; 32]).unwrap();
        insert_message(&conn, "cipher", &ciphertext);

        migrate_plaintext_messages_with_key(&mut conn, &[2u8; 32]).unwrap();

        assert_eq!(stored_content(&conn, "cipher"), ciphertext);
        assert!(crypto::decrypt_with_key(&ciphertext, &[2u8; 32]).is_err());
    }

    #[test]
    fn oversized_legacy_payload_is_never_amplified() {
        let mut conn = migration_db();
        let oversized = "x".repeat(MAX_MESSAGE_PLAINTEXT_BYTES + 1);
        insert_message(&conn, "oversized", &oversized);

        migrate_plaintext_messages_with_key(&mut conn, &[3u8; 32]).unwrap();

        assert_eq!(stored_content(&conn, "oversized").len(), oversized.len());
    }
}
