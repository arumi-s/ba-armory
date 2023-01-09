import { Component, OnInit } from '@angular/core';

import { DataService } from '../../services/data.service';
import { PreloadService } from '../../services/preload.service';

@Component({
	selector: 'ba-export',
	templateUrl: './export.component.html',
	styleUrls: ['./export.component.less'],
})
export class ExportComponent implements OnInit {
	title = '';
	data = '';
	error = false;

	constructor(private readonly preloadService: PreloadService, public readonly dataService: DataService) {}

	ngOnInit(): void {
		// i18n
		this.title = this.dataService.i18n.action_export;
	}

	handleClickInputData(event: MouseEvent) {
		if (event.target instanceof HTMLInputElement) {
			event.target.select();
		}
	}

	async handleClickExport() {
		this.error = false;
		this.data = await this.preloadService.exportData();
	}

	async handleClickImport() {
		this.error = false;
		try {
			await this.preloadService.importData(this.data);
			window.location.reload();
		} catch (e: unknown) {
			this.error = true;
		}
	}
}
