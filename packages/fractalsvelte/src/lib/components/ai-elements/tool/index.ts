import Tool from "./tool.svelte";
import ToolContent from "./tool-content.svelte";
import ToolHeader from "./tool-header.svelte";
import ToolInput from "./tool-input.svelte";
import ToolOutput from "./tool-output.svelte";

export {
	Tool,
	ToolHeader,
	ToolContent,
	ToolInput,
	ToolOutput,
	// Aliases
	Tool as Root,
	ToolHeader as Header,
	ToolContent as Content,
	ToolInput as Input,
	ToolOutput as Output,
};

export {
	ToolClass,
	setToolContext,
	getToolContext,
	type ToolSchema,
	type ToolUIPartType,
	type ToolUIPartState,
} from "./tool-context.svelte.js";

export type { ToolProps } from "./tool.svelte";
export type { ToolHeaderProps } from "./tool-header.svelte";
export type { ToolContentProps } from "./tool-content.svelte";
export type { ToolInputProps } from "./tool-input.svelte";
export type { ToolOutputProps } from "./tool-output.svelte";
