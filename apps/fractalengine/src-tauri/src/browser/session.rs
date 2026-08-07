//! Versioned, disk-backed browser session snapshots.
//!
//! This deliberately stores only the minimum required to recreate tabs.  Native
//! webview labels, titles, navigation state, credentials and viewport geometry
//! are process-local details and must never be persisted.

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use tauri::{AppHandle, Manager};

pub const SESSION_VERSION: u32 = 1;
const SESSION_FILE: &str = "browser-session.json";
const MAX_WINDOWS: usize = 20;
const MAX_TABS_PER_WINDOW: usize = 100;

#[derive(Clone, Debug, Default, Deserialize, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BrowserSession {
    pub version: u32,
    #[serde(default)]
    pub restore_on_startup: bool,
    pub windows: Vec<PersistedBrowserWindow>,
}

#[derive(Clone, Debug, Default, Deserialize, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PersistedBrowserWindow {
    pub tabs: Vec<PersistedBrowserTab>,
    pub active_tab_index: usize,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PersistedBrowserTab {
    pub url: String,
}

/// App-managed session state. Saved windows are consumed one at a time so a
/// deliberate second browser window does not duplicate a previous session.
pub struct BrowserSessionStore {
    session: Mutex<BrowserSession>,
}

impl Default for BrowserSessionStore {
    fn default() -> Self {
        Self {
            session: Mutex::new(BrowserSession::empty()),
        }
    }
}

impl BrowserSessionStore {
    pub fn initialize(&self, app: &AppHandle) -> Result<(), String> {
        *self
            .session
            .lock()
            .map_err(|_| "Browser session lock poisoned")? = load(app)?;
        Ok(())
    }

    pub fn restore_enabled(&self) -> Result<bool, String> {
        Ok(self
            .session
            .lock()
            .map_err(|_| "Browser session lock poisoned")?
            .restore_on_startup)
    }

    pub fn set_restore_enabled(&self, app: &AppHandle, enabled: bool) -> Result<(), String> {
        let snapshot = {
            let mut session = self
                .session
                .lock()
                .map_err(|_| "Browser session lock poisoned")?;
            session.restore_on_startup = enabled;
            session.clone()
        };
        save(app, &snapshot)
    }

    pub fn take_window_to_restore(&self) -> Result<Option<PersistedBrowserWindow>, String> {
        let mut session = self
            .session
            .lock()
            .map_err(|_| "Browser session lock poisoned")?;
        if !session.restore_on_startup || session.windows.is_empty() {
            return Ok(None);
        }
        Ok(Some(session.windows.remove(0)))
    }

    pub fn replace_windows(
        &self,
        app: &AppHandle,
        windows: Vec<PersistedBrowserWindow>,
    ) -> Result<(), String> {
        let snapshot = {
            let mut session = self
                .session
                .lock()
                .map_err(|_| "Browser session lock poisoned")?;
            session.windows = windows;
            session.clone()
        };
        save(app, &snapshot)
    }
}

impl BrowserSession {
    pub fn empty() -> Self {
        Self {
            version: SESSION_VERSION,
            restore_on_startup: false,
            windows: Vec::new(),
        }
    }

    /// Treat persisted data as untrusted input. Unsupported versions and invalid
    /// URLs are discarded rather than being fed into a newly-created webview.
    pub fn sanitize(self) -> Self {
        if self.version != SESSION_VERSION {
            return Self::empty();
        }

        let windows = self
            .windows
            .into_iter()
            .take(MAX_WINDOWS)
            .filter_map(|window| {
                let tabs: Vec<_> = window
                    .tabs
                    .into_iter()
                    .take(MAX_TABS_PER_WINDOW)
                    .filter_map(|tab| sanitize_url(&tab.url).map(|url| PersistedBrowserTab { url }))
                    .collect();
                if tabs.is_empty() {
                    return None;
                }
                Some(PersistedBrowserWindow {
                    active_tab_index: window.active_tab_index.min(tabs.len() - 1),
                    tabs,
                })
            })
            .collect();
        Self {
            version: SESSION_VERSION,
            restore_on_startup: self.restore_on_startup,
            windows,
        }
    }
}

