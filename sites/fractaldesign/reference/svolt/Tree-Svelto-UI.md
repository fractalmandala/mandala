---
created: 2026-06-22T23:50:55 (UTC +05:30)
tags: []
source: https://sveltoui.dev/elements/tree
author: SveltoUI
---

# Tree - Svelto UI

> ## Excerpt
> Browse Tree components for Svelte 5. UI elements you can copy into your project.

---
GeneralTree01.svelte

```
<!-- @free -->
<!-- @medium -->
<!-- @description Simple file tree -->
<script>
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import Folder from "@lucide/svelte/icons/folder";
  import File from "@lucide/svelte/icons/file";

  let treeData = $state([
    {
      id: 1,
      name: "Documents",
      type: "folder",
      isOpen: true,
      children: [
        { id: 2, name: "Report.pdf", type: "file" },
        { id: 3, name: "Budget.xlsx", type: "file" },
        {
          id: 4,
          name: "Projects",
          type: "folder",
          isOpen: false,
          children: [
            { id: 5, name: "Project A.docx", type: "file" },
            { id: 6, name: "Project B.docx", type: "file" }
          ]
        }
      ]
    },
    {
      id: 7,
      name: "Images",
      type: "folder",
      isOpen: false,
      children: [
        { id: 8, name: "Photo1.avif", type: "file" },
        { id: 9, name: "Photo2.avif", type: "file" }
      ]
    },
    { id: 10, name: "README.md", type: "file" }
  ]);

  function toggleFolder(item) {
    item.isOpen = !item.isOpen;
    treeData = [...treeData]; // Trigger reactivity
  }
</script>

{#snippet TreeNode(items, level = 0)}
  <ul class="space-y-0.5" style="margin-left: {level * 16}px">
    {#each items as item}
      <li>
        {#if item.type === "folder"}
          <button
            class="flex items-center gap-1.5 w-full rounded-md px-2 py-1 text-sm hover:bg-muted text-left"
            onclick={() => toggleFolder(item)}
          >
            {#if item.isOpen}
              <ChevronDown class="h-4 w-4 text-muted-foreground shrink-0" />
            {:else}
              <ChevronRight class="h-4 w-4 text-muted-foreground shrink-0" />
            {/if}
            <Folder class="h-4 w-4 text-yellow-500 shrink-0" />
            <span>{item.name}</span>
          </button>
          {#if item.isOpen && item.children}
            {@render TreeNode(item.children, level + 1)}
          {/if}
        {:else}
          <div class="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm hover:bg-muted ml-5">
            <File class="h-4 w-4 text-muted-foreground shrink-0" />
            <span>{item.name}</span>
          </div>
        {/if}
      </li>
    {/each}
  </ul>
{/snippet}

<!-- Simple file tree -->
<div class="w-full max-w-xs rounded-lg border p-3">
  <h3 class="font-semibold mb-3 px-2">Files</h3>
  {@render TreeNode(treeData)}
</div>
```

GeneralTree02.svelte

```
<!-- @free -->
<!-- @large -->
<!-- @description Tree with checkboxes -->
<script>
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import Check from "@lucide/svelte/icons/check";
  import Minus from "@lucide/svelte/icons/minus";

  let treeData = $state([
    {
      id: 1,
      name: "All Categories",
      checked: false,
      indeterminate: false,
      children: [
        {
          id: 2,
          name: "Electronics",
          checked: false,
          indeterminate: false,
          children: [
            { id: 3, name: "Phones", checked: false },
            { id: 4, name: "Laptops", checked: false },
            { id: 5, name: "Tablets", checked: false }
          ]
        },
        {
          id: 6,
          name: "Clothing",
          checked: false,
          indeterminate: false,
          children: [
            { id: 7, name: "Men", checked: false },
            { id: 8, name: "Women", checked: false },
            { id: 9, name: "Kids", checked: false }
          ]
        },
        { id: 10, name: "Books", checked: false }
      ]
    }
  ]);

  let expanded = $state(new Set([1, 2, 6]));

  function toggle(id) {
    if (expanded.has(id)) {
      expanded.delete(id);
    } else {
      expanded.add(id);
    }
    expanded = new Set(expanded);
  }

  function updateParent(item) {
    if (!item.children) return;

    const allChecked = item.children.every(c => c.checked);
    const someChecked = item.children.some(c => c.checked || c.indeterminate);

    item.checked = allChecked;
    item.indeterminate = !allChecked && someChecked;
  }

  function checkItem(item, checked) {
    item.checked = checked;
    item.indeterminate = false;

    if (item.children) {
      item.children.forEach(child => checkItem(child, checked));
    }

    treeData = [...treeData];
  }

  function handleCheck(item, parent) {
    checkItem(item, !item.checked);

    // Update parent states
    function updateParents(items, targetId, parentChain = []) {
      for (const i of items) {
        if (i.id === targetId) {
          parentChain.reverse().forEach(p => updateParent(p));
          return true;
        }
        if (i.children && updateParents(i.children, targetId, [...parentChain, i])) {
          return true;
        }
      }
      return false;
    }

    updateParents(treeData, item.id);
    treeData = [...treeData];
  }
</script>

{#snippet TreeNode(items, parent = null)}
  <ul class="space-y-1">
    {#each items as item}
      <li class="ml-4">
        <div class="flex items-center gap-2">
          {#if item.children}
            <button class="p-0.5 hover:bg-muted rounded" onclick={() => toggle(item.id)}>
              {#if expanded.has(item.id)}
                <ChevronDown class="h-3 w-3" />
              {:else}
                <ChevronRight class="h-3 w-3" />
              {/if}
            </button>
          {:else}
            <span class="w-4"></span>
          {/if}

          <button
            class="flex h-4 w-4 items-center justify-center rounded border transition-colors
              {item.checked ? 'bg-primary border-primary text-primary-foreground' : ''}
              {item.indeterminate ? 'bg-primary border-primary text-primary-foreground' : ''}"
            onclick={() => handleCheck(item, parent)}
          >
            {#if item.checked}
              <Check class="h-3 w-3" />
            {:else if item.indeterminate}
              <Minus class="h-3 w-3" />
            {/if}
          </button>

          <span class="text-sm">{item.name}</span>
        </div>

        {#if item.children && expanded.has(item.id)}
          {@render TreeNode(item.children, item)}
        {/if}
      </li>
    {/each}
  </ul>
{/snippet}

<!-- Tree with checkboxes -->
<div class="w-full max-w-xs rounded-lg border p-4">
  <h3 class="font-semibold mb-3">Select Categories</h3>
  {@render TreeNode(treeData)}
</div>
```

