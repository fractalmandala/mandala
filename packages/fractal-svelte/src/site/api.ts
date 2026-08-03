import type { PropDef } from './PropsTable.svelte';

export const api: Record<string, PropDef[]> = {
	button: [
		{
			name: 'variant',
			type: "'primary' | 'secondary' | 'ghost' | 'outline'",
			default: "'primary'",
			description: 'Sets the visual emphasis.'
		},
		{
			name: 'size',
			type: "'sm' | 'md' | 'lg' | 'icon'",
			default: "'md'",
			description: 'Sets the control size.'
		},
		{
			name: 'pressScale',
			type: 'number',
			default: '0.96',
			description: 'Controls press feedback scale.'
		},
		{
			name: 'disabled',
			type: 'boolean',
			default: 'false',
			description: 'Prevents interaction.'
		}
	],
	tabs: [
		{
			name: 'tabs',
			type: 'Tab[]',
			default: 'required',
			description: 'Defines tab ids and labels.'
		},
		{ name: 'activeId', type: 'string', default: "''", description: 'Bindable active tab id.' },
		{
			name: 'variant',
			type: "'pill' | 'segment' | 'underline'",
			default: "'pill'",
			description: 'Sets the indicator treatment.'
		},
		{
			name: 'onchange',
			type: '(id: string) => void',
			default: 'undefined',
			description: 'Runs after selection changes.'
		}
	],
	switch: [
		{
			name: 'checked',
			type: 'boolean',
			default: 'false',
			description: 'Controls the switch state.'
		},
		{
			name: 'disabled',
			type: 'boolean',
			default: 'false',
			description: 'Prevents interaction.'
		},
		{
			name: 'onchange',
			type: '(checked: boolean) => void',
			default: 'undefined',
			description: 'Runs after the state changes.'
		}
	],
	input: [
		{
			name: 'value',
			type: 'string',
			default: 'undefined',
			description: 'Controls the input value.'
		},
		{
			name: 'defaultValue',
			type: 'string',
			default: "''",
			description: 'Sets the initial value.'
		},
		{
			name: 'label',
			type: 'string',
			default: 'undefined',
			description: 'Displays an input label.'
		},
		{
			name: 'error',
			type: 'string | boolean',
			default: 'false',
			description: 'Displays an error state.'
		},
		{
			name: 'success',
			type: 'boolean',
			default: 'false',
			description: 'Displays a success state.'
		}
	],
	checkbox: [
		{
			name: 'checked',
			type: 'boolean',
			default: 'false',
			description: 'Controls the checked state.'
		},
		{
			name: 'indeterminate',
			type: 'boolean',
			default: 'false',
			description: 'Displays the mixed state.'
		},
		{
			name: 'disabled',
			type: 'boolean',
			default: 'false',
			description: 'Prevents interaction.'
		},
		{
			name: 'onchange',
			type: '(checked: boolean) => void',
			default: 'undefined',
			description: 'Runs after the state changes.'
		}
	],
	radio: [
		{
			name: 'items',
			type: 'RadioItem[]',
			default: '[]',
			description: 'Defines the radio options.'
		},
		{
			name: 'value',
			type: 'string',
			default: 'undefined',
			description: 'Controls the selected value.'
		},
		{
			name: 'orientation',
			type: "'horizontal' | 'vertical'",
			default: "'vertical'",
			description: 'Controls the group orientation.'
		}
	],
	'animated-badge': [
		{
			name: 'status',
			type: "'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'loading'",
			default: "'neutral'",
			description: 'Sets the badge status.'
		},
		{ name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Sets the badge size.' },
		{
			name: 'pulse',
			type: 'boolean',
			default: 'false',
			description: 'Controls the pulse animation.'
		},
		{
			name: 'children',
			type: 'Snippet',
			default: 'undefined',
			description: 'Renders badge content.'
		}
	],
	number: [
		{
			name: 'value',
			type: 'number',
			default: 'required',
			description: 'Sets the target number.'
		},
		{
			name: 'duration',
			type: 'number',
			default: '1.2',
			description: 'Sets the animation duration.'
		},
		{
			name: 'prefix',
			type: 'string',
			default: "''",
			description: 'Adds text before the number.'
		},
		{
			name: 'suffix',
			type: 'string',
			default: "''",
			description: 'Adds text after the number.'
		},
		{
			name: 'decimals',
			type: 'number',
			default: '0',
			description: 'Sets displayed decimal places.'
		}
	],
	marquee: [
		{ name: 'speed', type: 'number', default: '30', description: 'Sets movement speed.' },
		{
			name: 'direction',
			type: "'left' | 'right' | 'up' | 'down'",
			default: "'left'",
			description: 'Sets movement direction.'
		},
		{
			name: 'pauseOnHover',
			type: 'boolean',
			default: 'true',
			description: 'Pauses movement on hover.'
		},
		{
			name: 'children',
			type: 'Snippet',
			default: 'undefined',
			description: 'Renders marquee content.'
		}
	],
	tooltip: [
		{
			name: 'content',
			type: 'string | Snippet',
			default: 'required',
			description: 'Sets tooltip content.'
		},
		{
			name: 'side',
			type: "'top' | 'right' | 'bottom' | 'left'",
			default: "'top'",
			description: 'Sets the preferred side.'
		},
		{ name: 'delay', type: 'number', default: '120', description: 'Sets the show delay.' },
		{
			name: 'children',
			type: 'Snippet',
			default: 'undefined',
			description: 'Renders trigger content.'
		}
	],
	loader: [
		{
			name: 'variant',
			type: 'LoaderVariant',
			default: "'spinner'",
			description: 'Selects the loading animation.'
		},
		{ name: 'size', type: 'number', default: '32', description: 'Sets loader size.' },
		{
			name: 'label',
			type: 'string',
			default: "'Loading'",
			description: 'Sets the accessible label.'
		}
	],
	'text-animation': [
		{
			name: 'text',
			type: 'string | string[]',
			default: "''",
			description: 'Sets the animated text.'
		},
		{
			name: 'variant',
			type: "'reveal' | 'shimmer' | 'cascade' | 'typewriter'",
			default: "'shimmer'",
			description: 'Selects the animation.'
		},
		{
			name: 'duration',
			type: 'number',
			default: '2.5',
			description: 'Sets animation duration.'
		}
	],
	'action-swap': [
		{
			name: 'items',
			type: 'ActionSwapItem[]',
			default: '[]',
			description: 'Defines the actions.'
		},
		{
			name: 'value',
			type: 'string',
			default: 'undefined',
			description: 'Controls the active item.'
		},
		{
			name: 'variant',
			type: 'ActionSwapVariant',
			default: "'secondary'",
			description: 'Sets the button variant.'
		},
		{
			name: 'onValueChange',
			type: '(value: string) => void',
			default: 'undefined',
			description: 'Runs after selection.'
		}
	],
	'theme-toggle': [
		{
			name: 'theme',
			type: "'light' | 'dark'",
			default: "'light'",
			description: 'Controls the current theme.'
		},
		{
			name: 'variant',
			type: 'ThemeVariant',
			default: "'rectangle'",
			description: 'Selects the transition style.'
		},
		{
			name: 'ontoggle',
			type: "(theme: 'light' | 'dark') => void",
			default: 'undefined',
			description: 'Runs after toggling.'
		}
	],
	'bouncy-accordion': [
		{
			name: 'items',
			type: 'BouncyAccordionItem[]',
			default: 'required',
			description: 'Defines accordion items.'
		},
		{
			name: 'value',
			type: 'string | null',
			default: 'undefined',
			description: 'Controls the open item.'
		},
		{
			name: 'defaultValue',
			type: 'string | null',
			default: 'null',
			description: 'Sets the initial open item.'
		}
	],
	'message-bubble': [
		{
			name: 'variant',
			type: "'solid' | 'soft' | 'tint' | 'outline' | 'ghost' | 'danger'",
			default: "'soft'",
			description: 'Sets the bubble treatment.'
		},
		{
			name: 'align',
			type: "'start' | 'end'",
			default: 'undefined',
			description: 'Sets bubble alignment.'
		},
		{
			name: 'children',
			type: 'Snippet',
			default: 'undefined',
			description: 'Renders bubble content.'
		}
	],
	message: [
		{
			name: 'from',
			type: "'user' | 'assistant'",
			default: "'assistant'",
			description: 'Identifies the message author.'
		},
		{
			name: 'animateIn',
			type: 'boolean',
			default: 'false',
			description: 'Enables entrance animation.'
		},
		{
			name: 'children',
			type: 'Snippet',
			default: 'undefined',
			description: 'Renders message content.'
		}
	],
	'message-scroller': [
		{
			name: 'followOutput',
			type: 'boolean',
			default: 'true',
			description: 'Keeps the viewport at the output end.'
		},
		{
			name: 'followThreshold',
			type: 'number',
			default: '56',
			description: 'Sets follow distance.'
		},
		{
			name: 'label',
			type: 'string',
			default: "'Conversation'",
			description: 'Sets the viewport label.'
		},
		{
			name: 'children',
			type: 'Snippet',
			default: 'undefined',
			description: 'Renders conversation content.'
		}
	],
	'prompt-input': [
		{
			name: 'value',
			type: 'string',
			default: 'undefined',
			description: 'Controls the prompt value.'
		},
		{
			name: 'models',
			type: 'PromptModel[]',
			default: '[]',
			description: 'Defines available models.'
		},
		{
			name: 'onSubmit',
			type: '(value: string) => void | Promise<void>',
			default: 'undefined',
			description: 'Runs on submit.'
		},
		{
			name: 'loading',
			type: 'boolean',
			default: 'false',
			description: 'Shows loading/stop state.'
		},
		{
			name: 'placeholder',
			type: 'string',
			default: "'Ask the agent to do something…'",
			description: 'Sets the placeholder.'
		}
	],
	'todo-list': [
		{
			name: 'items',
			type: 'TodoItem[]',
			default: 'required',
			description: 'Defines task items.'
		},
		{ name: 'title', type: 'string', default: "'To-dos'", description: 'Sets the list title.' },
		{
			name: 'defaultOpen',
			type: 'boolean',
			default: 'true',
			description: 'Sets initial visibility.'
		}
	],
	'approval-card': [
		{
			name: 'title',
			type: 'string',
			default: "'Approval required'",
			description: 'Sets the card title.'
		},
		{
			name: 'questions',
			type: 'ApprovalCardQuestion[]',
			default: '[]',
			description: 'Defines response questions.'
		},
		{
			name: 'status',
			type: 'ApprovalCardStatus',
			default: "'pending'",
			description: 'Sets the card status.'
		},
		{
			name: 'onApprove',
			type: '() => void',
			default: 'undefined',
			description: 'Runs when approved.'
		},
		{
			name: 'onReject',
			type: '() => void',
			default: 'undefined',
			description: 'Runs when rejected.'
		}
	],
	'file-diff': [
		{ name: 'file', type: 'string', default: 'required', description: 'Sets the file name.' },
		{
			name: 'lines',
			type: 'FileDiffLine[]',
			default: 'required',
			description: 'Defines diff lines.'
		},
		{
			name: 'status',
			type: "'streaming' | 'complete'",
			default: "'streaming'",
			description: 'Sets diff status.'
		},
		{
			name: 'defaultOpen',
			type: 'boolean',
			default: 'true',
			description: 'Sets initial visibility.'
		}
	],
	'streaming-response': [
		{
			name: 'children',
			type: 'Snippet',
			default: 'required',
			description: 'Renders response content.'
		},
		{
			name: 'status',
			type: 'StreamingResponseStatus',
			default: "'streaming'",
			description: 'Sets response status.'
		},
		{
			name: 'sources',
			type: 'CitationItem[]',
			default: '[]',
			description: 'Defines response citations.'
		},
		{
			name: 'showActions',
			type: 'boolean',
			default: 'true',
			description: 'Controls response actions.'
		}
	],
	'ai-sidebar': [
		{
			name: 'defaultItems',
			type: 'SidebarResource[]',
			default: '[]',
			description: 'Sets the initial resource tree.'
		},
		{
			name: 'activeId',
			type: 'string | null',
			default: 'undefined',
			description: 'Controls the active resource.'
		},
		{
			name: 'defaultExpandedIds',
			type: 'string[]',
			default: '[]',
			description: 'Sets initially expanded resources.'
		},
		{
			name: 'ariaLabel',
			type: 'string',
			default: "'Resources'",
			description: 'Sets the tree label.'
		}
	],
	'notification-stack': [
		{
			name: 'items',
			type: 'NotificationStackItem[]',
			default: 'required',
			description: 'Defines notifications.'
		},
		{
			name: 'defaultExpanded',
			type: 'boolean',
			default: 'false',
			description: 'Sets initial expansion.'
		},
		{
			name: 'onDismiss',
			type: '(item: NotificationStackItem) => void',
			default: 'undefined',
			description: 'Runs when dismissed.'
		},
		{
			name: 'maxVisible',
			type: 'number',
			default: '3',
			description: 'Sets visible notification count.'
		}
	],
	'expandable-action-bar': [
		{
			name: 'items',
			type: 'ExpandableActionBarItem[]',
			default: 'required',
			description: 'Defines action items.'
		},
		{
			name: 'defaultExpanded',
			type: 'boolean',
			default: 'false',
			description: 'Sets initial expansion.'
		},
		{
			name: 'activeId',
			type: 'string',
			default: 'undefined',
			description: 'Sets the active item.'
		},
		{
			name: 'onAction',
			type: '(item: ExpandableActionBarItem) => void',
			default: 'undefined',
			description: 'Runs when selected.'
		}
	],
	'overflow-actions': [
		{
			name: 'items',
			type: 'OverflowActionItem[]',
			default: 'required',
			description: 'Defines menu actions.'
		},
		{
			name: 'open',
			type: 'boolean',
			default: 'false',
			description: 'Controls menu visibility.'
		},
		{
			name: 'placement',
			type: "'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'",
			default: "'bottom-end'",
			description: 'Sets menu placement.'
		},
		{
			name: 'label',
			type: 'string',
			default: "'More actions'",
			description: 'Sets the trigger label.'
		}
	],
	'feedback-widget': [
		{
			name: 'onSubmit',
			type: '(data: FeedbackData) => void | Promise<void>',
			default: 'undefined',
			description: 'Handles submitted feedback.'
		},
		{
			name: 'position',
			type: "'bottom-right' | 'bottom-left'",
			default: "'bottom-right'",
			description: 'Sets widget position.'
		},
		{
			name: 'title',
			type: 'string',
			default: "'Help us improve'",
			description: 'Sets the feedback title.'
		}
	],
	'not-found': [
		{
			name: 'variant',
			type: 'NotFoundVariant',
			default: "'glitch'",
			description: 'Selects the not-found treatment.'
		},
		{ name: 'code', type: 'string', default: "'404'", description: 'Sets the displayed code.' },
		{
			name: 'title',
			type: 'string',
			default: "'Page not found'",
			description: 'Sets the page title.'
		},
		{ name: 'homeHref', type: 'string', default: "'/'", description: 'Sets the home link.' }
	]
};
