fn main() {
    #[cfg(target_os = "macos")]
    build_dictation_bridge();
    tauri_build::build()
}

#[cfg(target_os = "macos")]
fn build_dictation_bridge() {
    use std::env;
    use std::path::PathBuf;
    use std::process::Command;

    let source = PathBuf::from("native/dictation_bridge.swift");
    let output = PathBuf::from(env::var("OUT_DIR").expect("OUT_DIR must be set"))
        .join("fractalengine-dictation-bridge");
    println!("cargo:rerun-if-changed={}", source.display());

    let status = Command::new("xcrun")
        .args([
            "swiftc",
            "-O",
            "-framework",
            "Speech",
            "-framework",
            "AVFoundation",
        ])
        .arg(&source)
        .arg("-o")
        .arg(&output)
        .status()
        .expect("Xcode's swiftc is required to build the macOS dictation bridge");
    assert!(
        status.success(),
        "Could not build the macOS dictation bridge"
    );
}
