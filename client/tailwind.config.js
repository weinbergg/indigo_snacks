var config = {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                bg: 'rgb(var(--color-bg) / <alpha-value>)',
                panel: 'rgb(var(--color-panel) / <alpha-value>)',
                ink: 'rgb(var(--color-ink) / <alpha-value>)',
                muted: 'rgb(var(--color-muted) / <alpha-value>)',
                line: 'rgb(var(--color-line) / <alpha-value>)',
                brand: {
                    DEFAULT: 'rgb(var(--color-brand) / <alpha-value>)',
                    soft: 'rgb(var(--color-brand-soft) / <alpha-value>)',
                    deep: 'rgb(var(--color-brand-deep) / <alpha-value>)',
                    accent: 'rgb(var(--color-accent) / <alpha-value>)'
                }
            },
            boxShadow: {
                soft: '0 18px 60px rgba(12, 35, 35, 0.08)',
                lift: '0 22px 48px rgba(20, 42, 44, 0.14)'
            },
            borderRadius: {
                xl2: '1.75rem'
            },
            fontFamily: {
                display: [
                    '"Cormorant Garamond"',
                    '"Baskerville"',
                    '"Iowan Old Style"',
                    '"Palatino Linotype"',
                    'serif'
                ],
                sans: ['"Manrope"', '"Avenir Next"', '"Segoe UI"', 'sans-serif']
            },
            backgroundImage: {
                glow: 'radial-gradient(circle at top, rgba(21, 89, 89, 0.16), transparent 42%), radial-gradient(circle at bottom right, rgba(151, 126, 89, 0.12), transparent 35%)'
            }
        }
    },
    plugins: []
};
export default config;
