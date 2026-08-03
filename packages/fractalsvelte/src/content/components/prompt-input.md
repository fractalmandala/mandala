<script lang="ts">
	import * as PromptInput from '$lib/components/ai-elements/prompt-input/index.js';
	import type { Message, ChatStatus } from '$lib/components/ai-elements/prompt-input/index.js';
	import { Button } from '$lib/components/button/index.js';
	import Preview from '$lib/docs/Preview.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	let lastSubmit = $state<string>('');
	let status = $state<ChatStatus>('ready');
	type Mode = 'create-image' | 'thinking' | 'deep-research' | null;
	let mode = $state<Mode>(null);

	function handleSubmit(message: Message) {
		lastSubmit = message.text || `(${message.attachments.length} file(s))`;
		status = 'submitted';
		setTimeout(() => {
			status = 'streaming';
			setTimeout(() => {
				status = 'ready';
			}, 1200);
		}, 600);
	}

	function handleStop() {
		status = 'ready';
	}

	const rootProps: PropRow[] = [
		{
			name: 'onSubmit',
			type: '(message: Message, event: SubmitEvent) => void | Promise<void>',
			description: 'Called with text, files, and attachment metadata on submit.'
		},
		{
			name: 'clearOnSubmit',
			type: 'boolean',
			default: 'true',
			description: 'Clear text and attachments after a successful submit.'
		},
		{
			name: 'accept / multiple / maxFiles / maxFileSize',
			type: 'file constraints',
			description: 'Forwarded into the attachments controller and hidden file input.'
		},
		{
			name: 'globalDrop',
			type: 'boolean',
			description: 'Accept file drops on the whole document, not only the form.'
		},
		{
			name: 'onError / onFileAdd / onFileRemove',
			type: 'callbacks',
			description: 'Attachment validation and lifecycle hooks.'
		}
	];

	const submitProps: PropRow[] = [
		{
			name: 'status',
			type: '"ready" | "submitted" | "streaming" | "error"',
			default: '"ready"',
			description: 'Swaps icon and turns the control into Stop while generating.'
		},
		{
			name: 'onStop',
			type: '() => void',
			description: 'Fires when the user clicks Stop during submitted/streaming.'
		}
	];

	const codeInstall = `npm i fractalsvelte`;

	const usage = `<script lang="ts">
  import * as PromptInput from "fractalsvelte/ai-elements/prompt-input";
  import type { Message } from "fractalsvelte/ai-elements/prompt-input";

  function handleSubmit(message: Message) {
    console.log(message.text, message.files);
  }
<\/script>

<PromptInput.Root onSubmit={handleSubmit}>
  <PromptInput.Header>
    <PromptInput.Attachments />
  </PromptInput.Header>
  <PromptInput.Body>
    <PromptInput.Textarea placeholder="Ask anything…" />
  </PromptInput.Body>
  <PromptInput.Toolbar>
    <PromptInput.Tools>
      <PromptInput.ActionMenu>
        <PromptInput.ActionMenuTrigger />
        <PromptInput.ActionMenuContent>
          <PromptInput.ActionAddAttachments />
        </PromptInput.ActionMenuContent>
      </PromptInput.ActionMenu>
    </PromptInput.Tools>
    <PromptInput.Submit />
  </PromptInput.Toolbar>
</PromptInput.Root>`;

	const codeStatus = `<PromptInput.Submit status={status} onStop={handleStop} />`;

	const codeMenu = `<PromptInput.ActionMenu>
  <PromptInput.ActionMenuTrigger />
  <PromptInput.ActionMenuContent>
    <PromptInput.ActionAddAttachments />
    <PromptInput.ActionMenuItem onSelect={() => (mode = "thinking")}>
      Thinking
    </PromptInput.ActionMenuItem>
  </PromptInput.ActionMenuContent>
</PromptInput.ActionMenu>`;
</script>

