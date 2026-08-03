import type { Clip, MediaItem, ProjectData as ProjectDataV1 } from '$lib/backend/types';
import type {
	ProjectDataAny,
	ProjectDataV1MapperOptions,
	ProjectDataV2,
	ProjectDataV2MapperOptions,
	TimelineClip,
	TimelineSettings,
	TimelineTrack,
	TimelineTrackKind,
	V1RoundtripResult
} from './model';

export const PRIMARY_VIDEO_TRACK_ID = 'track-video-primary';
export const VOICEOVER_TRACK_ID = 'track-audio-voiceover';

const DEFAULT_SETTINGS: TimelineSettings = {
	width: 1920,
	height: 1080,
	fps: 30,
	sampleRate: 44_100
};

export function isProjectDataV1(data: ProjectDataAny): data is ProjectDataV1 {
	return data.version === 1;
}

export function isProjectDataV2(data: ProjectDataAny): data is ProjectDataV2 {
	return data.version === 2;
}

export function projectV1ToV2(data: ProjectDataV1, options: ProjectDataV2MapperOptions = {}): ProjectDataV2 {
	const mediaById = new Map((options.mediaItems ?? []).map((item) => [item.id, item]));
	const settings = { ...DEFAULT_SETTINGS, ...options.settings };
	const videoTrack = createTrack(PRIMARY_VIDEO_TRACK_ID, 'video', 'Primary video');
	const voiceoverTrack = createTrack(VOICEOVER_TRACK_ID, 'audio', 'Voiceover');
	let cursor = 0;

	data.clips.forEach((clip, index) => {
		const item = mediaById.get(clip.media_id);
		const duration = normalizedClipDuration(clip);
		const timelineClip = createTimelineClip({
			clip,
			index,
			trackId: PRIMARY_VIDEO_TRACK_ID,
			timelineStart: cursor,
			item,
			fallbackKind: item?.kind ?? 'video'
		});

		videoTrack.clips.push(timelineClip);
		cursor += duration;
	});

	if (data.voiceover_media_id) {
		const item = mediaById.get(data.voiceover_media_id);
		voiceoverTrack.clips.push({
			id: `clip-voiceover-${safeId(data.voiceover_media_id)}`,
			trackId: VOICEOVER_TRACK_ID,
			mediaId: data.voiceover_media_id,
			kind: 'audio',
			name: item?.filename ?? null,
			timeline: {
				start: 0,
				duration: Math.max(item?.duration ?? cursor, 0.1)
			},
			source: {
				trimStart: 0,
				trimEnd: Math.max(item?.duration ?? cursor, 0.1)
			},
			volume: 1,
			muted: false
		});
	}

	const tracks = voiceoverTrack.clips.length > 0 ? [videoTrack, voiceoverTrack] : [videoTrack];
	const duration = timelineDuration(tracks);

	return {
		version: 2,
		name: data.name,
		timeline: {
			tracks,
			duration,
			settings
		},
		created_at: data.created_at,
		updated_at: options.now ?? data.updated_at,
		legacy: {
			voiceover_media_id: data.voiceover_media_id
		}
	};
}

export function projectV2ToV1(data: ProjectDataV2, options: ProjectDataV1MapperOptions = {}): ProjectDataV1 {
	const clips = orderedPrimaryClips(data).map(v2ClipToV1Clip);
	const voiceoverTrack = data.timeline.tracks.find((track) => track.id === VOICEOVER_TRACK_ID);
	const voiceoverMediaId = voiceoverTrack
		? (voiceoverTrack.clips.find((clip) => !clip.muted)?.mediaId ?? null)
		: (data.legacy?.voiceover_media_id ?? null);

	return {
		version: 1,
		name: data.name,
		clips,
		voiceover_media_id: voiceoverMediaId,
		created_at: data.created_at,
		updated_at: options.now ?? data.updated_at
	};
}

export function projectToV2(data: ProjectDataAny, options: ProjectDataV2MapperOptions = {}): ProjectDataV2 {
	return isProjectDataV2(data) ? normalizeProjectV2(data, options) : projectV1ToV2(data, options);
}