pub fn sanitize_url(value: &str) -> Option<String> {
    let mut url = tauri::Url::parse(value).ok()?;
    if !matches!(url.scheme(), "http" | "https") || url.host_str().is_none() {
        return None;
    }
    // Credentials and fragments can contain secrets and do not alter the document
    // that needs restoring. Query parameters are retained for ordinary app routes.
    let _ = url.set_username("");
    let _ = url.set_password(None);
    url.set_fragment(None);
    Some(url.to_string())
}

pub fn session_path(app: &AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_data_dir()
        .map(|dir| dir.join(SESSION_FILE))
        .map_err(|error| error.to_string())
}

pub fn load(app: &AppHandle) -> Result<BrowserSession, String> {
    load_from_path(&session_path(app)?)
}

pub fn save(app: &AppHandle, session: &BrowserSession) -> Result<(), String> {
    save_to_path(&session_path(app)?, session)
}

pub fn load_from_path(path: &Path) -> Result<BrowserSession, String> {
    match fs::read_to_string(path) {
        Ok(content) => Ok(serde_json::from_str::<BrowserSession>(&content)
            .unwrap_or_else(|_| BrowserSession::empty())
            .sanitize()),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(BrowserSession::empty()),
        Err(error) => Err(error.to_string()),
    }
}

pub fn save_to_path(path: &Path, session: &BrowserSession) -> Result<(), String> {
    let session = session.clone().sanitize();
    let parent = path
        .parent()
        .ok_or_else(|| "Browser session file has no parent directory".to_string())?;
    fs::create_dir_all(parent).map_err(|error| error.to_string())?;
    let temp = path.with_extension("json.tmp");
    let json = serde_json::to_vec_pretty(&session).map_err(|error| error.to_string())?;
    fs::write(&temp, json).map_err(|error| error.to_string())?;
    fs::rename(&temp, path).map_err(|error| error.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::{SystemTime, UNIX_EPOCH};

    fn fixture_path(name: &str) -> PathBuf {
        let unique = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("clock")
            .as_nanos();
        std::env::temp_dir().join(format!("fractalengine-{name}-{unique}.json"))
    }

    #[test]
    fn sanitization_drops_unsupported_urls_and_secrets() {
        let session = BrowserSession {
            version: SESSION_VERSION,
            restore_on_startup: false,
            windows: vec![PersistedBrowserWindow {
                tabs: vec![
                    PersistedBrowserTab {
                        url: "https://alice:secret@example.com/path#token".into(),
                    },
                    PersistedBrowserTab {
                        url: "file:///private/secret".into(),
                    },
                ],
                active_tab_index: 9,
            }],
        }
        .sanitize();
        assert_eq!(session.windows[0].tabs[0].url, "https://example.com/path");
        assert_eq!(session.windows[0].active_tab_index, 0);
    }

    #[test]
    fn malformed_or_future_schema_never_restores() {
        let path = fixture_path("malformed-session");
        fs::write(&path, "not json").expect("write fixture");
        assert_eq!(
            load_from_path(&path).expect("load"),
            BrowserSession::empty()
        );
        fs::write(&path, r#"{\"version\":99,\"windows\":[]}"#).expect("write fixture");
        assert_eq!(
            load_from_path(&path).expect("load"),
            BrowserSession::empty()
        );
        let _ = fs::remove_file(path);
    }

    #[test]
    fn save_round_trip_is_versioned_and_sanitized() {
        let path = fixture_path("session-round-trip");
        let session = BrowserSession {
            version: SESSION_VERSION,
            restore_on_startup: false,
            windows: vec![PersistedBrowserWindow {
                tabs: vec![PersistedBrowserTab {
                    url: "https://example.com/a#b".into(),
                }],
                active_tab_index: 0,
            }],
        };
        save_to_path(&path, &session).expect("save");
        assert_eq!(
            load_from_path(&path).expect("load").windows[0].tabs[0].url,
            "https://example.com/a"
        );
        let _ = fs::remove_file(path);
    }
}
