//! Local server lifecycle. Spawns a configured external process (the
//! OpenKnowledge collaboration server, or any other local HTTP server the
//! user wants to run), tracks its process handle, polls its health
//! endpoint, and emits `ok:server-status` events for state transitions.

use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::sync::Arc;
use std::thread;
use std::time::Duration;

use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, Runtime};

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ServerConfig {
    pub command: String,
    #[serde(default)]
    pub args: Vec<String>,
    #[serde(default)]
    pub env: HashMap<String, String>,
    pub health_url: Option<String>,
    pub health_timeout_ms: Option<u64>,
    pub cwd: Option<String>,
}

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ServerState {
    pub status: String,
    pub url: Option<String>,
    pub message: Option<String>,
    pub pid: Option<u32>,
    pub changed_at: String,
}

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
#[serde(rename_all = "camelCase")]
pub struct PersistedServerState {
    pub pid: Option<u32>,
    pub command: String,
    pub args: Vec<String>,
    pub url: Option<String>,
    pub stopped_at: Option<String>,
}

pub struct ServerHandle {
    child: Arc<Mutex<Option<Child>>>,
    config: Arc<Mutex<Option<ServerConfig>>>,
    state_path: PathBuf,
}

impl ServerHandle {
    pub fn new(state_path: PathBuf) -> Self {
        Self {
            child: Arc::new(Mutex::new(None)),
            config: Arc::new(Mutex::new(None)),
            state_path,
        }
    }

    pub fn with_app<R: Runtime>(app: &AppHandle<R>) -> Self {
        let state_path = crate::paths::server_state_path(app).unwrap_or_default();
        Self::new(state_path)
    }

    pub fn start<R: Runtime>(
        &self,
        app: AppHandle<R>,
        config: ServerConfig,
    ) -> Result<ServerState, String> {
        let mut child_guard = self.child.lock();
        if let Some(existing) = child_guard.as_mut() {
            if let Ok(None) = existing.try_wait() {
                return Err("Local server is already running.".to_string());
            }
        }

        let mut command = Command::new(&config.command);
        command
            .args(&config.args)
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::null());
        if let Some(cwd) = &config.cwd {
            command.current_dir(cwd);
        }
        for (key, value) in &config.env {
            command.env(key, value);
        }
        let child = command
            .spawn()
            .map_err(|e| format!("Failed to start local server: {e}"))?;
        let pid = child.id();
        *child_guard = Some(child);
        *self.config.lock() = Some(config.clone());

        let started_at = chrono::Utc::now().to_rfc3339();
        let state = ServerState {
            status: "starting".to_string(),
            url: config.health_url.clone().and_then(|s| shorten_url(&s)),
            message: Some(format!("Local server starting (pid {pid})")),
            pid: Some(pid),
            changed_at: started_at.clone(),
        };
        let _ = app.emit("ok:server-status", state.clone());
        self.persist_stopped(None);
        self.persist_started(&config, pid);

        let health_url = config.health_url.clone();
        let timeout = Duration::from_millis(config.health_timeout_ms.unwrap_or(5_000));
        let child_arc = self.child.clone();
        let app_for_thread = app.clone();
        thread::spawn(move || {
            let status = if let Some(url) = health_url.as_ref() {
                wait_for_health(url, timeout)
            } else {
                Ok("running".to_string())
            };
            let final_status = match status {
                Ok(s) => s,
                Err(e) => {
                    let _ = app_for_thread.emit(
                        "ok:server-status",
                        ServerState {
                            status: "error".to_string(),
                            url: health_url.clone().and_then(|s| shorten_url(&s)),
                            message: Some(e),
                            pid: Some(pid),
                            changed_at: chrono::Utc::now().to_rfc3339(),
                        },
                    );
                    return;
                }
            };
            let _ = app_for_thread.emit(
                "ok:server-status",
                ServerState {
                    status: final_status,
                    url: health_url.and_then(|s| shorten_url(&s)),
                    message: Some(format!("Local server running (pid {pid})")),
                    pid: Some(pid),
                    changed_at: chrono::Utc::now().to_rfc3339(),
                },
            );
            let _ = child_arc;
        });