GeneralTree03.svelte

```
<!-- @free -->
<!-- @large -->
<!-- @description Hierarchical tree view with dark mode support. -->
<script>
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import Search from "@lucide/svelte/icons/search";

  let searchQuery = $state('');

  const treeData = [
    {
      id: 1,
      name: "src",
      children: [
        {
          id: 2,
          name: "components",
          children: [
            { id: 3, name: "Button.svelte" },
            { id: 4, name: "Input.svelte" },
            { id: 5, name: "Modal.svelte" }
          ]
        },
        {
          id: 6,
          name: "routes",
          children: [
            { id: 7, name: "+page.svelte" },
            { id: 8, name: "+layout.svelte" }
          ]
        },
        { id: 9, name: "app.css" },
        { id: 10, name: "app.html" }
      ]
    },
    {
      id: 11,
      name: "static",
      children: [
        { id: 12, name: "favicon.avif" },
        { id: 13, name: "robots.txt" }
      ]
    },
    { id: 14, name: "package.json" },
    { id: 15, name: "svelte.config.js" }
  ];

  let expanded = $state(new Set([1, 2, 6]));

  function toggle(id) {
    if (expanded.has(id)) {
      expanded.delete(id);
    } else {
      expanded.add(id);
    }
    expanded = new Set(expanded);
  }

  function matchesSearch(item, query) {
    if (!query) return true;
    const q = query.toLowerCase();
    if (item.name.toLowerCase().includes(q)) return true;
    if (item.children) {
      return item.children.some(child => matchesSearch(child, query));
    }
    return false;
  }

  function filterTree(items) {
    return items.filter(item => matchesSearch(item, searchQuery));
  }
</script>

{#snippet TreeNode(items, level = 0)}
  <ul class="space-y-0.5">
    {#each filterTree(items) as item}
      <li style="margin-left: {level * 16}px">
        <div class="flex items-center gap-1">
          {#if item.children}
            <button class="p-0.5 hover:bg-muted rounded" onclick={() => toggle(item.id)}>
              {#if expanded.has(item.id)}
                <ChevronDown class="h-4 w-4 text-muted-foreground" />
              {:else}
                <ChevronRight class="h-4 w-4 text-muted-foreground" />
              {/if}
            </button>
          {:else}
            <span class="w-5"></span>
          {/if}

          <span class="text-sm py-1 px-1 rounded hover:bg-muted cursor-pointer
            {searchQuery && item.name.toLowerCase().includes(searchQuery.toLowerCase()) ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''}">
            {item.name}
          </span>
        </div>

        {#if item.children && expanded.has(item.id)}
          {@render TreeNode(item.children, level + 1)}
        {/if}
      </li>
    {/each}
  </ul>
{/snippet}

<!-- Searchable tree -->
<div class="w-full max-w-xs rounded-lg border">
  <!-- Search -->
  <div class="p-3 border-b">
    <div class="relative">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search files..."
        class="w-full rounded-md border bg-background pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  </div>

  <!-- Tree -->
  <div class="p-3 max-h-80 overflow-y-auto">
    {@render TreeNode(treeData)}
  </div>
</div>
```

GeneralTree04.svelte

```
<!-- @free -->
<!-- @large -->
<!-- @description Editable tree with context menu -->
<script>
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import MoreHorizontal from "@lucide/svelte/icons/more-horizontal";
  import Plus from "@lucide/svelte/icons/plus";
  import Pencil from "@lucide/svelte/icons/pencil";
  import Trash2 from "@lucide/svelte/icons/trash-2";

  let treeData = $state([
    {
      id: 1,
      name: "Root",
      children: [
        { id: 2, name: "Item 1" },
        {
          id: 3,
          name: "Item 2",
          children: [
            { id: 4, name: "Subitem 2.1" },
            { id: 5, name: "Subitem 2.2" }
          ]
        },
        { id: 6, name: "Item 3" }
      ]
    }
  ]);

  let expanded = $state(new Set([1, 3]));
  let selected = $state(null);
  let contextMenu = $state(null);

  function toggle(id) {
    if (expanded.has(id)) {
      expanded.delete(id);
    } else {
      expanded.add(id);
    }
    expanded = new Set(expanded);
  }

  function showContextMenu(event, item) {
    event.stopPropagation();
    contextMenu = contextMenu === item.id ? null : item.id;
  }

  function addChild(item) {
    const newId = Date.now();
    if (!item.children) item.children = [];
    item.children.push({ id: newId, name: `New Item` });
    expanded.add(item.id);
    expanded = new Set(expanded);
    treeData = [...treeData];
    contextMenu = null;
  }

  function deleteItem(items, id) {
    const index = items.findIndex(i => i.id === id);
    if (index >= 0) {
      items.splice(index, 1);
      return true;
    }
    for (const item of items) {
      if (item.children && deleteItem(item.children, id)) {
        return true;
      }
    }
    return false;
  }

  function handleDelete(id) {
    deleteItem(treeData, id);
    treeData = [...treeData];
    contextMenu = null;
  }
</script>

<svelte:document onclick={() => contextMenu = null} />

{#snippet TreeNode(items, level = 0)}
  <ul class="space-y-0.5">
    {#each items as item}
      <li style="margin-left: {level * 16}px">
        <div
          class="flex items-center gap-1 group rounded-md px-1 py-1 hover:bg-muted
            {selected === item.id ? 'bg-primary/10' : ''}"
        >
          {#if item.children}
            <button class="p-0.5 hover:bg-muted rounded" onclick={() => toggle(item.id)}>
              {#if expanded.has(item.id)}
                <ChevronDown class="h-4 w-4 text-muted-foreground" />
              {:else}
                <ChevronRight class="h-4 w-4 text-muted-foreground" />
              {/if}
            </button>
          {:else}
            <span class="w-5"></span>
          {/if}

          <button
            class="flex-1 text-left text-sm"
            onclick={() => selected = item.id}
          >
            {item.name}
          </button>

          <div class="relative">
            <button
              class="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-background"
              onclick={(e) => showContextMenu(e, item)}
            >
              <MoreHorizontal class="h-4 w-4" />
            </button>

            {#if contextMenu === item.id}
              <div class="absolute right-0 top-full z-50 mt-1 w-32 rounded-md border bg-background shadow-lg">
                <button
                  class="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                  onclick={() => addChild(item)}
                >
                  <Plus class="h-4 w-4" />
                  Add child
                </button>
                <button class="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted">
                  <Pencil class="h-4 w-4" />
                  Rename
                </button>
                <button
                  class="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-muted"
                  onclick={() => handleDelete(item.id)}
                >
                  <Trash2 class="h-4 w-4" />
                  Delete
                </button>
              </div>
            {/if}
          </div>
        </div>

        {#if item.children && expanded.has(item.id)}
          {@render TreeNode(item.children, level + 1)}
        {/if}
      </li>
    {/each}
  </ul>
{/snippet}

<!-- Editable tree with context menu -->
<div class="w-full max-w-xs rounded-lg border p-3">
  <div class="flex items-center justify-between mb-3">
    <h3 class="font-semibold">Editable Tree</h3>
    <button
      class="rounded-md p-1.5 hover:bg-muted"
      onclick={() => {
        treeData.push({ id: Date.now(), name: "New Root Item" });
        treeData = [...treeData];
      }}
    >
      <Plus class="h-4 w-4" />
    </button>
  </div>
  {@render TreeNode(treeData)}
</div>
```

