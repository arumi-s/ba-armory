import { ArmorType, BulletType } from './enum';

export interface Config {
	links: Link[];
	build: number;
	Regions: Region[];
	Changelog: Changelog[];
	TypeEffectiveness: BulletTypeEffectivenessMap;
	GachaGroups: GachaGroup[];
}

export interface Changelog {
	date: string;
	contents: string[];
}

export interface GachaGroup {
	Id: number;
	ItemList: Array<number[]>;
}

export interface Region {
	Name: string;
	StudentMaxLevel: number;
	WeaponMaxLevel: number;
	BondMaxLevel: number;
	EquipmentMaxLevel: number[];
	CampaignMax: number;
	CampaignExtra: boolean;
	Events: number[];
	Event701Max: number[];
	ChaserMax: number;
	BloodMax: number;
	FindGiftMax: number;
	SchoolDungeonMax: number;
	FurnitureSetMax: number;
	FurnitureTemplateMax: number;
	CurrentGacha: CurrentGacha[];
	CurrentEvents: CurrentEvent[];
	CurrentRaid: CurrentRAID[];
}

export interface CurrentEvent {
	event: number;
	start: number;
	end: number;
}

export interface CurrentGacha {
	characters: number[];
	start: number;
	end: number;
}

export interface CurrentRAID {
	type: string;
	raid: number;
	terrain?: string;
	start: number;
	end: number;
}

export type BulletTypeEffectivenessMap = Record<BulletType, BulletTypeEffectiveness>;

export type BulletTypeEffectiveness = Record<ArmorType, number>;

export interface Link {
	section: string;
	content: Content[];
}

export interface Content {
	title: string;
	description: string;
	url: string;
	author: string;
}
