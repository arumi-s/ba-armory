import Provider from './hover-input-provider.svelte';
import Trigger from './hover-input-trigger.svelte';

export { Provider, Trigger };
export { Provider as HoverInputProvider, Trigger as HoverInputTrigger };
export { HoverInputProviderState, HoverInputTriggerState } from './hover-input.svelte.js';
export type {
	HoverNumberHandler,
	HoverInputProviderProps,
	HoverInputTriggerProps,
	HoverInputTriggerSnippetProps,
	HoverInputTriggerOpts
} from './hover-input.svelte.js';
