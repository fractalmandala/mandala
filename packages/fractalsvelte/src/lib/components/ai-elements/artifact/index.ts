import Root from "./artifact.svelte";
import Header from "./artifact-header.svelte";
import Title from "./artifact-title.svelte";
import Description from "./artifact-description.svelte";
import Actions from "./artifact-actions.svelte";
import Action from "./artifact-action.svelte";
import Close from "./artifact-close.svelte";
import Content from "./artifact-content.svelte";

export {
	Root,
	Header,
	Title,
	Description,
	Actions,
	Action,
	Close,
	Content,
	// Aliases
	Root as Artifact,
	Header as ArtifactHeader,
	Title as ArtifactTitle,
	Description as ArtifactDescription,
	Actions as ArtifactActions,
	Action as ArtifactAction,
	Close as ArtifactClose,
	Content as ArtifactContent,
};

export type { ArtifactProps } from "./artifact.svelte";
export type { ArtifactHeaderProps } from "./artifact-header.svelte";
export type { ArtifactTitleProps } from "./artifact-title.svelte";
export type { ArtifactDescriptionProps } from "./artifact-description.svelte";
export type { ArtifactActionsProps } from "./artifact-actions.svelte";
export type { ArtifactActionProps } from "./artifact-action.svelte";
export type { ArtifactCloseProps } from "./artifact-close.svelte";
export type { ArtifactContentProps } from "./artifact-content.svelte";
