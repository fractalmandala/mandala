export const tabsContextKey = Symbol('docs-kit:tabs');

export interface TabsContext {
	readonly active: string;
}
