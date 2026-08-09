//! Local AI agent activity log (T045b): append-only JSONL store per agent
//! session under `<project>/.ok/activity/<session-id>.jsonl`. Local-only by
//! design (no backend): the bundled skills/agents pipeline and local document
//! actions append events; the right-panel Activity view reads them.

use std::fs;
use std::path::{Path, PathBuf};

use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};

const ACTIVITY_DIR: &str = ".ok/activity";
const RETENTION_DAYS: i64 = 90;
const RETENTION_MAX_BYTES: u64 = 100 * 1024 * 1024; // 100 MB across the log dir

#[derive(Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ActivityEventInput {
    pub session_id: String,
    pub agent: String,
    pub kind: String,
    pub summary: String,
    #[serde(default)]
    pub paths: Vec<String>,
    #[serde(default)]
    pub meta: serde_json::Value,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ActivityEvent {
    pub ts: String,
    pub session_id: String,
    pub agent: String,
    pub kind: String,
    pub summary: String,
    pub paths: Vec<String>,
    pub meta: serde_json::Value,
}

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ActivitySessionSummary {
    pub session_id: String,
    pub agent: String,
    pub started_at: Option<String>,
    pub last_event_at: Option<String>,
    pub event_count: u64,
    pub size_bytes: u64,
}

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ActivitySessionPage {
    pub session_id: String,
    pub events: Vec<ActivityEvent>,
    pub offset: u64,
    pub limit: u64,
    pub total: u64,
}

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ActivityPruneReport {
    pub removed_sessions: u64,
    pub freed_bytes: u64,
}

const VALID_KINDS: [&str; 5] = ["prompt", "edit", "command", "note", "error"];

/// Session ids become file names — restrict to a safe charset so a hostile
/// or buggy caller cannot escape the activity directory.
fn sanitize_session_id(session_id: &str) -> Result<String, String> {
    let trimmed = session_id.trim();
    if trimmed.is_empty() {
        return Err("sessionId is empty.".to_string());
    }
    if trimmed.len() > 128 {
        return Err("sessionId is too long (max 128).".to_string());
    }
    if !trimmed
        .chars()
        .all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_')
    {
        return Err("sessionId may only contain letters, digits, '-' and '_'.".to_string());
    }
    Ok(trimmed.to_string())
}

fn activity_dir(root: &Path) -> PathBuf {
    root.join(ACTIVITY_DIR)
}

fn session_file(root: &Path, session_id: &str) -> Result<PathBuf, String> {
    let safe = sanitize_session_id(session_id)?;
    Ok(activity_dir(root).join(format!("{safe}.jsonl")))
}

pub fn append_event(root: &Path, input: ActivityEventInput) -> Result<ActivityEvent, String> {
    if !VALID_KINDS.contains(&input.kind.as_str()) {
        return Err(format!(
            "Invalid activity kind '{}'; expected one of {}.",
            input.kind,
            VALID_KINDS.join(", ")
        ));
    }
    let path = session_file(root, &input.session_id)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let event = ActivityEvent {
        ts: Utc::now().to_rfc3339(),
        session_id: sanitize_session_id(&input.session_id)?,
        agent: input.agent,
        kind: input.kind,
        summary: input.summary,
        paths: input.paths,
        meta: input.meta,
    };
    let mut line = serde_json::to_string(&event).map_err(|e| e.to_string())?;
    line.push('\n');
    use std::io::Write;
    let mut file = fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(&path)
        .map_err(|e| format!("Failed to open activity log {}: {e}", path.display()))?;
    file.write_all(line.as_bytes()).map_err(|e| e.to_string())?;
    Ok(event)
}

