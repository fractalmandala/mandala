//! macOS-only bridge to Apple's on-device Speech framework.
//!
//! The Swift helper owns AVAudioEngine and SFSpeechRecognizer. Rust owns its lifecycle and
//! forwards only transcript/state deltas to the webview; microphone audio never crosses IPC.

use serde::{Deserialize, Serialize};
use std::io::{BufRead, BufReader, Write};
use std::process::{Child, Command, Stdio};
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager};

#[derive(Default)]
pub struct DictationState(pub Mutex<Option<Child>>);

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DictationEvent {
    pub r#type: String,
    #[serde(default)]
    pub phase: Option<String>,
    #[serde(default)]
    pub text: Option<String>,
    #[serde(default)]
    pub code: Option<String>,
    #[serde(default)]
    pub detail: Option<String>,
}

#[cfg(target_os = "macos")]
fn bridge_path(app: &AppHandle) -> Result<std::path::PathBuf, String> {
    use std::fs;
    use std::os::unix::fs::PermissionsExt;

    let dir = app
        .path()
        .app_data_dir()
        .map_err(|error| error.to_string())?
        .join("native");
    fs::create_dir_all(&dir).map_err(|error| error.to_string())?;
    let path = dir.join("dictation-bridge");
    let bytes = include_bytes!(concat!(env!("OUT_DIR"), "/fractalengine-dictation-bridge"));
    if fs::read(&path).ok().as_deref() != Some(bytes) {
        fs::write(&path, bytes).map_err(|error| error.to_string())?;
        fs::set_permissions(&path, fs::Permissions::from_mode(0o700))
            .map_err(|error| error.to_string())?;
    }
    Ok(path)
}

#[cfg(target_os = "macos")]
pub fn start(app: AppHandle, state: &DictationState, locale: String) -> Result<(), String> {
    let mut guard = state
        .0
        .lock()
        .map_err(|_| "Dictation process lock poisoned".to_string())?;
    if let Some(mut existing) = guard.take() {
        let _ = existing.kill();
    }

    let mut child = Command::new(bridge_path(&app)?)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|error| format!("Could not start Apple Dictation: {error}"))?;

    let stdout = child
        .stdout
        .take()
        .ok_or_else(|| "Dictation bridge did not expose stdout".to_string())?;
    let reader_app = app.clone();
    std::thread::spawn(move || {
        for line in BufReader::new(stdout).lines().map_while(Result::ok) {
            if let Ok(event) = serde_json::from_str::<DictationEvent>(&line) {
                let _ = reader_app.emit("dictation://event", event);
            }
        }
    });

    let command = serde_json::json!({ "action": "start", "locale": locale }).to_string();
    let stdin = child
        .stdin
        .as_mut()
        .ok_or_else(|| "Dictation bridge did not expose stdin".to_string())?;
    writeln!(stdin, "{command}").map_err(|error| error.to_string())?;
    stdin.flush().map_err(|error| error.to_string())?;
    *guard = Some(child);
    Ok(())
}

#[cfg(not(target_os = "macos"))]
pub fn start(_app: AppHandle, _state: &DictationState, _locale: String) -> Result<(), String> {
    Err("Apple Dictation is available only in the macOS desktop app".to_string())
}

pub fn stop(state: &DictationState, cancel: bool) -> Result<(), String> {
    let mut guard = state
        .0
        .lock()
        .map_err(|_| "Dictation process lock poisoned".to_string())?;
    let Some(child) = guard.as_mut() else {
        return Ok(());
    };
    let action = if cancel { "cancel" } else { "stop" };
    let command = serde_json::json!({ "action": action }).to_string();
    if let Some(stdin) = child.stdin.as_mut() {
        writeln!(stdin, "{command}").map_err(|error| error.to_string())?;
        stdin.flush().map_err(|error| error.to_string())?;
    }
    Ok(())
}
