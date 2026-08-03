<script lang="ts">
	import {
		Message,
		MessageAvatar,
		MessageContent,
		MessageFooter,
		MessageHeader,
		MessageTyping
	} from '$lib/components/agents/message/index.js';
</script>

<div class="fixture-preview">
	<Message from="assistant" animateIn>
		<MessageAvatar>AI</MessageAvatar>
		<MessageHeader><strong>Atlas</strong><span>just now</span></MessageHeader>
		<MessageContent
			>Your deployment checklist is complete. I found no blocking issues.</MessageContent
		>
		<MessageFooter
			><button type="button">Copy</button><button type="button">Helpful</button
			></MessageFooter
		>
	</Message>
	<Message from="assistant"
		><MessageAvatar placeholder /><MessageContent
			><MessageTyping label="Atlas is responding" /></MessageContent
		></Message
	>
</div>
