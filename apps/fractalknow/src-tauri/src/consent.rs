//! Consent gate. The Rust side stores the user's consent decisions on
//! disk and emits `ok:consent-required` events when a consent-gated
//! feature is invoked without prior consent.

use std::collections::HashMap;
use std::fs;
use std::sync::Arc;

use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, Runtime};

use crate::paths;

pub type ConsentScope = String;

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
pub struct ConsentState {
    pub granted: HashMap<ConsentScope, bool>,
    pub updated_at: Option<String>,
}

#[derive(Clone, Default)]
pub struct ConsentRegistry {
    inner: Arc<RwLock<ConsentState>>,
}

impl ConsentRegistry {
    pub fn load<R: Runtime>(app: &AppHandle<R>) -> Self {
        let path = paths::consent_state_path(app).ok();
        let state = path
            .and_then(|p| fs::read_to_string(p).ok())
            .and_then(|body| serde_json::from_str::<ConsentState>(&body).ok())
            .unwrap_or_default();
        Self {
            inner: Arc::new(RwLock::new(state)),
        }
    }

    pub fn is_granted(&self, scope: &str) -> bool {
        self.inner
            .read()
            .granted
            .get(scope)
            .copied()
            .unwrap_or(false)
    }

    pub fn set_granted<R: Runtime>(&self, app: &AppHandle<R>, scope: &str, granted: bool) {
        {
            let mut state = self.inner.write();
            state.granted.insert(scope.to_string(), granted);
            state.updated_at = Some(chrono::Utc::now().to_rfc3339());
        }
        persist(app, &self.inner.read());
    }

    pub fn requires<R: Runtime>(&self, app: &AppHandle<R>, scope: &str, message: &str) -> bool {
        if self.is_granted(scope) {
            return false;
        }
        let event = crate::ConsentRequiredEvent {
            scope: scope.to_string(),
            message: message.to_string(),
            required_at: chrono::Utc::now().to_rfc3339(),
        };
        let _ = app.emit("ok:consent-required", event);
        true
    }

    pub fn snapshot(&self) -> ConsentState {
        self.inner.read().clone()
    }
}

fn persist<R: Runtime>(app: &AppHandle<R>, state: &ConsentState) {
    if let Ok(path) = paths::consent_state_path(app) {
        if let Some(parent) = path.parent() {
            let _ = fs::create_dir_all(parent);
        }
        if let Ok(body) = serde_json::to_string_pretty(state) {
            let _ = fs::write(path, body);
        }
    }
}
