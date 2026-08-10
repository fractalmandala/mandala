mod bridge;
mod commands;
mod db;
pub mod media_engine;

use commands::AppState;
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::{Emitter, Manager, WebviewUrl, WebviewWindowBuilder};

/// The OpenReel ↔ Tauri bridge script, embedded at compile time.
/// This injects `window.openreel` into the webview before any page JS runs,
/// so OpenReel's `main.tsx` sees `window.openreel?.platform === "desktop"`.
const BRIDGE_SCRIPT: &str = include_str!("../static/openreel-bridge.js");

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let data_dir = app
                .path()
                .app_data_dir()
                .map_err(|e| format!("Cannot find app data directory: {e}"))?;
            let lib_dir = data_dir.join("library");
            let thumb_dir = data_dir.join("thumbnails");
            let imports_dir = data_dir.join("imports");
            std::fs::create_dir_all(&lib_dir)
                .and_then(|_| std::fs::create_dir_all(&thumb_dir))
                .and_then(|_| std::fs::create_dir_all(&imports_dir))
                .map_err(|e| format!("Cannot create library folders: {e}"))?;
            let db = db::Db::open(&data_dir.join("media_bank.db"))?;
            let ffmpeg = media_engine::Ffmpeg::locate();
            if let Err(e) = &ffmpeg {
                eprintln!("[shradhapp] warning: {e}");
            }
            app.manage(AppState {
                db: Mutex::new(db),
                data_dir,
                lib_dir,
                thumb_dir,
                ffmpeg,
                cancels: Mutex::new(HashMap::new()),
            });
            // Bridge state for the OpenReel desktop integration
            app.manage(bridge::WriteHandles::default());
            app.manage(bridge::ExportJobs::default());
            app.manage(bridge::LastDownload::default());

            // Create the main window programmatically so we can inject the
            // OpenReel bridge script before the page's own JS executes.
            // The window config in tauri.conf.json is empty (no `windows`
            // entries) — this builder replaces it.
            WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
                .title("Shradhapp")
                .inner_size(1280.0, 800.0)
                .min_inner_size(1024.0, 640.0)
                .resizable(true)
                .maximized(true)
                .title_bar_style(tauri::TitleBarStyle::Overlay)
                .hidden_title(true)
                .initialization_script(BRIDGE_SCRIPT)
                // Route webview downloads (e.g. Wavacity audio exports) into
                // the app-data imports folder and notify the frontend so the
                // file can be imported straight into the video editor.
                .on_download(|webview, event| {
                    use tauri::webview::DownloadEvent;
                    let app = webview.app_handle();
                    match event {
                        DownloadEvent::Requested { url: _url, destination } => {
                            if let Some(state) = app.try_state::<AppState>() {
                                let imports_dir = state.data_dir.join("imports");
                                let _ = std::fs::create_dir_all(&imports_dir);
                                let fallback = {
                                    let secs = std::time::SystemTime::now()
                                        .duration_since(std::time::UNIX_EPOCH)
                                        .map(|d| d.as_secs())
                                        .unwrap_or(0);
                                    format!("shradhapp-audio-{secs}.wav")
                                };
                                let file_name = destination
                                    .file_name()
                                    .map(|n| n.to_string_lossy().to_string())
                                    .filter(|n| !n.is_empty())
                                    .unwrap_or(fallback);
                                let target = imports_dir.join(file_name);
                                if let Some(last) = app.try_state::<bridge::LastDownload>() {
                                    *last.path.lock().unwrap() = Some(target.clone());
                                }
                                *destination = target;
                            }
                        }
                        DownloadEvent::Finished { url: _url, path, success } => {
                            let resolved = path.filter(|p| !p.as_os_str().is_empty()).or_else(|| {
                                app.try_state::<bridge::LastDownload>()
                                    .and_then(|last| last.path.lock().unwrap().clone())
                            });
                            let _ = app.emit(
                                "shradhapp:download-finished",
                                serde_json::json!({ "path": resolved, "success": success }),
                            );
                        }
                        _ => {}
                    }
                    true
                })
                .build()?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // -- existing shradhapp commands --
            commands::list_media,
            commands::import_files,
            commands::rename_media,
            commands::set_tags,
            commands::set_notes,
            commands::delete_media,
            commands::save_recording,
            commands::cleanup_audio,
            commands::repair_audio_ticks,
            commands::extract_audio_region,
            commands::cut_audio_region,
            commands::silence_audio_region,
            commands::fade_audio,
            commands::normalize_audio,
            commands::get_waveform_data,
            commands::detect_silence_regions,
            commands::generate_video_proxy,
            commands::list_projects,
            commands::create_project,
            commands::update_project,
            commands::map_project_v1_to_v2,
            commands::delete_project,
            commands::duplicate_project,
            commands::export_project,
            commands::export_project_v2,
            commands::cancel_export,
            commands::list_youtube_channel_videos,
            commands::get_app_settings,
            commands::update_app_settings,
            commands::reset_app_settings,
            commands::get_runtime_info,
            // -- OpenReel desktop bridge commands --
            bridge::or_fs_show_save_dialog,
            bridge::or_fs_show_open_dialog,
            bridge::or_fs_show_open_dialog_multi,
            bridge::or_fs_read_file,
            bridge::or_fs_read_file_bytes,
            bridge::or_fs_temp_file_path,
            bridge::or_fs_write_file,
            bridge::or_fs_open_write,
            bridge::or_fs_write_chunk,
            bridge::or_fs_close_write,
            bridge::or_fs_abort_write,
            bridge::or_fs_reveal_in_folder,
            bridge::or_win_minimize,
            bridge::or_win_toggle_maximize,
            bridge::or_win_close,
            bridge::or_win_is_maximized,
            bridge::or_probe_hardware,
            bridge::or_export_start,
            bridge::or_export_write_audio_chunk,
            bridge::or_export_write_audio_wav,
            bridge::or_export_finish_audio,
            bridge::or_export_cancel,
            bridge::or_media_generate_proxy,
            bridge::or_media_transcode,
            bridge::or_media_extract_audio_wav,
            bridge::or_media_probe_audio_streams,
            bridge::or_media_fetch_url,
            bridge::or_keychain_get,
            bridge::or_keychain_set,
            bridge::or_keychain_delete,
            bridge::or_crash_report,
            // -- OpenReel storage adapter commands --
            bridge::or_storage_save_project,
            bridge::or_storage_load_project,
            bridge::or_storage_list_projects,
            bridge::or_storage_delete_project,
            bridge::or_storage_save_cache,
            bridge::or_storage_load_cache,
            bridge::or_storage_delete_cache,
            bridge::or_storage_clear_cache,
            bridge::or_storage_save_waveform,
            bridge::or_storage_load_waveform,
            bridge::or_storage_delete_waveform,
            bridge::or_storage_get_usage,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Shradhapp");
}
