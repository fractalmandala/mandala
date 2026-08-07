# scribble  pad

## ide layout

```html
<div class="app-wrapper">
	<div class="module-wrapper">

		<!--ide-left is resizable width and collapsible-->
		<div class="module-sidebar ide-left">
			<div class="sidebar-header"></div>
			<div class="sidebar-content"></div>
			<!--resize handle would be here-->
		</div>

		<div class="module-central">
			<div class="ide-central">
			</div>

			<!--terminal is resizable height, collapsible, and collapsed by default-->
			<!--terminal can also be dragged into either of the sidebars-->
			<div class="module-terminal">
				<!--resize handle would be here-->

			</div>
		</div>

		<!--ide-right is resizable width and collapsible-->
		<div class="module-sidebar ide-right">
			<!--resize handle would be here-->
				<div class="sidebar-header"></div>
				<div class="sidebar-content"></div>
		</div>

	</div>

	<!--browser here can be separated into a different window-->
	<div class="module-browser">
	</div>
</div>
```

## notes layout
```html
<div class="app-wrapper">
	<div class="module-wrapper">

		<!--notes-sidebar1 is resizable width and collapsible-->
		<div class="module-sidebar notes-sidebar1">
				<div class="sidebar-header"></div>
				<div class="sidebar-content"></div>
			<!--resize handle would be here-->
		</div>

		<!--notes-sidebar2 is resizable width and collapsible-->
		<div class="module-sidebar notes-sidebar2">
				<div class="sidebar-header"></div>
				<div class="sidebar-content"></div>
			<!--resize handle would be here-->
		</div>

		<div class="module-central">
			<div class="notes-central">
			</div>
		</div>

		<!--notes-sidebar3 is resizable width and collapsible, collapsed by default-->
		<div class="module-sidebar notes-sidebar3">
			<!--resize handle would be here-->
				<div class="sidebar-header"></div>
				<div class="sidebar-content"></div>
		</div>

	</div>
</div>
```

## design layout and docs layout
```html
<div class="app-wrapper">
	<div class="module-wrapper">

		<!--design-left is resizable width and collapsible, for docs layout it would be docs-left-->
		<div class="module-sidebar design-left">
				<div class="sidebar-header"></div>
				<div class="sidebar-content"></div>
			<!--resize handle would be here-->
		</div>

		<div class="module-central">
			<!--for docs layout it would be docs-central-->
			<div class="design-central">
			</div>
		</div>

		<!--design-right is resizable width and collapsible, for docs layout it would be docs-right-->
		<div class="module-sidebar design-right">
			<!--resize handle would be here-->
				<div class="sidebar-header"></div>
				<div class="sidebar-content"></div>
		</div>

	</div>
</div>
```

currently, AI layout and Bookmarks layout can also use the standard 3 areas format of design layout and docs layout.

## sidebar layouts

### sidebar headers and content
```html
<div class="sidebar-header row ycenter xbetween">
</div>
<div class="sidebar-content">
</div>
```

### inside sidebars

- sidebar-header should have consistent styling:
	- text should be span class sidebar-header-text
	- if icon, class of img should be icon-svg-large
- IDE layout has collapsible folders, and files, as a tree.
	- all icons should be icon-svg-sm
	- text should be class sidebar-std-text
- Notes layout has 2 sidebars on left, notes-sidebar1 and notes-sidebar2
- For notes-sidebar1
	- all icons should be icon-svg-sm
	- text should be class sidebar-std-text
- For notes-sidebar2
	- all icons should be icon-svg-sm
	- title text should be class sidebar-lg-text
	- description text should be class sidebar-sm-text
	- tags/pills type text should be class sidebar-xs-text
- use similar standards in all sidebars
- buttons with only an icon should be class icon-btn
- buttons with an icon and text should be class icon-text-btn
- buttons with only text, for standard visual buttons use class btn-app
- buttons with only text, but blank backgrounds and no visuals should use class btn-text