GeneralTree05.svelte

```
<!-- @free -->
<!-- @large -->
<!-- @description File tree with icons -->
<script>
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import FolderOpen from "@lucide/svelte/icons/folder-open";
  import Folder from "@lucide/svelte/icons/folder";
  import FileText from "@lucide/svelte/icons/file-text";
  import FileCode from "@lucide/svelte/icons/file-code";
  import FileImage from "@lucide/svelte/icons/file-image";
  import FileJson from "@lucide/svelte/icons/file-json";

  const treeData = [
    {
      id: 1,
      name: "project",
      type: "folder",
      children: [
        {
          id: 2,
          name: "src",
          type: "folder",
          children: [
            { id: 3, name: "App.svelte", type: "svelte" },
            { id: 4, name: "main.js", type: "js" },
            { id: 5, name: "styles.css", type: "css" }
          ]
        },
        {
          id: 6,
          name: "public",
          type: "folder",
          children: [
            { id: 7, name: "index.html", type: "html" },
            { id: 8, name: "logo.avif", type: "image" }
          ]
        },
        { id: 9, name: "package.json", type: "json" },
        { id: 10, name: "README.md", type: "md" }
      ]
    }
  ];

  let expanded = $state(new Set([1, 2, 6]));
  let selected = $state(null);

  function toggle(id) {
    if (expanded.has(id)) {
      expanded.delete(id);
    } else {
      expanded.add(id);
    }
    expanded = new Set(expanded);
  }

  function getFileIcon(type) {
    switch (type) {
      case 'js':
      case 'ts':
      case 'svelte':
      case 'html':
      case 'css':
        return FileCode;
      case 'json':
        return FileJson;
      case 'image':
      case 'png':
      case 'jpg':
      case 'svg':
        return FileImage;
      case 'md':
      case 'txt':
        return FileText;
      default:
        return FileText;
    }
  }

  function getFileColor(type) {
    switch (type) {
      case 'js': return 'text-yellow-500';
      case 'ts': return 'text-blue-500';
      case 'svelte': return 'text-orange-500';
      case 'html': return 'text-orange-600';
      case 'css': return 'text-blue-400';
      case 'json': return 'text-yellow-600';
      case 'image':
      case 'png':
      case 'jpg': return 'text-primary';
      case 'md': return 'text-gray-500';
      default: return 'text-muted-foreground';
    }
  }
</script>

{#snippet TreeNode(items, level = 0)}
  <ul class="space-y-0.5">
    {#each items as item}
      <li style="margin-left: {level * 16}px">
        <button
          class="flex items-center gap-1.5 w-full rounded-md px-2 py-1 text-sm hover:bg-muted text-left
            {selected === item.id ? 'bg-primary/10 text-primary' : ''}"
          onclick={() => {
            selected = item.id;
            if (item.type === 'folder') toggle(item.id);
          }}
        >
          {#if item.type === 'folder'}
            {#if expanded.has(item.id)}
              <ChevronDown class="h-4 w-4 text-muted-foreground shrink-0" />
              <FolderOpen class="h-4 w-4 text-yellow-500 shrink-0" />
            {:else}
              <ChevronRight class="h-4 w-4 text-muted-foreground shrink-0" />
              <Folder class="h-4 w-4 text-yellow-500 shrink-0" />
            {/if}
          {:else}
            <span class="w-4"></span>
            <svelte:component this={getFileIcon(item.type)} class="h-4 w-4 shrink-0 {getFileColor(item.type)}" />
          {/if}
          <span>{item.name}</span>
        </button>

        {#if item.children && expanded.has(item.id)}
          {@render TreeNode(item.children, level + 1)}
        {/if}
      </li>
    {/each}
  </ul>
{/snippet}

<!-- File tree with icons -->
<div class="w-full max-w-xs rounded-lg border p-3 bg-background">
  <div class="flex items-center gap-2 mb-3 px-2">
    <span class="font-semibold text-sm">Explorer</span>
  </div>
  {@render TreeNode(treeData)}
</div>
```

GeneralTree06.svelte

