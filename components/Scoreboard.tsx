import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, fonts, motion, radii, shadows } from '../lib/theme';
import { DeltaChip } from './DeltaChip';

function CountUpScore({ total }: { total: number }) {
  const reducedMotion = useReducedMotion();
  const value = useSharedValue(total);
  const isFirst = useRef(true);
  const [display, setDisplay] = useState(total);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      value.value = total;
      setDisplay(total);
      return;
    }
    if (reducedMotion) {
      value.value = total;
      setDisplay(total);
      return;
    }
    value.value = withTiming(total, { duration: motion.countUp, easing: Easing.out(Easing.cubic) });
  }, [total]);

  useAnimatedReaction(
    () => Math.round(value.value),
    (result, prev) => {
      if (result !== prev) runOnJS(setDisplay)(result);
    }
  );

  return <Text style={styles.scoreValue}>{display}</Text>;
}

function RaceBar({ total, target, color }: { total: number; target: number; color: string }) {
  const reducedMotion = useReducedMotion();
  const pct = Math.max(0, Math.min(100, (total / target) * 100));
  const width = useSharedValue(pct);
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      width.value = pct;
      return;
    }
    if (reducedMotion) {
      width.value = pct;
      return;
    }
    width.value = withTiming(pct, { duration: motion.barWidth, easing: Easing.bezier(0.22, 1, 0.36, 1) });
  }, [pct]);

  const animatedStyle = useAnimatedStyle(() => ({ width: `${width.value}%` }));

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, { backgroundColor: color }, animatedStyle]} />
    </View>
  );
}

export function Scoreboard({
  nameA,
  nameB,
  totalA,
  totalB,
  target,
  flashA,
  flashB,
}: {
  nameA: string;
  nameB: string;
  totalA: number;
  totalB: number;
  target: number;
  flashA: { key: number; delta: number } | null;
  flashB: { key: number; delta: number } | null;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.col}>
          {flashA && <DeltaChip key={flashA.key} delta={flashA.delta} />}
          <Text style={[styles.teamName, { color: colors.feltGreen }]}>{nameA}</Text>
          <CountUpScore total={totalA} />
        </View>
        <View style={styles.col}>
          {flashB && <DeltaChip key={flashB.key} delta={flashB.delta} />}
          <Text style={[styles.teamName, { color: colors.cardRed }]}>{nameB}</Text>
          <CountUpScore total={totalB} />
        </View>
      </View>
      <View style={styles.barsRow}>
        <View style={styles.barsCol}>
          <RaceBar total={totalA} target={target} color={colors.feltGreen} />
          <RaceBar total={totalB} target={target} color={colors.cardRed} />
        </View>
        <Text style={styles.finishLabel}>{target}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radii.cardLg,
    padding: 14,
    paddingBottom: 12,
    ...shadows.card,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  col: { flex: 1, alignItems: 'center', position: 'relative' },
  teamName: { fontFamily: fonts.bold, fontSize: 17, letterSpacing: 2, textTransform: 'uppercase' },
  scoreValue: {
    fontFamily: fonts.bold,
    fontSize: 46,
    lineHeight: 51,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  barsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  barsCol: { flex: 1, gap: 6 },
  track: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.progressTrack,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 999 },
  finishLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.muted,
    borderLeftWidth: 2,
    borderLeftColor: colors.soft,
    borderStyle: 'dashed',
    paddingLeft: 8,
    lineHeight: 22,
  },
});