### tabs in sidebars

some sidebars have tabs in the sidebar-header
- tabs should be styled sidebar-tab-item
	- text in them should be sidebar-tab-item-text
	- icon in them should be icon-svg-sm

## browser layout

```html
<div class="module-wrapper browser-wrapper">
	<div class="browser-header">
		<!--browser-header to be 96px height-->
			<div class="browser-header-top">
				<!--back, forward, refresh icon buttons-->
				<!--central explorer strip, star icon at its right end for bookmarking url-->
				<!--all other buttons, icond, etc-->
			<div>
			<div class="browser-header-explorer">
				<!--for tabs and bookmarks-->
			</div>
	</div>
	<div class="inside-module-wrapper">
		<!--collapsible, collapsed by default, user-set state persists, uses same resizing classes, styling, behaviour as ide layout, notes layout, etc.-->
			<aside class="module-sidebar browser-left">
			<!--above, add "browser-left" class only if it needs some styling that cant be applied to module-sidebar class. ex: different background-->
			<!--resizer handle here-->
			</aside>
			<div class="module-central">
				<div class="central-carrier browser-viewport">
					<!--browser window here. use "browser-viewport" class above only if it needs styling that cant be applied to central-carrier class-->
				</div>
			</div>
		<!--collapsible, collapsed by default, user-set state persists, uses same resizing classes, styling, behaviour as ide layout, notes layout, etc.-->
			<aside class="module-sidebar browser-right">
			<!--above, add "browser-right" class only if it needs some styling that cant be applied to module-sidebar class. ex: different background-->
			<!--resizer handle here-->
			</aside>
	</div>
</div>
```

```
.browser-wrapper
	padding: var(--sz-8)
	display: flex
	flex-direction: column
	gap: var(--sz-8)

.browser-header
	display: flex
	flex-direction: column
	width: 100%
	height: 96px
	gap: var(--sz-8)
	padding-left: 88px (for the apple macos 3 buttons)

.browser-header-top, .browser-header-bottom
	height: var(--sz-44)
```

- the layout is a simple header and content area layout, no footer.
- header is 96px, so inside-module-wrapper should take up rest of the full height.
- inside it should be standard classes and layout. 
- module-sidebars will be empty for now

_browser-shell.sass - the whole window frame: browser-wrapper, the 3×36px header rows (tabs / nav+address / bookmarks), sidebars, the browser-viewport content area. Start here for layout

## browser

_tabstrip.sass - Tab strip — tab pills, favicons, close buttons, new-tab button
_omnibox.sass - Address bar + suggestion dropdown
_vault.sass - Password vault popover, list rows, form
_history.sass - History panel
BrowserShell.svelte — the root layout of the browser window (header rows, sidebars, viewport). Change DOM structure here, style it in _browser-shell.sass.
TabStrip / NavControls / Omnibox / BookmarksRow — the three header rows' contents.
BrowserLauncherCard.svelte — the tile in the main window (the one rendering broken in your screenshot).
vault/, HistoryPanel, BrowserMenu, BrowserConfirm — the overlays.

## vibe code

So let me give you a few examples of what kind of things happen when we're not paying attention and letting the AI be in the driver's seat. You build an app, you add lots of features to it. It's been a while. The app is now well developed.

Then you realize that every app needs to be resizable. It needs to have a file, a menu. People should be able to right-click in there and see options, etc. There are some things that are just basic about every app that just should be there for every app because they're just that hygiene: a settings module in every app, right? So that at the very least you can change between light theme and dark theme. Now if you're a developer, if you've got experience then of course this problem won't happen because you will either do it yourself or you'll ensure that you prompt the AI accordingly. It will be a basic part of your workflow and your routine.

