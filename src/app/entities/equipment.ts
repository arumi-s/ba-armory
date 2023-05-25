import { Expose, Type } from 'class-transformer';

import { environment } from '../../environments/environment';
import { EquipmentRarity, EquipmentRecipe, EquipmentStatType, EquipmentStatValue, IsReleased, ItemCategory, StuffCategory } from './enum';

export class Equipment {
	@Expose({ name: 'Id' })
	id: number;
	@Expose({ name: 'Category' })
	category: ItemCategory;
	@Expose({ name: 'Rarity' })
	rarity: EquipmentRarity;
	@Expose({ name: 'Tier' })
	tier: number;
	@Expose({ name: 'Icon' })
	icon: string;
	@Expose({ name: 'Name' })
	name: string;
	@Expose({ name: 'Desc' })
	desc: string;
	@Expose({ name: 'IsReleased' })
	@Type(() => Boolean)
	isReleased: IsReleased;
	@Expose({ name: 'StatType' })
	@Type(() => String)
	statType: EquipmentStatType[];
	@Expose({ name: 'StatValue' })
	@Type(() => Array)
	statValue: EquipmentStatValue[];
	@Expose({ name: 'Recipe' })
	@Type(() => Array)
	recipe?: EquipmentRecipe[];
	@Expose({ name: 'RecipeCost' })
	recipeCost?: number;

	@Expose({ name: 'Tags' })
	@Type(() => String)
	tags?: string[];

	get iconUrl() {
		if (this.isItem()) {
			return `${environment.CDN_BASE}/images/items/${this.icon}.png`;
		}
		return `${environment.CDN_BASE}/images/equipment/${this.icon}.png`;
	}

	isItem() {
		return this.category === StuffCategory.Material || this.category === StuffCategory.SecretStone || this.category === StuffCategory.Favor;
	}

	isEquipment() {
		return !this.isItem();
	}

	isEleph() {
		return this.category === StuffCategory.SecretStone;
	}
}
