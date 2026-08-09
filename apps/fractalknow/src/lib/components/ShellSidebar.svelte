<script lang="ts">
	import {
		createDocument,
		createDocumentInFolder,
		deleteActiveDocument,
		moveWorkspaceDocument,
		openDialog,
		openRecentProject,
		openTarget,
		projectState,
		recentProjects,
		renameActiveDocument,
		removeRecentProject,
		setPreferredSidebarSection,
		setPreferredSidebarWidth,
		setSidebarKindFilter,
		setSidebarQuery,
		setSidebarShowHidden,
		setSidebarPinned,
		shellPreferences,
		shellState,
		workspaceDocuments,
	} from '$lib/shell';
	import type { SidebarKindFilter, WorkspaceDocument } from '$lib/shell';
	import Icon from '$lib/icons/Icon.svelte';
	import { fileTypeIconName } from '$lib/icons/fileTypeIcon';
	import ProjectSwitcher from './ProjectSwitcher.svelte';
	import Tooltip from './ui/Tooltip.svelte';
	import ContextMenu from './overlays/ContextMenu.svelte';
	import type { DropdownItem } from './overlays/DropdownMenu.svelte';
	import { desktopBridge } from '$lib/desktop';

	type TreeNode = {
		id: string;
		path: string;
		title: string;
		kind: WorkspaceDocument['kind'];
		document: WorkspaceDocument | null;
		children: TreeNode[];
	};

	type TreeRow = {
		node: TreeNode;
		depth: number;
		expanded: boolean;
		selected: boolean;
	};

	type SectionState = 'idle' | 'loading' | 'error';

	type SectionView = {
		value: 'files' | 'skills' | 'docs' | 'recent-projects';
		label: string;
		empty: { title: string; description: string };
		loading: { title: string; description: string };
		error: { title: string; description: string };
	};

	const filters: { label: string; value: SidebarKindFilter }[] = [
		{ label: 'All', value: 'all' },
		{ label: 'Docs', value: 'doc' },
		{ label: 'Folders', value: 'folder' },
		{ label: 'Assets', value: 'asset' },
	];

	const sectionViews: SectionView[] = [
		{
			value: 'files',
			label: 'Files',
			empty: {
				title: 'No files yet',
				description: 'Create a document or pick a folder to get started.',
			},
			loading: {
				title: 'Loading files',
				description: 'Reading the workspace from disk…',
			},
			error: {
				title: 'Could not read workspace',
				description: 'Check the folder permissions and try again.',
			},
		},
		{
			value: 'skills',
			label: 'Skills',
			empty: {
				title: 'No skills found',
				description: 'Drop a SKILL.md file in your project to register one.',
			},
			loading: {
				title: 'Scanning skills',
				description: 'Discovering agents and tools…',
			},
			error: {
				title: 'Could not load skills',
				description: 'The .ok/skills folder is unreadable.',
			},
		},
		{
			value: 'docs',
			label: 'Docs',
			empty: {
				title: 'No documents yet',
				description: 'Write your first doc to populate this section.',
			},
			loading: {
				title: 'Loading docs',
				description: 'Reading markdown and asset metadata…',
			},
			error: {
				title: 'Could not load docs',
				description: 'Some files failed to parse. See diagnostics for details.',
			},
		},
		{
			value: 'recent-projects',
			label: 'Recent',
			empty: {
				title: 'No recent projects',
				description: 'Pick a folder to add it here.',
			},
			loading: {
				title: 'Loading recent projects',
				description: 'Fetching saved folders…',
			},
			error: {
				title: 'Could not load recent projects',
				description: 'The local cache is unreadable.',
			},
		},
	];

	const sections = sectionViews.map(({ value, label }) => ({ value, label }));

	let resizing = $state(false);
	let startX = 0;
	let startWidth = 280;
	let expandedFolderPaths = $state(new Set<string>(['/content', '/assets']));
	let focusedRowIndex = $state(0);
	let draggedPath = $state<string | null>(null);
	let sectionDocuments = $derived(
		filterBySidebarSection($workspaceDocuments, $shellPreferences.sidebarSection),
	);
	let visibleDocuments = $derived(
		filterDocuments(
			sectionDocuments,
			$shellPreferences.sidebarQuery,
			$shellPreferences.sidebarKindFilter,
			$shellPreferences.sidebarShowHidden,
		).filter((document) => {
			// Context-menu 'Hide folder' — exclude anything under a hidden folder.
			for (const folder of hiddenFolders) {
				if (document.path.startsWith(`${folder}/`) || document.path === folder) return false;
			}
			return true;
		}),
	);
	let treeRows = $derived(flattenTree(buildTree(visibleDocuments), expandedFolderPaths, $shellState.activeTarget.path));

	let sectionState = $state<SectionState>('idle');
	let sectionError = $state<string | null>(null);

	let activeSectionView = $derived(
		sectionViews.find((view) => view.value === $shellPreferences.sidebarSection) ?? sectionViews[0],
	);

	const showTreeView = $derived(
		$shellPreferences.sidebarSection === 'files' ||
			$shellPreferences.sidebarSection === 'skills' ||
			$shellPreferences.sidebarSection === 'docs',
	);

	$effect(() => {
		// When the active section changes, reset transient error / loading state.
		sectionState = 'idle';
		sectionError = null;
	});

	function retrySection(): void {
		sectionState = 'idle';
		sectionError = null;
	}

	function setSectionState(state: SectionState, error?: string): void {
		sectionState = state;
		sectionError = error ?? null;
	}

	function selectDocument(document: WorkspaceDocument): void {
		openTarget(document);
	}

	function createAndOpen(kind: 'doc' | 'folder'): void {
		const document = createDocument(kind);
		setSidebarKindFilter('all');
		setSidebarQuery('');
		openTarget(document);
	}

	function revealActive(): void {
		setSidebarKindFilter('all');
		setSidebarQuery('');
		setSidebarShowHidden(true);
		const document = $workspaceDocuments.find((item) => item.path === $shellState.activeTarget.path);
		if (!document) return;
		expandAncestors(document.path);
		openTarget(document);
		focusedRowIndex = Math.max(0, treeRows.findIndex((row) => row.node.path === document.path));
	}

	function filterBySidebarSection(
		documents: WorkspaceDocument[],
		section: typeof $shellPreferences.sidebarSection,
	): WorkspaceDocument[] {
		if (section === 'skills') {
			return documents.filter(
				(document) =>
					document.kind === 'migration' ||
					/(?:^|\/)SKILL\.md$/i.test(document.path) ||
					document.path.includes('/.ok/skills'),
			);
		}
		if (section === 'docs') {
			return documents.filter(
				(document) =>
					document.kind === 'migration' ||
					(!(/(?:^|\/)SKILL\.md$/i.test(document.path) || document.path.includes('/.ok/skills')) &&
						(document.path.startsWith('/content/') ||
							document.path.startsWith('/docs/') ||
							/\.(md|mdx)$/i.test(document.path) ||
							document.kind === 'folder')),
			);
		}
		// files (default): full project-backed workspace tree
		return documents;
	}

	function filterDocuments(
		documents: WorkspaceDocument[],
		query: string,
		kindFilter: SidebarKindFilter,
		showHidden: boolean,
	): WorkspaceDocument[] {
		const normalized = query.trim().toLowerCase();
		return documents.filter((document) => {
			if (document.kind === 'migration') return false;
			if (!showHidden && isHiddenPath(document.path)) return false;
			if (kindFilter !== 'all' && document.kind !== kindFilter) return false;
			if (!normalized) return true;
			const haystack = `${document.title} ${document.path} ${document.kind}`.toLowerCase();
			return haystack.includes(normalized);
		});
	}

	function buildTree(documents: WorkspaceDocument[]): TreeNode[] {
		const root: TreeNode[] = [];

		for (const document of documents) {
			const segments = document.path.split('/').filter(Boolean);
			let siblings = root;
			let currentPath = '';

			segments.forEach((segment, index) => {
				currentPath = `${currentPath}/${segment}`;
				const isLeaf = index === segments.length - 1;
				let node = siblings.find((item) => item.path === currentPath);

				if (!node) {
					node = {
						id: currentPath,
						path: currentPath,
						title: segment,
						kind: isLeaf ? document.kind : 'folder',
						document: isLeaf ? document : null,
						children: [],
					};
					siblings.push(node);
				}

				if (isLeaf) {
					node.kind = document.kind;
					node.document = document;
					node.title = document.title;
				}

				siblings = node.children;
			});
		}

		return sortNodes(root);
	}

	function sortNodes(nodes: TreeNode[]): TreeNode[] {
		return nodes
			.map((node) => ({ ...node, children: sortNodes(node.children) }))
			.sort((left, right) => {
				if (left.kind === 'folder' && right.kind !== 'folder') return -1;
				if (left.kind !== 'folder' && right.kind === 'folder') return 1;
				return left.title.localeCompare(right.title);
			});
	}

	function flattenTree(nodes: TreeNode[], expandedPaths: Set<string>, activePath: string): TreeRow[] {
		const rows: TreeRow[] = [];
		const queryActive = $shellPreferences.sidebarQuery.trim().length > 0;

		function visit(node: TreeNode, depth: number): void {
			const expanded = queryActive || expandedPaths.has(node.path);
			rows.push({ node, depth, expanded, selected: node.path === activePath });
			if (node.kind !== 'folder' || !expanded) return;
			for (const child of node.children) visit(child, depth + 1);
		}

		for (const node of nodes) visit(node, 0);
		return rows;
	}

	function isHiddenPath(path: string): boolean {
		return path.split('/').filter(Boolean).some((segment) => segment.startsWith('.'));
	}

	function iconNameFor(node: TreeNode, expanded: boolean) {
		if (node.kind === 'folder') return expanded ? 'folder-open' : 'folder';
		return fileTypeIconName(node.path, node.kind);
	}

	function toggleFolder(path: string): void {
		expandedFolderPaths = nextExpandedSet(path);
	}

	function nextExpandedSet(path: string): Set<string> {
		const next = new Set(expandedFolderPaths);
		if (next.has(path)) next.delete(path);
		else next.add(path);
		return next;
	}

	function expandAncestors(path: string): void {
		const segments = path.split('/').filter(Boolean).slice(0, -1);
		const next = new Set(expandedFolderPaths);
		let current = '';
		for (const segment of segments) {
			current = `${current}/${segment}`;
			next.add(current);
		}
		expandedFolderPaths = next;
	}

	function activateRow(row: TreeRow): void {
		if (row.node.document) {
			selectDocument(row.node.document);
			return;
		}
		toggleFolder(row.node.path);
	}

	function createInside(row: TreeRow, kind: WorkspaceDocument['kind']): void {
		const folderPath = row.node.kind === 'folder' ? row.node.path : row.node.path.split('/').slice(0, -1).join('/');
		const document = createDocumentInFolder(folderPath || '/', kind);
		expandAncestors(document.path);
		openTarget(document);
	}

	// ── Context menu (right-click) ────────────────────────────────────────
	// Item sets mirror the reference app's file-tree context menu (ref-9):
	// New file / New folder · Reveal in Finder · Copy path ▸ · Expand all ·
	// Duplicate · Rename · Hide folder · Delete (destructive).

	let ctxOpen = $state(false);
	let ctxX = $state(0);
	let ctxY = $state(0);
	let ctxItems = $state<DropdownItem[]>([]);

	let hiddenFolders = $state<Set<string>>(readHiddenFolders());

	const HIDDEN_FOLDERS_KEY = 'fractalknow:hidden-folders';

	function readHiddenFolders(): Set<string> {
		try {
			const raw = window.localStorage.getItem(HIDDEN_FOLDERS_KEY);
			const parsed: unknown = raw ? JSON.parse(raw) : [];
			return new Set(Array.isArray(parsed) ? parsed.filter((p): p is string => typeof p === 'string') : []);
		} catch {
			return new Set();
		}
	}

	function persistHiddenFolders(next: Set<string>): void {
		hiddenFolders = next;
		try {
			window.localStorage.setItem(HIDDEN_FOLDERS_KEY, JSON.stringify([...next]));
		} catch {
			// quota — session state holds
		}
	}

	function relativePath(path: string): string {
		const projectPath = $projectState.path ?? '';
		return projectPath && path.startsWith(projectPath) ? path.slice(projectPath.length).replace(/^\//, '') : path;
	}

	async function revealPath(path: string): Promise<void> {
		const bridge = $desktopBridge.status === 'ready' ? $desktopBridge.bridge : null;
		await bridge?.shell.openExternal(path);
	}

	function copyText(text: string): void {
		void navigator.clipboard?.writeText(text);
	}

	function expandSubtree(path: string): void {
		const next = new Set(expandedFolderPaths);
		const prefix = `${path}/`;
		for (const document of visibleDocuments) {
			const dir = document.path.split('/').slice(0, -1).join('/');
			if (dir === path || dir.startsWith(prefix)) next.add(dir);
		}
		next.add(path);
		expandedFolderPaths = next;
	}

	function expandAllFolders(): void {
		const next = new Set<string>();
		for (const document of visibleDocuments) {
			const segments = document.path.split('/').filter(Boolean).slice(0, -1);
			let current = '';
			for (const segment of segments) {
				current = `${current}/${segment}`;
				next.add(current);
			}
		}
		expandedFolderPaths = next;
	}

	function duplicateRow(row: TreeRow): void {
		if (!row.node.document || row.node.kind === 'migration') return;
		openTarget(row.node.document);
		const copy = createDocument(row.node.document.kind === 'asset' ? 'asset' : 'doc');
		openTarget(copy);
	}

	function openContextMenu(event: MouseEvent, items: DropdownItem[]): void {
		event.preventDefault();
		event.stopPropagation();
		ctxX = event.clientX;
		ctxY = event.clientY;
		// Wrap activation handlers so the menu closes from the state owner —
		// child-initiated closes through chained $bindable props are unreliable.
		ctxItems = items.map((item) => {
			if (item.type === 'separator') return item;
			const original = item.onSelect;
			return {
				...item,
				onSelect: (value?: unknown) => {
					if (item.type === 'checkbox') (original as (next: boolean) => void)?.(value as boolean);
					else (original as () => void)?.();
					ctxOpen = false;
				},
			} as DropdownItem;
		});
		ctxOpen = true;
	}

	// Escape closes the menu from the state owner (focus may sit anywhere;
	// cursor-anchored menus can't rely on in-menu focus).
	$effect(() => {
		if (!ctxOpen) return;
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key !== 'Escape') return;
			event.preventDefault();
			ctxOpen = false;
		};
		document.addEventListener('keydown', handleEscape, true);
		return () => document.removeEventListener('keydown', handleEscape, true);
	});

	function rowContextItems(row: TreeRow): DropdownItem[] {
		const isFolder = row.node.kind === 'folder';
		const canReveal = $desktopBridge.status === 'ready' && $desktopBridge.bridge?.runtime === 'tauri';
		const items: DropdownItem[] = [];
		if (isFolder) {
			items.push(
				{ id: 'new-file', label: 'New file', onSelect: () => createInside(row, 'doc') },
				{ id: 'new-folder', label: 'New folder', onSelect: () => createInside(row, 'folder') },
				{ id: 'sep-1', type: 'separator' },
			);
		} else {
			items.push(
				{ id: 'open', label: 'Open', onSelect: () => activateRow(row) },
				{ id: 'sep-1', type: 'separator' },
			);
		}
		items.push(
			{ id: 'reveal', label: 'Reveal in Finder', disabled: !canReveal, onSelect: () => void revealPath(row.node.path) },
			{ id: 'copy-full', label: 'Copy full path', onSelect: () => copyText(row.node.path) },
			{ id: 'copy-relative', label: 'Copy relative path', onSelect: () => copyText(relativePath(row.node.path)) },
			{ id: 'sep-2', type: 'separator' },
		);
		if (isFolder) {
			items.push(
				{ id: 'expand-all', label: 'Expand all', onSelect: () => expandSubtree(row.node.path) },
				{
					id: 'hide-folder',
					label: hiddenFolders.has(row.node.path) ? 'Unhide folder' : 'Hide folder',
					onSelect: () => {
						const next = new Set(hiddenFolders);
						if (next.has(row.node.path)) next.delete(row.node.path);
						else next.add(row.node.path);
						persistHiddenFolders(next);
					},
				},
			);
		} else {
			items.push(
				{ id: 'duplicate', label: 'Duplicate', onSelect: () => duplicateRow(row) },
				{ id: 'rename', label: 'Rename', onSelect: () => renameRow(row) },
				{ id: 'sep-3', type: 'separator' },
				{ id: 'delete', label: 'Delete', danger: true, onSelect: () => deleteRow(row) },
			);
		}
		return items;
	}

	function emptySpaceContextItems(): DropdownItem[] {
		return [
			{ id: 'new-file', label: 'New file', onSelect: () => openTarget(createDocument('doc')) },
			{ id: 'new-folder', label: 'New folder', onSelect: () => openTarget(createDocument('folder')) },
			{ id: 'sep-1', type: 'separator' },
			{
				id: 'toggle-hidden',
				type: 'checkbox',
				label: 'Show hidden files',
				checked: $shellPreferences.sidebarShowHidden,
				onSelect: (next) => setSidebarShowHidden(next),
			},
			{
				id: 'only-markdown',
				type: 'checkbox',
				label: 'Show only markdown files',
				checked: $shellPreferences.sidebarKindFilter === 'doc',
				onSelect: (next) => setSidebarKindFilter(next ? 'doc' : 'all'),
			},
			{ id: 'sep-2', type: 'separator' },
			{ id: 'expand-all', label: 'Expand all', onSelect: expandAllFolders },
			{ id: 'collapse-all', label: 'Collapse all', onSelect: () => (expandedFolderPaths = new Set()) },
		];
	}

	function renameRow(row: TreeRow): void {
		if (!row.node.document || row.node.kind === 'migration') return;
		openTarget(row.node.document);
		renameActiveDocument();
	}

	function deleteRow(row: TreeRow): void {
		if (!row.node.document || row.node.kind === 'migration') return;
		openTarget(row.node.document);
		deleteActiveDocument({ force: true });
	}

	function handleTreeKeydown(event: KeyboardEvent): void {
		if (treeRows.length === 0) return;
		const row = treeRows[focusedRowIndex] ?? treeRows[0];

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			focusedRowIndex = Math.min(focusedRowIndex + 1, treeRows.length - 1);
			return;
		}
		if (event.key === 'ArrowUp') {
			event.preventDefault();
			focusedRowIndex = Math.max(focusedRowIndex - 1, 0);
			return;
		}
		if (event.key === 'ArrowRight' && row.node.kind === 'folder') {
			event.preventDefault();
			if (!row.expanded) toggleFolder(row.node.path);
			return;
		}
		if (event.key === 'ArrowLeft' && row.node.kind === 'folder') {
			event.preventDefault();
			if (row.expanded) toggleFolder(row.node.path);
			return;
		}
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			activateRow(row);
		}
	}

	function handleDragStart(event: DragEvent, row: TreeRow): void {
		if (!row.node.document || row.node.kind === 'migration') return;
		draggedPath = row.node.path;
		event.dataTransfer?.setData('text/plain', row.node.path);
		event.dataTransfer?.setDragImage(event.currentTarget as Element, 8, 8);
	}

	function handleDrop(event: DragEvent, row: TreeRow): void {
		event.preventDefault();
		const sourcePath = draggedPath ?? event.dataTransfer?.getData('text/plain') ?? null;
		if (!sourcePath || row.node.kind !== 'folder') return;
		const movedPath = `${row.node.path}/${sourcePath.split('/').filter(Boolean).at(-1)}`;
		if (moveWorkspaceDocument(sourcePath, row.node.path)) expandAncestors(movedPath);
		draggedPath = null;
	}

	function startResize(event: PointerEvent): void {
		resizing = true;
		startX = event.clientX;
		startWidth = $shellPreferences.sidebarWidth;
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
	}

	function resizeSidebar(event: PointerEvent): void {
		if (!resizing) return;
		setPreferredSidebarWidth(startWidth + event.clientX - startX);
	}

	function stopResize(event: PointerEvent): void {
		if (!resizing) return;
		resizing = false;
		(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
	}

	function handleResizeKeydown(event: KeyboardEvent): void {
		if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Home' && event.key !== 'End') {
			return;
		}
		event.preventDefault();
		// Bounds come from design tokens: $shell-sidebar-min-width (14.625rem ≈ 234px)
		// and $shell-sidebar-max-width (32rem ≈ 512px).
		if (event.key === 'Home') {
			setPreferredSidebarWidth(234);
			return;
		}
		if (event.key === 'End') {
			setPreferredSidebarWidth(512);
			return;
		}
		const direction = event.key === 'ArrowRight' ? 1 : -1;
		setPreferredSidebarWidth($shellPreferences.sidebarWidth + direction * 16);
	}
