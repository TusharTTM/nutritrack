import React, { useState, useEffect, useRef } from 'react';
import { Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate, Easing } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Drop-in replacement for TouchableOpacity/Pressable with a SMOOTH, CURSOR-
 * DRIVEN 3D hover: the element tilts in 3D (rotateX/rotateY) toward wherever
 * the pointer sits on it, plus a lift + scale, all eased on the UI thread.
 * Layout/style of the original element is preserved exactly.
 */
export default function AppTouchable({
  children, style, onPress, activeOpacity = 0.72,
  hoverLift = -4, hoverScale = 1.04, hoverDuration = 180,
  maxTilt = 9, disabled = false, ...rest
}) {
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  const [pt, setPt] = useState({ x: 0.5, y: 0.5 }); // normalized pointer 0..1
  const box = useRef({ w: 0, h: 0 });

  const h = useSharedValue(0);   // hover progress
  const pr = useSharedValue(0);  // press progress
  const rx = useSharedValue(0);  // rotateX (deg)
  const ry = useSharedValue(0);  // rotateY (deg)
  const pressScale = 1 - (1 - activeOpacity) * 0.35;

  useEffect(() => {
    h.value = withTiming(hover && !disabled ? 1 : 0, { duration: hoverDuration, easing: Easing.out(Easing.cubic) });
  }, [hover, disabled, hoverDuration, h]);
  useEffect(() => {
    pr.value = withTiming(press && !disabled ? 1 : 0, { duration: 120, easing: Easing.out(Easing.quad) });
  }, [press, disabled, pr]);
  // Tilt target depends on the pointer position within the element.
  useEffect(() => {
    const tx = hover ? (0.5 - pt.y) * 2 * maxTilt : 0;
    const ty = hover ? (pt.x - 0.5) * 2 * maxTilt : 0;
    rx.value = withTiming(tx, { duration: 150, easing: Easing.out(Easing.cubic) });
    ry.value = withTiming(ty, { duration: 150, easing: Easing.out(Easing.cubic) });
  }, [hover, pt, maxTilt, rx, ry]);

  const anim = useAnimatedStyle(() => ({
    transform: [
      { perspective: 800 },
      { rotateX: `${rx.value}deg` },
      { rotateY: `${ry.value}deg` },
      { translateY: interpolate(h.value, [0, 1], [0, hoverLift]) },
      { scale: interpolate(h.value, [0, 1], [1, hoverScale]) * interpolate(pr.value, [0, 1], [1, pressScale]) },
    ],
  }));

  const onMove = (e) => {
    const ne = e.nativeEvent;
    const lx = ne.locationX != null ? ne.locationX : ne.offsetX;
    const ly = ne.locationY != null ? ne.locationY : ne.offsetY;
    const { w, h: hh } = box.current;
    if (w && hh && lx != null && ly != null) setPt({ x: lx / w, y: ly / hh });
  };
  const onLayout = (e) => { const l = e.nativeEvent.layout; box.current = { w: l.width, h: l.height }; };

  return (
    <AnimatedPressable
      {...rest}
      onPress={onPress}
      disabled={disabled}
      onHoverIn={() => { if (!disabled) setHover(true); }}
      onHoverOut={() => { setHover(false); setPt({ x: 0.5, y: 0.5 }); }}
      onPressIn={() => { if (!disabled) setPress(true); }}
      onPressOut={() => setPress(false)}
      onMouseMove={onMove}
      onLayout={onLayout}
      style={[style, anim]}
    >
      {children}
    </AnimatedPressable>
  );
}
