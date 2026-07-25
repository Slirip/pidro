import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors, fonts } from '../lib/theme';

export function DeltaChip({ delta }: { delta: number }) {
  const reducedMotion = useReducedMotion();
  const translateY = useSharedValue(reducedMotion ? 0 : 10);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(reducedMotion ? 1 : 0);

  useEffect(() => {
    if (reducedMotion) {
      opacity.value = withDelay(700, withTiming(0, { duration: 200 }));
      return;
    }
    scale.value = 0.8;
    translateY.value = withSequence(withTiming(0, { duration: 286 }), withTiming(-32, { duration: 1014 }));
    scale.value = withTiming(1, { duration: 286 });
    opacity.value = withSequence(
      withTiming(1, { duration: 286 }),
      withDelay(624, withTiming(0, { duration: 390 }))
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const bg = delta >= 0 ? colors.feltGreen : colors.cardRed;
  const text = `${delta >= 0 ? '+' : '−'}${Math.abs(delta)}`;

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.chip, { backgroundColor: bg }, animatedStyle]}>
        <Text style={styles.label}>{text}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: -6,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  chip: {
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.cream,
  },
});
