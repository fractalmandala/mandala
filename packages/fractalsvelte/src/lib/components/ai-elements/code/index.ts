import Root from "./code.svelte";
import Overflow from "./code-overflow.svelte";
import CopyButton from "./code-copy-button.svelte";
import type { CodeCopyButtonProps, CodeRootProps, CodeVariant } from "./types.js";

export {
	Root,
	CopyButton,
	Overflow,
	type CodeRootProps as RootProps,
	type CodeCopyButtonProps as CopyButtonProps,
	type CodeVariant,
};
