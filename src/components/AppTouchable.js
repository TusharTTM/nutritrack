import React, { useState, useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate, Easing } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Drop-in replacement for TouchableOpacity/Pressable with a SMOOTH 3D hover:
 * the element eases into a perspective tilt (rotateX/rotateY) + lift + scale,
 * and a gentle press-scale — all animated on the UI thread via Reanimated.
 * Layout/style of the original element is preserved exactly.
 */
export default function AppTouchable({
  children, style, onPress, activeOpacity = 0.72,
  hoverLift = -3, hoverScale = 1.03, hoverDuration = 180,
  tiltX = -6, tiltY = 4, disabled = false, ...rest
}) {
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  const h = useSharedValue(0);
  const pr = useSharedValue(0);
  const pressScale = 1 - (1 - activeOpacity) * 0.35;

  useEffect(() => {
    h.value = withTiming(hover && !disabled ? 1 : 0, { duration: hoverDuration, easing: Easing.out(Easing.cubic) });
  }, [hover, disabled, hoverDuration, h]);
  useEffect(() => {
    pr.value = withTiming(press && !disabled ? 1 : 0, { duration: 120, easing: Easing.out(Easing.quad) });
  }, [press, disabled, pr]);

  const anim = useAnimatedStyle(() => ({
    transform: [
      { perspective: 800 },
      { rotateX: `${interpolate(h.value, [0, 1], [0, tiltX])}deg` },
      { rotateY: `${interpolate(h.value, [0, 1], [0, tiltY])}deg` },
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
