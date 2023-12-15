import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { DomSanitizer, Meta, Title } from '@angular/platform-browser';

import { environment } from '../environments/environment';
import { ExportComponent } from './pages/export/export.component';
import { SettingComponent } from './pages/setting/setting.component';
import { DataService } from './services/data.service';
import { PreloadService } from './services/preload.service';

@Component({
	selector: 'ba-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.less'],
})
export class AppComponent implements OnInit {
	title = '';
	desc = '';
	action_export = '';
	action_setting = '';
	action_save = '';
	footer_1_start = '';
	footer_1_end = '';
	footer_2_start = '';
	footer_2_end = '';
	footer_3_start = '';
	footer_3_end = '';

	constructor(
		@Inject(DOCUMENT) document: Document,
		private readonly titleService: Title,
		private readonly metaService: Meta,
		private readonly preloadService: PreloadService,
		private readonly dataService: DataService,
		private readonly dialog: MatDialog,
		private readonly snackBar: MatSnackBar,
		iconRegistry: MatIconRegistry,
		sanitizer: DomSanitizer
	) {
		// i18n
		this.title = this.dataService.i18n.app_title;
		this.desc = this.dataService.i18n.app_desc;
		this.action_export = this.dataService.i18n.action_export;
		this.action_setting = this.dataService.i18n.action_setting;
		this.action_save = this.dataService.i18n.action_save;
		this.footer_1_start = this.dataService.i18n.footer_1_start;
		this.footer_1_end = this.dataService.i18n.footer_1_end;
		this.footer_2_start = this.dataService.i18n.footer_2_start;
		this.footer_2_end = this.dataService.i18n.footer_2_end;
		this.footer_3_start = this.dataService.i18n.footer_3_start;
		this.footer_3_end = this.dataService.i18n.footer_3_end;

		document.documentElement.lang =
			this.dataService.languageOptions.find((languageOption) => languageOption.id === this.dataService.language)?.code ?? 'en';
		this.titleService.setTitle(this.title);
		this.metaService.updateTag({ name: 'description', content: this.dataService.i18n.app_desc });

		iconRegistry.addSvgIconLiteral(
			'bullet_type',
			sanitizer.bypassSecurityTrustHtml(
				`<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><path d="m5 17 18 15-2 2L3 19l2-2z"/><path d="m4 30 6 5 5-7-5-4-6 6zM12 19l7 6 15-14-2-11-10 1-10 18z"/></svg>`
			)
		);
		iconRegistry.addSvgIconLiteral(
			'armor_type',
			sanitizer.bypassSecurityTrustHtml(
				`<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><path d="M33 7c0 24-6 26-15 29C9 33 3 29 3 7c6 0 15.19-7 15.19-7S27 7 33 7Zm-23 4.9V21c2 5 5 6 8 7.11C21 27 24 26 26 21v-9c-4 0-6-1-8-3.29C16 11 14 12 10 11.9Z"/></svg>`
			)
		);

		iconRegistry.addSvgIconLiteral(
			'terrain_Street',
			sanitizer.bypassSecurityTrustHtml(
				`<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56"><path d="M16 20V8h24v22h14v16H2V20Zm0 4H6v18h10Zm20-12H20v30h16Zm14 22H40v8h10Z"/><path d="M23.5 16h3v6h-3zM29.5 16h3v6h-3zM23.5 26h3v6h-3zM29.5 26h3v6h-3zM9.5 26h3v6h-3z"/></svg>`
			)
		);
		iconRegistry.addSvgIconLiteral(
			'terrain_Indoor',
			sanitizer.bypassSecurityTrustHtml(
				`<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56"><path d="m28 7 24 20-3 3-21-17L7 30l-3-3L28 7z"/><path d="M12 22v24h32V22h-4v20H16V22h-4z"/><path d="M24 24h8v4h-8zM18 34h20v3h-3v5h-3v-5h-8v5h-3v-5h-3v-3z"/></svg>`
			)
		);
		iconRegistry.addSvgIconLiteral(
			'terrain_Outdoor',
			sanitizer.bypassSecurityTrustHtml(
				`<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56"><path d="M2 46h52L40 24 28 42h4l8-12 8 12H8l14-22 12 16 2-4-14-18L2 46z"/><path d="M16 26h8v3h-8zM10 34h8v3h-8zM40 14a6 6 0 1 1-6-6 6 6 0 0 1 6 6Zm-6-3a3 3 0 1 0 3 3 3 3 0 0 0-3-3Z"/></svg>`
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

	handleClickExport() {
		const dialogRef = this.dialog.open(ExportComponent, {
			height: 'auto',
			autoFocus: false,
			restoreFocus: false,
		});

		dialogRef.afterClosed();
	}

	handleClickSetting() {
		const dialogRef = this.dialog.open(SettingComponent, {
			height: 'auto',
			autoFocus: false,
			restoreFocus: false,
		});

		dialogRef.afterClosed();
	}

	async handleClickSave() {
		await this.preloadService.saveDeck();
		this.snackBar.open(this.dataService.i18n.action_saved, undefined, {
			duration: 1000,
			horizontalPosition: 'center',
			verticalPosition: 'top',
		});
	}
}
