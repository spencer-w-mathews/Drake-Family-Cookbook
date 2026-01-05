import type {DefaultTheme} from 'styled-components'

export const theme: DefaultTheme = {
  colors: {
    berry: '#a63d40',
    berryStrong: '#b74d4f',
    sage: '#6c8f73',
    sageStrong: '#3f6149',
    cream: '#f8f5f1',
    sand: '#e8dfd1',
    ink: '#1f2622',
    muted: '#4f5c52',
    surface: '#ffffff',
    surfaceSoft: '#fffaf3',
    error: '#7c2f32',
  },
  fonts: {
    heading: "'Playfair Display', Georgia, serif",
    body: "'Work Sans', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
  },
  shadows: {
    card: '0 20px 60px rgba(24, 36, 27, 0.12)',
    cardHover: '0 18px 40px rgba(24, 36, 27, 0.16)',
    hero: '0 20px 40px rgba(16, 24, 21, 0.32)',
  },
  radii: {
    lg: '20px',
    md: '14px',
    sm: '12px',
    pill: '999px',
  },
}
