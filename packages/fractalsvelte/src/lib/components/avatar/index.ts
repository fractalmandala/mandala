import Root from "./avatar.svelte";
import Image from "./avatar-image.svelte";
import Fallback from "./avatar-fallback.svelte";
import Badge from "./avatar-badge.svelte";
import Group from "./avatar-group.svelte";
import GroupCount from "./avatar-group-count.svelte";

export {
	Root,
	Image,
	Fallback,
	Badge,
	Group,
	GroupCount,
	// Aliases
	Root as Avatar,
	Image as AvatarImage,
	Fallback as AvatarFallback,
	Badge as AvatarBadge,
	Group as AvatarGroup,
	GroupCount as AvatarGroupCount,
};

export type { AvatarProps, AvatarSize } from "./avatar.svelte";
export type { AvatarImageProps } from "./avatar-image.svelte";
export type { AvatarFallbackProps } from "./avatar-fallback.svelte";
export type { AvatarBadgeProps } from "./avatar-badge.svelte";
export type { AvatarGroupProps } from "./avatar-group.svelte";
export type { AvatarGroupCountProps } from "./avatar-group-count.svelte";
