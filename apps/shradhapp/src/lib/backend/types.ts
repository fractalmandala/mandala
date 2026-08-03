import type { ProjectDataV2, ProjectDataV2ExportDto } from '$lib/timeline/model';

export type MediaKind = 'video' | 'image' | 'audio';

export interface MediaItem {
  id: string;
  kind: MediaKind;
  filename: string;
  path: string;
  imported_at: number; // epoch millis
  duration: number | null; // seconds, null for images
  width: number | null;
  height: number | null;
  tags: string[];
  notes: string;
  thumb_path: string | null;
}

export interface Clip {
  media_id: string;
  trim_start: number; // seconds; for images this is 0
  trim_end: number; // seconds; for images this is the still-segment length
}

export interface ProjectData {
  version: 1;
  name: string;
  clips: Clip[];
  voiceover_media_id: string | null;
  created_at: number;
	updated_at: number;
}

export type ProjectDataAny = ProjectData | ProjectDataV2;

export interface ProjectRecord {
	id: string;
	name: string;
	data: ProjectDataAny;
	created_at: number;
	updated_at: number;
}

export type ExportPreset = 'mp4-full' | 'mp4-small' | 'mov';
export type ThemeSetting = 'dark' | 'light' | 'system';
export type MotionSetting = 'system' | 'reduce' | 'full';
export type DensitySetting = 'comfortable' | 'compact';
export type StartViewSetting = 'home' | 'lastProject';
export type ProjectPhaseSetting = 'gather' | 'story' | 'sound' | 'finish';
export type AudioRepairMode = 'manual' | 'autoAfterRecording';

export interface AppSettings {
	version: 1;
	appearance: {
		theme: ThemeSetting;
		reducedMotion: MotionSetting;
		density: DensitySetting;
	};
	workflow: {
		startView: StartViewSetting;
		defaultProjectPhase: ProjectPhaseSetting;
		showAutosaveStatus: boolean;
	};
	audio: {
		defaultRepairMode: AudioRepairMode;
		keepOriginals: boolean;
	};
	export: {
		defaultPreset: ExportPreset;
		keepOriginalAudio: boolean;
		showExportProgress: boolean;
	};
	channel: {
		enabled: boolean;
	};
	advanced: {
		showDiagnostics: boolean;
		confirmDestructiveCommands: boolean;
	};
}

export interface RuntimeInfo {
	appDataDir: string;
	libraryDir: string;
	thumbnailDir: string;
	ffmpegAvailable: boolean;
	ffmpegMessage: string;
}

export interface ExportProgress {
  id: string;
  percent: number; // 0..100
  stage: string;
}

export interface CleanupResult {
  cleaned: MediaItem;
  before_duration: number;
  after_duration: number;
}

export interface YouTubeVideo {
	id: string;
	title: string;
	url: string;
	embed_url: string;
	thumbnail_url: string | null;
	published_text: string | null;
	duration_text: string | null;
	view_count_text: string | null;
}

/** The single backend surface the UI talks to: real Tauri commands in the desktop app. */
export interface Backend {
  isTauri: boolean;

  // Media bank
  listMedia(): Promise<MediaItem[]>;
  /** Open a native file picker and import the chosen files. */
  pickImport(): Promise<MediaItem[] | null>;
  /** Import dropped items from absolute paths provided by the Tauri webview. */
  importDropped(paths: string[]): Promise<MediaItem[]>;
  renameMedia(id: string, name: string): Promise<void>;
  deleteMedia(id: string): Promise<void>;
  setTags(id: string, tags: string[]): Promise<void>;
  setNotes(id: string, notes: string): Promise<void>;
  /** Playable/displayable URL for the media itself. */
  mediaUrl(item: MediaItem): string;
  /** URL for the item's thumbnail. */
  thumbUrl(item: MediaItem): string;

  // Voiceover
  saveRecording(blob: Blob, ext: string, name: string): Promise<MediaItem>;
  cleanupAudio(id: string): Promise<CleanupResult>;
	/** Detect and repair short impulsive clicks/ticks into a separate local copy. */
	repairAudioTicks(id: string): Promise<CleanupResult>;

  // Projects
  listProjects(): Promise<ProjectRecord[]>;
  createProject(name: string): Promise<ProjectRecord>;
  updateProject(id: string, data: ProjectDataAny): Promise<void>;
  deleteProject(id: string): Promise<void>;
  duplicateProject(id: string): Promise<ProjectRecord>;

  // Export
  pickSavePath(defaultName: string, ext: string): Promise<string | null>;
  exportProject(
    id: string,
    data: ProjectData,
    preset: ExportPreset,
    keepAudio: boolean,
    outPath: string
  ): Promise<void>;
  exportTimelineProject(
    id: string,
    data: ProjectDataV2ExportDto,
    preset: ExportPreset,
    keepAudio: boolean,
    outPath: string
  ): Promise<void>;
  onExportProgress(cb: (p: ExportProgress) => void): () => void;
  cancelExport(id: string): Promise<void>;

  // Public channel viewer
  listYouTubeChannelVideos(): Promise<YouTubeVideo[]>;

	// App settings
	getAppSettings(): Promise<AppSettings>;
	updateAppSettings(settings: AppSettings): Promise<AppSettings>;
	resetAppSettings(): Promise<AppSettings>;
	getRuntimeInfo(): Promise<RuntimeInfo>;
}
