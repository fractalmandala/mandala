<script lang="ts">
	import AskPanel from './AskPanel.svelte';

	/**
	 * Design prototype. Production shell is routes/+page.svelte + app-notes.
	 * No borders anywhere: separation is spacing and weight only.
	 */
	type Face = 'serif' | 'sans' | 'mono';

	let {
		notes = [
			{ id: '1', title: 'Porting the sidebar', when: 'Today' },
			{ id: '2', title: 'Welcome to Markd', when: 'Yesterday' },
			{ id: '3', title: 'Reading list, Q3', when: 'Yesterday' },
			{ id: '4', title: 'Kitchen rebuild', when: 'Tuesday' }
		],
		activeId = $bindable('1'),
		title = $bindable('Porting the sidebar'),
		body = $bindable(
			'The largest component yet — twenty-five files with several internal dependencies. Dependency status gets checked before anything moves.'
		),
		fontSize = $bindable(20),
		typeface = $bindable<Face>('sans'),
		askOpen = $bindable(false),
		onsearch,
		onnew
	}: {
		notes?: { id: string; title: string; when: string }[];
		activeId?: string;
		title?: string;
		body?: string;
		fontSize?: number;
		typeface?: Face;
		askOpen?: boolean;
		onsearch?: (q: string) => void;
		onnew?: () => void;
	} = $props();

	const typefaces: Face[] = ['serif', 'sans', 'mono'];
	const families: Record<Face, string> = {
		serif: 'Newsreader, Georgia, serif',
		sans: "'IBM Plex Sans', Helvetica, sans-serif",
		mono: "'JetBrains Mono', ui-monospace, monospace"
	};
</script>

<div class="app">
	<header class="chrome">
		<div class="lights"><span></span><span></span><span></span></div>
	</header>

	<div class="main">
		<aside class="sidebar" class:narrow={askOpen}>
			<input class="search" placeholder="Search" oninput={(e) => onsearch?.(e.currentTarget.value)} />
			<nav class="list">
				{#each notes as note (note.id)}
					<button
						class="row"
						class:active={note.id === activeId}
						onclick={() => (activeId = note.id)}
					>
						<span class="row-title">{note.title}</span>
						<span class="row-when">{note.when}</span>
					</button>
				{/each}
			</nav>
		</aside>

		<section class="editor">
			<div
				class="page"
				class:narrow={askOpen}
				style:font-family={families[typeface]}
				style:font-size="{fontSize}px"
			>
				<input class="title" bind:value={title} />
				<textarea class="body" bind:value={body}></textarea>
			</div>
		</section>

		{#if askOpen}
			<AskPanel onclose={() => (askOpen = false)} />
		{/if}
	</div>

	<footer class="toolbar">
		<div class="group">
			<span class="dim">{fontSize}px</span>
			{#each typefaces as face}
				<button class="link" class:on={typeface === face} onclick={() => (typeface = face)}>
					{face[0].toUpperCase() + face.slice(1)}
				</button>
			{/each}
		</div>
		<div class="group">
			<button class="link">Bookmarks</button>
			<button class="link">Tags</button>
			<button class="link">Categories</button>
			<button class="link on" onclick={() => (askOpen = !askOpen)}>Ask</button>
			<button class="link on" onclick={() => onnew?.()}>New</button>
		</div>
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
		background: #fcfcfc;
		color: #151515;
		font-family: 'IBM Plex Sans', Helvetica, sans-serif;
	}

	.chrome {
		flex: none;
		height: 52px;
		display: flex;
		align-items: center;
		padding: 0 18px;
	}
	.lights {
		display: flex;
		gap: 8px;
	}
	.lights span {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: #e6e6e6;
	}

	.main {
		flex: 1;
		min-height: 0;
		display: flex;
	}

	.sidebar {
		width: 240px;
		transition: width 180ms ease;
		flex: none;
		padding: 6px 0 0 26px;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	.sidebar.narrow {
		width: 216px;
	}

	.search {
		border: 0;
		background: none;
		font: inherit;
		font-size: 13px;
		color: #151515;
		padding: 0;
		outline: none;
	}
	.search::placeholder {
		color: #b8b8b8;
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.row {
		border: 0;
		background: none;
		padding: 0;
		font: inherit;
		text-align: left;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.row-title {
		font-size: 13px;
		font-weight: 400;
		color: #8a8a8a;
	}
	.row-when {
		font-size: 12px;
		color: #c4c4c4;
	}
	.row.active .row-title {
		font-weight: 600;
		color: #151515;
	}
	.row.active .row-when {
		color: #b0b0b0;
	}

	.editor {
		flex: 1;
		min-width: 0;
		padding: 32px 0 0;
		overflow: auto;
	}
	.page {
		max-width: 620px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
	}
	.page.narrow {
		max-width: 520px;
	}

	.title {
		border: 0;
		background: none;
		outline: none;
		padding: 0;
		margin: 0 0 26px;
		font-family: inherit;
		font-size: 22px;
		font-weight: 600;
		letter-spacing: -0.01em;
		color: #111;
	}
	.body {
		border: 0;
		background: none;
		outline: none;
		resize: none;
		padding: 0;
		min-height: 420px;
		font-family: inherit;
		font-size: inherit;
		line-height: 1.75;
		color: #3d3d3d;
	}

	.toolbar {
		flex: none;
		height: 50px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 26px;
		font-size: 12px;
	}
	.group {
		display: flex;
		align-items: center;
		gap: 16px;
	}
	.dim {
		color: #c2c2c2;
	}
	.link {
		border: 0;
		background: none;
		padding: 0;
		font: inherit;
		cursor: pointer;
		color: #c2c2c2;
	}
	.link:hover {
		color: #6f6f6f;
	}
	.link.on {
		color: #151515;
	}
</style>
