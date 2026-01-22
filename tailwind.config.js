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
  			// RCBC Blue - extracted from logo (#4A90A4)
  			rcbc: {
  				'50': '#f0f7fa',
  				'100': '#e0eff5',
  				'200': '#b8dce9',
  				'300': '#8cc6da',
  				'400': '#5facc8',
  				'500': '#4A90A4', // RCBC primary blue
  				'600': '#3d7a8c',
  				'700': '#336574',
  				'800': '#2a515d',
  				'900': '#1e3a44',
  				'950': '#142830'
  			},
  			// Neutral slate palette for modern banking
  			slate: {
  				'50': '#f8fafc',
  				'100': '#f1f5f9',
  				'200': '#e2e8f0',
  				'300': '#cbd5e1',
  				'400': '#94a3b8',
  				'500': '#64748b',
  				'600': '#475569',
  				'700': '#334155',
  				'800': '#1e293b',
  				'900': '#0f172a',
  				'950': '#020617'
  			},
  			// Keep legacy names for compatibility but map to new colors
  			matcha: {
  				'50': '#f0f7fa',
  				'100': '#e0eff5',
  				'200': '#b8dce9',
  				'300': '#8cc6da',
  				'400': '#5facc8',
  				'500': '#4A90A4',
  				'600': '#3d7a8c',
  				'700': '#336574',
  				'800': '#2a515d',
  				'900': '#1e3a44'
  			},
  			cream: {
  				'50': '#f8fafc',
  				'100': '#f1f5f9',
  				'200': '#e2e8f0',
  				'300': '#cbd5e1',
  				'400': '#94a3b8',
  				'500': '#64748b',
  				'600': '#475569',
  				'700': '#334155',
  				'800': '#1e293b',
  				'900': '#0f172a'
  			},
  			sage: '#5facc8',
  			navy: '#1e3a44',
  			grey: '#64748b',
  			beige: '#f1f5f9',
  			primary: {
  				'50': '#f0f7fa',
  				'100': '#e0eff5',
  				'200': '#b8dce9',
  				'300': '#8cc6da',
  				'400': '#5facc8',
  				'500': '#4A90A4',
  				'600': '#3d7a8c',
  				'700': '#336574',
  				'800': '#2a515d',
  				'900': '#1e3a44',
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