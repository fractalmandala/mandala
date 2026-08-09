<script lang="ts">
	let {
		content,
		onChange,
	}: {
		content: string;
		onChange: (next: string) => void;
	} = $props();

	type Field = { key: string; value: string; error: string | null };

	function parseFrontmatter(source: string): { fields: Field[]; body: string; hasFence: boolean } {
		const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
		if (!match) return { fields: [], body: source, hasFence: false };
		const fields: Field[] = [];
		for (const line of (match[1] ?? '').split('\n')) {
			if (!line.trim()) continue;
			const idx = line.indexOf(':');
			if (idx === -1) {
				fields.push({ key: line.trim(), value: '', error: 'Expected key: value' });
				continue;
			}
			const key = line.slice(0, idx).trim();
			const value = line.slice(idx + 1).trim();
			fields.push({
				key,
				value,
				error: key ? null : 'Key is required',
			});
		}
		return { fields, body: match[2] ?? '', hasFence: true };
	}

	let parsed = $derived(parseFrontmatter(content));
	let draftFields = $state<Field[]>([]);
	let body = $state('');
	let enabled = $state(false);
	let syncedPath = '';

	$effect(() => {
		// Reset local draft when the outer document content identity changes.
		const next = parseFrontmatter(content);
		draftFields = next.fields.length > 0 ? next.fields : [{ key: 'title', value: '', error: null }];
		body = next.body;
		enabled = next.hasFence;
		syncedPath = content.slice(0, 40);
		void syncedPath;
	});

	function serialize(fields: Field[], nextBody: string): string {
		const yaml = fields
			.filter((field) => field.key.trim())
			.map((field) => `${field.key.trim()}: ${field.value}`)
			.join('\n');
		return `---\n${yaml}\n---\n${nextBody}`;
	}

	function updateField(index: number, patch: Partial<Field>): void {
		draftFields = draftFields.map((field, i) => {
			if (i !== index) return field;
			const next = { ...field, ...patch };
			next.error = next.key.trim() ? null : 'Key is required';
			return next;
		});
		if (enabled) onChange(serialize(draftFields, body));
	}

	function addField(): void {
		draftFields = [...draftFields, { key: '', value: '', error: 'Key is required' }];
	}

	function removeField(index: number): void {
		draftFields = draftFields.filter((_, i) => i !== index);
		if (enabled) onChange(serialize(draftFields, body));
	}

	function toggleEnabled(next: boolean): void {
		enabled = next;
		if (next) {
			onChange(serialize(draftFields, body || content));
		} else {
			onChange(body || content.replace(/^---\n[\s\S]*?\n---\n?/, ''));
		}
	}
</script>

<section class="frontmatter" aria-label="Document metadata">
	<div class="frontmatter__bar">
		<strong>Frontmatter</strong>
		<label class="switch">
			<input
				type="checkbox"
				checked={enabled}
				onchange={(event) => toggleEnabled(event.currentTarget.checked)}
			/>
			<span>Enabled</span>
		</label>
		{#if enabled}
			<button type="button" onclick={addField}>Add field</button>
		{/if}
	</div>
	{#if enabled}
		<div class="frontmatter__fields">
			{#each draftFields as field, index (index)}
				<div class="frontmatter__row" class:invalid={Boolean(field.error)}>
					<input
						type="text"
						aria-label={`Metadata key ${index + 1}`}
						value={field.key}
						oninput={(event) => updateField(index, { key: event.currentTarget.value })}
						placeholder="key"
					/>
					<input
						type="text"
						aria-label={`Metadata value ${index + 1}`}
						value={field.value}
						oninput={(event) => updateField(index, { value: event.currentTarget.value })}
						placeholder="value"
					/>
					<button type="button" aria-label={`Remove field ${field.key || index + 1}`} onclick={() => removeField(index)}>
						Remove
					</button>
					{#if field.error}
						<small role="alert">{field.error}</small>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</section>

<style lang="sass">
	@use '$lib/styles/tokens' as t

	.frontmatter
		margin-bottom: 12px
		border: 1px solid var(--ok-line)
		border-radius: t.$radius-lg
		background: var(--ok-panel)
		overflow: hidden

		&__bar
			display: flex
			align-items: center
			gap: 10px
			padding: 8px 10px
			border-bottom: 1px solid var(--ok-line)

			strong
				font-size: t.$font-size-sm

			button
				margin-left: auto
				border: 1px solid var(--ok-line)
				border-radius: t.$radius-md
				padding: 4px 8px
				background: var(--ok-surface)
				cursor: pointer

		&__fields
			display: grid
			gap: 8px
			padding: 10px

		&__row
			display: grid
			grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr) auto
			gap: 8px
			align-items: center

			&.invalid input:first-child
				border-color: var(--ok-danger)

			input
				border: 1px solid var(--ok-line)
				border-radius: t.$radius-md
				padding: 6px 8px
				background: var(--ok-surface)
				color: var(--ok-ink)

			button
				border: 1px solid var(--ok-line)
				border-radius: t.$radius-md
				padding: 6px 8px
				background: var(--ok-surface)
				cursor: pointer

			small
				grid-column: 1 / -1
				color: var(--ok-danger)
				font-size: t.$font-size-xs
				font-weight: 700

		.switch
			display: inline-flex
			align-items: center
			gap: 6px
			color: var(--ok-muted)
			font-size: t.$font-size-xs
			font-weight: 700
</style>
