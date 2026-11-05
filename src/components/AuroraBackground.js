import React, { useEffect } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming,
  withSequence, Easing, interpolate,
} from 'react-native-reanimated';
import { useApp } from '../context/AppContext';

// A single slowly-drifting soft gradient blob.
function Blob({ color, size, top, left, right, bottom, opacity, duration, phase, drift = 22 }) {
  const t = useSharedValue(phase);
  useEffect(() => {
    t.value = withRepeat(
      withSequence(
        withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [t, duration]);
  const anim = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(t.value, [0, 1], [-drift, drift]) },
      { translateY: interpolate(t.value, [0, 1], [drift * 0.6, -drift * 0.6]) },
      { scale: interpolate(t.value, [0, 1], [1, 1.14]) },
    ],
  }));
  const pos = { width: size, height: size, borderRadius: size / 2 };
  if (top !== undefined) pos.top = top;
  if (left !== undefined) pos.left = left;
  if (right !== undefined) pos.right = right;
  if (bottom !== undefined) pos.bottom = bottom;
  return (
    <Animated.View style={[styles.blob, pos, { opacity }, anim]} pointerEvents="none">
      <LinearGradient
        colors={[color, color + '00']}
        start={{ x: 0.5, y: 0.35 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
    </Animated.View>
  );
}

// Full-bleed animated backdrop. Drop it behind a screen's content.
export default function AuroraBackground({ intensity = 1 }) {
  const { theme } = useApp();
  const { width, height } = useWindowDimensions();
  const dark = theme === 'dark';
  const blobs = dark
    ? [
        { color: '#FF5A3C', top: -height * 0.12, left: -width * 0.25, size: 420, opacity: 0.5 * intensity, duration: 11000, phase: 0 },
        { color: '#F5A04A', top: height * 0.12, right: -width * 0.3, size: 380, opacity: 0.42 * intensity, duration: 13500, phase: 0.3 },
        { color: '#FF6B8F', bottom: -height * 0.1, left: -width * 0.1, size: 460, opacity: 0.36 * intensity, duration: 15000, phase: 0.6 },
        { color: '#FF8A63', bottom: height * 0.28, right: -width * 0.2, size: 300, opacity: 0.3 * intensity, duration: 12000, phase: 0.85 },
      ]
    : [
        { color: '#FFB59A', top: -height * 0.14, left: -width * 0.25, size: 440, opacity: 0.62 * intensity, duration: 11000, phase: 0 },
        { color: '#FFD48A', top: height * 0.1, right: -width * 0.3, size: 400, opacity: 0.6 * intensity, duration: 13500, phase: 0.3 },
        { color: '#FFAEBE', bottom: -height * 0.1, left: -width * 0.12, size: 460, opacity: 0.5 * intensity, duration: 15000, phase: 0.6 },
        { color: '#FFC38A', bottom: height * 0.3, right: -width * 0.22, size: 320, opacity: 0.45 * intensity, duration: 12000, phase: 0.85 },
      ];
  return (
    <Animated.View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {blobs.map((b, i) => (
        <Blob key={i} {...b} />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  blob: { position: 'absolute' },
});
