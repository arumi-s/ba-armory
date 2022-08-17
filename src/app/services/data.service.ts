import { Injectable } from '@angular/core';
import { plainToClassFromExist, plainToInstance } from 'class-transformer';
import { Deck, EQUIPMENT_OFFSET } from '../entities/deck';
import { DeckStudent } from '../entities/deck-student';
import { ArmorType, BulletType, EquipmentCategory, ItemCategory, StuffCategory, TacticRole } from '../entities/enum';
import { Equipment } from '../entities/equipment';
import { Localization } from '../entities/localization';
import { Stage } from '../entities/stage';
import { Student } from '../entities/student';

/*
"Stat": {
		"Level": "等级",
		"MaxHP": "最大体力",
		"AttackPower": "攻击力",
		"DefensePower": "防御力",
		"HealPower": "治愈力",
		"AccuracyPoint": "准确度",
		"DodgePoint": "回避值",
		"CriticalPoint": "暴击值",
		"CriticalDamageRate": "暴击伤害",
		"HealEffectivenessRate": "回复强化率",
		"OppressionPower": "群控强化力",
		"OppressionResist": "群控抵抗力",
		"CriticalChanceResistPoint": "暴击抵抗力",
		"CriticalDamageResistRate": "暴击伤害抵抗率",
		"StabilityPoint": "稳定值",
		"Range": "射程",
		"AmmoCount": "载弹量",
		"MoveSpeed": "移速",
		"DamagedRatio": "承受伤害量",
		"AttackSpeed": "攻速",
		"BlockRate": "掩护成功率",
		"DefensePenetration": "防御貫穿",
		"RegenCost": "COST回复力",
		"SightPoint": "视野"
},
*/
export interface SortOption<T> {
	id: string;
	label: string;
	key: ((item: T) => number)[];
}

export type StudentSortOption = SortOption<DeckStudent>;

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

	studentSortOptions: StudentSortOption[] = [
		{
			id: 'level',
			label: 'Level',
			key: [(deckStudent) => -deckStudent.level, (deckStudent) => -deckStudent.star, (deckStudent) => deckStudent.id],
		},
		{
			id: 'star',
			label: 'Star',
			key: [(deckStudent) => -deckStudent.star, (deckStudent) => -deckStudent.level, (deckStudent) => deckStudent.id],
		},
		{
			id: 'streetBattleAdaptation',
			label: 'Street',
			key: [
				(deckStudent) => -this.students.get(deckStudent.id).streetBattleAdaptation,
				(deckStudent) => -deckStudent.star,
				(deckStudent) => -deckStudent.level,
				(deckStudent) => deckStudent.id,
			],
		},
		{
			id: 'outdoorBattleAdaptation',
			label: 'Outdoor',
			key: [
				(deckStudent) => -this.students.get(deckStudent.id).outdoorBattleAdaptation,
				(deckStudent) => -deckStudent.star,
				(deckStudent) => -deckStudent.level,
				(deckStudent) => deckStudent.id,
			],
		},
		{
			id: 'indoorBattleAdaptation',
			label: 'Indoor',
			key: [
				(deckStudent) => -this.students.get(deckStudent.id).indoorBattleAdaptation,
				(deckStudent) => -deckStudent.star,
				(deckStudent) => -deckStudent.level,
				(deckStudent) => deckStudent.id,
			],
		},
		{
			id: 'bulletType',
			label: 'attacktype',
			key: [
				(deckStudent) => -Object.keys(BulletType).indexOf(this.students.get(deckStudent.id).bulletType),
				(deckStudent) => -deckStudent.star,
				(deckStudent) => -deckStudent.level,
				(deckStudent) => deckStudent.id,
			],
		},
		{
			id: 'armorType',
			label: 'defensetype',
			key: [
				(deckStudent) => -Object.keys(ArmorType).indexOf(this.students.get(deckStudent.id).armorType),
				(deckStudent) => -deckStudent.star,
				(deckStudent) => -deckStudent.level,
				(deckStudent) => deckStudent.id,
			],
		},
	];

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
			if (!item.isReleased[1]) continue;

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
}
