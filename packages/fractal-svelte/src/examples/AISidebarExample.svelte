<script lang="ts">
	import { AiSidebar } from '$lib/index.js';
	let activeId = $state<string | null>('brief');
	const items = [
		{
			id: 'project',
			label: 'Onboarding project',
			kind: 'project' as const,
			children: [
				{ id: 'brief', label: 'Brief.md', kind: 'file' as const },
				{
					id: 'research',
					label: 'Research',
					kind: 'folder' as const,
					children: [{ id: 'notes', label: 'Interview notes.md', kind: 'file' as const }]
				}
			]
		},
		{ id: 'bookmark', label: 'Pinned decision', kind: 'bookmark' as const }
	];
</script>

<div class="fixture-preview">
	<AiSidebar
		defaultItems={items}
		{activeId}
		defaultExpandedIds={['project', 'research']}
		onActiveChange={(id) => (activeId = id)}
		onRename={() => undefined}
		ariaLabel="Project resources"
	/>
	<p aria-live="polite">Selected resource: {activeId ?? 'none'}</p>
</div>
