import { getContext, setContext } from 'svelte';

export type TabsVariant = 'pill' | 'underline' | 'segment';

export type TabsContext = {
	value: string;
	setValue: (v: string) => void;
	layoutId: string;
	variant: TabsVariant;
};

/** Weighty spring for the active-tab indicator: a touch of overshoot so it
 * settles with life instead of snapping. */
export const TABS_TRANSITION = {
	type: 'spring',
	stiffness: 170,
	damping: 24,
	mass: 1.2
} as const;

const TABS_CTX = Symbol('mg-tabs');

export function setTabsContext(context: TabsContext) {
	setContext(TABS_CTX, context);
}

export function getTabsContext(): TabsContext {
	const context = getContext<TabsContext>(TABS_CTX);
	if (!context) throw new Error('Tabs.* must be used inside <Tabs>');
	return context;
}
