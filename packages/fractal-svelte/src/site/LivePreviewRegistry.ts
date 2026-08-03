import type { Component } from 'svelte';

export const livePreviewLoaders: Record<string, () => Promise<{ default: Component }>> = {
	'notification-stack': () => import('$examples/NotificationStackExample.svelte'),
	'expandable-action-bar': () => import('$examples/ExpandableActionBarExample.svelte'),
	'overflow-actions': () => import('$examples/OverflowActionsExample.svelte'),
	'feedback-widget': () => import('$examples/FeedbackWidgetExample.svelte'),
	'not-found': () => import('$examples/NotFoundExample.svelte')
};