</script>

{#if $shellState.sidebarOpen}
	<aside
		class="sidebar"
		class:resizing
		role="navigation"
		aria-label="Workspace files"
		style={`--sidebar-width: ${$shellPreferences.sidebarWidth}px`}
	>
		<div class="sidebar__header">
			<div>
				<p>Workspace</p>
				<ProjectSwitcher />
			</div>
			<div class="sidebar__header-actions">
				<Tooltip content={$shellPreferences.sidebarPinned ? 'Unpin sidebar' : 'Pin sidebar'} side="bottom">
					<button
						type="button"
						class="sidebar__pin"
						class:active={$shellPreferences.sidebarPinned}
						aria-label={$shellPreferences.sidebarPinned ? 'Unpin sidebar' : 'Pin sidebar'}
						aria-pressed={$shellPreferences.sidebarPinned}
						onclick={() => setSidebarPinned(!$shellPreferences.sidebarPinned)}
					>
						<Icon name={$shellPreferences.sidebarPinned ? 'pin-on' : 'pin-off'} size={14} />
					</button>
				</Tooltip>
				<Tooltip content="Create project" side="bottom">
					<button type="button" aria-label="Create project" onclick={() => openDialog('create-project')}>
						<Icon name="plus" size={14} />
					</button>
				</Tooltip>
			</div>
		</div>

		<div class="sidebar__actions">
			<Tooltip content="New document" side="bottom">
				<button type="button" onclick={() => createAndOpen('doc')}>New doc</button>
			</Tooltip>
			<Tooltip content="New folder" side="bottom">
				<button type="button" onclick={() => createAndOpen('folder')}>New folder</button>
			</Tooltip>
		</div>

		<div class="sidebar__sections" aria-label="Sidebar section">
			{#each sections as section}
				<button
					type="button"
					class:active={$shellPreferences.sidebarSection === section.value}
					aria-pressed={$shellPreferences.sidebarSection === section.value}
					onclick={() => setPreferredSidebarSection(section.value)}
				>
					{section.label}
				</button>
			{/each}
		</div>

		{#if $shellPreferences.sidebarSection === 'files' || $shellPreferences.sidebarSection === 'skills' || $shellPreferences.sidebarSection === 'docs'}
			<div class="sidebar__filters">
				<label>
					<span>
						{#if $shellPreferences.sidebarSection === 'skills'}
							Filter skills
						{:else if $shellPreferences.sidebarSection === 'docs'}
							Filter docs
						{:else}
							Filter files
						{/if}
					</span>
					<input
						data-sidebar-search
						type="search"
						placeholder="Search by name or path"
						value={$shellPreferences.sidebarQuery}
						oninput={(event) => setSidebarQuery(event.currentTarget.value)}
					/>
				</label>
				<div class="sidebar__segments" aria-label="File type filter">
					{#each filters as filter}
						<button
							type="button"
							class:active={$shellPreferences.sidebarKindFilter === filter.value}
							aria-pressed={$shellPreferences.sidebarKindFilter === filter.value}
							onclick={() => setSidebarKindFilter(filter.value)}
						>
							{filter.label}
						</button>
					{/each}
				</div>
				<button class="sidebar__reveal" type="button" onclick={revealActive}>Reveal active</button>
				<label class="sidebar__hidden">
					<input
						type="checkbox"
						checked={$shellPreferences.sidebarShowHidden}
						onchange={(event) => setSidebarShowHidden(event.currentTarget.checked)}
					/>
					<span>Hidden files</span>
				</label>
			</div>

			<div class="tree" role="tree" tabindex="-1" aria-label="Document tree" onkeydown={handleTreeKeydown} oncontextmenu={(event) => openContextMenu(event, emptySpaceContextItems())}>
				{#each treeRows as row, index (row.node.path)}
					<div
						class="tree__row"
						class:active={row.selected}
						class:focused={index === focusedRowIndex}
						class:drop-target={draggedPath !== null && row.node.kind === 'folder'}
						style={`--depth: ${row.depth}`}
						role="treeitem"
						aria-level={row.depth + 1}
						aria-selected={row.selected}
						aria-expanded={row.node.kind === 'folder' ? row.expanded : undefined}
						aria-posinset={index + 1}
						aria-setsize={treeRows.length}
						tabindex={index === focusedRowIndex ? 0 : -1}
						draggable={Boolean(row.node.document && row.node.kind !== 'migration')}
						ondragstart={(event) => handleDragStart(event, row)}
						ondragend={() => {
							draggedPath = null;
						}}
						ondragover={(event) => {
							if (row.node.kind === 'folder') event.preventDefault();
						}}
						ondrop={(event) => handleDrop(event, row)}
						onfocus={() => {
							focusedRowIndex = index;
						}}
						oncontextmenu={(event) => openContextMenu(event, rowContextItems(row))}
					>
						<button
							class="tree__primary"
							type="button"
							onclick={() => {
								focusedRowIndex = index;
								activateRow(row);
							}}
						>
							<span class="tree__icon" aria-hidden="true">
								<Icon name={iconNameFor(row.node, row.expanded)} size={14} />
							</span>
							<span>
								<strong>{row.node.title}</strong>
								<small>{row.node.kind}{row.node.document?.dirty ? ' - unsaved' : ''}</small>
							</span>
						</button>
						<div class="tree__actions" aria-label={`Actions for ${row.node.title}`}>
							{#if row.node.kind === 'folder'}
								<button type="button" aria-label={`New document in ${row.node.title}`} onclick={() => createInside(row, 'doc')}>+</button>
								<button type="button" aria-label={`New folder in ${row.node.title}`} onclick={() => createInside(row, 'folder')}>□</button>
							{/if}
							{#if row.node.document}
								<button type="button" aria-label={`Rename ${row.node.title}`} onclick={() => renameRow(row)}>R</button>
								<button type="button" aria-label={`Delete ${row.node.title}`} onclick={() => deleteRow(row)}>
									<Icon name="x" size={12} />
								</button>
							{/if}
						</div>
					</div>
				{:else}
					{#if sectionState === 'loading'}
						<div class="sidebar__skeleton" aria-live="polite" aria-busy="true">
							<div class="sidebar__skeleton-row" style="width: 78%"></div>
							<div class="sidebar__skeleton-row" style="width: 64%"></div>
							<div class="sidebar__skeleton-row" style="width: 88%"></div>
							<div class="sidebar__skeleton-row" style="width: 46%"></div>
							<small>{activeSectionView.loading.description}</small>
						</div>
					{:else if sectionState === 'error'}
						<div class="sidebar__error" role="alert">
							<strong>{activeSectionView.error.title}</strong>
							<small>{activeSectionView.error.description}</small>
							{#if sectionError}
								<small class="sidebar__error-detail">{sectionError}</small>
							{/if}
							<button type="button" onclick={retrySection}>{activeSectionView.error.title.startsWith('Could not') ? 'Retry' : 'OK'}</button>
						</div>
					{:else}
						<div class="tree__empty">
							<strong>{activeSectionView.empty.title}</strong>
							<small>{activeSectionView.empty.description}</small>
						</div>
					{/if}
				{/each}
			</div>
		{:else if sectionState === 'loading'}
			<section class="recent" aria-busy="true" aria-live="polite">
				<div class="sidebar__skeleton">
					<div class="sidebar__skeleton-row" style="width: 70%"></div>
					<div class="sidebar__skeleton-row" style="width: 50%"></div>
					<small>{activeSectionView.loading.description}</small>
				</div>
			</section>
		{:else if sectionState === 'error'}
			<section class="recent" role="alert">
				<div class="sidebar__error">
					<strong>{activeSectionView.error.title}</strong>
					<small>{activeSectionView.error.description}</small>
					{#if sectionError}
						<small class="sidebar__error-detail">{sectionError}</small>
					{/if}
					<button type="button" onclick={retrySection}>Retry</button>
				</div>
			</section>
		{:else}
			<section class="recent" aria-label="Recent projects">
				{#each $recentProjects as project (project.path)}
					<article>
						<button type="button" onclick={() => openRecentProject(project)}>
							<strong>{project.name}</strong>
							<span>{project.path}</span>
							<small>{project.source} - {new Date(project.openedAt).toLocaleDateString()}</small>
						</button>
						<button
							type="button"
							aria-label={`Remove ${project.name} from recent projects`}
							onclick={() => removeRecentProject(project.path)}
						>
							Remove
						</button>
					</article>
				{:else}
					<div class="recent__empty">
						<strong>{activeSectionView.empty.title}</strong>
						<small>{activeSectionView.empty.description}</small>
					</div>
				{/each}
			</section>
		{/if}

		<button
			class="sidebar__resize"
			type="button"
			aria-label={`Resize sidebar, current width ${$shellPreferences.sidebarWidth}px`}
			onpointerdown={startResize}
			onpointermove={resizeSidebar}
			onpointerup={stopResize}
			onpointercancel={stopResize}
			onkeydown={handleResizeKeydown}
		></button>
	</aside>
{/if}

<ContextMenu bind:open={ctxOpen} x={ctxX} y={ctxY} items={ctxItems} ariaLabel="File tree context menu" />

<style lang="sass">
	@use '$lib/styles/tokens' as t
	@use '$lib/styles/mixins' as m

	.sidebar
		position: relative
		width: var(--sidebar-width)
		min-width: t.$shell-sidebar-min-width
		max-width: t.$shell-sidebar-max-width
		border-right: 1px solid var(--ok-line)
		background: var(--ok-panel)
		display: flex
		flex-direction: column
		@include m.scrollbar

		&.resizing
			user-select: none

		&__header
			padding: 18px
			display: flex
			align-items: center
			justify-content: space-between
			border-bottom: 1px solid var(--ok-line)
			gap: t.$space-2

			p
				margin: 0
				color: var(--ok-muted)
				font-size: 12px
				font-weight: 700

			button
				width: 30px
				height: 30px
				border: 1px solid var(--ok-line)
				border-radius: 6px
				background: var(--ok-surface)
				color: var(--ok-ink)
				cursor: pointer
				@include m.hover-transition(border-color)

				&:hover
					border-color: var(--ok-accent)

				&:focus-visible
					@include m.focus-ring

		&__header-actions
			display: flex
			gap: 6px
			align-items: center

		&__pin
			&.active
				background: var(--ok-accent)
				color: var(--ok-ink-inverse)
				border-color: var(--ok-accent)

		&__skeleton
			padding: t.$space-3
			display: grid
			gap: t.$space-2
			border: 1px dashed var(--ok-line)
			border-radius: t.$radius-md

			small
				color: var(--ok-muted)
				font-size: t.$font-size-xs
				margin-top: t.$space-1

		&__skeleton-row
			height: 10px
			border-radius: t.$radius-pill
			background: linear-gradient(90deg, var(--ok-line), var(--ok-surface), var(--ok-line))
			background-size: 200% 100%
			animation: sidebar-skeleton-shimmer 1.4s t.$ease-in-out infinite

		&__error
			padding: t.$space-3
			display: grid
			gap: t.$space-2
			border: 1px solid var(--ok-danger)
			border-radius: t.$radius-md
			background: var(--ok-surface)
			color: var(--ok-ink)

			strong
				color: var(--ok-danger)

			small
				color: var(--ok-muted)
				font-size: t.$font-size-xs

			button
				justify-self: start
				border: 1px solid var(--ok-line)
				border-radius: t.$radius-sm
				padding: t.$space-1 t.$space-2
				background: var(--ok-panel)
				color: var(--ok-ink)
				cursor: pointer

				&:hover
					border-color: var(--ok-accent)

		&__error-detail
			font-family: t.$font-family-mono
			color: var(--ok-muted)
			overflow-wrap: anywhere

		&__actions
			padding: 10px
			border-bottom: 1px solid var(--ok-line)
			display: grid
			grid-template-columns: 1fr 1fr
			gap: 8px

			button
				border: 1px solid var(--ok-line)
				border-radius: 6px
				padding: 7px
				background: var(--ok-surface)
				color: var(--ok-ink)
				cursor: pointer
				font-size: 12px
				@include m.press-feedback
				@include m.hover-transition(border-color)

				&:hover
					border-color: var(--ok-accent)

				&:focus-visible
					@include m.focus-ring

		&__sections
			padding: 10px
			border-bottom: 1px solid var(--ok-line)
			display: grid
			grid-template-columns: repeat(2, minmax(0, 1fr))
			gap: 6px

			button
				border: 1px solid var(--ok-line)
				border-radius: 6px
				padding: 7px
				background: var(--ok-surface)
				color: var(--ok-muted)
				cursor: pointer
				font-size: 12px
				@include m.hover-transition(border-color)

				&.active
					border-color: var(--ok-accent)
					color: var(--ok-ink)

				&:hover
					border-color: var(--ok-accent)

				&:focus-visible
					@include m.focus-ring

		&__filters
			padding: 10px
			border-bottom: 1px solid var(--ok-line)
			display: grid
			gap: 8px

			label
				display: grid
				gap: 5px

			span
				color: var(--ok-muted)
				font-size: 11px
				font-weight: 700
				text-transform: uppercase

			input
				width: 100%
				border: 1px solid var(--ok-line)
				border-radius: 6px
				padding: 8px
				background: var(--ok-surface)
				color: var(--ok-ink)
				outline: none

				&:focus
					border-color: var(--ok-accent)

		&__segments
			display: grid
			grid-template-columns: repeat(4, minmax(0, 1fr))
			gap: 4px

			button
				border: 1px solid var(--ok-line)
				border-radius: 6px
				padding: 6px 4px
				background: var(--ok-surface)
				color: var(--ok-muted)
				cursor: pointer
				font-size: 11px
				@include m.hover-transition(border-color)

				&.active
					border-color: var(--ok-accent)
					color: var(--ok-ink)

				&:hover
					border-color: var(--ok-accent)

				&:focus-visible
					@include m.focus-ring

		&__reveal
			border: 1px solid var(--ok-line)
			border-radius: 6px
			padding: 7px
			background: var(--ok-surface)
			color: var(--ok-ink)
			cursor: pointer
			font-size: 12px
			@include m.hover-transition(border-color)

			&:hover
				border-color: var(--ok-accent)

			&:focus-visible
				@include m.focus-ring

		&__hidden
			display: flex
			align-items: center
			gap: 8px
			color: var(--ok-muted)
			font-size: 12px
			font-weight: 700

			input
				width: auto

		&__resize
			position: absolute
			inset: 0 -5px 0 auto
			width: 10px
			border: 0
			padding: 0
			background: transparent
			cursor: col-resize

			&:focus-visible
				@include m.focus-ring(-2px, 2px)

			&:hover::after,
			&:focus-visible::after
				content: ''
				position: absolute
				inset: 0 4px
				background: var(--ok-accent)

	.tree,
	.recent
		min-height: 0
		padding: 10px
		overflow: auto
		display: flex
		flex-direction: column
		gap: 6px

	.tree
		&__row
			display: flex
			align-items: center
			border-radius: 6px
			padding-left: calc(var(--depth) * 16px)

			&:hover,
			&.active,
			&.focused
				background: var(--ok-surface)

			&.drop-target
				outline: 1px dashed transparent

				&:hover
					outline-color: var(--ok-accent)

			&:focus
				@include m.focus-ring(1px, 2px)

		&__primary
			min-width: 0
			flex: 1
			border: 0
			padding: 8px 6px
			background: transparent
			color: var(--ok-muted)
			display: flex
			align-items: center
			gap: 8px
			text-align: left
			cursor: pointer

			&:hover
				color: var(--ok-ink)

			span:last-child
				min-width: 0

			strong,
			small
				display: block
				overflow: hidden
				text-overflow: ellipsis
				white-space: nowrap

			strong
				color: var(--ok-ink)

			small
				margin-top: 2px
				color: var(--ok-muted)
				font-size: 11px

		&__icon
			width: 18px
			flex: 0 0 18px
			color: var(--ok-accent)
			text-align: center

		&__actions
			display: flex
			gap: 2px
			padding-right: 4px
			opacity: 0

			.tree__row:hover &,
			.tree__row.focused &,
			.tree__row.active &
				opacity: 1

			button
				width: 24px
				height: 24px
				border: 1px solid var(--ok-line)
				border-radius: 5px
				padding: 0
				background: var(--ok-panel)
				color: var(--ok-muted)
				text-align: center
				cursor: pointer

				&:hover
					color: var(--ok-ink)
					border-color: var(--ok-accent)

		&__empty
			border: 1px dashed var(--ok-line)
			border-radius: 8px
			padding: 14px
			color: var(--ok-muted)

			strong,
			small
				display: block

			strong
				color: var(--ok-ink)

			small
				margin-top: 4px
				font-size: 12px

	.recent
		article
			border: 1px solid var(--ok-line)
			border-radius: 8px
			padding: 8px
			background: var(--ok-surface)
			display: grid
			gap: 6px

			button
				border: 0
				border-radius: 6px
				padding: 6px
				background: transparent
				color: var(--ok-muted)
				text-align: left
				cursor: pointer

				&:hover
					background: var(--ok-panel)
					color: var(--ok-ink)

				&:last-child
					border: 1px solid var(--ok-line)
					text-align: center
					font-size: 11px

			strong,
			span,
			small
				display: block
				overflow: hidden
				text-overflow: ellipsis
				white-space: nowrap

			strong
				color: var(--ok-ink)

			span
				margin-top: 3px
				font-size: 12px

			small
				margin-top: 4px
				font-size: 11px

		&__empty
			border: 1px dashed var(--ok-line)
			border-radius: 8px
			padding: 14px
			color: var(--ok-muted)

			strong,
			small
				display: block

			strong
				color: var(--ok-ink)

			small
				margin-top: 4px
				font-size: 12px

	@media (max-width: 760px)
		.sidebar
			width: 100%
			min-width: 0
			max-width: none
			max-height: 48dvh
			border-right: 0
			border-bottom: 1px solid var(--ok-line)

			&__header
				padding: 12px

			&__actions,
			&__filters
				padding-inline: 12px

			&__resize
				display: none

	// macOS — never let the sidebar action cluster slide under the OS traffic
	// lights. --ok-titlebar-reserve-left flips to 5.25rem under .platform-macos
	// (1rem elsewhere), so max() preserves the regular 12px gutters elsewhere.
	.sidebar
		&__header,
		&__actions,
		&__sections,
		&__filters
			padding-left: max(12px, var(--ok-titlebar-reserve-left))

	@keyframes sidebar-skeleton-shimmer
		from
			background-position: 0% 50%
		to
			background-position: -200% 50%

	@media (prefers-reduced-motion: reduce)
		button
			transition: none

		.sidebar__skeleton-row
			animation: none
			background: var(--ok-line)
</style>
