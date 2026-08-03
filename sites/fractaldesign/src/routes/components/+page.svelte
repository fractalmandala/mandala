<script lang="ts">
  import { goto } from '$app/navigation';
  import type { Component } from 'svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let search = $state('');
  let Comp = $state<Component | null>(null);
  let copied = $state(false);

  const _allGlob = import.meta.glob('./*.svelte');
  const componentLoaders = Object.fromEntries(
    Object.entries(_allGlob).filter(([p]) => !p.startsWith('./+'))
  );

  let filtered = $derived(
    data.components.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase())
    )
  );

  let selected = $derived(data.selected);

  async function loadComponent(name: string) {
    const key = `./${name}.svelte`;
    const loader = componentLoaders[key];
    if (loader) {
      const mod = await loader();
      Comp = (mod as { default: Component }).default;
    }
  }

  $effect(() => {
    if (selected) {
      Comp = null;
      loadComponent(selected);
    }
  });

  function selectComponent(name: string) {
    goto(`/components?c=${name}`, { replaceState: true, keepFocus: true, noScroll: true });
  }

  async function copySource() {
    if (!data.source) return;
    try {
      await navigator.clipboard.writeText(data.source);
      copied = true;
      setTimeout(() => copied = false, 2000);
    } catch { /* fallback */ }
  }

  // Determine if component likely accepts children (by convention)
  const acceptsChildren = new Set([
    'Action', 'Actions', 'Alert', 'AlertTitle', 'AlertDescription', 'AlertAction',
    'AnnotationList', 'Artifact', 'ArtifactActions', 'ArtifactContent', 'ArtifactDescription',
    'ArtifactHeader', 'ArtifactTitle', 'Badge', 'Button', 'ButtonGroup', 'CanvasInspector',
    'Card', 'CardAction', 'CardContent', 'CardDescription', 'CardFooter', 'CardHeader', 'CardTitle',
    'Carousel', 'CarouselItem', 'CarouselNav',
    'ChainOfThought', 'ChainOfThoughtHeader', 'ChainOfThoughtStep',
    'Checkpoint', 'Code', 'CodeOverflow', 'CodePreview',
    'Collapsible', 'CollapsibleContent', 'CollapsibleTrigger',
    'Command', 'CommandEmpty', 'CommandGroup', 'CommandItem', 'CommandLoading',
    'ComponentRegistry', 'Confirmation', 'ConfirmationActions',
    'Context', 'ContextItem', 'Conversation',
    'DialogContent', 'DialogDescription', 'DialogFooter', 'DialogHeader', 'DialogTitle', 'DialogOverlay',
    'DropdownMenuContent', 'DropdownMenuItem', 'DropdownMenuLabel', 'DropdownMenuShortcut',
    'HoverCard', 'HoverCardContent',
    'InlineCitationCard', 'InlineCitationQuote', 'InlineCitationSource', 'InlineCitationText',
    'LeftSidebar', 'Message', 'MessageAction', 'MessageActions', 'MessageAttachments',
    'MessageContent', 'MessageToolbar', 'MessageBranch',
    'ModalDialog', 'ModelSelector', 'ModelSelectorItem',
    'PageTransitions', 'Plan', 'Popover', 'PopoverContent',
    'PromptInput', 'PromptInputHeader', 'PromptInputToolbar', 'PromptInputTools',
    'Reasoning', 'Response',
    'ScrollArea', 'ScrollSnap', 'Select', 'SelectContent', 'SelectGroup', 'SelectItem',
    'SheetContent', 'Sidebar', 'Skeleton',
    'Source', 'Sources', 'Suggestion', 'Suggestions',
    'Tabs', 'TabsContent', 'TabsList', 'TabsTrigger',
    'TagSelector', 'Task', 'TemplateDock', 'TextRevealAnimations',
    'Tool', 'Tooltip', 'TreeView', 'Workflow',
    'AdvancedButtons', 'AdvancedCards', 'AdvancedText', 'AdvancedTransitions',
  ]);

  const demoContent: Record<string, string> = {
    Button: 'Click me',
    Badge: 'v2.0.0',
    Alert: 'This is an alert message',
    AlertTitle: 'Heads up!',
    AlertDescription: 'Something noteworthy happened.',
    Card: 'Card content goes here',
    CardTitle: 'Card Title',
    CardDescription: 'A description of this card.',
    CardContent: 'Main card body content.',
    CardFooter: 'Footer content',
    Collapsible: 'Collapsible content',
    CollapsibleTrigger: 'Toggle',
    CollapsibleContent: 'Revealed content',
    Tooltip: 'Hover me',
    Popover: 'Popover trigger',
    PopoverContent: 'Popover body content',
    HoverCard: 'Hover me',
    HoverCardContent: 'Hover card details',
    Tabs: 'Tab content',
    TabsTrigger: 'Tab 1',
    TabsContent: 'Tab panel content',
    Suggestion: 'Example prompt',
    Suggestions: 'Suggestions area',
    DialogTitle: 'Dialog Title',
    DialogDescription: 'Dialog description text.',
    DialogContent: 'Dialog body content',
    DialogFooter: 'Dialog footer',
    SheetContent: 'Sheet panel content',
    Message: 'Message content',
    MessageContent: 'Hello, how can I help?',
    MessageAction: 'Copy',
    MessageActions: 'Actions area',
    Conversation: 'Conversation area',
    Artifact: 'Artifact content',
    ArtifactTitle: 'Artifact Title',
    ArtifactDescription: 'Artifact description',
    ArtifactContent: 'Artifact body',
    ArtifactHeader: 'Artifact header',
    ArtifactActions: 'Artifact actions',
    Code: 'const x = 42;',
    CodePreview: 'Preview content',
    CodeOverflow: 'Overflow content',
    ChainOfThought: 'Chain of thought',
    ChainOfThoughtHeader: 'Show reasoning',
    ChainOfThoughtStep: 'Step content',
    Carousel: 'Carousel items',
    CarouselItem: 'Slide content',
    CarouselNav: '',
    Context: 'Context area',
    ContextItem: 'Item 1',
    Select: '',
    SelectItem: 'Option 1',
    SelectGroup: 'Group label',
    Separator: '',
    Switch: '',
    Progress: '',
    Skeleton: '',
    Shimmer: '',
    Checkpoint: '',
    Image: '',
    Loader: '',
    Queue: '',
    Source: 'Source link',
    Sources: 'Sources area',
    Reasoning: 'Reasoning trace',
    Response: 'Response content',
    Task: 'Task description',
    Tool: 'Tool content',
    Plan: 'Plan content',
    Workflow: 'Workflow content',
    InlineCitation: 'source',
    InlineCitationText: 'cited text',
    InlineCitationQuote: 'Quoted text',
    InlineCitationSource: 'Source attribution',
    InlineCitationCard: 'Citation card',
    DropdownMenuItem: 'Menu item',
    DropdownMenuContent: 'Dropdown body',
    DropdownMenuLabel: 'Section Label',
    DropdownMenuShortcut: '⌘K',
    Command: 'Command content',
    CommandItem: 'Command item',
    CommandGroup: 'Group heading',
    CommandInput: 'Type a command...',
    CommandEmpty: 'No results.',
    CommandLoading: 'Loading...',
    CommandShortcut: '⌘K',
    CommandSeparator: '',
    Confirmation: 'Confirmation content',
    ConfirmationActions: 'Confirm actions',
    PromptInput: 'Prompt input',
    PromptInputHeader: 'Attachments',
    PromptInputToolbar: 'Toolbar',
    PromptInputTools: 'Tools',
    Sidebar: 'Sidebar content',
    ScrollArea: 'Scrollable content',
    ModalDialog: 'Dialog content',
    AdvancedButtons: 'Hover me',
    AdvancedCards: 'Card content',
    AdvancedText: 'Animated text',
    AdvancedTransitions: 'Transition content',
    PageTransitions: 'Page content',
    ScrollSnap: 'Snap item',
    TextRevealAnimations: 'Revealed text',
    TreeView: 'Tree view',
    AnnotationList: 'Annotation list',
    CanvasInspector: 'Inspector overlay',
    ComponentRegistry: 'Component registry',
    LeftSidebar: 'Left sidebar',
    TagSelector: 'Tag selector',
    TemplateDock: 'Template dock',
    OpenInChat: 'Open in Chat',
    ModelSelector: 'Model selector',
    ModelSelectorItem: 'Model name',
    AnimatedShinyText: '✨ Shiny text',
    AspectRatio: 'Aspect ratio',
    Input: '',
    Textarea: '',
    SelectTrigger: 'Select...',
    ButtonGroup: '',
    SheetOverlay: '',
    DialogOverlay: '',
    DropdownMenuSeparator: '',
    SelectSeparator: '',
    CodeCopyButton: '',
  };

  function hasChildren(name: string): boolean {
    return acceptsChildren.has(name);
  }

  function demoLabel(name: string): string {
    return demoContent[name] ?? name;
  }

