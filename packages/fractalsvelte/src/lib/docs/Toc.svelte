<script lang="ts">
	// "On this page". Headings are read from the rendered article rather than parsed from
	// markdown, so it works for both .md prose headings and headings emitted by chrome
	// components. `key` forces a rebuild on navigation.
	let { key }: { key?: string } = $props();

	type Head = { id: string; text: string; level: number };

	let heads = $state<Head[]>([]);
	let activeId = $state<string>("");

	function slugify(text: string) {
		return text
			.toLowerCase()
			.replace(/[^\w\s-]/g, "")
			.trim()
			.replace(/\s+/g, "-");
	}

	$effect(() => {
		// Referenced so the effect re-runs when the route changes.
		key;

		const article = document.querySelector(".doc-article");
		if (!article) return;

		const found: Head[] = [];
		for (const el of article.querySelectorAll<HTMLElement>("h2, h3")) {
			if (!el.id) el.id = slugify(el.textContent ?? "");
			found.push({
				id: el.id,
				text: el.textContent ?? "",
				level: el.tagName === "H2" ? 2 : 3,
			});
		}
		heads = found;

		// Deterministic scrollspy: the active heading is the last one whose top has passed
		// the trigger line. An IntersectionObserver leaves the highlight stale whenever no
		// heading sits inside its band — which is most of the time on a long page, and is
		// why the last section stayed lit at scroll top.
		function sync() {
			const trigger = 120;
			let currentId = found[0]?.id ?? "";
			for (const h of found) {
				const el = document.getElementById(h.id);
				if (el && el.getBoundingClientRect().top <= trigger) currentId = h.id;
				else break;
			}
			// At the very bottom, favour the last heading — the final section may be too
			// short to ever reach the trigger line.
			if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) {
				currentId = found[found.length - 1]?.id ?? currentId;
			}
			activeId = currentId;
		}

		sync();
		window.addEventListener("scroll", sync, { passive: true });
		window.addEventListener("resize", sync);

		return () => {
			window.removeEventListener("scroll", sync);
			window.removeEventListener("resize", sync);
		};
	});
</script>

{#if heads.length > 1}
	<aside class="doc-toc" aria-label="On this page">
		<h3 class="doc-toc-heading">On this page</h3>
		<ul>
			{#each heads as h (h.id)}
				<li>
					<a
						href="#{h.id}"
						class="doc-toc-link"
						data-level={h.level}
						data-active={activeId === h.id}>{h.text}</a
					>
				</li>
			{/each}
		</ul>
	</aside>
{/if}
