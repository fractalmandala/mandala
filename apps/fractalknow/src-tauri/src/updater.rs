//! Update status integration. Wraps `tauri-plugin-updater` so that every
//! state transition is surfaced through the `ok:update-status` event
//! channel and so the install-update command works as soon as the user
//! has a release published.

use std::sync::Arc;

use parking_lot::Mutex;
use serde::Serialize;
use tauri::{AppHandle, Emitter, Runtime};
use tauri_plugin_updater::UpdaterExt;

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct UpdateStatus {
    pub status: String,
    pub version: Option<String>,
    pub message: Option<String>,
    pub checked_at: String,
}

#[derive(Clone, Default)]
pub struct UpdaterState {
    latest: Arc<Mutex<Option<UpdateStatus>>>,
}

impl UpdaterState {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn current(&self) -> UpdateStatus {
        self.latest.lock().clone().unwrap_or_else(|| UpdateStatus {
            status: "idle".to_string(),
            version: None,
            message: Some("Updater has not been checked yet.".to_string()),
            checked_at: chrono::Utc::now().to_rfc3339(),
        })
    }

    pub fn set<R: Runtime>(&self, app: &AppHandle<R>, status: UpdateStatus) {
        *self.latest.lock() = Some(status.clone());
        let _ = app.emit("ok:update-status", status);
    }
}

pub async fn check<R: Runtime>(
    app: &AppHandle<R>,
    state: &UpdaterState,
) -> Result<UpdateStatus, String> {
    let updater = app.updater_builder().build().map_err(|e| e.to_string())?;
    match updater.check().await {
        Ok(Some(update)) => {
            let version = update.version.clone();
            let status = UpdateStatus {
                status: "available".to_string(),
                version: Some(version.clone()),
                message: Some(format!(
                    "Update {version} available. Click Install Update to apply it."
                )),
                checked_at: chrono::Utc::now().to_rfc3339(),
            };
            state.set(app, status.clone());
            Ok(status)
        }
        Ok(None) => {
            let status = UpdateStatus {
                status: "idle".to_string(),
                version: None,
                message: Some("No updates available.".to_string()),
                checked_at: chrono::Utc::now().to_rfc3339(),
            };
            state.set(app, status.clone());
            Ok(status)
        }
        Err(error) => {
            let status = UpdateStatus {
                status: "error".to_string(),
                version: None,
                message: Some(format!("Update check failed: {error}")),
                checked_at: chrono::Utc::now().to_rfc3339(),
            };
            state.set(app, status.clone());
            Ok(status)
        }
    }
}

pub async fn install<R: Runtime>(app: &AppHandle<R>) -> Result<(), String> {
    let updater = app.updater_builder().build().map_err(|e| e.to_string())?;
    match updater.check().await {
        Ok(Some(update)) => {
            let version = update.version.clone();
            update
                .download_and_install(|_, _| {}, || {})
                .await
                .map_err(|e| e.to_string())?;
            let status = UpdateStatus {
                status: "ready".to_string(),
                version: Some(version.clone()),
                message: Some(format!("Update {version} installed. Restart to apply.")),
                checked_at: chrono::Utc::now().to_rfc3339(),
            };
            let _ = app.emit("ok:update-status", status);
            Ok(())
        }
        Ok(None) => Err("No update is available to install.".to_string()),
        Err(error) => Err(error.to_string()),
    }
}
