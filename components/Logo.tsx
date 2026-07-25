import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../lib/theme';

export function Logo({
  variant = 'header',
  theme,
}: {
  variant?: 'primary' | 'header';
  theme?: 'light' | 'dark';
}) {
  // Header sits on the Felt Green nav bar (dark); the primary lockup sits on the
  // app's Cream body background (light) — brand kit: never mix the dark/light pairs.
  const resolvedTheme = theme ?? (variant === 'primary' ? 'light' : 'dark');
  const wordmarkColor = resolvedTheme === 'light' ? colors.ink : colors.cream;
  const viColor = resolvedTheme === 'light' ? colors.feltGreen : colors.sage;
  const deColor = resolvedTheme === 'light' ? colors.cardRed : colors.warmCoral;

  const wordmarkSize = variant === 'primary' ? 56 : 24;
  const taglineSize = variant === 'primary' ? Math.round(wordmarkSize * 0.35) : 12;
  const stackGap = Math.round(wordmarkSize * 0.17);
  const taglineGap = Math.max(4, Math.round(taglineSize * 0.45));
  const dividerWidth = Math.max(1.5, Math.round(taglineSize * 0.12));
  const dividerHeight = Math.round(taglineSize * 1.08);
  const wordmarkLetterSpacing = wordmarkSize <= 24 ? wordmarkSize * -0.02 : wordmarkSize * -0.03;
  const taglineLetterSpacing = taglineSize * 0.18;

  return (
    <View style={variant === 'primary' ? styles.stack : styles.row}>
      <Text
        style={[
          styles.wordmark,
          { fontSize: wordmarkSize, letterSpacing: wordmarkLetterSpacing, color: wordmarkColor },
          variant === 'primary' ? { marginBottom: stackGap } : { marginRight: 10 },
        ]}
      >
        Pidro
      </Text>
      <View style={[styles.tagline, { gap: taglineGap }]}>
        <Text style={[styles.tag, { fontSize: taglineSize, letterSpacing: taglineLetterSpacing, color: viColor }]}>
          VI
        </Text>
        <View
          style={[
            styles.divider,
            { width: dividerWidth, height: dividerHeight, borderRadius: dividerWidth / 2, backgroundColor: deColor },
          ]}
        />
        <Text style={[styles.tag, { fontSize: taglineSize, letterSpacing: taglineLetterSpacing, color: deColor }]}>
          DE
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  wordmark: { fontFamily: fonts.wordmark },
  tagline: { flexDirection: 'row', alignItems: 'center' },
  tag: { fontFamily: fonts.tagline },
  divider: { transform: [{ rotate: '18deg' }] },
});
