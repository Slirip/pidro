import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../lib/theme';
import { ScalePressable } from './ScalePressable';

export function PointsStepper({
  value,
  onChange,
  min,
  max,
  subLabel,
}: {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  subLabel: string;
}) {
  return (
    <View style={styles.row}>
      <ScalePressable
        style={styles.button}
        activeScale={0.9}
        onPress={() => onChange(Math.max(min, value - 1))}
        accessibilityRole="button"
        accessibilityLabel="Minska poäng"
      >
        <Text style={styles.glyph}>−</Text>
      </ScalePressable>
      <View style={styles.center}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.subLabel}>{subLabel}</Text>
      </View>
      <ScalePressable
        style={styles.button}
        activeScale={0.9}
        onPress={() => onChange(Math.min(max, value + 1))}
        accessibilityRole="button"
        accessibilityLabel="Öka poäng"
      >
        <Text style={styles.glyph}>+</Text>
      </ScalePressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  button: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.controlBorder,
    backgroundColor: colors.inset,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: { fontSize: 24, fontFamily: fonts.medium, color: colors.ink },
  center: { flex: 1, alignItems: 'center' },
  value: { fontSize: 36, fontFamily: fonts.bold, color: colors.ink, fontVariant: ['tabular-nums'], lineHeight: 40 },
  subLabel: { fontSize: 12, fontFamily: fonts.medium, color: colors.muted, marginTop: 2 },
});
