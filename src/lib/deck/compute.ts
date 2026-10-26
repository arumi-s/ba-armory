import type { GameDataType } from '#lib/data/indexes';
import { getStuff } from '#lib/data/indexes';
import {
	ACTION_POINT_ID,
	ALT_OFFSET,
	ELIGMA_ID,
	SkillType,
	arenaRankRewards,
	starSecretStoneAmount,
	weaponSecretStoneAmount
} from '#lib/data/enums';
import type { ItemType } from '#lib/data/schemas';
import { getStudent } from '#lib/data/indexes';
import { CDN_BASE } from '#lib/config';
import stringWidth from 'string-width';
import type { DeckState } from './types';
import type { DeckSquadState, DeckStudentState } from './types';

/* ------------------------------------------------------------------ */
/* ① Per-student required items                                        */
/* ------------------------------------------------------------------ */

/**
 * Material requirements to bring the student from current to target values.
 * Keyed by item id (9999 is the pseudo id for the skill level 9→10 report).
 */
export function studentRequiredItems(
	d: DeckStudentState,
	game: GameDataType,
	stocks: Record<number, number>
): Map<number, number> {
	const student = getStudent(game, d.id);
	const required = new Map<number, number>();
	if (!student) return required;

	const add = (id: number, amount: number) => {
		required.set(id, (required.get(id) ?? 0) + amount);
	};

	/* Skills */
	for (let index = 0; index < student.skills.length && index < d.skills.length; index++) {
		const skill = student.skills[index];
		if (
			skill.skillType !== SkillType.Ex &&
			skill.skillType !== SkillType.Normal &&
			skill.skillType !== SkillType.Passive &&
			skill.skillType !== SkillType.Sub
		) {
			continue;
		}
		const deckSkill = d.skills[index];
		const isEx = skill.skillType === SkillType.Ex;
		const levelMaterialIds = isEx ? student.skillExMaterial : student.skillMaterial;
		const levelAmounts = isEx ? student.skillExMaterialAmount : student.skillMaterialAmount;

		for (let level = deckSkill.level; level < deckSkill.levelTarget; level++) {
			const materialIds = level === 9 ? [9999] : (levelMaterialIds[level - 1] ?? []);
			const amounts = level === 9 ? [1] : (levelAmounts[level - 1] ?? []);
			for (let i = 0; i < materialIds.length; i++) {
				add(materialIds[i], amounts[i] ?? 0);
			}
		}
	}

	/* Equipments */
	for (let index = 0; index < student.equipment.length && index < d.equipments.length; index++) {
		const deckEquipment = d.equipments[index];
		const categoryMap = game.equipmentsByCategory.get(student.equipment[index] as never);
		for (let tier = deckEquipment.tier + 1; tier <= deckEquipment.tierTarget; tier++) {
			const equipment = categoryMap ? game.equipments.get(categoryMap.get(tier) ?? -1) : undefined;
			if (!equipment) continue;
			if (equipment.recipe) {
				for (const [id, amount] of equipment.recipe) add(id, amount);
			} else {
				add(equipment.id, 1);
			}
		}
	}

	/* Stars (own eleph) */
	{
		const fromStar = d.star;
		const toStar = d.starTarget;
		if (fromStar < toStar) {
			add(student.id, Math.max(starSecretStoneAmount[toStar] - starSecretStoneAmount[fromStar], 0));
		}
	}

	/* UE (weapon breakthrough, unlocked at 5★) */
	{
		const fromWeapon = d.star === 5 ? d.weapon : 0;
		const toWeapon = d.weaponTarget;
		if (fromWeapon < toWeapon) {
			add(
				student.id,
				Math.max(weaponSecretStoneAmount[toWeapon] - weaponSecretStoneAmount[fromWeapon], 0)
			);
		}
	}

	/* Gear (unique equipment) */
	{
		const fromGear = Math.max(d.gear, 1);
		const toGear = d.gearTarget;
		if (fromGear < toGear) {
			const tierMaterialIds = student.gear?.tierUpMaterial ?? [];
			const tierAmounts = student.gear?.tierUpMaterialAmount ?? [];
			for (let level = fromGear; level < toGear; level++) {
				const materialIds = tierMaterialIds[level - 1] ?? [];
				const amounts = tierAmounts[level - 1] ?? [];
				for (let i = 0; i < materialIds.length; i++) {
					add(materialIds[i], amounts[i] ?? 0);
				}
			}
		}
	}

	/* Eligma conversion for the missing own-eleph amount */
	{
		const stock = stocks[student.id] ?? 0;
		const ownRequired = required.get(student.id) ?? 0;
		let amount = Math.max(0, ownRequired - stock);
		if (amount > 0) {
			const costMax = 5;
			let cost = d.elephCost;
			let remain = cost === costMax ? Infinity : d.elephRemain;
			let total = 0;
			while (cost <= costMax) {
				const buy = Math.min(amount, remain);
				amount -= buy;
				total += buy * cost;
				cost++;
				remain = cost === costMax ? Infinity : 20;
			}
			required.set(ELIGMA_ID, total);
		}
	}

	return required;
}

