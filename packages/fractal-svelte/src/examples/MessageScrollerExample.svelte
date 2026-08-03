<script lang="ts">
	import { Message } from '$lib/components/agents/message/index.js';
	import {
		MessageBubble,
		MessageBubbleContent
	} from '$lib/components/agents/message-bubble/index.js';
	import { MessageScroller } from '$lib/components/agents/message-scroller/index.js';
	let following = $state(true);
</script>

<div class="fixture-preview">
	<MessageScroller
		label="Agent conversation"
		busy={false}
		onFollowChange={(value) => (following = value)}
	>
		<Message from="assistant"
			><MessageBubble
				><MessageBubbleContent
					>Welcome back. What should we improve today?</MessageBubbleContent
				></MessageBubble
			></Message
		>
		<Message from="user"
			><MessageBubble variant="solid"
				><MessageBubbleContent
					>Review the onboarding flow and flag anything confusing.</MessageBubbleContent
				></MessageBubble
			></Message
		>
		<Message from="assistant"
			><MessageBubble
				><MessageBubbleContent
					>I’ll inspect the flow and report concrete recommendations here.</MessageBubbleContent
				></MessageBubble
			></Message
		>
	</MessageScroller>
	<p aria-live="polite">{following ? 'Following newest messages' : 'Paused while you browse'}</p>
</div>
