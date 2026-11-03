import { useCallback } from 'react';
import {
  ReduceMotion,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const AMPLITUDE = 8;
const STEP = 55;

/** Horizontal shake: four cycles, then a callback on the JS thread. */
export function useShake() {
  const offset = useSharedValue(0);

  const shake = useCallback(
    (onDone?: () => void) => {
      const t = (to: number) =>
        withTiming(to, { duration: STEP, reduceMotion: ReduceMotion.System });
      offset.value = withSequence(
        t(-AMPLITUDE),
        t(AMPLITUDE),
        t(-AMPLITUDE),
        t(AMPLITUDE),
        t(-AMPLITUDE / 2),
        t(AMPLITUDE / 2),
        withTiming(
          0,
          { duration: STEP, reduceMotion: ReduceMotion.System },
          () => {
            if (onDone) {
              runOnJS(onDone)();
            }
          }
        )
      );
    },
    [offset]
  );

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  return { shake, style };
}
