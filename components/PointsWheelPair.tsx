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

export const ITEM_HEIGHT = 44;

// Presentational only: how many rows are visible in the wheel's window at
// once. Must stay odd so the highlight bar sits on a centered row. This is
// the only thing `visibleRows` affects — it has no bearing on the gesture
// math below, which operates purely in terms of ITEM_HEIGHT and row index.
function getWheelMetrics(visibleRows: number) {
  const half = (visibleRows - 1) / 2;
  return { wheelHeight: ITEM_HEIGHT * visibleRows, edgePadding: ITEM_HEIGHT * half };
}

// How long a wheel must sit still, with no finger on it, before its position
// is committed. Commits must never happen mid-gesture: correcting the offset
// while the user is dragging fights the finger, and committing intermediate
// rows is what let the two complementary wheels trigger each other forever.
const SETTLE_DEBOUNCE = 140;

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
  visibleRows?: 3 | 5;
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
  visibleRows = 5,
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
        visibleRows={visibleRows}
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
        visibleRows={visibleRows}
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
  visibleRows,
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
  visibleRows: 3 | 5;
}) {
  const { wheelHeight, edgePadding } = getWheelMetrics(visibleRows);
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useSharedValue((value - min) * ITEM_HEIGHT);
  const internalIndexRef = useRef(value - min);
  const didMountRef = useRef(false);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // touchingRef covers finger-on-wheel (touch events, which also exist on
  // web); draggingRef covers the native scroll gesture, which on iOS keeps
  // going after the touch is cancelled in favour of the scroll. While either
  // is set the wheel belongs to the user: no commits, no programmatic
  // scrolls.
  const touchingRef = useRef(false);
  const draggingRef = useRef(false);
  const reducedMotion = useReducedMotion();

  const rowCount = max - min + 1;
  const rowValues = useMemo(() => Array.from({ length: rowCount }, (_, i) => min + i), [rowCount, min]);

  useEffect(() => {
    const index = clamp(value - min, 0, rowCount - 1);
    const target = index * ITEM_HEIGHT;
    if (!didMountRef.current) {
      didMountRef.current = true;
      internalIndexRef.current = index;
      scrollY.value = target;
      scrollRef.current?.scrollTo({ y: target, animated: false });
      return;
    }
    if (index === internalIndexRef.current) return;
    internalIndexRef.current = index;
    // The user's gesture wins over an external value change; their settle
    // will re-commit and re-sync both wheels anyway.
    if (touchingRef.current || draggingRef.current) return;
    clearTimeout(settleTimerRef.current);
    scrollY.value = target;
    // Never animated: an animated sync emits scroll events that can commit
    // intermediate rows, which is how the two wheels used to feed back into
    // each other until the app locked up.
    scrollRef.current?.scrollTo({ y: target, animated: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, min]);

  useEffect(() => () => clearTimeout(settleTimerRef.current), []);

  const commitFromOffset = (offsetY: number) => {
    const index = clamp(Math.round(offsetY / ITEM_HEIGHT), 0, rowCount - 1);
    const target = index * ITEM_HEIGHT;
    if (Math.abs(offsetY - target) > 0.5) {
      // Non-animated on purpose: on native, snapToInterval already animates
      // the wheel onto a row, so this only cleans up sub-row drift; on web,
      // browsers silently drop smooth scrolls in background tabs, which
      // would leave the wheel resting between two rows.
      scrollRef.current?.scrollTo({ y: target, animated: false });
      scrollY.value = target;
    }
    if (index !== internalIndexRef.current) {
      internalIndexRef.current = index;
      onChange(min + index);
    }
    // Failsafe: if a touchend was ever swallowed, the parent's scroll lock
    // must still release once the wheel settles.
    onInteractionEnd?.();
  };

  const scheduleSettle = () => {
    clearTimeout(settleTimerRef.current);
    settleTimerRef.current = setTimeout(() => {
      if (touchingRef.current || draggingRef.current) return;
      commitFromOffset(scrollY.value);
    }, SETTLE_DEBOUNCE);
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.value = e.nativeEvent.contentOffset.y;
    if (!touchingRef.current && !draggingRef.current) scheduleSettle();
  };

  const handleTouchStart = () => {
    touchingRef.current = true;
    clearTimeout(settleTimerRef.current);
    onInteractionStart?.();
  };

  const handleTouchEnd = () => {
    touchingRef.current = false;
    scheduleSettle();
    onInteractionEnd?.();
  };

  const handleScrollBeginDrag = () => {
    draggingRef.current = true;
    clearTimeout(settleTimerRef.current);
    onInteractionStart?.();
  };

  const handleScrollEndDrag = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    draggingRef.current = false;
    scrollY.value = e.nativeEvent.contentOffset.y;
    // Momentum may still follow; the trailing settle (re-armed by each
    // momentum scroll event) or onMomentumScrollEnd does the commit.
    scheduleSettle();
    onInteractionEnd?.();
  };

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    draggingRef.current = false;
    clearTimeout(settleTimerRef.current);
    scrollY.value = e.nativeEvent.contentOffset.y;
    if (!touchingRef.current) commitFromOffset(e.nativeEvent.contentOffset.y);
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

      <View style={[styles.wheel, { height: wheelHeight }]}>
        <View
          pointerEvents="none"
          style={[styles.highlightBar, { backgroundColor: highlightColor, top: edgePadding }]}
        />
        <ScrollView
          ref={scrollRef}
          style={[{ height: wheelHeight }, webWheelStyle]}
          contentContainerStyle={{ paddingVertical: edgePadding }}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          scrollEventThrottle={16}
          nestedScrollEnabled
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onScroll={handleScroll}
          onScrollBeginDrag={handleScrollBeginDrag}
          onScrollEndDrag={handleScrollEndDrag}
          onMomentumScrollEnd={handleMomentumEnd}
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
    width: '100%',
    justifyContent: 'center',
  },
  highlightBar: {
    position: 'absolute',
    left: 0,
    right: 0,
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