```
<!-- @free -->
<!-- @large -->
<!-- @description Drag and drop tree -->
<script>
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import GripVertical from "@lucide/svelte/icons/grip-vertical";

  let treeData = $state([
    {
      id: 1,
      name: "Category A",
      children: [
        { id: 2, name: "Item A.1" },
        { id: 3, name: "Item A.2" },
        { id: 4, name: "Item A.3" }
      ]
    },
    {
      id: 5,
      name: "Category B",
      children: [
        { id: 6, name: "Item B.1" },
        { id: 7, name: "Item B.2" }
      ]
    },
    {
      id: 8,
      name: "Category C",
      children: []
    }
  ]);

  let expanded = $state(new Set([1, 5]));
  let draggedItem = $state(null);
  let dragOverItem = $state(null);

  function toggle(id) {
    if (expanded.has(id)) {
      expanded.delete(id);
    } else {
      expanded.add(id);
    }
    expanded = new Set(expanded);
  }

  function handleDragStart(e, item) {
    draggedItem = item;
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e, item) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    dragOverItem = item.id;
  }

  function handleDragLeave() {
    dragOverItem = null;
  }

  function handleDrop(e, targetItem) {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetItem.id) return;

    // Find and remove dragged item from original location
    function removeItem(items, id) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === id) {
          items.splice(i, 1);
          return true;
        }
        if (items[i].children && removeItem(items[i].children, id)) {
          return true;
        }
      }
      return false;
    }

    // Add item as child of target
    const itemToMove = { ...draggedItem };
    removeItem(treeData, draggedItem.id);

    if (!targetItem.children) targetItem.children = [];
    targetItem.children.push(itemToMove);
    expanded.add(targetItem.id);

    treeData = [...treeData];
    draggedItem = null;
    dragOverItem = null;
  }

  function handleDragEnd() {
    draggedItem = null;
    dragOverItem = null;
  }
</script>

{#snippet TreeNode(items, level = 0)}
  <ul class="space-y-1">
    {#each items as item}
      <li style="margin-left: {level * 20}px">
        <div
          class="flex items-center gap-1 rounded-md px-2 py-1.5 transition-colors
            {dragOverItem === item.id ? 'bg-primary/20 ring-2 ring-primary' : 'hover:bg-muted'}
            {draggedItem?.id === item.id ? 'opacity-50' : ''}"
          draggable="true"
          ondragstart={(e) => handleDragStart(e, item)}
          ondragover={(e) => handleDragOver(e, item)}
          ondragleave={handleDragLeave}
          ondrop={(e) => handleDrop(e, item)}
          ondragend={handleDragEnd}
        >
          <GripVertical class="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />

          {#if item.children && item.children.length > 0}
            <button class="p-0.5 hover:bg-background rounded" onclick={() => toggle(item.id)}>
              {#if expanded.has(item.id)}
                <ChevronDown class="h-4 w-4 text-muted-foreground" />
              {:else}
                <ChevronRight class="h-4 w-4 text-muted-foreground" />
              {/if}
            </button>
          {:else}
            <span class="w-5"></span>
          {/if}

          <span class="text-sm flex-1">{item.name}</span>

          {#if item.children}
            <span class="text-xs text-muted-foreground">({item.children.length})</span>
          {/if}
        </div>

        {#if item.children && expanded.has(item.id)}
          {@render TreeNode(item.children, level + 1)}
        {/if}
      </li>
    {/each}
  </ul>
{/snippet}

<!-- Drag and drop tree -->
<div class="w-full max-w-xs rounded-lg border p-3">
  <h3 class="font-semibold mb-3">Drag to Reorder</h3>
  {@render TreeNode(treeData)}
  <p class="mt-3 text-xs text-muted-foreground">Drag items to move them under different parents</p>
</div>
```

GeneralTree08.svelte

```
<!-- @free -->
<!-- @medium -->
<!-- @description Lazy loading tree -->
<script>
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import Loader2 from "@lucide/svelte/icons/loader-2";

  let treeData = $state([
    { id: 1, name: "Node 1", hasChildren: true, children: null, loading: false },
    { id: 2, name: "Node 2", hasChildren: true, children: null, loading: false },
    { id: 3, name: "Node 3", hasChildren: false }
  ]);

  let expanded = $state(new Set());

  // Simulate async loading of children
  async function loadChildren(item) {
    item.loading = true;
    treeData = [...treeData];

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate mock children
    item.children = [
      { id: item.id * 10 + 1, name: `${item.name}.1`, hasChildren: Math.random() > 0.5 },
      { id: item.id * 10 + 2, name: `${item.name}.2`, hasChildren: Math.random() > 0.5 },
      { id: item.id * 10 + 3, name: `${item.name}.3`, hasChildren: false }
    ];

    item.loading = false;
    expanded.add(item.id);
    expanded = new Set(expanded);
    treeData = [...treeData];
  }

  async function toggle(item) {
    if (expanded.has(item.id)) {
      expanded.delete(item.id);
      expanded = new Set(expanded);
    } else {
      if (item.hasChildren && !item.children) {
        await loadChildren(item);
      } else {
        expanded.add(item.id);
        expanded = new Set(expanded);
      }
    }
  }
</script>

{#snippet TreeNode(items, level = 0)}
  <ul class="space-y-1">
    {#each items as item}
      <li style="margin-left: {level * 20}px">
        <button
          class="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm hover:bg-muted text-left"
          onclick={() => toggle(item)}
        >
          {#if item.hasChildren}
            {#if item.loading}
              <Loader2 class="h-4 w-4 text-muted-foreground animate-spin" />
            {:else if expanded.has(item.id)}
              <ChevronDown class="h-4 w-4 text-muted-foreground" />
            {:else}
              <ChevronRight class="h-4 w-4 text-muted-foreground" />
            {/if}
          {:else}
            <span class="w-4"></span>
          {/if}
          <span>{item.name}</span>
          {#if item.hasChildren && !item.children}
            <span class="text-xs text-muted-foreground">(click to load)</span>
          {/if}
        </button>

        {#if item.children && expanded.has(item.id)}
          {@render TreeNode(item.children, level + 1)}
        {/if}
      </li>
    {/each}
  </ul>
{/snippet}

<!-- Lazy loading tree -->
<div class="w-full max-w-xs rounded-lg border p-3">
  <h3 class="font-semibold mb-3">Lazy Loading Tree</h3>
  {@render TreeNode(treeData)}
  <p class="mt-3 text-xs text-muted-foreground">
    Children are loaded on demand when expanding nodes
  </p>
</div>
```

GeneralTree09.svelte

