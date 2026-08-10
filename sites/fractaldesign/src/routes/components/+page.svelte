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

<div class="row h100 min-h-0 surface text-sm">
  <!-- Sidebar -->
  <aside class="box width260 minw260 bdr-right surface">
    <div class="row ycenter xbetween pad12 bdr-bottom">
      <h2 class="eyebrow">Components</h2>
      <span class="chip">{data.components.length}</span>
    </div>
    <div class="box pad8">
      <div class="row ycenter gap8 pad8 radius6 bdr surface">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-muted"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input
          type="text"
          placeholder="Search components…"
          bind:value={search}
          aria-label="Search components"
          class="w100 blank text-xs"
        />
      </div>
    </div>
    <nav class="box grow pad8 gap2">
      {#each filtered as comp}
        <button
          class="row ycenter xleft pad8 radius6 text-xs trans-std {comp.name === selected ? 'panel bold coltheme' : 'button-quiet text-secondary'}"
          onclick={() => selectComponent(comp.name)}
          type="button"
        >
          {comp.name}
        </button>
      {/each}
      {#if filtered.length === 0}
        <p class="pad16 ta-c text-xs text-muted">No components match "{search}"</p>
      {/if}
    </nav>
  </aside>

  <!-- Main Content -->
  <main class="box grow pad32">
    {#if selected}
      <header class="row ycenter gap12 marginbot24">
        <h1 class="display text-2xl bold text-primary">{selected}</h1>
        <span class="text-xs font-mono text-muted">{data.sourceFile}</span>
      </header>

      <!-- Demo Area -->
      <section class="box marginbot32">
        <h3 class="eyebrow marginbot12">Preview</h3>
        <div class="row ycenter xcenter wrap gap12 pad32 radius12 panel surface minh128">
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
                <div class="w100">
                  <Comp />
                </div>
              {:else if selected === 'Loader'}
                <Comp size={24} />
              {:else if selected === 'Queue'}
                <Comp position={2} total={5} />
              {:else if selected === 'Badge'}
                <Comp>New</Comp>
              {:else if selected === 'Button'}
                <div class="row wrap gap8 ycenter">
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
                    <div class="w100 h100 row ycenter xcenter surface text-muted text-sm">16:9</div>
                  </Comp>
                </div>
              {:else if selected === 'ButtonGroup'}
                <Comp orientation="horizontal">
                  <button class="button">Left</button>
                  <button class="button">Center</button>
                  <button class="button">Right</button>
                </Comp>
              {:else}
                <Comp />
              {/if}
            {:else}
              <div class="row ycenter xcenter">
                <span class="text-sm text-muted">Loading...</span>
              </div>
            {/if}
          {/key}
        </div>
      </section>

      <!-- Source Code -->
      <section class="box radius12 panel surface">
        <div class="row ycenter xbetween pad12 bdr-bottom surface">
          <h3 class="eyebrow">Source</h3>
          <div class="row ycenter gap12">
            <span class="text-xs font-mono text-muted">{data.sourceFile}</span>
            <button class="button-quiet text-xs row ycenter gap4" onclick={copySource} aria-label={copied ? 'Copied' : 'Copy source'}>
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
        <div class="box maxh448 pad16">
          <pre class="font-mono text-xs text-primary"><code>{data.source}</code></pre>
        </div>
      </section>
    {:else}
      <div class="row ycenter xcenter grow text-muted text-sm">
        <p>Select a component from the sidebar.</p>
      </div>
    {/if}
  </main>
</div>
