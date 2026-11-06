import React, { useState, useEffect, useRef } from 'react';
import { Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate, Easing, useReducedMotion } from 'react-native-reanimated';
import useFinePointer from '../hooks/useFinePointer';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Drop-in replacement for TouchableOpacity/Pressable with a SMOOTH, CURSOR-
 * DRIVEN 3D hover: the element tilts in 3D (rotateX/rotateY) toward wherever
 * the pointer sits on it, plus a lift + scale, all eased on the UI thread.
 * Layout/style of the original element is preserved exactly.
 *
 * Hover only arms for a fine pointer that can actually hover — touch devices
 * fire hover on tap, which would make every button jump on every tap. Under
 * `prefers-reduced-motion` the movement is dropped and press is answered with
 * opacity instead, so the control still confirms it was heard without moving.
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

  const reduced = useReducedMotion();
  const finePointer = useFinePointer();
  const h = useSharedValue(0);   // hover progress
  const pr = useSharedValue(0);  // press progress
  const rx = useSharedValue(0);  // rotateX (deg)
  const ry = useSharedValue(0);  // rotateY (deg)
  const pressScale = 1 - (1 - activeOpacity) * 0.35;

  const canHover = finePointer && !disabled;
  const still = !!reduced;
  const lift = still ? 0 : hoverLift;
  const scale = still ? 1 : hoverScale;
  const tilt = still ? 0 : maxTilt;
  const squish = still ? 1 : pressScale;

  useEffect(() => {
    h.value = withTiming(hover && canHover ? 1 : 0, { duration: hoverDuration, easing: Easing.out(Easing.cubic) });
  }, [hover, canHover, hoverDuration, h]);
  useEffect(() => {
    pr.value = withTiming(press && !disabled ? 1 : 0, { duration: 120, easing: Easing.out(Easing.quad) });
  }, [press, disabled, pr]);
  // Tilt target depends on the pointer position within the element.
  useEffect(() => {
    const tx = hover && canHover ? (0.5 - pt.y) * 2 * tilt : 0;
    const ty = hover && canHover ? (pt.x - 0.5) * 2 * tilt : 0;
    rx.value = withTiming(tx, { duration: 150, easing: Easing.out(Easing.cubic) });
    ry.value = withTiming(ty, { duration: 150, easing: Easing.out(Easing.cubic) });
  }, [hover, pt, canHover, tilt, rx, ry]);

  const anim = useAnimatedStyle(() => {
    if (still) {
      return { opacity: interpolate(pr.value, [0, 1], [1, 0.78]) };
    }
    return {
      transform: [
        { perspective: 800 },
        { rotateX: `${rx.value}deg` },
        { rotateY: `${ry.value}deg` },
        { translateY: interpolate(h.value, [0, 1], [0, lift]) },
        { scale: interpolate(h.value, [0, 1], [1, scale]) * interpolate(pr.value, [0, 1], [1, squish]) },
      ],
    };
  });

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
