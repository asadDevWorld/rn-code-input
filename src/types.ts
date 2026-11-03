import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

export type HapticEvent = 'tick' | 'error' | 'success';

export type HapticsCallback = (event: HapticEvent) => void;

export interface CodeInputProps {
  /** Number of cells. Default 6. */
  length?: number;
  /** Controlled value. Digits only unless `keyboardType` is 'default'. */
  value?: string;
  defaultValue?: string;
  onChange?: (code: string) => void;
  /** Fires once when every cell is filled. */
  onComplete?: (code: string) => void;
  /** Show dots instead of characters. Default false. */
  masked?: boolean;
  /** True plays the shake, shows the error state, then clears the value. */
  error?: boolean;
  /** Called after the error shake has cleared the value. */
  onErrorCleared?: () => void;
  autoFocus?: boolean;
  /** 'number-pad' (default) or 'default' for alphanumeric codes. */
  keyboardType?: 'number-pad' | 'default';
  /** Disable input. */
  disabled?: boolean;
  haptics?: HapticsCallback;
  cellStyle?: StyleProp<ViewStyle>;
  activeCellStyle?: StyleProp<ViewStyle>;
  filledCellStyle?: StyleProp<ViewStyle>;
  errorCellStyle?: StyleProp<ViewStyle>;
  cellTextStyle?: StyleProp<TextStyle>;
  /** Space between cells. Default 10. */
  gap?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
}

export interface PinPadProps {
  /** Number of digits. Default 4. */
  length?: number;
  /** Return false (or a promise of false) to shake and clear. */
  onComplete: (pin: string) => boolean | Promise<boolean>;
  /** Label of the bottom-left key, for example "Face ID". Omit to leave it blank. */
  biometricLabel?: string;
  onBiometric?: () => void;
  haptics?: HapticsCallback;
  /** Key diameter. Default 72. */
  keySize?: number;
  keyStyle?: StyleProp<ViewStyle>;
  keyTextStyle?: StyleProp<TextStyle>;
  dotColor?: string;
  errorColor?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
