import { boxWith, type ReadableBoxedValues } from 'svelte-toolbelt';
import type { AppState } from '#lib/app/app.svelte.ts';
import { ALT_OFFSET } from '#lib/data/enums';
import { gearIconUrl, getStudent, skillIconUrl, type GameDataType } from '#lib/data/indexes';
import type { StudentType } from '#lib/data/schemas';
import {
	setEquipmentTier,
	setEquipmentTierTarget,
	setGear,
	setGearTarget,
	setIsTarget,
	setLevel,
	setLevelTarget,
	setSkillLevel,
	setSkillLevelTarget,
	setStar,
	setStarTarget,
	setWeapon,
	setWeaponTarget,
	maximizeStudent,
	removeStudentFromSquad,
	upgradeStudentEquipments
} from '#lib/deck/mutate';
import {
	equipmentTierMaxOf,
	gearMaxOf,
	skillLevelMaxOf,
	STAR_MAX,
	WEAPON_MAX
} from '#lib/deck/types';
import type { DeckStudentState } from '#lib/deck/types';
import { StarRatingState } from '#lib/ui/star-rating/star-rating.svelte.js';
import { CDN_BASE } from '#lib/config.ts';

export interface StudentCardOpts extends ReadableBoxedValues<{
	id: number;
	terrain: string | undefined;
	folded: boolean;
}> {
	app: AppState;
}

/** Resolved equipment slot for one of the student's three equipment categories. */
export interface StudentEquipmentSlotType {
	category: string;
	iconUrl: string;
	label: string;
	value: number;
	targetValue: number;
	max: number;
}

/** Resolved skill slot (deck skill levels joined with static skill metadata). */
export interface StudentSkillSlotType {
	key: string;
	iconUrl: string;
	label: string;
	value: number;
	targetValue: number;
	max: number;
	typeText: string;
	typeClass: string;
}

export class StudentCardState {
	static create(opts: StudentCardOpts): StudentCardState {
		return new StudentCardState(opts);
	}

	readonly opts: StudentCardOpts;

	constructor(opts: StudentCardOpts) {
		this.opts = opts;
		this.onLevelInput = this.onLevelInput.bind(this);

		/* ratings (star / weapon) — controlled live views over deck state, writes routed to mutations */
		this.starRating = StarRatingState.create({
			value: boxWith(() => {
				const d = this.d;
				return d ? (d.isTarget ? d.starTarget : d.star) : 0;
			}),
			max: boxWith(() => STAR_MAX),
			disabled: boxWith(() => false),
			onValueChange: (v) => {
				const d = this.d;
				const student = this.student;
				if (!d || !student) return;
				if (d.isTarget) setStarTarget(d, v);
				else setStar(d, v, student);
			}
		});
		this.weaponRating = StarRatingState.create({
			value: boxWith(() => {
				const d = this.d;
				return d ? (d.isTarget ? d.weaponTarget : d.weapon) : 0;
			}),
			max: boxWith(() => WEAPON_MAX),
			disabled: boxWith(() =>
				this.d ? (this.d.isTarget ? this.d.starTarget : this.d.star) !== STAR_MAX : false
			),
			onValueChange: (v) => {
				const d = this.d;
				if (!d) return;
				if (d.isTarget) setWeaponTarget(d, v);
				else setWeapon(d, v);
			}
		});
	}

	get id() {
		return this.opts.id.current;
	}

	get app() {
		return this.opts.app;
	}

	get terrain() {
		return this.opts.terrain.current;
	}

	get folded() {
		return this.opts.folded.current;
	}

	get game(): GameDataType | null {
		return this.app.game;
	}

	get student(): StudentType | undefined {
		return this.game ? getStudent(this.game, this.id) : undefined;
	}

	get d(): DeckStudentState | undefined {
		return this.app.deck?.students[this.id];
	}

	readonly isAlt = $derived(this.id > ALT_OFFSET);
	readonly isTarget = $derived(this.d?.isTarget ?? false);
	readonly starReached = $derived(this.d ? this.d.star === this.d.starTarget : false);
	readonly weaponReached = $derived(this.d ? this.d.weapon === this.d.weaponTarget : false);
	readonly levelValue = $derived(
		this.d ? (this.d.isTarget ? this.d.levelTarget : this.d.level) : 0
	);

	readonly starRating: StarRatingState;
	readonly weaponRating: StarRatingState;

