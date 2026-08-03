<script lang="ts">
	import { tick } from 'svelte';
	import { markdownToHtml } from '$lib/markdown';
	import { isTauri, readWorkspaceFile, readWorkspaceImageAsset, readWorkspaceMediaAsset } from '$lib/ipc';
	import 'katex/dist/katex.min.css';

	let { content, className = '', assetBasePath, onOpenWorkspacePath }: { content: string; className?: string; assetBasePath?: string; onOpenWorkspacePath?: (path: string) => void } = $props();
	let element = $state<HTMLElement>();
	let revision = 0;
	let mathRevision = 0;
	let assetRevision = 0;
	let assetUrls: string[] = [];

	async function renderDiagrams() {
		const id = ++revision;
		await tick();
		const host = element;
		const blocks = Array.from(host?.querySelectorAll<HTMLElement>('pre > code.language-mermaid') ?? []);
		if (!blocks.length) return;
		try {
			const mermaid = (await import('mermaid')).default;
			if (id !== revision) return;
			mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'base' });
			for (const [index, block] of blocks.entries()) {
				const source = block.textContent ?? '';
				const pre = block.parentElement;
				if (!pre || id !== revision) return;
				try {
					const rendered = await mermaid.render(`fracta-mermaid-${id}-${index}`, source);
					if (id !== revision) return;
					pre.classList.add('rendered-mermaid');
					pre.innerHTML = rendered.svg;
				} catch (error) {
					pre.classList.add('rendered-mermaid', 'rendered-mermaid--error');
					pre.textContent = `Mermaid could not render this diagram.\n${error instanceof Error ? error.message : String(error)}\n\n${source}`;
				}
			}
		} catch {
			// The source block remains visible when Mermaid cannot load.
		}
	}

	async function renderMath() {
		const id = ++mathRevision;
		await tick();
		const blocks = Array.from(element?.querySelectorAll<HTMLElement>('pre > code.language-math') ?? []);
		if (!blocks.length) return;
		try {
			const katex = (await import('katex')).default;
			if (id !== mathRevision) return;
			for (const block of blocks) {
				const pre = block.parentElement;
				if (!pre || id !== mathRevision) return;
				pre.classList.add('rendered-math');
				katex.render(block.textContent ?? '', pre, { displayMode: true, throwOnError: false, strict: 'warn' });
			}
		} catch {
			// Leave the fenced source visible if the optional renderer cannot load.
		}
	}

	async function renderCallouts() {
		await tick();
		for (const quote of Array.from(element?.querySelectorAll<HTMLElement>('blockquote') ?? [])) {
			const first = quote.querySelector<HTMLElement>('p');
			const match = first?.textContent?.match(/^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i);
			if (!first || !match) continue;
			const type = match[1].toLowerCase();
			quote.classList.add('rendered-callout', `rendered-callout--${type}`);
			first.textContent = first.textContent?.replace(match[0], '') ?? '';
			const title = document.createElement('strong');
			title.className = 'rendered-callout__title';
			title.textContent = type[0].toUpperCase() + type.slice(1);
			quote.prepend(title);
		}
	}

	function resolveAssetPath(source: string) {
		const parts = assetBasePath?.split('/').slice(0, -1) ?? [];
		for (const part of source.split('/')) {
			if (!part || part === '.') continue;
			if (part === '..') parts.pop(); else parts.push(part);
		}
		return parts.join('/');
	}

	async function renderLocalAssets() {
		const id = ++assetRevision;
		await tick();
		if (!assetBasePath || !isTauri()) return;
		for (const url of assetUrls) URL.revokeObjectURL(url);
		assetUrls = [];
		for (const image of Array.from(element?.querySelectorAll<HTMLImageElement>('img[src]') ?? [])) {
			const source = image.getAttribute('src') ?? '';
			if (!source || /^(?:https?:|data:|blob:|#)/i.test(source)) continue;
			try {
				const asset = await readWorkspaceImageAsset(resolveAssetPath(source));
				if (id !== assetRevision) return;
				const url = URL.createObjectURL(new Blob([new Uint8Array(asset.bytes)], { type: asset.mime }));
				assetUrls.push(url);
				image.src = url;
			} catch {
				image.alt = `${image.alt || source} (local asset unavailable)`;
			}
		}
		for (const media of Array.from(element?.querySelectorAll<HTMLMediaElement>('[data-fracta-media-path]') ?? [])) {
			const source = media.dataset.fractaMediaPath ?? '';
			if (!source) continue;
			try {
				const asset = await readWorkspaceMediaAsset(resolveAssetPath(source));
				if (id !== assetRevision) return;
				const url = URL.createObjectURL(new Blob([new Uint8Array(asset.bytes)], { type: asset.mime }));
				assetUrls.push(url);
				media.src = url;
			} catch {
				media.insertAdjacentText('afterend', 'Local media is unavailable. Open the attachment externally.');
			}
		}
	}

	async function renderConnectedBlocks() {
		await tick();
		const host = element;
		for (const link of Array.from(host?.querySelectorAll<HTMLAnchorElement>('a.fracta-wikilink[data-fracta-path]') ?? [])) {
			link.onclick = (event) => { event.preventDefault(); onOpenWorkspacePath?.(link.dataset.fractaPath ?? ''); };
		}
		for (const attachment of Array.from(host?.querySelectorAll<HTMLButtonElement>('.fracta-attachment__open[data-fracta-path]') ?? [])) {
			attachment.onclick = () => onOpenWorkspacePath?.(attachment.dataset.fractaPath ?? '');
		}
		if (!assetBasePath || !isTauri()) return;
		for (const block of Array.from(host?.querySelectorAll<HTMLElement>('.fracta-transclusion[data-fracta-path]') ?? [])) {
			const source = block.dataset.fractaPath ?? '';
			try {
				const file = await readTransclusion(source);
				if (file.content === null) throw new Error('This file is not readable text.');
				block.classList.add('fracta-transclusion--ready');
				block.innerHTML = `<header>Transcluded · ${escapeForBlock(source)}</header>${markdownToHtml(file.content.slice(0, 20_000), true)}`;
				if (file.content.length > 20_000) block.insertAdjacentHTML('beforeend', '<p class="fracta-transclusion__truncated">Preview limited to 20,000 characters.</p>');
			} catch (error) {
				block.classList.add('fracta-transclusion--error');
				block.textContent = `Could not transclude ${source}: ${error instanceof Error ? error.message : 'unavailable'}`;
			}
		}
	}

	async function activateTabs() {
		await tick();
		for (const tabs of Array.from(element?.querySelectorAll<HTMLElement>('.fracta-tabs') ?? [])) {
			const buttons = Array.from(tabs.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
			const panels = Array.from(tabs.querySelectorAll<HTMLElement>('[role="tabpanel"]'));
			const select = (index: number) => {
				buttons.forEach((button, position) => button.setAttribute('aria-selected', String(position === index)));
				panels.forEach((panel, position) => panel.hidden = position !== index);
			};
			buttons.forEach((button, index) => {
				button.onclick = () => select(index);
				button.onkeydown = (event) => {
					if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
					event.preventDefault();
					const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
					buttons[next]?.focus(); select(next);
				};
			});
		}
	}

	async function readTransclusion(source: string) {
		const relative = resolveAssetPath(source);
		try { return await readWorkspaceFile(relative); }
		catch (firstError) {
			if (/\.mdx?$/i.test(relative)) throw firstError;
			try { return await readWorkspaceFile(`${relative}.md`); }
			catch { return readWorkspaceFile(`${relative}.mdx`); }
		}
	}

	function escapeForBlock(value: string) { return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;'); }

	$effect(() => { content; assetBasePath; onOpenWorkspacePath; void renderDiagrams(); void renderMath(); void renderCallouts(); void renderLocalAssets(); void renderConnectedBlocks(); void activateTabs(); });
</script>

<article bind:this={element} class={className}>
	{@html markdownToHtml(content, true)}
</article>
