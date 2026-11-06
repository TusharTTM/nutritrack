import React from 'react';
import { Pressable } from 'react-native';

/**
 * Drop-in replacement for TouchableOpacity that adds a web hover effect
 * (gentle lift + scale) on top of the usual press feedback. Use it anywhere a
 * button/tappable should feel interactive on hover.
 */
export default function AppTouchable({
  children, style, onPress, activeOpacity = 0.72,
  hoverLift = -2, hoverScale = 1.02, disabled = false, ...rest
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed, hovered }) => [
        style,
        hovered && !disabled ? { transform: [{ translateY: hoverLift }, { scale: hoverScale }] } : null,
        pressed && !disabled ? { opacity: activeOpacity } : null,
      ]}
      {...rest}
    >
      {children}
    </Pressable>
  );
}
