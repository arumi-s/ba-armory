import type { Attachment } from 'svelte/attachments';
import { on } from 'svelte/events';

/** Select the full text of an <input>/<textarea> on event. */
export const selectOnEvent: (type: keyof HTMLElementEventMap) => Attachment<HTMLElement> =
	(type) => (node) => {
		return on(node, type, (event) => {
			if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
				event.target.select();
			}
		});
	};
