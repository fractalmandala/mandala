//! Typed Tauri commands — the only surface the frontend (and later the AI
//! layer) uses. No frontend code ever shells out directly.

use crate::db::{self, Db, MediaRow};
use crate::media_engine::{
    ExportOptions, ExportSegment, Ffmpeg, TimelineExportClip, TimelineExportOptions,
    TimelineMediaKind, TimelineTrackKind,
};
use base64::Engine as _;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Emitter, State};
use uuid::Uuid;

const APP_SETTINGS_KEY: &str = "app_settings";

pub struct AppState {
    pub db: Mutex<Db>,
    pub data_dir: PathBuf,
    pub lib_dir: PathBuf,
    pub thumb_dir: PathBuf,
    pub ffmpeg: Result<Ffmpeg, String>,
    pub cancels: Mutex<HashMap<String, Arc<AtomicBool>>>,
}

impl AppState {
    fn eng(&self) -> Result<&Ffmpeg, String> {
        self.ffmpeg.as_ref().map_err(|e| e.clone())
    }
}

// -------------------------------------------------------------- settings

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub version: u32,
    pub appearance: AppearanceSettings,
    pub workflow: WorkflowSettings,
    pub audio: AudioSettings,
    pub export: ExportSettings,
    pub channel: ChannelSettings,
    pub advanced: AdvancedSettings,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppearanceSettings {
    pub theme: String,
    pub reduced_motion: String,
    pub density: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkflowSettings {
    pub start_view: String,
    pub default_project_phase: String,
    pub show_autosave_status: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AudioSettings {
    pub default_repair_mode: String,
    pub keep_originals: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportSettings {
    pub default_preset: String,
    pub keep_original_audio: bool,
    pub show_export_progress: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChannelSettings {
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AdvancedSettings {
    pub show_diagnostics: bool,
    pub confirm_destructive_commands: bool,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeInfo {
    pub app_data_dir: String,
    pub library_dir: String,
    pub thumbnail_dir: String,
    pub ffmpeg_available: bool,
    pub ffmpeg_message: String,
}

fn default_app_settings() -> AppSettings {
    AppSettings {
        version: 1,
        appearance: AppearanceSettings {
            theme: "dark".into(),
            reduced_motion: "system".into(),
            density: "comfortable".into(),
        },
        workflow: WorkflowSettings {
            start_view: "home".into(),
            default_project_phase: "story".into(),
            show_autosave_status: true,
        },
        audio: AudioSettings {
            default_repair_mode: "manual".into(),
            keep_originals: true,
        },
        export: ExportSettings {
            default_preset: "mp4-full".into(),
            keep_original_audio: true,
            show_export_progress: true,
        },
        channel: ChannelSettings { enabled: true },
        advanced: AdvancedSettings {
            show_diagnostics: false,
            confirm_destructive_commands: true,
        },
    }
}

fn normalize_app_settings(mut settings: AppSettings) -> AppSettings {
    let defaults = default_app_settings();
    settings.version = 1;
    if !matches!(settings.appearance.theme.as_str(), "dark" | "light" | "system") {
        settings.appearance.theme = defaults.appearance.theme;
    }
    if !matches!(settings.appearance.reduced_motion.as_str(), "system" | "reduce" | "full") {
        settings.appearance.reduced_motion = defaults.appearance.reduced_motion;
    }
    if !matches!(settings.appearance.density.as_str(), "comfortable" | "compact") {
        settings.appearance.density = defaults.appearance.density;
    }
    if !matches!(settings.workflow.start_view.as_str(), "home" | "lastProject") {
        settings.workflow.start_view = defaults.workflow.start_view;
    }
    if !matches!(
        settings.workflow.default_project_phase.as_str(),
        "gather" | "story" | "sound" | "finish"
    ) {
        settings.workflow.default_project_phase = defaults.workflow.default_project_phase;
    }
    if !matches!(
        settings.audio.default_repair_mode.as_str(),
        "manual" | "autoAfterRecording"
    ) {
        settings.audio.default_repair_mode = defaults.audio.default_repair_mode;
    }
    if !matches!(settings.export.default_preset.as_str(), "mp4-full" | "mp4-small" | "mov") {
        settings.export.default_preset = defaults.export.default_preset;
    }
    settings
}

fn save_app_settings(state: &AppState, settings: &AppSettings) -> Result<AppSettings, String> {
    let normalized = normalize_app_settings(settings.clone());
    let value = serde_json::to_string(&normalized).map_err(|e| e.to_string())?;
    state
        .db
        .lock()
        .unwrap()
        .upsert_setting(APP_SETTINGS_KEY, &value)?;
    Ok(normalized)
}

#[tauri::command]
pub fn get_app_settings(state: State<AppState>) -> Result<AppSettings, String> {
    let row = state.db.lock().unwrap().get_setting(APP_SETTINGS_KEY)?;
    if let Some(row) = row {
        if let Ok(settings) = serde_json::from_str::<AppSettings>(&row.value) {
            return save_app_settings(&state, &settings);
        }
    }
    save_app_settings(&state, &default_app_settings())
}

#[tauri::command]
pub fn update_app_settings(
    state: State<AppState>,
    settings: AppSettings,
) -> Result<AppSettings, String> {
    save_app_settings(&state, &settings)
}

#[tauri::command]
pub fn reset_app_settings(state: State<AppState>) -> Result<AppSettings, String> {
    let defaults = default_app_settings();
    save_app_settings(&state, &defaults)
}

#[tauri::command]
pub fn get_runtime_info(state: State<AppState>) -> Result<RuntimeInfo, String> {
    Ok(RuntimeInfo {
        app_data_dir: state.data_dir.to_string_lossy().to_string(),
        library_dir: state.lib_dir.to_string_lossy().to_string(),
        thumbnail_dir: state.thumb_dir.to_string_lossy().to_string(),
        ffmpeg_available: state.ffmpeg.is_ok(),
        ffmpeg_message: state
            .ffmpeg
            .as_ref()
            .map(|eng| eng.ffmpeg.to_string_lossy().to_string())
            .unwrap_or_else(|error| error.clone()),
    })
}

// ------------------------------------------------------------------ helpers

fn kind_from_ext(ext: &str) -> Option<&'static str> {
    match ext.to_ascii_lowercase().as_str() {
        "mp4" | "mov" | "mkv" | "avi" | "webm" | "m4v" | "mpg" | "mpeg" => Some("video"),
        "png" | "jpg" | "jpeg" | "gif" | "bmp" | "webp" | "heic" => Some("image"),
        "mp3" | "wav" | "m4a" | "aac" | "ogg" | "flac" | "opus" => Some("audio"),
        _ => None,
    }
}

fn sanitize(name: &str) -> String {
    let cleaned: String = name
        .chars()
        .map(|c| {
            if c.is_alphanumeric() || matches!(c, '-' | '_' | '.' | ' ') {
                c
            } else {
                '_'
            }
        })
        .collect();
    let t = cleaned.trim();
    if t.is_empty() {
        "media".into()
    } else {
        t.chars().take(120).collect()
    }
}

fn unique_dest(dir: &Path, original_name: &str) -> (String, PathBuf) {
    let id = Uuid::new_v4().to_string();
    let filename = format!("{}-{}", &id[..8], sanitize(original_name));
    (id, dir.join(&filename))
}

fn thumb_for(state: &AppState, id: &str, kind: &str, src: &Path) -> Option<PathBuf> {
    let eng = state.eng().ok()?;
    let (path, result) = match kind {
        "video" => {
            let p = state.thumb_dir.join(format!("{id}.jpg"));
            (p.clone(), eng.video_thumbnail(src, &p))
        }
        "image" => {
            let p = state.thumb_dir.join(format!("{id}.jpg"));
            (p.clone(), eng.image_thumbnail(src, &p))
        }
        "audio" => {
            let p = state.thumb_dir.join(format!("{id}.png"));
            (p.clone(), eng.waveform(src, &p))
        }
        _ => return None,
    };
    match result {
        Ok(()) if path.is_file() => Some(path),
        _ => None,
    }
}

fn import_one(state: &AppState, src: &Path) -> Result<MediaRow, String> {
    let original_name = src
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("media")
        .to_string();
    let ext = src.extension().and_then(|e| e.to_str()).unwrap_or("");
    let kind = kind_from_ext(ext).ok_or_else(|| {
        format!("“{original_name}” isn't a video, photo or audio file I understand.")
    })?;
    if !src.is_file() {
        return Err(format!("Can't find the file “{original_name}”."));
    }

    let (id, dest) = unique_dest(&state.lib_dir, &original_name);
    std::fs::copy(src, &dest)
        .map_err(|e| format!("Couldn't copy “{original_name}” into the library: {e}"))?;

    let probe = state.eng().ok().and_then(|e| e.probe(&dest).ok());
    let (duration, width, height) = match &probe {
        Some(p) => (
            p.duration,
            p.width.map(|w| w as i64),
            p.height.map(|h| h as i64),
        ),
        None => (None, None, None),
    };
    let thumb = thumb_for(state, &id, kind, &dest);

    let row = MediaRow {
        id,
        kind: kind.to_string(),
        filename: original_name,
        path: dest.to_string_lossy().to_string(),
        imported_at: db::now(),
        duration: if kind == "image" { None } else { duration },
        width,
        height,
        tags: vec![],
        notes: String::new(),
        thumb_path: thumb.map(|p| p.to_string_lossy().to_string()),
    };
    state.db.lock().unwrap().insert_media(&row)?;
    Ok(row)
}

// -------------------------------------------------------------- youtube

const SHRADHA_CHANNEL_VIDEOS_URL: &str = "https://www.youtube.com/@shradhapandey8099/videos";

#[derive(Debug, Clone, Serialize)]
pub struct YoutubeVideo {
    pub id: String,
    pub title: String,
    pub url: String,
    pub embed_url: String,
    pub thumbnail_url: Option<String>,
    pub published_text: Option<String>,
    pub duration_text: Option<String>,
    pub view_count_text: Option<String>,
}

fn text_value(value: Option<&Value>) -> Option<String> {
    let value = value?;
    value
        .get("simpleText")
        .and_then(Value::as_str)
        .or_else(|| {
            value
                .get("runs")
                .and_then(Value::as_array)
                .and_then(|runs| runs.first())
                .and_then(|run| run.get("text"))
                .and_then(Value::as_str)
        })
        .map(str::trim)
        .filter(|text| !text.is_empty())
        .map(ToOwned::to_owned)
}

fn best_thumbnail(value: &Value) -> Option<String> {
    value
        .get("thumbnail")
        .and_then(|thumbnail| thumbnail.get("thumbnails"))
        .and_then(Value::as_array)
        .and_then(|thumbnails| thumbnails.last())
        .and_then(|thumbnail| thumbnail.get("url"))
        .and_then(Value::as_str)
        .map(|url| url.replace("\\u0026", "&"))
}

fn first_string_at_path<'a>(value: &'a Value, path: &[&str]) -> Option<&'a str> {
    path.iter()
        .try_fold(value, |current, key| current.get(*key))
        .and_then(Value::as_str)
}

fn first_text_content(value: Option<&Value>) -> Option<String> {
    let value = value?;
    first_string_at_path(value, &["text", "content"])
        .or_else(|| value.get("text").and_then(Value::as_str))
        .map(str::trim)
        .filter(|text| !text.is_empty())
        .map(ToOwned::to_owned)
}

fn lockup_metadata_part(value: &Value, index: usize) -> Option<String> {
    value
        .get("metadata")
        .and_then(|metadata| metadata.get("lockupMetadataViewModel"))
        .and_then(|metadata| metadata.get("metadata"))
        .and_then(|metadata| metadata.get("contentMetadataViewModel"))
        .and_then(|metadata| metadata.get("metadataRows"))
        .and_then(Value::as_array)
        .and_then(|rows| rows.first())
        .and_then(|row| row.get("metadataParts"))
        .and_then(Value::as_array)
        .and_then(|parts| parts.get(index))
        .and_then(|part| {
            first_text_content(Some(part)).or_else(|| {
                part.get("accessibilityLabel")
                    .and_then(Value::as_str)
                    .map(ToOwned::to_owned)
            })
        })
}

fn lockup_duration(value: &Value) -> Option<String> {
    value
        .get("contentImage")
        .and_then(|content_image| content_image.get("thumbnailViewModel"))
        .and_then(|thumbnail| thumbnail.get("overlays"))
        .and_then(Value::as_array)
        .and_then(|overlays| {
            overlays.iter().find_map(|overlay| {
                overlay
                    .get("thumbnailBottomOverlayViewModel")
                    .and_then(|bottom| bottom.get("badges"))
                    .and_then(Value::as_array)
                    .and_then(|badges| badges.first())
                    .and_then(|badge| badge.get("thumbnailBadgeViewModel"))
                    .and_then(|badge| badge.get("text"))
                    .and_then(Value::as_str)
            })
        })
        .map(ToOwned::to_owned)
}

fn parse_video_renderer(value: &Value) -> Option<YoutubeVideo> {
    let id = value.get("videoId")?.as_str()?.to_string();
    if id.len() != 11 {
        return None;
    }
    let title = text_value(value.get("title")).filter(|title| title != "Shorts")?;
    Some(YoutubeVideo {
        url: format!("https://www.youtube.com/watch?v={id}"),
        embed_url: format!("https://www.youtube.com/embed/{id}"),
        thumbnail_url: best_thumbnail(value),
        published_text: text_value(value.get("publishedTimeText")),
        duration_text: text_value(value.get("lengthText")),
        view_count_text: text_value(value.get("viewCountText")),
        id,
        title,
    })
}

fn parse_lockup_view_model(value: &Value) -> Option<YoutubeVideo> {
    let id = value
        .get("rendererContext")
        .and_then(|context| context.get("commandContext"))
        .and_then(|context| context.get("onTap"))
        .and_then(|on_tap| on_tap.get("innertubeCommand"))
        .and_then(|command| command.get("watchEndpoint"))
        .and_then(|endpoint| endpoint.get("videoId"))
        .and_then(Value::as_str)
        .or_else(|| value.get("contentId").and_then(Value::as_str))?
        .to_string();
    if id.len() != 11 {
        return None;
    }
    let title = first_string_at_path(
        value,
        &["metadata", "lockupMetadataViewModel", "title", "content"],
    )?
    .trim()
    .to_string();
    if title.is_empty() || title == "Shorts" {
        return None;
    }
    let thumbnail_url = value
        .get("contentImage")
        .and_then(|content_image| content_image.get("thumbnailViewModel"))
        .and_then(|thumbnail| thumbnail.get("image"))
        .and_then(|image| image.get("sources"))
        .and_then(Value::as_array)
        .and_then(|sources| sources.last())
        .and_then(|source| source.get("url"))
        .and_then(Value::as_str)
        .map(|url| url.replace("\\u0026", "&"));

    Some(YoutubeVideo {
        url: format!("https://www.youtube.com/watch?v={id}"),
        embed_url: format!("https://www.youtube.com/embed/{id}"),
        thumbnail_url,
        published_text: lockup_metadata_part(value, 1),
        duration_text: lockup_duration(value),
        view_count_text: lockup_metadata_part(value, 0),
        id,
        title,
    })
}

fn collect_video_renderers(value: &Value, seen: &mut HashSet<String>, out: &mut Vec<YoutubeVideo>) {
    match value {
        Value::Object(object) => {
            if let Some(video_renderer) = object.get("videoRenderer") {
                if let Some(video) = parse_video_renderer(video_renderer) {
                    if seen.insert(video.id.clone()) {
                        out.push(video);
                    }
                }
            }
            if let Some(lockup_view_model) = object.get("lockupViewModel") {
                if let Some(video) = parse_lockup_view_model(lockup_view_model) {
                    if seen.insert(video.id.clone()) {
                        out.push(video);
                    }
                }
            }
            for child in object.values() {
                collect_video_renderers(child, seen, out);
            }
        }
        Value::Array(items) => {
            for child in items {
                collect_video_renderers(child, seen, out);
            }
        }
        _ => {}
    }
}

fn extract_yt_initial_data(html: &str) -> Result<Value, String> {
    let marker = "ytInitialData";
    let marker_start = html.find(marker).ok_or_else(|| {
        "YouTube did not include channel video data in the public page.".to_string()
    })?;
    let after_marker = &html[marker_start + marker.len()..];
    let first_brace_rel = after_marker
        .find('{')
        .ok_or_else(|| "YouTube channel video data was not valid JSON.".to_string())?;
    let json_start = marker_start + marker.len() + first_brace_rel;

    let mut depth = 0usize;
    let mut in_string = false;
    let mut escaped = false;
    for (offset, byte) in html[json_start..].bytes().enumerate() {
        if in_string {
            if escaped {
                escaped = false;
            } else if byte == b'\\' {
                escaped = true;
            } else if byte == b'"' {
                in_string = false;
            }
            continue;
        }
        match byte {
            b'"' => in_string = true,
            b'{' => depth += 1,
            b'}' => {
                depth = depth.saturating_sub(1);
                if depth == 0 {
                    let json = &html[json_start..json_start + offset + 1];
                    return serde_json::from_str(json)
                        .map_err(|e| format!("Could not parse YouTube channel data: {e}"));
                }
            }
            _ => {}
        }
    }

    Err("YouTube channel video data was incomplete.".into())
}

fn fetch_youtube_channel_videos_blocking() -> Result<Vec<YoutubeVideo>, String> {
    let client = reqwest::blocking::Client::builder()
        .user_agent("Mozilla/5.0 Shradhapp/0.1")
        .build()
        .map_err(|e| format!("Could not prepare the YouTube request: {e}"))?;
    let html = client
        .get(SHRADHA_CHANNEL_VIDEOS_URL)
        .send()
        .and_then(|response| response.error_for_status())
        .map_err(|e| format!("Could not load the public YouTube channel: {e}"))?
        .text()
        .map_err(|e| format!("Could not read the YouTube channel response: {e}"))?;
    let data = extract_yt_initial_data(&html)?;
    let mut seen = HashSet::new();
    let mut videos = Vec::new();
    collect_video_renderers(&data, &mut seen, &mut videos);
    if videos.is_empty() {
        return Err("No public videos were found on this YouTube channel.".into());
    }
    Ok(videos)
}

#[tauri::command]
pub async fn list_youtube_channel_videos() -> Result<Vec<YoutubeVideo>, String> {
    tauri::async_runtime::spawn_blocking(fetch_youtube_channel_videos_blocking)
        .await
        .map_err(|e| format!("Could not run the YouTube channel request: {e}"))?
}

// ------------------------------------------------------------------ media

#[tauri::command]
pub fn list_media(state: State<AppState>) -> Result<Vec<MediaRow>, String> {
    state.db.lock().unwrap().list_media()
}

#[tauri::command]
pub fn import_files(state: State<AppState>, paths: Vec<String>) -> Result<Vec<MediaRow>, String> {
    let mut out = Vec::new();
    let mut failures = Vec::new();
    for p in &paths {
        match import_one(&state, Path::new(p)) {
            Ok(row) => out.push(row),
            Err(e) => failures.push(e),
        }
    }
    if out.is_empty() && !failures.is_empty() {
        return Err(failures.join("\n"));
    }
    Ok(out)
}

#[tauri::command]
pub fn rename_media(state: State<AppState>, id: String, name: String) -> Result<(), String> {
    let trimmed = name.trim();
    if trimmed.is_empty() {
        return Err("The name can't be empty.".into());
    }
    state.db.lock().unwrap().rename_media(&id, trimmed)
}

#[tauri::command]
pub fn set_tags(state: State<AppState>, id: String, tags: Vec<String>) -> Result<(), String> {
    let clean: Vec<String> = tags
        .into_iter()
        .map(|t| t.trim().trim_start_matches('#').to_lowercase())
        .filter(|t| !t.is_empty())
        .collect();
    state.db.lock().unwrap().set_tags(&id, &clean)
}

#[tauri::command]
pub fn set_notes(state: State<AppState>, id: String, notes: String) -> Result<(), String> {
    state.db.lock().unwrap().set_notes(&id, &notes)
}

#[tauri::command]
pub fn delete_media(state: State<AppState>, id: String) -> Result<(), String> {
    let row = state.db.lock().unwrap().delete_media(&id)?;
    // remove the library copy + thumbnail; originals elsewhere are untouched
    let _ = std::fs::remove_file(&row.path);
    if let Some(t) = row.thumb_path {
        let _ = std::fs::remove_file(t);
    }
    Ok(())
}

// -------------------------------------------------------------- voiceover

#[tauri::command]
pub fn save_recording(
    state: State<AppState>,
    data_b64: String,
    ext: String,
    name: String,
) -> Result<MediaRow, String> {
    let bytes = base64::engine::general_purpose::STANDARD
        .decode(data_b64)
        .map_err(|e| format!("Recording data was corrupted: {e}"))?;
    if bytes.is_empty() {
        return Err("The recording is empty.".into());
    }
    let ext = sanitize(&ext);
    let ext = if ext.is_empty() {
        "webm".to_string()
    } else {
        ext
    };
    let id = Uuid::new_v4().to_string();
    let dest = state.lib_dir.join(format!("{}-recording.{ext}", &id[..8]));
    std::fs::write(&dest, &bytes).map_err(|e| format!("Couldn't save the recording: {e}"))?;

    let probe = state.eng().ok().and_then(|e| e.probe(&dest).ok());
    let thumb = thumb_for(&state, &id, "audio", &dest);

    let row = MediaRow {
        id,
        kind: "audio".into(),
        filename: format!("{}.{}", sanitize(&name), ext),
        path: dest.to_string_lossy().to_string(),
        imported_at: db::now(),
        duration: probe.and_then(|p| p.duration),
        width: None,
        height: None,
        tags: vec!["voiceover".into()],
        notes: String::new(),
        thumb_path: thumb.map(|p| p.to_string_lossy().to_string()),
    };
    state.db.lock().unwrap().insert_media(&row)?;
    Ok(row)
}

#[derive(Debug, Serialize)]
pub struct CleanupResult {
    pub cleaned: MediaRow,
    pub before_duration: f64,
    pub after_duration: f64,
}

#[tauri::command]
pub fn cleanup_audio(state: State<AppState>, id: String) -> Result<CleanupResult, String> {
    let eng = state.eng()?.clone();
    let src_row = state.db.lock().unwrap().get_media(&id)?;
    let src = PathBuf::from(&src_row.path);

    let new_id = Uuid::new_v4().to_string();
    let dest = state.lib_dir.join(format!("{}-cleaned.m4a", &new_id[..8]));
    eng.cleanup_audio(&src, &dest)?;

    let before = eng.probe(&src).ok().and_then(|p| p.duration).unwrap_or(0.0);
    let after = eng
        .probe(&dest)
        .ok()
        .and_then(|p| p.duration)
        .unwrap_or(0.0);
    let thumb = thumb_for(&state, &new_id, "audio", &dest);

    let base = src_row
        .filename
        .rsplit_once('.')
        .map(|(b, _)| b)
        .unwrap_or(&src_row.filename);
    let row = MediaRow {
        id: new_id,
        kind: "audio".into(),
        filename: format!("{base} (cleaned).m4a"),
        path: dest.to_string_lossy().to_string(),
        imported_at: db::now(),
        duration: Some(after),
        width: None,
        height: None,
        tags: vec!["voiceover".into()],
        notes: String::new(),
        thumb_path: thumb.map(|p| p.to_string_lossy().to_string()),
    };
    state.db.lock().unwrap().insert_media(&row)?;
    Ok(CleanupResult {
        cleaned: row,
        before_duration: before,
        after_duration: after,
    })
}

/// Automatically detects short impulsive noise (clicks/ticks) and creates a
/// repaired sibling file. The source recording is never modified.
#[tauri::command]
pub fn repair_audio_ticks(state: State<AppState>, id: String) -> Result<CleanupResult, String> {
    let eng = state.eng()?.clone();
    let src_row = state.db.lock().unwrap().get_media(&id)?;
    let src = PathBuf::from(&src_row.path);
    let new_id = Uuid::new_v4().to_string();
    let dest = state.lib_dir.join(format!("{}-tick-repaired.m4a", &new_id[..8]));
    eng.repair_audio_ticks(&src, &dest)?;

    let before = eng.probe(&src).ok().and_then(|p| p.duration).unwrap_or(0.0);
    let after = eng.probe(&dest).ok().and_then(|p| p.duration).unwrap_or(0.0);
    let thumb = thumb_for(&state, &new_id, "audio", &dest);
    let base = src_row.filename.rsplit_once('.').map(|(b, _)| b).unwrap_or(&src_row.filename);
    let row = MediaRow {
        id: new_id,
        kind: "audio".into(),
        filename: format!("{base} (ticks repaired).m4a"),
        path: dest.to_string_lossy().to_string(),
        imported_at: db::now(),
        duration: Some(after),
        width: None,
        height: None,
        tags: vec!["voiceover".into(), "tick-repaired".into()],
        notes: "Automatic click and tick repair; original recording retained.".into(),
        thumb_path: thumb.map(|p| p.to_string_lossy().to_string()),
    };
    state.db.lock().unwrap().insert_media(&row)?;
    Ok(CleanupResult { cleaned: row, before_duration: before, after_duration: after })
}

// --------------------------------------------------------------- projects

/// Versioned project format (v1). Kept in sync with the frontend type.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Clip {
    pub media_id: String,
    pub trim_start: f64,
    pub trim_end: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectData {
    pub version: u32,
    pub name: String,
    pub clips: Vec<Clip>,
    pub voiceover_media_id: Option<String>,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum TimelineTrackKindDto {
    Video,
    Audio,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimelineClip {
    pub id: String,
    pub media_id: String,
    pub start: f64,
    pub trim_start: f64,
    pub trim_end: f64,
    #[serde(default)]
    pub volume: Option<f64>,
    #[serde(default)]
    pub muted: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimelineTrack {
    pub id: String,
    pub kind: TimelineTrackKindDto,
    pub clips: Vec<TimelineClip>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectTimelineV2 {
    pub tracks: Vec<TimelineTrack>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectDataV2 {
    pub version: u32,
    pub name: String,
    pub timeline: ProjectTimelineV2,
    pub created_at: i64,
    pub updated_at: i64,
}

fn project_v1_to_v2(data: &ProjectData) -> ProjectDataV2 {
    let video_clips = data
        .clips
        .iter()
        .enumerate()
        .scan(0.0, |start, (idx, clip)| {
            let duration = (clip.trim_end - clip.trim_start).max(0.1);
            let timeline_clip = TimelineClip {
                id: format!("clip-{idx}"),
                media_id: clip.media_id.clone(),
                start: *start,
                trim_start: clip.trim_start.max(0.0),
                trim_end: clip.trim_end.max(clip.trim_start + 0.1),
                volume: None,
                muted: false,
            };
            *start += duration;
            Some(timeline_clip)
        })
        .collect();
    let mut tracks = vec![TimelineTrack {
        id: "video-1".into(),
        kind: TimelineTrackKindDto::Video,
        clips: video_clips,
    }];
    if let Some(media_id) = &data.voiceover_media_id {
        tracks.push(TimelineTrack {
            id: "voiceover-1".into(),
            kind: TimelineTrackKindDto::Audio,
            clips: vec![TimelineClip {
                id: "voiceover-1".into(),
                media_id: media_id.clone(),
                start: 0.0,
                trim_start: 0.0,
                trim_end: 0.0,
                volume: None,
                muted: false,
            }],
        });
    }
    ProjectDataV2 {
        version: 2,
        name: data.name.clone(),
        timeline: ProjectTimelineV2 { tracks },
        created_at: data.created_at,
        updated_at: data.updated_at,
    }
}

#[tauri::command]
pub fn map_project_v1_to_v2(data: ProjectData) -> Result<ProjectDataV2, String> {
    Ok(project_v1_to_v2(&data))
}

fn project_to_record(row: db::ProjectRow) -> Result<ProjectRecord, String> {
    let data: Value =
        serde_json::from_str(&row.data).map_err(|e| format!("Project data is corrupted: {e}"))?;
    Ok(ProjectRecord {
        id: row.id,
        name: row.name,
        data,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

#[derive(Debug, Clone, Serialize)]
pub struct ProjectRecord {
    pub id: String,
    pub name: String,
    pub data: Value,
    pub created_at: i64,
    pub updated_at: i64,
}

#[tauri::command]
pub fn list_projects(state: State<AppState>) -> Result<Vec<ProjectRecord>, String> {
    state
        .db
        .lock()
        .unwrap()
        .list_projects()?
        .into_iter()
        .map(project_to_record)
        .collect()
}

#[tauri::command]
pub fn create_project(state: State<AppState>, name: String) -> Result<ProjectRecord, String> {
    let now = db::now();
    let data = ProjectData {
        version: 1,
        name: if name.trim().is_empty() {
            "Untitled video".into()
        } else {
            name.trim().to_string()
        },
        clips: vec![],
        voiceover_media_id: None,
        created_at: now,
        updated_at: now,
    };
    let id = Uuid::new_v4().to_string();
    let row = state.db.lock().unwrap().upsert_project(
        &id,
        &data.name,
        &serde_json::to_string(&data).unwrap(),
    )?;
    project_to_record(row)
}

#[tauri::command]
pub fn update_project(state: State<AppState>, id: String, data: Value) -> Result<(), String> {
    let mut data = data;
    let now = db::now();
    let object = data
        .as_object_mut()
        .ok_or_else(|| "Project data must be a JSON object.".to_string())?;
    let version = object.get("version").and_then(|v| v.as_u64()).unwrap_or(1);
    object.insert("version".into(), Value::from(version));
    object.insert("updated_at".into(), Value::from(now));
    let name = object
        .get("name")
        .and_then(|v| v.as_str())
        .map(str::trim)
        .filter(|name| !name.is_empty())
        .unwrap_or("Untitled video")
        .to_string();
    object.insert("name".into(), Value::from(name.clone()));
    state.db.lock().unwrap().upsert_project(
        &id,
        &name,
        &serde_json::to_string(&data).map_err(|e| e.to_string())?,
    )?;
    Ok(())
}

#[tauri::command]
pub fn delete_project(state: State<AppState>, id: String) -> Result<(), String> {
    state.db.lock().unwrap().delete_project(&id)
}

#[tauri::command]
pub fn duplicate_project(state: State<AppState>, id: String) -> Result<ProjectRecord, String> {
    let db = state.db.lock().unwrap();
    let src = db.get_project(&id)?;
    let mut data: Value =
        serde_json::from_str(&src.data).map_err(|e| format!("Project data is corrupted: {e}"))?;
    let now = db::now();
    let object = data
        .as_object_mut()
        .ok_or_else(|| "Project data is corrupted: expected an object.".to_string())?;
    let name = format!("{} copy", src.name);
    object.insert("name".into(), Value::from(name.clone()));
    object.insert("created_at".into(), Value::from(now));
    object.insert("updated_at".into(), Value::from(now));
    let new_id = Uuid::new_v4().to_string();
    let row = db.upsert_project(&new_id, &name, &serde_json::to_string(&data).unwrap())?;
    drop(db);
    project_to_record(row)
}

// ----------------------------------------------------------------- export

#[derive(Debug, Clone, Serialize)]
struct ExportProgress {
    id: String,
    percent: u32,
    stage: String,
}

fn preset_dims(preset: &str) -> (u32, u32, u32) {
    match preset {
        "mp4-small" => (1280, 720, 28),
        _ => (1920, 1080, 18), // mp4-full & mov
    }
}

#[tauri::command]
pub async fn export_project(
    app: AppHandle,
    state: State<'_, AppState>,
    id: String,
    data: ProjectData,
    preset: String,
    keep_audio: bool,
    out_path: String,
) -> Result<(), String> {
    let eng = state.eng()?.clone();

    // Resolve every media reference up front so we fail before writing anything.
    let mut segments: Vec<ExportSegment> = Vec::new();
    {
        let db = state.db.lock().unwrap();
        for clip in &data.clips {
            let row = db.get_media(&clip.media_id).map_err(|_| {
                "One of the clips is no longer in the Media Bank. Remove it and try again."
                    .to_string()
            })?;
            let path = PathBuf::from(&row.path);
            match row.kind.as_str() {
                "video" => {
                    let probe = eng.probe(&path).unwrap_or(crate::media_engine::ProbeInfo {
                        duration: None,
                        width: None,
                        height: None,
                        has_audio: false,
                    });
                    segments.push(ExportSegment::Video {
                        input: path,
                        trim_start: clip.trim_start.max(0.0),
                        trim_end: clip.trim_end.max(clip.trim_start + 0.1),
                        has_audio: probe.has_audio,
                    });
                }
                "image" => segments.push(ExportSegment::Still {
                    input: path,
                    duration: (clip.trim_end - clip.trim_start).max(0.5),
                }),
                "audio" => segments.push(ExportSegment::AudioOnly {
                    input: path,
                    trim_start: clip.trim_start.max(0.0),
                    trim_end: clip.trim_end.max(clip.trim_start + 0.1),
                }),
                _ => return Err("There's a clip type I don't understand.".into()),
            }
        }
    }
    if segments.is_empty() {
        return Err("Add at least one clip before exporting.".into());
    }

    let voiceover = match &data.voiceover_media_id {
        Some(vid) => {
            let row = state.db.lock().unwrap().get_media(vid)?;
            if row.kind != "audio" {
                return Err("The voiceover must be an audio file.".into());
            }
            Some(PathBuf::from(row.path))
        }
        None => None,
    };

    let (width, height, crf) = preset_dims(&preset);
    let output = PathBuf::from(&out_path);
    if let Some(parent) = output.parent() {
        if !parent.as_os_str().is_empty() && !parent.is_dir() {
            return Err("The folder you chose for the export doesn't exist.".into());
        }
    }

    let cancel = Arc::new(AtomicBool::new(false));
    state
        .cancels
        .lock()
        .unwrap()
        .insert(id.clone(), cancel.clone());

    let opts = ExportOptions {
        segments,
        voiceover,
        keep_original_audio: keep_audio,
        width,
        height,
        crf,
        output,
    };

    let evt_id = id.clone();
    let cancels_cleanup_id = id.clone();
    let result = tauri::async_runtime::spawn_blocking(move || {
        eng.export(
            &opts,
            move |frac, stage| {
                let _ = app.emit(
                    "export-progress",
                    ExportProgress {
                        id: evt_id.clone(),
                        percent: (frac * 100.0).round().clamp(0.0, 100.0) as u32,
                        stage: stage.to_string(),
                    },
                );
            },
            cancel,
        )
    })
    .await
    .map_err(|e| format!("Export failed to run: {e}"))?;

    state.cancels.lock().unwrap().remove(&cancels_cleanup_id);
    result
}

#[tauri::command]
pub async fn export_project_v2(
    app: AppHandle,
    state: State<'_, AppState>,
    id: String,
    data: ProjectDataV2,
    preset: String,
    keep_audio: bool,
    out_path: String,
) -> Result<(), String> {
    let eng = state.eng()?.clone();
    let (width, height, crf) = preset_dims(&preset);
    let output = PathBuf::from(&out_path);
    if let Some(parent) = output.parent() {
        if !parent.as_os_str().is_empty() && !parent.is_dir() {
            return Err("The folder you chose for the export doesn't exist.".into());
        }
    }

    let clips = resolve_timeline_clips(&state, &eng, &data)?;
    if clips.is_empty() {
        return Err("Add at least one clip before exporting.".into());
    }

    let cancel = Arc::new(AtomicBool::new(false));
    state
        .cancels
        .lock()
        .unwrap()
        .insert(id.clone(), cancel.clone());

    let opts = TimelineExportOptions {
        clips,
        keep_original_audio: keep_audio,
        width,
        height,
        crf,
        output,
    };

    let evt_id = id.clone();
    let cancels_cleanup_id = id.clone();
    let result = tauri::async_runtime::spawn_blocking(move || {
        eng.export_timeline_v2(
            &opts,
            move |frac, stage| {
                let _ = app.emit(
                    "export-progress",
                    ExportProgress {
                        id: evt_id.clone(),
                        percent: (frac * 100.0).round().clamp(0.0, 100.0) as u32,
                        stage: stage.to_string(),
                    },
                );
            },
            cancel,
        )
    })
    .await
    .map_err(|e| format!("Timeline export failed to run: {e}"))?;

    state.cancels.lock().unwrap().remove(&cancels_cleanup_id);
    result
}

fn resolve_timeline_clips(
    state: &AppState,
    eng: &Ffmpeg,
    data: &ProjectDataV2,
) -> Result<Vec<TimelineExportClip>, String> {
    let db = state.db.lock().unwrap();
    let mut out = Vec::new();
    for track in &data.timeline.tracks {
        let track_kind = match track.kind {
            TimelineTrackKindDto::Video => TimelineTrackKind::Video,
            TimelineTrackKindDto::Audio => TimelineTrackKind::Audio,
        };
        for clip in &track.clips {
            let row = db.get_media(&clip.media_id).map_err(|_| {
                "One of the timeline clips is no longer in the Media Bank. Remove it and try again."
                    .to_string()
            })?;
            let media_kind = media_kind_from_row(&row)?;
            let path = PathBuf::from(&row.path);
            let probe = match media_kind {
                TimelineMediaKind::Video | TimelineMediaKind::Audio => eng.probe(&path).ok(),
                TimelineMediaKind::Image => None,
            };
            let trim_start = clip.trim_start.max(0.0);
            let trim_end = if clip.trim_end.is_finite() && clip.trim_end > trim_start {
                clip.trim_end
            } else {
                probe
                    .as_ref()
                    .and_then(|p| p.duration)
                    .unwrap_or(trim_start + 0.1)
            };
            out.push(TimelineExportClip {
                input: path,
                track_kind,
                media_kind,
                start: clip.start.max(0.0),
                trim_start,
                duration: (trim_end - trim_start).max(0.1),
                has_audio: probe.map(|p| p.has_audio).unwrap_or(false),
                volume: clip.volume.unwrap_or(1.0),
                muted: clip.muted,
            });
        }
    }
    Ok(out)
}

fn media_kind_from_row(row: &MediaRow) -> Result<TimelineMediaKind, String> {
    match row.kind.as_str() {
        "video" => Ok(TimelineMediaKind::Video),
        "image" => Ok(TimelineMediaKind::Image),
        "audio" => Ok(TimelineMediaKind::Audio),
        _ => Err("There's a timeline clip type I don't understand.".into()),
    }
}

#[tauri::command]
pub fn cancel_export(state: State<AppState>, id: String) -> Result<(), String> {
    if let Some(flag) = state.cancels.lock().unwrap().get(&id) {
        flag.store(true, Ordering::SeqCst);
    }
    Ok(())
}

#[cfg(test)]
mod youtube_tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn parses_youtube_lockup_view_model() {
        let lockup = json!({
            "contentImage": {
                "thumbnailViewModel": {
                    "image": {
                        "sources": [
                            { "url": "https://i.ytimg.com/vi/cat7nDWwWlg/hqdefault.jpg", "width": 336, "height": 188 }
                        ]
                    },
                    "overlays": [
                        {
                            "thumbnailBottomOverlayViewModel": {
                                "badges": [
                                    { "thumbnailBadgeViewModel": { "text": "3:49" } }
                                ]
                            }
                        }
                    ]
                }
            },
            "metadata": {
                "lockupMetadataViewModel": {
                    "title": { "content": "Tenali Ram story" },
                    "metadata": {
                        "contentMetadataViewModel": {
                            "metadataRows": [
                                {
                                    "metadataParts": [
                                        { "text": { "content": "1.2K views" } },
                                        { "text": { "content": "2 days ago" } }
                                    ]
                                }
                            ]
                        }
                    }
                }
            },
            "contentId": "cat7nDWwWlg",
            "contentType": "LOCKUP_CONTENT_TYPE_VIDEO"
        });

        let video = parse_lockup_view_model(&lockup).expect("video should parse");
        assert_eq!(video.id, "cat7nDWwWlg");
        assert_eq!(video.title, "Tenali Ram story");
        assert_eq!(video.duration_text.as_deref(), Some("3:49"));
        assert_eq!(video.view_count_text.as_deref(), Some("1.2K views"));
        assert_eq!(video.published_text.as_deref(), Some("2 days ago"));
    }

    #[test]
    fn normalizes_app_settings_defaults() {
        let settings = normalize_app_settings(AppSettings {
            version: 999,
            appearance: AppearanceSettings {
                theme: "sepia".into(),
                reduced_motion: "maybe".into(),
                density: "wide".into(),
            },
            workflow: WorkflowSettings {
                start_view: "unknown".into(),
                default_project_phase: "middle".into(),
                show_autosave_status: false,
            },
            audio: AudioSettings {
                default_repair_mode: "always".into(),
                keep_originals: false,
            },
            export: ExportSettings {
                default_preset: "avi".into(),
                keep_original_audio: false,
                show_export_progress: false,
            },
            channel: ChannelSettings { enabled: false },
            advanced: AdvancedSettings {
                show_diagnostics: true,
                confirm_destructive_commands: false,
            },
        });
        assert_eq!(settings.version, 1);
        assert_eq!(settings.appearance.theme, "dark");
        assert_eq!(settings.appearance.reduced_motion, "system");
        assert_eq!(settings.appearance.density, "comfortable");
        assert_eq!(settings.workflow.start_view, "home");
        assert_eq!(settings.workflow.default_project_phase, "story");
        assert_eq!(settings.audio.default_repair_mode, "manual");
        assert_eq!(settings.export.default_preset, "mp4-full");
        assert!(!settings.channel.enabled);
        assert!(settings.advanced.show_diagnostics);
    }
}
