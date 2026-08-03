<script lang="ts">
	import { moveJsonNode, type JsonSegment as Segment, type JsonValue } from '$lib/utils/json-tree';

	let { content, onChange }: { content: string; onChange: (content: string) => void } = $props();
	let expanded = $state<Record<string, boolean>>({ '$': true });

	function parsed(): JsonValue | null {
		try { return JSON.parse(content) as JsonValue; } catch { return null; }
	}

	function keyFor(path: Segment[]) { return `$${path.map((part) => typeof part === 'number' ? `[${part}]` : `[${JSON.stringify(part)}]`).join('')}`; }
	function labelFor(path: Segment[]) { return path.length ? String(path.at(-1)) : 'root'; }
	function isContainer(value: JsonValue): value is JsonValue[] | Record<string, JsonValue> { return value !== null && typeof value === 'object'; }
	function typeOf(value: JsonValue) { return Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value === 'object' ? 'object' : typeof value; }

	function cloneRoot() { return JSON.parse(content) as JsonValue; }
	function valueAt(root: JsonValue, path: Segment[]): JsonValue {
		return path.reduce<JsonValue>((current, segment) => (current as Record<string, JsonValue>)[segment], root);
	}
	function replace(path: Segment[], next: JsonValue) {
		const root = cloneRoot();
		if (!path.length) { onChange(JSON.stringify(next, null, 2)); return; }
		const parent = valueAt(root, path.slice(0, -1)) as Record<string, JsonValue>;
		parent[path.at(-1) as string] = next;
		onChange(JSON.stringify(root, null, 2));
	}
	function remove(path: Segment[]) {
		if (!path.length) return;
		const root = cloneRoot();
		const parent = valueAt(root, path.slice(0, -1));
		const segment = path.at(-1)!;
		if (Array.isArray(parent)) parent.splice(Number(segment), 1); else delete (parent as Record<string, JsonValue>)[String(segment)];
		onChange(JSON.stringify(root, null, 2));
	}
	function add(path: Segment[]) {
		const root = cloneRoot();
		const container = valueAt(root, path);
		if (Array.isArray(container)) container.push(null);
		else if (isContainer(container)) {
			const name = window.prompt('Property name');
			if (!name?.trim()) return;
			if (name in container) { window.alert(`“${name}” already exists.`); return; }
			(container as Record<string, JsonValue>)[name.trim()] = null;
		}
		onChange(JSON.stringify(root, null, 2));
		expanded[keyFor(path)] = true;
	}
	function rename(path: Segment[]) {
		if (!path.length || typeof path.at(-1) !== 'string') return;
		const root = cloneRoot();
		const parent = valueAt(root, path.slice(0, -1)) as Record<string, JsonValue>;
		const oldKey = path.at(-1) as string;
		const nextKey = window.prompt('Property name', oldKey)?.trim();
		if (!nextKey || nextKey === oldKey) return;
		if (nextKey in parent) { window.alert(`“${nextKey}” already exists.`); return; }
		const entries = Object.entries(parent);
		for (const key of Object.keys(parent)) delete parent[key];
		for (const [key, value] of entries) parent[key === oldKey ? nextKey : key] = value;
		onChange(JSON.stringify(root, null, 2));
	}
	function changeType(path: Segment[], type: string) {
		const current = valueAt(cloneRoot(), path);
		const next: JsonValue = type === 'object' ? {} : type === 'array' ? [] : type === 'string' ? String(current ?? '') : type === 'number' ? Number(current) || 0 : type === 'boolean' ? Boolean(current) : null;
		replace(path, next);
	}
	function updatePrimitive(path: Segment[], type: string, source: string) {
		if (type === 'number') { const number = Number(source); if (!Number.isFinite(number)) return; replace(path, number); }
		else if (type === 'boolean') replace(path, source === 'true');
		else replace(path, source);
	}
	function reorder(path: Segment[], direction: -1 | 1) {
		if (!path.length) return;
		onChange(moveJsonNode(content, path, direction));
	}
	async function copyPath(path: Segment[]) { await navigator.clipboard.writeText(keyFor(path)); }

	function display(value: JsonValue) { return value === null ? 'null' : String(value); }
</script>

{#if parsed() === null}
	<div class="json-tree__invalid" role="alert">This source is not valid JSON. Correct it in Source before using Tree.</div>
{:else}
	<div class="json-tree" aria-label="JSON tree editor">
		{@render node(parsed()!, [], 'root')}
	</div>
{/if}

{#snippet node(value: JsonValue, path: Segment[], label: string)}
	{@const container = isContainer(value)}
	{@const type = typeOf(value)}
	{@const nodeKey = keyFor(path)}
	<div class:json-tree__node={true} class:json-tree__node--child={path.length > 0}>
		<div class="json-tree__row">
			{#if container}
				<button class="json-tree__twist" aria-label={`${expanded[nodeKey] === false ? 'Expand' : 'Collapse'} ${label}`} onclick={() => expanded[nodeKey] = expanded[nodeKey] === false}>⌄</button>
			{:else}<span class="json-tree__twist" aria-hidden="true"></span>{/if}
			<span class="json-tree__label">{label}</span>
			<select value={type} aria-label={`Type for ${label}`} onchange={(event) => changeType(path, event.currentTarget.value)}>
				<option value="string">string</option><option value="number">number</option><option value="boolean">boolean</option><option value="null">null</option><option value="object">object</option><option value="array">array</option>
			</select>
			{#if !container && type !== 'null'}
				{#if type === 'boolean'}<select value={String(value)} aria-label={`Value for ${label}`} onchange={(event) => updatePrimitive(path, type, event.currentTarget.value)}><option>true</option><option>false</option></select>
				{:else}<input value={display(value)} aria-label={`Value for ${label}`} oninput={(event) => updatePrimitive(path, type, event.currentTarget.value)} />{/if}
			{:else if container}<span class="json-tree__summary">{Array.isArray(value) ? `${value.length} items` : `${Object.keys(value).length} properties`}</span>{/if}
			<div class="json-tree__actions">
				<button onclick={() => void copyPath(path)} aria-label={`Copy path for ${label}`}>Path</button>
				{#if typeof path.at(-1) === 'string'}<button onclick={() => rename(path)}>Rename</button>{/if}
				{#if path.length}<button onclick={() => reorder(path, -1)} aria-label={`Move ${label} up`}>↑</button><button onclick={() => reorder(path, 1)} aria-label={`Move ${label} down`}>↓</button>{/if}
				{#if path.length}<button onclick={() => remove(path)} aria-label={`Delete ${label}`}>Delete</button>{/if}
			</div>
		</div>
		{#if container && expanded[nodeKey] !== false}
			<div class="json-tree__children">
				{#each Array.isArray(value) ? value.map((child, index) => [index, child] as const) : Object.entries(value) as [string, JsonValue][] as [segment, child]}
					{@render node(child, [...path, segment], Array.isArray(value) ? `[${segment}]` : String(segment))}
				{/each}
				<button class="json-tree__add" onclick={() => add(path)}>+ {Array.isArray(value) ? 'item' : 'property'}</button>
			</div>
		{/if}
	</div>
{/snippet}
