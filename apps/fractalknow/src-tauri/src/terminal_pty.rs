//! Terminal/PTY lifecycle. Uses `portable-pty` to spawn real shell
//! processes and route stdin/stdout between the bridge and the spawned
//! PTY. Each terminal session is keyed by id and tracks its master and
//! child handles.

use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::Arc;
use std::thread;

use parking_lot::Mutex;
use portable_pty::{native_pty_system, CommandBuilder, PtySize};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, Runtime};

pub type TerminalId = String;

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TerminalSessionConfig {
    pub cwd: Option<String>,
    pub shell: Option<String>,
    pub cols: Option<u16>,
    pub rows: Option<u16>,
}

#[derive(Clone, Default)]
pub struct TerminalRegistry {
    sessions: Arc<Mutex<HashMap<TerminalId, Arc<Mutex<TerminalSession>>>>>,
}

struct TerminalSession {
    master: Box<dyn portable_pty::MasterPty + Send>,
    writer: Box<dyn Write + Send>,
}

#[allow(dead_code)]
impl TerminalSession {
    fn master(&self) -> &dyn portable_pty::MasterPty {
        &*self.master
    }
}

impl TerminalRegistry {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn start<R: Runtime>(
        &self,
        app: AppHandle<R>,
        id: TerminalId,
        config: TerminalSessionConfig,
    ) -> Result<(), String> {
        let pty = native_pty_system()
            .openpty(PtySize {
                rows: config.rows.unwrap_or(24),
                cols: config.cols.unwrap_or(80),
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|e| format!("Failed to open PTY: {e}"))?;

        let shell = config
            .shell
            .clone()
            .or_else(|| std::env::var("SHELL").ok())
            .unwrap_or_else(default_shell);

        let mut command = CommandBuilder::new(&shell);
        if let Some(cwd) = &config.cwd {
            command.cwd(cwd);
        }
        // Login shell so users get their normal env.
        if shell.ends_with("bash") || shell.ends_with("zsh") {
            command.arg("-l");
        }

        let child = pty
            .slave
            .spawn_command(command)
            .map_err(|e| format!("Failed to spawn shell: {e}"))?;
        let mut child = child;
        drop(pty.slave);

        let writer = pty
            .master
            .take_writer()
            .map_err(|e| format!("Failed to take PTY writer: {e}"))?;
        let mut reader = pty
            .master
            .try_clone_reader()
            .map_err(|e| format!("Failed to clone PTY reader: {e}"))?;

        let session = TerminalSession {
            master: pty.master,
            writer,
        };
        self.sessions
            .lock()
            .insert(id.clone(), Arc::new(Mutex::new(session)));

        let app_for_reader = app.clone();
        let id_for_reader = id.clone();
        thread::spawn(move || {
            let mut buffer = [0u8; 4096];
            loop {
                match reader.read(&mut buffer) {
                    Ok(0) => break,
                    Ok(n) => {
                        let payload = String::from_utf8_lossy(&buffer[..n]).to_string();
                        let _ = app_for_reader.emit(
                            "ok:terminal-data",
                            TerminalDataEvent {
                                id: id_for_reader.clone(),
                                data: payload,
                            },
                        );
                    }
                    Err(_) => break,
                }
            }
            let exit_code: Option<i32> = child.wait().ok().map(|status| status.exit_code() as i32);
            let _ = app_for_reader.emit(
                "ok:terminal-exit",
                TerminalExitEvent {
                    id: id_for_reader,
                    code: exit_code,
                },
            );
        });

        Ok(())
    }

    pub fn write(&self, id: &TerminalId, data: &str) -> Result<(), String> {
        let sessions = self.sessions.lock();
        let session = sessions
            .get(id)
            .ok_or_else(|| format!("Unknown terminal session: {id}"))?;
        let mut guard = session.lock();
        guard
            .writer
            .write_all(data.as_bytes())
            .map_err(|e| format!("Failed to write to terminal: {e}"))?;
        guard.writer.flush().ok();
        Ok(())
    }

    pub fn stop(&self, id: &TerminalId) -> Result<(), String> {
        let mut sessions = self.sessions.lock();
        if let Some(session) = sessions.remove(id) {
            // Dropping the session closes the master fd, which signals the
            // child shell to exit.
            drop(session);
        }
        Ok(())
    }
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct TerminalDataEvent {
    id: TerminalId,
    data: String,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct TerminalExitEvent {
    id: TerminalId,
    code: Option<i32>,
}

fn default_shell() -> String {
    if cfg!(target_os = "windows") {
        "cmd.exe".to_string()
    } else {
        "/bin/sh".to_string()
    }
}
