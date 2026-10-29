/**
 * RoyalVegas — Tailwind CSS Theme Configuration
 */
tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Cinzel', 'serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
                casino: {
                    bg: '#090514',
                    card: '#130b24',
                    surface: '#1c1033',
                    border: '#311b54',
                    gold: '#fbbf24',
                    goldDark: '#d97706',
                    purple: '#a855f7',
                    purpleDark: '#6b21a8',
                    neon: '#e879f9'
                }
            }
        }
    }
};
