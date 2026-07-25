import { ReactNode } from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { motion } from '../lib/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ScalePressable({
  children,
  style,
  activeScale = 0.97,
  disabled,
  restBackgroundColor,
  pressedBackgroundColor,
  ...pressableProps
}: Omit<PressableProps, 'style'> & {
  children: ReactNode;
  style?: StyleProp<ViewStyle> | StyleProp<ViewStyle>[] | object;
  activeScale?: number;
  disabled?: boolean;
  restBackgroundColor?: string;
  pressedBackgroundColor?: string;
}) {
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    ...(restBackgroundColor && pressedBackgroundColor
      ? { backgroundColor: interpolateColor(pressed.value, [0, 1], [restBackgroundColor, pressedBackgroundColor]) }
      : null),
  }));

  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={(e) => {
        scale.value = withTiming(activeScale, { duration: motion.press });
        pressed.value = withTiming(1, { duration: motion.press });
        pressableProps.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withTiming(1, { duration: motion.press });
        pressed.value = withTiming(0, { duration: motion.press });
        pressableProps.onPressOut?.(e);
      }}
      style={[style, animatedStyle, disabled ? { opacity: 0.45 } : null]}
      {...pressableProps}
    >
      {children}
    </AnimatedPressable>
  );
}
