<script lang="ts">
		import { Pane, PaneGroup, PaneResizer } from 'paneforge';
</script>

<PaneGroup direction="horizontal">
	<Pane defaultSize={1 / 3} order={1}>
		<div class="baloon">hi</div>
	</Pane>
	<PaneResizer />
	<Pane defaultSize={1 / 3} order={2}>
		<div class="baloon">hi</div>
	</Pane>
	<PaneResizer />
	<Pane defaultSize={1 / 3} order={3}>
		<div class="baloon">hi</div>
	</Pane>
</PaneGroup>

<style>

.baloon {
	width: 100%	;
	height: calc(100vh - var(--sz-32) --var(--sz-48));
}

</style>