```
<!-- @free -->
<!-- @large -->
<!-- @description Discord-style channel list -->
<script>
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import Hash from "@lucide/svelte/icons/hash";
  import MessageCircle from "@lucide/svelte/icons/message-circle";
  import Volume2 from "@lucide/svelte/icons/volume-2";
  import Settings from "@lucide/svelte/icons/settings";
  import Plus from "@lucide/svelte/icons/plus";

  // Discord-style channel tree
  const serverData = [
    {
      id: 1,
      name: "INFORMATION",
      type: "category",
      channels: [
        { id: 2, name: "welcome", type: "text" },
        { id: 3, name: "rules", type: "text" },
        { id: 4, name: "announcements", type: "text" }
      ]
    },
    {
      id: 5,
      name: "GENERAL",
      type: "category",
      channels: [
        { id: 6, name: "general", type: "text", unread: 3 },
        { id: 7, name: "off-topic", type: "text", unread: 0 },
        { id: 8, name: "General Voice", type: "voice", users: 4 }
      ]
    },
    {
      id: 9,
      name: "DEVELOPMENT",
      type: "category",
      channels: [
        { id: 10, name: "frontend", type: "text", unread: 12 },
        { id: 11, name: "backend", type: "text" },
        { id: 12, name: "Dev Room", type: "voice", users: 2 }
      ]
    }
  ];

  let expanded = $state(new Set([1, 5, 9]));
  let selected = $state(6);

  function toggle(id) {
    if (expanded.has(id)) {
      expanded.delete(id);
    } else {
      expanded.add(id);
    }
    expanded = new Set(expanded);
  }
</script>

<!-- Discord-style channel list -->
<div class="w-64 rounded-lg border bg-muted/30">
  <div class="p-3 border-b flex items-center justify-between">
    <h3 class="font-semibold">My Server</h3>
    <button class="rounded-md p-1 hover:bg-muted">
      <Settings class="h-4 w-4" />
    </button>
  </div>

  <div class="p-2 space-y-1">
    {#each serverData as category}
      <div>
        <!-- Category header -->
        <button
          class="flex items-center w-full px-1 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground"
          onclick={() => toggle(category.id)}
        >
          {#if expanded.has(category.id)}
            <ChevronDown class="h-3 w-3 mr-1" />
          {:else}
            <ChevronRight class="h-3 w-3 mr-1" />
          {/if}
          {category.name}
        </button>

        <!-- Channels -->
        {#if expanded.has(category.id)}
          <div class="space-y-0.5 mt-1">
            {#each category.channels as channel}
              <button
                class="flex items-center gap-1.5 w-full rounded-md px-2 py-1 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50
                  {selected === channel.id ? 'bg-muted text-foreground' : ''}"
                onclick={() => selected = channel.id}
              >
                {#if channel.type === 'voice'}
                  <Volume2 class="h-4 w-4 shrink-0" />
                {:else}
                  <Hash class="h-4 w-4 shrink-0" />
                {/if}
                <span class="flex-1 text-left truncate">{channel.name}</span>
                {#if channel.unread}
                  <span class="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {channel.unread}
                  </span>
                {/if}
                {#if channel.users}
                  <span class="text-xs text-muted-foreground">{channel.users}</span>
                {/if}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <!-- Add channel button -->
  <div class="p-2 border-t">
    <button class="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted">
      <Plus class="h-4 w-4" />
      Create Channel
    </button>
  </div>
</div>
```

GeneralTree10.svelte

```
<!-- @free -->
<!-- @large -->
<!-- @description Tag tree with colors -->
<script>
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import Tag from "@lucide/svelte/icons/tag";

  // Tag/label tree with colors
  const tagData = [
    {
      id: 1,
      name: "Work",
      color: "#3b82f6",
      children: [
        { id: 2, name: "Projects", color: "#3b82f6" },
        { id: 3, name: "Meetings", color: "#3b82f6" },
        { id: 4, name: "Deadlines", color: "#ef4444" }
      ]
    },
    {
      id: 5,
      name: "Personal",
      color: "#22c55e",
      children: [
        { id: 6, name: "Health", color: "#22c55e" },
        { id: 7, name: "Finance", color: "#eab308" },
        { id: 8, name: "Hobbies", color: "hsl(var(--primary))" }
      ]
    },
    {
      id: 9,
      name: "Priority",
      color: "#ef4444",
      children: [
        { id: 10, name: "Urgent", color: "#ef4444" },
        { id: 11, name: "Important", color: "#f97316" },
        { id: 12, name: "Low", color: "#6b7280" }
      ]
    }
  ];

  let expanded = $state(new Set([1, 5, 9]));
  let selected = $state(new Set([2, 6]));

  function toggle(id) {
    if (expanded.has(id)) {
      expanded.delete(id);
    } else {
      expanded.add(id);
    }
    expanded = new Set(expanded);
  }

  function toggleSelect(id) {
    if (selected.has(id)) {
      selected.delete(id);
    } else {
      selected.add(id);
    }
    selected = new Set(selected);
  }
</script>

{#snippet TreeNode(items, level = 0)}
  <ul class="space-y-1">
    {#each items as item}
      <li style="margin-left: {level * 16}px">
        <div class="flex items-center gap-2">
          {#if item.children && item.children.length > 0}
            <button
              class="p-0.5 hover:bg-muted rounded shrink-0"
              onclick={() => toggle(item.id)}
            >
              {#if expanded.has(item.id)}
                <ChevronDown class="h-4 w-4 text-muted-foreground" />
              {:else}
                <ChevronRight class="h-4 w-4 text-muted-foreground" />
              {/if}
            </button>
          {:else}
            <span class="w-5"></span>
          {/if}

          <button
            class="flex items-center gap-2 flex-1 rounded-md px-2 py-1.5 text-sm hover:bg-muted text-left
              {selected.has(item.id) ? 'bg-muted' : ''}"
            onclick={() => toggleSelect(item.id)}
          >
            <span
              class="flex h-5 w-5 items-center justify-center rounded"
              style="background-color: {item.color}20"
            >
              <Tag class="h-3 w-3" style="color: {item.color}" />
            </span>
            <span class="flex-1">{item.name}</span>
            {#if selected.has(item.id)}
              <span
                class="h-2 w-2 rounded-full"
                style="background-color: {item.color}"
              ></span>
            {/if}
          </button>
        </div>

        {#if item.children && expanded.has(item.id)}
          {@render TreeNode(item.children, level + 1)}
        {/if}
      </li>
    {/each}
  </ul>
{/snippet}

<!-- Tag tree with colors -->
<div class="w-full max-w-xs rounded-lg border p-3">
  <div class="flex items-center justify-between mb-3">
    <h3 class="font-semibold">Tags</h3>
    <span class="text-xs text-muted-foreground">{selected.size} selected</span>
  </div>
  {@render TreeNode(tagData)}
</div>
```

GeneralTree11.svelte

