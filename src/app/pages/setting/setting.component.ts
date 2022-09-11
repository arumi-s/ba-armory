import { Component, OnInit } from '@angular/core';
import { LanguageOption, RegionOption } from '../../entities/types';
import { DataService } from '../../services/data.service';
import { PreloadService } from '../../services/preload.service';

@Component({
	selector: 'ba-setting',
	templateUrl: './setting.component.html',
	styleUrls: ['./setting.component.less'],
})
export class SettingComponent implements OnInit {
	title = '';

	languageLabel = '';
	regionLabel = '';

	selectedLanguageOption: LanguageOption = undefined;
	selectedRegionOption: RegionOption = undefined;

	constructor(private readonly preloadService: PreloadService, public readonly dataService: DataService) {}

	ngOnInit(): void {
		// i18n
		this.title = this.dataService.localization.ui['options'];
		// i18n
		this.languageLabel = this.dataService.localization.ui['navbar_settings_language'];
		// i18n
		this.regionLabel = this.dataService.localization.ui['navbar_settings_server'];

		this.selectedLanguageOption = this.dataService.languageOptions.find((option) => option.id === this.dataService.language);
		this.selectedRegionOption = this.dataService.regionOptions.find((option) => option.id === this.dataService.region);
	}

	handleClickLanguageOption(languageId: string) {
		this.selectedLanguageOption = this.dataService.languageOptions.find((option) => option.id === languageId);
	}

	handleClickRegionOption(regionId: number) {
		this.selectedRegionOption = this.dataService.regionOptions.find((option) => option.id === regionId);
	}

	async handleClickSave() {
		let changed = false;

		if (this.dataService.language !== this.selectedLanguageOption.id) {
			changed = true;
			this.dataService.language = this.selectedLanguageOption.id;
		}
		if (this.dataService.region !== this.selectedRegionOption.id) {
			changed = true;
			this.dataService.region = this.selectedRegionOption.id;
		}

		if (changed) {
			await this.preloadService.saveSetting();
			window.location.reload();
		}
	}
}
