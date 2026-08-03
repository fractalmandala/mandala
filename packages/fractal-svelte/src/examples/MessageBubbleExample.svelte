<script lang="ts">
	import { Message } from '$lib/components/agents/message/index.js';
	import {
		MessageBubble,
		MessageBubbleContent,
		MessageBubbleCollapsible
	} from '$lib/components/agents/message-bubble/index.js';
</script>

<div class="fixture-preview">
	<Message from="assistant">
		<MessageBubble variant="soft" animateIn>
			<MessageBubbleContent>
				<MessageBubbleCollapsible collapsedLines={3}>
					<p>
						Here is a concise project update. The API is ready for review, and the
						remaining work is documented below.
					</p>
					<p>
						Everything is keyboard accessible and the response can be expanded when more
						context is useful.
					</p>
				</MessageBubbleCollapsible>
			</MessageBubbleContent>
		</MessageBubble>
	</Message>
	<Message from="user"
		><MessageBubble variant="solid"
			><MessageBubbleContent>Show me the implementation details.</MessageBubbleContent
			></MessageBubble
		></Message
	>
</div>
