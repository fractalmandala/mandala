<script lang="ts">
	import { entries } from '$lib/state/entries.svelte';

	// Title / category / tags editor. Title is optional — when blank the backend derives
	// it from the first line, so the placeholder shows that derived value as a hint.

	// Tags are edited as a comma-separated string, re-synced whenever the active entry
	// changes (keyed on resetToken) so switching entries doesn't leave stale text.
	let tagsText = $state('');
	let lastToken = -1;
	$effect(() => {
		if (entries.resetToken !== lastToken) {
			lastToken = entries.resetToken;
			tagsText = entries.tags.join(', ');
		}
	});

	function commitTags() {
		const parsed = tagsText
			.split(',')
			.map((t) => t.trim())
			.filter(Boolean);
		entries.setTags(parsed);
	}
</script>

<div class="meta-panel">
	<label class="meta-field">
		<span class="meta-field__label">Title</span>
		<input
			class="meta-field__input"
			value={entries.title}
			oninput={(e) => entries.setTitle(e.currentTarget.value)}
			placeholder="Auto from first line"
		/>
	</label>
	<label class="meta-field">
		<span class="meta-field__label">Category</span>
		<input
			class="meta-field__input"
			value={entries.category}
			oninput={(e) => entries.setCategory(e.currentTarget.value)}
			placeholder="Optional"
		/>
	</label>
	<label class="meta-field meta-field--grow">
		<span class="meta-field__label">Tags</span>
		<input
			class="meta-field__input"
			bind:value={tagsText}
			oninput={commitTags}
			placeholder="comma, separated"
		/>
	</label>
</div>