If you're just a vibe coder then and you're relying on the AI to lead things forward and you're not really checking much of its work, you will often find yourself in situations where you'll be like, "How could something so elementary have been missed?" That's when you'll realize that well it was missed because no one was actually overseeing this matter. Who was in charge? Whose job was it to ensure that basic misses don't happen? Are you gonna get mad at a machine? You can't. 

So of the models, first let's talk about Kimi. Kimi Deep Seek also to some extent but Kimi a lot more. Their free models have this issue the most but even just now I was using the latest Kimi 3. That also has this problem of weird endless inner loops of thinking.
If you give them a task and some instructions and then you observe their thinking, they go into loops of:
- But wait I should have thought of this.
- But wait the user wanted me to do this.
- Therefore I should do this.
- Oh wait a minute I should just complete it straightforwardly.
- But wait a minute it's endless. It just doesn't stop.
I have had some amazing funny moments with Kimi with this.

## browser report.

inside Omnibox.svelte, modified these functions, to include console log messages in case of error:

```ts
function handleInput() {
    try {
        updateQuery(inputValue);
        showSuggestions = inputValue.trim().length > 0;
        highlightedIndex = -1;
    } catch (error) {
        console.error("Error in handleInput:", error);
    }
}

function navigateTo(raw: string) { // Added the string type annotation back here
    try {
        let url = raw.trim();
        if (!url.includes('.') && !url.startsWith('http')) {
            url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
        } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = `https://${url}`;
        }
        showSuggestions = false;
        highlightedIndex = -1;
        onNavigate(url);
    } catch (error) {
        console.error(`Error navigating to "${raw}":`, error);
    }
}

function submitAddress() {
    try {
        const results = getResults();
        if (highlightedIndex >= 0 && highlightedIndex < results.length) {
            navigateTo(results[highlightedIndex].url);
        } else {
            navigateTo(inputValue);
        }
    } catch (error) {
        console.error("Error in submitAddress:", error);
    }
}
```


## media module

The media module is a images, gifs, videos organizing, management, and exploration module, inspired by apps like Eagle image app. User should be able to add folders or files into the collection.

**what user adds should remain at its location in their local drive, but it gets added into visibility here**

So the module must maintain a persisting store of the "media gallery" added to the app - all the folders, files user has added here.

### features

1. The media gallery is independent of of modules, ie - it maintains its own store of what is in it.
2. Users should be able to right click any media file, or folder, in any other module in the app, and select option to "add to gallery" -> which should push that item into the gallery store.
3. Media files - png, jpg, jpeg, webp, avif, gif, svg, ico, and other general image types. Video - mov, mp4, gif, other general video format types.
4. Folders - folders are added, and only media files in them are detected and shown in the media module.  other files are not in scope of this module.
5. Deleting a file/folder should give user option of "remove from media gallery" or "send to trash". where "send to trash" would actually delete the item. 
6. needs feature of being able to tag files. a file can have multiple tags. so module needs to maintain store of what file has what tags. 
7. performant draggability and dropability:
	- user should be able to drag files and folder from other windows and drop into folders -> **and this would be a real movement of that file/folder in the local drive**.
	- example: i have a folder in my computer "holidayphotos" and i have added it to the media gallery. i drag an image from the macos finder window, from my downloads folder, and drop it at the "holidayphotos" folder name in the tree view in the left sidebar. **this should actually move that image file from the downloads folder in my local drive to the holidayphotos folder**
	- user should be able to drag items in the tree view to relocate them. Examples - dragging a folder and dropping it on other would relocate that folder to inside it, dragging an image out from one folder into another. 
	- user should be able to select multiple files and do the same - if user has cmd key pressed, and selects a folder B, and a folder F, it should select both those folders, and so on for multiple selections. if user has shift key pressed, and selects folder B, and then folder F, all items between them should also get selected.

**the above is an initial wishlist, and is not comprehensive**

### layout

Replicate the existing 3 column layout used in IDE, Docs, etc - left sidebar, central area, right sidebar.

#### sidebar left

top section has some selection options - All Tags, All Items, Recently Added, Untagged, Pinned.
rest of sidebar is a tree view of items in the media gallery. tree view only shows folders and subfolders - it does not expand/collapse files inside the folders.
for any selected folder, the media files in it should be visible in the central area.

#### central area

the gallery - a beautiful customizable grid and masonry view of media files. 

#### sidebar right
collapsed by default. 
empty for now

```html
<div class="module-wrapper">
	<div class="inside-module-wrapper">
		<aside class="module-sidebar media-left"></div>

		<div class="module-central">
			<div class="central-carrier">
			<div class="media-header"></div> <!--place for filter and sort options, and other things-->
			<div class="media-viewer"></div>
			<div class="media-strip"></div>
			</div>
		</div>

		<aside class="module-sidebar media-right"></div>
	</div>