```
<!-- @free -->
<!-- @large -->
<!-- @description Hierarchical tree view. -->
<script>
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import MapPin from "@lucide/svelte/icons/map-pin";
  import Building2 from "@lucide/svelte/icons/building-2";
  import Globe from "@lucide/svelte/icons/globe";

  // Location/geography tree
  const locationData = [
    {
      id: 1,
      name: "North America",
      type: "continent",
      children: [
        {
          id: 2,
          name: "United States",
          type: "country",
          children: [
            { id: 3, name: "New York", type: "city", population: "8.3M" },
            { id: 4, name: "Los Angeles", type: "city", population: "3.9M" },
            { id: 5, name: "Chicago", type: "city", population: "2.7M" }
          ]
        },
        {
          id: 6,
          name: "Canada",
          type: "country",
          children: [
            { id: 7, name: "Toronto", type: "city", population: "2.9M" },
            { id: 8, name: "Vancouver", type: "city", population: "675K" }
          ]
        }
      ]
    },
    {
      id: 9,
      name: "Europe",
      type: "continent",
      children: [
        {
          id: 10,
          name: "United Kingdom",
          type: "country",
          children: [
            { id: 11, name: "London", type: "city", population: "8.8M" },
            { id: 12, name: "Manchester", type: "city", population: "550K" }
          ]
        },
        {
          id: 13,
          name: "Germany",
          type: "country",
          children: [
            { id: 14, name: "Berlin", type: "city", population: "3.6M" },
            { id: 15, name: "Munich", type: "city", population: "1.5M" }
          ]
        }
      ]
    }
  ];

  let expanded = $state(new Set([1, 2, 9, 10]));
  let selected = $state(null);

  function toggle(id) {
    if (expanded.has(id)) {
      expanded.delete(id);
    } else {
      expanded.add(id);
    }
    expanded = new Set(expanded);
  }

  function getIcon(type) {
    switch (type) {
      case 'continent': return Globe;
      case 'country': return Building2;
      case 'city': return MapPin;
      default: return MapPin;
    }
  }
</script>

{#snippet TreeNode(items, level = 0)}
  <ul class="space-y-0.5">
    {#each items as item}
      <li style="margin-left: {level * 16}px">
        <button
          class="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm hover:bg-muted text-left
            {selected === item.id ? 'bg-primary/10 text-primary' : ''}"
          onclick={() => {
            selected = item.id;
            if (item.children) toggle(item.id);
          }}
        >
          {#if item.children && item.children.length > 0}
            {#if expanded.has(item.id)}
              <ChevronDown class="h-4 w-4 text-muted-foreground shrink-0" />
            {:else}
              <ChevronRight class="h-4 w-4 text-muted-foreground shrink-0" />
            {/if}
          {:else}
            <span class="w-4"></span>
          {/if}

          <svelte:component
            this={getIcon(item.type)}
            class="h-4 w-4 shrink-0 {item.type === 'continent' ? 'text-blue-500' : item.type === 'country' ? 'text-green-500' : 'text-orange-500'}"
          />

          <span class="flex-1">{item.name}</span>

          {#if item.population}
            <span class="text-xs text-muted-foreground">{item.population}</span>
          {/if}
        </button>

        {#if item.children && expanded.has(item.id)}
          {@render TreeNode(item.children, level + 1)}
        {/if}
      </li>
    {/each}
  </ul>
{/snippet}

<!-- Location tree -->
<div class="w-full max-w-xs rounded-lg border p-3">
  <h3 class="font-semibold mb-3 flex items-center gap-2">
    <Globe class="h-5 w-5" />
    Locations
  </h3>
  {@render TreeNode(locationData)}
</div>
```

GeneralTree12.svelte

```
<!-- @free -->
<!-- @large -->
<!-- @description E-commerce category tree -->
<script>
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import ShoppingCart from "@lucide/svelte/icons/shopping-cart";
  import Package from "@lucide/svelte/icons/package";

  // E-commerce category tree with product counts
  const categoryData = [
    {
      id: 1,
      name: "Electronics",
      count: 1250,
      children: [
        {
          id: 2,
          name: "Computers",
          count: 450,
          children: [
            { id: 3, name: "Laptops", count: 180 },
            { id: 4, name: "Desktops", count: 120 },
            { id: 5, name: "Tablets", count: 150 }
          ]
        },
        {
          id: 6,
          name: "Phones",
          count: 380,
          children: [
            { id: 7, name: "Smartphones", count: 320 },
            { id: 8, name: "Accessories", count: 60 }
          ]
        },
        { id: 9, name: "Audio", count: 420 }
      ]
    },
    {
      id: 10,
      name: "Clothing",
      count: 2100,
      children: [
        {
          id: 11,
          name: "Men",
          count: 850,
          children: [
            { id: 12, name: "Shirts", count: 280 },
            { id: 13, name: "Pants", count: 220 },
            { id: 14, name: "Shoes", count: 350 }
          ]
        },
        {
          id: 15,
          name: "Women",
          count: 1250,
          children: [
            { id: 16, name: "Dresses", count: 450 },
            { id: 17, name: "Tops", count: 380 },
            { id: 18, name: "Shoes", count: 420 }
          ]
        }
      ]
    },
    {
      id: 19,
      name: "Home & Garden",
      count: 890,
      children: [
        { id: 20, name: "Furniture", count: 340 },
        { id: 21, name: "Decor", count: 280 },
        { id: 22, name: "Kitchen", count: 270 }
      ]
    }
  ];

  let expanded = $state(new Set([1, 2, 10, 11]));
  let selected = $state(null);

  function toggle(id) {
    if (expanded.has(id)) {
      expanded.delete(id);
    } else {
      expanded.add(id);
    }
    expanded = new Set(expanded);
  }

  function expandAll() {
    function getAllIds(items) {
      let ids = [];
      for (const item of items) {
        if (item.children) {
          ids.push(item.id);
          ids = [...ids, ...getAllIds(item.children)];
        }
      }
      return ids;
    }
    expanded = new Set(getAllIds(categoryData));
  }

  function collapseAll() {
    expanded = new Set();
  }
</script>

{#snippet TreeNode(items, level = 0)}
  <ul class="space-y-0.5">
    {#each items as item}
      <li style="margin-left: {level * 16}px">
        <button
          class="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm hover:bg-muted text-left group
            {selected === item.id ? 'bg-primary/10 text-primary' : ''}"
          onclick={() => {
            selected = item.id;
            if (item.children) toggle(item.id);
          }}
        >
          {#if item.children && item.children.length > 0}
            {#if expanded.has(item.id)}
              <ChevronDown class="h-4 w-4 text-muted-foreground shrink-0" />
            {:else}
              <ChevronRight class="h-4 w-4 text-muted-foreground shrink-0" />
            {/if}
          {:else}
            <span class="w-4"></span>
          {/if}

          <Package class="h-4 w-4 text-muted-foreground shrink-0" />

          <span class="flex-1 truncate">{item.name}</span>

          <span class="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground group-hover:bg-background">
            {item.count.toLocaleString()}
          </span>
        </button>

        {#if item.children && expanded.has(item.id)}
          {@render TreeNode(item.children, level + 1)}
        {/if}
      </li>
    {/each}
  </ul>
{/snippet}

<!-- E-commerce category tree -->
<div class="w-full max-w-xs rounded-lg border p-3">
  <div class="flex items-center justify-between mb-3">
    <h3 class="font-semibold flex items-center gap-2">
      <ShoppingCart class="h-5 w-5" />
      Categories
    </h3>
    <div class="flex gap-1">
      <button
        class="text-xs text-muted-foreground hover:text-foreground"
        onclick={expandAll}
      >
        Expand
      </button>
      <span class="text-muted-foreground">|</span>
      <button
        class="text-xs text-muted-foreground hover:text-foreground"
        onclick={collapseAll}
      >
        Collapse
      </button>
    </div>
  </div>
  {@render TreeNode(categoryData)}
</div>
```

