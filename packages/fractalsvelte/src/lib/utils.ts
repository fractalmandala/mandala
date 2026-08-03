// Type helpers shared by every component.
//
// Note there is no `cn()` here, by design. shadcn merges class strings with clsx +
// tailwind-merge so consumers can override styling through `class`. This library exposes
// customisation through explicit props instead, so no class merger is needed — and adding
// one back would reintroduce the Tailwind dependency the port exists to remove.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
