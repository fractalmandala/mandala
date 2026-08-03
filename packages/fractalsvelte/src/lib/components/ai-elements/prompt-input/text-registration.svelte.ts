import { getContext, setContext } from "svelte";

export interface PromptInputTextHandle {
	getValue: () => string;
	clear: () => void;
}

export interface PromptInputTextRegistration {
	register: (handle: PromptInputTextHandle) => void;
	unregister: (handle: PromptInputTextHandle) => void;
}

const TEXT_REGISTRATION_CONTEXT_KEY = Symbol("prompt-input-text-registration");

export function setPromptInputTextRegistration(registration: PromptInputTextRegistration) {
	setContext(TEXT_REGISTRATION_CONTEXT_KEY, registration);
}

export function getPromptInputTextRegistration(): PromptInputTextRegistration {
	let registration = getContext<PromptInputTextRegistration>(TEXT_REGISTRATION_CONTEXT_KEY);
	if (!registration) {
		throw new Error("Textarea must be used within a PromptInput");
	}
	return registration;
}
