<script lang="ts">
	import { untrack } from "svelte";
	import type { Snippet } from "svelte";
	import { dictation } from '$lib/state/dictation.svelte';

	// ─── Types ────────────────────────────────────────────────────────────────────

	type ChatStatus = "submitted" | "streaming" | "error" | "ready";

	interface PromptInputAttachment {
		id: string;
		file: File;
		filename: string;
		mediaType: string;
		previewUrl?: string;
		remoteUrl?: string;
		uploadStatus?: "uploading" | "uploaded" | "error";
		error?: string;
	}

	interface FileUIPart {
		type: "file";
		url: string;
		mediaType: string;
		filename: string;
	}

	interface Message {
		text: string;
		files?: FileUIPart[];
		attachments: PromptInputAttachment[];
	}

	interface AttachmentError {
		code: "max_files" | "max_file_size" | "accept";
		message: string;
	}

	// ─── Internal state controllers ──────────────────────────────────────────────

	class TextController {
		value = $state("");

		setInput(newValue: string) {
			this.value = newValue;
		}

		clear() {
			this.value = "";
		}
	}

	class AttachmentsController {
		items = $state<PromptInputAttachment[]>([]);
		fileInputRef = $state<HTMLInputElement | null>(null);

		accept?: string;
		multiple?: boolean;
		maxFiles?: number;
		maxFileSize?: number;
		onError?: (err: AttachmentError) => void;
		onAttachmentsChange?: (items: PromptInputAttachment[]) => void;
		onFileAdd?: (added: PromptInputAttachment[], all: PromptInputAttachment[]) => void;
		onFileRemove?: (removed: PromptInputAttachment[], all: PromptInputAttachment[]) => void;

		constructor(opts: {
			accept?: string;
			multiple?: boolean;
			maxFiles?: number;
			maxFileSize?: number;
			onError?: (err: AttachmentError) => void;
			onFileAdd?: (added: PromptInputAttachment[], all: PromptInputAttachment[]) => void;
			onFileRemove?: (removed: PromptInputAttachment[], all: PromptInputAttachment[]) => void;
		}) {
			this.accept = opts.accept;
			this.multiple = opts.multiple;
			this.maxFiles = opts.maxFiles;
			this.maxFileSize = opts.maxFileSize;
			this.onError = opts.onError;
			this.onFileAdd = opts.onFileAdd;
			this.onFileRemove = opts.onFileRemove;
		}

		private matchesAccept(file: File): boolean {
			if (!this.accept || this.accept.trim() === "") return true;
			let patterns = this.accept.split(",").map((p) => p.trim()).filter(Boolean);
			return patterns.some((pattern) => {
				if (pattern.endsWith("/*")) return file.type.startsWith(pattern.slice(0, -1));
				return file.type === pattern;
			});
		}

		openFileDialog() {
			this.fileInputRef?.click();
		}

		add(files: File[] | FileList) {
			let incoming = Array.from(files);
			let accepted = incoming.filter((f) => this.matchesAccept(f));

			if (accepted.length === 0) {
				this.onError?.({ code: "accept", message: "No files match the accepted types." });
				return;
			}

			let withinSize = (f: File) => (this.maxFileSize ? f.size <= this.maxFileSize : true);
			let sized = accepted.filter(withinSize);

			if (sized.length === 0 && accepted.length > 0) {
				this.onError?.({ code: "max_file_size", message: "All files exceed the maximum size." });
				return;
			}

			let effectiveMaxFiles = this.multiple === false
				? typeof this.maxFiles === "number" ? Math.min(this.maxFiles, 1) : 1
				: this.maxFiles;

			let capacity = typeof effectiveMaxFiles === "number"
				? Math.max(0, effectiveMaxFiles - this.items.length)
				: undefined;
			let capped = typeof capacity === "number" ? sized.slice(0, capacity) : sized;

			if (typeof capacity === "number" && sized.length > capacity) {
				this.onError?.({ code: "max_files", message: "Too many files. Some were not added." });
			}

			let added: PromptInputAttachment[] = [];
			for (let file of capped) {
				added.push({
					id: crypto.randomUUID(),
					file,
					previewUrl: URL.createObjectURL(file),
					mediaType: file.type,
					filename: file.name,
				});
			}

			if (added.length === 0) return;

			let next = [...this.items, ...added];
			this.setItems(next);
			this.onFileAdd?.(added, next);
		}

		remove(id: string) {
			let removed = this.items.filter((a) => a.id === id);
			if (removed.length === 0) return;
			let next = this.items.filter((a) => a.id !== id);
			this.setItems(next);
			this.onFileRemove?.(removed, next);
		}

		clear() {
			let removed = this.items;
			if (removed.length === 0) return;
			this.setItems([]);
			this.onFileRemove?.(removed, []);
		}

		replace(items: PromptInputAttachment[] | undefined) {
			this.setItems(items ?? []);
		}

		private cleanupPreviewUrls(prev: PromptInputAttachment[], next: PromptInputAttachment[]) {
			let nextUrls = new Set(next.map((a) => a.previewUrl).filter(Boolean));
			for (let a of prev) {
				if (a.previewUrl?.startsWith("blob:") && !nextUrls.has(a.previewUrl)) {
					URL.revokeObjectURL(a.previewUrl);
				}
			}
		}

		private setItems(next: PromptInputAttachment[]) {
			if (this.items === next) return;
			this.cleanupPreviewUrls(this.items, next);
			this.items = next;
			this.onAttachmentsChange?.(next);
		}

		destroy() {
			this.cleanupPreviewUrls(this.items, []);
			this.items = [];
		}
	}

	// ─── Props ───────────────────────────────────────────────────────────────────

	interface Props {
		// Text input
		value?: string;
		placeholder?: string;
		onValueChange?: (value: string) => void;

		// Submit / status
		status?: ChatStatus;
		onSubmit: (message: Message, event: SubmitEvent) => void | Promise<void>;
		onStop?: () => void;

		// Attachments
		attachments?: PromptInputAttachment[];
		accept?: string;
		multiple?: boolean;
		globalDrop?: boolean;
		clearOnSubmit?: boolean;
		resetFormOnSubmit?: boolean;
		maxFiles?: number;
		maxFileSize?: number;
		onError?: (err: AttachmentError) => void;
		onFileAdd?: (added: PromptInputAttachment[], all: PromptInputAttachment[]) => void;
		onFileRemove?: (removed: PromptInputAttachment[], all: PromptInputAttachment[]) => void;

		// Snippets for composition
		children?: Snippet;
		header?: Snippet;
		body?: Snippet;
		toolbar?: Snippet;
		tools?: Snippet;

		// Styling
		class?: string;
	}

	let {
		value: externalValue = $bindable(""),
		placeholder = "What would you like to know?",
		onValueChange,

		status = $bindable<ChatStatus>("ready"),
		onSubmit,
		onStop,

		attachments: externalAttachments = $bindable<PromptInputAttachment[] | undefined>(undefined),
		accept,
		multiple,
		globalDrop,
		clearOnSubmit = true,
		resetFormOnSubmit = false,
		maxFiles,
		maxFileSize,
		onError,
		onFileAdd,
		onFileRemove,

		children,
		header,
		body,
		toolbar,
		tools,

		class: className,
	}: Props = $props();

	// ─── State ────────────────────────────────────────────────────────────────────

	let textCtrl = new TextController();
	textCtrl.value = untrack(() => externalValue);

	let attachmentsCtrl = new AttachmentsController({
		accept: untrack(() => accept),
		multiple: untrack(() => multiple),
		maxFiles: untrack(() => maxFiles),
		maxFileSize: untrack(() => maxFileSize),
		onError: untrack(() => onError),
		onFileAdd: untrack(() => onFileAdd),
		onFileRemove: untrack(() => onFileRemove),
	});

	let formRef = $state<HTMLFormElement | null>(null);
	let contentRef = $state<HTMLDivElement | null>(null);
	let attachmentsHeight = $state(0);
	let isComposing = $state(false);

	// Derived states for attachments
	let nonImageFiles = $derived(
		attachmentsCtrl.items.filter(
			(f) => !(f.mediaType?.startsWith("image/") && (f.previewUrl ?? f.remoteUrl))
		)
	);
	let imageFiles = $derived(
		attachmentsCtrl.items.filter(
			(f) => f.mediaType?.startsWith("image/") && (f.previewUrl ?? f.remoteUrl)
		)
	);

	// Image lightbox state
	let lightboxOpen = $state(false);
	let lightboxImageId = $state("");
	let lightboxRatio = $state(1);

	let lightboxCurrentIndex = $derived.by(() => {
		let idx = imageFiles.findIndex((f) => f.id === lightboxImageId);
		return idx >= 0 ? idx : 0;
	});
	let lightboxCurrentImage = $derived.by(() => {
		return imageFiles[lightboxCurrentIndex] ?? imageFiles[0] ?? null;
	});

	function getDisplayUrl(attachment: PromptInputAttachment): string | undefined {
		return attachment.previewUrl ?? attachment.remoteUrl;
	}

	function syncLightboxImage(id: string) {
		lightboxImageId = id;
		lightboxRatio = 1;
	}

	function showPreviousImage() {
		if (imageFiles.length <= 1) return;
		let next = (lightboxCurrentIndex - 1 + imageFiles.length) % imageFiles.length;
		syncLightboxImage(imageFiles[next].id);
	}

	function showNextImage() {
		if (imageFiles.length <= 1) return;
		let next = (lightboxCurrentIndex + 1) % imageFiles.length;
		syncLightboxImage(imageFiles[next].id);
	}

	function handleImageLoad(e: Event) {
		let img = e.currentTarget as HTMLImageElement;
		if (img.naturalWidth > 0 && img.naturalHeight > 0) {
			lightboxRatio = img.naturalWidth / img.naturalHeight;
		}
	}

	function handleLightboxKeydown(e: KeyboardEvent) {
		if (!lightboxOpen) return;
		if (e.key === "ArrowLeft") { e.preventDefault(); showPreviousImage(); }
		if (e.key === "ArrowRight") { e.preventDefault(); showNextImage(); }
	}

	// Sync text value bidirectionally
	$effect(() => {
		if (externalValue !== textCtrl.value) {
			textCtrl.value = untrack(() => externalValue);
		}
	});

	$effect(() => {
		onValueChange?.(textCtrl.value);
		if (textCtrl.value !== externalValue) {
			externalValue = textCtrl.value;
		}
	});

	// Sync external attachments
	$effect(() => {
		if (externalAttachments !== undefined && attachmentsCtrl.items !== externalAttachments) {
			attachmentsCtrl.replace(externalAttachments);
		}
	});

	$effect(() => {
		let sync = (next: PromptInputAttachment[]) => {
			if (externalAttachments !== next) externalAttachments = next;
		};
		attachmentsCtrl.onAttachmentsChange = sync;
		sync(attachmentsCtrl.items);
		return () => { attachmentsCtrl.onAttachmentsChange = undefined; };
	});

	// Watch height for attachment list animation
	$effect(() => {
		if (!contentRef) return;
		let ro = new ResizeObserver(() => {
			if (contentRef) attachmentsHeight = contentRef.getBoundingClientRect().height;
		});
		ro.observe(contentRef);
		attachmentsHeight = contentRef.getBoundingClientRect().height;
		return () => ro.disconnect();
	});

	// Reset lightbox when closing
	$effect(() => {
		if (!lightboxOpen && imageFiles.length > 0) {
			syncLightboxImage(imageFiles[0]?.id ?? "");
		}
	});

	// Drag & drop on form
	$effect(() => {
		let el = formRef;
		if (!el) return;
		let onDragOver = (e: DragEvent) => {
			if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
		};
		let onDrop = (e: DragEvent) => {
			if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
			if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
				attachmentsCtrl.add(e.dataTransfer.files);
			}
		};
		el.addEventListener("dragover", onDragOver);
		el.addEventListener("drop", onDrop);
		return () => {
			el?.removeEventListener("dragover", onDragOver);
			el?.removeEventListener("drop", onDrop);
		};
	});

	// Global drop
	$effect(() => {
		if (!globalDrop) return;
		let onDragOver = (e: DragEvent) => {
			if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
		};
		let onDrop = (e: DragEvent) => {
			if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
			if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
				attachmentsCtrl.add(e.dataTransfer.files);
			}
		};
		document.addEventListener("dragover", onDragOver);
		document.addEventListener("drop", onDrop);
		return () => {
			document.removeEventListener("dragover", onDragOver);
			document.removeEventListener("drop", onDrop);
		};
	});

	// ─── Submit handling ─────────────────────────────────────────────────────────

	let isGenerating = $derived(status === "submitted" || status === "streaming");

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		let text = textCtrl.value;
		let submittedAttachments = attachmentsCtrl.items.map((a) => ({ ...a }));
		let files: FileUIPart[] | undefined = undefined;

		if (attachmentsCtrl.items.length > 0) {
			files = await Promise.all(
				attachmentsCtrl.items.map(async (a) => ({
					type: "file" as const,
					url: a.remoteUrl ?? await new Promise<string>((resolve, reject) => {
						let reader = new FileReader();
						reader.onload = () => resolve(reader.result as string);
						reader.onerror = () => reject(reader.error ?? new Error("Failed to read file."));
						reader.readAsDataURL(a.file);
					}),
					mediaType: a.mediaType || a.file.type || "application/octet-stream",
					filename: a.filename || a.file.name,
				}))
			);
		}

		try {
			let result = onSubmit({ text, files, attachments: submittedAttachments }, event);
			if (result && typeof result === "object" && "then" in result) await result;

			if (clearOnSubmit) {
				attachmentsCtrl.clear();
				textCtrl.clear();
				if (resetFormOnSubmit) event.currentTarget && (event.currentTarget as HTMLFormElement).reset();
			}
		} catch (err) {
			console.error("Submit failed:", err);
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Enter") {
			if (e.isComposing || isComposing) return;
			if (e.shiftKey) return;
			e.preventDefault();
			let form = (e.currentTarget as HTMLTextAreaElement).form;
			if (!form) return;
			let btn = form.querySelector("[data-prompt-submit]") as HTMLButtonElement | null;
			if (btn && !btn.disabled && btn.type === "submit") form.requestSubmit(btn);
		}
	}

	// ─── SVG icon components ─────────────────────────────────────────────────────

	let iconSize = "16px";
