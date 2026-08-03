import Root from "./alert.svelte";
import Title from "./alert-title.svelte";
import Description from "./alert-description.svelte";
import Action from "./alert-action.svelte";

export {
	Root,
	Title,
	Description,
	Action,
	// Aliases
	Root as Alert,
	Title as AlertTitle,
	Description as AlertDescription,
	Action as AlertAction,
};

export type { AlertProps, AlertVariant } from "./alert.svelte";
export type { AlertTitleProps } from "./alert-title.svelte";
export type { AlertDescriptionProps } from "./alert-description.svelte";
export type { AlertActionProps } from "./alert-action.svelte";
