import type { Clip, MediaItem, ProjectData as ProjectDataV1 } from '$lib/backend/types';

export type ProjectSchemaVersion = 1 | 2;
export type TimelineTrackKind = 'video' | 'audio';
export type TimelineClipKind = MediaItem['kind'];

export interface TimelineTimeRange {
	start: number;
	duration: number;
}

export interface TimelineSourceRange {
	trimStart: number;
	trimEnd: number;
}

export interface TimelineClip {
	id: string;
	trackId: string;
	mediaId: string;
	kind: TimelineClipKind;
	name: string | null;
	timeline: TimelineTimeRange;
	source: TimelineSourceRange;
	volume: number;
	muted: boolean;
}

export interface TimelineTrack {
	id: string;
	kind: TimelineTrackKind;
	name: string;
	clips: TimelineClip[];
	muted: boolean;
	locked: boolean;
}

export interface TimelineSettings {
	width: number;
	height: number;
	fps: number;
	sampleRate: number;
}

export interface ProjectDataV2 {
	version: 2;
	name: string;
	timeline: {
		tracks: TimelineTrack[];
		duration: number;
		settings: TimelineSettings;
	};
	created_at: number;
	updated_at: number;
	legacy?: {
		voiceover_media_id?: string | null;
	};
}

export interface ProjectDataV2MapperOptions {
	mediaItems?: readonly MediaItem[];
	now?: number;
	settings?: Partial<TimelineSettings>;
}

export interface ProjectDataV1MapperOptions {
	now?: number;
}

export type ProjectDataAny = ProjectDataV1 | ProjectDataV2;

export interface V1RoundtripResult {
	v1: ProjectDataV1;
	v2: ProjectDataV2;
}

export type TimelineClipSource = Clip & {
	item?: MediaItem;
};

export interface ProjectDataV2ExportClip {
	id: string;
	media_id: string;
	start: number;
	trim_start: number;
	trim_end: number;
	volume?: number;
	muted?: boolean;
}

export interface ProjectDataV2ExportTrack {
	id: string;
	kind: TimelineTrackKind;
	clips: ProjectDataV2ExportClip[];
}

export interface ProjectDataV2ExportDto {
	version: 2;
	name: string;
	timeline: {
		tracks: ProjectDataV2ExportTrack[];
	};
	created_at: number;
	updated_at: number;
}
