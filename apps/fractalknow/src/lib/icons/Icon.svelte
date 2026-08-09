<script lang="ts">
	/**
	 * Lightweight lucide-style icon set (inline paths, no runtime dependency).
	 * Names match the source app's most common affordances.
	 */
	import type { IconName } from './types';

	let {
		name,
		size = 16,
		strokeWidth = 2,
		label = undefined,
	}: {
		name: IconName;
		size?: number;
		strokeWidth?: number;
		label?: string;
	} = $props();

	const paths: Record<IconName, string> = {
		search: 'M11 11l8 8M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z',
		folder: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
		'folder-open':
			'M3 8h18l-1.5 10.5a2 2 0 0 1-2 1.5H6.5a2 2 0 0 1-2-1.5L3 8zm0 0l1.5-3h5l2 2H21',
		file: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5',
		'file-text':
			'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5 M9 13h6 M9 17h6 M9 9h1',
		plus: 'M12 5v14M5 12h14',
		x: 'M6 6l12 12M18 6L6 18',
		'chevron-right': 'M9 6l6 6-6 6',
		'chevron-down': 'M6 9l6 6 6-6',
		command: 'M9 9H5a2 2 0 1 1 2-2v12a2 2 0 1 1-2-2h4M15 9h4a2 2 0 1 0-2-2v12a2 2 0 1 0 2-2h-4',
		settings:
			'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
		activity: 'M3 12h4l3-8 4 16 3-8h4',
		bug: 'M9 9V5a3 3 0 0 1 6 0v4M8 14h8M8 10H5l-2 2M16 10h3l2 2M8 18H5l-2-2M16 18h3l2-2M9 9h6v10a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z',
		send: 'M22 2L11 13M22 2l-7 20-4-9-9-4z',
		terminal: 'M4 6l6 6-6 6M12 18h8',
		eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
		'eye-off':
			'M3 3l18 18M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-4.6M9.9 5.1A10.9 10.9 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-4.2 4.8M6.1 6.1A17.7 17.7 0 0 0 2 12s3.5 7 10 7a10.5 10.5 0 0 0 4.1-.8',
		save: 'M5 3h11l3 3v15H5z M8 3v6h8 M8 21v-7h8v7',
		history: 'M3 12a9 9 0 1 0 3-6.7M3 4v5h5 M12 7v5l3 2',
		'alert-triangle': 'M12 3l10 18H2z M12 10v4 M12 17h.01',
		'check-circle': 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M8 12l3 3 5-6',
		info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 11v5 M12 8h.01',
		image: 'M4 5h16v14H4z M8 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M4 16l5-5 4 4 3-3 4 4',
		code: 'M8 8l-4 4 4 4M16 8l4 4-4 4',
		markdown: 'M3 6h18v12H3z M7 15V9l3 4 3-4v6 M17 12v3 M17 12l2 2 2-2',
		json: 'M8 4c-2 0-3 1-3 3v2c0 1-1 2-2 2 1 0 2 1 2 2v2c0 2 1 3 3 3 M16 4c2 0 3 1 3 3v2c0 1 1 2 2 2-1 0-2 1-2 2v2c0 2-1 3-3 3',
		yaml: 'M6 5v6a3 3 0 0 0 6 0V5 M16 5v14',
		mermaid: 'M4 16c2-6 5-10 8-10s6 4 8 10 M8 16c1-3 2.5-5 4-5s3 2 4 5',
		unknown: 'M9 9a3 3 0 1 1 4.5 2.6C12.5 12.5 12 13 12 15 M12 18h.01 M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
		'pin-on': 'M12 17v5 M9 4h6l-1 5 3 3-2 2H9l-2-2 3-3z M9 4l-1-1 M15 4l1-1',
		'pin-off': 'M12 17v5 M9 4h6 M9 4l-1-1 M15 4l1-1 M3 3l18 18',
	};
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width={strokeWidth}
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden={label ? undefined : 'true'}
	role={label ? 'img' : undefined}
	aria-label={label}
	class="icon"
>
	<path d={paths[name]} />
</svg>

<style lang="sass">
	.icon
		display: inline-block
		flex: 0 0 auto
		vertical-align: middle
</style>
