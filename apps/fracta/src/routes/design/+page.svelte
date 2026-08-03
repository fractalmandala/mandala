<script lang="ts">
	import { onMount } from "svelte";
	import {
		AnimatePresence,
		MotionAside,
		MotionDialog,
		MotionDiv,
		MotionSection,
		useReducedMotion,
	} from "@humanspeak/svelte-motion";
	import {
		fadeMotion,
		motionFade,
		motionReveal,
		revealMotion,
		shouldAnimate,
	} from "$lib/motion";
	import { Icon } from "@fractaldesign/svelte-icons";
	import phosphorArchive from "@fractaldesign/svelte-icons/phosphor/archive";
	import phosphorArticle from "@fractaldesign/svelte-icons/phosphor/article";
	import phosphorBookOpen from "@fractaldesign/svelte-icons/phosphor/book-open";
	import phosphorCaretDown from "@fractaldesign/svelte-icons/phosphor/caret-down";
	import phosphorCaretLeft from "@fractaldesign/svelte-icons/phosphor/caret-left";
	import phosphorCaretRight from "@fractaldesign/svelte-icons/phosphor/caret-right";
	import phosphorChatCircleDots from "@fractaldesign/svelte-icons/phosphor/chat-circle-dots";
	import phosphorCheckCircle from "@fractaldesign/svelte-icons/phosphor/check-circle";
	import phosphorCode from "@fractaldesign/svelte-icons/phosphor/code";
	import phosphorEye from "@fractaldesign/svelte-icons/phosphor/eye";
	import phosphorFile from "@fractaldesign/svelte-icons/phosphor/file";
	import phosphorFileCsv from "@fractaldesign/svelte-icons/phosphor/file-csv";
	import phosphorFileDoc from "@fractaldesign/svelte-icons/phosphor/file-doc";
	import phosphorFilePdf from "@fractaldesign/svelte-icons/phosphor/file-pdf";
	import phosphorFolder from "@fractaldesign/svelte-icons/phosphor/folder";
	import phosphorFolderOpen from "@fractaldesign/svelte-icons/phosphor/folder-open";
	import phosphorGear from "@fractaldesign/svelte-icons/phosphor/gear";
	import phosphorLink from "@fractaldesign/svelte-icons/phosphor/link";
	import phosphorList from "@fractaldesign/svelte-icons/phosphor/list";
	import phosphorMagnifyingGlass from "@fractaldesign/svelte-icons/phosphor/magnifying-glass";
	import phosphorPaperPlaneTilt from "@fractaldesign/svelte-icons/phosphor/paper-plane-tilt";
	import phosphorPlus from "@fractaldesign/svelte-icons/phosphor/plus";
	import phosphorSidebar from "@fractaldesign/svelte-icons/phosphor/sidebar";
	import phosphorTable from "@fractaldesign/svelte-icons/phosphor/table";
	import phosphorTag from "@fractaldesign/svelte-icons/phosphor/tag";
	import phosphorTreeStructure from "@fractaldesign/svelte-icons/phosphor/tree-structure";
	import phosphorX from "@fractaldesign/svelte-icons/phosphor/x";
	import WorkbenchTopbar from '$lib/preview/components/workbench-topbar.svelte';

	type DocKind = "markdown" | "csv" | "json" | "pdf" | "docx";
	type InspectorTab = "file" | "links" | "outline";
	type SettingsSection = "preferences" | "editor" | "agents" | "shortcuts";
	type Note = {
		id: string;
		title: string;
		summary: string;
		date: string;
		kind: DocKind;
	};

	const icons = {
		archive: phosphorArchive,
		article: phosphorArticle,
		book: phosphorBookOpen,
		down: phosphorCaretDown,
		left: phosphorCaretLeft,
		right: phosphorCaretRight,
		chat: phosphorChatCircleDots,
		check: phosphorCheckCircle,
		code: phosphorCode,
		eye: phosphorEye,
		file: phosphorFile,
		csv: phosphorFileCsv,
		doc: phosphorFileDoc,
		pdf: phosphorFilePdf,
		folder: phosphorFolder,
		folderOpen: phosphorFolderOpen,
		gear: phosphorGear,
		link: phosphorLink,
		list: phosphorList,
		search: phosphorMagnifyingGlass,
		send: phosphorPaperPlaneTilt,
		plus: phosphorPlus,
		sidebar: phosphorSidebar,
		table: phosphorTable,
		tag: phosphorTag,
		tree: phosphorTreeStructure,
		close: phosphorX,
	};
	const notes: Note[] = [
		{
			id: "systems",
			title: "Systems for Remembering",
			summary:
				"How traditions structure memory across time, media, and institutions.",
			date: "Jul 27, 2026",
			kind: "markdown",
		},
		{
			id: "teacher",
			title: "Teacher Notes — Preparation for Civilizations from an Indic Lens",
			summary: "Foundational layer and session plan for the full course.",
			date: "Jul 27, 2026",
			kind: "markdown",
		},
		{
			id: "grammar",
			title: "The Grammar of Civilizations: Complete Session Notes",
			summary: "Session-by-session notes with comparative frameworks.",
			date: "Aug 1, 2026",
			kind: "markdown",
		},
		{
			id: "ritual",
			title: "Ritual as Operating System",
			summary:
				"Ritual is the interface layer between cosmos, society, and self.",
			date: "Jul 25, 2026",
			kind: "markdown",
		},
		{
			id: "sources",
			title: "Field sources.csv",
			summary: "A structured catalogue of passages, authors, and status.",
			date: "Jul 24, 2026",
			kind: "csv",
		},
		{
			id: "map",
			title: "Memory layers.json",
			summary: "Structured relationships for the systems model.",
			date: "Jul 24, 2026",
			kind: "json",
		},
		{
			id: "reader",
			title: "Oral transmission.pdf",
			summary: "A scanned reference, locally searchable and read-only.",
			date: "Jul 21, 2026",
			kind: "pdf",
		},
		{
			id: "interview",
			title: "Interview protocols.docx",
			summary: "A semantic source document, rendered locally.",
			date: "Jul 20, 2026",
			kind: "docx",
		},
	];
	let activeId = $state("systems");
	let query = $state("");
	let navOpen = $state(true);
	let ledgerOpen = $state(true);
	let inspectorOpen = $state(true);
	let askOpen = $state(false);
	let settingsOpen = $state(false);
	let dark = $state(false);
	let foldersOpen = $state(true);
	let typesOpen = $state(true);
	let inspectorTab = $state<InspectorTab>("file");
	let settingsSection = $state<SettingsSection>("preferences");
	let sourceWrap = $state(true);
	let compact = $state(false);
	let askInput = $state("");
	let askSent = $state(false);
	let askTrigger = $state<HTMLButtonElement>();
	let askInputElement = $state<HTMLTextAreaElement>();
	let settingsTrigger = $state<HTMLButtonElement>();
	let settingsDialog = $state<HTMLDialogElement>();
	let active = $derived(
		notes.find((note) => note.id === activeId) ?? notes[0],
	);
	let filtered = $derived(
		notes.filter(
			(note) =>
				note.title.toLowerCase().includes(query.toLowerCase()) ||
				note.summary.toLowerCase().includes(query.toLowerCase()),
		),
	);
	let mode = $derived(
		active.kind === "markdown"
			? active.id === "teacher"
				? "source"
				: "read"
			: active.kind === "csv"
				? "grid"
				: active.kind === "json"
					? "tree"
					: "preview",
	);
	const reducedMotion = useReducedMotion();
	function canAnimate() {
		return !reducedMotion.current && shouldAnimate();
	}
	function reveal(
		axis: "x" | "y" = "y",
		direction: 1 | -1 = 1,
		distance: "xs" | "sm" | "md" | "lg" = "sm",
		duration: "instant" | "fast" | "normal" | "onboarding" = "normal",
	) {
		return revealMotion(canAnimate(), {
			axis,
			direction,
			distance,
			duration,
		});
	}
	function fade() {
		return fadeMotion(canAnimate());
	}

	function fileIcon(kind: DocKind) {
		return kind === "csv"
			? icons.csv
			: kind === "json"
				? icons.code
				: kind === "pdf"
					? icons.pdf
					: kind === "docx"
						? icons.doc
						: icons.article;
	}
	function choose(id: string) {
		activeId = id;
		askInput = "";
		askSent = false;
	}
	function openAsk() {
		askOpen = true;
		inspectorOpen = false;
		requestAnimationFrame(() => askInputElement?.focus());
	}
	function closeAsk() {
		askOpen = false;
		requestAnimationFrame(() => askTrigger?.focus());
	}
	function openSettings() {
		settingsOpen = true;
		requestAnimationFrame(() =>
			settingsDialog?.querySelector<HTMLButtonElement>("button")?.focus(),
		);
	}
	function closeSettings() {
		settingsOpen = false;
		requestAnimationFrame(() => settingsTrigger?.focus());
	}
	function trap(
		event: KeyboardEvent,
		container: HTMLElement | undefined,
		close: () => void,
	) {
		if (event.key === "Escape") {
			event.preventDefault();
			close();
			return;
		}
		if (event.key !== "Tab") return;
		const controls = Array.from(
			container?.querySelectorAll<HTMLElement>(
				"button, input, textarea, [href]",
			) ?? [],
		).filter((item) => !item.hasAttribute("disabled"));
		if (!controls.length) return;
		const first = controls[0],
			last = controls.at(-1)!;
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	}
	function sendAsk() {
		if (askInput.trim()) askSent = true;
	}
	onMount(() => {
		const shortcut = (event: KeyboardEvent) => {
			if (event.key === "Escape" && askOpen) {
				event.preventDefault();
				closeAsk();
				return;
			}
			if (
				(event.metaKey || event.ctrlKey) &&
				event.key.toLowerCase() === "k"
			) {
				event.preventDefault();
				document
					.querySelector<HTMLInputElement>("[data-design-search]")
					?.focus();
			}
		};
		window.addEventListener("keydown", shortcut);
		return () => window.removeEventListener("keydown", shortcut);
	});
