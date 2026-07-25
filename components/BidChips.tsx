import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../lib/theme';
import { ScalePressable } from './ScalePressable';

const COLUMNS = 5;
const GAP = 8;

export function BidChips({
  value,
  onChange,
  min,
  max,
  teamColor,
}: {
  value: number | null;
  onChange: (bid: number) => void;
  min: number;
  max: number;
  teamColor: string;
}) {
  const [containerWidth, setContainerWidth] = useState(0);
  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const chipSize = containerWidth > 0 ? (containerWidth - GAP * (COLUMNS - 1)) / COLUMNS : 0;

  const onLayout = (e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width);

  return (
    <View style={styles.grid} onLayout={onLayout}>
      {options.map((option) => {
        const selected = option === value;
        return (
          <ScalePressable
            key={option}
            activeScale={0.92}
            onPress={() => onChange(option)}
            accessibilityRole="button"
            accessibilityLabel={`Bud ${option}`}
            accessibilityState={{ selected }}
            style={[
              styles.chip,
              chipSize ? { width: chipSize } : { flexGrow: 1, minWidth: 44 },
              {
                backgroundColor: selected ? teamColor : colors.inset,
                borderColor: selected ? teamColor : colors.controlBorder,
              },
            ]}
          >
            <Text style={[styles.label, { color: selected ? colors.cream : colors.ink }]}>{option}</Text>
          </ScalePressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  chip: {
    height: 44,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontFamily: fonts.bold, fontSize: 16 },
});
