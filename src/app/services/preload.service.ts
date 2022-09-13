import { Injectable } from '@angular/core';
import { instanceToPlain } from 'class-transformer';
import { compressToUTF16, decompressFromUTF16 } from 'lz-string';
import { CDN_BASE } from '../entities/constant';
import { DataService } from './data.service';

const STORAGE_LANGUAGE_KEY = 'language';
const STORAGE_REGION_KEY = 'region';
const STORAGE_DECK_KEY = 'deck';

@Injectable({
	providedIn: 'root',
})
export class PreloadService {
	constructor(private dataService: DataService) {}

	static initialize(preloadService: PreloadService) {
		return () => preloadService.load();
	}

	private async fetchJson(url: string) {
		return (await fetch(url)).json();
	}

	async load() {
		await this.loadSetting();

		const language = this.dataService.language;
		const commonSource = `${CDN_BASE}/data/common.min.json`;
		const itemsSource = `${CDN_BASE}/data/${language}/items.min.json`;
		const equipmentsSource = `${CDN_BASE}/data/${language}/equipment.min.json`;
		const studentsSource = `${CDN_BASE}/data/${language}/students.min.json`;
		const stagesSource = `${CDN_BASE}/data/stages.min.json`;
		const localizationSource = `${CDN_BASE}/data/${language}/localization.min.json`;
		const i18nSource = `/assets/i18n/${language}.json`;

		const [common, items, equipments, students, stages, localization, i18n] = await Promise.all([
			this.fetchJson(commonSource),
			this.fetchJson(itemsSource),
			this.fetchJson(equipmentsSource),
			this.fetchJson(studentsSource),
			this.fetchJson(stagesSource),
			this.fetchJson(localizationSource),
			this.fetchJson(i18nSource),
		]);

		this.dataService.setCommon(common);
		this.dataService.setItems(items);
		this.dataService.setEquipments(equipments);
		this.dataService.setStudents(students);
		this.dataService.setStage(stages);
		this.dataService.setLocalization(localization);
		this.dataService.setI18N(i18n);

		this.dataService.setOthers();

		await this.loadDeck();
	}

	async saveSetting() {
		localStorage.setItem(STORAGE_LANGUAGE_KEY, this.dataService.language);
		localStorage.setItem(STORAGE_REGION_KEY, '' + this.dataService.region);
	}

	async loadSetting() {
		let initialize = false;

		const savedLanguage = localStorage.getItem(STORAGE_LANGUAGE_KEY);
		if (typeof savedLanguage === 'string' && this.dataService.languageOptions.some((option) => option.id === savedLanguage)) {
			this.dataService.language = savedLanguage;
		} else {
			const navigatorLanguage = window.navigator.language;
			switch (navigatorLanguage.split('-')[0]) {
				case 'ja':
					this.dataService.language = 'jp';
					break;
				case 'zh':
					this.dataService.language = navigatorLanguage.toLowerCase().startsWith('zh-cn') ? 'cn' : 'tw';
					break;
				default:
					this.dataService.language = 'en';
					break;
			}
			initialize = true;
		}

		const savedRegion = localStorage.getItem(STORAGE_REGION_KEY);
		if (typeof savedRegion === 'string' && this.dataService.regionOptions.some((option) => option.id === +savedRegion)) {
			this.dataService.region = +savedRegion;
		} else {
			this.dataService.region = 0;
			initialize = true;
		}

		if (initialize) {
			await this.saveSetting();
		}
	}

	async saveDeck() {
		const json = JSON.stringify(instanceToPlain(this.dataService.deck));
		const compressed = compressToUTF16(json);
		localStorage.setItem(STORAGE_DECK_KEY, compressed);
	}

	async loadDeck() {
		try {
			const compressed = localStorage.getItem(STORAGE_DECK_KEY) ?? '';
			if (compressed === '') throw new Error();

			const json = JSON.parse(decompressFromUTF16(compressed) ?? '{}');
			return this.dataService.setDeck(json);
		} catch (e: unknown) {}

		return this.dataService.setDeck({});
	}
}
