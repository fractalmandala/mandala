use std::fs;
use std::path::Path;
use std::time::{SystemTime, UNIX_EPOCH};

use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tauri::{AppHandle, Emitter};

use crate::{authorized_path, AuthorizedPaths};

fn now() -> String {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|time| time.as_millis().to_string())
        .unwrap_or_default()
}

fn open_db(project_path: &str) -> Result<Connection, String> {
    let dir = Path::new(project_path).join(".fractal");
    fs::create_dir_all(&dir).map_err(|error| error.to_string())?;
    let conn = Connection::open(dir.join("annotations.db")).map_err(|error| error.to_string())?;
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS annotations (
			id TEXT PRIMARY KEY,
			author TEXT NOT NULL,
			snapshot TEXT NOT NULL,
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL
		);
		CREATE INDEX IF NOT EXISTS idx_annotations_updated_at ON annotations(updated_at DESC);",
    )
    .map_err(|error| error.to_string())?;
    Ok(conn)
}

fn root(authorized: &AuthorizedPaths, project_path: &str) -> Result<String, String> {
    let project = authorized_path(authorized, Path::new(project_path), false)?;
    Ok(project.to_string_lossy().into_owned())
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnnotationInput {
    pub id: String,
    pub author: String,
    pub snapshot: Value,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AnnotationRecord {
    pub id: String,
    pub author: String,
    pub snapshot: Value,
    pub created_at: String,
    pub updated_at: String,
}

fn row_to_annotation(row: &rusqlite::Row<'_>) -> rusqlite::Result<AnnotationRecord> {
    let snapshot: String = row.get(2)?;
    Ok(AnnotationRecord {
        id: row.get(0)?,
        author: row.get(1)?,
        snapshot: serde_json::from_str(&snapshot).unwrap_or(Value::Null),
        created_at: row.get(3)?,
        updated_at: row.get(4)?,
    })
}

#[tauri::command]
pub async fn annotations_list(
    project_path: String,
    authorized: tauri::State<'_, AuthorizedPaths>,
) -> Result<Vec<AnnotationRecord>, String> {
    let root = root(&authorized, &project_path)?;
    tauri::async_runtime::spawn_blocking(move || {
		let conn = open_db(&root)?;
		let mut statement = conn
			.prepare("SELECT id, author, snapshot, created_at, updated_at FROM annotations ORDER BY updated_at DESC")
			.map_err(|error| error.to_string())?;
		let rows = statement
			.query_map([], row_to_annotation)
			.map_err(|error| error.to_string())?;
		rows.collect::<Result<Vec<_>, _>>().map_err(|error| error.to_string())
	})
	.await
	.map_err(|error| error.to_string())?
}

#[tauri::command]
pub async fn annotations_upsert(
    app: AppHandle,
    project_path: String,
    authorized: tauri::State<'_, AuthorizedPaths>,
    annotation: AnnotationInput,
) -> Result<AnnotationRecord, String> {
    let root = root(&authorized, &project_path)?;
    let record = tauri::async_runtime::spawn_blocking(move || {
		let conn = open_db(&root)?;
		let timestamp = now();
		let snapshot = serde_json::to_string(&annotation.snapshot).map_err(|error| error.to_string())?;
		conn.execute(
			"INSERT INTO annotations (id, author, snapshot, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?4)
			 ON CONFLICT(id) DO UPDATE SET author = excluded.author, snapshot = excluded.snapshot, updated_at = excluded.updated_at",
			params![annotation.id, annotation.author, snapshot, timestamp],
		)
		.map_err(|error| error.to_string())?;
		conn.query_row(
			"SELECT id, author, snapshot, created_at, updated_at FROM annotations WHERE id = ?1",
			params![annotation.id],
			row_to_annotation,
		)
		.map_err(|error| error.to_string())
	})
	.await
	.map_err(|error| error.to_string())??;
    app.emit("annotations://changed", &record)
        .map_err(|error| error.to_string())?;
    Ok(record)
}

#[tauri::command]
pub async fn annotations_delete(
    app: AppHandle,
    project_path: String,
    authorized: tauri::State<'_, AuthorizedPaths>,
    id: String,
) -> Result<(), String> {
    let root = root(&authorized, &project_path)?;
    tauri::async_runtime::spawn_blocking(move || {
        let conn = open_db(&root)?;
        conn.execute("DELETE FROM annotations WHERE id = ?1", params![id])
            .map_err(|error| error.to_string())?;
        Ok::<(), String>(())
    })
    .await
    .map_err(|error| error.to_string())??;
    app.emit("annotations://changed", "deleted")
        .map_err(|error| error.to_string())?;
    Ok(())
}
