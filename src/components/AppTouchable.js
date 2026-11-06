import React, { useState, useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate, Easing } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Drop-in replacement for TouchableOpacity/Pressable that adds a SMOOTH web
 * hover effect (eased lift + scale) plus a gentle press-scale, while keeping
 * the exact layout/style of the original element. Hover/press are animated on
 * the UI thread via Reanimated so nothing snaps.
 */
export default function AppTouchable({
  children, style, onPress, activeOpacity = 0.72,
  hoverLift = -3, hoverScale = 1.03, hoverDuration = 180, disabled = false, ...rest
}) {
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  const h = useSharedValue(0);
  const pr = useSharedValue(0);
  // Map the legacy "activeOpacity" (0..1) onto a subtle press scale so it still
  // feels responsive without clobbering any opacity set in `style`.
  const pressScale = 1 - (1 - activeOpacity) * 0.35;

  useEffect(() => {
    h.value = withTiming(hover && !disabled ? 1 : 0, { duration: hoverDuration, easing: Easing.out(Easing.cubic) });
  }, [hover, disabled, hoverDuration, h]);
  useEffect(() => {
    pr.value = withTiming(press && !disabled ? 1 : 0, { duration: 120, easing: Easing.out(Easing.quad) });
  }, [press, disabled, pr]);

  const anim = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(h.value, [0, 1], [0, hoverLift]) },
      { scale: interpolate(h.value, [0, 1], [1, hoverScale]) * interpolate(pr.value, [0, 1], [1, pressScale]) },
    ],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      onHoverIn={() => { if (!disabled) setHover(true); }}
      onHoverOut={() => setHover(false)}
      onPressIn={() => { if (!disabled) setPress(true); }}
      onPressOut={() => setPress(false)}
      style={[style, anim]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
