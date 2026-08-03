<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';
	import { ArrowsClockwiseIcon, CaretLeftIcon, CaretRightIcon } from 'phosphor-svelte';
	import { backend } from '$lib/backend';
	import type { YouTubeVideo } from '$lib/backend/types';
	import useEmblaCarousel from 'embla-carousel-svelte';
	import type { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';

	const channelUrl = 'https://www.youtube.com/@shradhapandey8099';
	const videosUrl = 'https://www.youtube.com/@shradhapandey8099/videos';
	const emblaOptions: EmblaOptionsType = {
		align: 'start',
		axis: 'x',
		containScroll: 'trimSnaps',
		dragFree: false,
		slidesToScroll: 1,
		watchDrag: true
	};

	let videos = $state<YouTubeVideo[]>([]);
	let loading = $state(true);
	let error = $state('');
	let emblaApi = $state<EmblaCarouselType | null>(null);
	let canScrollPrev = $state(false);
	let canScrollNext = $state(false);

	const hasVideos = $derived(videos.length > 0);

	onMount(() => {
		void loadVideos();
	});

	onDestroy(() => {
		emblaApi?.off('select', updateScrollButtons);
		emblaApi?.off('reInit', updateScrollButtons);
	});

	async function loadVideos() {
		loading = true;
		error = '';
		try {
			videos = await backend.listYouTubeChannelVideos();
			await tick();
			emblaApi?.reInit();
			updateScrollButtons();
		} catch (err) {
			error = String(err);
		} finally {
			loading = false;
		}
	}

	function handleEmblaInit(event: CustomEvent<EmblaCarouselType>) {
		emblaApi = event.detail;
		emblaApi.on('select', updateScrollButtons);
		emblaApi.on('reInit', updateScrollButtons);
		updateScrollButtons();
	}

	function updateScrollButtons() {
		canScrollPrev = emblaApi?.canScrollPrev() ?? false;
		canScrollNext = emblaApi?.canScrollNext() ?? false;
	}

	function scrollPrev() {
		emblaApi?.scrollPrev();
		updateScrollButtons();
	}

	function scrollNext() {
		emblaApi?.scrollNext();
		updateScrollButtons();
	}

	function handleCarouselKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			scrollPrev();
		} else if (event.key === 'ArrowRight') {
			event.preventDefault();
			scrollNext();
		}
	}
</script>

<section class="flex h-full min-h-0 flex-col gap-4">
	{#if loading}
		<div class="flex flex-1 items-center justify-center text-sm text-muted-foreground">
			Loading public channel videos...
		</div>
	{:else if error}
		<div class="flex flex-1 flex-col items-center justify-center gap-3 text-center">
			<p class="max-w-lg text-sm text-muted-foreground">{error}</p>
			<button class="btn-std inline-flex items-center gap-1.5" onclick={loadVideos}>
				<ArrowsClockwiseIcon size={16} weight="bold" />
				Try again
			</button>
		</div>
	{:else if hasVideos}
		<div class="embla">
			<div
				class="embla__viewport"
				role="listbox"
				aria-label="Shradha Pandey channel videos"
				tabindex="0"
				use:useEmblaCarousel={{ options: emblaOptions, plugins: [] }}
				onemblaInit={handleEmblaInit}
				onkeydown={handleCarouselKeydown}>
				<div class="embla__container">
					{#each videos as video (video.id)}
						<div class="embla__slide" role="option" aria-selected="false">
							<iframe
								width="100%"
								height="400"
								src={video.embed_url}
								title={video.title}
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
								allowfullscreen>
							</iframe>
							<p class="text-lg">{video.title}</p>
						</div>
					{/each}
				</div>
			</div>
			<div class="embla__controls row ycenter xbetween">
				<button
					class="btn-std embla__prev row ycenter"
					type="button"
					disabled={!canScrollPrev}
					aria-label="Scroll to previous video"
					onclick={scrollPrev}>
					<CaretLeftIcon size={16} weight="bold" />
					Previous
				</button>
				<button
					class="btn-std embla__next row ycenter"
					type="button"
					disabled={!canScrollNext}
					aria-label="Scroll to next video"
					onclick={scrollNext}>
					Next
					<CaretRightIcon size={16} weight="bold" />
				</button>
			</div>
		</div>
	{:else}
		<div class="flex flex-1 items-center justify-center text-sm text-muted-foreground">
			No public videos were found.
		</div>
	{/if}
</section>
