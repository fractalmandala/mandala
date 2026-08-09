<script lang="ts">
	import { collabRemoteUsers, collabState } from '$lib/editor/collab';
</script>

<div class="collab-status" aria-label="Collaboration status">
	<span class="collab-status__dot" data-status={$collabState.status}></span>
	<strong>{$collabState.status}</strong>
	{#if $collabState.serverUrl}
		<small>{$collabState.serverUrl}</small>
	{:else}
		<small>offline / local Yjs</small>
	{/if}
	{#if $collabState.offlineCached}
		<small>IDB cache</small>
	{/if}
	{#if $collabState.error}
		<small role="status">{$collabState.error}</small>
	{/if}
	{#if $collabRemoteUsers.length > 0}
		<ul>
			{#each $collabRemoteUsers as user (user.clientId)}
				<li style={`--user-color: ${user.color}`}>{user.name}</li>
			{/each}
		</ul>
	{/if}
</div>

<style lang="sass">
	@use '$lib/styles/tokens' as t

	.collab-status
		display: flex
		flex-wrap: wrap
		align-items: center
		gap: 8px
		padding: 8px 10px
		border: 1px solid var(--ok-line)
		border-radius: 8px
		background: var(--ok-panel)
		color: var(--ok-muted)
		font-size: 12px

		strong
			color: var(--ok-ink)
			text-transform: capitalize

		&__dot
			width: 8px
			height: 8px
			border-radius: 999px
			background: var(--ok-muted)

			&[data-status='connected'],
			&[data-status='synced']
				background: var(--ok-success)

			&[data-status='connecting'],
			&[data-status='reconnecting']
				background: var(--ok-warn)

			&[data-status='error'],
			&[data-status='conflict']
				background: var(--ok-danger)

			&[data-status='offline']
				background: var(--ok-muted)

		ul
			display: flex
			gap: 6px
			list-style: none
			margin: 0
			padding: 0

		li
			padding: 2px 6px
			border-radius: 999px
			background: var(--user-color, var(--ok-accent))
			color: white
			font-weight: 700
</style>
