//! Deep link routing. Uses `tauri-plugin-deep-link` to register the
//! supported URL schemes and emit `ok:deep-link` events whenever the
//! application is launched with a URL or the OS asks the running app to
//! open a URL.

use serde::Serialize;
use tauri::Emitter;

use crate::platform;

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DeepLinkEvent {
    pub url: String,
    pub received_at: String,
}

pub fn is_supported(url: &str) -> bool {
    url.starts_with("fractalknow://")
        || url.starts_with("openknowledge://")
        || url.starts_with("ok://")
}

pub fn extract_deep_link_from_args(args: impl IntoIterator<Item = String>) -> Option<String> {
    args.into_iter().find(|arg| is_supported(arg))
}

/// Convenience helper that emits an `ok:deep-link` event from anywhere in
/// the app. Other modules can call this when they receive a URL through a
/// non-plugin code path.
#[allow(dead_code)]
pub fn emit_deep_link<R: tauri::Runtime>(app: &tauri::AppHandle<R>, url: String) {
    let event = DeepLinkEvent {
        url,
        received_at: chrono::Utc::now().to_rfc3339(),
    };
    let _ = app.emit("ok:deep-link", event);
}

/// Detects a supported URL scheme on this platform by querying the
/// operating system's protocol handler registry.
pub fn detect_scheme(scheme: &str) -> super::ProtocolDetection {
    if !is_valid_scheme(scheme) {
        return super::ProtocolDetection {
            installed: false,
            display_name: None,
        };
    }
    platform::detect_protocol_impl(scheme)
}

pub fn is_valid_scheme(scheme: &str) -> bool {
    let mut chars = scheme.chars();
    let Some(first) = chars.next() else {
        return false;
    };
    if !first.is_ascii_alphabetic() {
        return false;
    }
    chars.all(|ch| ch.is_ascii_alphanumeric() || matches!(ch, '+' | '-' | '.'))
}
