/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,jsx}'],
	theme: {
		extend: {
			colors: {
				primary: {
					50: '#f0f4ff',
					100: '#e0e9ff',
					200: '#c7d5ff',
					300: '#a4b5ff',
					400: '#7b8bff',
					500: '#5865f2',
					600: '#4752d4',
					700: '#3c42aa',
					800: '#313486',
					900: '#2a2b6b',
					950: '#17183d',
				},
				accent: {
					50: '#fef3f2',
					100: '#fee4e2',
					200: '#fecdca',
					300: '#fda8a3',
					400: '#f97066',
					500: '#f04438',
					600: '#d92d20',
					700: '#b42318',
					800: '#912018',
					900: '#55160c',
				},
				success: {
					50: '#f0fdf4',
					100: '#dcfce7',
					200: '#bbf7d0',
					300: '#86efac',
					400: '#4ade80',
					500: '#22c55e',
					600: '#16a34a',
					700: '#15803d',
					800: '#166534',
					900: '#145231',
				},
			},
			boxShadow: {
				card: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
				'card-lg': '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
			},
		},
	},
	plugins: [],
};
