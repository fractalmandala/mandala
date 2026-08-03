import Root from "./confirmation.svelte";
import Title from "./confirmation-title.svelte";
import Request from "./confirmation-request.svelte";
import Accepted from "./confirmation-accepted.svelte";
import Rejected from "./confirmation-rejected.svelte";
import Actions from "./confirmation-actions.svelte";
import Action from "./confirmation-action.svelte";

export {
	setConfirmationContext,
	getConfirmationContext,
} from "./confirmation-context.svelte.js";

export {
	Root,
	Title,
	Request,
	Accepted,
	Rejected,
	Actions,
	Action,
	// Aliases
	Root as Confirmation,
	Title as ConfirmationTitle,
	Request as ConfirmationRequest,
	Accepted as ConfirmationAccepted,
	Rejected as ConfirmationRejected,
	Actions as ConfirmationActions,
	Action as ConfirmationAction,
};

export type { ConfirmationProps } from "./confirmation.svelte";
export type { ConfirmationTitleProps } from "./confirmation-title.svelte";
export type { ConfirmationRequestProps } from "./confirmation-request.svelte";
export type { ConfirmationAcceptedProps } from "./confirmation-accepted.svelte";
export type { ConfirmationRejectedProps } from "./confirmation-rejected.svelte";
export type { ConfirmationActionsProps } from "./confirmation-actions.svelte";
export type { ConfirmationActionProps } from "./confirmation-action.svelte";
export type { ToolUIPartApproval, ToolUIPartState, ConfirmationContextValue } from "./confirmation-context.svelte.js";
