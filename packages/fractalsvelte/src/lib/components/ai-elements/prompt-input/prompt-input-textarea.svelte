<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { Textarea } from "$lib/components/textarea/index.js";

	export type PromptInputTextareaProps = ComponentProps<typeof Textarea>;
</script>

<script lang="ts">
	import { getAttachmentsContext } from "./attachments.svelte.js";
	import { getPromptInputProvider } from "./provider.svelte.js";
	import { getPromptInputTextRegistration } from "./text-registration.svelte.js";

	let {
		placeholder = "What would you like to know?",
		value = $bindable(""),
		onchange,
		ref = $bindable(null),
		...restProps
	}: PromptInputTextareaProps = $props();

	let attachments = getAttachmentsContext();
	let controller = getPromptInputProvider();
	let promptTextRegistration = getPromptInputTextRegistration();

	let promptTextHandle = {
		getValue: (): string => {
			const val = controller ? controller.textInput.value : value;
			if (typeof val === "string") return val;
			if (Array.isArray(val)) return val.join("\n");
			return val != null ? String(val) : "";
		},
		clear: () => {
			value = "";
		},
	};

	$effect(() => {
		promptTextRegistration.register(promptTextHandle);
		return () => {
			promptTextRegistration.unregister(promptTextHandle);
		};
	});

	$effect(() => {
		if (controller && value !== controller.textInput.value) {
			value = controller.textInput.value;
		}
	});

	let handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter") {
			if (e.isComposing) return;
			if (e.shiftKey) return;

			e.preventDefault();
			let form = (e.currentTarget as HTMLTextAreaElement).form;
			if (form) {
				let promptInputSubmit = form.querySelector(
					"[data-prompt-input-submit]"
				) as HTMLButtonElement | null;
				if (promptInputSubmit) {
					if (promptInputSubmit.disabled || promptInputSubmit.type !== "submit") {
						return;
					}
					form.requestSubmit(promptInputSubmit);
					return;
				}

				let submitButton = form.querySelector(
					'button[type="submit"]'
				) as HTMLButtonElement | null;
				if (submitButton?.disabled) return;
				if (submitButton) {
					form.requestSubmit(submitButton);
					return;
				}
				form.requestSubmit();
			}
		}
	};

	let handleInput = (event: Event) => {
		let nextValue = (event.currentTarget as HTMLTextAreaElement).value;
		value = nextValue;
		controller?.textInput.setInput(nextValue);
	};

	let handlePaste = (e: ClipboardEvent) => {
		let items = e.clipboardData?.items;
		if (!items) return;

		let files: File[] = [];
		for (let item of items) {
			if (item.kind === "file") {
				let file = item.getAsFile();
				if (file) files.push(file);
			}
		}

		if (files.length > 0) {
			e.preventDefault();
			attachments.add(files);
		}
	};
</script>

{#if controller}
	<Textarea
		bind:ref
		data-slot="prompt-input-textarea"
		oninput={handleInput}
		onpaste={handlePaste}
		name="message"
		{onchange}
		onkeydown={handleKeyDown}
		{placeholder}
		value={controller.textInput.value}
		{...restProps}
	/>
{:else}
	<Textarea
		bind:ref
		data-slot="prompt-input-textarea"
		oninput={handleInput}
		onpaste={handlePaste}
		name="message"
		{onchange}
		onkeydown={handleKeyDown}
		{placeholder}
		bind:value
		{...restProps}
	/>
{/if}
