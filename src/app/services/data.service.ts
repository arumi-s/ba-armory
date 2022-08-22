import { Injectable } from '@angular/core';
import { plainToClassFromExist, plainToInstance } from 'class-transformer';
import { Deck, EQUIPMENT_OFFSET, FURNITURE_OFFSET } from '../entities/deck';
import { ArmorType, BulletType, EquipmentCategory, ItemCategory, StuffCategory } from '../entities/enum';
import { Equipment } from '../entities/equipment';
import { Localization } from '../entities/localization';
import { Stage } from '../entities/stage';
import { Student } from '../entities/student';
import { ItemSortOption, StudentSortOption } from '../entities/types';

@Injectable({
	providedIn: 'root',
})
export class DataService {
	students = new Map<number, Student>();
	equipments = new Map<number, Equipment>();
	items = new Map<number, Equipment>();

	stockables: number[] = [];

	equipmentsByCategory = new Map<ItemCategory, Map<number, number>>();
	equipmentCategoryMaxTier = new Map<ItemCategory, number>();

	stages: Stage = new Stage();

	localization: Localization;

	deck: Deck = new Deck();

	starSecretStoneAmount = [0, 0, 30, 110, 210, 330];
	weaponSecretStoneAmount = [0, 0, 120, 300];
	skillExUpgradeCredits = [0, 0, 80000, 580000, 3580000, 13580000];
	skillUpgradeCredits = [0, 0, 5000, 12500, 72500, 162500, 462500, 912500, 2412500, 4812500, 8812500];
	weaponUpgradeCredits = [0, 0, 500000];

	studentSortOptions: StudentSortOption[] = [];
	itemSortOptions: ItemSortOption[] = [];

	constructor() {}

	setStudents(json: any[]) {
		this.students = new Map(
			plainToInstance(Student, json, {
				excludeExtraneousValues: true,
			}).map((student) => [student.id, student])
		);
	}

	setEquipments(json: any[]) {
		this.equipments = new Map(
			plainToInstance(Equipment, json, {
				excludeExtraneousValues: true,
			}).map((equipment) => {
				equipment.id = equipment.id + EQUIPMENT_OFFSET;
				return [equipment.id, equipment];
			})
		);

		for (const [id, equipment] of this.equipments) {
			if (!equipment.isReleased[1]) continue;

			const category = equipment.category;
			let categoryMap = this.equipmentsByCategory.get(category);
			if (categoryMap == null) {
				categoryMap = new Map<number, number>();
				this.equipmentsByCategory.set(category, categoryMap);
			}
			if (!categoryMap.has(equipment.tier)) {
				categoryMap.set(equipment.tier, id);
			}
			if (equipment.recipe == null) {
				if (equipment.category in EquipmentCategory) {
					this.stockables.push(equipment.id);
				}
			} else {
				for (const recipe of equipment.recipe) {
					recipe[0] = recipe[0] + EQUIPMENT_OFFSET;
				}
			}
		}

		for (const [category, equipments] of this.equipmentsByCategory) {
			this.equipmentCategoryMaxTier.set(category, Math.max(...equipments.keys()));
		}
	}

	setItems(json: any[]) {
		this.items = new Map(
			plainToInstance(Equipment, json, {
				excludeExtraneousValues: true,
			}).map((item) => [item.id, item])
		);

		for (const [id, item] of this.items) {
			if (
				(item.category === StuffCategory.Material &&
					(item.tags.includes('MaterialItem') ||
						item.tags.includes('CDItem') ||
						item.tags.includes('BookItem') ||
						item.tags.includes('ShiftingCraftCategory_BookItem'))) ||
				item.tags.includes('SecretStone')
			) {
				this.stockables.push(item.id);
			}
		}
	}

	setStage(json: any[]) {
		plainToClassFromExist(this.stages, json, {
			excludeExtraneousValues: true,
		});
		this.stages.hydrate(this);
	}

