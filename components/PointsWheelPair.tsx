import { useEffect, useMemo, useRef } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { TeamId } from '../lib/types';
import { colors, fonts, radii } from '../lib/theme';

const ITEM_HEIGHT = 44;
const VISIBLE_ROWS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ROWS;
const SETTLE_DEBOUNCE = 120;

// On the web, ScrollView renders as a plain scrollable div. Restricting the
// gesture to vertical panning (and containing overscroll so dragging past a
// wheel's end doesn't chain into the page's own scroll) is what keeps this
// control from ever looking like a horizontal swipe to the browser.
const webWheelStyle =
  Platform.OS === 'web'
    ? ({ touchAction: 'pan-y', overscrollBehaviorY: 'contain' } as unknown as Record<string, unknown>)
    : undefined;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export interface PointsWheelPairProps {
  pointsA: number;
  pointsB: number;
  onChangeA: (value: number) => void;
  onChangeB: (value: number) => void;
  min: number;
  max: number;
  biddingTeam: TeamId | null;
  bidAmount: number | null;
  nameA: string;
  nameB: string;
  // Fired while a finger is down on either wheel so the caller can suspend
  // an enclosing ScrollView's own scrolling. On native, a vertical
  // ScrollView nested inside another vertical ScrollView otherwise lets the
  // outer one join the drag, so touching a wheel scrolls the whole screen.
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
}

export function PointsWheelPair({
  pointsA,
  pointsB,
  onChangeA,
  onChangeB,
  min,
  max,
  biddingTeam,
  bidAmount,
  nameA,
  nameB,
  onInteractionStart,
  onInteractionEnd,
}: PointsWheelPairProps) {
  return (
    <View style={styles.row}>
      <WheelColumn
        value={pointsA}
        onChange={onChangeA}
        min={min}
        max={max}
        accentColor={colors.feltGreen}
        highlightTint={colors.successTint}
        label={nameA}
        emphasized={biddingTeam !== 'B'}
        belowBid={biddingTeam !== 'B' && bidAmount != null && pointsA < bidAmount}
        accessibilityLabel={`Poäng till ${nameA}`}
        onInteractionStart={onInteractionStart}
        onInteractionEnd={onInteractionEnd}
      />
      <WheelColumn
        value={pointsB}
        onChange={onChangeB}
        min={min}
        max={max}
        accentColor={colors.cardRed}
        highlightTint={colors.dangerTint}
        label={nameB}
        emphasized={biddingTeam === 'B'}
        belowBid={biddingTeam === 'B' && bidAmount != null && pointsB < bidAmount}
        accessibilityLabel={`Poäng till ${nameB}`}
        onInteractionStart={onInteractionStart}
        onInteractionEnd={onInteractionEnd}
      />
    </View>
  );
}

