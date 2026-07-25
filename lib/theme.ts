export const colors = {
  bg: '#F4EFE5',

  // Pidro VI/DE brand kit tokens (design_handoff_pidro_logo)
  feltGreen: '#1F5C43',
  deepFelt: '#16412F',
  cardRed: '#C0392B',
  warmCoral: '#E4785F',
  cream: '#F4EFE5',
  sage: '#A8C8B8',
  ink: '#1E1B16',
  muted: '#5C564A',

  // On light backgrounds, VI/DE use Felt Green + Card Red (never Sage/Warm Coral — brand kit contrast rule).
  teamA: '#1F5C43',
  teamADim: '#16412F',
  teamB: '#C0392B',
  teamBDim: '#8E2C21',

  danger: '#C0392B',
  success: '#1F5C43',

  // Surfaces — "Warm & Alive" redesign
  card: '#FBF7EE',
  cardBorder: '#E7DFCE',
  inset: '#F8F3E7',
  segmentTrack: '#EFE7D5',
  controlBorder: '#E0D8C6',
  progressTrack: '#EDE5D3',
  hairline: '#F0E8D7',
  dash: '#B9AF99',
  soft: '#CFC5AF',
  pedroCard: '#FFFDF7',
  pedroCardBorder: '#E3DBC9',

  // Tint pills
  successTint: '#E1EDE4',
  dangerTint: '#F6E1DD',

  // On the Felt Green header/overlay
  headerControlBg: 'rgba(244,239,229,0.14)',
  overlayBorder: 'rgba(244,239,229,0.4)',
};

export const fonts = {
  wordmark: 'SpaceGrotesk_700Bold',
  tagline: 'SpaceGrotesk_600SemiBold',
  medium: 'SpaceGrotesk_500Medium',
  semibold: 'SpaceGrotesk_600SemiBold',
  bold: 'SpaceGrotesk_700Bold',
};

export const radii = {
  pill: 999,
  cardLg: 18,
  card: 16,
  button: 14,
  segmentContainer: 13,
  segment: 10,
  chip: 11,
  badge: 9,
  checkbox: 7,
  pedroCard: 8,
};

export const shadows = {
  card: {
    shadowColor: '#1E1B16',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  primaryButton: {
    shadowColor: '#1F5C43',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.26,
    shadowRadius: 18,
    elevation: 6,
  },
  segment: {
    shadowColor: '#1E1B16',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  pedroCard: {
    shadowColor: '#1E1B16',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
} as const;

export const motion = {
  screenIn: 350,
  countUp: 800,
  barWidth: 800,
  chipFloat: 1300,
  press: 120,
  winPop: 500,
  overlayIn: 350,
};