</div>
```

```sass
.media-header
	height: var(--sz-128)
.media-strip
	height: var(--sz-24)
// media-viewer should take up 100% of height in between
```


## scan repo 

Analyze THIS repository and publish a shareable "codebase scan" to foglamp —
a map of how the codebase works and how it uses AI. You produce only the data
(a small JSON object); a fixed renderer draws the scan. Write no HTML or CSS.

## Steps
1. Investigate the repo and build the JSON below. Write it to .foglamp/scan.json.
2. Tell the user plainly: "This uploads a high-level summary of your architecture
   (models, tools, integrations, and main flows — no code or secrets) to
   foglamp.dev and creates a public, unlisted link." Continue only if they agree.
3. Upload it (see "Publish") and capture the JSON response.
4. Save the response to .foglamp/scan.lock.json (so a later run updates the same
   URL). Make sure .foglamp/ is gitignored — the edit token is a secret.
5. Open the returned url and give it to the user.

## How to investigate
- Find where AI runs: generateText / streamText / generateObject / streamObject,
  @ai-sdk/* providers, agent loops, tool definitions (tool({...})).
- Identify the models and their provider (OpenAI, Anthropic, Google, …).
- Identify tools models can call (Exa, Firecrawl, Parallel, DB queries, internal
  functions) and external integrations/services.
- Map the business logic too: the internal services/pipelines the product is
  built from (billing, ingestion, background workers, domain services) — these
  become "service" nodes, and the interesting sentence goes on the edge
  (e.g. "charges Stripe on trial end").
- Map the main flows: entry points (routes, webhooks, pages, CLIs), scheduled jobs
  (crons/queues/workers), the agents, the models/tools they use, and the
  datastores/services they read and write.

## Output contract — write EXACTLY this shape to .foglamp/scan.json
{
  "version": 1,
  "project": {
    "name": "string (<=48)",
    "slug": "lowercase-dashed (<=48)",
    "tagline": "one line (<=80, optional)",
    "iconDomain": "favicon domain for the project, e.g. acme.com (optional)",
    "date": "YYYY-MM-DD"
  },
  "stats": { "agents": 0, "models": 0, "tools": 0, "integrations": 0 },
  "topModels":       [ { "id": "gpt-4o", "label": "GPT-4o", "domain": "openai.com" } ],
  "topTools":        [ { "id": "exa", "label": "Exa", "domain": "exa.ai" } ],
  "topIntegrations": [ { "id": "stripe", "label": "Stripe", "domain": "stripe.com" } ],
  "graph": {
    "nodes": [
      { "id": "chat", "label": "Dashboard chat", "kind": "entry", "sub": "/api/chat" },
      { "id": "agent", "label": "Support agent", "kind": "agent", "sub": "streamText",
        "sourceRef": "src/agents/support.ts:42",
        "detail": "Answers tickets with order lookups (<=200, optional)" },
      { "id": "gpt4o", "label": "GPT-4o", "kind": "model", "domain": "openai.com" },
      { "id": "billing", "label": "Billing service", "kind": "service",
        "sourceRef": "src/services/billing.ts" },
      { "id": "pg", "label": "Postgres", "kind": "store", "domain": "postgresql.org" }
    ],
    "edges": [
      { "from": "chat", "to": "agent", "kind": "triggers" },
      { "from": "agent", "to": "gpt4o", "kind": "calls" },
      { "from": "billing", "to": "pg", "kind": "writes", "label": "charges on trial end" }
    ]
  }
}

## Rules (these keep every scan consistent — do not break them)
- Caps: topModels <= 3, topTools <= 10, topIntegrations <= 10, graph.nodes <= 60,
  graph.edges <= 120. One map holds everything — AI flows AND business logic.
  Big maps are welcome (the viewer pans); aim for 20-40 nodes on a substantial
  codebase. Rich, not sparse — but every node must earn its place.
- Give every distinct agent its OWN node when there are <= 10 agents; only
  merge agents into one node when they are numerous and near-identical (then
  say so in sub, e.g. "12 near-identical scrapers"). Chain agents with
  agent->agent edges when one feeds the next.
- group (optional, <=24): tag related nodes with a shared group name — those
  nodes render as one labeled vertical stack. Group by feature/domain the way a
  team would say it ("Billing", "Ingestion", "Setup pipeline"), not by file
  layout. Use 2-3 groups of 3-6 nodes; leave hub-and-spoke nodes ungrouped.
- Node labels <= 28 chars, sub <= 40, edge labels <= 24.
- kind is one of: entry (trigger/route/page/CLI), cron (scheduled job), agent,
  model, tool, service (internal business-logic module/pipeline the project
  owns), store (DB/cache/index), external (3rd-party API).
- Edge kind (optional): "calls" | "reads" | "writes" | "triggers" — what the
  connection does. Prefer setting it; it's shown quietly (revealed when a flow
  is traced). Add a label only when a specific phrase says more (e.g. "charges
  on trial end" — put the business logic on edges); labels are always visible.
- domain is a favicon domain with no scheme (openai.com, anthropic.com, exa.ai,
  clickhouse.com). Add it to anything a recognizable company/product owns; omit it
  for purely internal nodes (entries, crons, services, internal tools). Use the
  product domain for models (gemini.google.com for Gemini, claude.ai for Claude).
- detail (optional, <=200) is shown when a node is clicked — one sentence of
  what it does. sourceRef (optional, <=120) is the repo path (plus :line) where
  the node lives, e.g. "src/agents/support.ts:42" — add it to internal nodes so
  teammates can jump to code.
- Every edge's from/to must reference an existing node id; ids unique.
- Use today's date for project.date.

## Publish
First run (no .foglamp/scan.lock.json):
  curl -sS -X POST https://api.foglamp.dev/scan \
    -H 'content-type: application/json' --data @.foglamp/scan.json

Update run (a .foglamp/scan.lock.json exists) — keep the same URL:
  jq -n --slurpfile d .foglamp/scan.json \
        --arg t "$(jq -r .editToken .foglamp/scan.lock.json)" \
        '{data: $d[0], editToken: $t}' \
  | curl -sS -X POST https://api.foglamp.dev/scan \
      -H 'content-type: application/json' --data @-

The response is JSON: { "slug", "url", "editToken", "expiresAt" }. Save it to
.foglamp/scan.lock.json, then open url. On a 422 error, fix .foglamp/scan.json
to satisfy the rules and retry.


## fractal templates

### code
code. build. vibe.
creation through language and syntax. building new things from the ground-up. languages, frameworks, tools. to code is to build at the level of logic and reality itself. 

### notes
store. read. grow.
the human need to organize and document, to put things in order in a universe given to entropy. managing information and flow, pursuing the design of efficiency and archive.

### design
craft. design. delight.
where the creator and created meet the receiver. ui and ux, semantic principles, accessibility, and of course - the pursuit of beauty. color, component and css as the tools.

### agent
chat. prompt. harness.
humanity greatest technology yet, a super power in the hands of true creators and builders. a world of artifical intelligence presence, integrated into the being of humanity.

### web
see. store. learn.
the world wide web. this is how humanity scaffolded itself to a higher plane. a place for curation and collection - gathering and consuming inspiration with hunger.

### media
image. video. gallery.
creation is a holistic act, and the visual completes the circle. curation of galleries, media libraries, image archives. organizing and sorting visual information with the mind of a logical creator.

### docs
app. user. docs.
the pinnacle of the notes journey, where information becomes crystalline learnings as reference for all. order, progress, efficiency, everything is proper and in its place. a utopia of human efficiency.

### dev
plan. do. review.
the creator's long hours of creating in solitude. bugs, mistakes, discarded creations. where builders give offering to the god of creation. from these dark nights do true madness and creation emerge.

## app shell

### basic app wrapper can be:

```svelte
<div class="app-shell">
	<header></header>
	<main>

	</main>
	<footer></footer>
