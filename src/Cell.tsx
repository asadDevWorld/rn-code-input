import { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  char: string;
  masked: boolean;
  active: boolean;
  error: boolean;
  style?: StyleProp<ViewStyle>;
  activeStyle?: StyleProp<ViewStyle>;
  filledStyle?: StyleProp<ViewStyle>;
  errorStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Cell({
  char,
  masked,
  active,
  error,
  style,
  activeStyle,
  filledStyle,
  errorStyle,
  textStyle,
}: Props) {
  const pop = useSharedValue(1);
  const fade = useSharedValue(char ? 1 : 0);
  const caret = useSharedValue(1);
  const filled = char.length > 0;

  useEffect(() => {
    if (filled) {
      fade.value = withTiming(1, {
        duration: 120,
        reduceMotion: ReduceMotion.System,
      });
      pop.value = withSequence(
        withTiming(1.12, {
          duration: 90,
          easing: Easing.out(Easing.quad),
          reduceMotion: ReduceMotion.System,
        }),
        withSpring(1, {
          damping: 14,
          stiffness: 320,
          reduceMotion: ReduceMotion.System,
        })
      );
    } else {
      fade.value = withTiming(0, {
        duration: 90,
        reduceMotion: ReduceMotion.System,
      });
    }
  }, [filled, fade, pop]);

  useEffect(() => {
    if (active && !filled) {
      caret.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 450, reduceMotion: ReduceMotion.System }),
          withTiming(1, { duration: 450, reduceMotion: ReduceMotion.System })
        ),
        -1,
        false
      );
    } else {
      caret.value = 0;
    }
  }, [active, filled, caret]);

  const cellStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }],
  }));
  const charStyle = useAnimatedStyle(() => ({ opacity: fade.value }));
  const caretStyle = useAnimatedStyle(() => ({ opacity: caret.value }));

  return (
    <Animated.View
      style={[
        styles.cell,
        style,
        filled && [styles.filled, filledStyle],
        active && [styles.active, activeStyle],
        error && [styles.error, errorStyle],
        cellStyle,
      ]}
    >
      <Animated.View style={charStyle}>
        {masked && filled ? (
          <View style={[styles.dot, error && styles.dotError]} />
        ) : (
          <Text style={[styles.text, textStyle, error && styles.textError]}>
            {char}
          </Text>
        )}
      </Animated.View>
      {active && !filled ? (
        <Animated.View style={[styles.caret, caretStyle]} />
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: 48,
    height: 58,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(128,128,128,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filled: { borderColor: 'rgba(128,128,128,0.6)' },
  active: { borderColor: '#6C8CFF' },
  error: { borderColor: '#FF6B6B' },
  text: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F3F4F6',
    fontVariant: ['tabular-nums'],
  },
  textError: { color: '#FF6B6B' },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#F3F4F6' },
  dotError: { backgroundColor: '#FF6B6B' },
  caret: {
    position: 'absolute',
    width: 2,
    height: 24,
    borderRadius: 1,
    backgroundColor: '#6C8CFF',
  },
});
