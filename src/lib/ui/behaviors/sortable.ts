import Sortable from 'sortablejs';
import type { Attachment } from 'svelte/attachments';

export function sortable(options: {
	handle?: string;
	onUpdate: (from: number, to: number) => void;
}): Attachment<HTMLElement> {
	/**
	 * Svelte renders each keyed `{#each}` item as a block of sibling nodes
	 * (comment anchor, element, text anchor) and reorders whole blocks by node
	 * range during reconciliation. SortableJS only moves the element, leaving
	 * the anchors behind, which would desynchronize the block boundaries and
	 * scramble the list once Svelte reconciles. So we capture the dragged
	 * item's trailing anchor at drag start, restore the element to its original
	 * block on drop, and let Svelte perform the actual reorder.
	 */
	return (node) => {
		let originalBlockEnd: ChildNode | null = null;

		const instance = Sortable.create(node, {
			handle: options.handle,
			animation: 0,
			swapThreshold: 1,
			forceFallback: true,
			fallbackOnBody: true,
			onStart: (event) => {
				originalBlockEnd = event.item.nextSibling;
			},
			onUpdate: (event) => {
				const { oldIndex, newIndex, item } = event;
				if (oldIndex != null) {
					// Revert SortableJS' DOM move (restores Svelte's block boundaries)…
					item.parentNode?.insertBefore(item, originalBlockEnd);
				}
				// …then let Svelte's keyed each reconciliation apply the new order.
				if (oldIndex != null && newIndex != null && oldIndex !== newIndex) {
					options.onUpdate(oldIndex, newIndex);
				}
			}
		});

		return () => instance.destroy();
	};
}
