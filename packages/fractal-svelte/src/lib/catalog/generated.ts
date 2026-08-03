import type { CatalogCategory, CatalogEntry } from './types.js';

export const categories = [
	{
		slug: 'motion',
		name: 'Motion',
		description: 'Spring-animated Svelte primitives for responsive, accessible interfaces.'
	},
	{
		slug: 'agents',
		name: 'Agents',
		description: 'Svelte components for conversational, tool-driven, and agentic interfaces.'
	},
	{
		slug: 'blocks',
		name: 'Blocks',
		description: 'Composable Svelte product patterns ready for application workflows.'
	}
] as const satisfies readonly CatalogCategory[];

export const catalog = [
	{
		slug: 'tilt-card',
		name: 'Tilt Card',
		description: '3D perspective tilt on hover with cursor-tracked glare.',
		category: 'motion',
		status: 'planned',
		componentPath: 'motion/tilt-card',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'button',
		name: 'Button',
		description:
			'Spring-pressed Button plus StatefulButton (idle → loading → success / error) and MagneticButton.',
		category: 'motion',
		status: 'ready',
		componentPath: 'motion/button',
		exportPath: './button',
		files: [
			'src/lib/components/motion/button/button.sass',
			'src/lib/components/motion/button/button.svelte',
			'src/lib/components/motion/button/index.ts',
			'src/lib/components/motion/button/magnetic-button.svelte',
			'src/lib/components/motion/button/stateful-button.svelte',
			'src/lib/ease.ts',
			'src/lib/motion/use-hover-capable.svelte.ts'
		],
		dependencies: ['svelte', '@humanspeak/svelte-motion']
	},
	{
		slug: 'expanding-arrow-button',
		name: 'Animated CTA Buttons',
		description:
			'Expressive call-to-action buttons with expanding, hold, and slide interactions.',
		category: 'motion',
		status: 'planned',
		componentPath: 'motion/expanding-arrow-button',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'marquee',
		name: 'Marquee',
		description: 'Infinite horizontal or vertical scroll with pause-on-hover.',
		category: 'motion',
		status: 'ready',
		componentPath: 'motion/marquee',
		exportPath: './marquee',
		files: [
			'src/lib/components/motion/marquee/index.ts',
			'src/lib/components/motion/marquee/marquee.sass',
			'src/lib/components/motion/marquee/marquee.svelte'
		],
		dependencies: ['svelte']
	},
	{
		slug: 'tabs',
		name: 'Tabs',
		description: 'Pill, segment or underline tabs with a spring layoutId indicator.',
		category: 'motion',
		status: 'ready',
		componentPath: 'motion/tabs',
		exportPath: './tabs',
		files: [
			'src/lib/components/motion/tabs/index.ts',
			'src/lib/components/motion/tabs/tabs.sass',
			'src/lib/components/motion/tabs/tabs.svelte',
			'src/lib/ease.ts'
		],
		dependencies: ['svelte', '@humanspeak/svelte-motion']
	},
	{
		slug: 'switch',
		name: 'Switch',
		description: 'Toggle with a spring-driven thumb and press feedback.',
		category: 'motion',
		status: 'ready',
		componentPath: 'motion/switch',
		exportPath: './switch',
		files: [
			'src/lib/components/motion/switch/index.ts',
			'src/lib/components/motion/switch/switch.sass',
			'src/lib/components/motion/switch/switch.svelte'
		],
		dependencies: ['svelte', '@humanspeak/svelte-motion']
	},
	{
		slug: 'input',
		name: 'Input',
		description: 'Text input with label, left/right icons, error shake and success check draw.',
		category: 'motion',
		status: 'ready',
		componentPath: 'motion/input',
		exportPath: './input',
		files: [
			'src/lib/components/motion/input/index.ts',
			'src/lib/components/motion/input/input.sass',
			'src/lib/components/motion/input/input.svelte'
		],
		dependencies: ['svelte', '@humanspeak/svelte-motion']
	},
	{
		slug: 'select',
		name: 'Select',
		description:
			'Composable select primitives whose panel bouncily unfolds out of the trigger and separates, plus a Morph variant where the trigger grows into the panel via shared layout.',
		category: 'motion',
		status: 'planned',
		componentPath: 'motion/select',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'checkbox',
		name: 'Checkbox',
		description:
			'Form choice control with a draw-on checkmark, spring press feedback and indeterminate state support.',
		category: 'motion',
		status: 'ready',
		componentPath: 'motion/checkbox',
		exportPath: './checkbox',
		files: [
			'src/lib/components/motion/checkbox/checkbox.sass',
			'src/lib/components/motion/checkbox/checkbox.svelte',
			'src/lib/components/motion/checkbox/index.ts'
		],
		dependencies: ['svelte', '@humanspeak/svelte-motion']
	},
	{
		slug: 'radio',
		name: 'Radio Group',
		description:
			'Single-select choice control with a gliding layoutId indicator dot and spring press feedback.',
		category: 'motion',
		status: 'ready',
		componentPath: 'motion/radio',
		exportPath: './radio',
		files: [
			'src/lib/components/motion/radio/index.ts',
			'src/lib/components/motion/radio/radio.sass',
			'src/lib/components/motion/radio/radio.svelte',
			'src/lib/ease.ts'
		],
		dependencies: ['svelte', '@humanspeak/svelte-motion']
	},
	{
		slug: 'bottom-sheet',
		name: 'Bottom Sheet',
		description:
			'Vaul-inspired draggable bottom sheet with snap points, inertia and glass surface.',
		category: 'motion',
		status: 'planned',
		componentPath: 'motion/bottom-sheet',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'pull-to-refresh',
		name: 'Pull to Refresh',
		description:
			'Native-feeling pull-to-refresh container with drag resistance, threshold feedback and async refresh handling.',
		category: 'motion',
		status: 'planned',
		componentPath: 'motion/pull-to-refresh',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'shared-layout-bg',
		name: 'Shared Layout Background',
		description:
			'A pill that glides between hovered items via shared shared layout, with blur enter/exit.',
		category: 'motion',
		status: 'planned',
		componentPath: 'motion/shared-layout-bg',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'bounce-sidebar',
		name: 'Bounce Sidebar',
		description:
			'A vertical sidebar whose active dot jumps between destinations on a curved, spring-loaded path.',
		category: 'motion',
		status: 'planned',
		componentPath: 'motion/bounce-sidebar',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'animated-sidebar',
		name: 'Animated Sidebar',
		description:
			'A composable application sidebar with morphing nested navigation that folds into an animated icon rail on desktop and becomes a focus-managed sheet on mobile.',
		category: 'motion',
		status: 'planned',
		componentPath: 'motion/animated-sidebar',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'preview-rail',
		name: 'Preview Rail',
		description:
			'Codex app-inspired navigation rail with compact ticks that form a hover pyramid and reveal a floating destination preview.',
		category: 'motion',
		status: 'planned',
		componentPath: 'motion/preview-rail',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'dock',
		name: 'Dock',
		description: 'macOS-style dock with grouped actions and a gliding active pill.',
		category: 'motion',
		status: 'planned',
		componentPath: 'motion/dock',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'tooltip',
		name: 'Tooltip',
		description: 'Hover or focus tooltip with blur enter/exit and spring spawn.',
		category: 'motion',
		status: 'ready',
		componentPath: 'motion/tooltip',
		exportPath: './tooltip',
		files: [
			'src/lib/components/motion/tooltip/index.ts',
			'src/lib/components/motion/tooltip/tooltip.sass',
			'src/lib/components/motion/tooltip/tooltip.svelte'
		],
		dependencies: ['svelte', '@humanspeak/svelte-motion']
	},
	{
		slug: 'context-menu',
		name: 'Animated Context Menu',
		description:
			'Composable context-menu primitives with a pointer-origin clip morph, a gliding active row, checkbox and radio choices, keyboard navigation, typeahead, and long-press support.',
		category: 'motion',
		status: 'planned',
		componentPath: 'motion/context-menu',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'popover',
		name: 'Popover',
		description:
			'Gooey popover whose panel oozes out of the trigger through an SVG goo filter — a liquid neck that stretches and pinches — with crisp content fading in on top, plus a Morph variant that clip-morphs open from the trigger corner. Click or hover trigger, controlled or uncontrolled.',
		category: 'motion',
		status: 'planned',
		componentPath: 'motion/popover',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'morphing-modal',
		name: 'Morphing Modal',
		description:
			'Family-app-style modal. A single panel that morphs its height as you navigate between inner views, with blur cross-fade on content.',
		category: 'motion',
		status: 'planned',
		componentPath: 'motion/morphing-modal',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'center-morph-modal',
		name: 'Center Morph Modal',
		description:
			'A composable modal whose full-size surface unfolds from its exact center toward every edge, then folds back the same way with an inset close control.',
		category: 'motion',
		status: 'planned',
		componentPath: 'motion/center-morph-modal',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'text-animation',
		name: 'Text Animation',
		description:
			'Animated text primitives for spring reveals, chromatic sweeps, shimmer loading states and letter-cascade swaps.',
		category: 'motion',
		status: 'ready',
		componentPath: 'motion/text-animation',
		exportPath: './text-animation',
		files: [
			'src/lib/components/motion/text-animation/index.ts',
			'src/lib/components/motion/text-animation/text-animation.sass',
			'src/lib/components/motion/text-animation/text-animation.svelte'
		],
		dependencies: ['svelte', '@humanspeak/svelte-motion']
	},
	{
		slug: 'number',
		name: 'Number Animation',
		description: 'Animated number primitives for count-up values and rolling digit tickers.',
		category: 'motion',
		status: 'ready',
		componentPath: 'motion/number',
		exportPath: './number',
		files: [
			'src/lib/components/motion/number/index.ts',
			'src/lib/components/motion/number/number-ticker.svelte',
			'src/lib/components/motion/number/number.sass',
			'src/lib/components/motion/number/number.svelte'
		],
		dependencies: ['svelte', '@humanspeak/svelte-motion']
	},
	{
		slug: 'animated-badge',
		name: 'Animated Badge',
		description:
			'Status badge with animated state icons, pulse feedback and compact size variants.',
		category: 'motion',
		status: 'ready',
		componentPath: 'motion/animated-badge',
		exportPath: './animated-badge',
		files: [
			'src/lib/components/motion/animated-badge/animated-badge.sass',
			'src/lib/components/motion/animated-badge/animated-badge.svelte',
			'src/lib/components/motion/animated-badge/index.ts'
		],
		dependencies: ['svelte']
	},
	{
		slug: 'action-swap',
		name: 'Action Swap',
		description: 'CTA button and slot primitives for swapping text and icons with blur motion.',
		category: 'motion',
		status: 'ready',
		componentPath: 'blocks/action-swap',
		exportPath: './action-swap',
		files: [
			'src/lib/components/blocks/action-swap/action-swap.sass',
			'src/lib/components/blocks/action-swap/action-swap.svelte',
			'src/lib/components/blocks/action-swap/index.ts'
		],
		dependencies: ['svelte']
	},
	{
		slug: 'animated-toast-stack',
		name: 'Animated Toast Stack',
		description:
			'Stacked toasts with status morphs, swipe dismissal, actions and layout-aware motion.',
		category: 'motion',
		status: 'planned',
		componentPath: 'motion/animated-toast-stack',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'theme-toggle',
		name: 'Theme Toggle',
		description:
			'Theme toggle button that repaints the whole page through the View Transition API — a rectangle or circle clip-path reveal, or slats that open across the screen like a shutter.',
		category: 'motion',
		status: 'ready',
		componentPath: 'blocks/theme-toggle',
		exportPath: './theme-toggle',
		files: [
			'src/lib/components/blocks/theme-toggle/index.ts',
			'src/lib/components/blocks/theme-toggle/theme-toggle.sass',
			'src/lib/components/blocks/theme-toggle/theme-toggle.svelte'
		],
		dependencies: ['svelte']
	},
	{
		slug: 'bouncy-accordion',
		name: 'Bouncy Accordion',
		description:
			'Single-open accordion with weighted spring layout, icon rows and reduced-motion-safe content reveals.',
		category: 'motion',
		status: 'ready',
		componentPath: 'blocks/bouncy-accordion',
		exportPath: './bouncy-accordion',
		files: [
			'src/lib/components/blocks/bouncy-accordion/bouncy-accordion.sass',
			'src/lib/components/blocks/bouncy-accordion/bouncy-accordion.svelte',
			'src/lib/components/blocks/bouncy-accordion/index.ts'
		],
		dependencies: ['svelte']
	},
	{
		slug: 'drawer',
		name: 'Drawer',
		description:
			'Side panel that slides in from the left or right with a spring, backdrop blur, body scroll lock and esc-to-close.',
		category: 'motion',
		status: 'planned',
		componentPath: 'motion/drawer',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'scroll-animation',
		name: 'Scroll Animation',
		description:
			'Scroll-driven motion: a Lenis smooth-scroll provider and a reading-progress indicator that reads from it.',
		category: 'motion',
		status: 'planned',
		componentPath: 'motion/scroll-animation',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'range-slider',
		name: 'Range Slider',
		description:
			'Slider with tick dots and a vertical-bar thumb that bounces as it lands on each step. Drag or keyboard, reduced-motion safe.',
		category: 'motion',
		status: 'planned',
		componentPath: 'motion/range-slider',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'wheel-picker',
		name: 'Wheel Picker',
		description:
			'iOS-style picker wheel: a 3D drum on native momentum scroll that snaps to the nearest notch, with wheel, drag and keyboard control. Composes side by side for date and time pickers, reduced-motion safe.',
		category: 'motion',
		status: 'planned',
		componentPath: 'motion/wheel-picker',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'table',
		name: 'Table',
		description:
			'Virtualized data table that stays smooth at 10k+ rows, with sortable headers, row selection, column resize and reorder, and a sticky header. Minimal, reduced-motion-safe motion.',
		category: 'motion',
		status: 'planned',
		componentPath: 'motion/table',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'shader-background',
		name: 'Shader Background',
		description:
			'Canvas shader backgrounds (mesh gradient, grain, warp, waves, voronoi, dot orbit and more) with a single typed variant prop. Reduced-motion freezes animated variants.',
		category: 'motion',
		status: 'planned',
		componentPath: 'motion/shader-background',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'cylinder-carousel',
		name: 'Cylinder Carousel',
		description:
			'A carousel whose items line the inside of a cylinder, receding into the center and growing toward the edges. Drag, scroll or arrow-key to roll it, with a springy glide and snap. Reduced-motion drops the glide.',
		category: 'motion',
		status: 'planned',
		componentPath: 'motion/cylinder-carousel',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'loader',
		name: 'Loader',
		description:
			'Loading indicator with seventeen variants: spinner, dots, bars, dot-matrix, dither, morph, comet, scramble, metaballs, newton, helix, percent, and five terminal-style ascii spinners. Scales from one size prop, uses currentColor, and reduced-motion swaps every transform for a calm opacity pulse.',
		category: 'motion',
		status: 'ready',
		componentPath: 'motion/loader',
		exportPath: './loader',
		files: [
			'src/lib/components/motion/loader/index.ts',
			'src/lib/components/motion/loader/loader.sass',
			'src/lib/components/motion/loader/loader.svelte'
		],
		dependencies: ['svelte']
	},
	{
		slug: 'message-bubble',
		name: 'Message Bubble',
		description:
			'A focused conversational surface with visual tones, independent alignment, grouped messages, expandable content, and interactive link or button support.',
		category: 'agents',
		status: 'ready',
		componentPath: 'agents/message-bubble',
		exportPath: './message-bubble',
		files: [
			'src/lib/components/agents/message-bubble/index.ts',
			'src/lib/components/agents/message-bubble/message-bubble-collapsible.svelte',
			'src/lib/components/agents/message-bubble/message-bubble-content.svelte',
			'src/lib/components/agents/message-bubble/message-bubble-group.svelte',
			'src/lib/components/agents/message-bubble/message-bubble.sass',
			'src/lib/components/agents/message-bubble/message-bubble.svelte'
		],
		dependencies: ['svelte']
	},
	{
		slug: 'message',
		name: 'Message',
		description:
			'Composable conversation primitives for message rows, grouped bubbles, avatars, metadata, live markers, and a mount-only trailing-edge pop-up for newly sent rows.',
		category: 'agents',
		status: 'ready',
		componentPath: 'agents/message',
		exportPath: './message',
		files: [
			'src/lib/components/agents/message/index.ts',
			'src/lib/components/agents/message/message-avatar.svelte',
			'src/lib/components/agents/message/message-content.svelte',
			'src/lib/components/agents/message/message-footer.svelte',
			'src/lib/components/agents/message/message-group.svelte',
			'src/lib/components/agents/message/message-header.svelte',
			'src/lib/components/agents/message/message-marker.svelte',
			'src/lib/components/agents/message/message-typing.svelte',
			'src/lib/components/agents/message/message.sass',
			'src/lib/components/agents/message/message.svelte'
		],
		dependencies: ['svelte']
	},
	{
		slug: 'message-scroller',
		name: 'Message Scroller',
		description:
			'A reader-aware conversation viewport that follows streamed output at the live edge and releases control when the reader moves away.',
		category: 'agents',
		status: 'ready',
		componentPath: 'agents/message-scroller',
		exportPath: './message-scroller',
		files: [
			'src/lib/components/agents/message-scroller/index.ts',
			'src/lib/components/agents/message-scroller/message-scroller.sass',
			'src/lib/components/agents/message-scroller/message-scroller.svelte'
		],
		dependencies: ['svelte']
	},
	{
		slug: 'prompt-input',
		name: 'Prompt Input',
		description:
			'An auto-growing agent composer with prompt actions, model selection, keyboard submission, and animated send and stop states.',
		category: 'agents',
		status: 'ready',
		componentPath: 'agents/prompt-input',
		exportPath: './prompt-input',
		files: [
			'src/lib/components/agents/prompt-input/index.ts',
			'src/lib/components/agents/prompt-input/prompt-input.sass',
			'src/lib/components/agents/prompt-input/prompt-input.svelte'
		],
		dependencies: ['svelte']
	},
	{
		slug: 'todo-list',
		name: 'Todo List',
		description:
			'A collapsible agent task plan with morphing status marks, a completion count, compact metadata, and smooth list updates.',
		category: 'agents',
		status: 'ready',
		componentPath: 'agents/todo-list',
		exportPath: './todo-list',
		files: [
			'src/lib/components/agents/todo-list/index.ts',
			'src/lib/components/agents/todo-list/todo-list.sass',
			'src/lib/components/agents/todo-list/todo-list.svelte'
		],
		dependencies: ['svelte']
	},
	{
		slug: 'code-block',
		name: 'Code Block',
		description:
			'A syntax-highlighted code surface with stable streaming updates, line numbers, focused lines, smooth following, and copy feedback.',
		category: 'agents',
		status: 'planned',
		componentPath: 'agents/code-block',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'approval-card',
		name: 'Approval Card',
		description:
			'A human-in-the-loop decision surface for approvals, single or multiple-choice questions, custom responses, and multi-step review flows.',
		category: 'agents',
		status: 'ready',
		componentPath: 'agents/approval-card',
		exportPath: './approval-card',
		files: [
			'src/lib/components/agents/approval-card/approval-card.sass',
			'src/lib/components/agents/approval-card/approval-card.svelte',
			'src/lib/components/agents/approval-card/index.ts'
		],
		dependencies: ['svelte']
	},
	{
		slug: 'file-diff',
		name: 'File Diff',
		description:
			'A syntax-highlighted file change disclosure with progressive rows, line numbers, live change counts, smooth following, and completion collapse.',
		category: 'agents',
		status: 'ready',
		componentPath: 'agents/file-diff',
		exportPath: './file-diff',
		files: [
			'src/lib/components/agents/file-diff/file-diff.sass',
			'src/lib/components/agents/file-diff/file-diff.svelte',
			'src/lib/components/agents/file-diff/index.ts'
		],
		dependencies: ['svelte']
	},
	{
		slug: 'tool-result',
		name: 'Tool Result',
		description:
			'A lightweight execution disclosure for syntax-highlighted terminal output and request responses that collapses into a compact completed state.',
		category: 'agents',
		status: 'planned',
		componentPath: 'agents/tool-result',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'streaming-response',
		name: 'Streaming Response',
		description:
			'A stable response surface with completion actions, rendered content, and an expandable source summary.',
		category: 'agents',
		status: 'ready',
		componentPath: 'agents/streaming-response',
		exportPath: './streaming-response',
		files: [
			'src/lib/components/agents/streaming-response/index.ts',
			'src/lib/components/agents/streaming-response/streaming-response.sass',
			'src/lib/components/agents/streaming-response/streaming-response.svelte'
		],
		dependencies: ['svelte']
	},
	{
		slug: 'image-generation',
		name: 'Image Generation',
		description:
			'A stable generated-image surface that moves from queued work through progressive refinement to a completed result without layout shift.',
		category: 'agents',
		status: 'planned',
		componentPath: 'agents/image-generation',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'tool-approval',
		name: 'Tool Approval',
		description:
			'A human-in-the-loop permission card for reviewing tool details, allowing once, remembering access, or denying execution.',
		category: 'agents',
		status: 'planned',
		componentPath: 'agents/tool-approval',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'citations',
		name: 'Citations',
		description:
			'Inline citation markers paired with a collapsible, progressively rendered reference collection for grounded agent responses.',
		category: 'agents',
		status: 'planned',
		componentPath: 'agents/citations',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'agent-activity',
		name: 'Agent Activity',
		description:
			'One adaptive activity stream for reasoning, searches, tool calls, structured execution traces, or a chronological mix.',
		category: 'agents',
		status: 'planned',
		componentPath: 'agents/agent-activity',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'loading-states',
		name: 'Agent Loading States',
		description:
			'Three thoughtful loading states for AI interfaces: shimmering status text, live agent progress, and cycling reasoning phrases.',
		category: 'agents',
		status: 'planned',
		componentPath: 'agents/loading-states',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'ai-sidebar',
		name: 'AI Sidebar',
		description:
			'A collapsible AI workspace sidebar for folders, projects, files, and bookmarks with keyboard navigation, optimistic moves, inline rename, and overflow-aware labels.',
		category: 'agents',
		status: 'ready',
		componentPath: 'agents/ai-sidebar',
		exportPath: './ai-sidebar',
		files: [
			'src/lib/components/agents/ai-sidebar/ai-sidebar.sass',
			'src/lib/components/agents/ai-sidebar/ai-sidebar.svelte',
			'src/lib/components/agents/ai-sidebar/index.ts'
		],
		dependencies: ['svelte']
	},
	{
		slug: 'chat-app',
		name: 'Chat App',
		description:
			'A complete agent conversation workspace composing navigation, messages, streaming, planning, approvals, tools, code, diffs, generated media, sources, and prompt input.',
		category: 'agents',
		status: 'planned',
		componentPath: 'agents/chat-app',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'infinite-masonry',
		name: 'Infinite Masonry',
		description:
			'Responsive virtualized masonry that measures variable-height cards and loads more data as the user nears the end.',
		category: 'blocks',
		status: 'planned',
		componentPath: 'blocks/infinite-masonry',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'notification-stack',
		name: 'Notification Stack',
		description:
			'Compact notification cards that spring from a stacked summary into a readable list on hover, focus or tap.',
		category: 'blocks',
		status: 'ready',
		componentPath: 'blocks/notification-stack',
		exportPath: './notification-stack',
		files: [
			'src/lib/components/blocks/notification-stack/index.ts',
			'src/lib/components/blocks/notification-stack/notification-stack.sass',
			'src/lib/components/blocks/notification-stack/notification-stack.svelte'
		],
		dependencies: ['svelte']
	},
	{
		slug: 'knockout-bracket',
		name: 'Knockout Bracket',
		description:
			'Animated tournament fixtures in two styles: a knockout bracket that pages through rounds, and a wheel that wraps the same tree around the champion. Both read the same array of rounds, so one dataset draws either.',
		category: 'blocks',
		status: 'planned',
		componentPath: 'blocks/knockout-bracket',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'availability-scheduler',
		name: 'Availability Scheduler',
		description:
			'Weekly availability editor where each day springs between available and unavailable, time ranges add and remove with blur-slide motion, times pick from a scrollable dropdown, and a copy menu clones hours to other days.',
		category: 'blocks',
		status: 'planned',
		componentPath: 'blocks/availability-scheduler',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'swap',
		name: 'Multi-chain Swap',
		description:
			'Cross-chain swap widget with chain + token selectors, morphing views, animated flip and quote.',
		category: 'blocks',
		status: 'planned',
		componentPath: 'blocks/swap',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'dynamic-island',
		name: 'Dynamic Island',
		description:
			'iOS-style island pill that morphs between live activity views with bouncy shell resize and blur crossfades.',
		category: 'blocks',
		status: 'planned',
		componentPath: 'blocks/dynamic-island',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'command-palette',
		name: 'Command Palette',
		description: '⌘K palette with fuzzy filter, spring-animated active row and glass surface.',
		category: 'blocks',
		status: 'planned',
		componentPath: 'blocks/command-palette',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'expandable-action-bar',
		name: 'Expandable Action Bar',
		description:
			'Compact icon actions that expand into labeled controls on hover or focus with shared layout motion.',
		category: 'blocks',
		status: 'ready',
		componentPath: 'blocks/expandable-action-bar',
		exportPath: './expandable-action-bar',
		files: [
			'src/lib/components/blocks/expandable-action-bar/expandable-action-bar.sass',
			'src/lib/components/blocks/expandable-action-bar/expandable-action-bar.svelte',
			'src/lib/components/blocks/expandable-action-bar/index.ts'
		],
		dependencies: ['svelte']
	},
	{
		slug: 'overflow-actions',
		name: 'Overflow Actions',
		description:
			'Connected pill rail for primary actions that springs open to reveal extra controls.',
		category: 'blocks',
		status: 'ready',
		componentPath: 'blocks/overflow-actions',
		exportPath: './overflow-actions',
		files: [
			'src/lib/components/blocks/overflow-actions/index.ts',
			'src/lib/components/blocks/overflow-actions/overflow-actions.sass',
			'src/lib/components/blocks/overflow-actions/overflow-actions.svelte'
		],
		dependencies: ['svelte']
	},
	{
		slug: 'expandable-tabs',
		name: 'Expandable Tabs',
		description:
			'Icon tab bar where the active tab expands to a labelled pill, with a panel above that morphs height and slides content direction-aware on switch.',
		category: 'blocks',
		status: 'planned',
		componentPath: 'blocks/expandable-tabs',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'swipeable-list',
		name: 'Swipeable List',
		description:
			'Mobile-style list rows that swipe left or right to reveal contextual action buttons.',
		category: 'blocks',
		status: 'planned',
		componentPath: 'blocks/swipeable-list',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'file-upload',
		name: 'File Upload',
		description:
			'Two file upload patterns: an attachment workspace for mixed files, links, audio and media, plus a progress queue with retry and removal.',
		category: 'blocks',
		status: 'planned',
		componentPath: 'blocks/file-upload',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'prediction-market',
		name: 'Prediction Market',
		description:
			'Prediction market trade ticket with buy/sell modes, outcome prices, rolling amount entry, quick add chips and trade states.',
		category: 'blocks',
		status: 'planned',
		componentPath: 'blocks/prediction-market',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'wallet-card',
		name: 'Wallet Card',
		description:
			'Wallet overview card with an account switcher and search that morph open from their triggers, a cascading balance with a live change pill and privacy toggle, copy-address, and Send / Deposit / Swap / Buy actions.',
		category: 'blocks',
		status: 'planned',
		componentPath: 'blocks/wallet-card',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'otp-input',
		name: 'OTP Input',
		description:
			'One-time-code input with a gliding focus ring, digits that roll in per slot, error shake and a success check draw.',
		category: 'blocks',
		status: 'planned',
		componentPath: 'blocks/otp-input',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'bloom-menu',
		name: 'Bloom Menu',
		description:
			'A button that morphs open into a menu and blooms iris-out from the center, the grid revealing in every direction with radially staggered items.',
		category: 'blocks',
		status: 'planned',
		componentPath: 'blocks/bloom-menu',
		exportPath: null,
		files: [],
		dependencies: []
	},
	{
		slug: 'feedback-widget',
		name: 'Feedback Widget',
		description:
			'Corner trigger that morphs open into a feedback popup with message entry and animated sending, success and retry states.',
		category: 'blocks',
		status: 'ready',
		componentPath: 'blocks/feedback-widget',
		exportPath: './feedback-widget',
		files: [
			'src/lib/components/blocks/feedback-widget/feedback-widget.sass',
			'src/lib/components/blocks/feedback-widget/feedback-widget.svelte',
			'src/lib/components/blocks/feedback-widget/index.ts'
		],
		dependencies: ['svelte']
	},
	{
		slug: 'not-found',
		name: '404 / Not Found',
		description:
			'Animated 404 pages in five styles: glitch scramble, magnetic digits, cursor spotlight, a fanning card stack and a typed terminal.',
		category: 'blocks',
		status: 'ready',
		componentPath: 'blocks/not-found',
		exportPath: './not-found',
		files: [
			'src/lib/components/blocks/not-found/index.ts',
			'src/lib/components/blocks/not-found/not-found-glitch.svelte',
			'src/lib/components/blocks/not-found/not-found-magnetic.svelte',
			'src/lib/components/blocks/not-found/not-found-spotlight.svelte',
			'src/lib/components/blocks/not-found/not-found-stacked.svelte',
			'src/lib/components/blocks/not-found/not-found-terminal.svelte',
			'src/lib/components/blocks/not-found/not-found.sass',
			'src/lib/components/blocks/not-found/not-found.svelte'
		],
		dependencies: ['svelte']
	}
] as const satisfies readonly CatalogEntry[];
