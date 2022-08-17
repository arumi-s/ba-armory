import { Injectable } from '@angular/core';
import { instanceToPlain } from 'class-transformer';
import { compressToUTF16, decompressFromUTF16 } from 'lz-string';
import { DataService } from './data.service';

const STORAGE_DECK_KEY = 'deck';

@Injectable({
	providedIn: 'root',
})
export class PreloadService {
	constructor(private dataService: DataService) {}

	static initialize(preloadService: PreloadService) {
		return () => preloadService.load();
	}

	async load() {
		const language = 'cn';
		const itemsDataSource = `https://raw.githubusercontent.com/lonqie/SchaleDB/main/data/${language}/items.min.json`;
		const equipmentsDataSource = `https://raw.githubusercontent.com/lonqie/SchaleDB/main/data/${language}/equipment.min.json`;
		const studentsDataSource = `https://raw.githubusercontent.com/lonqie/SchaleDB/main/data/${language}/students.min.json`;
		const stagesDataSource = `https://raw.githubusercontent.com/lonqie/SchaleDB/main/data/stages.min.json`;
		const localizationDataSource = `https://raw.githubusercontent.com/lonqie/SchaleDB/main/data/${language}/localization.min.json`;

		const items = await (await fetch(itemsDataSource)).json();
		const equipments = await (await fetch(equipmentsDataSource)).json();
		const students = await (await fetch(studentsDataSource)).json();
		const stages = await (await fetch(stagesDataSource)).json();
		const localization = await (await fetch(localizationDataSource)).json();

		this.dataService.setItems(items);
		this.dataService.setEquipments(equipments);
		this.dataService.setStudents(students);
		this.dataService.setStage(stages);
		this.dataService.setLocalization(localization);

		await this.loadDeck();
	}

	async saveDeck() {
		const json = instanceToPlain(this.dataService.deck);
		const compressed = compressToUTF16(JSON.stringify(json));
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
