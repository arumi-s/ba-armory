import { describe, expect, it } from 'vitest';

import { buildGameData, getStudent, getStuff } from './indexes';
import { CampaignSchema, EquipmentSchema, StudentSchema, StagesSchema } from './schemas';
import { ALT_OFFSET, EQUIPMENT_OFFSET } from './enums';
import { buildRaw, equipmentRaw, stageRaw, studentRaw } from './test-fixtures';

describe('schemas', () => {
	it('StudentSchema filters skills to the four deck slots with skillType tags', () => {
		const student = StudentSchema.parse(studentRaw(10000));
		expect(student.skills.map((skill) => skill.skillType)).toEqual([
			'Ex',
			'Public',
			'Passive',
			'ExtraPassive'
		]);
		expect(student.skills[0]).toMatchObject({ name: 'ex', icon: 'i-ex' });
	});

	it('EquipmentSchema offsets ids and recipe ingredient ids', () => {
		const equipment = EquipmentSchema.parse(equipmentRaw(2, 'Hat', 2, { Recipe: [[1, 15]] }));
		expect(equipment.id).toBe(2 + EQUIPMENT_OFFSET);
		expect(equipment.recipe).toEqual([[1 + EQUIPMENT_OFFSET, 15]]);
	});

	it('CampaignSchema remaps rewards and drops non item/equipment/currency types', () => {
		const campaign = CampaignSchema.parse(stageRaw(1011101));
		expect(campaign.rewards).toEqual([
			{ type: 'Item', id: 101, chance: 0.5, rewardType: 'Default' },
			{ type: 'Currency', id: 3_000_000, amount: 100, chance: 1, rewardType: 'Default' },
			{ type: 'Equipment', id: 3 + EQUIPMENT_OFFSET, amount: 1, chance: 1, rewardType: 'Default' },
			{ type: 'Item', id: 102, chance: 1, rewardType: 'FirstClear' }
		]);
	});

	it('StagesSchema parses record of campaigns', () => {
		const stages = StagesSchema.parse({ a: stageRaw(1), b: stageRaw(2, { Category: 'Bounty' }) });
		expect(Object.keys(stages)).toEqual(['a', 'b']);
		expect(stages['a']?.category).toBe('Campaign');
	});
});

describe('buildGameData', () => {
	it('derives level caps from config for the region', () => {
		const game = buildGameData(buildRaw(), 0);
		expect(game.studentLevelMax).toBe(90);
		expect(game.weaponLevelMax).toBe(60);
	});

	it('builds equipmentsByCategory with first-released equipment per tier and max tiers', () => {
		const game = buildGameData(buildRaw(), 0);
		const hats = game.equipmentsByCategory.get('Hat');
		expect(hats?.get(1)).toBe(1 + EQUIPMENT_OFFSET);
		expect(hats?.get(2)).toBe(2 + EQUIPMENT_OFFSET);
		expect(game.equipmentCategoryMaxTier.get('Hat')).toBe(2);
		// Shoes T1 not released on region 0 → no Shoes category at all
		expect(game.equipmentsByCategory.has('Shoes')).toBe(false);
	});

	it('builds universal/specific blueprint indexes with blueprints DESC by (tier, id)', () => {
		const game = buildGameData(
			buildRaw({
				equipments: [
					EquipmentSchema.parse(equipmentRaw(5000, 'Badge', 1)),
					EquipmentSchema.parse(equipmentRaw(5001, 'Badge', 2, { Recipe: [[105001, 15]] })),
					EquipmentSchema.parse(equipmentRaw(105001, 'Badge', 2)),
					EquipmentSchema.parse(equipmentRaw(105003, 'Badge', 4)),
					EquipmentSchema.parse(equipmentRaw(105008, 'Badge', 9)),
					EquipmentSchema.parse(equipmentRaw(505000, 'Badge', 0))
				]
			}),
			0
		);
		expect(game.universalBlueprintByCategory.get('Badge')).toBe(505000 + EQUIPMENT_OFFSET);
		// Substitution order: T9 → T4 → T2 → T1 (recipe'd T2 equipment excluded).
		expect(game.blueprintsByCategory.get('Badge')).toEqual([
			105008 + EQUIPMENT_OFFSET,
			105003 + EQUIPMENT_OFFSET,
			105001 + EQUIPMENT_OFFSET,
			5000 + EQUIPMENT_OFFSET
		]);
	});

	it('region-gates the blueprint indexes on IsReleased (CN-only releases)', () => {
		const raw = buildRaw({
			equipments: [
				EquipmentSchema.parse(equipmentRaw(5000, 'Badge', 1, { IsReleased: [false, false, true] })),
				EquipmentSchema.parse(
					equipmentRaw(505000, 'Badge', 0, { IsReleased: [false, false, true] })
				)
			]
		});
		const jp = buildGameData(raw, 0);
		expect(jp.universalBlueprintByCategory.has('Badge')).toBe(false);
		expect(jp.blueprintsByCategory.has('Badge')).toBe(false);
		const cn = buildGameData(raw, 2);
		expect(cn.universalBlueprintByCategory.get('Badge')).toBe(505000 + EQUIPMENT_OFFSET);
		expect(cn.blueprintsByCategory.get('Badge')).toEqual([5000 + EQUIPMENT_OFFSET]);
	});

	it('stockables: recipe-less released equipments first, then eligible items', () => {
		const game = buildGameData(buildRaw(), 0);
		expect(game.stockables).toEqual([
			1 + EQUIPMENT_OFFSET, // Hat T1 (no recipe)
			101, // material with item_icon_material icon
			301, // SecretStone
			5001 // Favor
		]);
	});

	it('excludes high-id materials (>= 200000) and non-material categories', () => {
		const game = buildGameData(buildRaw(), 0);
		expect(game.stockables).not.toContain(200001);
		expect(game.stockables).not.toContain(50); // Coin
	});

	it('filters campaigns to Category === Campaign preserving document order', () => {
		const game = buildGameData(buildRaw(), 0);
		expect(game.campaigns.map((campaign) => campaign.id)).toEqual([1011101]);
	});

	it('icons: raids + extras + all student portraits + unique school badges', () => {
		const game = buildGameData(buildRaw(), 0);
		const icons = game.icons;
		expect(icons.length).toBeGreaterThan(26 + 44);
		expect(icons.filter((icon) => icon.includes('/student/collection/')).length).toBe(2);
		expect(icons.filter((icon) => icon.includes('/schoolicon/')).length).toBe(1);
	});

	it('localization accessors fall back to the key when missing', () => {
		const game = buildGameData(buildRaw(), 0);
		expect(game.localization.serverName(0)).toBe('JP');
		expect(game.localization.ui('students')).toBe('Students');
		expect(game.localization.ui('missing_key')).toBe('missing_key');
	});
});

describe('lookups', () => {
	it('getStudent resolves alt ids to base students', () => {
		const game = buildGameData(buildRaw(), 0);
		expect(getStudent(game, 10000)?.id).toBe(10000);
		expect(getStudent(game, 10000 + ALT_OFFSET)?.id).toBe(10000);
		expect(getStudent(game, 12345)).toBeUndefined();
	});

	it('getStuff routes by id space', () => {
		const game = buildGameData(buildRaw(), 0);
		expect(getStuff(game, 101)?.id).toBe(101);
		expect(getStuff(game, 1 + EQUIPMENT_OFFSET)?.id).toBe(1 + EQUIPMENT_OFFSET);
		expect(getStuff(game, 1_500_000)).toBeUndefined();
	});
});
