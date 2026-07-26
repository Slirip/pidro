import { useEffect } from 'react';
import { AccessibilityRole, StyleSheet, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, fonts } from '../lib/theme';
import { ScalePressable } from './ScalePressable';

function Tab({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(selected ? 1 : 0, { duration: 200 });
  }, [selected]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], ['transparent', colors.feltGreen]),
    shadowOpacity: 0.18 * progress.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [colors.muted, colors.cream]),
  }));

  return (
    <ScalePressable
      style={[styles.tab, animatedStyle]}
      activeScale={0.97}
      onPress={onPress}
      accessibilityRole={'button' as AccessibilityRole}
      accessibilityLabel={label}
      accessibilityState={{ selected }}
    >
      <Animated.Text style={[styles.label, textStyle]} numberOfLines={1}>
        {label}
      </Animated.Text>
    </ScalePressable>
  );
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { key: T; label: string }[];
  value: T;
  onChange: (key: T) => void;
}) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <Tab key={tab.key} label={tab.label} selected={value === tab.key} onPress={() => onChange(tab.key)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: colors.segmentTrack,
    borderRadius: 13,
    padding: 4,
  },
  tab: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 0,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    letterSpacing: 0.2,
  },
});
