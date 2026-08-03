<script lang="ts">
	import * as InlineCitation from '$lib/components/ai-elements/inline-citation/index.js';
	import Preview from '$lib/docs/Preview.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	const sources = [
		'https://example.com/article1',
		'https://docs.svelte.dev/introduction',
		'https://kit.svelte.dev/'
	];

	const sourceDetails = [
		{
			title: 'Understanding Modern Web Development',
			url: 'https://example.com/article1',
			description:
				'A comprehensive guide to building modern web applications with the latest frameworks and tools.'
		},
		{
			title: 'Svelte Documentation',
			url: 'https://docs.svelte.dev/introduction',
			description: 'Official documentation for Svelte, the cybernetically enhanced web framework.'
		},
		{
			title: 'SvelteKit Framework',
			url: 'https://kit.svelte.dev/',
			description: 'The fastest way to build Svelte apps with routing, SSR, and more.'
		}
	];

	const sampleQuotes = [
		'This approach significantly improves performance and developer experience.',
		'Svelte is a radical new approach to building user interfaces.',
		'SvelteKit provides everything you need to build a fast, production-ready web app.'
	];

	const triggerProps: PropRow[] = [
		{
			name: 'sources',
			type: 'string[]',
			description: 'URLs (or labels). Host of the first URL becomes the badge; +N when multiple.'
		}
	];

	const sourceProps: PropRow[] = [
		{ name: 'title', type: 'string', description: 'Source title.' },
		{ name: 'url', type: 'string', description: 'Canonical URL shown under the title.' },
		{ name: 'description', type: 'string', description: 'Clamped summary (3 lines).' }
	];

	const codeInstall = `npm i fractalsvelte bits-ui embla-carousel-svelte`;

	const usage = `<script lang="ts">
  import * as InlineCitation from "fractalsvelte/ai-elements/inline-citation";
<\/script>

<p>
  Modern frameworks improve DX
  <InlineCitation.Root>
    <InlineCitation.Text>especially Svelte</InlineCitation.Text>
    <InlineCitation.Card>
      <InlineCitation.CardTrigger sources={sources} />
      <InlineCitation.CardBody>
        <InlineCitation.Source title="…" url="…" description="…" />
      </InlineCitation.CardBody>
    </InlineCitation.Card>
  </InlineCitation.Root>
  compared to legacy stacks.
</p>`;

	const usageCarousel = `<InlineCitation.CardBody>
  <InlineCitation.Carousel>
    <InlineCitation.CarouselHeader>
      <InlineCitation.CarouselPrev />
      <InlineCitation.CarouselIndex />
      <InlineCitation.CarouselNext />
    </InlineCitation.CarouselHeader>
    <InlineCitation.CarouselContent>
      {#each details as source}
        <InlineCitation.CarouselItem>
          <InlineCitation.Source … />
          <InlineCitation.Quote>…</InlineCitation.Quote>
        </InlineCitation.CarouselItem>
      {/each}
    </InlineCitation.CarouselContent>
  </InlineCitation.Carousel>
</InlineCitation.CardBody>`;
</script>

{#snippet demoBasic()}
	<p style="max-width: 40rem; margin-inline: auto; line-height: 1.7; font-size: var(--text-sm); color: var(--muted-foreground);">
		Modern web development has evolved significantly.
		<InlineCitation.Root>
			<InlineCitation.Text>
				New frameworks like Svelte offer better performance and developer experience
			</InlineCitation.Text>
			<InlineCitation.Card>
				<InlineCitation.CardTrigger {sources} />
				<InlineCitation.CardBody>
					<InlineCitation.Carousel>
						<InlineCitation.CarouselHeader>
							<InlineCitation.CarouselPrev />
							<InlineCitation.CarouselIndex />
							<InlineCitation.CarouselNext />
						</InlineCitation.CarouselHeader>
						<InlineCitation.CarouselContent>
							{#each sourceDetails as source, index}
								<InlineCitation.CarouselItem>
									<InlineCitation.Source
										title={source.title}
										url={source.url}
										description={source.description}
									/>
									{#if sampleQuotes[index]}
										<InlineCitation.Quote>{sampleQuotes[index]}</InlineCitation.Quote>
									{/if}
								</InlineCitation.CarouselItem>
							{/each}
						</InlineCitation.CarouselContent>
					</InlineCitation.Carousel>
				</InlineCitation.CardBody>
			</InlineCitation.Card>
		</InlineCitation.Root>
		compared to traditional approaches.
	</p>
{/snippet}

{#snippet demoSingle()}
	<p style="max-width: 40rem; margin-inline: auto; line-height: 1.7; font-size: var(--text-sm); color: var(--muted-foreground);">
		According to the official docs
		<InlineCitation.Root>
			<InlineCitation.Text>Svelte compiles away the framework</InlineCitation.Text>
			<InlineCitation.Card>
				<InlineCitation.CardTrigger sources={['https://docs.svelte.dev/introduction']} />
				<InlineCitation.CardBody>
					<InlineCitation.Source
						title="Svelte Documentation"
						url="https://docs.svelte.dev/introduction"
						description="Official documentation for Svelte."
					/>
					<InlineCitation.Quote>
						Svelte is a radical new approach to building user interfaces.
					</InlineCitation.Quote>
				</InlineCitation.CardBody>
			</InlineCitation.Card>
		</InlineCitation.Root>
		at build time.
	</p>
{/snippet}

<h1 class="doc-title">Inline Citation</h1>
<p class="doc-lede">
	Inline citation pill for AI answers — highlighted text, hover-card source details, optional multi-source carousel with quotes.
</p>

<Preview description="Multi-source citation with carousel" code={usage}>
	{@render demoBasic()}
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/ai-elements/inline-citation/`. UI deps: `hover-card`, `badge`, `carousel` (Embla).

## Usage

<CodeBlock code={usage} lang="svelte" />

For multiple sources, put a carousel inside `CardBody`:

<CodeBlock code={usageCarousel} lang="svelte" />

## Examples

<Examples
	items={[
		{ title: 'Carousel sources', demo: demoBasic },
		{ title: 'Single source', demo: demoSingle }
	]}
/>

## Props

### InlineCitation.CardTrigger

<PropsTable props={triggerProps} />

### InlineCitation.Source

<PropsTable props={sourceProps} />

Root, Text, Card, CardBody, Carousel*, and Quote accept standard HTML attributes / children.

## Theming

- Trigger badge: pill (`border-radius: 9999px`), secondary badge variant
- Card body: fixed ~20rem width
- Carousel header: `var(--secondary)` bar with prev/index/next
- Quote: left border + italic muted text