fn read_session_lines(root: &Path, session_id: &str) -> Result<Vec<ActivityEvent>, String> {
    let path = session_file(root, session_id)?;
    if !path.exists() {
        return Ok(Vec::new());
    }
    let raw = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let line_count = raw.lines().count();
    let mut events = Vec::new();
    for (index, line) in raw.lines().enumerate() {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }
        match serde_json::from_str::<ActivityEvent>(trimmed) {
            Ok(event) => events.push(event),
            Err(_) => {
                // Tolerate a torn final line (crash mid-append) but not
                // mid-file corruption.
                if index + 1 < line_count {
                    return Err(format!(
                        "Corrupt activity log line {} in {}",
                        index + 1,
                        path.display()
                    ));
                }
            }
        }
    }
    Ok(events)
}

pub fn list_sessions(root: &Path) -> Result<Vec<ActivitySessionSummary>, String> {
    let dir = activity_dir(root);
    if !dir.is_dir() {
        return Ok(Vec::new());
    }
    let mut summaries = Vec::new();
    for entry in fs::read_dir(&dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) != Some("jsonl") {
            continue;
        }
        let session_id = path
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or_default()
            .to_string();
        let size_bytes = entry.metadata().map(|m| m.len()).unwrap_or(0);
        let events = read_session_lines(root, &session_id).unwrap_or_default();
        let started_at = events.first().map(|e| e.ts.clone());
        let last_event_at = events.last().map(|e| e.ts.clone());
        let agent = events
            .last()
            .map(|e| e.agent.clone())
            .unwrap_or_else(|| "unknown".to_string());
        summaries.push(ActivitySessionSummary {
            session_id,
            agent,
            started_at,
            last_event_at,
            event_count: events.len() as u64,
            size_bytes,
        });
    }
    // Most recent first.
    summaries.sort_by(|a, b| b.last_event_at.cmp(&a.last_event_at));
    Ok(summaries)
}

pub fn read_session(
    root: &Path,
    session_id: &str,
    offset: u64,
    limit: u64,
) -> Result<ActivitySessionPage, String> {
    let events = read_session_lines(root, session_id)?;
    let total = events.len() as u64;
    let limit = limit.clamp(1, 500);
    let page: Vec<ActivityEvent> = events
        .into_iter()
        .skip(offset as usize)
        .take(limit as usize)
        .collect();
    Ok(ActivitySessionPage {
        session_id: sanitize_session_id(session_id)?,
        events: page,
        offset,
        limit,
        total,
    })
}

