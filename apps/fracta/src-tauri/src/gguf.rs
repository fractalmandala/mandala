//! Local GGUF inference via a managed `llama-server` subprocess.
//!
//! The user picks a `.gguf` file; we spawn `llama-server` (from PATH / Homebrew)
//! with that model and expose an OpenAI-compatible base URL on localhost.
//! The frontend reuses the same streaming chat client as remote providers.

use serde::Serialize;
use std::io::{BufRead, BufReader, Read, Write};
use std::net::{TcpListener, TcpStream};
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::{Duration, Instant};

const READY_TIMEOUT: Duration = Duration::from_secs(180);
const POLL_EVERY: Duration = Duration::from_millis(400);

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GgufStatus {
    pub loaded: bool,
    pub loading: bool,
    pub path: Option<String>,
    pub file_name: Option<String>,
    pub base_url: Option<String>,
    pub port: Option<u16>,
    pub error: Option<String>,
    /// Whether a `llama-server` binary was found on this machine.
    pub server_available: bool,
    pub server_path: Option<String>,
}

impl Default for GgufStatus {
    fn default() -> Self {
        let server = find_llama_server();
        Self {
            loaded: false,
            loading: false,
            path: None,
            file_name: None,
            base_url: None,
            port: None,
            error: None,
            server_available: server.is_some(),
            server_path: server.map(|p| p.display().to_string()),
        }
    }
}

struct Live {
    child: Child,
    path: PathBuf,
    port: u16,
}

#[derive(Clone)]
pub struct GgufEngine {
    inner: Arc<Mutex<EngineState>>,
}

struct EngineState {
    live: Option<Live>,
    loading: bool,
    last_error: Option<String>,
    pending_path: Option<PathBuf>,
}

impl Default for GgufEngine {
    fn default() -> Self {
        Self {
            inner: Arc::new(Mutex::new(EngineState {
                live: None,
                loading: false,
                last_error: None,
                pending_path: None,
            })),
        }
    }
}

impl GgufEngine {
    pub fn status(&self) -> GgufStatus {
        let server = find_llama_server();
        let g = self.inner.lock().unwrap();
        if let Some(live) = &g.live {
            return GgufStatus {
                loaded: true,
                loading: false,
                path: Some(live.path.display().to_string()),
                file_name: live
                    .path
                    .file_name()
                    .map(|s| s.to_string_lossy().into_owned()),
                base_url: Some(format!("http://127.0.0.1:{}/v1", live.port)),
                port: Some(live.port),
                error: g.last_error.clone(),
                server_available: server.is_some(),
                server_path: server.map(|p| p.display().to_string()),
            };
        }
        GgufStatus {
            loaded: false,
            loading: g.loading,
            path: g.pending_path.as_ref().map(|p| p.display().to_string()),
            file_name: g
                .pending_path
                .as_ref()
                .and_then(|p| p.file_name().map(|s| s.to_string_lossy().into_owned())),
            base_url: None,
            port: None,
            error: g.last_error.clone(),
            server_available: server.is_some(),
            server_path: server.map(|p| p.display().to_string()),
        }
    }

    /// Kill any running server. Safe to call repeatedly.
    pub fn unload(&self) -> Result<(), String> {
        let mut g = self.inner.lock().unwrap();
        if let Some(mut live) = g.live.take() {
            let _ = live.child.kill();
            let _ = live.child.wait();
        }
        g.loading = false;
        g.pending_path = None;
        g.last_error = None;
        Ok(())
    }

    /// Spawn llama-server for `path`. Blocks until ready or timeout.
    pub fn load(&self, path: PathBuf) -> Result<GgufStatus, String> {
        if !path.is_file() {
            return Err(format!("GGUF file not found: {}", path.display()));
        }
        let ext = path
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("")
            .to_ascii_lowercase();
        if ext != "gguf" {
            return Err("Please choose a .gguf model file.".into());
        }

        let server = find_llama_server().ok_or_else(|| {
            "llama-server not found. Install llama.cpp first:\n  macOS: brew install llama.cpp\n  Then restart fracta."
                .to_string()
        })?;

        {
            let mut g = self.inner.lock().unwrap();
            if let Some(mut live) = g.live.take() {
                let _ = live.child.kill();
                let _ = live.child.wait();
            }
            g.loading = true;
            g.last_error = None;
            g.pending_path = Some(path.clone());
        }

        let port = free_port().map_err(|e| e.to_string())?;
        let result = spawn_and_wait(&server, &path, port);

        let mut g = self.inner.lock().unwrap();
        g.loading = false;
        match result {
            Ok(child) => {
                g.live = Some(Live {
                    child,
                    path: path.clone(),
                    port,
                });
                g.last_error = None;
                g.pending_path = Some(path);
                drop(g);
                Ok(self.status())
            }
            Err(e) => {
                g.live = None;
                g.last_error = Some(e.clone());
                Err(e)
            }
        }
    }
}

