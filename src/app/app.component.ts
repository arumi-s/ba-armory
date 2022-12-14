import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
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
