import { CDN_BASE } from './constant';

export const RAID_ICONS: string[] = [];
export const EXTRA_ICONS: string[] = [];

const raids = ['Binah', 'Chesed', 'Shirokuro', 'Hieronymus', 'KaitenFxMk0', 'Perorozilla', 'HOD', 'Goz'];
for (const raid of raids) {
	RAID_ICONS.push(`${CDN_BASE}/images/raid/icon/Icon_${raid}.png`);
	RAID_ICONS.push(`${CDN_BASE}/images/raid/icon/Icon_${raid}_Insane.png`);
}

const extras = [
	'images/items/Currency_Icon_AP.png',
	'images/items/Currency_Icon_Exp.png',
	'images/items/Currency_Icon_Gem.png',
	'images/items/Currency_Icon_Gold.png',
	'images/items/Currency_Icon_MasterCoin.png',
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
	'images/items/Currency_Icon_RaidTicket.png',
	'images/items/Currency_Icon_AcademyTicket.png',
	'images/items/Currency_Icon_ArenaTicket.png',
	'images/items/Currency_Icon_ChaserATicket.png',
	'images/items/Currency_Icon_ChaserBTicket.png',
	'images/items/Currency_Icon_ChaserCTicket.png',
	'images/items/Currency_Icon_ChaserTotalTicket.png',
	'images/items/Currency_Icon_SchoolATicket.png',
	'images/items/Currency_Icon_SchoolBTicket.png',
	'images/items/Currency_Icon_SchoolCTicket.png',
	'images/items/Currency_Icon_SchoolTotalTicket.png',
	'images/items/Currency_Icon_TimeAttackTicket.png',
	'images/items/Currency_Icon_WorldRaidCommonTicket.png',
];

for (const extra of extras) {
	EXTRA_ICONS.push(`${CDN_BASE}/${extra}`);
}
