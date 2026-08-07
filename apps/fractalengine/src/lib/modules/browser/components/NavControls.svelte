<script lang="ts">
	// Navigation Controls — back, forward, reload/stop (§3.9/B3)
	//
	// After B1: wired to per-tab canGoBack/Forward + loading state.
	// Before S0: rendered as static disabled controls.

	interface Props {
		canGoBack?: boolean;
		canGoForward?: boolean;
		isLoading?: boolean;
		onBack?: () => void;
		onForward?: () => void;
		onReload?: () => void;
		onStop?: () => void;
	}

	let {
		canGoBack = false,
		canGoForward = false,
		isLoading = false,
		onBack = () => {},
		onForward = () => {},
		onReload = () => {},
		onStop = () => {},
	}: Props = $props();
</script>

<div class="btn-icon browser-nav-group" role="group" aria-label="Navigation controls">
	<button
		class="btn-icon"
		disabled={!canGoBack}
		onclick={onBack}
		title="Go back"
		aria-label="Go back"
	>
		<img src="/iconset/arrowLeft.svg" alt="" class="icon-svg-sm" />
	</button>
	<button
		class="btn-icon"
		disabled={!canGoForward}
		onclick={onForward}
		title="Go forward"
		aria-label="Go forward"
	>
		<img src="/iconset/arrowRight.svg" alt="" class="icon-svg-sm" />
	</button>
	<button
		class="btn-icon"
		onclick={isLoading ? onStop : onReload}
		title={isLoading ? 'Stop' : 'Reload'}
		aria-label={isLoading ? 'Stop' : 'Reload'}
	>
		<img src="/iconset/autoRefresh.svg" alt="" class="icon-svg-sm" />
	</button>
</div>
