//! Platform-specific helpers for menu accelerators, protocol detection,
//! and process spawning.

use std::process::Command;

/// Normalizes a cross-platform accelerator for the current platform.
/// `CmdOrCtrl` becomes the platform-correct modifier, and `Alt+Left` /
/// `Alt+Right` map to the browser-back / browser-forward keys on macOS.
pub fn normalize_accelerator(accel: &str) -> &'static str {
    if accel.contains("CmdOrCtrl") {
        if cfg!(target_os = "macos") {
            replace_static(accel, "CmdOrCtrl", "Cmd")
        } else {
            replace_static(accel, "CmdOrCtrl", "Ctrl")
        }
    } else if cfg!(target_os = "macos") && (accel == "Alt+Left" || accel == "Alt+Right") {
        if accel == "Alt+Left" {
            "Cmd+["
        } else {
            "Cmd+]"
        }
    } else {
        // Leaks are fine for short, known accelerator strings.
        Box::leak(accel.to_string().into_boxed_str())
    }
}

fn replace_static(input: &str, from: &str, to: &str) -> &'static str {
    let replaced = input.replace(from, to);
    Box::leak(replaced.into_boxed_str())
}

#[cfg(target_os = "macos")]
pub fn detect_protocol_impl(scheme: &str) -> super::ProtocolDetection {
    let output = Command::new(
        "/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister",
    )
    .arg("-dump")
    .output();

    let installed = output
        .ok()
        .and_then(|out| String::from_utf8(out.stdout).ok())
        .map(|dump| {
            dump.lines()
                .any(|line| line.to_ascii_lowercase().contains(&format!("{scheme}:")))
        })
        .unwrap_or(false);

    super::ProtocolDetection {
        installed,
        display_name: if installed {
            Some(format!("{scheme}:"))
        } else {
            None
        },
    }
}

#[cfg(target_os = "linux")]
pub fn detect_protocol_impl(scheme: &str) -> super::ProtocolDetection {
    let mime = format!("x-scheme-handler/{scheme}");
    let output = Command::new("xdg-mime")
        .arg("query")
        .arg("default")
        .arg(mime)
        .output();

    let display_name = output
        .ok()
        .filter(|out| out.status.success())
        .and_then(|out| String::from_utf8(out.stdout).ok())
        .map(|stdout| stdout.trim().to_string())
        .filter(|value| !value.is_empty());

    super::ProtocolDetection {
        installed: display_name.is_some(),
        display_name,
    }
}

#[cfg(target_os = "windows")]
pub fn detect_protocol_impl(scheme: &str) -> super::ProtocolDetection {
    let key = format!(r"HKEY_CLASSES_ROOT\\{scheme}");
    let output = Command::new("reg").arg("query").arg(key).output();
    let installed = output.map(|out| out.status.success()).unwrap_or(false);

    super::ProtocolDetection {
        installed,
        display_name: if installed {
            Some(format!("{scheme}:"))
        } else {
            None
        },
    }
}

#[cfg(not(any(target_os = "macos", target_os = "linux", target_os = "windows")))]
pub fn detect_protocol_impl(_scheme: &str) -> super::ProtocolDetection {
    super::ProtocolDetection {
        installed: false,
        display_name: None,
    }
}
