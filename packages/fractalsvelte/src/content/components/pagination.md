<script lang="ts">
	import * as Pagination from '$lib/components/pagination/index.js';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import Preview from '$lib/docs/Preview.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	let page = $state(1);

	const rootProps: PropRow[] = [
		{ name: 'count', type: 'number', default: '0', description: 'Total item count.' },
		{ name: 'perPage', type: 'number', default: '10', description: 'Number of items per page.' },
		{ name: 'page', type: 'number', default: '1', description: 'Bindable active page number.' },
		{ name: 'siblingCount', type: 'number', default: '1', description: 'Number of visible page siblings.' }
	];

	const codeInstall = `npm i fractalsvelte`;
	const usage = `<script lang="ts">
  import * as Pagination from "fractalsvelte/pagination";

  let page = $state(1);
<\/script>

<Pagination.Root count={100} perPage={10} bind:page>
  {#snippet children({ pages, currentPage })}
    <Pagination.Content>
      <Pagination.Item>
        <Pagination.Previous />
      </Pagination.Item>
      {#each pages as pageItem (pageItem.key)}
        {#if pageItem.type === "square"}
          <Pagination.Item>
            <Pagination.Link page={pageItem} isActive={currentPage === pageItem.value} />
          </Pagination.Item>
        {:else}
          <Pagination.Item>
            <Pagination.Ellipsis />
          </Pagination.Item>
        {/if}
      {/each}
      <Pagination.Item>
        <Pagination.Next />
      </Pagination.Item>
    </Pagination.Content>
  {/snippet}
</Pagination.Root>`;
</script>

<h1 class="doc-title">Pagination</h1>
<p class="doc-lede">Pagination control with page numbers, prev/next buttons, and ellipsis.</p>

<Preview description="Pagination - basic" code={usage}>
	<Pagination.Root count={100} perPage={10} bind:page>
		{#snippet children({ pages, currentPage })}
			<Pagination.Content>
				<Pagination.Item>
					<Pagination.Previous />
				</Pagination.Item>
				{#each pages as pageItem (pageItem.key)}
					{#if pageItem.type === 'square'}
						<Pagination.Item>
							<Pagination.Link page={pageItem} isActive={currentPage === pageItem.value} />
						</Pagination.Item>
					{:else}
						<Pagination.Item>
							<Pagination.Ellipsis />
						</Pagination.Item>
					{/if}
				{/each}
				<Pagination.Item>
					<Pagination.Next />
				</Pagination.Item>
			</Pagination.Content>
		{/snippet}
	</Pagination.Root>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

## Usage

<CodeBlock code={usage} />

## Props

### Pagination.Root

<PropsTable props={rootProps} />
