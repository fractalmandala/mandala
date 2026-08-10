//! Tauri implementation of the `window.openreel` desktop bridge.
//!
//! OpenReel's React frontend expects a `window.openreel` object with file system,
//! export, media, window-control, and lifecycle methods. This module provides the
//! Rust-side Tauri commands that back each of those methods. A companion JavaScript
//! init script (`static/openreel-bridge.js`) assembles the JS-side bridge that
//! delegates to these commands via `window.__TAURI__.invoke()`.

use crate::commands::AppState;
use base64::Engine as _;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::io::Write as _;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Emitter, State, Window};
use uuid::Uuid;

// --------------------------------------------------------- file handles

/// Tracks open file handles for chunked writes (export audio/video streaming).
pub struct WriteHandles {
    pub map: Mutex<HashMap<String, std::fs::File>>,
}

impl Default for WriteHandles {
    fn default() -> Self {
        Self { map: Mutex::new(HashMap::new()) }
    }
}

// --------------------------------------------------------- download tracking

/// Tracks the destination of the most recent webview download so the
/// `Finished` event (which reports an empty path on macOS) can resolve it.
/// Used to hand Wavacity exports over to the video editor.
pub struct LastDownload {
    pub path: Mutex<Option<PathBuf>>,
}

impl Default for LastDownload {
    fn default() -> Self {
        Self { path: Mutex::new(None) }
    }
}

// --------------------------------------------------------- export state

/// Tracks in-flight native export sessions (one per job).
pub struct ExportJobs {
    pub map: Mutex<HashMap<String, ExportJob>>,
}

pub struct ExportJob {
    pub output_path: PathBuf,
    pub width: u32,
    pub height: u32,
    pub frame_rate: f64,
    pub codec: String,
    pub format: String,
    pub bitrate_kbps: u32,
    pub total_frames: u32,
    pub audio_sample_rate: u32,
    pub audio_channels: u32,
    pub audio_data: Vec<u8>,
    pub audio_done: bool,
    pub cancelled: Arc<std::sync::atomic::AtomicBool>,
}

impl Default for ExportJobs {
    fn default() -> Self {
        Self { map: Mutex::new(HashMap::new()) }
    }
}

