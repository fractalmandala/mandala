import Root from './chain-of-thought.svelte';
import Header from './chain-of-thought-header.svelte';
import Content from './chain-of-thought-content.svelte';
import Step from './chain-of-thought-step.svelte';
import Image from './chain-of-thought-image.svelte';
import SearchResults from './chain-of-thought-search-results.svelte';
import SearchResult from './chain-of-thought-search-result.svelte';

export {
	ChainOfThoughtContext,
	getChainOfThoughtContext,
	setChainOfThoughtContext
} from './chain-of-thought-context.svelte.js';

export {
	Root,
	Header,
	Content,
	Step,
	Image,
	SearchResults,
	SearchResult,
	//
	Root as ChainOfThought,
	Header as ChainOfThoughtHeader,
	Content as ChainOfThoughtContent,
	Step as ChainOfThoughtStep,
	Image as ChainOfThoughtImage,
	SearchResults as ChainOfThoughtSearchResults,
	SearchResult as ChainOfThoughtSearchResult
};

export type { ChainOfThoughtProps } from './chain-of-thought.svelte';
export type { ChainOfThoughtHeaderProps } from './chain-of-thought-header.svelte';
export type { ChainOfThoughtContentProps } from './chain-of-thought-content.svelte';
export type {
	ChainOfThoughtStepProps,
	ChainOfThoughtStepStatus
} from './chain-of-thought-step.svelte';
export type { ChainOfThoughtImageProps } from './chain-of-thought-image.svelte';
export type { ChainOfThoughtSearchResultsProps } from './chain-of-thought-search-results.svelte';
export type { ChainOfThoughtSearchResultProps } from './chain-of-thought-search-result.svelte';
