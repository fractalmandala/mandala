import InlineCitation from "./inline-citation.svelte";
import InlineCitationText from "./inline-citation-text.svelte";

import InlineCitationCard from "./inline-citation-card.svelte";
import InlineCitationCardTrigger from "./inline-citation-card-trigger.svelte";
import InlineCitationCardBody from "./inline-citation-card-body.svelte";

import InlineCitationCarousel from "./inline-citation-carousel.svelte";
import InlineCitationCarouselContent from "./inline-citation-carousel-content.svelte";
import InlineCitationCarouselItem from "./inline-citation-carousel-item.svelte";
import InlineCitationCarouselHeader from "./inline-citation-carousel-header.svelte";

import InlineCitationCarouselIndex from "./inline-citation-carousel-index.svelte";
import InlineCitationCarouselPrev from "./inline-citation-carousel-prev.svelte";
import InlineCitationCarouselNext from "./inline-citation-carousel-next.svelte";

import InlineCitationSource from "./inline-citation-source.svelte";
import InlineCitationQuote from "./inline-citation-quote.svelte";

export {
	InlineCitation,
	InlineCitationText,
	InlineCitationCard,
	InlineCitationCardTrigger,
	InlineCitationCardBody,
	InlineCitationCarousel,
	InlineCitationCarouselContent,
	InlineCitationCarouselItem,
	InlineCitationCarouselHeader,
	InlineCitationCarouselIndex,
	InlineCitationCarouselPrev,
	InlineCitationCarouselNext,
	InlineCitationSource,
	InlineCitationQuote,
	// Aliases
	InlineCitation as Root,
	InlineCitationText as Text,
	InlineCitationCard as Card,
	InlineCitationCardTrigger as CardTrigger,
	InlineCitationCardBody as CardBody,
	InlineCitationCarousel as Carousel,
	InlineCitationCarouselContent as CarouselContent,
	InlineCitationCarouselItem as CarouselItem,
	InlineCitationCarouselHeader as CarouselHeader,
	InlineCitationCarouselIndex as CarouselIndex,
	InlineCitationCarouselPrev as CarouselPrev,
	InlineCitationCarouselNext as CarouselNext,
	InlineCitationSource as Source,
	InlineCitationQuote as Quote,
};

export {
	CarouselContext,
	setCarouselContext,
	getCarouselContext,
	type CarouselApi,
} from "./carousel-context.svelte.js";

export type { InlineCitationProps } from "./inline-citation.svelte";
export type { InlineCitationTextProps } from "./inline-citation-text.svelte";
export type { InlineCitationCardProps } from "./inline-citation-card.svelte";
export type { InlineCitationCardTriggerProps } from "./inline-citation-card-trigger.svelte";
export type { InlineCitationCardBodyProps } from "./inline-citation-card-body.svelte";
export type { InlineCitationCarouselProps } from "./inline-citation-carousel.svelte";
export type { InlineCitationCarouselContentProps } from "./inline-citation-carousel-content.svelte";
export type { InlineCitationCarouselItemProps } from "./inline-citation-carousel-item.svelte";
export type { InlineCitationCarouselHeaderProps } from "./inline-citation-carousel-header.svelte";
export type { InlineCitationCarouselIndexProps } from "./inline-citation-carousel-index.svelte";
export type { InlineCitationCarouselPrevProps } from "./inline-citation-carousel-prev.svelte";
export type { InlineCitationCarouselNextProps } from "./inline-citation-carousel-next.svelte";
export type { InlineCitationSourceProps } from "./inline-citation-source.svelte";
export type { InlineCitationQuoteProps } from "./inline-citation-quote.svelte";