#[derive(Debug, Serialize)]
pub struct ExportSessionResult {
    #[serde(rename = "jobId")]
    pub job_id: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportStartArgs {
    pub width: u32,
    pub height: u32,
    #[serde(rename = "frameRate")]
    pub frame_rate: f64,
    pub codec: String,
    pub format: String,
    #[serde(rename = "bitrateKbps")]
    pub bitrate_kbps: u32,
    #[serde(rename = "outputPath")]
    pub output_path: String,
    #[serde(rename = "totalFrames")]
    pub total_frames: u32,
    #[serde(rename = "audioSampleRate")]
    pub audio_sample_rate: u32,
    #[serde(rename = "audioChannels")]
    pub audio_channels: u32,
    #[serde(rename = "encodeMode")]
    pub encode_mode: Option<String>,
    pub quality: Option<f64>,
    #[serde(rename = "proresProfile")]
    pub prores_profile: Option<String>,
}

// --------------------------------------------------------- hardware info

#[derive(Debug, Serialize)]
pub struct HardwareInfo {
    pub cpu: CpuInfo,
    pub memory: MemoryInfo,
    pub gpus: Vec<String>,
    pub encoders: Vec<String>,
    pub platform: String,
    pub arch: String,
}

#[derive(Debug, Serialize)]
pub struct CpuInfo {
    pub model: String,
    #[serde(rename = "physicalCores")]
    pub physical_cores: usize,
    #[serde(rename = "logicalCores")]
    pub logical_cores: usize,
}

#[derive(Debug, Serialize)]
pub struct MemoryInfo {
    #[serde(rename = "totalBytes")]
    pub total_bytes: u64,
    #[serde(rename = "freeBytes")]
    pub free_bytes: u64,
}

// --------------------------------------------------------- media ops

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GenerateProxyArgs {
    #[serde(rename = "srcPath")]
    pub src_path: String,
    pub preset: String,
}

#[derive(Debug, Serialize)]
pub struct GenerateProxyResult {
    #[serde(rename = "outPath")]
    pub out_path: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TranscodeArgs {
    #[serde(rename = "srcPath")]
    pub src_path: String,
    pub container: Option<String>,
    #[serde(rename = "videoBitrateKbps")]
    pub video_bitrate_kbps: Option<u32>,
    #[serde(rename = "audioBitrateKbps")]
    pub audio_bitrate_kbps: Option<u32>,
}

#[derive(Debug, Serialize)]
pub struct TranscodeResult {
    #[serde(rename = "outPath")]
    pub out_path: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExtractAudioWavArgs {
    #[serde(rename = "srcPath")]
    pub src_path: String,
    #[serde(rename = "streamIndex")]
    pub stream_index: Option<u32>,
}

#[derive(Debug, Serialize)]
pub struct ExtractAudioWavResult {
    #[serde(rename = "outPath")]
    pub out_path: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProbeAudioStreamsArgs {
    #[serde(rename = "srcPath")]
    pub src_path: String,
}

#[derive(Debug, Serialize)]
pub struct AudioStreamInfo {
    pub index: u32,
    pub codec: String,
    pub channels: u32,
    #[serde(rename = "sampleRate")]
    pub sample_rate: u32,
    pub language: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct ProbeAudioStreamsResult {
    pub streams: Vec<AudioStreamInfo>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FetchUrlArgs {
    pub url: String,
    #[serde(rename = "maxBytes")]
    pub max_bytes: Option<u64>,
}

#[derive(Debug, Serialize)]
pub struct FetchUrlResult {
    pub ok: bool,
    pub status: u16,
    #[serde(rename = "statusText")]
    pub status_text: String,
    #[serde(rename = "contentType")]
    pub content_type: String,
    pub body: String, // base64-encoded
    pub error: Option<String>,
}

// --------------------------------------------------------- dialog args

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveDialogOpts {
    #[serde(rename = "defaultPath")]
    pub default_path: String,
    pub filters: Vec<DialogFilter>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OpenDialogOpts {
    pub filters: Vec<DialogFilter>,
}

#[derive(Debug, Deserialize)]
pub struct DialogFilter {
    pub name: String,
    pub extensions: Vec<String>,
}

// =================================================================
// Tauri commands
// =================================================================

// -- file system --------------------------------------------------

#[tauri::command]
pub async fn or_fs_show_save_dialog(
    window: Window,
    opts: SaveDialogOpts,
) -> Result<Option<String>, String> {
    use tauri_plugin_dialog::DialogExt;
    let mut builder = window.dialog().file();
    for f in &opts.filters {
        let exts: Vec<&str> = f.extensions.iter().map(|s| s.as_str()).collect();
        builder = builder.add_filter(&f.name, &exts);
    }
    // Split default path into directory + file name
    let default = std::path::Path::new(&opts.default_path);
    if let Some(dir) = default.parent() {
        builder = builder.set_directory(dir);
    }
    if let Some(name) = default.file_name() {
        builder = builder.set_file_name(name.to_string_lossy().to_string());
    }
    let (tx, rx) = tokio::sync::oneshot::channel();
    builder.save_file(move |path| {
        let _ = tx.send(path.map(|p| p.to_string()));
    });
    rx.await.map_err(|e| format!("Dialog channel error: {e}"))
}

#[tauri::command]
pub async fn or_fs_show_open_dialog(
    window: Window,
    opts: OpenDialogOpts,
) -> Result<Option<String>, String> {
    use tauri_plugin_dialog::DialogExt;
    let mut builder = window.dialog().file();
    for f in &opts.filters {
        let exts: Vec<&str> = f.extensions.iter().map(|s| s.as_str()).collect();
        builder = builder.add_filter(&f.name, &exts);
    }
    let (tx, rx) = tokio::sync::oneshot::channel();
    builder.pick_file(move |path| {
        let _ = tx.send(path.map(|p| p.to_string()));
    });
    rx.await.map_err(|e| format!("Dialog channel error: {e}"))
}

#[tauri::command]
pub async fn or_fs_show_open_dialog_multi(
    window: Window,
    opts: OpenDialogOpts,
) -> Result<Vec<String>, String> {
    use tauri_plugin_dialog::DialogExt;
    let mut builder = window.dialog().file();
    for f in &opts.filters {
        let exts: Vec<&str> = f.extensions.iter().map(|s| s.as_str()).collect();
        builder = builder.add_filter(&f.name, &exts);
    }
    let (tx, rx) = tokio::sync::oneshot::channel();
    builder.pick_files(move |paths| {
        let result = paths
            .map(|v| v.into_iter().map(|p| p.to_string()).collect())
            .unwrap_or_default();
        let _ = tx.send(result);
    });
    rx.await.map_err(|e| format!("Dialog channel error: {e}"))
}

#[tauri::command]
pub fn or_fs_read_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(&path).map_err(|e| format!("Cannot read file: {e}"))
}

#[tauri::command]
pub fn or_fs_read_file_bytes(path: String) -> Result<Vec<u8>, String> {
    std::fs::read(&path).map_err(|e| format!("Cannot read file: {e}"))
}

#[tauri::command]
pub fn or_fs_temp_file_path(ext: String) -> Result<String, String> {
    let dir = std::env::temp_dir();
    let name = format!("shradhapp-{}.{}", Uuid::new_v4(), ext);
    let path = dir.join(name);
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn or_fs_write_file(path: String, data: String) -> Result<(), String> {
    std::fs::write(&path, data.as_bytes()).map_err(|e| format!("Cannot write file: {e}"))
}

#[tauri::command]
pub fn or_fs_open_write(handles: State<WriteHandles>, ext: String) -> Result<String, String> {
    let dir = std::env::temp_dir();
    let name = format!("shradhapp-write-{}.{}", Uuid::new_v4(), ext);
    let path = dir.join(name);
    let file = std::fs::File::create(&path).map_err(|e| format!("Cannot create temp file: {e}"))?;
    let handle_id = Uuid::new_v4().to_string();
    handles.map.lock().unwrap().insert(handle_id.clone(), file);
    Ok(handle_id)
}

#[tauri::command]
pub fn or_fs_write_chunk(
    handles: State<WriteHandles>,
    handle_id: String,
    data: Vec<u8>,
    _position: u64,
) -> Result<(), String> {
    let mut map = handles.map.lock().unwrap();
    let file = map.get_mut(&handle_id).ok_or("Unknown write handle")?;
    file.write_all(&data).map_err(|e| format!("Write failed: {e}"))
}

#[tauri::command]
pub fn or_fs_close_write(handles: State<WriteHandles>, handle_id: String) -> Result<(), String> {
    handles.map.lock().unwrap().remove(&handle_id);
    Ok(())
}

#[tauri::command]
pub fn or_fs_abort_write(handles: State<WriteHandles>, handle_id: String) -> Result<(), String> {
    handles.map.lock().unwrap().remove(&handle_id);
    Ok(())
}

#[tauri::command]
pub fn or_fs_reveal_in_folder(path: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .args(["-R", &path])
            .spawn()
            .map_err(|e| format!("Cannot reveal in Finder: {e}"))?;
    }
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(std::path::Path::new(&path).parent().unwrap_or(std::path::Path::new(".")))
            .spawn()
            .map_err(|e| format!("Cannot reveal in file manager: {e}"))?;
    }
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .args(["/select,", &path])
            .spawn()
            .map_err(|e| format!("Cannot reveal in Explorer: {e}"))?;
    }
    Ok(())
}

// -- window controls ----------------------------------------------

#[tauri::command]
pub async fn or_win_minimize(window: Window) -> Result<(), String> {
    window.minimize().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn or_win_toggle_maximize(window: Window) -> Result<(), String> {
    let maximized = window.is_maximized().unwrap_or(false);
    if maximized {
        window.unmaximize().map_err(|e| e.to_string())
    } else {
        window.maximize().map_err(|e| e.to_string())
    }
}

#[tauri::command]
pub fn or_win_close(window: Window) -> Result<(), String> {
    window.close().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn or_win_is_maximized(window: Window) -> Result<bool, String> {
    window.is_maximized().map_err(|e| e.to_string())
}

// -- hardware probe -----------------------------------------------

#[tauri::command]
pub fn or_probe_hardware(state: State<AppState>) -> Result<HardwareInfo, String> {
    let logical = std::thread::available_parallelism()
        .map(|n| n.get())
        .unwrap_or(1);

    let platform = if cfg!(target_os = "macos") {
        "darwin"
    } else if cfg!(target_os = "windows") {
        "win32"
    } else {
        "linux"
    };

    let encoders = match &state.ffmpeg {
        Ok(eng) => {
            let mut list = Vec::new();
            if eng.has_encoder("libx264") { list.push("libx264".into()); }
            if eng.has_encoder("libx265") { list.push("libx265".into()); }
            if eng.has_encoder("h264_videotoolbox") { list.push("h264_videotoolbox".into()); }
            if eng.has_encoder("hevc_videotoolbox") { list.push("hevc_videotoolbox".into()); }
            list
        }
        Err(_) => vec![],
    };

    Ok(HardwareInfo {
        cpu: CpuInfo {
            model: "CPU".into(),
            physical_cores: logical,
            logical_cores: logical,
        },
        memory: MemoryInfo {
            total_bytes: 0,
            free_bytes: 0,
        },
        gpus: vec![],
        encoders,
        platform: platform.into(),
        arch: std::env::consts::ARCH.into(),
    })
}

// -- export -------------------------------------------------------

#[tauri::command]
pub fn or_export_start(
    app: AppHandle,
    jobs: State<ExportJobs>,
    args: ExportStartArgs,
) -> Result<ExportSessionResult, String> {
    let job_id = Uuid::new_v4().to_string();
    let cancelled = Arc::new(std::sync::atomic::AtomicBool::new(false));

    let job = ExportJob {
        output_path: PathBuf::from(&args.output_path),
        width: args.width,
        height: args.height,
        frame_rate: args.frame_rate,
        codec: args.codec.clone(),
        format: args.format.clone(),
        bitrate_kbps: args.bitrate_kbps,
        total_frames: args.total_frames,
        audio_sample_rate: args.audio_sample_rate,
        audio_channels: args.audio_channels,
        audio_data: Vec::new(),
        audio_done: false,
        cancelled: cancelled.clone(),
    };

    jobs.map.lock().unwrap().insert(job_id.clone(), job);

    let _ = app.emit("openreel-export-port", &serde_json::json!({
        "jobId": job_id,
        "__openreelExportPort": true
    }));

    Ok(ExportSessionResult { job_id })
}

#[tauri::command]
pub fn or_export_write_audio_chunk(
    jobs: State<ExportJobs>,
    job_id: String,
    chunk: Vec<u8>,
    _position: u64,
) -> Result<(), String> {
    let mut map = jobs.map.lock().unwrap();
    let job = map.get_mut(&job_id).ok_or("Unknown export job")?;
    job.audio_data.extend_from_slice(&chunk);
    Ok(())
}

#[tauri::command]
pub fn or_export_write_audio_wav(
    jobs: State<ExportJobs>,
    job_id: String,
    wav: Vec<u8>,
) -> Result<(), String> {
    let mut map = jobs.map.lock().unwrap();
    let job = map.get_mut(&job_id).ok_or("Unknown export job")?;
    job.audio_data.extend_from_slice(&wav);
    Ok(())
}

#[tauri::command]
pub async fn or_export_finish_audio(
    app: AppHandle,
    jobs: State<'_, ExportJobs>,
    job_id: String,
) -> Result<(), String> {
    {
        let mut map = jobs.map.lock().unwrap();
        let job = map.get_mut(&job_id).ok_or("Unknown export job")?;
        job.audio_done = true;
    }

    // The full FFmpeg muxing pipeline will be wired when the frame receiver
    // is implemented. For now, signal completion.
    let _ = app.emit("openreel-export-done", &serde_json::json!({ "jobId": job_id }));

    Ok(())
}

#[tauri::command]
pub fn or_export_cancel(jobs: State<ExportJobs>, job_id: String) -> Result<(), String> {
    let map = jobs.map.lock().unwrap();
    if let Some(job) = map.get(&job_id) {
        job.cancelled.store(true, std::sync::atomic::Ordering::SeqCst);
    }
    Ok(())
}

// -- media operations ---------------------------------------------

#[tauri::command]
pub fn or_media_generate_proxy(
    state: State<AppState>,
    args: GenerateProxyArgs,
) -> Result<GenerateProxyResult, String> {
    let eng = state.ffmpeg.as_ref().map_err(|e| e.clone())?;
    let src = PathBuf::from(&args.src_path);
    let out_dir = state.thumb_dir.clone();
    let stem = src.file_stem().unwrap_or_default().to_string_lossy();
    let out_path = out_dir.join(format!("{stem}-proxy.mp4"));
    eng.generate_proxy(&src, &out_path)?;
    Ok(GenerateProxyResult {
        out_path: out_path.to_string_lossy().to_string(),
    })
}

#[tauri::command]
pub fn or_media_transcode(
    state: State<AppState>,
    args: TranscodeArgs,
) -> Result<TranscodeResult, String> {
    let eng = state.ffmpeg.as_ref().map_err(|e| e.clone())?;
    let container = args.container.as_deref().unwrap_or("mp4");
    let src = PathBuf::from(&args.src_path);
    let stem = src.file_stem().unwrap_or_default().to_string_lossy();
    let out_path = state.lib_dir.join(format!("{stem}-transcoded.{container}"));

    let mut ffmpeg_args: Vec<String> = vec![
        "-i".into(), args.src_path.clone(),
        "-c:v".into(), "libx264".into(),
        "-preset".into(), "medium".into(),
    ];
    if let Some(vbr) = args.video_bitrate_kbps {
        ffmpeg_args.extend(["-b:v".into(), format!("{vbr}k")]);
    }
    if let Some(abr) = args.audio_bitrate_kbps {
        ffmpeg_args.extend(["-b:a".into(), format!("{abr}k")]);
    }
    ffmpeg_args.push(out_path.to_string_lossy().to_string());

    eng.run_args(&ffmpeg_args)?;
    Ok(TranscodeResult {
        out_path: out_path.to_string_lossy().to_string(),
    })
}

#[tauri::command]
pub fn or_media_extract_audio_wav(
    state: State<AppState>,
    args: ExtractAudioWavArgs,
) -> Result<ExtractAudioWavResult, String> {
    let eng = state.ffmpeg.as_ref().map_err(|e| e.clone())?;
    let src = PathBuf::from(&args.src_path);
    let stem = src.file_stem().unwrap_or_default().to_string_lossy();
    let out_path = state.thumb_dir.join(format!("{stem}-audio.wav"));

    let mut ffmpeg_args = vec![
        "-i".into(), args.src_path.clone(),
        "-vn".into(),
        "-acodec".into(), "pcm_s16le".into(),
        "-ar".into(), "48000".into(),
    ];
    if let Some(idx) = args.stream_index {
        ffmpeg_args.extend(["-map".into(), format!("0:a:{idx}")]);
    }
    ffmpeg_args.push(out_path.to_string_lossy().to_string());

    eng.run_args(&ffmpeg_args)?;
    Ok(ExtractAudioWavResult {
        out_path: out_path.to_string_lossy().to_string(),
    })
}

#[tauri::command]
pub fn or_media_probe_audio_streams(
    state: State<AppState>,
    _args: ProbeAudioStreamsArgs,
) -> Result<ProbeAudioStreamsResult, String> {
    let _eng = state.ffmpeg.as_ref().map_err(|e| e.clone())?;
    // Simplified probe — return a default audio stream info
    Ok(ProbeAudioStreamsResult {
        streams: vec![AudioStreamInfo {
            index: 0,
            codec: "aac".into(),
            channels: 2,
            sample_rate: 48000,
            language: None,
        }],
    })
}

#[tauri::command]
pub async fn or_media_fetch_url(args: FetchUrlArgs) -> Result<FetchUrlResult, String> {
    let client = reqwest::Client::builder()
        .user_agent("Shradhapp/0.1")
        .build()
        .map_err(|e| format!("HTTP client error: {e}"))?;

    match client.get(&args.url).send().await {
        Ok(response) => {
            let status = response.status().as_u16();
            let status_text = response.status().canonical_reason().unwrap_or("").to_string();
            let content_type = response
                .headers()
                .get("content-type")
                .and_then(|v| v.to_str().ok())
                .unwrap_or("application/octet-stream")
                .to_string();

            let bytes = response.bytes().await.map_err(|e| format!("Read error: {e}"))?;
            let body = if let Some(max) = args.max_bytes {
                &bytes[..bytes.len().min(max as usize)]
            } else {
                &bytes
            };

            Ok(FetchUrlResult {
                ok: status >= 200 && status < 300,
                status,
                status_text,
                content_type,
                body: base64::engine::general_purpose::STANDARD.encode(body),
                error: None,
            })
        }
        Err(e) => Ok(FetchUrlResult {
            ok: false,
            status: 0,
            status_text: String::new(),
            content_type: String::new(),
            body: String::new(),
            error: Some(e.to_string()),
        }),
    }
}

// -- keychain (uses a JSON file in app data) ----------------------

#[tauri::command]
pub fn or_keychain_get(state: State<AppState>, id: String) -> Result<Option<String>, String> {
    let path = state.data_dir.join("keychain.json");
    if !path.is_file() {
        return Ok(None);
    }
    let data: serde_json::Value =
        serde_json::from_str(&std::fs::read_to_string(&path).map_err(|e| e.to_string())?)
            .map_err(|e| e.to_string())?;
    Ok(data.get(&id).and_then(|v| v.as_str()).map(String::from))
}

#[tauri::command]
pub fn or_keychain_set(state: State<AppState>, id: String, value: String) -> Result<(), String> {
    let path = state.data_dir.join("keychain.json");
    let mut data: serde_json::Value = if path.is_file() {
        serde_json::from_str(&std::fs::read_to_string(&path).map_err(|e| e.to_string())?)
            .unwrap_or(serde_json::json!({}))
    } else {
        serde_json::json!({})
    };
    data[&id] = serde_json::Value::String(value);
    std::fs::write(&path, serde_json::to_string_pretty(&data).map_err(|e| e.to_string())?)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn or_keychain_delete(state: State<AppState>, id: String) -> Result<(), String> {
    let path = state.data_dir.join("keychain.json");
    if !path.is_file() {
        return Ok(());
    }
    let mut data: serde_json::Value =
        serde_json::from_str(&std::fs::read_to_string(&path).map_err(|e| e.to_string())?)
            .map_err(|e| e.to_string())?;
    if let Some(obj) = data.as_object_mut() {
        obj.remove(&id);
    }
    std::fs::write(&path, serde_json::to_string_pretty(&data).map_err(|e| e.to_string())?)
        .map_err(|e| e.to_string())
}

// -- crash reporting ----------------------------------------------

#[tauri::command]
pub fn or_crash_report(payload: serde_json::Value) -> Result<(), String> {
    eprintln!("[shradhapp] crash report: {payload}");
    Ok(())
}

// -- storage adapter (SQLite-backed IStorageEngine backend) -------

#[derive(Debug, Serialize)]
pub struct OrProjectSummary {
    pub id: String,
    pub name: String,
    #[serde(rename = "createdAt")]
    pub created_at: i64,
    #[serde(rename = "modifiedAt")]
    pub modified_at: i64,
}

#[derive(Debug, Serialize)]
pub struct OrStorageUsage {
    pub used: u64,
    pub quota: u64,
    pub projects: i64,
    #[serde(rename = "mediaItems")]
    pub media_items: i64,
}

#[derive(Debug, Serialize)]
pub struct OrCacheRecord {
    pub data: Vec<u8>,
    pub timestamp: i64,
    pub size: i64,
}

#[derive(Debug, Serialize)]
pub struct OrWaveformRecord {
    #[serde(rename = "mediaId")]
    pub media_id: String,
    pub data: String, // JSON-serialized number[]
    #[serde(rename = "sampleRate")]
    pub sample_rate: i64,
}

#[tauri::command]
pub fn or_storage_save_project(
    state: State<AppState>,
    id: String,
    name: String,
    data: String,
) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.upsert_project(&id, &name, &data)?;
    Ok(())
}

#[tauri::command]
pub fn or_storage_load_project(
    state: State<AppState>,
    id: String,
) -> Result<Option<String>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    match db.get_project(&id) {
        Ok(row) => Ok(Some(row.data)),
        Err(_) => Ok(None),
    }
}

#[tauri::command]
pub fn or_storage_list_projects(
    state: State<AppState>,
) -> Result<Vec<OrProjectSummary>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let rows = db.list_projects()?;
    Ok(rows
        .into_iter()
        .map(|r| OrProjectSummary {
            id: r.id,
            name: r.name,
            created_at: r.created_at,
            modified_at: r.updated_at,
        })
        .collect())
}

#[tauri::command]
pub fn or_storage_delete_project(
    state: State<AppState>,
    id: String,
) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.delete_project(&id)
}

#[tauri::command]
pub fn or_storage_save_cache(
    state: State<AppState>,
    key: String,
    data: Vec<u8>,
    timestamp: i64,
    size: i64,
) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.cache_upsert(&key, &data, timestamp, size)
}

#[tauri::command]
pub fn or_storage_load_cache(
    state: State<AppState>,
    key: String,
) -> Result<Option<OrCacheRecord>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    match db.cache_get(&key)? {
        Some((data, timestamp, size)) => Ok(Some(OrCacheRecord { data, timestamp, size })),
        None => Ok(None),
    }
}

#[tauri::command]
pub fn or_storage_delete_cache(
    state: State<AppState>,
    key: String,
) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.cache_delete(&key)
}

#[tauri::command]
pub fn or_storage_clear_cache(state: State<AppState>) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.cache_clear()
}

#[tauri::command]
pub fn or_storage_save_waveform(
    state: State<AppState>,
    media_id: String,
    data: String,
    sample_rate: i64,
) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.waveform_save(&media_id, &data, sample_rate)
}

#[tauri::command]
pub fn or_storage_load_waveform(
    state: State<AppState>,
    media_id: String,
) -> Result<Option<OrWaveformRecord>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    match db.waveform_get(&media_id)? {
        Some((data, sample_rate)) => Ok(Some(OrWaveformRecord {
            media_id,
            data,
            sample_rate,
        })),
        None => Ok(None),
    }
}

#[tauri::command]
pub fn or_storage_delete_waveform(
    state: State<AppState>,
    media_id: String,
) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.waveform_delete(&media_id)
}

#[tauri::command]
pub fn or_storage_get_usage(
    state: State<AppState>,
) -> Result<OrStorageUsage, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    let projects = db.count_projects()?;
    let media_items = db.count_media()?;
    Ok(OrStorageUsage {
        used: 0,   // SQLite file size could be computed, but not critical for MVP
        quota: 0,  // No quota on desktop
        projects,
        media_items,
    })
}
