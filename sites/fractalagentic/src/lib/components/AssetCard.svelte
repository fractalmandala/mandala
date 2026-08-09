<script lang="ts">
	let {
		href,
		title,
		description = '',
		num = '',
		badge = ''
	}: {
		href: string;
		title: string;
		description?: string;
		num?: string;
		badge?: string;
	} = $props();
</script>

<a class="asset-card" {href}>
	<div class="card-top">
		{#if num}<span class="num">{num}</span>{/if}
		{#if badge}<span class="chip">{badge}</span>{/if}
		<span class="arrow">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
				<path d="M7 17L17 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
				<path
					d="M8 7H17V16"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</span>
	</div>
	<h3 class="title">{title}</h3>
	{#if description}<p class="desc">{description}</p>{/if}
</a>
