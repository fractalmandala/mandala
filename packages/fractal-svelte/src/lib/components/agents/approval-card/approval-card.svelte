<script lang="ts">
	import type { Snippet } from 'svelte';
	import { untrack } from 'svelte';
	import './approval-card.sass';
	export type ApprovalCardStatus =
		| 'pending'
		| 'submitting'
		| 'approved'
		| 'rejected'
		| 'changes-requested'
		| 'answered';
	export type ApprovalCardOption = { value: string; label: string; disabled?: boolean };
	export type ApprovalCardQuestion = {
		id: string;
		title: string;
		description?: string;
		options?: ApprovalCardOption[];
		multiple?: boolean;
		autoAdvance?: boolean;
		allowCustom?: boolean;
		customPlaceholder?: string;
	};
	export type ApprovalCardAnswer = { selected: string[]; custom?: string };
	export type ApprovalCardAnswers = Record<string, ApprovalCardAnswer>;
	let {
		title = 'Approval required',
		description,
		children,
		questions = [],
		status = 'pending',
		answers,
		defaultAnswers = {},
		onAnswersChange,
		step,
		defaultStep = 0,
		onStepChange,
		onSubmit,
		onApprove,
		onReject,
		onRequestChanges,
		onDismiss,
		approveLabel = 'Approve',
		submitLabel = 'Submit response',
		result
	}: {
		title?: string;
		description?: string;
		children?: Snippet;
		questions?: ApprovalCardQuestion[];
		status?: ApprovalCardStatus;
		answers?: ApprovalCardAnswers;
		defaultAnswers?: ApprovalCardAnswers;
		onAnswersChange?: (v: ApprovalCardAnswers) => void;
		step?: number;
		defaultStep?: number;
		onStepChange?: (v: number) => void;
		onSubmit?: (v: ApprovalCardAnswers) => void;
		onApprove?: () => void;
		onReject?: () => void;
		onRequestChanges?: () => void;
		onDismiss?: () => void;
		approveLabel?: string;
		submitLabel?: string;
		result?: string;
	} = $props();
	let internalAnswers = $state(untrack(() => defaultAnswers)),
		internalStep = $state(untrack(() => defaultStep)),
		timer: ReturnType<typeof setTimeout>;
	let currentAnswers = $derived(answers ?? internalAnswers),
		currentStep = $derived(
			Math.min(Math.max(0, step ?? internalStep), Math.max(0, questions.length - 1))
		),
		question = $derived(questions[currentStep]),
		answer = $derived(
			question
				? (currentAnswers[question.id] ?? { selected: [], custom: '' })
				: { selected: [], custom: '' }
		),
		interactive = $derived(status === 'pending' || status === 'submitting'),
		busy = $derived(status === 'submitting');
	function setAnswers(v: ApprovalCardAnswers) {
		if (answers === undefined) internalAnswers = v;
		onAnswersChange?.(v);
	}
	function setStep(v: number) {
		clearTimeout(timer);
		if (step === undefined) internalStep = v;
		onStepChange?.(v);
	}
	function update(v: ApprovalCardAnswer) {
		if (question) setAnswers({ ...currentAnswers, [question.id]: v });
	}
	function selected(value: string) {
		if (!question) return;
		if (question.multiple)
			update({
				...answer,
				selected: answer.selected.includes(value)
					? answer.selected.filter((x) => x !== value)
					: [...answer.selected, value]
			});
		else {
			update({ selected: [value], custom: '' });
			if (question.autoAdvance !== false && currentStep < questions.length - 1) {
				clearTimeout(timer);
				timer = setTimeout(() => setStep(currentStep + 1), 240);
			}
		}
	}
	function next() {
		if (currentStep < questions.length - 1) setStep(currentStep + 1);
		else onSubmit?.(currentAnswers);
	}
	$effect(() => {
		if (answers === undefined) internalAnswers = defaultAnswers;
		if (step === undefined) internalStep = defaultStep;
		return () => clearTimeout(timer);
	});
</script>

<div data-slot="approval-card" data-state={status} aria-busy={busy}>
	<header>
		<span aria-hidden="true"
			>{busy ? '◌' : interactive ? '?' : status === 'rejected' ? '×' : '✓'}</span
		>
		<h3>{question?.title ?? title}</h3>
		<span data-slot="approval-status">{status}</span>{#if onDismiss}<button
				type="button"
				aria-label="Dismiss"
				onclick={onDismiss}>×</button
			>{/if}
	</header>
	{#if interactive}<div data-slot="approval-body">
			{#if question}{#if question.description}<p>
						{question.description}
					</p>{/if}{#if question.options?.length}<div
						role={question.multiple ? 'group' : 'radiogroup'}
					>
						{#each question.options as option}<label
								><input
									type={question.multiple ? 'checkbox' : 'radio'}
									name={question.id}
									checked={answer.selected.includes(option.value)}
									disabled={busy || option.disabled}
									onchange={() => selected(option.value)}
								/>{option.label}</label
							>{/each}
					</div>{/if}{#if question.allowCustom}<input
						aria-label={`Custom response for ${question.title}`}
						placeholder={question.customPlaceholder ?? 'Add another response…'}
						value={answer.custom ?? ''}
						disabled={busy}
						oninput={(e) =>
							update({
								selected: question.multiple ? answer.selected : [],
								custom: e.currentTarget.value
							})}
					/>{/if}
				<footer>
					<button
						type="button"
						aria-label="Previous question"
						disabled={busy || currentStep === 0}
						onclick={() => setStep(currentStep - 1)}>←</button
					><span>Question {currentStep + 1} of {questions.length}</span><button
						type="button"
						aria-label={currentStep === questions.length - 1
							? 'Submit response'
							: 'Next question'}
						disabled={busy || (!answer.selected.length && !answer.custom?.trim())}
						onclick={next}
						>{currentStep === questions.length - 1 ? submitLabel : '→'}</button
					>
				</footer>{:else}{#if description}<p>{description}</p>{/if}{@render children?.()}
				<footer>
					<button type="button" disabled={busy} onclick={onApprove}>{approveLabel}</button
					>{#if onRequestChanges}<button
							type="button"
							disabled={busy}
							onclick={onRequestChanges}>Request changes</button
						>{/if}{#if onReject}<button type="button" disabled={busy} onclick={onReject}
							>Reject</button
						>{/if}
				</footer>{/if}
		</div>{:else}<p data-slot="approval-result">{result ?? status}</p>{/if}
</div>
