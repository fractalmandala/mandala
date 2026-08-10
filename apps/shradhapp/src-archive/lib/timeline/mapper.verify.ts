import type { MediaItem, ProjectData as ProjectDataV1 } from '$lib/backend/types';
import { VOICEOVER_TRACK_ID, projectV1ToV2, projectV2ToV1, roundtripProjectV1 } from './mapper';

export function verifyTimelineMapperRoundtrip(): void {
	const now = 1_800_000_000_000;
	const mediaItems: MediaItem[] = [
		mediaItem('video-a', 'video', 'a.mp4', 10),
		mediaItem('image-b', 'image', 'b.jpg', null),
		mediaItem('voice-c', 'audio', 'voice.m4a', 4)
	];
	const v1: ProjectDataV1 = {
		version: 1,
		name: 'Roundtrip',
		clips: [
			{ media_id: 'video-a', trim_start: 1, trim_end: 4 },
			{ media_id: 'image-b', trim_start: 0, trim_end: 2.5 }
		],
		voiceover_media_id: 'voice-c',
		created_at: now,
		updated_at: now
	};

	const { v1: roundtripped, v2 } = roundtripProjectV1(v1, { mediaItems, now });
	assertEqual(roundtripped, v1, 'v1 -> v2 -> v1 preserves v1 fields');
	assertEqual(v2.timeline.duration, 5.5, 'v2 timeline duration spans primary clips');
	assertEqual(v2.timeline.tracks.length, 2, 'v2 includes voiceover track when v1 has voiceover');

	const withoutVoiceover = projectV1ToV2({ ...v1, voiceover_media_id: null }, { mediaItems, now });
	assertEqual(withoutVoiceover.timeline.tracks.length, 1, 'v2 omits empty voiceover track');
	assertEqual(projectV2ToV1(withoutVoiceover).voiceover_media_id, null, 'v2 -> v1 keeps no voiceover');

	const removedVoiceover = projectV1ToV2(v1, { mediaItems, now });
	const voiceoverTrack = removedVoiceover.timeline.tracks.find((track) => track.id === VOICEOVER_TRACK_ID);
	if (voiceoverTrack) voiceoverTrack.clips = [];
	assertEqual(projectV2ToV1(removedVoiceover).voiceover_media_id, null, 'empty voiceover track wins over legacy id');
}

function mediaItem(id: string, kind: MediaItem['kind'], filename: string, duration: number | null): MediaItem {
	return {
		id,
		kind,
		filename,
		path: `/tmp/${filename}`,
		imported_at: 1_800_000_000_000,
		duration,
		width: kind === 'audio' ? null : 1920,
		height: kind === 'audio' ? null : 1080,
		tags: [],
		notes: '',
		thumb_path: null
	};
}

function assertEqual(actual: unknown, expected: unknown, message: string): void {
	if (JSON.stringify(actual) !== JSON.stringify(expected)) {
		throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
	}
}
