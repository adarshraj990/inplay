// ─── Indplay Brand Theme ───────────────────────────────────────────────────
export const Colors = {
  // Core palette
  background:    '#1A1A2E',   // brand background
  surface:       '#24243E',   // slightly lighter surface
  surfaceCard:   '#1F1F35',   // deep card bg
  surfaceBorder: '#2D2D4B',   // subtle border / divider
  deepBlue:      '#0F3460',   // deep blue for gradients

  // Accent
  turquoise:     '#00D4C8',   // primary turquoise
  turquoiseDim:  '#00A89E',   // darker turquoise
  saffron:       '#FF9F1C',   // saffron / orange CTA
  saffronDim:    '#CC7A00',

  // Text
  textPrimary:   '#F0F0FF',
  textSecondary: '#9494B8',
  textMuted:     '#5A5A7A',

  // Status
  online:        '#4ADE80',
  warning:       '#FBBF24',
  danger:        '#F87171',

  // Gradient stops
  gradientTurquoise: ['#00D4C8', '#0097A7'],
  gradientSaffron:   ['#FF9F1C', '#FF6B35'],
  gradientCard:      ['#1A1A2E', '#0F3460'],
  gradientHero:      ['#0F3460', '#16213E'],
};

export const Typography = {
  fontBold:    'System',
  fontSemi:    'System',
  fontRegular: 'System',

  // Scale
  hero:    32,
  h1:      26,
  h2:      20,
  h3:      17,
  body:    15,
  caption: 13,
  tiny:    11,
};

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

export const Radius = {
  sm:   8,
  md:   14,
  lg:   20,
  xl:   28,
  xxl:  36,
  full: 999,
};

export const Shadows = {
  card: {
    shadowColor: '#00D4C8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  glow: {
    shadowColor: '#FF9F1C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
};
