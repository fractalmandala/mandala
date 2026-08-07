<script lang="ts">
	import Shell from '$lib/components/pageshell.svelte';

	let { data } = $props();
</script>

<Shell paddingtop="64" paddingbottom="64" limited={false}>
	<div class="grid grid-cols-1 grid-cols-3-lg gap32">
		<!-- Sidebar / Intro Section -->
		<div class="box gap32">
			<div class="box gap32 sticky">
				<div class="row wrap ycenter gap8">
					<p class="text-5xl bold">fractal<span class="coltheme">design</span></p>
					<p class="text-3xl w600 text-secondary">is a design and dev curation + playground.</p>
				</div>
				<p class="text-lg text-secondary lh15">
					i'm a hobbyist designer and web builder, with a healthy indulgence for vibe coding.
					Here I curate the best I find/learn about these things, share my own builds, and
					experiment with new stuff in a sveltekit playground.
				</p>
				<p class="text-lg text-secondary lh15">
					i also write, at <a class="link" href="https://www.fractalmandala.in" target="_blank" rel="noreferrer">fractalmaṇḍala</a>,
					and am co-founder of <a class="link" href="https://www.bodharesearch.in" target="_blank" rel="noreferrer">Bodha</a>, a cultural think-tank and research group. am building my dream of a fully connected sanskritic synaptic mesh at <a class="link" href="https://www.fractaldharma.in" target="_blank" rel="noreferrer">fractaldharma</a>.
				</p>
				<p class="text-lg text-secondary lh15">
					find me on <a class="link" href="https://www.twitter.com/saamaanyafreaky" target="_blank" rel="noreferrer">twitter/x</a>, and see the monorepo for all my design work at <a class="link" href="https://github.com/fractalmandala/fractals" target="_blank" rel="noreferrer">github</a>.
				</p>
			</div>
		</div>

		<!-- Main Content Section -->
		<div class="box gap32 grid-cols-2-span">
			<!-- Projects -->
			<div class="box gap16">
				<div class="row ycenter gap8">
					<img src="/images/dot.png" alt="dot" class="w16 h16" />
					<span class="text-sm bold text-secondary tt-u">Projects:</span>
				</div>
				<div class="grid grid-cols-1 grid-cols-3-sm gap12">
					<a href="https://github.com/fractalmandala/fractals" target="_blank" rel="noreferrer" class="box gap8 pad16 radius8 panel surface trans-std">
						<p class="bold text-md text-primary">Fractals</p>
						<p class="text-sm text-secondary lh15">
							A monorepo and desktop app that's my main building project - an ambitious all-in-one app for macOS.
						</p>
					</a>
					<a href="https://svelte-animated-icon.vercel.app/" target="_blank" rel="noreferrer" class="box gap8 pad16 radius8 panel surface trans-std">
						<span class="bold text-md text-primary">Svelte Animated Icon</span>
						<span class="text-sm text-secondary lh15">
							GitHub repo and npm package for more than 100,000 animated icon variants for drop-and-use in Sveltekit.
						</span>
					</a>
					<a href="https://www.fractaldharma.in/" target="_blank" rel="noreferrer" class="box gap8 pad16 radius8 panel surface trans-std">
						<span class="bold text-md text-primary">Fractaldharma</span>
						<span class="text-sm text-secondary lh15">
							The Sanskrit word and text repository, an interconnected web for synaptic reconnection to the Bharatiya consciousness.
						</span>
					</a>
					<a href="https://www.fractalmandala.in/" target="_blank" rel="noreferrer" class="box gap8 pad16 radius8 panel surface trans-std">
						<span class="bold text-md text-primary">Fractalmandala</span>
						<span class="text-sm text-secondary lh15">My blog and a growing knowledge bank.</span>
					</a>
					<div class="box gap8 pad16 radius8 panel surface">
						<span class="bold text-md text-primary">Pipeline</span>
						<span class="text-sm text-secondary lh15">AI Chat app (Fractalbodha), Design Bench</span>
					</div>
				</div>
			</div>

			<!-- Posts -->
			<div class="box gap16">
				<div class="row ycenter gap8">
					<img src="/images/dot.png" alt="dot" class="w16 h16" />
					<span class="text-sm bold text-secondary tt-u">Posts:</span>
				</div>
				{#if data.posts}
					<div class="grid grid-cols-1 grid-cols-3-sm gap12">
						{#each data.posts as post}
							<a class="box gap8 pad16 radius8 panel surface trans-std" href={post.linkpath}>
								<span class="bold text-md text-primary">{post.meta.title}</span>
								<span class="text-sm text-secondary lh15">{post.meta.description}</span>
								{#if post.meta.tags}
									<div class="row wrap gap4 padtop8">
										{#each post.meta.tags as tag}
											<span class="padtop2 padbot2 padleft8 padright8 radiusfull text-xs bdr surface text-secondary">{tag}</span>
										{/each}
									</div>
								{/if}
							</a>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Play -->
			<div class="box gap16">
				<div class="row ycenter gap8">
					<img src="/images/dot.png" alt="dot" class="w16 h16" />
					<span class="text-sm bold text-secondary tt-u">Play:</span>
				</div>
				{#if data.pages}
					<div class="grid grid-cols-1 grid-cols-3-sm gap12">
						{#each data.pages as page}
							<a class="box gap8 pad16 radius8 panel surface trans-std" href={page.link}>
								<span class="bold text-md text-primary">{page.title}</span>
								<span class="text-sm text-secondary lh15">{page.description}</span>
							</a>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</Shell>
