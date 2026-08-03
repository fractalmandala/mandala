<script lang="ts">
	import { onDestroy } from 'svelte';
	import { readWorkspacePdfBytes } from '$lib/ipc';
	import workerSource from 'pdfjs-dist/legacy/build/pdf.worker.mjs?url';

	let { path, pageTexts = [], query = '' }: { path: string; pageTexts?: string[]; query?: string } = $props();
	let canvas = $state<HTMLCanvasElement>();
	let documentProxy = $state<any>();
	let page = $state(1);
	let scale = $state(1.1);
	let loading = $state(true);
	let error = $state('');
	let request = 0;
	let textLayer = $state<{ text: string; style: string }[]>([]);
	let pageWidth = $state(0);
	let pageHeight = $state(0);
	const thumbnailCanvases = new Map<number, HTMLCanvasElement>();

	async function loadDocument(nextPath: string) {
		const id = ++request;
		loading = true;
		error = '';
		const previous = documentProxy;
		documentProxy = undefined;
		textLayer = [];
		if (previous) await previous.destroy();
		try {
			const [pdfjs, bytes] = await Promise.all([
				import('pdfjs-dist/legacy/build/pdf.mjs'),
				readWorkspacePdfBytes(nextPath)
			]);
			pdfjs.GlobalWorkerOptions.workerSrc = workerSource;
			const task = pdfjs.getDocument({ data: new Uint8Array(bytes) });
			const pdf = await task.promise;
			if (id !== request) { await pdf.destroy(); return; }
			documentProxy = pdf;
			page = Math.min(page, pdf.numPages);
		} catch (reason) {
			if (id === request) error = reason instanceof Error ? reason.message : 'Could not render this PDF locally.';
		} finally {
			if (id === request) loading = false;
		}
	}

	async function renderPage() {
		if (!documentProxy || !canvas) return;
		try {
			const pdfPage = await documentProxy.getPage(page);
			const viewport = pdfPage.getViewport({ scale });
			const ratio = window.devicePixelRatio || 1;
			const context = canvas.getContext('2d');
			if (!context) return;
			canvas.width = Math.floor(viewport.width * ratio);
			canvas.height = Math.floor(viewport.height * ratio);
			canvas.style.width = `${Math.floor(viewport.width)}px`;
			canvas.style.height = `${Math.floor(viewport.height)}px`;
			pageWidth = Math.floor(viewport.width);
			pageHeight = Math.floor(viewport.height);
			await pdfPage.render({ canvasContext: context, viewport, transform: ratio === 1 ? undefined : [ratio, 0, 0, ratio, 0, 0] }).promise;
			const content = await pdfPage.getTextContent();
			const util = (await import('pdfjs-dist/legacy/build/pdf.mjs')).Util;
			textLayer = content.items
				.filter((item: any) => 'str' in item && item.str)
				.map((item: any) => {
					const transform = util.transform(viewport.transform, item.transform) as number[];
					const [a, b, c, d, x, y] = transform;
					const fontSize = Math.max(1, Math.hypot(a, b));
					return {
						text: item.str,
						style: `left:${x}px;top:${y}px;font-size:${fontSize}px;transform:matrix(${a / fontSize},${b / fontSize},${c / fontSize},${d / fontSize},0,0)`
					};
				});
		} catch (reason) {
			error = reason instanceof Error ? reason.message : 'Could not draw this PDF page.';
		}
	}

	function thumbnailPages() {
		const count = documentProxy?.numPages ?? pageTexts.length;
		const first = Math.max(1, page - 4);
		const last = Math.min(count, first + 8);
		return Array.from({ length: Math.max(0, last - first + 1) }, (_, index) => first + index);
	}

	async function renderThumbnail(number: number, target: HTMLCanvasElement) {
		if (!documentProxy) return;
		try {
			const pdfPage = await documentProxy.getPage(number);
			const viewport = pdfPage.getViewport({ scale: 0.16 });
			const context = target.getContext('2d');
			if (!context || thumbnailCanvases.get(number) !== target) return;
			target.width = Math.ceil(viewport.width);
			target.height = Math.ceil(viewport.height);
			await pdfPage.render({ canvasContext: context, viewport }).promise;
		} catch { /* a thumbnail failing never prevents the main page from rendering */ }
	}

	function thumbnail(target: HTMLCanvasElement, number: number) {
		thumbnailCanvases.set(number, target);
		void renderThumbnail(number, target);
		return {
			update(next: number) {
				thumbnailCanvases.delete(number);
				number = next;
				thumbnailCanvases.set(number, target);
				void renderThumbnail(number, target);
			},
			destroy() { thumbnailCanvases.delete(number); }
		};
	}

	$effect(() => { void loadDocument(path); });
	$effect(() => { documentProxy; page; scale; canvas; void renderPage(); });
	$effect(() => {
		documentProxy;
		for (const [number, target] of thumbnailCanvases) void renderThumbnail(number, target);
	});
	$effect(() => {
		const needle = query.trim().toLowerCase();
		const match = needle ? pageTexts.findIndex((text) => text.toLowerCase().includes(needle)) : -1;
		if (match >= 0) page = match + 1;
	});

	onDestroy(() => {
		request += 1;
		void documentProxy?.destroy();
	});
</script>

<section class="pdf-viewer" aria-label="Local PDF viewer">
	<header class="pdf-viewer__controls">
		<button onclick={() => page = Math.max(1, page - 1)} disabled={page <= 1}>Previous</button>
		<span>Page {page} / {(documentProxy?.numPages ?? pageTexts.length) || '–'}</span>
		<button onclick={() => page = Math.min(documentProxy?.numPages ?? page, page + 1)} disabled={!documentProxy || page >= documentProxy.numPages}>Next</button>
		<label>Zoom <input type="range" min="0.6" max="2" step="0.1" bind:value={scale} /><span>{Math.round(scale * 100)}%</span></label>
	</header>
	{#if pageTexts.length > 1}
		<nav class="pdf-viewer__pages" aria-label="PDF page thumbnails">
			{#each thumbnailPages() as number (number)}<button class:active={page === number} onclick={() => page = number} aria-label={`Go to page ${number}`}><canvas use:thumbnail={number} aria-hidden="true"></canvas><span>{number}</span></button>{/each}
		</nav>
	{/if}
	{#if loading}<p class="pdf-viewer__status">Rendering PDF locally…</p>
	{:else if error}<p class="pdf-viewer__status" role="alert">{error}</p>
	{:else}<div class="pdf-viewer__canvas"><div class="pdf-viewer__page" style:width={`${pageWidth}px`} style:height={`${pageHeight}px`}><canvas bind:this={canvas} aria-label={`PDF page ${page}`}></canvas><div class="pdf-viewer__text-layer" aria-label={`Selectable PDF text on page ${page}`}>{#each textLayer as item}<span style={item.style}>{item.text}</span>{/each}</div></div></div>{/if}
</section>
