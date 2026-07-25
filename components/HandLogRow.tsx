import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { HandRecord, TEAM_LABELS } from '../lib/types';
import { colors, fonts, motion } from '../lib/theme';

export function HandLogRow({ hand, animateIn = false }: { hand: HandRecord; animateIn?: boolean }) {
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(animateIn && !reducedMotion ? 0 : 1);
  const translateX = useSharedValue(animateIn && !reducedMotion ? -8 : 0);

  useEffect(() => {
    if (animateIn && !reducedMotion) {
      opacity.value = withTiming(1, { duration: motion.screenIn });
      translateX.value = withTiming(0, { duration: motion.screenIn });
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  const madeBid = hand.madeBid;

  return (
    <Animated.View style={[styles.row, animatedStyle]}>
      <View style={styles.badge}>
        <Text style={styles.badgeLabel}>{hand.handNumber}</Text>
      </View>
      <View style={styles.bidRow}>
        <Text style={styles.bidLabel}>
          <Text style={{ color: hand.biddingTeam === 'A' ? colors.feltGreen : colors.cardRed, textTransform: 'uppercase' }}>
            {TEAM_LABELS[hand.biddingTeam]}
          </Text>{' '}
          bjöd
        </Text>
        <View style={styles.bidCircle}>
          <Text style={styles.bidCircleLabel}>{hand.bidAmount}</Text>
        </View>
      </View>
      <View style={[styles.pill, { backgroundColor: madeBid ? colors.successTint : colors.dangerTint }]}>
        <Text style={[styles.pillLabel, { color: madeBid ? colors.feltGreen : colors.cardRed }]}>
          {madeBid ? 'Klarade' : 'Missade'}
        </Text>
      </View>
      <Text style={styles.totals}>
        <Text style={{ color: colors.feltGreen }}>{hand.runningTotalA}</Text>
        <Text style={{ color: colors.dash }}> – </Text>
        <Text style={{ color: colors.cardRed }}>{hand.runningTotalB}</Text>
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: colors.segmentTrack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLabel: { fontFamily: fonts.bold, fontSize: 12, color: colors.muted },
  bidRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  bidLabel: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink },
  bidCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.controlBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bidCircleLabel: { fontFamily: fonts.bold, fontSize: 12, color: colors.ink },
  pill: { borderRadius: 999, paddingVertical: 3, paddingHorizontal: 9 },
  pillLabel: { fontFamily: fonts.bold, fontSize: 11 },
  totals: { fontFamily: fonts.bold, fontSize: 14, fontVariant: ['tabular-nums'] },
});
