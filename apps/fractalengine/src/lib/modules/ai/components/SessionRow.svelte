<script lang="ts">
	import type { AiSessionMeta } from '../types';

	let {
		session,
		isActive = false,
		onClick,
		onPinToggle,
	}: {
		session: AiSessionMeta;
		isActive?: boolean;
		onClick: () => void;
		onPinToggle: () => void;
	} = $props();

	function relativeTime(epoch: number): string {
		const diff = Date.now() - epoch;
		const mins = Math.floor(diff / 60000);
		if (mins < 1) return 'now';
		if (mins < 60) return `${mins}m`;
		const hrs = Math.floor(mins / 60);
		if (hrs < 24) return `${hrs}h`;
		const days = Math.floor(hrs / 24);
		if (days < 7) return `${days}d`;
		const weeks = Math.floor(days / 7);
		return `${weeks}w`;
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="section-type-item row ycenter xbetween"
	class:active={isActive}
	role="button"
	tabindex="0"
	onclick={onClick}
	onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
>
	<span class="text-item-lg">{session.title}</span>
	<button
		type="button"
		class="btn-icon"
		class:pinned={session.pinned}
		aria-label={session.pinned ? 'Unpin session' : 'Pin session'}
		onclick={(e) => { e.stopPropagation(); onPinToggle(); }}
	>
		<img src="/iconset/pin.svg" class="faint icon-svg-sm" alt="pin item"/>
	</button>
</div>
