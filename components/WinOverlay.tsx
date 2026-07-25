import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors, fonts, motion } from '../lib/theme';
import { TeamId } from '../lib/types';
import { Confetti } from './Confetti';
import { ScalePressable } from './ScalePressable';

export function WinOverlay({
  winner,
  winnerName,
  target,
  scoreLine,
  onNewGame,
  onGoHome,
}: {
  winner: TeamId;
  winnerName: string;
  target: number;
  scoreLine: string;
  onNewGame: () => void;
  onGoHome: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const overlayOpacity = useSharedValue(0);
  const popScale = useSharedValue(reducedMotion ? 1 : 0.85);
  const popOpacity = useSharedValue(reducedMotion ? 1 : 0);

  useEffect(() => {
    overlayOpacity.value = withTiming(1, { duration: motion.overlayIn });
    if (!reducedMotion) {
      popScale.value = withSequence(
        withTiming(1.04, { duration: 300, easing: Easing.bezier(0.22, 1, 0.36, 1) }),
        withTiming(1, { duration: 200, easing: Easing.bezier(0.22, 1, 0.36, 1) })
      );
      popOpacity.value = withTiming(1, { duration: motion.winPop });
    }
  }, []);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const popStyle = useAnimatedStyle(() => ({
    opacity: popOpacity.value,
    transform: [{ scale: popScale.value }],
  }));

  return (
    <Animated.View style={[styles.overlay, overlayStyle]}>
      {!reducedMotion && <Confetti />}
      <Animated.View style={[styles.content, popStyle]}>
        <Text style={styles.eyebrow}>FÖRST TILL {target}</Text>
        <Text style={styles.headline} numberOfLines={1}>
          {winnerName} vinner!
        </Text>
        <Text style={styles.scoreLine}>{scoreLine}</Text>
        <View style={styles.buttonRow}>
          <ScalePressable
            style={styles.primaryButton}
            activeScale={0.96}
            onPress={onNewGame}
            accessibilityRole="button"
            accessibilityLabel="Ny match"
          >
            <Text style={styles.primaryLabel}>Ny match</Text>
          </ScalePressable>
          <ScalePressable
            style={styles.secondaryButton}
            activeScale={0.96}
            onPress={onGoHome}
            accessibilityRole="button"
            accessibilityLabel="Till start"
          >
            <Text style={styles.secondaryLabel}>Till start</Text>
          </ScalePressable>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.feltGreen,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: { alignItems: 'center', zIndex: 2 },
  eyebrow: { fontFamily: fonts.semibold, fontSize: 14, letterSpacing: 4, color: colors.sage },
  headline: {
    fontFamily: fonts.bold,
    fontSize: 48,
    color: colors.cream,
    letterSpacing: -1,
    marginTop: 8,
  },
  scoreLine: {
    fontFamily: fonts.semibold,
    fontSize: 22,
    color: colors.sage,
    marginTop: 10,
    fontVariant: ['tabular-nums'],
  },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 32 },
  primaryButton: {
    backgroundColor: colors.cream,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 26,
  },
  primaryLabel: { fontFamily: fonts.bold, fontSize: 16, color: colors.feltGreen },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.overlayBorder,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 26,
  },
  secondaryLabel: { fontFamily: fonts.bold, fontSize: 16, color: colors.cream },
});
