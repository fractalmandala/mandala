<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLFormAttributes } from "svelte/elements";
	import type { FileUIPart, Message, PromptInputAttachment } from "./types.js";

	export type PromptInputProps = WithElementRef<HTMLFormAttributes> & {
		attachments?: PromptInputAttachment[];
		accept?: string;
		multiple?: boolean;
		globalDrop?: boolean;
		syncHiddenInput?: boolean;
		clearOnSubmit?: boolean;
		resetFormOnSubmit?: boolean;
		maxFiles?: number;
		maxFileSize?: number;
		onError?: (err: {
			code: "max_files" | "max_file_size" | "accept";
			message: string;
		}) => void;
		onFileAdd?: (added: PromptInputAttachment[], attachments: PromptInputAttachment[]) => void;
		onFileRemove?: (
			removed: PromptInputAttachment[],
			attachments: PromptInputAttachment[]
		) => void;
		onSubmit: (message: Message, event: SubmitEvent) => void | Promise<void>;
	};
</script>

<script lang="ts">
	import { watch } from "runed";
	import { onDestroy } from "svelte";
	import { AttachmentsContext, setAttachmentsContext } from "./attachments.svelte.js";
	import { getPromptInputProvider } from "./provider.svelte.js";
	import {
		setPromptInputTextRegistration,
		type PromptInputTextHandle,
	} from "./text-registration.svelte.js";

	let {
		attachments = $bindable<PromptInputAttachment[] | undefined>(undefined),
		accept,
		multiple,
		globalDrop,
		syncHiddenInput,
		clearOnSubmit = true,
		resetFormOnSubmit = false,
		maxFiles,
		maxFileSize,
		onError,
		onFileAdd,
		onFileRemove,
		onSubmit,
		children,
		ref = $bindable(null),
		...restProps
	}: PromptInputProps = $props();

	let formRef = $state<HTMLFormElement | null>(null);
	let controller = getPromptInputProvider();
	let usingProvider = Boolean(controller);
	let localAttachmentsContext = new AttachmentsContext();
	let attachmentsContext = controller?.attachments ?? localAttachmentsContext;
	let promptTextHandle = $state.raw<PromptInputTextHandle | null>(null);

	setPromptInputTextRegistration({
		register: (handle) => {
			promptTextHandle = handle;
		},
		unregister: (handle) => {
			if (promptTextHandle === handle) {
				promptTextHandle = null;
			}
		},
	});

	$effect(() => {
		attachmentsContext.configure({
			accept,
			multiple,
			maxFiles,
			maxFileSize,
			onError,
			onFileAdd,
			onFileRemove,
		});
	});

	$effect(() => {
		let syncAttachments = (next: PromptInputAttachment[]) => {
			if (attachments !== next) {
				attachments = next;
			}
		};

		attachmentsContext.onAttachmentsChange = syncAttachments;
		syncAttachments(attachmentsContext.attachments);

		return () => {
			if (attachmentsContext.onAttachmentsChange === syncAttachments) {
				attachmentsContext.onAttachmentsChange = undefined;
			}
		};
	});

	$effect(() => {
		if (attachments !== undefined && attachmentsContext.attachments !== attachments) {
			attachmentsContext.replace(attachments);
		}
	});

	watch(
		() => formRef,
		(formRef) => {
			if (!formRef) return;

			let onDragOver = (e: DragEvent) => {
				if (e.dataTransfer?.types?.includes("Files")) {
					e.preventDefault();
				}
			};

			let onDrop = (e: DragEvent) => {
				if (e.dataTransfer?.types?.includes("Files")) {
					e.preventDefault();
				}
				if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
					attachmentsContext.add(e.dataTransfer.files);
				}
			};

			formRef.addEventListener("dragover", onDragOver);
			formRef.addEventListener("drop", onDrop);

			return () => {
				formRef?.removeEventListener("dragover", onDragOver);
				formRef?.removeEventListener("drop", onDrop);
			};
		}
	);

	watch(
		() => globalDrop,
		(enabled) => {
			if (!enabled) return;

			let onDragOver = (e: DragEvent) => {
				if (e.dataTransfer?.types?.includes("Files")) {
					e.preventDefault();
				}
			};

			let onDrop = (e: DragEvent) => {
				if (e.dataTransfer?.types?.includes("Files")) {
					e.preventDefault();
				}
				if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
					attachmentsContext.add(e.dataTransfer.files);
				}
			};

			document.addEventListener("dragover", onDragOver);
			document.addEventListener("drop", onDrop);

			return () => {
				document.removeEventListener("dragover", onDragOver);
				document.removeEventListener("drop", onDrop);
			};
		}
	);

	watch(
		() => attachmentsContext.attachments,
		() => {
			if (syncHiddenInput && attachmentsContext.fileInputRef) {
				if (attachmentsContext.attachments.length === 0) {
					attachmentsContext.fileInputRef.value = "";
				}
			}
		}
	);

	let handleChange = (event: Event) => {
		let target = event.currentTarget as HTMLInputElement;
		if (target.files) {
			attachmentsContext.add(target.files);
		}
		target.value = "";
	};

	let convertFileToDataUrl = (file: File): Promise<string> =>
		new Promise((resolve, reject) => {
			let reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = () => reject(reader.error ?? new Error("Failed to read file."));
			reader.readAsDataURL(file);
		});

	let createFiles = async (
		attachments: PromptInputAttachment[]
	): Promise<FileUIPart[] | undefined> => {
		if (attachments.length === 0) {
			return undefined;
		}

		let files = await Promise.all(
			attachments.map(async (attachment) => {
				let url = attachment.remoteUrl
					? attachment.remoteUrl
					: await convertFileToDataUrl(attachment.file);

				return {
					type: "file" as const,
					url,
					mediaType:
						attachment.mediaType || attachment.file.type || "application/octet-stream",
					filename: attachment.filename || attachment.file.name,
				};
			})
		);

		return files.length > 0 ? files : undefined;
	};

	let handleSubmit = async (event: SubmitEvent) => {
		event.preventDefault();

		let form = event.currentTarget as HTMLFormElement;
		let text = usingProvider
			? (controller?.textInput.value ?? "")
			: (promptTextHandle?.getValue() ??
				((new FormData(form).get("message") as string) || ""));
		let submittedAttachments = attachmentsContext.attachments.map((attachment) => ({
			...attachment,
		}));
		let files = await createFiles(attachmentsContext.attachments);

		try {
			let result = onSubmit(
				{
					text,
					files,
					attachments: submittedAttachments,
				},
				event
			);

			if (result && typeof result === "object" && "then" in result) {
				await result;
			}

			if (clearOnSubmit) {
				attachmentsContext.clear();
				if (usingProvider) {
					controller?.textInput.clear();
				} else {
					promptTextHandle?.clear();
				}

				if (resetFormOnSubmit) {
					form.reset();
				}
			}
		} catch (error) {
			console.error("Submit failed:", error);
		}
	};

	onDestroy(() => {
		if (usingProvider) {
			attachmentsContext.onAttachmentsChange = undefined;
			attachmentsContext.onFileAdd = undefined;
			attachmentsContext.onFileRemove = undefined;
			attachmentsContext.onError = undefined;
			if (attachmentsContext.fileInputRef) {
				attachmentsContext.fileInputRef = null;
			}
			return;
		}

		localAttachmentsContext.destroy();
	});

	setAttachmentsContext(attachmentsContext);
</script>

<input
	{accept}
	style="display: none;"
	{multiple}
	onchange={handleChange}
	bind:this={attachmentsContext.fileInputRef}
	type="file"
/>
<form
	bind:this={formRef}
	data-slot="prompt-input"
	onsubmit={handleSubmit}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</form>
