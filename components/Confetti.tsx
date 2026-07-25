import { useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { colors } from '../lib/theme';

const CONFETTI_COLORS = [colors.sage, colors.warmCoral, colors.cream, colors.cardRed, '#EAD9A0'];
const PIECE_COUNT = 90;

function ConfettiPiece({ height }: { height: number }) {
  const spec = useMemo(
    () => ({
      left: Math.random() * 100,
      width: 6 + Math.random() * 6,
      height: 10 + Math.random() * 8,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      duration: 2600 + Math.random() * 2000,
      delay: Math.random() * 1200,
    }),
    []
  );

  const progress = useSharedValue(0);
  progress.value = withDelay(
    spec.delay,
    withTiming(1, { duration: spec.duration, easing: Easing.bezier(0.25, 0.6, 0.45, 1) })
  );

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = -0.04 * height + progress.value * (1.08 * height - -0.04 * height);
    const rotate = progress.value * 620;
    const opacity = progress.value === 0 ? 0 : 1 - progress.value * 0.1;
    return {
      opacity,
      transform: [{ translateY }, { rotate: `${rotate}deg` }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          left: `${spec.left}%`,
          width: spec.width,
          height: spec.height,
          backgroundColor: spec.color,
        },
        animatedStyle,
      ]}
    />
  );
}

export function Confetti() {
  const { height } = Dimensions.get('window');
  const pieces = useMemo(() => Array.from({ length: PIECE_COUNT }, (_, i) => i), []);

  return (
    <View style={styles.wrap} pointerEvents="none">
      {pieces.map((i) => (
        <ConfettiPiece key={i} height={height} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' },
  piece: { position: 'absolute', top: -24, borderRadius: 2 },
});
