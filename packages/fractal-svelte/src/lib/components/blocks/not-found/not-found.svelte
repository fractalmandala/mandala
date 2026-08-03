<script lang="ts" module>
	export type NotFoundVariant = 'glitch' | 'magnetic' | 'spotlight' | 'stacked' | 'terminal';
</script>

<script lang="ts">
	import './not-found.sass';
	let { variant = 'glitch', code = '404', title = 'Page not found', description = 'The page you are looking for moved, vanished, or never existed.',
		homeHref = '/', homeLabel = 'Back home', browseHref = '/components/motion', browseLabel = 'Browse components' }:
		{ variant?: NotFoundVariant; code?: string; title?: string; description?: string; homeHref?: string; homeLabel?: string; browseHref?: string; browseLabel?: string } = $props();
	let root: HTMLElement;
	function move(event: PointerEvent) {
		const rect = root.getBoundingClientRect(); root.style.setProperty('--not-found-x', `${event.clientX - rect.left}px`); root.style.setProperty('--not-found-y', `${event.clientY - rect.top}px`);
		if (variant === 'magnetic') { const x = (event.clientX - rect.left - rect.width / 2) / 16; const y = (event.clientY - rect.top - rect.height / 2) / 16; root.style.setProperty('--not-found-mx', `${x}px`); root.style.setProperty('--not-found-my', `${y}px`); }
	}
	function reset() { root.style.setProperty('--not-found-mx', '0px'); root.style.setProperty('--not-found-my', '0px'); }
</script>

<main bind:this={root} data-slot="not-found" data-variant={variant} onpointermove={move} onpointerleave={reset}>
	{#if variant === 'terminal'}
		<section data-slot="not-found-terminal" aria-label={`Error ${code}`}>
			<header><i></i><i></i><i></i><span>~/app</span></header>
			<code><span>$ cd /page</span><span>cd: no such file or directory: /page</span><span>$ status {code}<b aria-hidden="true"></b></span></code>
		</section>
	{:else if variant === 'stacked'}
		<div data-slot="not-found-stack" aria-label={code}><i aria-hidden="true"></i><i aria-hidden="true"></i><h1>{code}</h1></div>
	{:else if variant === 'spotlight'}
		<div data-slot="not-found-spotlight"><span aria-hidden="true">{code}</span><h1 aria-label={code}>{code}</h1></div>
	{:else}
		<h1 data-slot="not-found-code" aria-label={code}>
			{#each Array.from(code) as character, index}<span aria-hidden="true" style:--not-found-index={index}>{character}</span>{/each}
		</h1>
	{/if}
	<section data-slot="not-found-copy"><h2>{title}</h2><p>{description}</p></section>
	<nav data-slot="not-found-actions" aria-label="Recovery links"><a href={homeHref}>{homeLabel}</a><a href={browseHref}>{browseLabel}</a></nav>
</main>
