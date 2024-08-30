import { environment } from '../../environments/environment';

export const RAID_ICONS: string[] = [];
export const EXTRA_ICONS: string[] = [];

const raids = [
	'Binah',
	'Chesed',
	'Shirokuro',
	'Hieronymus',
	'KaitenFxMk0',
	'Perorozilla',
	'HOD',
	'Goz',
	'EN0005',
	'RaidHoverCraft',
	'EN0006',
];
for (const raid of raids) {
	RAID_ICONS.push(`${environment.CDN_BASE}/images/raid/icon/Icon_${raid}.png`);
	RAID_ICONS.push(`${environment.CDN_BASE}/images/raid/icon/Icon_${raid}_Insane.png`);
}

const extras = [
	'images/raid/icon/Icon_EN0008.png',
	'images/item/icon/currency_icon_ap.webp',
	'images/item/icon/currency_icon_gem.webp',
	'images/item/icon/currency_icon_gold.webp',
	'images/item/icon/currency_icon_mastercoin.webp',
	'images/item/icon/item_icon_raidcoin.webp',
	'images/item/icon/item_icon_arenacoin.webp',
	'images/item/icon/item_icon_raidcoin_high.webp',
	'images/item/icon/item_icon_expitem_0.webp',
	'images/item/icon/item_icon_expitem_1.webp',
	'images/item/icon/item_icon_expitem_2.webp',
	'images/item/icon/item_icon_expitem_3.webp',
	'images/item/icon/item_icon_workbook_potentialmaxhp.webp',
	'images/item/icon/item_icon_workbook_potentialattack.webp',
	'images/item/icon/item_icon_workbook_potentialhealpower.webp',
	'images/item/icon/item_icon_secretstone.webp',
	'images/item/icon/item_icon_timeattackcoin.webp',
	'images/item/icon/item_icon_chasercoin.webp',
	'images/item/icon/item_icon_eliminateraidcoin.webp',
	'images/item/icon/item_icon_eliminateraidcoin_high.webp',
	'images/item/icon/item_icon_favor_ssr_1.webp',
	'images/item/icon/item_icon_skillbook_ultimate.webp',
	'images/item/icon/item_icon_event_token_special_0.webp',
	'images/item/icon/item_icon_event_token_special_1.webp',
	'images/item/icon/item_icon_event_item_0.webp',
	'images/item/icon/currency_icon_raidticket.webp',
	'images/item/icon/currency_icon_academyticket.webp',
	'images/item/icon/currency_icon_arenaticket.webp',
	'images/item/icon/currency_icon_chaseraticket.webp',
	'images/item/icon/currency_icon_chaserbticket.webp',
	'images/item/icon/currency_icon_chasercticket.webp',
	'images/item/icon/currency_icon_chasertotalticket.webp',
	'images/item/icon/currency_icon_schoolaticket.webp',
	'images/item/icon/currency_icon_schoolbticket.webp',
	'images/item/icon/currency_icon_schoolcticket.webp',
	'images/item/icon/currency_icon_schooltotalticket.webp',
	'images/item/icon/currency_icon_timeattackticket.webp',
	'images/item/icon/currency_icon_worldraidcommonticket.webp',
	'images/item/icon/item_icon_favor_random.webp',
	'images/item/icon/item_icon_furniture_random.webp',
	'images/item/icon/item_icon_favor_selection.webp',
	'images/item/icon/item_icon_favor_random_lv2.webp',
	'images/item/icon/item_icon_event_token_3_s12.webp',
];

for (const extra of extras) {
	EXTRA_ICONS.push(`${environment.CDN_BASE}/${extra}`);
}
