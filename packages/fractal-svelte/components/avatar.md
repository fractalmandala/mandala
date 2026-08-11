<script lang="ts">
	import * as Avatar from '$lib/components/avatar/index.js';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import Preview from '$lib/docs/Preview.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	const rootProps: PropRow[] = [
		{
			name: 'size',
			type: '"default" | "sm" | "lg"',
			default: '"default"',
			description: 'Avatar dimension preset.'
		}
	];

	const codeInstall = `npm i fractalsvelte`;
	const usage = `<script lang="ts">
  import * as Avatar from "fractalsvelte/avatar";
<\/script>

<Avatar.Root>
  <Avatar.Image src="https://github.com/shadcn.png" alt="@shadcn" />
  <Avatar.Fallback>CN</Avatar.Fallback>
</Avatar.Root>`;
</script>

<h1 class="doc-title">Avatar</h1>
<p class="doc-lede">An image element with a fallback for representing the user.</p>

<Preview description="Avatar - basic" code={usage}>
	<div style="display: flex; gap: 1rem; justify-content: center; align-items: center;">
		<Avatar.Root size="sm">
			<Avatar.Image src="https://github.com/shadcn.png" alt="@shadcn" />
			<Avatar.Fallback>CN</Avatar.Fallback>
		</Avatar.Root>
		<Avatar.Root size="default">
			<Avatar.Image src="https://github.com/shadcn.png" alt="@shadcn" />
			<Avatar.Fallback>CN</Avatar.Fallback>
		</Avatar.Root>
		<Avatar.Root size="lg">
			<Avatar.Image src="https://github.com/shadcn.png" alt="@shadcn" />
			<Avatar.Fallback>CN</Avatar.Fallback>
		</Avatar.Root>
	</div>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

## Usage

<CodeBlock code={usage} />

## Props

### Avatar.Root

<PropsTable props={rootProps} />
