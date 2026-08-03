//! SQLite persistence for the media bank and projects.
//! Schema is created on first run; the DB lives under the app's app-data dir.

use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MediaRow {
    pub id: String,
    pub kind: String, // "video" | "image" | "audio"
    pub filename: String,
    pub path: String,
    pub imported_at: i64, // epoch millis
    pub duration: Option<f64>,
    pub width: Option<i64>,
    pub height: Option<i64>,
    pub tags: Vec<String>,
    pub notes: String,
    pub thumb_path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectRow {
    pub id: String,
    pub name: String,
    pub data: String, // versioned ProjectData JSON
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SettingRow {
    pub key: String,
    pub value: String,
    pub updated_at: i64,
}

pub struct Db {
    conn: Connection,
}

fn now_millis() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}

impl Db {
    pub fn open(path: &std::path::Path) -> Result<Self, String> {
        let conn = Connection::open(path).map_err(|e| format!("Cannot open database: {e}"))?;
        conn.execute_batch(
            "PRAGMA journal_mode = WAL;
             CREATE TABLE IF NOT EXISTS media (
               id TEXT PRIMARY KEY,
               kind TEXT NOT NULL,
               filename TEXT NOT NULL,
               path TEXT NOT NULL,
               imported_at INTEGER NOT NULL,
               duration REAL,
               width INTEGER,
               height INTEGER,
               tags TEXT NOT NULL DEFAULT '[]',
               notes TEXT NOT NULL DEFAULT '',
               thumb_path TEXT
             );
             CREATE TABLE IF NOT EXISTS projects (
               id TEXT PRIMARY KEY,
               name TEXT NOT NULL,
               data TEXT NOT NULL,
               created_at INTEGER NOT NULL,
               updated_at INTEGER NOT NULL
             );
             CREATE TABLE IF NOT EXISTS settings (
               key TEXT PRIMARY KEY,
               value TEXT NOT NULL,
               updated_at INTEGER NOT NULL
             );",
        )
        .map_err(|e| format!("Cannot initialise database: {e}"))?;
        Ok(Self { conn })
    }

    // ------------- media -------------

    pub fn insert_media(&self, m: &MediaRow) -> Result<(), String> {
        self.conn
            .execute(
                "INSERT INTO media (id, kind, filename, path, imported_at, duration, width, height, tags, notes, thumb_path)
                 VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11)",
                params![
                    m.id,
                    m.kind,
                    m.filename,
                    m.path,
                    m.imported_at,
                    m.duration,
                    m.width,
                    m.height,
                    serde_json::to_string(&m.tags).unwrap_or_else(|_| "[]".into()),
                    m.notes,
                    m.thumb_path
                ],
            )
            .map_err(|e| format!("Cannot save media: {e}"))?;
        Ok(())
    }

    fn row_to_media(row: &rusqlite::Row) -> rusqlite::Result<MediaRow> {
        let tags_json: String = row.get(8)?;
        Ok(MediaRow {
            id: row.get(0)?,
            kind: row.get(1)?,
            filename: row.get(2)?,
            path: row.get(3)?,
            imported_at: row.get(4)?,
            duration: row.get(5)?,
            width: row.get(6)?,
            height: row.get(7)?,
            tags: serde_json::from_str(&tags_json).unwrap_or_default(),
            notes: row.get(9)?,
            thumb_path: row.get(10)?,
        })
    }

    const MEDIA_COLS: &'static str =
        "id, kind, filename, path, imported_at, duration, width, height, tags, notes, thumb_path";

    pub fn list_media(&self) -> Result<Vec<MediaRow>, String> {
        let mut stmt = self
            .conn
            .prepare(&format!(
                "SELECT {} FROM media ORDER BY imported_at DESC",
                Self::MEDIA_COLS
            ))
            .map_err(|e| e.to_string())?;
        let rows = stmt
            .query_map([], Self::row_to_media)
            .map_err(|e| e.to_string())?
            .collect::<Result<Vec<_>, _>>()
            .map_err(|e| e.to_string())?;
        Ok(rows)
    }

    pub fn get_media(&self, id: &str) -> Result<MediaRow, String> {
        self.conn
            .query_row(
                &format!("SELECT {} FROM media WHERE id = ?1", Self::MEDIA_COLS),
                params![id],
                Self::row_to_media,
            )
            .map_err(|_| "That media item no longer exists in the bank.".to_string())
    }

    pub fn rename_media(&self, id: &str, name: &str) -> Result<(), String> {
        self.conn
            .execute(
                "UPDATE media SET filename = ?2 WHERE id = ?1",
                params![id, name],
            )
            .map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn set_tags(&self, id: &str, tags: &[String]) -> Result<(), String> {
        let json = serde_json::to_string(tags).map_err(|e| e.to_string())?;
        self.conn
            .execute(
                "UPDATE media SET tags = ?2 WHERE id = ?1",
                params![id, json],
            )
            .map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn set_notes(&self, id: &str, notes: &str) -> Result<(), String> {
        self.conn
            .execute(
                "UPDATE media SET notes = ?2 WHERE id = ?1",
                params![id, notes],
            )
            .map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn delete_media(&self, id: &str) -> Result<MediaRow, String> {
        let row = self.get_media(id)?;
        self.conn
            .execute("DELETE FROM media WHERE id = ?1", params![id])
            .map_err(|e| e.to_string())?;
        Ok(row)
    }

    // ------------- projects -------------

    pub fn list_projects(&self) -> Result<Vec<ProjectRow>, String> {
        let mut stmt = self
            .conn
            .prepare("SELECT id, name, data, created_at, updated_at FROM projects ORDER BY updated_at DESC")
            .map_err(|e| e.to_string())?;
        let rows = stmt
            .query_map([], |r| {
                Ok(ProjectRow {
                    id: r.get(0)?,
                    name: r.get(1)?,
                    data: r.get(2)?,
                    created_at: r.get(3)?,
                    updated_at: r.get(4)?,
                })
            })
            .map_err(|e| e.to_string())?
            .collect::<Result<Vec<_>, _>>()
            .map_err(|e| e.to_string())?;
        Ok(rows)
    }

    pub fn upsert_project(&self, id: &str, name: &str, data: &str) -> Result<ProjectRow, String> {
        let now = now_millis();
        let existing: Option<i64> = self
            .conn
            .query_row(
                "SELECT created_at FROM projects WHERE id = ?1",
                params![id],
                |r| r.get(0),
            )
            .ok();
        let created = existing.unwrap_or(now);
        self.conn
            .execute(
                "INSERT INTO projects (id, name, data, created_at, updated_at) VALUES (?1,?2,?3,?4,?5)
                 ON CONFLICT(id) DO UPDATE SET name=?2, data=?3, updated_at=?5",
                params![id, name, data, created, now],
            )
            .map_err(|e| format!("Cannot save project: {e}"))?;
        Ok(ProjectRow {
            id: id.to_string(),
            name: name.to_string(),
            data: data.to_string(),
            created_at: created,
            updated_at: now,
        })
    }

    pub fn get_project(&self, id: &str) -> Result<ProjectRow, String> {
        self.conn
            .query_row(
                "SELECT id, name, data, created_at, updated_at FROM projects WHERE id = ?1",
                params![id],
                |r| {
                    Ok(ProjectRow {
                        id: r.get(0)?,
                        name: r.get(1)?,
                        data: r.get(2)?,
                        created_at: r.get(3)?,
                        updated_at: r.get(4)?,
                    })
                },
            )
            .map_err(|_| "Project not found.".to_string())
    }

    pub fn delete_project(&self, id: &str) -> Result<(), String> {
        self.conn
            .execute("DELETE FROM projects WHERE id = ?1", params![id])
            .map_err(|e| e.to_string())?;
        Ok(())
    }

    // ------------- settings -------------

    pub fn get_setting(&self, key: &str) -> Result<Option<SettingRow>, String> {
        let row = self
            .conn
            .query_row(
                "SELECT key, value, updated_at FROM settings WHERE key = ?1",
                params![key],
                |r| {
                    Ok(SettingRow {
                        key: r.get(0)?,
                        value: r.get(1)?,
                        updated_at: r.get(2)?,
                    })
                },
            )
            .ok();
        Ok(row)
    }

    pub fn upsert_setting(&self, key: &str, value: &str) -> Result<SettingRow, String> {
        let now = now_millis();
        self.conn
            .execute(
                "INSERT INTO settings (key, value, updated_at) VALUES (?1,?2,?3)
                 ON CONFLICT(key) DO UPDATE SET value=?2, updated_at=?3",
                params![key, value, now],
            )
            .map_err(|e| format!("Cannot save settings: {e}"))?;
        Ok(SettingRow {
            key: key.to_string(),
            value: value.to_string(),
            updated_at: now,
        })
    }

}

pub fn now() -> i64 {
    now_millis()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn settings_roundtrip_and_update() {
        let dir = tempfile::tempdir().unwrap();
        let db = Db::open(&dir.path().join("test.db")).unwrap();
        assert!(db.get_setting("app_settings").unwrap().is_none());

        let saved = db.upsert_setting("app_settings", "{\"version\":1}").unwrap();
        assert_eq!(saved.key, "app_settings");
        assert_eq!(saved.value, "{\"version\":1}");

        let loaded = db.get_setting("app_settings").unwrap().unwrap();
        assert_eq!(loaded.value, "{\"version\":1}");

        db.upsert_setting("app_settings", "{\"version\":1,\"updated\":true}")
            .unwrap();
        let updated = db.get_setting("app_settings").unwrap().unwrap();
        assert_eq!(updated.value, "{\"version\":1,\"updated\":true}");
    }
}
