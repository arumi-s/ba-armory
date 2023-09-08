import { environment } from '../../environments/environment';

export const RAID_ICONS: string[] = [];
export const EXTRA_ICONS: string[] = [];

const raids = ['Binah', 'Chesed', 'Shirokuro', 'Hieronymus', 'KaitenFxMk0', 'Perorozilla', 'HOD', 'Goz'];
for (const raid of raids) {
	RAID_ICONS.push(`${environment.CDN_BASE}/images/raid/icon/Icon_${raid}.png`);
	RAID_ICONS.push(`${environment.CDN_BASE}/images/raid/icon/Icon_${raid}_Insane.png`);
}

const extras = [
	'images/items/icon/currency_icon_ap.webp',
	'images/items/icon/currency_icon_gem.webp',
	'images/items/icon/currency_icon_gold.webp',
	'images/items/icon/currency_icon_mastercoin.webp',
	'images/items/icon/item_icon_raidcoin.webp',
	'images/items/icon/item_icon_arenacoin.webp',
	'images/items/icon/item_icon_raidcoin_high.webp',
	'images/items/icon/item_icon_expitem_0.webp',
	'images/items/icon/item_icon_expitem_1.webp',
	'images/items/icon/item_icon_expitem_2.webp',
	'images/items/icon/item_icon_expitem_3.webp',
	'images/items/icon/item_icon_secretstone.webp',
	'images/items/icon/item_icon_timeattackcoin.webp',
	'images/items/icon/item_icon_chasercoin.webp',
	'images/items/icon/item_icon_favor_ssr_1.webp',
	'images/items/icon/item_icon_skillbook_ultimate.webp',
	'images/items/icon/item_icon_event_token_special_0.webp',
	'images/items/icon/item_icon_event_token_special_1.webp',
	'images/items/icon/item_icon_event_item_0.webp',
	'images/items/icon/currency_icon_raidticket.webp',
	'images/items/icon/currency_icon_academyticket.webp',
	'images/items/icon/currency_icon_arenaticket.webp',
	'images/items/icon/currency_icon_chaseraticket.webp',
	'images/items/icon/currency_icon_chaserbticket.webp',
	'images/items/icon/currency_icon_chasercticket.webp',
	'images/items/icon/currency_icon_chasertotalticket.webp',
	'images/items/icon/currency_icon_schoolaticket.webp',
	'images/items/icon/currency_icon_schoolbticket.webp',
	'images/items/icon/currency_icon_schoolcticket.webp',
	'images/items/icon/currency_icon_schooltotalticket.webp',
	'images/items/icon/currency_icon_timeattackticket.webp',
	'images/items/icon/currency_icon_worldraidcommonticket.webp',
];

for (const extra of extras) {
	EXTRA_ICONS.push(`${environment.CDN_BASE}/${extra}`);
}
