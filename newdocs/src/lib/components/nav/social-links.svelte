<script lang="ts" module>
	import type { Component } from "svelte";

	import DiscordIcon from "@lucide/svelte/icons/message-circle";
	import MastodonIcon from "@lucide/svelte/icons/at-sign";
	import RssIcon from "@lucide/svelte/icons/rss";
	import MailIcon from "@lucide/svelte/icons/mail";
	import GlobeIcon from "@lucide/svelte/icons/globe";
	// Lucide dropped brand icons — use generic substitutes
	import GithubIcon from "@lucide/svelte/icons/folder-git-2";
	import XIcon from "@lucide/svelte/icons/x";

	const iconMap: Record<string, Component<{ class?: string }>> = {
		github: GithubIcon,
		twitter: XIcon,
		x: XIcon,
		discord: DiscordIcon,
		mastodon: MastodonIcon,
		rss: RssIcon,
		mail: MailIcon,
		email: MailIcon,
		website: GlobeIcon,
	};

	export type SocialLink = {
		platform: string;
		url: string;
		label?: string;
	};
</script>

<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";

	let { links = [] }: { links: SocialLink[] } = $props();
</script>

{#each links as link}
	{@const Icon = iconMap[link.platform.toLowerCase()]}
	{#if Icon}
		<Button
			variant="ghost"
			size="icon-sm"
			href={link.url}
			target="_blank"
			rel="noopener noreferrer"
			aria-label={link.label ?? link.platform}
		>
			<Icon class="size-4" />
		</Button>
	{/if}
{/each}