fn spawn_and_wait(server: &Path, model: &Path, port: u16) -> Result<Child, String> {
    let mut child = Command::new(server)
        .arg("-m")
        .arg(model)
        .arg("--host")
        .arg("127.0.0.1")
        .arg("--port")
        .arg(port.to_string())
        .arg("-c")
        .arg("8192")
        .arg("-ngl")
        .arg("99")
        .stdout(Stdio::null())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to start llama-server: {e}"))?;

    if let Some(stderr) = child.stderr.take() {
        thread::spawn(move || {
            let reader = BufReader::new(stderr);
            for _line in reader.lines().map_while(Result::ok) {}
        });
    }

    let started = Instant::now();
    while started.elapsed() < READY_TIMEOUT {
        match child.try_wait() {
            Ok(Some(status)) => {
                return Err(format!(
                    "llama-server exited before becoming ready (status {status}). \
                     The GGUF may be invalid, corrupted, or too large for available memory."
                ));
            }
            Ok(None) => {}
            Err(e) => return Err(format!("Failed to poll llama-server: {e}")),
        }

        if http_ready(port) {
            return Ok(child);
        }
        thread::sleep(POLL_EVERY);
    }

    let _ = child.kill();
    let _ = child.wait();
    Err(format!(
        "Timed out waiting for llama-server to load {} ({}s).",
        model
            .file_name()
            .map(|s| s.to_string_lossy())
            .unwrap_or_default(),
        READY_TIMEOUT.as_secs()
    ))
}

fn http_ready(port: u16) -> bool {
    // Try /health then /v1/models (llama-server versions differ).
    http_status_ok(port, "/health") || http_status_ok(port, "/v1/models")
}

fn http_status_ok(port: u16, path: &str) -> bool {
    let addr = format!("127.0.0.1:{port}");
    let Ok(mut stream) = TcpStream::connect_timeout(
        &match addr.parse() {
            Ok(a) => a,
            Err(_) => return false,
        },
        Duration::from_millis(250),
    ) else {
        return false;
    };
    let _ = stream.set_read_timeout(Some(Duration::from_millis(400)));
    let _ = stream.set_write_timeout(Some(Duration::from_millis(400)));
    let req = format!("GET {path} HTTP/1.0\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n");
    if stream.write_all(req.as_bytes()).is_err() {
        return false;
    }
    let mut buf = [0u8; 96];
    let Ok(n) = stream.read(&mut buf) else {
        return false;
    };
    let head = String::from_utf8_lossy(&buf[..n]);
    head.contains(" 200 ") || head.starts_with("HTTP/1.1 200") || head.starts_with("HTTP/1.0 200")
}

fn free_port() -> Result<u16, std::io::Error> {
    let listener = TcpListener::bind("127.0.0.1:0")?;
    let port = listener.local_addr()?.port();
    drop(listener);
    Ok(port)
}

/// Resolve `llama-server` from PATH and common install locations.
pub fn find_llama_server() -> Option<PathBuf> {
    if let Ok(p) = std::env::var("FRACTA_LLAMA_SERVER") {
        let path = PathBuf::from(p);
        if path.is_file() {
            return Some(path);
        }
    }

    let candidates = [
        "/opt/homebrew/bin/llama-server",
        "/usr/local/bin/llama-server",
        "/home/linuxbrew/.linuxbrew/bin/llama-server",
    ];
    for c in candidates {
        let path = PathBuf::from(c);
        if path.is_file() {
            return Some(path);
        }
    }

    which_bin("llama-server").or_else(|| which_bin("llama-server.exe"))
}

fn which_bin(name: &str) -> Option<PathBuf> {
    let path = std::env::var_os("PATH")?;
    for dir in std::env::split_paths(&path) {
        let candidate = dir.join(name);
        if candidate.is_file() {
            return Some(candidate);
        }
    }
    None
}

/// Opens a native file picker for `.gguf` models.
pub fn pick_gguf_file() -> Option<PathBuf> {
    rfd::FileDialog::new()
        .set_title("Choose a GGUF model")
        .add_filter("GGUF models", &["gguf"])
        .pick_file()
}
