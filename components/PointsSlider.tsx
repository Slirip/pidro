import { useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, PanResponder, Platform, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors, fonts, motion, radii, shadows } from '../lib/theme';

const THUMB_SIZE = 28;
const TRACK_HEIGHT = 8;

// On the web, dragging the thumb is otherwise interpreted by the browser as
// a back/forward navigation swipe. `touchAction` is a web-only style
// property, so it's kept out of the native StyleSheet and typed loosely.
const webNoTouchAction =
  Platform.OS === 'web' ? ({ touchAction: 'none' } as unknown as Record<string, unknown>) : undefined;

export function PointsSlider({
  value,
  onChange,
  min,
  max,
  subLabel,
  teamColor,
  bidAmount,
}: {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  subLabel: string;
  teamColor: string;
  bidAmount: number | null;
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const trackRef = useRef<View>(null);
  const trackPageX = useRef(0);
  const valueRef = useRef(value);
  valueRef.current = value;

  const belowBid = bidAmount != null && value < bidAmount;
  const activeColor = belowBid ? colors.danger : teamColor;

  const usableWidth = Math.max(trackWidth - THUMB_SIZE, 1);

  const setFromPageX = (pageX: number) => {
    const x = Math.max(0, Math.min(usableWidth, pageX - trackPageX.current - THUMB_SIZE / 2));
    const ratio = x / usableWidth;
    const next = Math.round(min + ratio * (max - min));
    if (next !== valueRef.current) onChange(next);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => setFromPageX(evt.nativeEvent.pageX),
        onPanResponderMove: (evt, gestureState) => setFromPageX(gestureState.moveX || evt.nativeEvent.pageX),
      }),
    [usableWidth, min, max]
  );

  const onLayout = (_e: LayoutChangeEvent) => {
    trackRef.current?.measure((_x, _y, width, _height, pageX) => {
      trackPageX.current = pageX;
      setTrackWidth(width);
    });
  };

  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  const thumbLeft = usableWidth * (pct / 100);

  const fillStyle = useAnimatedStyle(() => ({
    width: withTiming(`${pct}%`, { duration: motion.press }),
  }));
  const thumbStyle = useAnimatedStyle(() => ({
    left: withTiming(thumbLeft, { duration: motion.press }),
  }));

  return (
    <View>
      <View style={styles.header}>
        <Text style={[styles.value, belowBid && styles.valueBelow]}>{value}</Text>
        {belowBid && <Text style={styles.holeTag}>Håla!</Text>}
      </View>
      <Text style={styles.subLabel}>{subLabel}</Text>

      <View
        ref={trackRef}
        style={[styles.track, webNoTouchAction]}
        onLayout={onLayout}
        {...panResponder.panHandlers}
        accessibilityRole="adjustable"
        accessibilityLabel="Poäng"
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
        <Animated.View style={[styles.fill, { backgroundColor: activeColor }, fillStyle]} />
        <Animated.View style={[styles.thumb, { borderColor: activeColor }, thumbStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: 10 },
  value: {
    fontSize: 36,
    fontFamily: fonts.bold,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
    lineHeight: 40,
    textAlign: 'center',
  },
  valueBelow: { color: colors.danger },
  holeTag: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.danger,
    backgroundColor: colors.dangerTint,
    borderRadius: radii.chip,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  subLabel: { fontSize: 12, fontFamily: fonts.medium, color: colors.muted, textAlign: 'center', marginTop: 2 },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: 999,
    backgroundColor: colors.progressTrack,
    marginTop: 22,
    justifyContent: 'center',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    position: 'absolute',
    left: 0,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.card,
    borderWidth: 3,
    top: -(THUMB_SIZE - TRACK_HEIGHT) / 2,
    ...shadows.segment,
  },
});
