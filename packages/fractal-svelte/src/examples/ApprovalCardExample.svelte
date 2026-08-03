<script lang="ts">
	import { ApprovalCard } from '$lib/index.js';
	let status = $state<'pending' | 'approved' | 'rejected'>('pending');
</script>

<div class="fixture-preview">
	<ApprovalCard
		title="Publish onboarding copy?"
		description="This change updates the public welcome flow."
		{status}
		onApprove={() => (status = 'approved')}
		onReject={() => (status = 'rejected')}
		onRequestChanges={() => (status = 'pending')}
		result={status === 'approved'
			? 'Published successfully.'
			: status === 'rejected'
				? 'Kept as a draft.'
				: undefined}
	>
		<p>Reviewers will be notified after approval.</p>
	</ApprovalCard>
</div>
