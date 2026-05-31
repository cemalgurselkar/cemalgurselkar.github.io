/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
        './app/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                // Custom Dark Blue Palette
                primary: {
                    DEFAULT: 'var(--bg-color)',
                    light: 'var(--surface-color)',
                    dark: 'var(--bg-color)',
                },
                accent: {
                    DEFAULT: 'var(--accent-color)',
                    hover: 'var(--accent-color)',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
