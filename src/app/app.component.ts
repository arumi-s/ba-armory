import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '../environments/environment';
import { PreloadService } from './services/preload.service';

@Component({
	selector: 'ba-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.less'],
})
export class AppComponent implements OnInit {
	title = 'ba-armory';

	constructor(private readonly preloadService: PreloadService, iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
		iconRegistry.addSvgIconLiteral(
			'bullet_type',
			sanitizer.bypassSecurityTrustHtml(
				`<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6.92,5H5L14,14L15,13.06M19.96,19.12L19.12,19.96C18.73,20.35 18.1,20.35 17.71,19.96L14.59,16.84L11.91,19.5L10.5,18.09L11.92,16.67L3,7.75V3H7.75L16.67,11.92L18.09,10.5L19.5,11.91L16.83,14.58L19.95,17.7C20.35,18.1 20.35,18.73 19.96,19.12Z"/></svg>`
			)
		);
		iconRegistry.addSvgIconLiteral(
			'armor_type',
			sanitizer.bypassSecurityTrustHtml(
				`<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21,11C21,16.55 17.16,21.74 12,23C6.84,21.74 3,16.55 3,11V5L12,1L21,5V11M12,21C15.75,20 19,15.54 19,11.22V6.3L12,3.18V21Z"/></svg>`
			)
		);
	}

	ngOnInit(): void {
		if (environment.production) {
			document.addEventListener('contextmenu', (event) => {
				event.preventDefault();
			});
		}
	}

	handleClickSave() {
		this.preloadService.saveDeck();
	}
}
