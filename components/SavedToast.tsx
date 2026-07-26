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
import { colors, fonts, motion, radii, shadows } from '../lib/theme';

export function SavedToast({ toastKey }: { toastKey: number | null }) {
  if (toastKey == null) return null;
  return <ToastPill key={toastKey} />;
}

function ToastPill() {
  const reducedMotion = useReducedMotion();
  const translateY = useSharedValue(reducedMotion ? 0 : -10);
  const opacity = useSharedValue(reducedMotion ? 1 : 0);

  useEffect(() => {
    if (reducedMotion) {
      opacity.value = withDelay(motion.chipFloat - 200, withTiming(0, { duration: 200 }));
      return;
    }
    translateY.value = withTiming(0, { duration: 220 });
    opacity.value = withSequence(
      withTiming(1, { duration: 220 }),
      withDelay(motion.chipFloat - 610, withTiming(0, { duration: 390 }))
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.pill, animatedStyle]}>
        <Text style={styles.check}>✓</Text>
        <Text style={styles.label}>Giv sparad</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.feltGreen,
    borderRadius: radii.pill,
    paddingVertical: 8,
    paddingHorizontal: 16,
    ...shadows.primaryButton,
  },
  check: { color: colors.cream, fontSize: 13, fontFamily: fonts.bold },
  label: { color: colors.cream, fontSize: 13, fontFamily: fonts.semibold },
});
