import { ReactNode, useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { motion } from '../lib/theme';

export function ScreenTransition({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(reducedMotion ? 1 : 0);
  const translateY = useSharedValue(reducedMotion ? 0 : 14);

  useEffect(() => {
    if (reducedMotion) return;
    opacity.value = withTiming(1, { duration: motion.screenIn, easing: Easing.bezier(0.22, 1, 0.36, 1) });
    translateY.value = withTiming(0, { duration: motion.screenIn, easing: Easing.bezier(0.22, 1, 0.36, 1) });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[{ flex: 1 }, style, animatedStyle]}>{children}</Animated.View>;
}
