<script lang="ts">
	import * as Carousel from '$lib/components/carousel/index.js';
	import * as Card from '$lib/components/card/index.js';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import Preview from '$lib/docs/Preview.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	const rootProps: PropRow[] = [
		{
			name: 'opts',
			type: 'CarouselOptions',
			description: 'Embla carousel configuration options.'
		},
		{
			name: 'plugins',
			type: 'CarouselPlugins',
			description: 'Embla plugins array.'
		},
		{
			name: 'orientation',
			type: '"horizontal" | "vertical"',
			default: '"horizontal"',
			description: 'Scroll orientation.'
		},
		{
			name: 'setApi',
			type: '(api: CarouselAPI | undefined) => void',
			description: 'Callback receiving the initialized Embla API instance.'
		}
	];

	const codeInstall = `npm i fractalsvelte`;
	const usage = `<script lang="ts">
  import * as Carousel from "fractalsvelte/carousel";
  import * as Card from "fractalsvelte/card";
<\/script>

<Carousel.Root style="max-width: 24rem; margin-inline: auto;">
  <Carousel.Content>
    {#each Array(5) as _, i}
      <Carousel.Item>
        <Card.Root>
          <Card.Content style="display:flex; align-items:center; justify-content:center; padding:3rem;">
            <h2>{i + 1}</h2>
          </Card.Content>
        </Card.Root>
      </Carousel.Item>
    {/each}
  </Carousel.Content>
  <Carousel.Previous />
  <Carousel.Next />
</Carousel.Root>`;

	const codeVertical = `<Carousel.Root orientation="vertical" style="max-width: 24rem; margin-inline: auto;">
  <Carousel.Content style="height: 200px;">
    {#each Array(5) as _, i}
      <Carousel.Item>
        <Card.Root>
          <Card.Content style="display:flex; align-items:center; justify-content:center; padding:1.5rem;">
            Slide {i + 1}
          </Card.Content>
        </Card.Root>
      </Carousel.Item>
    {/each}
  </Carousel.Content>
  <Carousel.Previous />
  <Carousel.Next />
</Carousel.Root>`;
</script>

<h1 class="doc-title">Carousel</h1>
<p class="doc-lede">A motion carousel component built on Embla Carousel.</p>

<Preview description="Carousel - basic" code={usage}>
	<div style="padding-inline: 3rem;">
		<Carousel.Root style="max-width: 20rem; margin-inline: auto;">
			<Carousel.Content>
				{#each Array(5) as _, i}
					<Carousel.Item>
						<Card.Root>
							<Card.Content style="display:flex; align-items:center; justify-content:center; height:10rem;">
								<span style="font-size: 2rem; font-weight: 600;">{i + 1}</span>
							</Card.Content>
						</Card.Root>
					</Carousel.Item>
				{/each}
			</Carousel.Content>
			<Carousel.Previous />
			<Carousel.Next />
		</Carousel.Root>
	</div>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

## Usage

<CodeBlock code={usage} />

## Examples

{#snippet demoDefault()}
<div style="padding-inline: 3rem;">
	<Carousel.Root style="max-width: 20rem; margin-inline: auto;">
		<Carousel.Content>
			{#each Array(5) as _, i}
				<Carousel.Item>
					<Card.Root>
						<Card.Content style="display:flex; align-items:center; justify-content:center; height:10rem;">
							<span style="font-size: 2rem; font-weight: 600;">{i + 1}</span>
						</Card.Content>
					</Card.Root>
				</Carousel.Item>
			{/each}
		</Carousel.Content>
		<Carousel.Previous />
		<Carousel.Next />
	</Carousel.Root>
</div>
{/snippet}

{#snippet demoVertical()}
<div style="padding-block: 3rem;">
	<Carousel.Root orientation="vertical" style="max-width: 20rem; margin-inline: auto;">
		<Carousel.Content style="height: 180px;">
			{#each Array(5) as _, i}
				<Carousel.Item>
					<Card.Root>
						<Card.Content style="display:flex; align-items:center; justify-content:center; height:100%;">
							<span>Vertical Slide {i + 1}</span>
						</Card.Content>
					</Card.Root>
				</Carousel.Item>
			{/each}
		</Carousel.Content>
		<Carousel.Previous />
		<Carousel.Next />
	</Carousel.Root>
</div>
{/snippet}

<Examples
	items={[
		{ title: 'Default', demo: demoDefault, code: usage },
		{ title: 'Vertical', demo: demoVertical, code: codeVertical }
	]}
/>

## Props

### Carousel.Root

<PropsTable props={rootProps} />
