import React, { useEffect } from 'react';
import Animated, { useSharedValue, withTiming, useAnimatedProps, Easing } from 'react-native-reanimated';

const AnimatedText = Animated.Text;

// Animates a number counting up to `value`. Falls back to the exact value as
// its child so it stays correct even if the text-prop animation is unsupported.
export default function AnimatedNumber({ value, style, duration = 900, format }) {
  const sv = useSharedValue(0);
  useEffect(() => {
    sv.value = withTiming(Number(value) || 0, { duration, easing: Easing.out(Easing.cubic) });
  }, [value, duration, sv]);
  const animatedProps = useAnimatedProps(() => {
    const n = Math.round(sv.value);
    return { text: format ? format(n) : String(n) };
  });
  const display = format ? format(Math.round(Number(value) || 0)) : String(Math.round(Number(value) || 0));
  return <AnimatedText style={style} animatedProps={animatedProps}>{display}</AnimatedText>;
}
