const theme = {
  colors: {
    background: '#E5E5E5',
    foreground: '#000000',
    white: '#FFFFFF',
    gray: {
      100: '#F5F5F5',
      200: '#E5E5E5',
      300: '#D4D4D4',
      400: '#A3A3A3',
      500: '#737373',
      600: '#525252',
    },
    accent: {
      blue: 'rgba(70, 130, 255, 0.6)',
      blueGlow: 'rgba(70, 130, 255, 0.15)',
    },
  },
  fonts: {
    primary: "'Outfit', sans-serif",
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.25rem',
    xl: '1.5rem',
    '2xl': '2rem',
    '3xl': '3rem',
    '4xl': '4rem',
    '5xl': '5rem',
    '6xl': '6rem',
    hero: 'clamp(2.5rem, 6vw, 5.5rem)',
  },
  fontWeights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
  },
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1440px',
  },
  transitions: {
    fast: '0.15s ease',
    normal: '0.3s ease',
    slow: '0.6s ease',
    spring: '0.8s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  zIndex: {
    base: 0,
    content: 10,
    header: 100,
    overlay: 200,
    modal: 300,
    vignette: 9999,
  },
} as const;

export type Theme = typeof theme;
export default theme;
