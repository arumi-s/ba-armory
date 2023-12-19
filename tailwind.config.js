/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{html,ts}"],
	theme: {
		extend: {
			colors: {
				Explosion: "#9b291f",
				Pierce: "#aa712c",
				Mystic: "#4a7ca3",
				Sonic: "#9431a5",
				LightArmor: "#9b291f",
				HeavyArmor: "#aa712c",
				Unarmed: "#4a7ca3",
				ElasticArmor: "#9431a5",
				Main: "#cc1a25",
				Support: "#006bff",
				Eleph: "#dd6dd5",
				Terrain: "#22c55e",
			},
			fontFamily: {
				sans: [
					'"Helvetica Neue"',
					"Helvetica",
					'"PingFang SC"',
					'"Hiragino Sans GB"',
					'"Microsoft YaHei"',
					'"微软雅黑"',
					"Arial",
					"sans-serif",
				],
			},
			fontSize: {
				"2xs": ["0.625rem", "0.75rem"],
			},
			width: {
				25: "6.25rem",
				7.5: "1.875rem",
			},
			maxWidth: {
				bounded: "100rem",
			},
			height: {
				25: "6.25rem",
				7.5: "1.875rem",
			},
			opacity: {
				12: "12%",
				15: "15%",
			},
			rotate: {
				35: "35deg",
			},
			skew: {
				10: "10deg",
			},
		},
	},
	safelist: [
		"bg-Explosion",
		"bg-Pierce",
		"bg-Mystic",
		"bg-Sonic",
		"bg-LightArmor",
		"bg-HeavyArmor",
		"bg-Unarmed",
		"bg-ElasticArmor",
		"bg-Main",
		"bg-Support",
	],
	plugins: [],
};
