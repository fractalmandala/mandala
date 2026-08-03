<script lang="ts">
	import * as Table from "$lib/components/table/index.js";
	import Preview from "$lib/docs/Preview.svelte";
	import Examples from "$lib/docs/Examples.svelte";
	import PropsTable from "$lib/docs/PropsTable.svelte";
	import CodeBlock from "$lib/docs/CodeBlock.svelte";
	import type { PropRow } from "$lib/docs/PropsTable.svelte";

	const invoices = [
		{ id: "INV001", status: "Paid", method: "Credit Card", amount: "$250.00" },
		{ id: "INV002", status: "Pending", method: "PayPal", amount: "$150.00" },
		{ id: "INV003", status: "Unpaid", method: "Bank Transfer", amount: "$350.00" },
	];

	const props: PropRow[] = [
		{
			name: "ref",
			type: "HTMLElement | null",
			default: "null",
			description: "Bindable reference. Available on every part.",
		},
		{
			name: "children",
			type: "Snippet",
			description: "Table content.",
		},
		{
			name: "data-state",
			type: '"selected"',
			description: "On Row. Highlights the row — set it from your selection state.",
		},
	];

	const codeInstall = `npm i fractalsvelte`;

	const usage = `<script lang="ts">
  import * as Table from "fractalsvelte/table";
<\/script>

<Table.Root>
  <Table.Header>
    <Table.Row>
      <Table.Head>Invoice</Table.Head>
      <Table.Head>Amount</Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    <Table.Row>
      <Table.Cell>INV001</Table.Cell>
      <Table.Cell>$250.00</Table.Cell>
    </Table.Row>
  </Table.Body>
</Table.Root>`;

	const codeFooter = `<Table.Footer>
  <Table.Row>
    <Table.Cell>Total</Table.Cell>
    <Table.Cell>$750.00</Table.Cell>
  </Table.Row>
</Table.Footer>`;

	const codeCaption = `<Table.Root>
  <Table.Caption>A list of your recent invoices.</Table.Caption>
  …
</Table.Root>`;

	const codeSelected = `<Table.Row data-state="selected">…</Table.Row>`;
</script>

<h1 class="doc-title">Table</h1>
<p class="doc-lede">Rows and columns of data.</p>

<Preview description="Table — basic" code={usage}>
	<div style="width:100%">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Invoice</Table.Head>
					<Table.Head>Status</Table.Head>
					<Table.Head>Amount</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each invoices as row (row.id)}
					<Table.Row>
						<Table.Cell>{row.id}</Table.Cell>
						<Table.Cell>{row.status}</Table.Cell>
						<Table.Cell>{row.amount}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/table/` into your project — it has no runtime dependencies.

## Usage

<CodeBlock code={usage} />

`Table.Root` wraps the `<table>` in a scroll container, so a wide table scrolls horizontally
instead of breaking the page layout. Everything else maps one-to-one onto native table
elements, which keeps the markup semantic and the accessibility free.

## Examples

{#snippet demoBasic()}
	<div style="width:100%">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Invoice</Table.Head>
					<Table.Head>Status</Table.Head>
					<Table.Head>Method</Table.Head>
					<Table.Head>Amount</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each invoices as row (row.id)}
					<Table.Row>
						<Table.Cell>{row.id}</Table.Cell>
						<Table.Cell>{row.status}</Table.Cell>
						<Table.Cell>{row.method}</Table.Cell>
						<Table.Cell>{row.amount}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
{/snippet}

{#snippet demoFooter()}
	<div style="width:100%">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Invoice</Table.Head>
					<Table.Head>Amount</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each invoices as row (row.id)}
					<Table.Row>
						<Table.Cell>{row.id}</Table.Cell>
						<Table.Cell>{row.amount}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
			<Table.Footer>
				<Table.Row>
					<Table.Cell>Total</Table.Cell>
					<Table.Cell>$750.00</Table.Cell>
				</Table.Row>
			</Table.Footer>
		</Table.Root>
	</div>
{/snippet}

{#snippet demoCaption()}
	<div style="width:100%">
		<Table.Root>
			<Table.Caption>A list of your recent invoices.</Table.Caption>
			<Table.Header>
				<Table.Row>
					<Table.Head>Invoice</Table.Head>
					<Table.Head>Amount</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each invoices as row (row.id)}
					<Table.Row>
						<Table.Cell>{row.id}</Table.Cell>
						<Table.Cell>{row.amount}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
{/snippet}

{#snippet demoSelected()}
	<div style="width:100%">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Invoice</Table.Head>
					<Table.Head>Amount</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				<Table.Row><Table.Cell>INV001</Table.Cell><Table.Cell>$250.00</Table.Cell></Table.Row>
				<Table.Row data-state="selected">
					<Table.Cell>INV002</Table.Cell><Table.Cell>$150.00</Table.Cell>
				</Table.Row>
				<Table.Row><Table.Cell>INV003</Table.Cell><Table.Cell>$350.00</Table.Cell></Table.Row>
			</Table.Body>
		</Table.Root>
	</div>
{/snippet}

<Examples
	items={[
		{ title: "Basic", demo: demoBasic, code: usage },
		{
			title: "Footer",
			demo: demoFooter,
			code: codeFooter,
			description: "The footer is tinted and the last row drops its rule.",
		},
		{
			title: "Caption",
			demo: demoCaption,
			code: codeCaption,
			description: "Rendered below the table, per caption-side: bottom.",
		},
		{
			title: "Selected row",
			demo: demoSelected,
			code: codeSelected,
			description: 'data-state="selected" highlights a row — drive it from your own state.',
		},
	]}
/>

## Props

Every part forwards its native attributes. There are no variant props — a table's shape comes
from its markup.

<PropsTable {props} />

Parts: `Root`, `Header`, `Body`, `Footer`, `Row`, `Head`, `Cell`, `Caption`.

## Theming

<div class="doc-table-wrap">

| Token | Used for |
| --- | --- |
| `--border` | row, header and footer rules |
| `--muted` | row hover (50%), footer background (50%), selected row |
| `--foreground` | column headings |
| `--muted-foreground` | caption |
| `--text-sm` | table text |

</div>

Cells use `white-space: nowrap` and the container scrolls, so columns keep their shape rather
than wrapping into unreadable stacks. A cell containing an element with `role="checkbox"`
drops its right padding automatically, so selection columns line up without extra markup.
