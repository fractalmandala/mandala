<script lang="ts">
	import { desktopBridge } from '$lib/desktop';
	import {
		clearCommandStatus,
		closeCommandPalette,
		collectCommandTags,
		commandStatus,
		createCommandItems,
		filterCommands,
		filterTagList,
		formatShortcut,
		formatTagQuery,
		isPathIgnored,
		okignorePatterns,
		openDocument,
		openRecentProject,
		parseTagPaletteQuery,
		pushToast,
		recentCommandIds,
		recentDocumentPaths,
		recentProjects,
		recordCommandWarming,
		removeRecentCommand,
		removeRecentDocument,
		removeRecentProject,
		runCommandById,
		runWithToast,
		setCommandSearch,
		shellState,
		TAG_QUERY_PREFIX,
		workspaceDocuments,
		type CommandGroup,
		type CommandItem,
		type RecentProject,
		type WorkspaceDocument,
	} from '$lib/shell';
	import { get } from 'svelte/store';
	import { tick } from 'svelte';
	import ContextMenu from './overlays/ContextMenu.svelte';
	import type { DropdownItem } from './overlays/DropdownMenu.svelte';
	import { restoreFocus, trapFocus } from './ui/focus-trap';

	/** Re-poll cadence while the palette warms (bridge / command cache). */
	const WARMING_POLL_MS = 600;
	const MAX_WARMING_POLLS = 20;

	const CANONICAL_GROUP_ORDER: CommandGroup[] = [
		'COMMANDS',
		'PROJECT',
		'FILE',
		'VIEW',
		'TERMINAL',
		'APPLICATION',
		'DIAGNOSTICS',
		'SETTINGS',
	];

	let searchInput: HTMLInputElement | null = $state(null);
	let palettePanel: HTMLElement | null = $state(null);
	let previousFocus: Element | null = null;
	let releaseTrap: (() => void) | null = null;
	let warmingPolls = $state(0);
	let paletteFeedback = $state<{ kind: 'error' | 'success'; message: string } | null>(null);
	let feedbackTimer: ReturnType<typeof setTimeout> | null = null;

	let contextMenuOpen = $state(false);
	let contextMenuPos = $state({ x: 0, y: 0 });
	let contextMenuItems = $state<DropdownItem[]>([]);

	let bridge = $derived($desktopBridge.status === 'ready' ? $desktopBridge.bridge : null);
	let bridgeReady = $derived($desktopBridge.status === 'ready');
	let commands = $derived(createCommandItems(bridge));
	let knownTags = $derived(new Set(collectCommandTags(commands)));
	let paletteMode = $derived(parseTagPaletteQuery($shellState.searchQuery, knownTags));
	let tagList = $derived(
		paletteMode.kind === 'tag-list' ? filterTagList([...knownTags], paletteMode.query) : [],
	);

	let recentDocs = $derived.by(() => {
		if (paletteMode.kind !== 'normal' || paletteMode.query.trim() !== '') return [] as WorkspaceDocument[];
		return $recentDocumentPaths
			.map((path) => $workspaceDocuments.find((doc) => doc.path === path))
			.filter((doc): doc is WorkspaceDocument => doc !== undefined && !isPathIgnored(doc.path, $okignorePatterns));
	});

	let recentCmds = $derived.by(() => {
		if (paletteMode.kind !== 'normal' || paletteMode.query.trim() !== '') return [] as CommandItem[];
		return $recentCommandIds
			.map((id) => commands.find((command) => command.id === id))
			.filter((command): command is CommandItem => Boolean(command));
	});

	let filteredDocs = $derived.by(() => {
		if (paletteMode.kind === 'tag-list') return [] as WorkspaceDocument[];
		const query = (paletteMode.kind === 'tag-filter' ? paletteMode.text : paletteMode.query).trim().toLowerCase();
		if (!query) return [] as WorkspaceDocument[];
		return $workspaceDocuments
			.filter((doc) => !isPathIgnored(doc.path, $okignorePatterns))
			.map((doc) => {
				const titleLower = doc.title.toLowerCase();
				const pathLower = doc.path.toLowerCase();
				let score = 0;
				if (titleLower === query) score = 100;
				else if (titleLower.startsWith(query)) score = 80;
				else if (titleLower.includes(query)) score = 50;
				else if (pathLower.includes(query)) score = 30;
				return { doc, score };
			})
			.filter((item) => item.score > 0)
			.sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title))
			.map((item) => item.doc);
	});

	let filteredProjects = $derived.by(() => {
		if (paletteMode.kind === 'tag-list') return [] as RecentProject[];
		const query = (paletteMode.kind === 'tag-filter' ? paletteMode.text : paletteMode.query).trim().toLowerCase();
		if (!query) return $recentProjects;
		return $recentProjects.filter(
			(p) => p.name.toLowerCase().includes(query) || p.path.toLowerCase().includes(query),
		);
	});

	let filteredCommands = $derived.by(() => {
		if (paletteMode.kind === 'tag-list') return [] as CommandItem[];
		if (paletteMode.kind === 'tag-filter') {
			return filterCommands(commands, paletteMode.text, $recentCommandIds, paletteMode.tag);
		}
		return filterCommands(commands, paletteMode.query, $recentCommandIds, null);
	});

	let groupedCommands = $derived(groupCommands(filteredCommands));
	let selectedIndex = $state(0);

	type PaletteRow =
		| { kind: 'tag'; id: string; tag: string }
		| { kind: 'recent-doc'; id: string; document: WorkspaceDocument }
		| { kind: 'recent-command'; id: string; command: CommandItem }
		| { kind: 'project'; id: string; project: RecentProject; group: 'PROJECT' }
		| { kind: 'doc'; id: string; document: WorkspaceDocument; group: 'FILE' | 'PROJECT' }
		| { kind: 'command'; id: string; command: CommandItem; group: CommandGroup };

	let rows = $derived.by((): PaletteRow[] => {
		if (paletteMode.kind === 'tag-list') {
			return tagList.map((tag) => ({ kind: 'tag' as const, id: `tag-${tag}`, tag }));
		}
		const out: PaletteRow[] = [];
		const isNormalEmpty = paletteMode.kind === 'normal' && !paletteMode.query.trim();

		if (isNormalEmpty) {
			for (const document of recentDocs) {
				out.push({ kind: 'recent-doc', id: `recent-doc-${document.path}`, document });
			}
			for (const command of recentCmds) {
				out.push({ kind: 'recent-command', id: `recent-cmd-${command.id}`, command });
			}
		}

		for (const project of filteredProjects) {
			out.push({ kind: 'project', id: `proj-${project.path}`, project, group: 'PROJECT' });
		}

		for (const document of filteredDocs) {
			const group = document.kind === 'folder' ? 'PROJECT' : 'FILE';
			out.push({ kind: 'doc', id: `doc-${document.path}`, document, group });
		}

		for (const group of groupedCommands) {
			for (const command of group.commands) {
				if (isNormalEmpty && recentCmds.some((rc) => rc.id === command.id)) {
					continue;
				}
				out.push({ kind: 'command', id: `cmd-${command.id}`, command, group: group.group });
			}
		}
		return out;
	});

	let activeRow = $derived(rows[selectedIndex] ?? null);

	$effect(() => {
		if (!$shellState.commandPaletteOpen) {
			releaseTrap?.();
			releaseTrap = null;
			restoreFocus(previousFocus);
			previousFocus = null;
			warmingPolls = 0;
			clearPaletteFeedback();
			contextMenuOpen = false;
			return;
		}
		previousFocus = document.activeElement;
		void tick().then(() => {
			selectedIndex = 0;
			if (palettePanel) releaseTrap = trapFocus(palettePanel);
			searchInput?.focus();
		});
		return () => {
			releaseTrap?.();
			releaseTrap = null;
		};
	});

	$effect(() => {
		if (!$shellState.commandPaletteOpen) return;

		let cancelled = false;
		let timer: ReturnType<typeof setTimeout> | null = null;
		let polls = 0;

		const settleReady = () => {
			if (cancelled) return;
			warmingPolls = polls;
			if (get(commandStatus).status === 'warming') clearCommandStatus();
		};

		const poll = () => {
			if (cancelled) return;
			if (get(desktopBridge).status === 'ready') {
				settleReady();
				return;
			}
			polls += 1;
			warmingPolls = polls;
			recordCommandWarming(
				polls <= 1
					? 'Warming command cache…'
					: `Warming command cache… (retry ${polls}/${MAX_WARMING_POLLS})`,
			);
			if (polls >= MAX_WARMING_POLLS) {
				clearCommandStatus();
				return;
			}
			timer = setTimeout(poll, WARMING_POLL_MS);
		};

		const initiallyReady = get(desktopBridge).status === 'ready';
		if (!initiallyReady) {
			poll();
		} else {
			recordCommandWarming('Warming command cache…');
			timer = setTimeout(() => {
				if (!cancelled) clearCommandStatus();
			}, WARMING_POLL_MS);
		}

		return () => {
			cancelled = true;
			if (timer) clearTimeout(timer);
		};
	});

	$effect(() => {
		if (selectedIndex >= rows.length) selectedIndex = Math.max(rows.length - 1, 0);
	});

	$effect(() => {
		void paletteMode.kind;
		void $shellState.searchQuery;
		selectedIndex = 0;
	});

	function clearPaletteFeedback(): void {
		if (feedbackTimer) {
			clearTimeout(feedbackTimer);
			feedbackTimer = null;
		}
		paletteFeedback = null;
	}

	function showPaletteFeedback(kind: 'error' | 'success', message: string): void {
		clearPaletteFeedback();
		paletteFeedback = { kind, message };
		feedbackTimer = setTimeout(() => {
			paletteFeedback = null;
			feedbackTimer = null;
		}, 3200);
	}

	async function runCommand(commandId: string, opts: { silent?: boolean } = {}): Promise<void> {
		const command = commands.find((item) => item.id === commandId);
		if (command?.disabledReason) {
			showPaletteFeedback('error', command.disabledReason);
			pushToast({
				kind: 'danger',
				title: 'Command unavailable',
				body: command.disabledReason,
			});
			return;
		}

		await runWithToast(async () => {
			const result = await runCommandById(commands, commandId);
			if (result.ok) {
				closeCommandPalette();
				if (!opts.silent) {
					pushToast({
						kind: 'success',
						title: 'Ran command',
						body: command?.title ?? commandId,
					});
				}
				return;
			}
			showPaletteFeedback('error', result.reason);
			pushToast({
				kind: 'danger',
				title: 'Command failed',
				body: result.reason,
			});
		}, `Failed to run ${command?.title ?? commandId}`);
	}

	async function activateRow(row: PaletteRow | null): Promise<void> {
		if (!row) return;
		if (row.kind === 'tag') {
			setCommandSearch(formatTagQuery(row.tag));
			selectedIndex = 0;
			return;
		}
		if (row.kind === 'recent-doc' || row.kind === 'doc') {
			openDocument(row.document);
			closeCommandPalette();
			return;
		}
		if (row.kind === 'project') {
			openRecentProject(row.project);
			closeCommandPalette();
			return;
		}
		if (row.kind === 'recent-command' || row.kind === 'command') {
			await runCommand(row.command.id);
		}
	}

	function handleOverlayClick(event: MouseEvent): void {
		if (event.target === event.currentTarget) closeCommandPalette();
	}

	function handleSearchInput(event: Event): void {
		selectedIndex = 0;
		setCommandSearch((event.currentTarget as HTMLInputElement).value);
	}

	function toggleTagPill(): void {
		if (paletteMode.kind !== 'normal') {
			setCommandSearch('');
		} else {
			setCommandSearch(TAG_QUERY_PREFIX);
		}
		selectedIndex = 0;
		searchInput?.focus();
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			event.preventDefault();
			if (contextMenuOpen) {
				contextMenuOpen = false;
				return;
			}
			if (paletteMode.kind !== 'normal') {
				setCommandSearch('');
				return;
			}
			closeCommandPalette();
			return;
		}
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			selectedIndex = rows.length === 0 ? 0 : (selectedIndex + 1) % rows.length;
			return;
		}
		if (event.key === 'ArrowUp') {
			event.preventDefault();
			selectedIndex = rows.length === 0 ? 0 : (selectedIndex - 1 + rows.length) % rows.length;
			return;
		}
		if (event.key === 'Home') {
			event.preventDefault();
			selectedIndex = 0;
			return;
		}
		if (event.key === 'End') {
			event.preventDefault();
			selectedIndex = Math.max(rows.length - 1, 0);
			return;
		}
		if (event.key === 'Backspace' && event.metaKey) {
			event.preventDefault();
			if (activeRow?.kind === 'recent-command') removeRecentCommand(activeRow.command.id);
			else if (activeRow?.kind === 'recent-doc') removeRecentDocument(activeRow.document.path);
			return;
		}
		if (event.key === 'Enter') {
			event.preventDefault();
			void activateRow(activeRow);
		}
	}

	function groupCommands(items: CommandItem[]): { group: CommandGroup; commands: CommandItem[] }[] {
		const groups = new Map<CommandGroup, CommandItem[]>();
		for (const command of items) {
			const list = groups.get(command.group) ?? [];
			groups.set(command.group, [...list, command]);
		}
		return [...groups]
			.sort(([a], [b]) => {
				const indexA = CANONICAL_GROUP_ORDER.indexOf(a);
				const indexB = CANONICAL_GROUP_ORDER.indexOf(b);
				const posA = indexA === -1 ? 99 : indexA;
				const posB = indexB === -1 ? 99 : indexB;
				return posA - posB || a.localeCompare(b);
			})
			.map(([group, groupCommands]) => ({ group, commands: groupCommands }));
	}

	function handleDocContextMenu(event: MouseEvent, doc: WorkspaceDocument): void {
		event.preventDefault();
		event.stopPropagation();
		contextMenuPos = { x: event.clientX, y: event.clientY };
		contextMenuItems = [
			{
				id: 'open',
				label: 'Open Document',
				onSelect: () => {
					openDocument(doc);
					closeCommandPalette();
				},
			},
			{
				id: 'copy-path',
				label: 'Copy Path',
				onSelect: () => {
					void navigator.clipboard?.writeText(doc.path);
					pushToast({ kind: 'info', title: 'Copied Path', body: doc.path });
				},
			},
			{
				id: 'remove-recent',
				label: 'Remove from Recents',
				danger: true,
				onSelect: () => {
					removeRecentDocument(doc.path);
				},
			},
		];
		contextMenuOpen = true;
	}

	function handleProjectContextMenu(event: MouseEvent, project: RecentProject): void {
		event.preventDefault();
		event.stopPropagation();
		contextMenuPos = { x: event.clientX, y: event.clientY };
		contextMenuItems = [
			{
				id: 'open-project',
				label: 'Switch to Project',
				onSelect: () => {
					openRecentProject(project);
					closeCommandPalette();
				},
			},
			{
				id: 'copy-project-path',
				label: 'Copy Path',
				onSelect: () => {
					void navigator.clipboard?.writeText(project.path);
					pushToast({ kind: 'info', title: 'Copied Path', body: project.path });
				},
			},
			{
				id: 'remove-recent-project',
				label: 'Remove from Recents',
				danger: true,
				onSelect: () => {
					removeRecentProject(project.path);
				},
			},
		];
		contextMenuOpen = true;
	}

	function rowIndex(id: string): number {
		return rows.findIndex((row) => row.id === id);
	}