export function roundtripProjectV1(
	data: ProjectDataV1,
	options: ProjectDataV2MapperOptions & ProjectDataV1MapperOptions = {}
): V1RoundtripResult {
	const v2 = projectV1ToV2(data, options);
	return {
		v1: projectV2ToV1(v2, options),
		v2
	};
}

export function normalizeProjectV2(data: ProjectDataV2, options: ProjectDataV2MapperOptions = {}): ProjectDataV2 {
	const tracks = data.timeline.tracks.map((track) => ({
		...track,
		clips: track.clips
			.map((clip) => normalizeTimelineClip(clip, track.id))
			.sort((a, b) => a.timeline.start - b.timeline.start)
	}));

	return {
		...data,
		timeline: {
			tracks,
			duration: timelineDuration(tracks),
			settings: { ...DEFAULT_SETTINGS, ...data.timeline.settings, ...options.settings }
		},
		updated_at: options.now ?? data.updated_at
	};
}

export function timelineDuration(tracks: readonly TimelineTrack[]): number {
	return roundSeconds(
		tracks.reduce((max, track) => {
			const trackEnd = track.clips.reduce(
				(clipMax, clip) => Math.max(clipMax, clip.timeline.start + clip.timeline.duration),
				0
			);
			return Math.max(max, trackEnd);
		}, 0)
	);
}

function orderedPrimaryClips(data: ProjectDataV2): TimelineClip[] {
	const preferred = data.timeline.tracks.find((track) => track.id === PRIMARY_VIDEO_TRACK_ID);
	const fallback = data.timeline.tracks.find((track) => track.kind === 'video');
	const clips = (preferred ?? fallback)?.clips ?? [];
	return [...clips].sort((a, b) => a.timeline.start - b.timeline.start);
}

function v2ClipToV1Clip(clip: TimelineClip): Clip {
	return {
		media_id: clip.mediaId,
		trim_start: roundSeconds(clip.source.trimStart),
		trim_end: roundSeconds(Math.max(clip.source.trimEnd, clip.source.trimStart + 0.1))
	};
}

function createTrack(id: string, kind: TimelineTrackKind, name: string): TimelineTrack {
	return {
		id,
		kind,
		name,
		clips: [],
		muted: false,
		locked: false
	};
}

function createTimelineClip(input: {
	clip: Clip;
	index: number;
	trackId: string;
	timelineStart: number;
	item?: MediaItem;
	fallbackKind: TimelineClip['kind'];
}): TimelineClip {
	const duration = normalizedClipDuration(input.clip);
	return {
		id: `clip-${input.index + 1}-${safeId(input.clip.media_id)}`,
		trackId: input.trackId,
		mediaId: input.clip.media_id,
		kind: input.item?.kind ?? input.fallbackKind,
		name: input.item?.filename ?? null,
		timeline: {
			start: roundSeconds(input.timelineStart),
			duration
		},
		source: {
			trimStart: roundSeconds(Math.max(0, input.clip.trim_start)),
			trimEnd: roundSeconds(Math.max(input.clip.trim_end, input.clip.trim_start + 0.1))
		},
		volume: input.item?.kind === 'image' ? 0 : 1,
		muted: false
	};
}

function normalizeTimelineClip(clip: TimelineClip, trackId: string): TimelineClip {
	const trimStart = Math.max(0, clip.source.trimStart);
	const trimEnd = Math.max(clip.source.trimEnd, trimStart + 0.1);
	const duration = Math.max(clip.timeline.duration, trimEnd - trimStart, 0.1);

	return {
		...clip,
		trackId,
		timeline: {
			start: roundSeconds(Math.max(0, clip.timeline.start)),
			duration: roundSeconds(duration)
		},
		source: {
			trimStart: roundSeconds(trimStart),
			trimEnd: roundSeconds(trimEnd)
		},
		volume: clamp(clip.volume, 0, 2)
	};
}

function normalizedClipDuration(clip: Clip): number {
	return roundSeconds(Math.max(clip.trim_end - clip.trim_start, 0.1));
}

function safeId(value: string): string {
	return value.replace(/[^a-zA-Z0-9_-]/g, '-');
}

function roundSeconds(value: number): number {
	return Math.round(value * 1000) / 1000;
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}