</script>

<!-- Hidden file input -->
<input
	{accept}
	class="pi-hidden-input"
	{multiple}
	onchange={(e) => {
		let target = e.currentTarget as HTMLInputElement;
		if (target.files) attachmentsCtrl.add(target.files);
		target.value = "";
	}}
	bind:this={attachmentsCtrl.fileInputRef}
	type="file"
/>

<!-- Main form -->
<form
	bind:this={formRef}
	class="pi-root {className ?? ''}"
	onsubmit={handleSubmit}
>
	{@render header?.()}

	<!-- Attachments area -->
	{#if attachmentsCtrl.items.length > 0}
		<div class="pi-attachments-wrap" style:height="{attachmentsHeight > 0 ? attachmentsHeight + 'px' : '0px'}">
			<div class="pi-attachments-inner" bind:this={contentRef}>
				{#if nonImageFiles.length > 0}
					<div class="pi-attachment-row">
						{#each nonImageFiles as file (file.id)}
							<div class="pi-attachment pi-attachment--file" role="group">
								<!-- paperclip icon -->
								<img class="pi-icon" src="/iconset/attach.svg" alt="" width={iconSize} height={iconSize} />
								<div class="pi-attachment-file-info">
									<span class="pi-attachment-filename">{file.filename || "Unknown file"}</span>
									{#if file.mediaType}
										<span class="pi-attachment-type">{file.mediaType}</span>
									{/if}
								</div>
								<button
									class="pi-attachment-remove"
									aria-label="Remove file"
									type="button"
									onclick={(e) => { e.stopPropagation(); attachmentsCtrl.remove(file.id); }}
								>
									<img src="/iconset/close.svg" alt="" class="icon-svg-xs" />
								</button>
							</div>
						{/each}
					</div>
				{/if}

				{#if imageFiles.length > 0}
					<div class="pi-attachment-row">
						{#each imageFiles as file (file.id)}
							<div class="pi-image-preview-wrap">
								<button
									class="pi-image-preview"
									aria-label="Preview {file.filename || 'image attachment'}"
									type="button"
									onclick={() => { syncLightboxImage(file.id); lightboxOpen = true; }}
								>
									<img
										class="pi-image-preview-img"
										src={getDisplayUrl(file)}
										alt={file.filename || "attachment"}
										width={56}
										height={56}
									/>
								</button>
								<button
									class="pi-image-remove"
									type="button"
									aria-label="Remove image"
									onclick={(e) => { e.stopPropagation(); attachmentsCtrl.remove(file.id); }}
								>
									<img src="/iconset/close.svg" alt="" class="icon-svg-xs" />
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Body (textarea area) -->
	{@render body?.()}

	<!-- Default body with textarea if no body snippet provided -->
	{#if !body}
		<div class="pi-body">
			<textarea
				class="pi-textarea"
				bind:value={textCtrl.value}
				{placeholder}
				onkeydown={handleKeydown}
				oncompositionstart={() => { isComposing = true; }}
				oncompositionend={() => { isComposing = false; }}
				rows={1}
			></textarea>
		</div>
	{/if}

	<!-- Toolbar -->
	<div class="pi-toolbar">
			<!-- Default tools: action menu for adding attachments -->
			<div class="pi-tools">
				{#if !tools}
					<div class="pi-tool-group">
						<!-- Action menu trigger -->
						<div class="pi-action-menu">
							<button
								class="pi-btn pi-btn--ghost pi-btn--icon"
								type="button"
								aria-label={dictation.isActive ? 'Stop Dictation' : 'Start Dictation'}
								onclick={() => { document.querySelector<HTMLTextAreaElement>('.pi-textarea')?.focus(); void dictation.toggle(); }}
							>
								<img src="/iconset/record.svg" alt="" class="icon-svg-sm" />
							</button>
							<button
								class="pi-btn pi-btn--ghost pi-btn--icon"
								type="button"
								aria-label="Add attachments"
								onclick={() => attachmentsCtrl.openFileDialog()}
							>
								<img src="/iconset/add.svg" alt="" class="icon-svg-sm" />
							</button>
						</div>
					</div>
				{:else}
					<div class="pi-tool-group">
					{@render tools()}
					</div>
				{/if}
				{@render toolbar?.()}
			</div>

		<!-- Submit button -->
		<button
			class="chat-submit"
			data-prompt-submit="true"
			type={isGenerating ? "button" : "submit"}
			aria-label={isGenerating ? "Stop" : "Submit"}
			disabled={!isGenerating && !textCtrl.value.trim()}
			onclick={(e) => {
				if (isGenerating) {
					e.preventDefault();
					onStop?.();
				}
			}}
		>
			{#if status === "submitted"}
				<img class="pi-icon pi-spin" src="/iconset/refresh.svg" alt="" />
			{:else if status === "streaming"}
				<img src="/iconset/stop.svg" alt="" class="icon-svg-sm" />
			{:else if status === "error"}
				<img src="/iconset/errorOutline.svg" alt="" class="icon-svg-sm" />
			{:else}
				<!-- Send icon -->
				<img src="/iconset/send.svg" alt="" class="icon-svg-sm" />
			{/if}
		</button>
	</div>

	{@render children?.()}
</form>

<!-- Lightbox dialog -->
{#if lightboxOpen && lightboxCurrentImage}
	<div class="pi-lightbox-overlay" role="dialog" aria-modal="true" aria-label="Image preview" onkeydown={handleLightboxKeydown} tabindex="-1">
		<button class="pi-lightbox-close" type="button" aria-label="Close preview" onclick={() => { lightboxOpen = false; }}>
			<img src="/iconset/close.svg" alt="" class="icon-svg-lg" />
		</button>

		{#if imageFiles.length > 1}
			<button class="pi-lightbox-nav pi-lightbox-nav--prev" type="button" aria-label="Previous image" onclick={showPreviousImage}>
				<img src="/iconset/chevronLeft.svg" alt="" class="icon-svg-lg" />
			</button>
			<button class="pi-lightbox-nav pi-lightbox-nav--next" type="button" aria-label="Next image" onclick={showNextImage}>
				<img src="/iconset/chevronRight.svg" alt="" class="icon-svg-lg" />
			</button>
		{/if}

		<div class="pi-lightbox-image-wrap" style:aspect-ratio="{lightboxRatio}">
			<img
				class="pi-lightbox-image"
				src={getDisplayUrl(lightboxCurrentImage)}
				alt={lightboxCurrentImage.filename || "attachment preview"}
				onload={handleImageLoad}
			/>
		</div>
	</div>
{/if}
