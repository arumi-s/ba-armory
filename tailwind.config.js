/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{html,ts}"],
	theme: {
		extend: {
			maxWidth: {
				bounded: "100rem",
			},
			opacity: {
				15: "15%",
			},
			rotate: {
				35: "35deg",
			},
		},
	},
	plugins: [],
};
