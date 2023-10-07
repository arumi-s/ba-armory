import { instanceToPlain } from 'class-transformer';
import { compressToBase64, compressToUTF16, decompressFromBase64, decompressFromUTF16 } from 'lz-string';

import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
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
		const configSource = `${environment.CDN_BASE}/data/config.min.json`;
		const itemsSource = `${environment.CDN_BASE}/data/${language}/items.min.json`;
		const equipmentsSource = `${environment.CDN_BASE}/data/${language}/equipment.min.json`;
		const studentsSource = `${environment.CDN_BASE}/data/${language}/students.min.json`;
		const stagesSource = `${environment.CDN_BASE}/data/stages.min.json`;
		const localizationSource = `${environment.CDN_BASE}/data/${language}/localization.min.json`;
		const i18nSource = `/assets/i18n/${language}.json`;

		const [config, items, equipments, students, stages, localization, i18n] = await Promise.all([
			this.fetchJson(configSource),
			this.fetchJson(itemsSource),
			this.fetchJson(equipmentsSource),
			this.fetchJson(studentsSource),
			this.fetchJson(stagesSource),
			this.fetchJson(localizationSource),
			this.fetchJson(i18nSource),
		]);

		this.dataService.setConfig(config);
		this.dataService.setItems(items);
		this.dataService.setEquipments(equipments);
		this.dataService.setStudents(students);
		this.dataService.setStage(stages);
		this.dataService.setLocalization(localization);
		this.dataService.setI18N(i18n);

		this.dataService.setOthers();

		await this.loadDeck();
	}

	private mapLanguage(code: string, defaultCode = ''): string {
		code = code.toLowerCase();

		if (this.dataService.languageOptions.some((option) => option.id === code)) {
			return code;
		}

		switch (code.split('-')[0]) {
			case 'ja':
				return 'jp';
			case 'zh':
				return code.startsWith('zh-cn') ? 'cn' : 'tw';
			case 'en':
				return 'en';
		}

		return defaultCode;
	}

	async saveSetting() {
		localStorage.setItem(STORAGE_LANGUAGE_KEY, this.dataService.language);
		localStorage.setItem(STORAGE_REGION_KEY, '' + this.dataService.region);
	}

	async loadSetting() {
		let initialize = false;
		let forceLanguage = false;

		const path = location.pathname.split('/')?.[1] ?? '';
		if (path !== '') {
			const language = this.mapLanguage(path);
			if (language !== '') {
				this.dataService.language = language;
				initialize = true;
				forceLanguage = true;
			}
		}

		if (!forceLanguage) {
			const savedLanguage = localStorage.getItem(STORAGE_LANGUAGE_KEY);
			if (typeof savedLanguage === 'string' && this.mapLanguage(savedLanguage) === savedLanguage) {
				this.dataService.language = savedLanguage;
			} else {
				this.dataService.language = this.mapLanguage(window.navigator.language, 'en');
				initialize = true;
			}
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
		const plain = instanceToPlain(this.dataService.deck);
		const json = JSON.stringify(plain);
		const compressed = compressToUTF16(json);
		localStorage.setItem(STORAGE_DECK_KEY, compressed);
	}

	async loadDeck() {
		const id = location.pathname.split('/').pop() ?? '';

		if (id.length === 8) {
			try {
				await this.loadRemote(id);
				return;
			} catch (_: unknown) {}
		}

		try {
			const compressed = localStorage.getItem(STORAGE_DECK_KEY) ?? '';
			if (compressed === '') throw new Error();

			const json = decompressFromUTF16(compressed) ?? '{}';
			const plain = JSON.parse(json);
			return this.dataService.setDeck(plain);
		} catch (_: unknown) {}

		return this.dataService.setDeck({});
	}

	async saveRemote() {
		const data = await this.exportData();
		const response = await fetch(`${environment.SAVE_API}`, {
			method: `POST`,
			headers: [[`Content-Type`, `application/json`]],
			body: JSON.stringify({ data }),
		});

		const save: { id: string; error: string; status: number; statusText: string } = await response.json();

		if (!response.ok) {
			throw new Error(save.error);
		}

		return save.id;
	}

	async loadRemote(id: string) {
		const response = await fetch(`${environment.SAVE_API}/${id}`);
		const save: { data: string; error: string; status: number; statusText: string } = await response.json();

		if (!response.ok) {
			throw new Error(save.error);
		}

		const json = decompressFromBase64(save.data);
		const plain = JSON.parse(json);
		if (plain == null || typeof plain !== 'object') throw new TypeError();
		return this.dataService.setDeck(plain);
	}

	async exportData() {
		const json = JSON.stringify(instanceToPlain(this.dataService.deck));
		return compressToBase64(json);
	}

	async importData(input: string) {
		input = input.trim();
		if (input === '') throw new TypeError();

		const json = decompressFromBase64(input);
		const plain = JSON.parse(json);
		if (plain == null || typeof plain !== 'object') throw new TypeError();

		const compressed = compressToUTF16(json);
		localStorage.setItem(STORAGE_DECK_KEY, compressed);
	}
}
