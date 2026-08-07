<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DesignBlock from '../components/DesignBlock.svelte';
	import type { DesignBlock as Block } from '../engine/designtypes';
	import { DragEngine } from '../engine/DragEngine.svelte';
	import { ResizeEngine } from '../engine/ResizeEngine.svelte';
	import { RotateEngine } from '../engine/RotateEngine.svelte';

	const { Story } = defineMeta({
		title: 'Designer/DesignBlock',
		component: DesignBlock,
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	const drag = new DragEngine();
	const resize = new ResizeEngine();
	const rotate = new RotateEngine();

	const sampleFrameBlock: Block = {
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
		children: [],
		style: {
			background: '#1e1e2e',
			borderRadius: 16,
			borderWidth: 1,
			borderColor: '#313244'
		},
		props: {
			layoutClass: 'col ystart gap16 p24'
		}
	};

	const sampleTextBlock: Block = {
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
		style: {
			color: '#cdd6f4',
			'font-size': '24px',
			'font-weight': 700
		},
		props: {
			text: 'Welcome Back'
		}
	};

	const sampleImageBlock: Block = {
		id: 'img-1',
		parentId: 'frame-1',
		name: 'Hero Banner',
		type: 'image',
		x: 24,
		y: 80,
		w: 332,
		h: 180,
		rotation: 0,
		locked: false,
		hidden: false,
		children: [],
		style: {
			borderRadius: 8,
			'object-fit': 'cover'
		},
		props: {
			src: '/iconset/image.svg',
			alt: 'Sample Banner'
		}
	};

	const allBlocks = [sampleFrameBlock, sampleTextBlock, sampleImageBlock];
</script>

<Story name="Frame Block">
	<div style="position: relative; width: 600px; height: 600px; background: #11111b; padding: 20px;">
		<DesignBlock block={sampleFrameBlock} {allBlocks} selectedIds={['frame-1']} {drag} {resize} {rotate} />
	</div>
</Story>

<Story name="Text Block">
	<div style="position: relative; width: 400px; height: 100px; background: #11111b; padding: 20px;">
		<DesignBlock block={sampleTextBlock} {allBlocks} selectedIds={[]} {drag} {resize} {rotate} />
	</div>
</Story>

<Story name="Image Block">
	<div style="position: relative; width: 400px; height: 250px; background: #11111b; padding: 20px;">
		<DesignBlock block={sampleImageBlock} {allBlocks} selectedIds={['img-1']} {drag} {resize} {rotate} />
	</div>
</Story>