GeneralTree13.svelte

```
<!-- @free -->
<!-- @large -->
<!-- @description Documentation tree -->
<script>
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import BookOpen from "@lucide/svelte/icons/book-open";
  import FileText from "@lucide/svelte/icons/file-text";
  import Link from "@lucide/svelte/icons/link";

  // Documentation/wiki tree with links
  const docsData = [
    {
      id: 1,
      name: "Getting Started",
      type: "section",
      children: [
        { id: 2, name: "Introduction", type: "page", href: "#intro" },
        { id: 3, name: "Installation", type: "page", href: "#install" },
        { id: 4, name: "Quick Start", type: "page", href: "#quick-start" }
      ]
    },
    {
      id: 5,
      name: "Core Concepts",
      type: "section",
      children: [
        { id: 6, name: "Components", type: "page", href: "#components" },
        { id: 7, name: "State Management", type: "page", href: "#state" },
        { id: 8, name: "Routing", type: "page", href: "#routing" },
        { id: 9, name: "Styling", type: "page", href: "#styling" }
      ]
    },
    {
      id: 10,
      name: "API Reference",
      type: "section",
      children: [
        {
          id: 11,
          name: "Components",
          type: "section",
          children: [
            { id: 12, name: "Button", type: "page", href: "#button" },
            { id: 13, name: "Input", type: "page", href: "#input" },
            { id: 14, name: "Modal", type: "page", href: "#modal" }
          ]
        },
        {
          id: 15,
          name: "Hooks",
          type: "section",
          children: [
            { id: 16, name: "useState", type: "page", href: "#usestate" },
            { id: 17, name: "useEffect", type: "page", href: "#useeffect" }
          ]
        }
      ]
    },
    {
      id: 18,
      name: "External Links",
      type: "section",
      children: [
        { id: 19, name: "GitHub", type: "external", href: "https://github.com" },
        { id: 20, name: "Discord", type: "external", href: "https://discord.com" }
      ]
    }
  ];

  let expanded = $state(new Set([1, 5, 10, 11]));
  let currentPage = $state(2);

  function toggle(id) {
    if (expanded.has(id)) {
      expanded.delete(id);
    } else {
      expanded.add(id);
    }
    expanded = new Set(expanded);
  }
</script>

{#snippet TreeNode(items, level = 0)}
  <ul class="space-y-0.5">
    {#each items as item}
      <li style="margin-left: {level * 12}px">
        {#if item.type === 'section'}
          <button
            class="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm font-medium hover:bg-muted text-left"
            onclick={() => toggle(item.id)}
          >
            {#if expanded.has(item.id)}
              <ChevronDown class="h-4 w-4 text-muted-foreground shrink-0" />
            {:else}
              <ChevronRight class="h-4 w-4 text-muted-foreground shrink-0" />
            {/if}
            <span>{item.name}</span>
          </button>
        {:else}
          <a
            href={item.href}
            class="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm hover:bg-muted
              {currentPage === item.id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground'}"
            onclick={() => currentPage = item.id}
          >
            <span class="w-4"></span>
            {#if item.type === 'external'}
              <Link class="h-3.5 w-3.5 shrink-0" />
            {:else}
              <FileText class="h-3.5 w-3.5 shrink-0" />
            {/if}
            <span class="flex-1">{item.name}</span>
            {#if item.type === 'external'}
              <span class="text-xs">↗</span>
            {/if}
          </a>
        {/if}

        {#if item.children && expanded.has(item.id)}
          {@render TreeNode(item.children, level + 1)}
        {/if}
      </li>
    {/each}
  </ul>
{/snippet}

<!-- Documentation tree -->
<div class="w-full max-w-xs rounded-lg border bg-background">
  <div class="p-3 border-b">
    <h3 class="font-semibold flex items-center gap-2">
      <BookOpen class="h-5 w-5" />
      Documentation
    </h3>
  </div>
  <div class="p-2">
    {@render TreeNode(docsData)}
  </div>
</div>
```

GeneralTree14.svelte