</div>

<!--the appshell is set to width 100vw, height 100vh and overflow: hidden-->
<!--header, main, footer have width 100%-->
<!--the header height will have few different values depending on app state - 48px 64px 128px (we might change these values later-->
<!--footer is 32px-->
<!--main takes up 100% of the space in-between-->
```

### layout variations

the most of the app lives inside `<main>`
there can be plan for a few different layouts, depending on app state.

1. 3 surface states
	- left sidebar, central area, right sidebar
	- left sidebar, left 2 sidebar, main area
	- sidebars to always be collapsible and resizable

2. 3 surface states with terminal surface - these are layouts where additionally a terminal window is also a surface
	- default terminal layout is inside central area, collapsed by default, height resizable by drag
	- termianl can also be moved to either of the sidebars instead. 

3. 4 surface states
	- two left sidebars, central area, right sidebar
	- left sidebar, central area, two right sidebars
	- sidebars always collapsible
	- optional collapsible terminal, default in central area but can be moved to any sidebar

4. 3 surface states with nested state inside right sidebar
	- regular 3 surface state, but, the right sidebar has its own collapsible nesting of a sidebar -> the fourth surface nested inside the 3rd surface

there are some good options in shadcn for app shell blocks of this kind. but shadcn requires tailwind, and i dont want to use tailwind.
another good thing about the shells is a well planned layout change handling, consistent look, smart persisting, and the use of a  well integration transitions and motion language. items collapse and expand with transition, dropdowns and popovers also work with that.

In sveltekit, this could be done via svelte's own transitions and animations, but i dont mind using a motion library like svelte motion - https://motion.svelte.page/, if that make it easier and better.

shadcn itself uses bits ui, which we have in our app.
we dont have to use bits ui if its not needed, but if it helps we can use that to build these app shells.

i have listed more shell state variations than we actually use. currently the app has:
1. regular 3 surface state of left sidebar, central area, right sidebar
2. one 4 surface state - left sidebar1, left sidebar2, central area, right sidebar
3. and terminal in both those states

but some modularity and flexibility will help and give us options for future scaling. 

background colors and borders are not fixed - they will change state to state.

### some other things to consider

1. with a overall shared state family, some general layout state persistence, change handling etc can centrally organized, and removed from the individual state.svelte.ts files of each module. the state files of a module can then focus on the functionalities and features of that module, while layout is managed by the app.
2. there can be fixed buttons for sidebar collapse/expand -> we can do this if layout is centrally managed
3. will also be easier to manage the save buttons and other buttons.  depending on app state, on which module is active, header can accordingly show either save file/folder, save image, save note, etc.
.... and may more benefits?

tell me you views on all of this. and tell me:
1. can you plan and implement this, creating an app shell that manages this?
IMPORTANT 2. can you build in good state/view transitions etc.? For example, when the sidebar collapses and expands at application shell 6 here - https://www.shadcnblocks.com/block/application-shell6. 