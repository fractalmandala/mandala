import { cancelDictation, onDictationEvent, startDictation, stopDictation, type DictationEvent } from '$lib/ipc';

type EditableTarget = HTMLInputElement | HTMLTextAreaElement | HTMLElement;

function isTextControl(target: EditableTarget): target is HTMLInputElement | HTMLTextAreaElement {
	return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
}

function isEligibleTarget(target: EventTarget | null): target is EditableTarget {
	if (!(target instanceof HTMLElement)) return false;
	if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
		return !target.disabled && !target.readOnly;
	}
	return target.isContentEditable && !target.closest('[contenteditable="false"], [aria-readonly="true"]');
}

class DictationController {
	phase = $state<'idle' | 'checking' | 'listening' | 'finalizing' | 'error'>('idle');
	message = $state('');
	locale = $state('en-US');
	private target: EditableTarget | null = null;
	private partialStart = 0;
	private partialEnd = 0;
	private partialText = '';
	private unlisten: (() => void) | null = null;
	private fnHoldTimer: ReturnType<typeof setTimeout> | null = null;

	get isActive(): boolean {
		return this.phase === 'checking' || this.phase === 'listening' || this.phase === 'finalizing';
	}

	initialize(): () => void {
		if (typeof localStorage !== 'undefined') this.locale = localStorage.getItem('dictation:locale') || 'en-US';
		this.unlisten = onDictationEvent(event => this.handleEvent(event));
		return () => {
			this.unlisten?.();
			this.unlisten = null;
			if (this.isActive) void this.cancel();
		};
	}

	setLocale(locale: string): void {
		if (this.isActive) return;
		this.locale = locale;
		if (typeof localStorage !== 'undefined') localStorage.setItem('dictation:locale', locale);
	}

	async toggle(): Promise<void> {
		if (this.isActive) return this.stop();
		return this.start();
	}

	beginFnGlobeHold(): void {
		if (this.fnHoldTimer || this.isActive) return;
		this.fnHoldTimer = setTimeout(() => {
			this.fnHoldTimer = null;
			void this.start();
		}, 400);
	}

	endFnGlobeHold(): void {
		if (this.fnHoldTimer) {
			clearTimeout(this.fnHoldTimer);
			this.fnHoldTimer = null;
			return;
		}
		if (this.isActive) void this.stop();
	}

	async start(): Promise<void> {
		const candidate = document.activeElement;
		if (!isEligibleTarget(candidate)) {
			this.phase = 'error';
			this.message = 'Focus a text field or editor to dictate.';
			return;
		}
		this.target = candidate;
		this.partialText = '';
		if (isTextControl(candidate)) {
			this.partialStart = candidate.selectionStart ?? candidate.value.length;
			this.partialEnd = candidate.selectionEnd ?? this.partialStart;
		}
		this.phase = 'checking';
		this.message = 'Preparing Dictation…';
		try {
			await startDictation(this.locale);
		} catch (error) {
			this.fail(error);
		}
	}

	async stop(): Promise<void> {
		if (!this.isActive) return;
		this.phase = 'finalizing';
		this.message = 'Finalizing Dictation…';
		try {
			await stopDictation();
		} catch (error) {
			this.fail(error);
		}
	}

	async cancel(): Promise<void> {
		this.clearPartial();
		try {
			await cancelDictation();
		} finally {
			this.reset();
		}
	}

	private handleEvent(event: DictationEvent): void {
		if (event.type === 'state') {
			if (event.phase === 'listening') {
				this.phase = 'listening';
				this.message = 'Listening…';
			} else if (event.phase === 'idle') {
				this.reset();
			}
			return;
		}
		if (event.type === 'partial' && event.text !== undefined) {
			this.applyPartial(event.text);
			return;
		}
		if (event.type === 'final' && event.text !== undefined) {
			this.commitFinal(event.text);
			return;
		}
		if (event.type === 'error') this.fail(event.detail ?? event.code ?? 'Dictation could not start.');
	}

	private applyPartial(text: string): void {
		if (!this.target || !isTextControl(this.target)) return;
		this.replaceTextControl(this.target, text, 'insertCompositionText');
		this.partialText = text;
		this.phase = 'listening';
		this.message = 'Listening…';
	}

	private commitFinal(text: string): void {
		if (!this.target || !this.target.isConnected) return;
		if (isTextControl(this.target)) {
			this.replaceTextControl(this.target, text, 'insertText');
			this.partialText = '';
			return;
		}
		this.target.focus();
		// CodeMirror and TipTap observe the browser editing transaction, preserving their own
		// history rather than bypassing it with a direct DOM mutation.
		document.execCommand('insertText', false, text);
	}

	private replaceTextControl(target: HTMLInputElement | HTMLTextAreaElement, text: string, inputType: string): void {
		target.focus();
		const start = this.partialText ? this.partialStart : (target.selectionStart ?? target.value.length);
		const end = this.partialText ? this.partialEnd : (target.selectionEnd ?? start);
		target.setRangeText(text, start, end, 'end');
		this.partialStart = start;
		this.partialEnd = start + text.length;
		target.dispatchEvent(new InputEvent('input', { bubbles: true, inputType, data: text }));
	}

	private clearPartial(): void {
		if (!this.partialText || !this.target || !isTextControl(this.target)) return;
		this.replaceTextControl(this.target, '', 'deleteCompositionText');
		this.partialText = '';
	}

	private fail(error: unknown): void {
		this.clearPartial();
		this.phase = 'error';
		this.message = error instanceof Error ? error.message : String(error);
	}

	private reset(): void {
		if (this.fnHoldTimer) clearTimeout(this.fnHoldTimer);
		this.fnHoldTimer = null;
		this.target = null;
		this.partialText = '';
		this.partialStart = 0;
		this.partialEnd = 0;
		this.phase = 'idle';
		this.message = '';
	}
}

export const dictation = new DictationController();
