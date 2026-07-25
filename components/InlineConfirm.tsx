import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../lib/theme';
import { ScalePressable } from './ScalePressable';

export function InlineConfirm({
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.message}>{message}</Text>
      <ScalePressable
        style={styles.confirmButton}
        onPress={onConfirm}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={confirmLabel}
      >
        <Text style={styles.confirmLabel}>{confirmLabel}</Text>
      </ScalePressable>
      <ScalePressable
        style={styles.cancelButton}
        onPress={onCancel}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Nej"
      >
        <Text style={styles.cancelLabel}>Nej</Text>
      </ScalePressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  message: { fontFamily: fonts.semibold, fontSize: 13, color: colors.muted },
  confirmButton: {
    backgroundColor: colors.cardRed,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 14,
  },
  confirmLabel: { fontFamily: fonts.bold, fontSize: 13, color: colors.cream },
  cancelButton: {
    borderWidth: 1,
    borderColor: colors.controlBorder,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  cancelLabel: { fontFamily: fonts.semibold, fontSize: 13, color: colors.muted },
});
