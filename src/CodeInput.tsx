import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentRef,
} from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  type TextInputKeyPressEvent,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { Cell } from './Cell';
import type { CodeInputProps } from './types';
import { useShake } from './useShake';

function sanitize(text: string, length: number, numeric: boolean): string {
  const cleaned = numeric ? text.replace(/\D/g, '') : text.replace(/\s/g, '');
  return cleaned.slice(0, length);
}

export function CodeInput({
  length = 6,
  value,
  defaultValue = '',
  onChange,
  onComplete,
  masked = false,
  error = false,
  onErrorCleared,
  autoFocus = false,
  keyboardType = 'number-pad',
  disabled = false,
  haptics,
  cellStyle,
  activeCellStyle,
  filledCellStyle,
  errorCellStyle,
  cellTextStyle,
  gap = 10,
  style,
  accessibilityLabel,
  testID,
}: CodeInputProps) {
  const numeric = keyboardType === 'number-pad';
  const [inner, setInner] = useState(() =>
    sanitize(defaultValue, length, numeric)
  );
  const code = value !== undefined ? sanitize(value, length, numeric) : inner;
  const [focused, setFocused] = useState(autoFocus);
  const [showError, setShowError] = useState(false);
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const completedFor = useRef<string | null>(null);
  const { shake, style: shakeStyle } = useShake();

  const update = useCallback(
    (next: string) => {
      const cleaned = sanitize(next, length, numeric);
      if (cleaned.length > code.length) {
        haptics?.('tick');
      }
      if (value === undefined) {
        setInner(cleaned);
      }
      onChange?.(cleaned);
    },
    [code.length, haptics, length, numeric, onChange, value]
  );

  useEffect(() => {
    if (code.length === length && completedFor.current !== code) {
      completedFor.current = code;
      haptics?.('success');
      onComplete?.(code);
    }
    if (code.length < length) {
      completedFor.current = null;
    }
  }, [code, length, onComplete, haptics]);

  useEffect(() => {
    if (!error) {
      return;
    }
    setShowError(true);
    haptics?.('error');
    shake(() => {
      setShowError(false);
      if (value === undefined) {
        setInner('');
      }
      onChange?.('');
      onErrorCleared?.();
    });
    // Run once per error pulse.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const focus = useCallback(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  const onKeyPress = useCallback(
    (e: TextInputKeyPressEvent) => {
      // Android number pads do not always report a changed text on backspace of an empty field.
      if (
        e.nativeEvent.key === 'Backspace' &&
        code.length > 0 &&
        Platform.OS === 'android'
      ) {
        update(code.slice(0, -1));
      }
    },
    [code, update]
  );

  const activeIndex = Math.min(code.length, length - 1);

  return (
    <Pressable
      onPress={focus}
      style={style}
      accessible
      accessibilityRole="none"
      accessibilityLabel={
        accessibilityLabel ??
        `Verification code, ${code.length} of ${length} ${numeric ? 'digits' : 'characters'} entered`
      }
      testID={testID}
    >
      <Animated.View style={[styles.row, { gap }, shakeStyle]}>
        {Array.from({ length }, (_, i) => (
          <Cell
            key={i}
            char={code[i] ?? ''}
            masked={masked}
            active={focused && i === activeIndex && !showError}
            error={showError}
            style={cellStyle}
            activeStyle={activeCellStyle}
            filledStyle={filledCellStyle}
            errorStyle={errorCellStyle}
            textStyle={cellTextStyle}
          />
        ))}
      </Animated.View>
      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={update}
        onKeyPress={onKeyPress}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus={autoFocus}
        editable={!disabled}
        maxLength={length}
        keyboardType={numeric ? 'number-pad' : 'default'}
        autoCapitalize="characters"
        autoCorrect={false}
        textContentType="oneTimeCode"
        autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
        caretHidden
        style={styles.hidden}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        testID={testID ? `${testID}-input` : undefined}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center' },
  hidden: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
    left: 0,
    top: 0,
  },
});