        Ok(state)
    }

    pub fn stop<R: Runtime>(&self, app: &AppHandle<R>) -> Result<ServerState, String> {
        let mut child_guard = self.child.lock();
        if let Some(child) = child_guard.as_mut() {
            child.kill().map_err(|e| e.to_string())?;
        }
        *child_guard = None;
        *self.config.lock() = None;
        let state = ServerState {
            status: "stopped".to_string(),
            url: None,
            message: Some("Local server stopped.".to_string()),
            pid: None,
            changed_at: chrono::Utc::now().to_rfc3339(),
        };
        let _ = app.emit("ok:server-status", state.clone());
        self.persist_stopped(Some(chrono::Utc::now().to_rfc3339()));
        Ok(state)
    }

    pub fn status(&self) -> ServerState {
        let mut guard = self.child.lock();
        let (status, pid, message) = if let Some(child) = guard.as_mut() {
            match child.try_wait() {
                Ok(Some(status)) => (
                    "stopped".to_string(),
                    None,
                    Some(format!("Server exited with {status}")),
                ),
                Ok(None) => ("running".to_string(), Some(child.id()), None),
                Err(e) => ("error".to_string(), None, Some(e.to_string())),
            }
        } else {
            ("stopped".to_string(), None, None)
        };
        let config = self.config.lock();
        let url = config
            .as_ref()
            .and_then(|c| c.health_url.clone())
            .and_then(|s| shorten_url(&s));
        ServerState {
            status,
            url,
            message,
            pid,
            changed_at: chrono::Utc::now().to_rfc3339(),
        }
    }

    fn persist_started(&self, config: &ServerConfig, pid: u32) {
        let snapshot = PersistedServerState {
            pid: Some(pid),
            command: config.command.clone(),
            args: config.args.clone(),
            url: config.health_url.clone(),
            stopped_at: None,
        };
        if let Some(parent) = self.state_path.parent() {
            let _ = fs::create_dir_all(parent);
        }
        if let Ok(body) = serde_json::to_string_pretty(&snapshot) {
            let _ = fs::write(&self.state_path, body);
        }
    }

    fn persist_stopped(&self, stopped_at: Option<String>) {
        let snapshot = match fs::read_to_string(&self.state_path)
            .ok()
            .and_then(|body| serde_json::from_str::<PersistedServerState>(&body).ok())
        {
            Some(mut s) => {
                s.stopped_at = stopped_at;
                s.pid = None;
                s
            }
            None => PersistedServerState {
                pid: None,
                command: String::new(),
                args: Vec::new(),
                url: None,
                stopped_at,
            },
        };
        if let Some(parent) = self.state_path.parent() {
            let _ = fs::create_dir_all(parent);
        }
        if let Ok(body) = serde_json::to_string_pretty(&snapshot) {
            let _ = fs::write(&self.state_path, body);
        }
    }
}

fn shorten_url(url: &str) -> Option<String> {
    let parsed = url::Url::parse(url).ok()?;
    let host = parsed.host_str()?;
    let port = parsed.port();
    match port {
        Some(p) => Some(format!("{}://{}:{}", parsed.scheme(), host, p)),
        None => Some(format!("{}://{}", parsed.scheme(), host)),
    }
}

fn wait_for_health(url: &str, timeout: Duration) -> Result<String, String> {
    let started = std::time::Instant::now();
    let client = reqwest::blocking::Client::builder()
        .timeout(Duration::from_millis(500))
        .build()
        .map_err(|e| e.to_string())?;
    loop {
        if started.elapsed() > timeout {
            return Err(format!("Timed out after {:?} waiting for {}", timeout, url));
        }
        match client.get(url).send() {
            Ok(response) if response.status().is_success() => {
                return Ok("running".to_string());
            }
            Ok(_) | Err(_) => {
                thread::sleep(Duration::from_millis(200));
            }
        }
    }
}
