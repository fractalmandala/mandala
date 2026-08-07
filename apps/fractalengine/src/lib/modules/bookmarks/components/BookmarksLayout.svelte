<script lang="ts">
	import { bookmarks } from "../state/bookmarks.svelte";
	import { appState } from "$lib/state/app.svelte";
	import VirtualList from "$lib/components/VirtualList.svelte";
	import { PaneGroup, Pane, PaneResizer } from "paneforge";

	let urlInput = $state("");
	let titleInput = $state("");
	let descInput = $state("");
	let tagsInput = $state("");
	let editingId = $state<string | null>(null);
	let paneOne: ReturnType<typeof Pane>;
	let collapsed = $state(false);

	const ROW_HEIGHT = 72;

	$effect(() => {
		// Load bookmarks when the component mounts (template activation)
		if (
			appState.activeTemplateId === "bookmarks" &&
			!bookmarks.loaded &&
			!bookmarks.loading
		) {
			void bookmarks.load();
		}
	});

	function handleAdd(e: Event) {
		e.preventDefault();
		const url = urlInput.trim();
		const title = titleInput.trim();
		if (!url || !title) return;
		const tags = tagsInput.trim()
			? tagsInput
					.split(",")
					.map((t) => t.trim())
					.filter(Boolean)
			: [];
		void bookmarks.add({ url, title, description: descInput.trim(), tags });
		urlInput = "";
		titleInput = "";
		descInput = "";
		tagsInput = "";
		bookmarks.setShowAddForm(false);
	}

	function startEdit(b: {
		id: string;
		url: string;
		title: string;
		description: string;
		tags: string[];
	}) {
		editingId = b.id;
		urlInput = b.url;
		titleInput = b.title;
		descInput = b.description;
		tagsInput = b.tags.join(", ");
		bookmarks.setShowAddForm(true);
	}

	function handleSaveEdit(e: Event) {
		e.preventDefault();
		if (!editingId) return;
		const url = urlInput.trim();
		const title = titleInput.trim();
		if (!url || !title) return;
		const tags = tagsInput.trim()
			? tagsInput
					.split(",")
					.map((t) => t.trim())
					.filter(Boolean)
			: [];
		void bookmarks.edit(editingId, {
			url,
			title,
			description: descInput.trim(),
			tags,
		});
		cancelForm();
	}

	function cancelForm() {
		editingId = null;
		urlInput = "";
		titleInput = "";
		descInput = "";
		tagsInput = "";
		bookmarks.setShowAddForm(false);
	}

	function handleDelete(id: string, e: Event) {
		e.stopPropagation();
		void bookmarks.remove(id);
	}

	function handleEdit(id: string, e: Event) {
		e.stopPropagation();
		const bookmark = bookmarks.items.find((item) => item.id === id);
		if (bookmark) startEdit(bookmark);
	}

	function handleBookmarkSelect(item: unknown, _index: number) {
		const b = item as { id: string; url: string; title: string };
		window.open(b.url, "_blank");
	}

	type BookmarkItem = {
		id: string;
		url: string;
		title: string;
		description: string;
		tags: string[];
		createdAt: number;
		updatedAt: number;
	};
</script>

<PaneGroup direction="horizontal" class="inside-module-wrapper">
	<Pane defaultSize={25} class="module-sidebar" bind:this={paneOne} collapsible={true} minSize={15}>
		<div class="sidebar-carrier background30">
		<div class="bookmarks-toolbar">
			<input
				class="bookmarks-search"
				type="text"
				placeholder="Search bookmarks…"
				bind:value={bookmarks.filterText}
				oninput={(e) =>
					bookmarks.setFilterText(
						(e.target as HTMLInputElement).value,
					)}
			/>
			<button
				class="bookmark-add-btn"
				onclick={() => {
					editingId = null;
					urlInput = "";
					titleInput = "";
					descInput = "";
					tagsInput = "";
					bookmarks.setShowAddForm(!bookmarks.showAddForm);
				}}
				aria-label="Add bookmark"
			>
				+ Add
			</button>
		</div>
		</div>
	</Pane>
	<PaneResizer class="vertical-sizer"/>
	<Pane defaultSize={50}>
		<div class="module-central">
			<div class="central-carrier ">
		<div class="bookmarks-list">
			{#if bookmarks.loading}
				<div class="bookmarks-status">Loading bookmarks…</div>
			{:else if bookmarks.error}
				<div class="bookmarks-status bookmark-error">
					{bookmarks.error}
				</div>
			{:else if bookmarks.filteredItems.length === 0}
				<div class="bookmarks-status">
					{bookmarks.items.length === 0
						? "No bookmarks yet. Add one above!"
						: "No bookmarks match your filters."}
				</div>
			{:else}
				<VirtualList
					items={bookmarks.filteredItems}
					rowHeight={ROW_HEIGHT}
					row={bookmarkRow}
					onItemSelect={handleBookmarkSelect}
					containerClass="bookmarks-virtual-list"
				/>
			{/if}
			{#snippet bookmarkRow(item: unknown, _index: number)}
				{@const b = item as BookmarkItem}
				<div class="bookmark-row box gap4">
					<div class="row ycenter gap8">
						<span class="bookmark-title truncate">{b.title}</span>
						<button
							class="bookmark-edit-btn"
							type="button"
							aria-label={`Edit ${b.title}`}
							onclick={(e) => handleEdit(b.id, e)}>Edit</button
						>
						<button
							class="bookmark-delete-btn"
							type="button"
							aria-label={`Delete ${b.title}`}
							onclick={(e) => handleDelete(b.id, e)}>✕</button
						>
					</div>
					<div class="row ycenter gap4">
						<span class="bookmark-url truncate">{b.url}</span>
						<span class="bookmark-date"
							>{new Date(b.updatedAt).toLocaleDateString()}</span
						>
					</div>
					{#if b.description}
						<div class="bookmark-desc truncate">
							{b.description}
						</div>
					{/if}
					{#if b.tags.length > 0}
						<div class="bookmark-tags">
							{#each b.tags as tag (tag)}
								<span class="bookmark-tag">{tag}</span>
							{/each}
						</div>
					{/if}
				</div>
			{/snippet}
		</div>
			</div>
		</div>
	</Pane>
	<PaneResizer class="vertical-sizer"/>
	<Pane defaultSize={25} class="module-sidebar">
		<div class="sidebar-carrier background10">
<h1>1</h1>
		</div>
	</Pane>
</PaneGroup>
