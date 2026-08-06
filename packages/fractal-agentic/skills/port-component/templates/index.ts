import Root, { type NameProps, type NameSize, type NameVariant } from './name.svelte';

export {
	Root,
	type NameProps as Props,
	//
	Root as Name,
	type NameProps,
	type NameSize,
	type NameVariant
};

// Multi-part components export each part plus an alias:
//
// import Root from "./card.svelte";
// import Header from "./card-header.svelte";
// export { Root, Header, Root as Card, Header as CardHeader };