{#snippet iconPlus()}
	<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
{/snippet}

{#snippet demoBasic()}
	<div class="box" style="gap: 0.75rem; width: 100%; max-width: 36rem; margin-inline: auto;">
		<PromptInput.Root onSubmit={handleSubmit}>
			<PromptInput.Header>
				<PromptInput.Attachments />
			</PromptInput.Header>
			<PromptInput.Body>
				<PromptInput.Textarea placeholder="Ask anything…" />
			</PromptInput.Body>
			<PromptInput.Toolbar>
				<PromptInput.Tools />
				<PromptInput.Submit status={status} onStop={handleStop} />
			</PromptInput.Toolbar>
		</PromptInput.Root>
		{#if lastSubmit}
			<p style="margin: 0; font-size: 0.8125rem; color: var(--muted-foreground);">
				Last submit: {lastSubmit}
			</p>
		{/if}
	</div>
{/snippet}

{#snippet demoActions()}
	<div class="box" style="gap: 0.75rem; width: 100%; max-width: 36rem; margin-inline: auto;">
		<PromptInput.Root onSubmit={handleSubmit} multiple accept="image/*,.pdf,.txt">
			<PromptInput.Header>
				<PromptInput.Attachments />
			</PromptInput.Header>
			<PromptInput.Body>
				<PromptInput.Textarea placeholder="Attach files from the + menu…" />
			</PromptInput.Body>
			<PromptInput.Toolbar>
				<PromptInput.Tools>
					<PromptInput.ActionMenu>
						<PromptInput.ActionMenuTrigger />
						<PromptInput.ActionMenuContent>
							<PromptInput.ActionAddAttachments />
							<PromptInput.ActionMenuItem onSelect={() => (mode = 'create-image')}>
								Create image
							</PromptInput.ActionMenuItem>
							<PromptInput.ActionMenuItem onSelect={() => (mode = 'thinking')}>
								Thinking
							</PromptInput.ActionMenuItem>
							<PromptInput.ActionMenuItem onSelect={() => (mode = 'deep-research')}>
								Deep research
							</PromptInput.ActionMenuItem>
						</PromptInput.ActionMenuContent>
					</PromptInput.ActionMenu>
					{#if mode === 'create-image'}
						<Button size="sm" variant="outline" onclick={() => (mode = null)}>Image</Button>
					{:else if mode === 'thinking'}
						<Button size="sm" variant="outline" onclick={() => (mode = null)}>Thinking</Button>
					{:else if mode === 'deep-research'}
						<Button size="sm" variant="outline" onclick={() => (mode = null)}>Deep research</Button>
					{/if}
				</PromptInput.Tools>
				<PromptInput.Submit status={status} onStop={handleStop} />
			</PromptInput.Toolbar>
		</PromptInput.Root>
	</div>
{/snippet}

{#snippet demoStatus()}
	<div class="box" style="gap: 0.75rem; width: 100%; max-width: 36rem; margin-inline: auto;">
		<div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
			<Button size="sm" variant={status === 'ready' ? 'default' : 'outline'} onclick={() => (status = 'ready')}>ready</Button>
			<Button size="sm" variant={status === 'submitted' ? 'default' : 'outline'} onclick={() => (status = 'submitted')}>submitted</Button>
			<Button size="sm" variant={status === 'streaming' ? 'default' : 'outline'} onclick={() => (status = 'streaming')}>streaming</Button>
			<Button size="sm" variant={status === 'error' ? 'default' : 'outline'} onclick={() => (status = 'error')}>error</Button>
		</div>
		<PromptInput.Root onSubmit={handleSubmit}>
			<PromptInput.Body>
				<PromptInput.Textarea placeholder="Try the status controls above…" />
			</PromptInput.Body>
			<PromptInput.Toolbar>
				<PromptInput.Tools />
				<PromptInput.Submit {status} onStop={handleStop} />
			</PromptInput.Toolbar>
		</PromptInput.Root>
	</div>
{/snippet}

{#snippet demoTools()}
	<div class="box" style="gap: 0.75rem; width: 100%; max-width: 36rem; margin-inline: auto;">
		<PromptInput.Root onSubmit={handleSubmit}>
			<PromptInput.Body>
				<PromptInput.Textarea placeholder="Custom tool buttons beside submit…" />
			</PromptInput.Body>
			<PromptInput.Toolbar>
				<PromptInput.Tools>
					<PromptInput.Button aria-label="Attach" onclick={() => {}}>
						<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
					</PromptInput.Button>
					<PromptInput.Button aria-label="Voice" onclick={() => {}}>
						<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
					</PromptInput.Button>
				</PromptInput.Tools>
				<PromptInput.Submit />
			</PromptInput.Toolbar>
		</PromptInput.Root>
	</div>
{/snippet}

<h1 class="doc-title">Prompt Input</h1>
<p class="doc-lede">
	Chat composer with attachments, drag-and-drop, Enter-to-send, action menus, and submit/stop status.
</p>

<Preview description="Composer with live submit feedback" code={usage}>
	{@render demoBasic()}
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/ai-elements/prompt-input/` into your project. UI deps: `button`, `textarea`, `dialog`, `dropdown-menu`, `tooltip`. Runtime: `runed`.

Layout order: **Header → Body → Toolbar**.

## Usage

<CodeBlock code={usage} lang="svelte" />

## Examples

<Examples
	items={[
		{
			title: 'Basic',
			demo: demoBasic,
			code: usage,
			description: 'Header attachments + body textarea + submit with status.'
		},
		{
			title: 'Action menu',
			demo: demoActions,
			code: codeMenu,
			description: 'Plus menu for attach + mode chips (image / thinking / research).'
		},
		{
			title: 'Submit status',
			demo: demoStatus,
			code: codeStatus,
			description: 'ready → submitted (spin) → streaming (stop) → error.'
		},
		{
			title: 'Custom tools',
			demo: demoTools,
			code: usage,
			description: 'PromptInput.Button tool row with attach and voice icons.'
		}
	]}
/>

## Props

### PromptInput (Root)

<PropsTable props={rootProps} />

### PromptInputSubmit

<PropsTable props={submitProps} />

`Header`, `Body`, `Toolbar`, and `Tools` are layout shells. `Attachments` reads attachment context and animates height. `ActionMenu*` wraps the dropdown menu; `ActionAddAttachments` opens the hidden file dialog.

## Theming

<div class="doc-table-wrap">

| Token | Used for |
| --- | --- |
| `--background` / `--border` | Composer shell |
| `--muted` / `--muted-foreground` | File chips, secondary text |
| `--foreground` | Attachment labels |
| `--radius` | Shell and attachment corners |

</div>
