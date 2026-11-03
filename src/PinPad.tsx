import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { PinPadProps } from './types';
import { useShake } from './useShake';

const KEYS = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'bio',
  '0',
  'del',
] as const;

export function PinPad({
  length = 4,
  onComplete,
  biometricLabel,
  onBiometric,
  haptics,
  keySize = 72,
  keyStyle,
  keyTextStyle,
  dotColor = '#F3F4F6',
  errorColor = '#FF6B6B',
  style,
  testID,
}: PinPadProps) {
  const [pin, setPin] = useState('');
  const [pending, setPending] = useState(false);
  const [wrong, setWrong] = useState(false);
  const { shake, style: shakeStyle } = useShake();
  const pulse = useSharedValue(1);
  const busy = useRef(false);

  useEffect(() => {
    if (pending) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 350, reduceMotion: ReduceMotion.System }),
          withTiming(1, { duration: 350, reduceMotion: ReduceMotion.System })
        ),
        -1,
        false
      );
    } else {
      pulse.value = withTiming(1, {
        duration: 120,
        reduceMotion: ReduceMotion.System,
      });
    }
  }, [pending, pulse]);

  const dotsStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  const submit = useCallback(
    async (candidate: string) => {
      busy.current = true;
      setPending(true);
      let ok = false;
      try {
        ok = await onComplete(candidate);
      } finally {
        setPending(false);
      }
      if (ok) {
        haptics?.('success');
        busy.current = false;
        return;
      }
      setWrong(true);
      haptics?.('error');
      shake(() => {
        setWrong(false);
        setPin('');
        busy.current = false;
      });
    },
    [haptics, onComplete, shake]
  );

  const press = useCallback(
    (key: (typeof KEYS)[number]) => {
      if (busy.current) {
        return;
      }
      if (key === 'bio') {
        onBiometric?.();
        return;
      }
      if (key === 'del') {
        setPin((p) => p.slice(0, -1));
        return;
      }
      haptics?.('tick');
      setPin((p) => {
        if (p.length >= length) {
          return p;
        }
        const next = p + key;
        if (next.length === length) {
          void submit(next);
        }
        return next;
      });
    },
    [haptics, length, onBiometric, submit]
  );

  return (
    <View style={[styles.root, style]} testID={testID}>
      <Animated.View
        style={[styles.dots, shakeStyle, dotsStyle]}
        accessibilityLabel={`${pin.length} of ${length} digits entered`}
      >
        {Array.from({ length }, (_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { borderColor: wrong ? errorColor : dotColor },
              i < pin.length && {
                backgroundColor: wrong ? errorColor : dotColor,
              },
            ]}
          />
        ))}
      </Animated.View>
      <View style={[styles.grid, { width: keySize * 3 + 24 * 2 }]}>
        {KEYS.map((key) => {
          const blank = key === 'bio' && !biometricLabel;
          const label =
            key === 'bio' ? (biometricLabel ?? '') : key === 'del' ? '⌫' : key;
          return (
            <Key
              key={key}
              label={label}
              size={keySize}
              blank={blank}
              small={key === 'bio' || key === 'del'}
              onPress={() => press(key)}
              style={keyStyle}
              textStyle={keyTextStyle}
              accessibilityLabel={
                key === 'del' ? 'Delete' : key === 'bio' ? biometricLabel : key
              }
            />
          );
        })}
      </View>
    </View>
  );
}

function Key({
  label,
  size,
  blank,
  small,
  onPress,
  style,
  textStyle,
  accessibilityLabel,
}: {
  label: string;
  size: number;
  blank: boolean;
  small: boolean;
  onPress: () => void;
  style?: PinPadProps['keyStyle'];
  textStyle?: PinPadProps['keyTextStyle'];
  accessibilityLabel?: string;
}) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  if (blank) {
    return <View style={{ width: size, height: size }} />;
  }
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.9, { damping: 14, stiffness: 400 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 400 });
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View
        style={[
          styles.key,
          { width: size, height: size, borderRadius: size / 2 },
          style,
          animated,
        ]}
      >
        <Text style={[styles.keyText, small && styles.keyTextSmall, textStyle]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', gap: 32 },
  dots: { flexDirection: 'row', gap: 16 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 18,
  },
  key: {
    backgroundColor: 'rgba(128,128,128,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: { fontSize: 30, fontWeight: '500', color: '#F3F4F6' },
  keyTextSmall: { fontSize: 16, fontWeight: '600' },
});
