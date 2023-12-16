/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{html,ts}"],
	theme: {
		extend: {
			fontSize: {
				"2xs": ["0.625rem", "0.75rem"],
			},
			width: {
				25: "6.25rem",
			},
			maxWidth: {
				bounded: "100rem",
			},
			height: {
				25: "6.25rem",
			},
			opacity: {
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
	plugins: [],
};