/* ------------------------------------------------------------------ */
/* ② Squad aggregate                                                   */
/* ------------------------------------------------------------------ */

/** Sum of per-student requirements; alt entries skipped, duplicate ids counted once. */
export function squadRequired(
	squad: DeckSquadState,
	deck: DeckState,
	game: GameDataType
): Map<number, number> {
	const required = new Map<number, number>();
	const counted = new Set<number>();
	for (const studentId of squad.students) {
		if (counted.has(studentId)) continue;
		const entry = deck.students[studentId];
		if (entry == null || studentId > ALT_OFFSET) continue;
		for (const [id, amount] of studentRequiredItems(entry, game, deck.stocks)) {
			required.set(id, (required.get(id) ?? 0) + amount);
		}
		counted.add(studentId);
	}
	return required;
}

/* ------------------------------------------------------------------ */
/* ③ Recommended stages                                                */
/* ------------------------------------------------------------------ */

export interface RecommendedStageType {
	id: number;
	amount: number;
}

/** Top-20 campaign suggestions weighted by deficit-per-AP. */
export function recommendStages(
	required: Map<number, number>,
	stocks: Record<number, number>,
	game: GameDataType,
	showHard: boolean
): RecommendedStageType[] {
	return game.campaigns
		.filter((campaign) => showHard || campaign.difficulty !== 1)
		.filter((campaign) => campaign.entryCost.every(([id]) => id === ACTION_POINT_ID))
		.map((campaign) => {
			const cost = campaign.entryCost.find(([id]) => id === ACTION_POINT_ID)?.[1] ?? 0;
			let weight = 0;
			if (cost > 0) {
				for (const reward of campaign.rewards) {
					if (reward.rewardType !== 'Default') continue;
					const need = required.get(reward.id) ?? 0;
					if (need <= 0) continue;
					let scale = 1;
					if (campaign.difficulty === 1) {
						const stuff = getStuff(game, reward.id);
						if (stuff == null) {
							scale = 0;
						} else if (stuff.category !== 'SecretStone') {
							scale = 0.5;
						}
					}
					weight += Math.max(0, need - (stocks[reward.id] ?? 0)) * reward.chance * scale;
				}
			}
			return { weight: cost > 0 ? weight / cost : 0, campaign };
		})
		.filter((candidate) => candidate.weight > 0)
		.sort((a, b) => b.weight - a.weight)
		.slice(0, 20)
		.map(({ campaign }) => {
			let amount = 0;
			for (const reward of campaign.rewards) {
				if (reward.rewardType !== 'Default') continue;
				if (reward.chance <= 0) continue;
				const need = required.get(reward.id) ?? 0;
				if (need > 0) {
					amount = Math.max(amount, Math.max(0, need - (stocks[reward.id] ?? 0)) / reward.chance);
				}
			}
			return { id: campaign.id, amount: Math.ceil(amount) };
		});
}

/* ------------------------------------------------------------------ */
/* ④ Arena forecast                                                    */
/* ------------------------------------------------------------------ */

export interface ArenaForecastEntry {
	rank: number;
	reward: number;
	tierUp: boolean;
}

function nextArenaRank(rank: number): number {
	return Math.max(Math.min(Math.floor(rank * 0.7), rank - 3), 1);
}

function arenaGemsAt(rank: number): number {
	return arenaRankRewards.find(([minRank]) => rank <= minRank)![1];
}

export function arenaForecast(currentRank: number): ArenaForecastEntry[] {
	const result: ArenaForecastEntry[] = [];
	let rank = currentRank;
	let reward = arenaGemsAt(rank);
	do {
		rank = nextArenaRank(rank);
		const newReward = arenaGemsAt(rank);
		result.push({ rank, reward: newReward, tierUp: newReward > reward });
		reward = newReward;
	} while (rank > 1);
	while (result.length % 5 > 0) {
		result.push({ rank: 0, reward: 0, tierUp: false });
	}
	return result;
}

/* ------------------------------------------------------------------ */
/* ⑤ Favor (gift) tiers                                                */
/* ------------------------------------------------------------------ */

