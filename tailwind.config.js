/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Wrought Iron & Hardware
        iron: {
          DEFAULT: '#2A2320',
          hover: '#1A1714',
          warm: '#3B3530',
          mid: '#4D4540',
          light: '#5C5550',
          faint: '#6B6358',
        },
        // Aged Paper & Parchment
        parchment: {
          DEFAULT: '#F0E8DA',
          light: '#F5EEDE',
          dark: '#E4D9C8',
        },
        'old-linen': '#D8CCBA',
        'warm-sand': '#C4B5A0',
        'aged-cream': '#EDE3D0',
        // Wood Tones — DEFAULT added so bg-wood, border-wood, text-wood resolve
        wood: {
          DEFAULT: '#8B7D6B',
          pale: '#C4B098',
          light: '#A8956E',
          mid: '#8B7D6B',
          rich: '#6B5B45',
          dark: '#4A3D2E',
          deep: '#3A2F22',
        },
        // Muted Red — added so bg-muted-red, border-muted-red resolve for error states
        'muted-red': '#9E4040',
        // Legacy red aliases
        brick: '#7A2E2E',
        'dusty-red': '#9E4040',
        'warm-red': '#C25555',
        'faded-red': '#B85050',
        rose: '#D4A0A0',
        blush: '#E8D0D0',
        // Muted Blue (accent only)
        'slate-navy': '#2B3E5C',
        'dusty-blue': '#3B5068',
        'steel-blue': '#5B7A9A',
        'soft-blue': '#A8BFD4',
        'ice-blue': '#D0DCE8',
        // Brass / Hardware Accent
        brass: {
          DEFAULT: '#B8975A',
          light: '#D4B878',
          dark: '#8A6E3A',
        },
      },
      fontFamily: {
        // pencil-hand: used by all components for headings/buttons
        'pencil-hand': ['"Architects Daughter"', 'cursive'],
        // Keep 'pencil' as alias for backwards compatibility
        'pencil': ['"Architects Daughter"', 'cursive'],
        'serif': ['"Libre Baskerville"', 'serif'],
        // hand: Caveat — for dollar amounts, costs, statistics
        'hand': ['"Caveat"', 'cursive'],
        'hand-accent': ['"Caveat"', 'cursive'],
        'sans': ['"DM Sans"', 'sans-serif'],
      },
      spacing: {
        'section': '28px',
        'card': '20px',
      },
      borderRadius: {
        'frame': '14px',
        'card': '12px',
      },
      maxWidth: {
        'container': '1300px',
      },
      screens: {
        'mobile': '860px',
      },
    },
  },
  plugins: [],
}
