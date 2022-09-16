import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class HoverinputService {
	private receivers = new WeakMap<HTMLElement, EventEmitter<number>>();

	private mouseX = 0;
	private mouseY = 0;

	constructor() {
		document.addEventListener('mousemove', this.handleMousemove, { passive: true });
		document.addEventListener('keydown', this.handleKeydown);
	}

	addReceiver(element: HTMLElement, eventEmitter: EventEmitter<number>) {
		this.receivers.set(element, eventEmitter);
	}

	removeReceiver(element: HTMLElement) {
		this.receivers.delete(element);
	}

	private handleMousemove = (event: MouseEvent) => {
		this.mouseX = event.clientX;
		this.mouseY = event.clientY;
	};

	private handleKeydown = (event: KeyboardEvent) => {
		if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;

		const value = event.key === 'm' ? Number.MAX_SAFE_INTEGER : parseInt(event.key, 10);

		if (isNaN(value)) return;

		const element = this.findClosestReceiver(document.elementFromPoint(this.mouseX, this.mouseY) as HTMLElement);
		if (element != null) {
			event.preventDefault();
			this.receivers.get(element)?.emit(value);
		}
	};

	private findClosestReceiver(element: HTMLElement): HTMLElement | null {
		do {
			if (this.receivers.has(element)) {
				return element;
			}
			element = element.parentElement;
		} while (element != null);

		return null;
	}
}