</script>

<svelte:head><title>Fracta — Library Ledger prototype</title></svelte:head>

<main
	class:design-workbench--dark={dark}
	class:design-workbench--compact={compact}
	class="design-workbench"
	aria-label="Fracta interactive prototype"
>
	<WorkbenchTopbar bind:query {ledgerOpen} {askOpen} bind:askTrigger bind:settingsTrigger onToggleNavigator={() => navOpen = !navOpen} onExpandLedger={() => ledgerOpen = true} onToggleAsk={askOpen ? closeAsk : openAsk} onToggleTheme={() => dark = !dark} onOpenSettings={openSettings} />

	<section
		class="workbench-body"
		style:--nav-size={navOpen ? "var(--prototype-pane-nav)" : "0px"}
		style:--ledger-size={ledgerOpen
			? "var(--prototype-pane-ledger)"
			: "0px"}
		style:--inspector-size={askOpen
			? "var(--prototype-pane-ask)"
			: inspectorOpen
				? "var(--prototype-pane-inspector)"
				: "0px"}
	>
		{#if navOpen}
			<MotionAside
				class="prototype-navigator"
				aria-label="Workspace navigator"
				{...reveal("x", -1)}
			>
				<div class="prototype-workspace">
					<Icon icon={icons.book} size={18} /><strong
						>100cabinet</strong
					><Icon icon={icons.down} size={14} />
				</div>
				<nav class="navigator-primary" aria-label="Workspace views">
					<button class="active"
						><Icon icon={icons.archive} size={18} />Inbox
						<small>2,826</small></button
					><button
						><Icon icon={icons.file} size={18} />All Notes
						<small>2,828</small></button
					><button
						><Icon icon={icons.archive} size={18} />Archive</button
					>
				</nav>
				<section class="navigator-section">
					<button
						class="navigator-section-title"
						onclick={() => (typesOpen = !typesOpen)}
						><Icon
							icon={typesOpen ? icons.down : icons.right}
							size={14}
						/>Types <Icon icon={icons.plus} size={15} /></button
					>{#if typesOpen}<MotionDiv
							class="navigator-type-list"
							{...reveal("y", 1, "xs", "fast")}
							><button
								><Icon icon={icons.article} size={17} />concepts
								<small>4</small></button
							><button
								><Icon icon={icons.file} size={17} />notes
								<small>2</small></button
							><button
								><Icon
									icon={icons.book}
									size={17}
								/>source-summaries <small>56</small></button
							></MotionDiv
						>{/if}
				</section>
				<section class="navigator-section">
					<button
						class="navigator-section-title"
						onclick={() => (foldersOpen = !foldersOpen)}
						><Icon
							icon={foldersOpen ? icons.down : icons.right}
							size={14}
						/>Folders <Icon icon={icons.plus} size={15} /></button
					>{#if foldersOpen}<MotionDiv
							class="navigator-tree"
							{...reveal("y", 1, "xs", "fast")}
							><button
								><Icon
									icon={icons.folder}
									size={18}
								/>100cabinet</button
							><button class="tree-child"
								><Icon
									icon={icons.folder}
									size={18}
								/>01incoming</button
							><button class="tree-child"
								><Icon
									icon={icons.folder}
									size={18}
								/>02organized</button
							><button class="tree-child active"
								><Icon
									icon={icons.folderOpen}
									size={18}
								/>03stations</button
							><button class="tree-child"
								><Icon
									icon={icons.folder}
									size={18}
								/>04outgoing</button
							><button class="tree-child"
								><Icon
									icon={icons.folder}
									size={18}
								/>10wiki</button
							></MotionDiv
						>{/if}
				</section>
				<div class="navigator-bottom">
					<button><Icon icon={icons.tag} size={17} />Tags</button
					><button
						><Icon icon={icons.table} size={17} />Templates</button
					>
					<div>
						<span>100cabinet</span><button
							class="ui-icon"
							aria-label="Open settings"
							onclick={openSettings}
							><Icon icon={icons.gear} size={17} /></button
						>
					</div>
				</div>
			</MotionAside>{/if}

		{#if ledgerOpen}<MotionSection
				class="prototype-ledger"
				aria-label="Document ledger"
				{...reveal("x", -1)}
			>
				<header>
					<div>
						<strong>03stations</strong><Icon
							icon={icons.down}
							size={14}
						/>
					</div>
					<div>
						<button class="ui-icon" aria-label="Filter documents"
							><Icon icon={icons.list} size={17} /></button
						><button class="ui-icon" aria-label="New document"
							><Icon icon={icons.plus} size={17} /></button
						><button
							class="ui-icon"
							aria-label="Collapse document ledger"
							onclick={() => (ledgerOpen = false)}
							><Icon icon={icons.left} size={17} /></button
						>
					</div>
				</header>
				<div class="ledger-rows">
					{#each filtered as note}<button
							class:active={note.id === activeId}
							class="ledger-row"
							onclick={() => choose(note.id)}
							><Icon icon={fileIcon(note.kind)} size={18} /><span
								><strong>{note.title}</strong><small
									>{note.summary}</small
								><em>{note.date}</em></span
							></button
						>{/each}
				</div>
			</MotionSection>{/if}

		<section class="prototype-canvas" aria-label="Document canvas">
			<header class="canvas-bar">
				<div class="canvas-path">
					03stations <span>/</span> <strong>{active.title}</strong>
				</div>
				<div class="canvas-tools">
					<button
						class:active={mode === "read"}
						class="ui-icon"
						aria-label="Reading view"
						onclick={() => choose("systems")}
						><Icon icon={icons.eye} size={17} /></button
					><button
						class:active={mode === "source"}
						class="ui-icon"
						aria-label="Source view"
						onclick={() => choose("teacher")}
						><Icon icon={icons.code} size={17} /></button
					><button
						class:active={mode === "grid"}
						class="ui-icon"
						aria-label="CSV grid view"
						onclick={() => choose("sources")}
						><Icon icon={icons.table} size={17} /></button
					><button
						class:active={mode === "tree"}
						class="ui-icon"
						aria-label="JSON tree view"
						onclick={() => choose("map")}
						><Icon icon={icons.tree} size={17} /></button
					><button
						class:active={mode === "preview"}
						class="ui-icon"
						aria-label="Document viewer"
						onclick={() => choose("reader")}
						><Icon icon={icons.pdf} size={17} /></button
					>{#if !ledgerOpen}<button
							class="ui-button ui-button--quiet"
							onclick={() => (ledgerOpen = true)}
							>Show notes</button
						>{/if}{#if !inspectorOpen}<button
							class="ui-button ui-button--quiet"
							onclick={() => (inspectorOpen = true)}
							>Show inspector</button
						>{/if}
				</div>
			</header>
			{#if mode === "read"}<article class="prototype-document">
					<div class="document-properties">
						<span>type <b>●</b> note</span><span
							>tags <a href="/design">memory</a>,
							<a href="/design">ritual</a>,
							<a href="/design">institutions</a></span
						><span>status <b>●</b> draft</span><button
							class="ui-button ui-button--quiet"
							>Add property</button
						>
					</div>
					<h1>Systems for Remembering</h1>
					<p class="document-lead">
						Every civilization must solve the same problem: how to
						carry forward what matters. Memory is not passive
						storage; it is an engineered system.
					</p>
					<p>
						We can model civilizational memory as five interacting
						layers.
					</p>
					<ol>
						<li>
							<strong>Sensory capture.</strong> Experience is first
							encoded through perception, speech, or inscription.
						</li>
						<li>
							<strong>Encoding practices.</strong> Repetition, recitation,
							notation, or visualization stabilize the experience.
						</li>
						<li>
							<strong>Institutions.</strong> Gurukulas, monastic orders,
							libraries, courts, and guilds maintain and transmit.
						</li>
						<li>
							<strong>Access controls.</strong> Social roles, initiation,
							literacy, and language gate who can receive what.
						</li>
						<li>
							<strong>Renewal mechanisms.</strong> Festivals, commentaries,
							councils, and public recitations periodically refresh
							the system.
						</li>
					</ol>
					<p>
						Break any layer and memory degrades. Break two and you
						get distortion. Break three and you lose continuity.
					</p>
					<hr />
					<h2>Indic case</h2>
					<p>
						Indic traditions married high-fidelity oral technologies
						with durable textual fixity. Vedic recitation optimized
						phonetic checksum through pada pāṭha, krama, and ghana.
					</p>
					<div class="document-composer">
						<input
							placeholder="Ask about this note"
							onfocus={openAsk}
						/><button
							class="ui-button ui-button--primary"
							onclick={openAsk}
							><Icon icon={icons.send} size={17} />Ask</button
						>
					</div>
				</article>
			{:else if mode === "source"}<section class="prototype-source">
					<header>
						<span>teacher-notes.md</span><label
							><input type="checkbox" bind:checked={sourceWrap} />
							Wrap lines</label
						>
					</header>
					<pre class:wrap={sourceWrap}><code
							>---
title: Teacher Notes — Preparation for Civilizations from an Indic Lens
tags: [memory, ritual]
---

# Teacher Notes

What you need to read, master, and have cold to deliver this course with authority.

## How to use these notes

- **Tier 1 — Must read before teaching.** Non-negotiable.
- **Tier 2 — Read to teach well.** Gives depth and examples.
- **Tier 3 — Read to be unassailable.** The foils and contested evidence.</code
						></pre>
				</section>
			{:else if mode === "grid"}<section class="prototype-grid-view">
					<header>
						<div>
							<strong>Field sources.csv</strong><span
								>8 rows · UTF-8 · comma separated</span
							>
						</div>
						<div class="prototype-segmented">
							<button class="active">Grid</button><button
								onclick={() => choose("teacher")}>Raw</button
							>
						</div>
					</header>
					<div
						class="prototype-data-grid"
						role="table"
						aria-label="Field sources CSV grid"
					>
						<div class="data-grid-head" role="row">
							<span>#</span><span>source</span><span
								>tradition</span
							><span>priority</span><span>status</span>
						</div>
						{#each [["01", "Śatapatha Brāhmaṇa", "Vedic", "Must read", "Ready"], ["02", "The Secret of the Veda", "Modern", "Read well", "Linked"], ["03", "The Dance of Śiva", "Modern", "Read well", "Draft"], ["04", "The Nay Science", "Method", "Must read", "Ready"], ["05", "Ritual as Operating System", "Research", "Optional", "Review"]] as row}<div
								role="row"
							>
								<span>{row[0]}</span><span>{row[1]}</span><span
									>{row[2]}</span
								><span>{row[3]}</span><span
									><b>{row[4]}</b></span
								>
							</div>{/each}
					</div>
				</section>
			{:else if mode === "tree"}<section class="prototype-json-view">
					<header>
						<div>
							<strong>Memory layers.json</strong><span
								>Valid JSON · 1.8 KB</span
							>
						</div>
						<div class="prototype-segmented">
							<button class="active">Tree</button><button
								onclick={() => choose("teacher")}>Source</button
							>
						</div>
					</header>
					<div class="prototype-json-tree">
						<p>
							<span class="json-key">memory_layers</span>:
							<span class="json-bracket">[</span>
						</p>
						<p class="indent">
							<span class="json-bracket">&#123;</span>
						</p>
						<p class="indent-2">
							<span class="json-key">name</span>:
							<span class="json-string">"Sensory capture"</span>,
						</p>
						<p class="indent-2">
							<span class="json-key">status</span>:
							<span class="json-string">"foundational"</span>,
						</p>
						<p class="indent-2">
							<span class="json-key">links</span>:
							<span class="json-number">3</span>
						</p>
						<p class="indent">
							<span class="json-bracket">&#125;</span>, …
						</p>
						<p><span class="json-bracket">]</span></p>
					</div>
				</section>
			{:else}<section class="prototype-reader">
					<header>
						<div>
							<Icon
								icon={active.kind === "docx"
									? icons.doc
									: icons.pdf}
								size={20}
							/><strong>{active.title}</strong><span
								>Read only · extracted locally</span
							>
						</div>
						<div>
							<button class="ui-icon" aria-label="Previous page"
								><Icon icon={icons.left} size={16} /></button
							><button class="ui-button ui-button--quiet"
								>Page 1 / 12</button
							><button class="ui-icon" aria-label="Next page"
								><Icon icon={icons.right} size={16} /></button
							>
						</div>
					</header>
					<div class="reader-stage">
						<aside>
							<button class="active">1</button><button>2</button
							><button>3</button>
						</aside>
						<article>
							<small>Collected research · local reader</small>
							<h1>Oral transmission and durable memory</h1>
							<p>
								Knowledge is made durable through technique. The
								most reliable systems do not merely preserve a
								document; they preserve the practices that make
								it legible.
							</p>
							<h2>Reading note</h2>
							<p>
								This rendered view models semantic headings,
								paragraphs, lists, and searchable extracted
								text. The source remains immutable from this
								surface.
							</p>
							<p>
								Local documents are never uploaded for viewing
								or retrieval.
							</p>
						</article>
					</div>
				</section>{/if}
		</section>

		{#if inspectorOpen && !askOpen}<MotionAside
				class="prototype-inspector"
				aria-label="Document inspector"
				{...reveal("x")}
				><header>
					<div role="tablist" aria-label="Inspector tabs">
						<button
							class:active={inspectorTab === "file"}
							role="tab"
							aria-selected={inspectorTab === "file"}
							onclick={() => (inspectorTab = "file")}>File</button
						><button
							class:active={inspectorTab === "links"}
							role="tab"
							aria-selected={inspectorTab === "links"}
							onclick={() => (inspectorTab = "links")}
							>Links</button
						><button
							class:active={inspectorTab === "outline"}
							role="tab"
							aria-selected={inspectorTab === "outline"}
							onclick={() => (inspectorTab = "outline")}
							>Outline</button
						>
					</div>
					<button
						class="ui-icon"
						aria-label="Collapse inspector"
						onclick={() => (inspectorOpen = false)}
						><Icon icon={icons.close} size={18} /></button
					>
				</header>
				{#if inspectorTab === "file"}<div class="inspector-content">
						<h2>{active.title}</h2>
						<p>{active.summary}</p>
						<dl>
							<div>
								<dt>Type</dt>
								<dd>
									{active.kind === "markdown"
										? "Note"
										: active.kind.toUpperCase()}
								</dd>
							</div>
							<div>
								<dt>Status</dt>
								<dd><b>●</b> Draft</dd>
							</div>
							<div>
								<dt>Folder</dt>
								<dd>03stations</dd>
							</div>
							<div>
								<dt>Modified</dt>
								<dd>Jul 27, 9:41 AM</dd>
							</div>
							<div>
								<dt>Words</dt>
								<dd>1,248</dd>
							</div>
							<div>
								<dt>Size</dt>
								<dd>12.7 KB</dd>
							</div>
						</dl>
						<section>
							<h3>Tags</h3>
							<div class="prototype-tags">
								<button>memory</button><button>ritual</button
								><button>institutions</button><button
									aria-label="Add tag"
									><Icon
										icon={icons.plus}
										size={15}
									/></button
								>
							</div>
						</section>
						<section>
							<h3>Attachments <span>2</span></h3>
							<button class="attachment-row"
								><Icon
									icon={icons.file}
									size={17}
								/>recitation-patterns.png
								<small>207 KB</small></button
							><button class="attachment-row"
								><Icon
									icon={icons.file}
									size={17}
								/>institutions-map.excalidraw
								<small>184 KB</small></button
							>
						</section>
					</div>
				{:else if inspectorTab === "links"}<div
						class="inspector-content"
					>
						<h2>Backlinks <span>6</span></h2>
						{#each ["Ritual as Operating System", "Fractal Mandates in Civilizational Ecologies", "Cosmic Order and Human Conduct"] as link}<button
								class="link-row"
								onclick={() =>
									choose(
										link.startsWith("Ritual")
											? "ritual"
											: "grammar",
									)}
								><Icon icon={icons.link} size={17} /><span
									><strong>{link}</strong><small
										>Mentions memory layers and renewal.</small
									></span
								></button
							>{/each}<button class="show-more"
							>Show 3 more</button
						>
						<hr />
						<h3>Forward links</h3>
						<button class="link-row"
							><Icon icon={icons.link} size={17} /><span
								><strong>Teacher Notes</strong><small
									>Session context and reading order.</small
								></span
							></button
						>
					</div>
				{:else}<div class="inspector-content">
						<h2>Outline <span>5</span></h2>
						<nav class="prototype-outline">
							<button class="active"
								>Systems for Remembering</button
							><button>Five interacting layers</button><button
								>Indic case</button
							><button>Transmission and renewal</button><button
								>Further reading</button
							>
						</nav>
					</div>{/if}
			</MotionAside>{/if}

		<AnimatePresence initial={false} mode="wait"
			>{#if askOpen}<MotionAside
					key="ask-pane"
					class="prototype-ask-pane"
					aria-label="Ask Fracta panel"
					{...reveal("x")}
					><header>
						<div>
							<span class="ask-badge"
								><Icon
									icon={icons.chat}
									size={17}
								/>Fracta</span
							>
							<h2>Ask your workspace</h2>
							<p>
								Grounded in this note and its linked local
								sources.
							</p>
						</div>
						<button
							class="ui-icon"
							aria-label="Collapse Ask Fracta panel"
							onclick={closeAsk}
							><Icon icon={icons.close} size={19} /></button
						>
					</header>
					<div class="ask-thread" aria-live="polite">
						<div class="ask-message ask-message--user">
							How do the five layers relate?
						</div>
						<div class="ask-message">
							<p>
								They form a chain of continuity: capture
								produces material, practices stabilize it,
								institutions carry it, access controls regulate
								it, and renewal prevents drift.
							</p>
							<a href="/design"
								>Systems for Remembering · lines 12–31</a
							>
						</div>
						{#if askSent}<MotionDiv
								class="ask-message ask-message--user"
								{...reveal("y", 1, "xs", "fast")}
								>{askInput}</MotionDiv
							><MotionDiv
								class="ask-message"
								{...reveal("y", 1, "xs", "fast")}
								><p>
									I would start with the institution layer: it
									is where a practice becomes durable enough
									to outlast an individual.
								</p>
								<a href="/design"
									>Teacher Notes · reading order</a
								></MotionDiv
							>{/if}
					</div>
					<form
						class="ask-composer"
						onsubmit={(event) => {
							event.preventDefault();
							sendAsk();
						}}
					>
						<textarea
							bind:this={askInputElement}
							bind:value={askInput}
							placeholder="Ask Fracta about this note…"
							aria-label="Message Fracta"
						></textarea>
						<div>
							<button
								type="button"
								class="ui-button ui-button--quiet"
								>Context: This note <Icon
									icon={icons.down}
									size={14}
								/></button
							><button
								class="ui-button ui-button--primary"
								disabled={!askInput.trim()}
								><Icon
									icon={icons.send}
									size={17}
								/>Send</button
							>
						</div>
					</form></MotionAside
				>{/if}</AnimatePresence
		>
	</section>

	<footer class="workbench-status">
		<span><Icon icon={icons.check} size={15} />Autosaved</span><span
			>{active.title}</span
		><span>1,248 words · 9,012 chars</span><button
			onclick={() => (compact = !compact)}
			>{compact ? "Desktop layout" : "Compact preview"}</button
		>
	</footer>

	{#if settingsOpen}<div
			class="prototype-overlay"
			role="presentation"
			transition:motionFade
		>
			<dialog
				bind:this={settingsDialog}
				open
				aria-label="Fracta settings"
				aria-modal="true"
				class="prototype-settings"
				transition:motionReveal={{ distance: "md" }}
				onkeydown={(event) =>
					trap(event, settingsDialog, closeSettings)}
			>
				<aside>
					<div class="settings-identity">
						<span class="workbench-mark"
							><Icon icon={icons.tree} size={19} /></span
						><strong>Fracta</strong>
					</div>
					<nav>
						{#each [{ id: "preferences", label: "Preferences", glyph: icons.gear }, { id: "editor", label: "Editor", glyph: icons.article }, { id: "agents", label: "Configure agents", glyph: icons.chat }, { id: "shortcuts", label: "Hotkeys", glyph: icons.book }] as item}<button
								class:active={settingsSection === item.id}
								onclick={() =>
									(settingsSection =
										item.id as SettingsSection)}
								><Icon
									icon={item.glyph}
									size={18}
								/>{item.label}</button
							>{/each}
					</nav>
					<button class="settings-close" onclick={closeSettings}
						><Icon icon={icons.close} size={18} />Close settings</button
					>
				</aside>
				<section>
					<header>
						<div>
							<p>Settings</p>
							<h2>
								{settingsSection === "preferences"
									? "Preferences"
									: settingsSection === "editor"
										? "Editor"
										: settingsSection === "agents"
											? "Configure agents"
											: "Hotkeys"}
							</h2>
						</div>
						<button
							class="ui-icon"
							aria-label="Close settings"
							onclick={closeSettings}
							><Icon icon={icons.close} size={20} /></button
						>
					</header>
					{#if settingsSection === "preferences"}<div
							class="settings-body"
						>
							<h3>Appearance</h3>
							<p>
								Quiet paper by default, with an equally
								deliberate dark theme.
							</p>
							<div
								class="prototype-segmented prototype-segmented--large"
							>
								<button
									class:active={!dark}
									onclick={() => (dark = false)}>Light</button
								><button
									class:active={dark}
									onclick={() => (dark = true)}>Dark</button
								><button>System</button>
							</div>
							<hr />
							<h3>Interface density</h3>
							<p>
								Keep the writing surface calm and give
								navigation room to breathe.
							</p>
							<div class="settings-choice">
								<span
									><strong>Comfortable</strong><small
										>44px primary controls · roomy ledger</small
									></span
								><button class="ui-button ui-button--quiet"
									>Selected</button
								>
							</div>
							<hr />
							<h3>Typography</h3>
							<p>
								<strong>Google Sans Flex</strong> · Variable UI and
								document type
							</p>
						</div>{:else if settingsSection === "editor"}<div
							class="settings-body"
						>
							<h3>Writing</h3>
							<label class="switch-row"
								><span
									><strong>Wrap source lines</strong><small
										>Keep source editing comfortable in
										narrow panes.</small
									></span
								><input
									type="checkbox"
									bind:checked={sourceWrap}
								/></label
							><label class="switch-row"
								><span
									><strong>Show document properties</strong
									><small
										>Display YAML metadata above Markdown
										documents.</small
									></span
								><input type="checkbox" checked /></label
							>
						</div>{:else if settingsSection === "agents"}<div
							class="settings-body"
						>
							<h3>Fracta agent</h3>
							<p>
								Choose an OpenAI-compatible provider or a local
								GGUF model. Credentials remain on this device.
							</p>
							<div class="settings-choice">
								<span
									><strong>Local GGUF</strong><small
										>No model selected</small
									></span
								><button class="ui-button ui-button--quiet"
									>Choose model</button
								>
							</div>
							<div class="settings-choice">
								<span
									><strong>API provider</strong><small
										>Not configured</small
									></span
								><button class="ui-button ui-button--primary"
									>Connect</button
								>
							</div>
						</div>{:else}<div class="settings-body">
							<h3>Essential shortcuts</h3>
							<dl class="hotkeys">
								<div>
									<dt>New document</dt>
									<dd>⌘ N</dd>
								</div>
								<div>
									<dt>Search</dt>
									<dd>⌘ K</dd>
								</div>
								<div>
									<dt>Ask Fracta</dt>
									<dd>⌘ .</dd>
								</div>
								<div>
									<dt>Toggle inspector</dt>
									<dd>⌘ I</dd>
								</div>
							</dl>
						</div>{/if}
				</section>
			</dialog>
		</div>{/if}
</main>
