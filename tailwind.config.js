/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		screens: {
  			xs: '320px',
  			xxs: '375px',
  			sm: '390px',
  			'sm-plus': '428px',
  			'md-sm': '734px',
  			md: '768px',
  			'md-plus': '834px',
  			lg: '1024px',
  			'lg-plus': '1068px',
  			xl: '1194px',
  			'xl-plus': '1280px',
  			'2xl': '1440px',
  			'3xl': '1920px',
  			'4xl': '2560px'
  		},
  		colors: {
  			matcha: {
  				'50': '#f4f8f3',
  				'100': '#e8f2e5',
  				'200': '#d1e5cc',
  				'300': '#a8cfaa',
  				'400': '#7db384',
  				'500': '#5a9660',
  				'600': '#3d6e42',
  				'700': '#2f5435',
  				'800': '#1e3623',
  				'900': '#0f1b11'
  			},
  			cream: {
  				'50': '#fdfdfb',
  				'100': '#faf8f4',
  				'200': '#f5f1e8',
  				'300': '#ede6d6',
  				'400': '#e3d8c0',
  				'500': '#d4c4a8',
  				'600': '#b8a68a',
  				'700': '#9d8c72',
  				'800': '#7a6e5a',
  				'900': '#5a5245'
  			},
  			sage: '#a8cfaa',
  			navy: '#2f5435',
  			grey: '#7a6e5a',
  			beige: '#f5f1e8',
  			primary: {
  				'50': '#f4f8f3',
  				'100': '#e8f2e5',
  				'200': '#d1e5cc',
  				'300': '#a8cfaa',
  				'400': '#7db384',
  				'500': '#5a9660',
  				'600': '#3d6e42',
  				'700': '#2f5435',
  				'800': '#1e3623',
  				'900': '#0f1b11',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		animation: {
  			'slide-up': 'slideUp 0.3s ease-out'
  		},
  		keyframes: {
  			slideUp: {
  				'0%': {
  					transform: 'translateY(100%)'
  				},
  				'100%': {
  					transform: 'translateY(0)'
  				}
  			}
  		},
		borderRadius: {
			lg: 'var(--radius)',
			md: 'calc(var(--radius) - 2px)',
			sm: 'calc(var(--radius) - 4px)',
			'ios-sm': '0.75rem',
			'ios': '1rem',
			'ios-md': '1.25rem',
			'ios-lg': '1.5rem',
			'ios-xl': '2rem',
			'ios-2xl': '2.5rem',
			'ios-3xl': '3rem'
		}
	}
},
  plugins: [require("tailwindcss-animate")],
}