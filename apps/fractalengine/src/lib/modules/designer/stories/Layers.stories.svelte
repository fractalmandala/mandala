<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Layers from '../components/Layers.svelte';
	import type { DesignBlock as Block } from '../engine/designtypes';

	const { Story } = defineMeta({
		title: 'Designer/Layers',
		component: Layers,
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	const sampleBlocks: Block[] = [
		{
			id: 'frame-1',
			parentId: null,
			name: 'Auth Frame',
			type: 'container',
			x: 100,
			y: 100,
			w: 380,
			h: 520,
			rotation: 0,
			locked: false,
			hidden: false,
			children: ['text-1', 'img-1'],
			style: {},
			props: {}
		},
		{
			id: 'text-1',
			parentId: 'frame-1',
			name: 'Heading',
			type: 'text',
			x: 24,
			y: 24,
			w: 300,
			h: 40,
			rotation: 0,
			locked: false,
			hidden: false,
			children: [],
			style: {},
			props: { text: 'Welcome Back' }
		},
		{
			id: 'img-1',
			parentId: 'frame-1',
			name: 'Hero Image',
			type: 'image',
			x: 24,
			y: 80,
			w: 332,
			h: 180,
			rotation: 0,
			locked: false,
			hidden: false,
			children: [],
			style: {},
			props: {}
		}
	];

	const selectedIds = ['frame-1'];
</script>

<Story name="Layers Panel">
	<div style="width: 260px; height: 400px; background: #1e1e2e; color: #cdd6f4; padding: 12px; border-radius: 8px;">
		<Layers blocks={sampleBlocks} {selectedIds} />
	</div>
</Story>
