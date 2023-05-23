import { CDN_BASE } from './constant';

export const RAID_ICONS: string[] = [];
export const EXTRA_ICONS: string[] = [];

const raids = ['Binah', 'Chesed', 'Shirokuro', 'Hieronymus', 'KaitenFxMk0', 'Perorozilla', 'HOD', 'Goz'];
for (const raid of raids) {
	RAID_ICONS.push(`${CDN_BASE}/images/raid/icon/Icon_${raid}.png`);
	RAID_ICONS.push(`${CDN_BASE}/images/raid/icon/Icon_${raid}_Insane.png`);
}

const extras = [
	'images/items/Item_Icon_RaidCoin.png',
	'images/items/Item_Icon_ArenaCoin.png',
	'images/items/Item_Icon_RaidCoin_High.png',
	'images/items/Item_Icon_ExpItem_0.png',
	'images/items/Item_Icon_ExpItem_1.png',
	'images/items/Item_Icon_ExpItem_2.png',
	'images/items/Item_Icon_ExpItem_3.png',
	'images/items/Item_Icon_SecretStone.png',
	'images/items/Item_Icon_TimeAttackCoin.png',
	'images/items/Item_Icon_ChaserCoin.png',
	'images/items/Item_Icon_Favor_SSR_1.png',
	'images/items/Item_Icon_SkillBook_Ultimate.png',
	'images/items/Item_Icon_Event_Token_Special_0.png',
	'images/items/Item_Icon_Event_Token_Special_1.png',
	'images/items/Item_Icon_Event_Item_0.png',
];

for (const extra of extras) {
	EXTRA_ICONS.push(`${CDN_BASE}/${extra}`);
}
