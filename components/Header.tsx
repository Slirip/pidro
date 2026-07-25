import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../lib/theme';
import { ScalePressable } from './ScalePressable';

export function Header({
  showBack,
  onBack,
  rightPill,
}: {
  showBack: boolean;
  onBack: () => void;
  rightPill?: string;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingTop: insets.top + 14 }]}>
      <View style={styles.side}>
        {showBack && (
          <ScalePressable
            style={styles.backButton}
            activeScale={0.92}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Tillbaka"
          >
            <Text style={styles.backGlyph}>‹</Text>
          </ScalePressable>
        )}
      </View>
      <View style={styles.center}>
        <Text style={styles.wordmark}>Pidro</Text>
        <View style={styles.tagline}>
          <Text style={styles.vi}>VI</Text>
          <View style={styles.divider} />
          <Text style={styles.de}>DE</Text>
        </View>
      </View>
      <View style={[styles.side, styles.sideRight]}>
        {rightPill ? (
          <View style={styles.pill}>
            <Text style={styles.pillLabel} numberOfLines={1}>
              {rightPill}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.feltGreen,
    paddingHorizontal: 14,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  side: { width: 64, flexDirection: 'row' },
  sideRight: { justifyContent: 'flex-end' },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: colors.headerControlBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backGlyph: { color: colors.cream, fontSize: 20, lineHeight: 20, fontFamily: fonts.semibold },
  center: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  wordmark: { fontFamily: fonts.bold, fontSize: 20, letterSpacing: -0.4, color: colors.cream },
  tagline: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  vi: { fontFamily: fonts.semibold, fontSize: 10, letterSpacing: 1.8, color: colors.sage },
  de: { fontFamily: fonts.semibold, fontSize: 10, letterSpacing: 1.8, color: colors.warmCoral },
  divider: {
    width: 1.5,
    height: 11,
    borderRadius: 1,
    backgroundColor: colors.warmCoral,
    transform: [{ rotate: '18deg' }],
  },
  pill: {
    backgroundColor: colors.headerControlBg,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  pillLabel: { fontSize: 12, fontFamily: fonts.semibold, color: colors.cream },
});
