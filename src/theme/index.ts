import { alpha, createTheme, type PaletteMode, type ThemeOptions } from '@mui/material/styles'

export const brand = {
  primary: '#111827',
  secondary: '#C56A3D',
  accent: '#D4A017',
  background: '#F8F9FA',
  card: '#FFFFFF',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  free: '#22C55E',
  occupied: '#3B82F6',
  preparing: '#F97316',
  payment: '#8B5CF6',
} as const

const typography = {
  fontFamily: '"Inter", "Poppins", "Helvetica", "Arial", sans-serif',
  h1: { fontFamily: '"Poppins", "Inter", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
  h2: { fontFamily: '"Poppins", "Inter", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
  h3: { fontFamily: '"Poppins", "Inter", sans-serif', fontWeight: 600, letterSpacing: '-0.01em' },
  h4: { fontFamily: '"Poppins", "Inter", sans-serif', fontWeight: 600 },
  h5: { fontFamily: '"Poppins", "Inter", sans-serif', fontWeight: 600 },
  h6: { fontFamily: '"Poppins", "Inter", sans-serif', fontWeight: 600 },
  button: { fontFamily: '"Inter", sans-serif', fontWeight: 600, textTransform: 'none' as const },
  subtitle1: { fontWeight: 500 },
  subtitle2: { fontWeight: 500 },
}

function getDesignTokens(mode: PaletteMode): ThemeOptions {
  const isLight = mode === 'light'

  return {
    palette: {
      mode,
      primary: {
        main: brand.primary,
        light: '#1F2937',
        dark: '#030712',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: brand.secondary,
        light: '#D4895F',
        dark: '#A3542E',
        contrastText: '#FFFFFF',
      },
      warning: { main: brand.warning },
      success: { main: brand.success },
      error: { main: brand.error },
      info: { main: brand.occupied },
      background: {
        default: isLight ? brand.background : '#0B0F17',
        paper: isLight ? brand.card : '#151B28',
      },
      text: {
        primary: isLight ? brand.primary : '#F9FAFB',
        secondary: isLight ? '#6B7280' : '#9CA3AF',
      },
      divider: isLight ? alpha(brand.primary, 0.08) : alpha('#FFFFFF', 0.08),
    },
    typography,
    shape: { borderRadius: 12 },
    shadows: [
      'none',
      '0 1px 2px rgba(17, 24, 39, 0.04)',
      '0 2px 8px rgba(17, 24, 39, 0.06)',
      '0 4px 16px rgba(17, 24, 39, 0.08)',
      '0 8px 24px rgba(17, 24, 39, 0.1)',
      '0 12px 32px rgba(17, 24, 39, 0.12)',
      '0 16px 40px rgba(17, 24, 39, 0.14)',
      '0 20px 48px rgba(17, 24, 39, 0.16)',
      ...Array(17).fill('0 24px 56px rgba(17, 24, 39, 0.18)'),
    ] as ThemeOptions['shadows'],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundImage: isLight
              ? `radial-gradient(ellipse at top left, ${alpha(brand.secondary, 0.06)}, transparent 40%),
                 radial-gradient(ellipse at bottom right, ${alpha(brand.accent, 0.05)}, transparent 35%)`
              : `radial-gradient(ellipse at top left, ${alpha(brand.secondary, 0.12)}, transparent 40%),
                 radial-gradient(ellipse at bottom right, ${alpha(brand.accent, 0.08)}, transparent 35%)`,
            backgroundAttachment: 'fixed',
          },
          '*::-webkit-scrollbar': { width: 8, height: 8 },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: isLight ? alpha(brand.primary, 0.2) : alpha('#FFF', 0.2),
            borderRadius: 8,
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 10,
            paddingInline: 18,
            paddingBlock: 10,
            fontWeight: 600,
          },
          containedPrimary: {
            background: `linear-gradient(135deg, ${brand.primary} 0%, #1F2937 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, #030712 0%, ${brand.primary} 100%)`,
            },
          },
          containedSecondary: {
            background: `linear-gradient(135deg, ${brand.secondary} 0%, #D4895F 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, #A3542E 0%, ${brand.secondary} 100%)`,
            },
          },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: `1px solid ${isLight ? alpha(brand.primary, 0.06) : alpha('#FFF', 0.06)}`,
            backgroundImage: 'none',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: 'none',
            backgroundImage: isLight
              ? `linear-gradient(180deg, ${brand.primary} 0%, #1a2332 100%)`
              : `linear-gradient(180deg, #0B0F17 0%, #151B28 100%)`,
            color: '#F9FAFB',
          },
        },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0, color: 'transparent' },
        styleOverrides: {
          root: {
            backdropFilter: 'blur(12px)',
            backgroundColor: isLight ? alpha(brand.background, 0.85) : alpha('#0B0F17', 0.85),
            borderBottom: `1px solid ${isLight ? alpha(brand.primary, 0.06) : alpha('#FFF', 0.06)}`,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600, borderRadius: 8 },
        },
      },
      MuiTextField: {
        defaultProps: { size: 'medium' },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': { borderRadius: 12 },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 20 },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 500,
          },
        },
      },
    },
  }
}

export function createAppTheme(mode: PaletteMode) {
  return createTheme(getDesignTokens(mode))
}
