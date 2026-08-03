import Root from "./input-group.svelte";
import Input from "./input-group-input.svelte";
import Textarea from "./input-group-textarea.svelte";
import Addon from "./input-group-addon.svelte";
import Button from "./input-group-button.svelte";
import Text from "./input-group-text.svelte";

export {
	Root,
	Input,
	Textarea,
	Addon,
	Button,
	Text,
	// Aliases
	Root as InputGroup,
	Input as InputGroupInput,
	Textarea as InputGroupTextarea,
	Addon as InputGroupAddon,
	Button as InputGroupButton,
	Text as InputGroupText,
};

export type { InputGroupProps } from "./input-group.svelte";
export type { InputGroupInputProps } from "./input-group-input.svelte";
export type { InputGroupTextareaProps } from "./input-group-textarea.svelte";
export type { InputGroupAddonProps, InputGroupAddonAlign } from "./input-group-addon.svelte";
export type { InputGroupButtonProps, InputGroupButtonSize } from "./input-group-button.svelte";
export type { InputGroupTextProps } from "./input-group-text.svelte";