	setLocalization(json: any) {
		this.localization = json;
	}

	setOthers() {
		this.studentSortOptions = [
			{
				id: 'level',
				label: this.localization.Stat['Level'],
				key: [(deckStudent) => -deckStudent.level, (deckStudent) => -deckStudent.star, (deckStudent) => deckStudent.id],
			},
			{
				id: 'star',
				label: 'star',
				key: [(deckStudent) => -deckStudent.star, (deckStudent) => -deckStudent.level, (deckStudent) => deckStudent.id],
			},
			{
				id: 'streetBattleAdaptation',
				label: this.localization.AdaptationType['Street'],
				key: [
					(deckStudent) => -this.students.get(deckStudent.id).streetBattleAdaptation,
					(deckStudent) => -deckStudent.star,
					(deckStudent) => -deckStudent.level,
					(deckStudent) => deckStudent.id,
				],
			},
			{
				id: 'outdoorBattleAdaptation',
				label: this.localization.AdaptationType['Outdoor'],
				key: [
					(deckStudent) => -this.students.get(deckStudent.id).outdoorBattleAdaptation,
					(deckStudent) => -deckStudent.star,
					(deckStudent) => -deckStudent.level,
					(deckStudent) => deckStudent.id,
				],
			},
			{
				id: 'indoorBattleAdaptation',
				label: this.localization.AdaptationType['Indoor'],
				key: [
					(deckStudent) => -this.students.get(deckStudent.id).indoorBattleAdaptation,
					(deckStudent) => -deckStudent.star,
					(deckStudent) => -deckStudent.level,
					(deckStudent) => deckStudent.id,
				],
			},
			{
				id: 'bulletType',
				label: this.localization.ui['attacktype'],
				key: [
					(deckStudent) => -Object.keys(BulletType).indexOf(this.students.get(deckStudent.id).bulletType),
					(deckStudent) => -deckStudent.star,
					(deckStudent) => -deckStudent.level,
					(deckStudent) => deckStudent.id,
				],
			},
			{
				id: 'armorType',
				label: this.localization.ui['defensetype'],
				key: [
					(deckStudent) => -Object.keys(ArmorType).indexOf(this.students.get(deckStudent.id).armorType),
					(deckStudent) => -deckStudent.star,
					(deckStudent) => -deckStudent.level,
					(deckStudent) => deckStudent.id,
				],
			},
		];

		this.itemSortOptions = [
			{
				id: 'basic',
				label: '基本',
				key: [
					(equipment) => (equipment.category in StuffCategory ? -Object.keys(StuffCategory).indexOf(equipment.category) : -1000),
					(equipment) => -equipment.id,
				],
			},
			{
				id: 'deficit',
				label: '缺少',
				key: [(equipment) => this.deck.stocks[equipment.id] - this.deck.selectedSquad.required[equipment.id], (equipment) => -equipment.id],
			},
			{
				id: 'required',
				label: '需要',
				key: [(equipment) => -this.deck.selectedSquad.required[equipment.id], (equipment) => -equipment.id],
			},
			{
				id: 'stock',
				label: '库存',
				key: [(equipment) => -this.deck.stocks[equipment.id], (equipment) => -equipment.id],
			},
		];
	}

	setDeck(json: any) {
		plainToClassFromExist(this.deck, json, {
			excludeExtraneousValues: true,
		});
		this.deck.hydrate(this);
	}

	getEquipmentTier(equipmentCategory: EquipmentCategory, tier: number) {
		const categoryMap = this.equipmentsByCategory.get(equipmentCategory);
		return categoryMap?.get(tier) ?? 0;
	}

	getStuff(id: number) {
		if (id >= EQUIPMENT_OFFSET) {
			return this.equipments.get(id);
		} else if (id >= FURNITURE_OFFSET) {
			return null;
		} else {
			return this.items.get(id);
		}
	}
}