export interface FavorTier {
	amount: number;
	icon: string;
	studentIds: number[];
}

export interface FavorResult {
	tiers: FavorTier[];
	isGeneric: boolean;
	unused: boolean;
	/** Ascending sort key (generic gifts first, then rarity, then id). */
	order: number;
}

const RARITY_ORDER = ['N', 'R', 'SR', 'SSR'];

/**
 * Gift preference tiers for a favor item against a squad, including the
 * generic-tag bucket skipping and the always-present baseline tier.
 */
export function favorTiers(
	item: ItemType,
	squadStudentIds: readonly number[],
	game: GameDataType
): FavorResult {
	const genericTags = game.commonFavorItemTags;
	const genericTagCount = (item.tags ?? []).filter((tag) => genericTags.includes(tag)).length;
	const isGeneric = (item.tags ?? []).length === genericTagCount;

	const buckets: [number[], number[], number[]] = [[], [], []];
	for (const id of squadStudentIds) {
		const student = getStudent(game, id);
		if (!student) continue;
		const allTags = [...student.favorItemTags, ...student.favorItemUniqueTags, ...genericTags];
		const commonTags = (item.tags ?? []).filter((tag) => allTags.includes(tag));
		const grade = Math.min(commonTags.length, 3);
		if (grade > 0) buckets[grade - 1].push(student.id);
	}

	const tiers: FavorTier[] = [];
	for (let matchingTags = 3; matchingTags > 0; matchingTags--) {
		if (matchingTags - genericTagCount === 0) continue;
		const studentIds = buckets[matchingTags - 1];
		if (studentIds.length > 0) {
			tiers.push({
				amount: (item.expValue ?? 0) * (matchingTags + 1),
				icon: `${CDN_BASE}/images/ui/Cafe_Interaction_Gift_0${matchingTags + 1}.png`,
				studentIds
			});
		}
	}
	tiers.push({
		amount: (item.expValue ?? 0) * (genericTagCount + 1),
		icon: `${CDN_BASE}/images/ui/Cafe_Interaction_Gift_0${genericTagCount + 1}.png`,
		studentIds: []
	});

	const unused = tiers.every((tier) => tier.studentIds.length === 0);
	const order = (isGeneric ? 0 : -RARITY_ORDER.indexOf(item.rarity) * 100000) + item.id;

	return { tiers, isGeneric, unused, order };
}

/* ------------------------------------------------------------------ */
/* ⑥ Squad text export                                                 */
/* ------------------------------------------------------------------ */

export interface SquadTextOptions {
	showStar: boolean;
	showLevel: boolean;
	showSkills: boolean;
	showEquipments: boolean;
	showWeapon: boolean;
	showGear: boolean;
}

export interface SquadTextLabels {
	assist: string;
	weapon: string;
	gear: string;
}

export interface SquadTextStudentView {
	name: string;
	isAlt: boolean;
	star: number;
	level: number;
	skillLevels: number[];
	skillLevelsMax: number[];
	equipmentTiers: number[];
	weapon: number;
	gear: number;
	starMax: number;
}

/** Column-aligned plain text export (string-width aware for CJK names). */
export function squadText(
	students: readonly SquadTextStudentView[],
	options: SquadTextOptions,
	labels: SquadTextLabels
): string {
	if (students.length === 0) return '';
	const table = students.map((student) =>
		[
			`${student.name}${student.isAlt ? `(${labels.assist})` : ''}`,
			options.showStar ? `★${student.star}` : false,
			options.showLevel ? `Lv.${student.level}` : false,
			options.showSkills
				? student.skillLevels
						.map((level, index) => (level === student.skillLevelsMax[index] ? 'M' : String(level)))
						.join('')
				: false,
			options.showEquipments ? student.equipmentTiers.join('') : false,
			options.showWeapon
				? student.star === student.starMax && student.weapon > 0
					? `${labels.weapon}${student.weapon}`
					: ''
				: false,
			options.showGear ? (student.gear > 0 ? `${labels.gear}${student.gear}` : '') : false
		].filter((cell): cell is string => cell !== false)
	);

	const columnCount = Math.max(...table.map((row) => row.length));
	const columns = Array.from({ length: columnCount }, (_, i) =>
		Math.max(...table.map((row) => stringWidth(row[i] ?? '')))
	);

	return table
		.map((row) =>
			row
				.map((text, i) => text + ' '.repeat(columns[i] - stringWidth(text)))
				.join(' ')
				.trimEnd()
		)
		.join('\n');
}