	/* Terrain adaptation incl. the UE bonus at max weapon level. */
	readonly adaptation = $derived.by(() => {
		const student = this.student;
		const d = this.d;
		if (!this.terrain || !student || !d) return null;
		const values: Record<string, number> = {
			Indoor: student.indoorBattleAdaptation,
			Outdoor: student.outdoorBattleAdaptation,
			Street: student.streetBattleAdaptation
		};
		if (d.weapon === WEAPON_MAX) {
			values[student.weapon.adaptationType] += student.weapon.adaptationValue;
		}
		return values[this.terrain] ?? null;
	});

	readonly isUpgraded = $derived.by(() => {
		const d = this.d;
		const student = this.student;
		if (!d || !student || !this.game) return false;
		return d.equipments.every(
			(equipment, index) => equipment.tierTarget === equipmentTierMaxOf(this.game!, student, index)
		);
	});

	readonly skills = $derived.by(() => {
		const student = this.student;
		const d = this.d;
		if (!student || !d || !this.game) return [];
		const slots: StudentSkillSlotType[] = [];
		student.skills.forEach((skill, index) => {
			const entry = d.skills[index];
			slots.push({
				key: skill.skillType,
				iconUrl: skillIconUrl(skill.icon ?? ''),
				label: skill.name,
				value: d.isTarget ? (entry?.levelTarget ?? 0) : (entry?.level ?? 0),
				targetValue: entry?.levelTarget ?? 0,
				max: skillLevelMaxOf(student, index),
				typeText: this.game!.localization.skillTypeShort(skill.skillType),
				typeClass: `bg-${student.bulletType.toLowerCase()}`
			});
		});
		return slots;
	});

	readonly equipments = $derived.by(() => {
		const student = this.student;
		const d = this.d;
		const game = this.game;
		if (!student || !d || !game) return [];
		const slots: StudentEquipmentSlotType[] = [];
		student.equipment.forEach((category, index) => {
			const entry = d.equipments[index];
			const displayTier = d.isTarget ? (entry?.tierTarget ?? 0) : (entry?.tier ?? 0);
			const equipmentId =
				game.equipmentsByCategory.get(category as never)?.get(Math.max(1, displayTier)) ?? -1;
			const equipment = game.equipments.get(equipmentId);
			slots.push({
				category,
				iconUrl: equipment ? `${CDN_BASE}/images/equipment/icon/${equipment.icon}.webp` : '',
				label: equipment?.name ?? '',
				value: displayTier,
				targetValue: entry?.tierTarget ?? 0,
				max: equipmentTierMaxOf(game, student, index)
			});
		});
		return slots;
	});

	readonly gear = $derived.by(() => {
		const student = this.student;
		const d = this.d;
		if (!student || !d) return null;
		return {
			iconUrl: gearIconUrl(student),
			label: student.name,
			value: d.isTarget ? d.gearTarget : d.gear,
			targetValue: d.gearTarget,
			max: gearMaxOf(student)
		};
	});

	/* ---------------------------------------------------------------- */
	/* Input handling                                                    */
	/* ---------------------------------------------------------------- */

	onLevelInput(event: Event): void {
		const input = event.currentTarget as HTMLInputElement;
		const d = this.d;
		if (!d || !this.game) return;
		const value = Number.parseInt(input.value, 10);
		const fn = d.isTarget ? setLevelTarget : setLevel;
		fn(d, Number.isFinite(value) ? value : 0, this.game);
	}

	setSkillLevel(index: number, v: number): void {
		const d = this.d;
		const student = this.student;
		if (!d || !student) return;
		(d.isTarget ? setSkillLevelTarget : setSkillLevel)(d, index, v, student);
	}

	setEquipmentTierAt(index: number, v: number): void {
		const d = this.d;
		const student = this.student;
		if (!d || !student || !this.game) return;
		(d.isTarget ? setEquipmentTierTarget : setEquipmentTier)(d, index, v, this.game, student);
	}

	setGearLevel(v: number): void {
		const d = this.d;
		const student = this.student;
		if (!d || !student) return;
		(d.isTarget ? setGearTarget : setGear)(d, v, student);
	}

	/* ---------------------------------------------------------------- */
	/* Card actions                                                      */
	/* ---------------------------------------------------------------- */

	removeFromSquad(): void {
		const squad = this.app.selectedSquad;
		if (squad) removeStudentFromSquad(squad, this.id);
	}

	toggleTarget(): void {
		const d = this.d;
		if (d) setIsTarget(d, !d.isTarget);
	}

	upgradeEquipments(): void {
		const d = this.d;
		if (d && this.student && this.game) upgradeStudentEquipments(d, this.game, this.student);
	}

	maximize(): void {
		const d = this.d;
		if (d && this.student && this.game) maximizeStudent(d, this.game, this.student);
	}
}