pub fn prune(root: &Path) -> Result<ActivityPruneReport, String> {
    let dir = activity_dir(root);
    if !dir.is_dir() {
        return Ok(ActivityPruneReport {
            removed_sessions: 0,
            freed_bytes: 0,
        });
    }
    let cutoff = Utc::now() - Duration::days(RETENTION_DAYS);
    let mut files: Vec<(PathBuf, u64, Option<DateTime<Utc>>)> = Vec::new();
    for entry in fs::read_dir(&dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) != Some("jsonl") {
            continue;
        }
        let size = entry.metadata().map(|m| m.len()).unwrap_or(0);
        let mtime = entry
            .metadata()
            .ok()
            .and_then(|m| m.modified().ok())
            .map(DateTime::<Utc>::from);
        files.push((path, size, mtime));
    }

    let mut removed_sessions = 0u64;
    let mut freed_bytes = 0u64;
    let mut survivors: Vec<(PathBuf, u64, Option<DateTime<Utc>>)> = Vec::new();
    for (path, size, mtime) in files {
        let aged_out = mtime.map(|m| m < cutoff).unwrap_or(false);
        if aged_out {
            fs::remove_file(&path).map_err(|e| e.to_string())?;
            removed_sessions += 1;
            freed_bytes += size;
        } else {
            survivors.push((path, size, mtime));
        }
    }

    // Size cap — drop oldest-modified until under the cap.
    let mut total: u64 = survivors.iter().map(|(_, size, _)| *size).sum();
    if total > RETENTION_MAX_BYTES {
        survivors.sort_by(|a, b| a.2.cmp(&b.2));
        for (path, size, _) in &survivors {
            if total <= RETENTION_MAX_BYTES {
                break;
            }
            fs::remove_file(path).map_err(|e| e.to_string())?;
            removed_sessions += 1;
            freed_bytes += size;
            total = total.saturating_sub(*size);
        }
    }

    Ok(ActivityPruneReport {
        removed_sessions,
        freed_bytes,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;

    struct TestRoot(PathBuf);

    impl TestRoot {
        fn new(tag: &str) -> Self {
            let stamp = chrono::Utc::now().timestamp_nanos_opt().unwrap_or(0);
            let root = env::temp_dir().join(format!("fractalknow-activity-{tag}-{stamp}"));
            let _ = fs::remove_dir_all(&root);
            fs::create_dir_all(&root).unwrap();
            Self(root)
        }
    }

    impl Drop for TestRoot {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.0);
        }
    }

    fn input(session: &str, kind: &str, summary: &str) -> ActivityEventInput {
        ActivityEventInput {
            session_id: session.to_string(),
            agent: "test-agent".to_string(),
            kind: kind.to_string(),
            summary: summary.to_string(),
            paths: vec!["/content/Doc.md".to_string()],
            meta: serde_json::json!({}),
        }
    }

    #[test]
    fn append_and_read_round_trip() {
        let root = TestRoot::new("roundtrip");
        append_event(&root.0, input("s1", "prompt", "first")).unwrap();
        append_event(&root.0, input("s1", "edit", "second")).unwrap();
        let page = read_session(&root.0, "s1", 0, 50).unwrap();
        assert_eq!(page.total, 2);
        assert_eq!(page.events[0].summary, "first");
        assert_eq!(page.events[1].kind, "edit");
    }

    #[test]
    fn read_is_paged() {
        let root = TestRoot::new("paged");
        for i in 0..10 {
            append_event(&root.0, input("s1", "note", &format!("event {i}"))).unwrap();
        }
        let page = read_session(&root.0, "s1", 4, 3).unwrap();
        assert_eq!(page.total, 10);
        assert_eq!(page.events.len(), 3);
        assert_eq!(page.events[0].summary, "event 4");
    }

    #[test]
    fn list_sessions_summarizes_newest_first() {
        let root = TestRoot::new("list");
        append_event(&root.0, input("older", "prompt", "a")).unwrap();
        std::thread::sleep(std::time::Duration::from_millis(5));
        append_event(&root.0, input("newer", "prompt", "b")).unwrap();
        let sessions = list_sessions(&root.0).unwrap();
        assert_eq!(sessions.len(), 2);
        assert_eq!(sessions[0].session_id, "newer");
        assert_eq!(sessions[1].event_count, 1);
        assert_eq!(sessions[0].agent, "test-agent");
    }

    #[test]
    fn rejects_unsafe_session_ids_and_kinds() {
        let root = TestRoot::new("unsafe");
        assert!(append_event(&root.0, input("../escape", "note", "x")).is_err());
        assert!(append_event(&root.0, input("a/b", "note", "x")).is_err());
        assert!(append_event(&root.0, input("", "note", "x")).is_err());
        assert!(append_event(&root.0, input("s1", "shellcode", "x")).is_err());
        assert!(!root.0.join(".ok/activity").exists() || list_sessions(&root.0).unwrap().is_empty());
    }

    #[test]
    fn prune_removes_aged_sessions() {
        let root = TestRoot::new("prune");
        append_event(&root.0, input("old", "note", "ancient")).unwrap();
        let file = root.0.join(".ok/activity/old.jsonl");
        // Backdate the file beyond the retention window.
        let aged = std::time::SystemTime::now() - std::time::Duration::from_secs(100 * 24 * 3600);
        let f = fs::File::options().write(true).open(&file).unwrap();
        f.set_modified(aged).unwrap();
        drop(f);
        let report = prune(&root.0).unwrap();
        assert_eq!(report.removed_sessions, 1);
        assert!(!file.exists());
    }
}
