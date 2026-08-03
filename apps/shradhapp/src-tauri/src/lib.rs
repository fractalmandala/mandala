mod commands;
mod db;
pub mod media_engine;

use commands::AppState;
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::Manager;

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
            std::fs::create_dir_all(&lib_dir)
                .and_then(|_| std::fs::create_dir_all(&thumb_dir))
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
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::list_media,
            commands::import_files,
            commands::rename_media,
            commands::set_tags,
            commands::set_notes,
            commands::delete_media,
            commands::save_recording,
            commands::cleanup_audio,
			commands::repair_audio_ticks,
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
        ])
        .run(tauri::generate_context!())
        .expect("error while running Shradhapp");
}