```
<!-- @free -->
<!-- @large -->
<!-- @description Radio selection tree -->
<script>
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import Circle from "@lucide/svelte/icons/circle";
  import CircleDot from "@lucide/svelte/icons/circle-dot";

  // Radio selection tree (single selection)
  const optionsData = [
    {
      id: 1,
      name: "Notification Preferences",
      children: [
        {
          id: 2,
          name: "Email Frequency",
          children: [
            { id: 3, name: "Immediately" },
            { id: 4, name: "Daily Digest" },
            { id: 5, name: "Weekly Summary" },
            { id: 6, name: "Never" }
          ]
        },
        {
          id: 7,
          name: "Push Notifications",
          children: [
            { id: 8, name: "All notifications" },
            { id: 9, name: "Important only" },
            { id: 10, name: "None" }
          ]
        }
      ]
    },
    {
      id: 11,
      name: "Privacy Settings",
      children: [
        {
          id: 12,
          name: "Profile Visibility",
          children: [
            { id: 13, name: "Public" },
            { id: 14, name: "Friends only" },
            { id: 15, name: "Private" }
          ]
        },
        {
          id: 16,
          name: "Search Indexing",
          children: [
            { id: 17, name: "Allow search engines" },
            { id: 18, name: "Block search engines" }
          ]
        }
      ]
    }
  ];

  let expanded = $state(new Set([1, 2, 7, 11, 12, 16]));
  let selections = $state({
    emailFrequency: 4,
    pushNotifications: 9,
    profileVisibility: 14,
    searchIndexing: 17
  });

  // Map of parent IDs to their selection key
  const selectionGroups = {
    2: 'emailFrequency',
    7: 'pushNotifications',
    12: 'profileVisibility',
    16: 'searchIndexing'
  };

  function toggle(id) {
    if (expanded.has(id)) {
      expanded.delete(id);
    } else {
      expanded.add(id);
    }
    expanded = new Set(expanded);
  }

  function select(itemId, parentId) {
    const groupKey = selectionGroups[parentId];
    if (groupKey) {
      selections[groupKey] = itemId;
      selections = { ...selections };
    }
  }

  function isSelected(itemId) {
    return Object.values(selections).includes(itemId);
  }
</script>

{#snippet TreeNode(items, level = 0, parentId = null)}
  <ul class="space-y-0.5">
    {#each items as item}
      <li style="margin-left: {level * 16}px">
        {#if item.children}
          <button
            class="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm font-medium hover:bg-muted text-left"
            onclick={() => toggle(item.id)}
          >
            {#if expanded.has(item.id)}
              <ChevronDown class="h-4 w-4 text-muted-foreground shrink-0" />
            {:else}
              <ChevronRight class="h-4 w-4 text-muted-foreground shrink-0" />
            {/if}
            <span>{item.name}</span>
          </button>

          {#if expanded.has(item.id)}
            {@render TreeNode(item.children, level + 1, item.id)}
          {/if}
        {:else}
          <button
            class="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm hover:bg-muted text-left
              {isSelected(item.id) ? 'text-primary' : 'text-muted-foreground'}"
            onclick={() => select(item.id, parentId)}
          >
            <span class="w-4"></span>
            {#if isSelected(item.id)}
              <CircleDot class="h-4 w-4 text-primary shrink-0" />
            {:else}
              <Circle class="h-4 w-4 shrink-0" />
            {/if}
            <span>{item.name}</span>
          </button>
        {/if}
      </li>
    {/each}
  </ul>
{/snippet}

<!-- Radio selection tree -->
<div class="w-full max-w-xs rounded-lg border p-3">
  <h3 class="font-semibold mb-3">Settings</h3>
  {@render TreeNode(optionsData)}
  <div class="mt-4 pt-3 border-t">
    <button class="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
      Save Preferences
    </button>
  </div>
</div>
```

GeneralTree15.svelte

```
<!-- @free -->
<!-- @large -->
<!-- @description Email folder tree -->
<script>
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import MoreHorizontal from "@lucide/svelte/icons/more-horizontal";
  import Star from "@lucide/svelte/icons/star";
  import Clock from "@lucide/svelte/icons/clock";
  import Archive from "@lucide/svelte/icons/archive";
  import Inbox from "@lucide/svelte/icons/inbox";
  import Send from "@lucide/svelte/icons/send";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import AlertCircle from "@lucide/svelte/icons/alert-circle";

  // Email folder tree with badges
  const folderData = [
    {
      id: 1,
      name: "Inbox",
      icon: Inbox,
      count: 12,
      unread: true,
      children: [
        { id: 2, name: "Primary", count: 8, unread: true },
        { id: 3, name: "Social", count: 3 },
        { id: 4, name: "Promotions", count: 1 }
      ]
    },
    { id: 5, name: "Starred", icon: Star, count: 5 },
    { id: 6, name: "Snoozed", icon: Clock, count: 2 },
    { id: 7, name: "Sent", icon: Send, count: 0 },
    {
      id: 8,
      name: "Drafts",
      icon: AlertCircle,
      count: 3,
      children: [
        { id: 9, name: "Work", count: 2 },
        { id: 10, name: "Personal", count: 1 }
      ]
    },
    { id: 11, name: "Archive", icon: Archive, count: 0 },
    { id: 12, name: "Trash", icon: Trash2, count: 0 }
  ];

  let expanded = $state(new Set([1]));
  let selected = $state(1);
  let hoveredItem = $state(null);

  function toggle(id, e) {
    e.stopPropagation();
    if (expanded.has(id)) {
      expanded.delete(id);
    } else {
      expanded.add(id);
    }
    expanded = new Set(expanded);
  }
</script>

{#snippet TreeNode(items, level = 0)}
  <ul class="space-y-0.5">
    {#each items as item}
      <li style="margin-left: {level * 12}px">
        <button
          class="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm hover:bg-muted text-left group relative
            {selected === item.id ? 'bg-primary/10 text-primary font-medium' : ''}"
          onclick={() => selected = item.id}
          onmouseenter={() => hoveredItem = item.id}
          onmouseleave={() => hoveredItem = null}
        >
          {#if item.children && item.children.length > 0}
            <button
              class="p-0.5 hover:bg-background rounded shrink-0"
              onclick={(e) => toggle(item.id, e)}
            >
              {#if expanded.has(item.id)}
                <ChevronDown class="h-3 w-3 text-muted-foreground" />
              {:else}
                <ChevronRight class="h-3 w-3 text-muted-foreground" />
              {/if}
            </button>
          {:else if level === 0}
            <span class="w-4"></span>
          {:else}
            <span class="w-4"></span>
          {/if}

          {#if item.icon}
            <svelte:component this={item.icon} class="h-4 w-4 shrink-0 {selected === item.id ? 'text-primary' : 'text-muted-foreground'}" />
          {/if}

          <span class="flex-1 truncate {item.unread ? 'font-semibold' : ''}">{item.name}</span>

          {#if item.count > 0}
            <span class="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground min-w-[1.25rem] text-center
              {item.unread ? 'bg-primary/10 text-primary font-medium' : ''}">
              {item.count}
            </span>
          {/if}

          {#if hoveredItem === item.id}
            <button
              class="absolute right-1 p-1 rounded hover:bg-background"
              onclick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal class="h-3 w-3 text-muted-foreground" />
            </button>
          {/if}
        </button>

        {#if item.children && expanded.has(item.id)}
          {@render TreeNode(item.children, level + 1)}
        {/if}
      </li>
    {/each}
  </ul>
{/snippet}

<!-- Email folder tree -->
<div class="w-full max-w-xs rounded-lg border bg-background">
  <div class="p-3 border-b flex items-center justify-between">
    <h3 class="font-semibold text-sm">Folders</h3>
    <button class="text-xs text-primary hover:underline">
      New folder
    </button>
  </div>
  <div class="p-2">
    {@render TreeNode(folderData)}
  </div>
  <div class="p-3 border-t text-xs text-muted-foreground">
    15 GB of 30 GB used
    <div class="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
      <div class="h-full w-1/2 bg-primary rounded-full"></div>
    </div>
  </div>
</div>
```
