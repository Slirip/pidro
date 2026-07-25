import { useEffect } from 'react';
import { AccessibilityRole, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { TeamId } from '../lib/types';
import { colors, fonts } from '../lib/theme';
import { ScalePressable } from './ScalePressable';

function Segment({
  label,
  selected,
  teamColor,
  onPress,
}: {
  label: string;
  selected: boolean;
  teamColor: string;
  onPress: () => void;
}) {
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(selected ? 1 : 0, { duration: 200 });
  }, [selected]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], ['transparent', teamColor]),
    shadowOpacity: 0.18 * progress.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [colors.muted, colors.cream]),
  }));

  return (
    <ScalePressable
      style={[styles.segment, animatedStyle]}
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

export function TeamSegment({
  value,
  onChange,
  nameA,
  nameB,
}: {
  value: TeamId | null;
  onChange: (team: TeamId) => void;
  nameA: string;
  nameB: string;
}) {
  return (
    <View style={styles.container}>
      <Segment label={nameA} selected={value === 'A'} teamColor={colors.feltGreen} onPress={() => onChange('A')} />
      <Segment label={nameB} selected={value === 'B'} teamColor={colors.cardRed} onPress={() => onChange('B')} />
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
  segment: {
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
    fontSize: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