</script>

<svelte:head>
  <title>{selected} — Components</title>
</svelte:head>

<div class="components-page">
  <!-- Sidebar -->
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2 class="sidebar-title">Components</h2>
      <span class="sidebar-count">{data.components.length}</span>
    </div>
    <div class="sidebar-search">
      <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <input
        type="text"
        placeholder="Search components…"
        bind:value={search}
        aria-label="Search components"
      />
    </div>
    <nav class="sidebar-list">
      {#each filtered as comp}
        <button
          class="sidebar-item"
          class:sidebar-item--active={comp.name === selected}
          onclick={() => selectComponent(comp.name)}
          type="button"
        >
          {comp.name}
        </button>
      {/each}
      {#if filtered.length === 0}
        <p class="sidebar-empty">No components match "{search}"</p>
      {/if}
    </nav>
  </aside>

  <!-- Main Content -->
  <main class="main">
    {#if selected}
      <header class="main-header">
        <h1 class="main-title">{selected}</h1>
        <span class="main-file">{data.sourceFile}</span>
      </header>

      <!-- Demo Area -->
      <section class="demo-section">
        <h3 class="section-label">Preview</h3>
        <div class="demo-area">
          {#key selected}
            {#if Comp}
              {#if hasChildren(selected)}
                <Comp>
                  {demoLabel(selected)}
                </Comp>
              {:else if selected === 'Input'}
                <Comp placeholder="Type something…" />
              {:else if selected === 'Textarea'}
                <Comp placeholder="Write something…" />
              {:else if selected === 'Select'}
                <Comp>
                  <option>Option 1</option>
                  <option>Option 2</option>
                </Comp>
              {:else if selected === 'Progress'}
                <Comp value={60} />
              {:else if selected === 'Switch'}
                <Comp checked={true} />
              {:else if selected === 'Shimmer'}
                <Comp width="12rem" height="1.5rem" />
              {:else if selected === 'Skeleton'}
                <Comp style="width:200px;height:20px" />
              {:else if selected === 'Separator'}
                <div style="width:100%">
                  <Comp />
                </div>
              {:else if selected === 'Loader'}
                <Comp size={24} />
              {:else if selected === 'Queue'}
                <Comp position={2} total={5} />
              {:else if selected === 'Badge'}
                <Comp>New</Comp>
              {:else if selected === 'Button'}
                <div style="display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center">
                  <Comp variant="default">Default</Comp>
                  <Comp variant="outline">Outline</Comp>
                  <Comp variant="secondary">Secondary</Comp>
                  <Comp variant="ghost">Ghost</Comp>
                  <Comp variant="destructive">Destructive</Comp>
                  <Comp variant="link">Link</Comp>
                </div>
              {:else if selected === 'Tooltip'}
                <Comp content="Tooltip text" side="top">Hover me</Comp>
              {:else if selected === 'InlineCitation'}
                <Comp host="example.com" href="#">source</Comp>
              {:else if selected === 'Checkpoint'}
                <Comp label="Save" />
              {:else if selected === 'Image'}
                <Comp src="https://placehold.co/400x200" alt="Placeholder" style="width:400px;max-width:100%" />
              {:else if selected === 'CodeCopyButton'}
                <Comp code="console.log('hi')" />
              {:else if selected === 'ModelSelectorItem'}
                <Comp name="GPT-4" selected={true} />
              {:else if selected === 'OpenInChat'}
                <Comp href="#" />
              {:else if selected === 'AspectRatio'}
                <div style="width:300px">
                  <Comp ratio="16/9">
                    <div style="background:hsl(214,32%,91%);width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:hsl(215,16%,47%);font-size:0.875rem">16:9</div>
                  </Comp>
                </div>
              {:else if selected === 'ButtonGroup'}
                <Comp orientation="horizontal">
                  <button class="bg-demo-btn">Left</button>
                  <button class="bg-demo-btn">Center</button>
                  <button class="bg-demo-btn">Right</button>
                </Comp>
              {:else}
                <Comp />
              {/if}
            {:else}
              <div class="demo-loading">
                <span class="loader"></span>
              </div>
            {/if}
          {/key}
        </div>
      </section>

      <!-- Source Code -->
      <section class="source-section">
        <div class="source-header">
          <h3 class="section-label">Source</h3>
          <div class="source-actions">
            <span class="source-filename">{data.sourceFile}</span>
            <button class="copy-btn" onclick={copySource} aria-label={copied ? 'Copied' : 'Copy source'}>
              {#if copied}
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Copied
              {:else}
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                Copy
              {/if}
            </button>
          </div>
        </div>
        <div class="source-code">
          <pre><code>{data.source}</code></pre>
        </div>
      </section>
    {:else}
      <div class="main-empty">
        <p>Select a component from the sidebar.</p>
      </div>
    {/if}
  </main>
</div>

<!-- Styles -->
<style lang="sass">
  .components-page
    display: flex
    height: calc(100vh - 3.5rem)
    overflow: hidden
    font-size: 0.875rem
    color: hsl(222 47% 11%)

    @media (prefers-color-scheme: dark)
      color: hsl(210 40% 98%)

  // ── Sidebar ──────────────────────────────────
  .sidebar
    width: 260px
    min-width: 260px
    display: flex
    flex-direction: column
    border-right: 1px solid hsl(214 32% 91%)
    background-color: hsl(0 0% 100%)

    @media (prefers-color-scheme: dark)
      background-color: hsl(222 47% 6%)
      border-right-color: hsl(217 33% 17%)

  .sidebar-header
    display: flex
    align-items: center
    justify-content: space-between
    padding: 0.75rem 1rem
    border-bottom: 1px solid hsl(214 32% 91%)

    @media (prefers-color-scheme: dark)
      border-bottom-color: hsl(217 33% 17%)

  .sidebar-title
    margin: 0
    font-size: 0.8125rem
    font-weight: 600
    letter-spacing: -0.01em

  .sidebar-count
    padding: 0.125rem 0.5rem
    border-radius: 9999px
    background-color: hsl(210 40% 96%)
    font-size: 0.6875rem
    font-weight: 500
    color: hsl(215 16% 47%)

    @media (prefers-color-scheme: dark)
      background-color: hsl(217 33% 17%)
      color: hsl(215 16% 65%)

  .sidebar-search
    position: relative
    padding: 0.5rem 0.75rem

    input
      width: 100%
      padding: 0.375rem 0.5rem 0.375rem 1.75rem
      border: 1px solid hsl(214 32% 91%)
      border-radius: 0.375rem
      background: transparent
      color: inherit
      font-size: 0.8125rem
      outline: none
      transition: border-color 150ms ease

      &::placeholder
        color: hsl(215 16% 65%)

      &:focus
        border-color: hsl(222 47% 11% / 0.5)

      @media (prefers-color-scheme: dark)
        border-color: hsl(217 33% 17%)
        &:focus
          border-color: hsl(210 40% 98% / 0.5)

    .search-icon
      position: absolute
      top: 50%
      left: calc(0.75rem + 0.5rem)
      transform: translateY(-50%)
      color: hsl(215 16% 47%)
      width: 0.875rem
      height: 0.875rem
      pointer-events: none

  .sidebar-list
    flex: 1
    overflow-y: auto
    padding: 0.25rem 0.5rem 0.5rem
    display: flex
    flex-direction: column
    gap: 0.0625rem

    &::-webkit-scrollbar
      width: 4px
    &::-webkit-scrollbar-thumb
      background-color: hsl(214 32% 91%)
      border-radius: 9999px

    @media (prefers-color-scheme: dark)
      &::-webkit-scrollbar-thumb
        background-color: hsl(217 33% 17%)

  .sidebar-item
    display: block
    width: 100%
    padding: 0.375rem 0.5rem
    border: 0
    border-radius: 0.375rem
    background: transparent
    color: hsl(215 16% 47%)
    font-size: 0.8125rem
    cursor: pointer
    text-align: left
    transition: background-color 100ms ease, color 100ms ease

    &:hover
      background-color: hsl(210 40% 96%)
      color: hsl(222 47% 11%)

    &--active
      background-color: hsl(222 47% 11%)
      color: hsl(0 0% 100%)
      font-weight: 500

      &:hover
        background-color: hsl(222 47% 15%)
        color: hsl(0 0% 100%)

    @media (prefers-color-scheme: dark)
      color: hsl(215 16% 65%)
      &:hover
        background-color: hsl(217 33% 17%)
        color: hsl(210 40% 98%)
      &--active
        background-color: hsl(210 40% 98%)
        color: hsl(222 47% 11%)
        &:hover
          background-color: hsl(210 40% 92%)
          color: hsl(222 47% 11%)

  .sidebar-empty
    padding: 1rem 0.5rem
    text-align: center
    font-size: 0.75rem
    color: hsl(215 16% 47%)

  // ── Main Content ─────────────────────────────
  .main
    flex: 1
    overflow-y: auto
    padding: 2rem

    &::-webkit-scrollbar
      width: 8px
    &::-webkit-scrollbar-thumb
      background-color: hsl(214 32% 91%)
      border-radius: 9999px

    @media (prefers-color-scheme: dark)
      &::-webkit-scrollbar-thumb
        background-color: hsl(217 33% 17%)

  .main-header
    display: flex
    align-items: baseline
    gap: 0.75rem
    margin-bottom: 1.5rem

  .main-title
    margin: 0
    font-size: 1.5rem
    font-weight: 700
    letter-spacing: -0.02em

  .main-file
    font-size: 0.75rem
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace
    color: hsl(215 16% 47%)

    @media (prefers-color-scheme: dark)
      color: hsl(215 16% 65%)

  .main-empty
    display: flex
    align-items: center
    justify-content: center
    height: 60vh
    color: hsl(215 16% 47%)
    font-size: 0.9375rem

  // ── Demo ─────────────────────────────────────
  .demo-section
    margin-bottom: 2rem

  .section-label
    margin: 0 0 0.75rem
    font-size: 0.75rem
    font-weight: 600
    text-transform: uppercase
    letter-spacing: 0.05em
    color: hsl(215 16% 47%)

    @media (prefers-color-scheme: dark)
      color: hsl(215 16% 65%)

  .demo-area
    display: flex
    flex-wrap: wrap
    align-items: center
    justify-content: center
    gap: 0.75rem
    padding: 2rem
    border: 1px solid hsl(214 32% 91%)
    border-radius: 0.75rem
    background-color: hsl(0 0% 100%)
    min-height: 8rem

    @media (prefers-color-scheme: dark)
      background-color: hsl(222 47% 6%)
      border-color: hsl(217 33% 17%)

  .demo-loading
    display: flex
    align-items: center
    justify-content: center

    .loader
      display: inline-block
      width: 1.25rem
      height: 1.25rem
      border: 2px solid hsl(214 32% 91%)
      border-top-color: hsl(222 47% 11%)
      border-radius: 50%
      animation: spin 0.6s linear infinite

      @keyframes spin
        to
          transform: rotate(360deg)

  // ── Source Code ──────────────────────────────
  .source-section
    border: 1px solid hsl(214 32% 91%)
    border-radius: 0.75rem
    overflow: hidden

    @media (prefers-color-scheme: dark)
      border-color: hsl(217 33% 17%)

  .source-header
    display: flex
    align-items: center
    justify-content: space-between
    padding: 0.625rem 1rem
    border-bottom: 1px solid hsl(214 32% 91%)
    background-color: hsl(210 40% 96% / 0.5)

    .section-label
      margin: 0

    @media (prefers-color-scheme: dark)
      background-color: hsl(217 33% 17%)
      border-bottom-color: hsl(217 33% 17%)

  .source-actions
    display: flex
    align-items: center
    gap: 0.75rem

  .source-filename
    font-size: 0.6875rem
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace
    color: hsl(215 16% 47%)

  .copy-btn
    display: inline-flex
    align-items: center
    gap: 0.25rem
    padding: 0.25rem 0.5rem
    border: 1px solid hsl(214 32% 91%)
    border-radius: 0.375rem
    background-color: hsl(0 0% 100%)
    color: hsl(215 16% 47%)
    font-size: 0.6875rem
    cursor: pointer
    transition: background-color 150ms ease, color 150ms ease

    &:hover
      background-color: hsl(210 40% 96%)
      color: hsl(222 47% 11%)

    > svg
      width: 0.875rem
      height: 0.875rem

    @media (prefers-color-scheme: dark)
      background-color: transparent
      border-color: hsl(217 33% 17%)
      color: hsl(215 16% 65%)
      &:hover
        background-color: hsl(217 33% 17%)
        color: hsl(210 40% 98%)

  .source-code
    max-height: 28rem
    overflow: auto
    background-color: hsl(210 40% 96% / 0.3)

    pre
      margin: 0
      padding: 1rem
      font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace
      font-size: 0.8125rem
      line-height: 1.6

    code
      white-space: pre
      word-break: normal
      color: hsl(222 47% 11%)

    @media (prefers-color-scheme: dark)
      background-color: hsl(222 47% 6% / 0.5)
      code
        color: hsl(210 40% 98%)
</style>