function WheelColumn({
  value,
  onChange,
  min,
  max,
  accentColor,
  highlightTint,
  label,
  emphasized,
  belowBid,
  accessibilityLabel,
  onInteractionStart,
  onInteractionEnd,
}: {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  accentColor: string;
  highlightTint: string;
  label: string;
  emphasized: boolean;
  belowBid: boolean;
  accessibilityLabel: string;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useSharedValue((value - min) * ITEM_HEIGHT);
  const internalIndexRef = useRef(value - min);
  const didMountRef = useRef(false);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reducedMotion = useReducedMotion();

  const rowCount = max - min + 1;
  const rowValues = useMemo(() => Array.from({ length: rowCount }, (_, i) => min + i), [rowCount, min]);

  useEffect(() => {
    const index = value - min;
    if (index === internalIndexRef.current && didMountRef.current) return;
    internalIndexRef.current = index;
    scrollY.value = index * ITEM_HEIGHT;
    scrollRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: didMountRef.current });
    didMountRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, min]);

  useEffect(() => () => clearTimeout(settleTimerRef.current), []);

  const commitFromOffset = (offsetY: number) => {
    const index = clamp(Math.round(offsetY / ITEM_HEIGHT), 0, rowCount - 1);
    const target = index * ITEM_HEIGHT;
    if (Math.abs(offsetY - target) > 0.5) {
      scrollRef.current?.scrollTo({ y: target, animated: true });
    }
    if (index !== internalIndexRef.current) {
      internalIndexRef.current = index;
      onChange(min + index);
    }
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    scrollY.value = offsetY;
    clearTimeout(settleTimerRef.current);
    settleTimerRef.current = setTimeout(() => commitFromOffset(offsetY), SETTLE_DEBOUNCE);
  };

  const handleSettle = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    clearTimeout(settleTimerRef.current);
    commitFromOffset(e.nativeEvent.contentOffset.y);
  };

  const emphasisProgress = useSharedValue(emphasized ? 1 : 0);
  useEffect(() => {
    emphasisProgress.value = withTiming(emphasized ? 1 : 0, { duration: 200 });
  }, [emphasized, emphasisProgress]);

  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(emphasisProgress.value, [0, 1], [0.55, 1], Extrapolation.CLAMP),
  }));

  const rowColor = belowBid ? colors.danger : accentColor;
  const highlightColor = belowBid ? colors.dangerTint : highlightTint;

  return (
    <View style={styles.column}>
      <Animated.Text style={[styles.columnLabel, { color: accentColor }, labelStyle]} numberOfLines={1}>
        {label}
      </Animated.Text>

      <View style={styles.wheel}>
        <View pointerEvents="none" style={[styles.highlightBar, { backgroundColor: highlightColor }]} />
        <ScrollView
          ref={scrollRef}
          style={[styles.scroll, webWheelStyle]}
          contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          scrollEventThrottle={16}
          nestedScrollEnabled
          onTouchStart={onInteractionStart}
          onTouchEnd={onInteractionEnd}
          onTouchCancel={onInteractionEnd}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleSettle}
          onScrollEndDrag={handleSettle}
          accessibilityRole="adjustable"
          accessibilityLabel={accessibilityLabel}
          accessibilityValue={{ min, max, now: value }}
          accessibilityActions={[
            { name: 'increment', label: 'Öka' },
            { name: 'decrement', label: 'Minska' },
          ]}
          onAccessibilityAction={(event) => {
            if (event.nativeEvent.actionName === 'increment') onChange(Math.min(max, value + 1));
            if (event.nativeEvent.actionName === 'decrement') onChange(Math.max(min, value - 1));
          }}
        >
          {rowValues.map((rowValue, i) => (
            <WheelRow
              key={rowValue}
              rowValue={rowValue}
              index={i}
              scrollY={scrollY}
              color={rowColor}
              reducedMotion={reducedMotion}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

function WheelRow({
  rowValue,
  index,
  scrollY,
  color,
  reducedMotion,
}: {
  rowValue: number;
  index: number;
  scrollY: SharedValue<number>;
  color: string;
  reducedMotion: boolean;
}) {
  const style = useAnimatedStyle(() => {
    const distance = (scrollY.value - index * ITEM_HEIGHT) / ITEM_HEIGHT;
    const abs = Math.min(Math.abs(distance), 2.4);
    const scale = interpolate(abs, [0, 1, 2.4], [1, 0.8, 0.5], Extrapolation.CLAMP);
    const opacity = interpolate(abs, [0, 1, 2.4], [1, 0.5, 0.12], Extrapolation.CLAMP);
    const rotateX = reducedMotion ? 0 : interpolate(distance, [-2.4, 0, 2.4], [55, 0, -55], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ perspective: 500 }, { rotateX: `${rotateX}deg` }, { scale }],
    };
  });

  return (
    <Animated.View style={[styles.rowItem, style]}>
      <Text style={[styles.rowText, { color }]}>{rowValue}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 14 },
  column: { flex: 1, alignItems: 'center' },
  columnLabel: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  wheel: {
    height: WHEEL_HEIGHT,
    width: '100%',
    justifyContent: 'center',
  },
  scroll: {
    height: WHEEL_HEIGHT,
  },
  highlightBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: ITEM_HEIGHT * 2,
    height: ITEM_HEIGHT,
    borderRadius: radii.chip,
  },
  rowItem: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    fontSize: 26,
    fontFamily: fonts.bold,
    fontVariant: ['tabular-nums'],
  },
});
