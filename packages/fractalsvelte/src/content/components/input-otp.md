<script lang="ts">
	import * as InputOTP from '$lib/components/input-otp/index.js';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import Preview from '$lib/docs/Preview.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	const rootProps: PropRow[] = [
		{
			name: 'maxlength',
			type: 'number',
			default: '6',
			description: 'Maximum length of the OTP pin input.'
		},
		{
			name: 'value',
			type: 'string',
			default: '""',
			description: 'Current pin value.'
		}
	];

	const codeInstall = `npm i fractalsvelte bits-ui`;
	const usage = `<script lang="ts">
  import * as InputOTP from "fractalsvelte/input-otp";

  let value = $state("");
<\/script>

<InputOTP.Root maxlength={6} bind:value>
  {#snippet children({ cells })}
    <InputOTP.Group>
      {#each cells.slice(0, 3) as cell}
        <InputOTP.Slot {cell} />
      {/each}
    </InputOTP.Group>
    <InputOTP.Separator />
    <InputOTP.Group>
      {#each cells.slice(3, 6) as cell}
        <InputOTP.Slot {cell} />
      {/each}
    </InputOTP.Group>
  {/snippet}
</InputOTP.Root>`;
</script>

<h1 class="doc-title">Input OTP</h1>
<p class="doc-lede">Accessible one-time password component for verification inputs.</p>

<Preview description="Input OTP - 6 digits" code={usage}>
	<div style="display: flex; justify-content: center;">
		<InputOTP.Root maxlength={6}>
			{#snippet children({ cells })}
				<InputOTP.Group>
					{#each cells.slice(0, 3) as cell}
						<InputOTP.Slot {cell} />
					{/each}
				</InputOTP.Group>
				<InputOTP.Separator />
				<InputOTP.Group>
					{#each cells.slice(3, 6) as cell}
						<InputOTP.Slot {cell} />
					{/each}
				</InputOTP.Group>
			{/snippet}
		</InputOTP.Root>
	</div>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

## Usage

<CodeBlock code={usage} />

## Props

### InputOTP.Root

<PropsTable props={rootProps} />