</script>

{#if $shellState.commandPaletteOpen}
	<div class="overlay" role="presentation" onclick={handleOverlayClick} data-palette-target>
		<div
			class="palette"
			bind:this={palettePanel}
			role="dialog"
			aria-labelledby="command-palette-title"
			aria-describedby="command-palette-status"
			aria-modal="true"
			tabindex="-1"
			onkeydown={handleKeydown}
		>
			<h2 id="command-palette-title" class="palette__title">Command palette</h2>
			<div class="palette__header">
				<input
					bind:this={searchInput}
					type="search"
					placeholder="Search files, folders, or commands…"
					value={$shellState.searchQuery}
					aria-controls="command-palette-results"
					aria-activedescendant={activeRow ? `row-${activeRow.id}` : undefined}
					oninput={handleSearchInput}
				/>
				<button
					type="button"
					class="palette__tag-pill-btn"
					class:active={paletteMode.kind !== 'normal'}
					aria-pressed={paletteMode.kind !== 'normal'}
					title="Filter commands by tag (#)"
					onclick={toggleTagPill}
				>
					# Tags
				</button>
			</div>

			{#if paletteMode.kind === 'tag-filter'}
				<div class="palette__tag-chip" aria-label="Active tag filter">
					<span>Filter by tag: <strong>{TAG_QUERY_PREFIX}{paletteMode.tag}</strong></span>
					<button
						type="button"
						class="palette__tag-clear"
						onclick={() => setCommandSearch('')}
						aria-label="Clear tag filter"
					>
						&times;
					</button>
				</div>
			{:else if paletteMode.kind === 'tag-list'}
				<div class="palette__tag-chip" aria-label="Tag search mode">
					<span>Tag search — pick a tag or type to filter</span>
				</div>
			{/if}

			{#if $commandStatus.status === 'warming'}
				<div class="palette__status warming" id="command-palette-status" aria-live="polite">
					<span class="palette__spinner" aria-hidden="true"></span>
					<span class="palette__status-text">{$commandStatus.message}</span>
					<span class="palette__cadence" aria-hidden="true">
						{#each Array(Math.min(warmingPolls, 5)) as _, i (i)}
							<span class="palette__cadence-dot"></span>
						{/each}
					</span>
				</div>
			{:else if $commandStatus.status === 'running'}
				<div class="palette__status active loading" id="command-palette-status" aria-live="polite">
					<span class="palette__spinner" aria-hidden="true"></span>
					Running {$commandStatus.message}
				</div>
			{:else if $commandStatus.status === 'error'}
				<div class="palette__status error" id="command-palette-status" aria-live="polite">
					{$commandStatus.message}
				</div>
			{:else if paletteMode.kind === 'tag-list'}
				<div class="palette__status" id="command-palette-status" aria-live="polite">
					{tagList.length} tag{tagList.length === 1 ? '' : 's'}
					{#if !bridgeReady}
						· preparing desktop bridge
					{/if}
				</div>
			{:else}
				<div class="palette__status" id="command-palette-status" aria-live="polite">
					{rows.length} result{rows.length === 1 ? '' : 's'}
					{#if !bridgeReady}
						· preparing desktop bridge
					{/if}
				</div>
			{/if}

			{#if paletteFeedback}
				<div
					class="palette__feedback"
					class:error={paletteFeedback.kind === 'error'}
					class:success={paletteFeedback.kind === 'success'}
					role="status"
					aria-live="assertive"
				>
					{paletteFeedback.message}
				</div>
			{/if}

			<div id="command-palette-results" class="palette__list" role="listbox" aria-label="Commands">
				{#if paletteMode.kind === 'tag-list'}
					<section class="palette__group" aria-label="Tags">
						<h3>Tags</h3>
						{#each tagList as tag (tag)}
							{@const idx = rowIndex(`tag-${tag}`)}
							<div
								id={`row-tag-${tag}`}
								role="option"
								tabindex={idx === selectedIndex ? 0 : -1}
								aria-selected={idx === selectedIndex}
								class="palette__row"
								class:active={idx === selectedIndex}
								data-tag-row={tag}
								onclick={() => setCommandSearch(formatTagQuery(tag))}
								onkeydown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										setCommandSearch(formatTagQuery(tag));
									}
								}}
								onmousemove={() => {
									selectedIndex = idx;
								}}
							>
								<span class="palette__cell-main">
									<strong>{TAG_QUERY_PREFIX}{tag}</strong>
									<small>Filter commands tagged {tag}</small>
								</span>
								<span class="palette__cell-end">
									<span class="palette__badge">tag</span>
								</span>
							</div>
						{:else}
							<p class="palette__empty">No tags match</p>
						{/each}
					</section>
				{:else}
					{#if recentDocs.length > 0 || recentCmds.length > 0}
						<section class="palette__group" aria-label="Recent items">
							<h3>Recent</h3>
							{#each recentDocs as doc (doc.path)}
								{@const idx = rowIndex(`recent-doc-${doc.path}`)}
								<div
									class="palette__row-wrap"
									role="button"
									tabindex="0"
									oncontextmenu={(e) => handleDocContextMenu(e, doc)}
								>
									<div
										id={`row-recent-doc-${doc.path}`}
										role="option"
										tabindex={idx === selectedIndex ? 0 : -1}
										aria-selected={idx === selectedIndex}
										class="palette__row recent"
										class:active={idx === selectedIndex}
										data-doc-row={doc.path}
										onclick={() => {
											openDocument(doc);
											closeCommandPalette();
										}}
										onkeydown={(e) => {
											if (e.key === 'Enter' || e.key === ' ') {
												e.preventDefault();
												openDocument(doc);
												closeCommandPalette();
											}
										}}
										onmousemove={() => {
											selectedIndex = idx;
										}}
									>
										<span class="palette__cell-main">
											<strong>{doc.title}</strong>
											<small>{doc.path} · recent</small>
										</span>
										<span class="palette__cell-end">
											<span class="palette__badge">{doc.kind}</span>
										</span>
									</div>
									<button
										type="button"
										class="palette__recent-remove"
										tabindex="-1"
										aria-hidden="true"
										title="Remove from recents"
										onclick={() => removeRecentDocument(doc.path)}
									>
										&times;
									</button>
								</div>
							{/each}

							{#each recentCmds as command (command.id)}
								{@const idx = rowIndex(`recent-cmd-${command.id}`)}
								{@const desktopOnly = command.desktopOnly === true}
								{@const disabled = Boolean(command.disabledReason)}
								<div class="palette__row-wrap" tabindex="0" role="button">
									<div
										id={`row-recent-cmd-${command.id}`}
										role="option"
										tabindex={idx === selectedIndex ? 0 : -1}
										aria-selected={idx === selectedIndex}
										class="palette__row recent"
										class:active={idx === selectedIndex}
										class:desktop-only={desktopOnly}
										class:disabled={disabled}
										data-command-row={command.id}
										onclick={() => {
											if (disabled) {
												showPaletteFeedback('error', command.disabledReason ?? 'Unavailable');
												return;
											}
											void runCommand(command.id);
										}}
										onkeydown={(e) => {
											if (disabled) return;
											if (e.key === 'Enter' || e.key === ' ') {
												e.preventDefault();
												void runCommand(command.id);
											}
										}}
										onmousemove={() => {
											selectedIndex = idx;
										}}
									>
										<span class="palette__cell-main">
											<strong>{command.title}</strong>
											<small>
												{#if disabled}
													<span class="palette__disabled-reason">{command.disabledReason}</span>
												{:else}
													{command.group} · recent
												{/if}
											</small>
										</span>
										<span class="palette__cell-end">
											{#if desktopOnly}
												<span class="palette__badge" title="Desktop only">desktop</span>
											{/if}
											{#if formatShortcut(command.id) ?? command.shortcut}
												<kbd>{formatShortcut(command.id) ?? command.shortcut}</kbd>
											{/if}
										</span>
									</div>
									<button
										type="button"
										class="palette__recent-remove"
										tabindex="-1"
										aria-hidden="true"
										title="Remove from recents"
										onclick={() => removeRecentCommand(command.id)}
									>
										&times;
									</button>
								</div>
							{/each}
						</section>
						<div class="palette__divider" role="separator" aria-orientation="horizontal"></div>
					{/if}

					{#each CANONICAL_GROUP_ORDER as groupName}
						{@const projectMatches = filteredProjects.filter(() => groupName === 'PROJECT')}
						{@const docMatches = filteredDocs.filter((d) => (d.kind === 'folder' ? groupName === 'PROJECT' : groupName === 'FILE'))}
						{@const cmdMatches = groupedCommands.find((g) => g.group === groupName)?.commands ?? []}
						{@const hasItems = projectMatches.length > 0 || docMatches.length > 0 || cmdMatches.length > 0}
						{#if hasItems}
							<section class="palette__group" aria-label={groupName}>
								<h3>{groupName}</h3>
								{#each projectMatches as project (project.path)}
									{@const idx = rowIndex(`proj-${project.path}`)}
									<div
										class="palette__row-wrap"
										role="button"
										tabindex="0"
										oncontextmenu={(e) => handleProjectContextMenu(e, project)}
									>
										<div
											id={`row-proj-${project.path}`}
											role="option"
											tabindex={idx === selectedIndex ? 0 : -1}
											aria-selected={idx === selectedIndex}
											class="palette__row"
											class:active={idx === selectedIndex}
											data-project-row={project.path}
											onclick={() => {
												openRecentProject(project);
												closeCommandPalette();
											}}
											onkeydown={(e) => {
												if (e.key === 'Enter' || e.key === ' ') {
													e.preventDefault();
													openRecentProject(project);
													closeCommandPalette();
												}
											}}
											onmousemove={() => {
												selectedIndex = idx;
											}}
										>
											<span class="palette__cell-main">
												<strong>{project.name}</strong>
												<small>{project.path}</small>
											</span>
											<span class="palette__cell-end">
												<span class="palette__badge">project</span>
											</span>
										</div>
									</div>
								{/each}

								{#each docMatches as doc (doc.path)}
									{@const idx = rowIndex(`doc-${doc.path}`)}
									<div class="palette__row-wrap" role="button" tabindex="0" oncontextmenu={(e) => handleDocContextMenu(e, doc)}>
										<div
											id={`row-doc-${doc.path}`}
											role="option"
											tabindex={idx === selectedIndex ? 0 : -1}
											aria-selected={idx === selectedIndex}
											class="palette__row"
											class:active={idx === selectedIndex}
											data-doc-row={doc.path}
											onclick={() => {
												openDocument(doc);
												closeCommandPalette();
											}}
											onkeydown={(e) => {
												if (e.key === 'Enter' || e.key === ' ') {
													e.preventDefault();
													openDocument(doc);
													closeCommandPalette();
												}
											}}
											onmousemove={() => {
												selectedIndex = idx;
											}}
										>
											<span class="palette__cell-main">
												<strong>{doc.title}</strong>
												<small>{doc.path}</small>
											</span>
											<span class="palette__cell-end">
												<span class="palette__badge">{doc.kind}</span>
											</span>
										</div>
									</div>
								{/each}

								{#each cmdMatches as command (command.id)}
									{@const idx = rowIndex(`cmd-${command.id}`)}
									{@const desktopOnly = command.desktopOnly === true}
									{@const disabled = Boolean(command.disabledReason)}
									<div class="palette__row-wrap">
										<div
											id={`row-cmd-${command.id}`}
											role="option"
											tabindex={idx === selectedIndex ? 0 : -1}
											aria-selected={idx === selectedIndex}
											class="palette__row"
											class:active={idx === selectedIndex}
											class:desktop-only={desktopOnly}
											class:disabled={disabled}
											data-command-row={command.id}
											onclick={() => {
												if (disabled) {
													showPaletteFeedback('error', command.disabledReason ?? 'Unavailable');
													return;
												}
												void runCommand(command.id);
											}}
											onkeydown={(e) => {
												if (disabled) return;
												if (e.key === 'Enter' || e.key === ' ') {
													e.preventDefault();
													void runCommand(command.id);
												}
											}}
											onmousemove={() => {
												selectedIndex = idx;
											}}
										>
											<span class="palette__cell-main">
												<strong>{command.title}</strong>
												<small>
													{#if disabled}
														<span class="palette__disabled-reason">{command.disabledReason}</span>
													{:else}
														{command.aliases?.slice(0, 2).join(' · ') || command.group}
													{/if}
												</small>
											</span>
											<span class="palette__cell-end">
												{#if desktopOnly}
													<span class="palette__badge" title="Desktop only">desktop</span>
												{/if}
												{#if formatShortcut(command.id) ?? command.shortcut}
													<kbd>{formatShortcut(command.id) ?? command.shortcut}</kbd>
												{/if}
											</span>
										</div>
									</div>
								{/each}
							</section>
							<div class="palette__divider" role="separator" aria-orientation="horizontal"></div>
						{/if}
					{/each}

					{#if rows.length === 0}
						<p class="palette__empty">No results found</p>
					{/if}
				{/if}
			</div>
		</div>
	</div>
{/if}

<ContextMenu
	bind:open={contextMenuOpen}
	x={contextMenuPos.x}
	y={contextMenuPos.y}
	items={contextMenuItems}
	ariaLabel="Palette context menu"
/>

<style lang="sass">
	@use '$lib/styles/tokens' as t
	@use '$lib/styles/mixins' as m

	.overlay
		position: fixed
		inset: 0
		z-index: t.$z-palette
		padding-top: 12vh
		background: var(--ok-overlay-scrim)
		display: flex
		justify-content: center
		animation: palette-overlay-enter t.$duration-base t.$ease-out

	.palette
		width: min(680px, calc(100vw - 32px))
		max-height: 68vh
		@include m.overlay-surface(lg)
		overflow: hidden
		animation: palette-pop-enter t.$duration-base t.$ease-spring

		&__title
			position: absolute
			width: 1px
			height: 1px
			padding: 0
			margin: -1px
			overflow: hidden
			clip: rect(0, 0, 0, 0)
			white-space: nowrap
			border: 0

		&__header
			display: flex
			align-items: center
			border-bottom: 1px solid var(--ok-line)
			padding-right: t.$space-4

			input
				flex: 1
				border: 0
				padding: t.$space-4
				color: var(--ok-ink)
				background: transparent
				outline: none
				font-size: t.$font-size-md

				&:focus
					border-bottom-color: transparent

		&__tag-pill-btn
			appearance: none
			border: 1px solid var(--ok-line)
			background: var(--ok-surface)
			color: var(--ok-muted)
			font-size: t.$font-size-xs
			font-weight: 600
			padding: t.$space-1 t.$space-2
			border-radius: t.$radius-sm
			cursor: pointer
			white-space: nowrap
			transition: color t.$duration-fast t.$ease-out, background t.$duration-fast t.$ease-out, border-color t.$duration-fast t.$ease-out

			&:hover
				color: var(--ok-ink)
				border-color: var(--ok-accent)

			&.active
				color: var(--ok-accent)
				border-color: var(--ok-accent)
				background: var(--ok-highlight)

		&__tag-chip
			display: flex
			align-items: center
			justify-content: space-between
			gap: t.$space-2
			padding: t.$space-2 t.$space-4
			background: var(--ok-highlight)
			color: var(--ok-ink)
			font-size: t.$font-size-sm

			strong
				color: var(--ok-accent)

		&__tag-clear
			appearance: none
			border: 0
			background: transparent
			color: var(--ok-muted)
			cursor: pointer
			font-size: t.$font-size-md
			line-height: 1
			padding: 0 t.$space-1
			border-radius: t.$radius-sm

			&:hover
				color: var(--ok-ink)
				background: var(--ok-surface)

		&__status
			border-bottom: 1px solid var(--ok-line)
			padding: t.$space-2 t.$space-4
			background: var(--ok-surface)
			color: var(--ok-muted)
			font-size: t.$font-size-sm
			font-weight: 700
			display: flex
			align-items: center
			gap: t.$space-2
			transition: color t.$duration-fast t.$ease-out, background-color t.$duration-fast t.$ease-out

			&.active,
			&.loading
				color: var(--ok-accent)

			&.error
				color: var(--ok-danger)

			&.warming
				color: var(--ok-muted)
				font-weight: 500

		&__status-text
			min-width: 0
			overflow: hidden
			text-overflow: ellipsis
			white-space: nowrap

		&__cadence
			display: inline-flex
			gap: 3px
			margin-left: auto

		&__cadence-dot
			width: 5px
			height: 5px
			border-radius: 50%
			background: var(--ok-accent)
			opacity: 0.45
			animation: palette-cadence-pulse t.$duration-slow t.$ease-in-out infinite

			&:nth-child(2)
				animation-delay: 120ms

			&:nth-child(3)
				animation-delay: 240ms

			&:nth-child(4)
				animation-delay: 360ms

			&:nth-child(5)
				animation-delay: 480ms

		&__spinner
			width: 12px
			height: 12px
			border-radius: 50%
			border: 2px solid var(--ok-line)
			border-top-color: var(--ok-accent)
			animation: palette-spin 720ms linear infinite
			flex: 0 0 auto

		&__feedback
			padding: t.$space-2 t.$space-4
			font-size: t.$font-size-xs
			font-weight: 600

			&.error
				background: var(--ok-danger)
				color: var(--ok-ink)

			&.success
				background: var(--ok-accent)
				color: var(--ok-ink)

		&__list
			max-height: 48vh
			overflow-y: auto
			padding: t.$space-2

		&__divider
			height: 1px
			background: var(--ok-line)
			margin: t.$space-2 0

		&__group
			display: flex
			flex-direction: column
			gap: 2px

			h3
				font-size: 11px
				font-weight: 700
				letter-spacing: 0.05em
				text-transform: uppercase
				color: var(--ok-muted)
				padding: t.$space-2 t.$space-3
				margin: 0

		&__row-wrap
			position: relative
			display: flex
			align-items: center

			&:hover .palette__recent-remove
				opacity: 1

		&__row
			flex: 1
			display: flex
			align-items: center
			justify-content: space-between
			gap: t.$space-3
			padding: t.$space-2 t.$space-3
			border-radius: t.$radius-md
			cursor: pointer
			color: var(--ok-ink)
			user-select: none

			&:hover,
			&.active
				background: var(--ok-highlight)

			&.disabled
				opacity: 0.6
				cursor: not-allowed

		&__cell-main
			display: flex
			flex-direction: column
			min-width: 0

			strong
				font-size: t.$font-size-sm
				font-weight: 600
				color: var(--ok-ink)
				overflow: hidden
				text-overflow: ellipsis
				white-space: nowrap

			small
				font-size: t.$font-size-xs
				color: var(--ok-muted)
				overflow: hidden
				text-overflow: ellipsis
				white-space: nowrap

		&__disabled-reason
			color: var(--ok-danger)

		&__cell-end
			display: flex
			align-items: center
			gap: t.$space-2
			flex: 0 0 auto

			kbd
				font-family: inherit
				font-size: t.$font-size-xs
				color: var(--ok-muted)
				background: var(--ok-surface)
				border: 1px solid var(--ok-line)
				padding: 1px t.$space-2
				border-radius: t.$radius-sm

		&__badge
			font-size: 10px
			font-weight: 700
			text-transform: uppercase
			padding: 1px t.$space-1
			border-radius: t.$radius-sm
			background: var(--ok-surface)
			color: var(--ok-muted)
			border: 1px solid var(--ok-line)

		&__recent-remove
			appearance: none
			border: 0
			background: transparent
			color: var(--ok-muted)
			cursor: pointer
			font-size: t.$font-size-md
			line-height: 1
			padding: t.$space-1 t.$space-2
			border-radius: t.$radius-sm
			opacity: 0
			transition: opacity t.$duration-fast t.$ease-out

			&:hover
				color: var(--ok-danger)
				background: var(--ok-surface)

		&__empty
			padding: t.$space-6 t.$space-4
			text-align: center
			color: var(--ok-muted)
			font-size: t.$font-size-sm

	@keyframes palette-overlay-enter
		from
			opacity: 0
		to
			opacity: 1

	@keyframes palette-pop-enter
		from
			opacity: 0
			transform: scale(0.98) translateY(-4px)
		to
			opacity: 1
			transform: scale(1) translateY(0)

	@keyframes palette-spin
		from
			transform: rotate(0deg)
		to
			transform: rotate(360deg)

	@keyframes palette-cadence-pulse
		0%, 100%
			opacity: 0.25
		50%
			opacity: 1
</style>
