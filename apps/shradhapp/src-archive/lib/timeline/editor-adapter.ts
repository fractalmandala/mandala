import {
	createEmptyProject,
	defaultProjectBackground,
	secToFrame,
	frameToSec,
	isMediaClip,
	type BinItem,
	type MediaClip,
	type MediaType,
	type TimelineFps,
	type TimelineProject as EditorTimelineProject,
	type TimelineTrack as EditorTimelineTrack
} from '../../../svelte-video-editor-ref/src/lib';
import type { MediaItem } from '$lib/backend/types';
import type {
	ProjectDataV2,
	ProjectDataV2ExportDto,
	TimelineClip,
	TimelineTrack
} from './model';

const TRACK_HEIGHT = 56;

export function mediaItemToBinItem(item: MediaItem, url: string): BinItem {
	return {
		id: item.id,
		assetId: item.id,
		url,
		name: item.filename,
		mediaType: mediaKindToEditorType(item.kind),
		duration: item.duration
	};
}

export function projectDataV2ToEditorProject(
	data: ProjectDataV2,
	mediaItems: readonly MediaItem[],
	resolveUrl: (item: MediaItem) => string,
	id: string
): EditorTimelineProject {
	const mediaById = new Map(mediaItems.map((item) => [item.id, item]));
	const fps = normalizeFps(data.timeline.settings.fps);
	const base = createEmptyProject(data.name, { fps });
	const tracks = data.timeline.tracks.map(toEditorTrack);
	const clips = data.timeline.tracks.flatMap((track) =>
		track.clips.flatMap((clip) => {
			const item = mediaById.get(clip.mediaId);
			if (!item) return [];
			return [toEditorMediaClip(clip, item, resolveUrl(item), fps)];
		})
	);

	return {
		...base,
		id,
		name: data.name,
		fps,
		tracks: tracks.length > 0 ? tracks : base.tracks,
		clips,
		bin: mediaItems.map((item) => mediaItemToBinItem(item, resolveUrl(item))),
		zoom: base.zoom,
		background: defaultProjectBackground(),
		createdAt: data.created_at,
		updatedAt: data.updated_at
	};
}

export function editorProjectToProjectDataV2(
	project: EditorTimelineProject,
	previous: ProjectDataV2
): ProjectDataV2 {
	const tracks = project.tracks.map((track) => toProjectDataV2Track(track, project));
	return {
		version: 2,
		name: project.name,
		timeline: {
			tracks,
			duration: Math.max(...tracks.flatMap((track) => track.clips.map((clip) => clip.timeline.start + clip.timeline.duration)), 0),
			settings: {
				...previous.timeline.settings,
				fps: project.fps
			}
		},
		created_at: previous.created_at,
		updated_at: Date.now(),
		legacy: previous.legacy
	};
}

export function projectDataV2ToExportDto(data: ProjectDataV2): ProjectDataV2ExportDto {
	return {
		version: 2,
		name: data.name,
		timeline: {
			tracks: data.timeline.tracks.map((track) => ({
				id: track.id,
				kind: track.kind,
				clips: track.clips.map((clip) => ({
					id: clip.id,
					media_id: clip.mediaId,
					start: clip.timeline.start,
					trim_start: clip.source.trimStart,
					trim_end: clip.source.trimEnd,
					volume: clip.volume,
					muted: clip.muted
				}))
			}))
		},
		created_at: data.created_at,
		updated_at: data.updated_at
	};
}

function mediaKindToEditorType(kind: MediaItem['kind']): MediaType {
	return kind === 'image' ? 'image' : kind;
}

function normalizeFps(fps: number): TimelineFps {
	return [24, 25, 30, 50, 60].includes(fps) ? (fps as TimelineFps) : 30;
}

function toEditorTrack(track: TimelineTrack): EditorTimelineTrack {
	return {
		id: track.id,
		name: track.name,
		muted: track.muted,
		solo: false,
		hidden: false,
		locked: track.locked,
		height: TRACK_HEIGHT
	};
}

function toEditorMediaClip(
	clip: TimelineClip,
	item: MediaItem,
	url: string,
	fps: TimelineFps
): MediaClip {
	return {
		id: clip.id,
		trackId: clip.trackId,
		startF: secToFrame(clip.timeline.start, fps),
		durationF: Math.max(1, secToFrame(clip.timeline.duration, fps)),
		groupId: null,
		locked: false,
		name: clip.name ?? item.filename,
		kind: item.kind,
		url,
		assetId: item.id,
		trimInF: secToFrame(clip.source.trimStart, fps),
		sourceDurationF: item.kind === 'image' || item.duration == null ? null : secToFrame(item.duration, fps),
		volume: clip.volume,
		fadeInF: 0,
		fadeOutF: 0,
		linkId: null
	};
}

function toProjectDataV2Track(track: EditorTimelineTrack, project: EditorTimelineProject): TimelineTrack {
	const clips = project.clips
		.flatMap((clip) =>
			clip.trackId === track.id && isMediaClip(clip) ? [toProjectDataV2Clip(clip, project.fps)] : []
		)
		.sort((a, b) => a.timeline.start - b.timeline.start);
	const allAudio = clips.length > 0 && clips.every((clip) => clip.kind === 'audio');
	return {
		id: track.id,
		kind: allAudio ? 'audio' : 'video',
		name: track.name,
		clips,
		muted: track.muted,
		locked: track.locked
	};
}

function toProjectDataV2Clip(clip: MediaClip, fps: TimelineFps): TimelineClip {
	const trimStart = frameToSec(clip.trimInF, fps);
	const duration = frameToSec(clip.durationF, fps);
	return {
		id: clip.id,
		trackId: clip.trackId,
		mediaId: clip.assetId ?? clip.url,
		kind: clip.kind,
		name: clip.name,
		timeline: {
			start: frameToSec(clip.startF, fps),
			duration
		},
		source: {
			trimStart,
			trimEnd: trimStart + duration
		},
		volume: clip.volume,
		muted: false
	};
}
