import { Directive, ElementRef, EventEmitter, HostBinding, Input, OnDestroy, OnInit, Output } from '@angular/core';

import { HoverinputService } from './hoverinput.service';

@Directive({
	// eslint-disable-next-line @angular-eslint/directive-selector
	selector: '[hoverinput]',
})
export class HoverinputDirective implements OnInit, OnDestroy {
	@Output()
	hoverinput = new EventEmitter<number>();

	constructor(private readonly service: HoverinputService, private readonly elementRef: ElementRef<HTMLElement>) {}

	ngOnInit(): void {
		this.service.addReceiver(this.elementRef.nativeElement, this.hoverinput);
	}
	ngOnDestroy(): void {
		this.service.removeReceiver(this.elementRef.nativeElement);
	}
}
