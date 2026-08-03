<script lang="ts">
	import Shell from '$lib/components/pageshell.svelte';

	let { data } = $props();
</script>

<Shell paddingtop="64" paddingbottom="64" limited={false}>
	<div class="homepage-grid">
		<div class="onside box gap32">
			<div class="stickybox box gap32">
			<div class="row wrap"><p class="text-5xl"><strong>fractal<span class="coltheme">design</span></strong></p><p class="text-3xl w600"> is a design and dev curation + playground.</p></div>
			<p class="text-lg col2 lh15">
				i'm a hobbyist designer and web builder, with a healthy indulgence for vibe coding.
				Here I curate the best I find/learn about these things, share my own builds, and
				experiment with new stuff in a sveltekit playground.
			</p>
			<p class="text-lg col2 lh15">
				i also write, at <a
					href="https://www.fractalmandala.in"
					target="_blank"
					rel="noreferrer">fractalmaṇḍala</a
				>, and am co-founder of
				<a href="https://www.bodharesearch.in" target="_blank" rel="noreferrer">Bodha</a>, a
				cultural think-tank and research group. am building my dream of a fully connected
				sanskritic synaptic mesh at
				<a href="https://www.fractaldharma.in" target="_blank" rel="noreferrer"
					>fractaldharma</a
				>.
			</p>
			<p class="text-lg col2 lh15">
				find me on <a
					href="https://www.twitter.com/saamaanyafreaky"
					target="_blank"
					rel="noreferrer">twitter/x</a
				>, and see the monorepo for all my design work at
				<a
					href="https://github.com/fractalmandala/mandala"
					target="_blank"
					rel="noreferrer">github</a
				>.
			</p>
</div>
		</div>
		<div class="onposts box gap32">
			<div class="box gap16">
				<div class="row ycenter gap4">
					<img src="/images/dot.png" alt="my dot" class="icon16" />
					<span class="sublabel">Projects:</span>
				</div>
				<div class="grid grid-cols-3 gap8">
				<a
					href="https://github.com/fractalmandala/mandala"
					target="_blank"
					rel="noreferrer"
					class="box gap4 paper"
				>
					<p class="item-title">Mandala</p>
					<p class="item-desc">
						A monorepo and desktop app that's my main building project - an ambitious
						all-in-one app for macOS.
					</p>
				</a>
				<a
					href="https://svelte-animated-icon.vercel.app/"
					target="_blank"
					rel="noreferrer"
					class="box gap4 paper"
				>
					<span class="item-title">Svelte Animated Icon</span>
					<span class="item-desc"
						>GitHub repo and npm package for more than 100,000 animated icon variants
						for drop-and-use in Sveltekit.</span
					>
				</a>
				<a
					href="https://www.fractaldharma.in/"
					target="_blank"
					rel="noreferrer"
					class="box gap4 paper"
				>
					<span class="item-title">Fractaldharma</span>
					<span class="item-desc"
						>The Sanskrit word and text repository, an interconnected web for synaptic
						reconnection to the Bharatiya consciousness.</span
					>
				</a>
				<a
					href="https://www.fractalmandala.in/"
					target="_blank"
					rel="noreferrer"
					class="box gap4 paper"
				>
					<span class="item-title">Fractalmandala</span>
					<span class="item-desc">My blog and a growing knowledge bank.</span>
				</a>
				<div class="paper">
					<span class="item-title"
						>Pipeline - AI Chat app (Fractalbodha), Design Bench</span
					>
				</div>
				</div>
			</div>
			<div class="box gap16">
				<div class="row gap4 ycenter">
					<img src="/images/dot.png" alt="my dot" class="icon16" />
					<span class="sublabel">Posts:</span>
				</div>
				{#if data.posts}
					<div class="grid grid-cols-3 gap8">
						{#each data.posts as post}
							<a class="box gap4 paper" href={post.linkpath}>
								<span class="item-title">{post.meta.title}</span>
								<span class="item-desc">{post.meta.description}</span>
								{#if post.meta.tags}
									<div class="row wrap gap8">
										{#each post.meta.tags as tag}
											<span class="item-pill">{tag}</span>
										{/each}
									</div>
								{/if}
							</a>
						{/each}
					</div>
				{/if}
			</div>
			<div class="box gap16">
				<div class="row gap4">
					<img src="/images/dot.png" alt="my dot" class="icon16" />
					<span class="sublabel">Play:</span>
				</div>
				{#if data.pages}
					<div class="grid grid-cols-3 gap8">
						{#each data.pages as page}
							<a class="box gap4 paper" href={page.link}>
								<span class="item-title">{page.title}</span>
								<span class="item-desc">{page.description}</span>
							</a>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</Shell>
