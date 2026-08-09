import { invoke, convertFileSrc } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/plugin-dialog';
import { listen } from '@tauri-apps/api/event';
import type {
  Backend,
  CleanupResult,
  ExportPreset,
  ExportProgress,
  MediaItem,
  ProjectData,
  ProjectDataAny,
  ProjectRecord,
  AppSettings,
  RuntimeInfo,
  SilenceRegion,
  YouTubeVideo
} from './types';
import { fallbackThumb } from '../utils';

const MEDIA_EXTENSIONS = [
  'mp4', 'mov', 'mkv', 'avi', 'webm', 'm4v', 'mpg', 'mpeg',
  'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'heic',
  'mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac', 'opus'
];

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const s = reader.result as string;
      resolve(s.slice(s.indexOf(',') + 1));
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export const tauriBackend: Backend = {
  isTauri: true,

  listMedia: () => invoke<MediaItem[]>('list_media'),

  async pickImport() {
    const res = await open({
      multiple: true,
      filters: [{ name: 'Videos, photos & audio', extensions: MEDIA_EXTENSIONS }]
    });
    if (!res) return null;
    const paths = Array.isArray(res) ? res : [res];
    return invoke<MediaItem[]>('import_files', { paths });
  },

  async importDropped(paths: string[]) {
    if (!paths.length) return [];
    return invoke<MediaItem[]>('import_files', { paths });
  },

  renameMedia: (id, name) => invoke('rename_media', { id, name }),
  deleteMedia: (id) => invoke('delete_media', { id }),
  setTags: (id, tags) => invoke('set_tags', { id, tags }),
  setNotes: (id, notes) => invoke('set_notes', { id, notes }),

  mediaUrl: (item) => convertFileSrc(item.path),
  thumbUrl: (item) => (item.thumb_path ? convertFileSrc(item.thumb_path) : fallbackThumb(item)),

  async saveRecording(blob, ext, name) {
    const dataB64 = await blobToBase64(blob);
    return invoke<MediaItem>('save_recording', { dataB64, ext, name });
  },

  cleanupAudio: (id) => invoke<CleanupResult>('cleanup_audio', { id }),
	repairAudioTicks: (id) => invoke<CleanupResult>('repair_audio_ticks', { id }),

	extractAudioRegion: (id, start, end) =>
		invoke<CleanupResult>('extract_audio_region', { id, start, end }),
	cutAudioRegion: (id, start, end) =>
		invoke<CleanupResult>('cut_audio_region', { id, start, end }),
	silenceAudioRegion: (id, start, end) =>
		invoke<CleanupResult>('silence_audio_region', { id, start, end }),
	fadeAudio: (id, start, duration, fadeIn) =>
		invoke<CleanupResult>('fade_audio', { id, start, duration, fadeIn }),
	normalizeAudio: (id) => invoke<CleanupResult>('normalize_audio', { id }),
	getWaveformData: (id, samples) => invoke<number[]>('get_waveform_data', { id, samples }),
	detectSilenceRegions: (id) => invoke<SilenceRegion[]>('detect_silence_regions', { id }),
	generateVideoProxy: (id) => invoke<string>('generate_video_proxy', { id }),

  listProjects: () => invoke<ProjectRecord[]>('list_projects'),
  createProject: (name) => invoke<ProjectRecord>('create_project', { name }),
  updateProject: (id, data: ProjectDataAny) => invoke('update_project', { id, data }),
  deleteProject: (id) => invoke('delete_project', { id }),
  duplicateProject: (id) => invoke<ProjectRecord>('duplicate_project', { id }),

  pickSavePath: (defaultName, ext) =>
    save({ defaultPath: defaultName, filters: [{ name: ext.toUpperCase(), extensions: [ext] }] }),

  exportProject: (id, data, preset: ExportPreset, keepAudio: boolean, outPath: string) =>
    invoke('export_project', { id, data, preset, keepAudio, outPath }),

  exportTimelineProject: (id, data, preset: ExportPreset, keepAudio: boolean, outPath: string) =>
    invoke('export_project_v2', { id, data, preset, keepAudio, outPath }),

  onExportProgress(cb: (p: ExportProgress) => void) {
    let unlisten: (() => void) | null = null;
    listen<ExportProgress>('export-progress', (e) => cb(e.payload)).then((f) => {
      unlisten = f;
    });
    return () => unlisten?.();
  },

  cancelExport: (id) => invoke('cancel_export', { id }),

  listYouTubeChannelVideos: () => invoke<YouTubeVideo[]>('list_youtube_channel_videos'),

	getAppSettings: () => invoke<AppSettings>('get_app_settings'),
	updateAppSettings: (settings) => invoke<AppSettings>('update_app_settings', { settings }),
	resetAppSettings: () => invoke<AppSettings>('reset_app_settings'),
	getRuntimeInfo: () => invoke<RuntimeInfo>('get_runtime_info')
};
