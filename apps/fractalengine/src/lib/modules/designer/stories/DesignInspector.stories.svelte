<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DesignInspector from '../components/DesignInspector.svelte';
	import { designcanvas } from '../state/designcanvas.svelte';

	const { Story } = defineMeta({
		title: 'Designer/DesignInspector',
		component: DesignInspector,
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	designcanvas.replaceScene([
		{
			id: 'frame-1',
			parentId: null,
			name: 'Auth Frame',
			type: 'container',
			x: 120,
			y: 80,
			w: 380,
			h: 520,
			rotation: 0,
			locked: false,
			hidden: false,
			children: [],
			style: {
				background: '#1e1e2e',
				borderRadius: 16,
				borderWidth: 1,
				borderColor: '#313244'
			},
			props: {}
		}
	]);
	designcanvas.selectedIds = ['frame-1'];
</script>

<Story name="Inspector Panel">
	<div style="width: 300px; min-height: 600px; background: #1e1e2e; color: #cdd6f4;">
		<DesignInspector />
	</div>
</Story>
