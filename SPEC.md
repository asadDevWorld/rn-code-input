# rn-code-input: behaviour spec

Written from the behaviour of three earlier demos (an animated verification code input, a variant with a
face that reacts to typing, and a lock-screen PIN pad) and from what production OTP and PIN inputs need.
Built from this document.

## Goal

One component for one-time codes and PINs. Cells animate as digits arrive, the whole row shakes on a wrong
code, SMS autofill works on both platforms, and a masked mode hides the digits for PINs. A second
component is a numeric keypad for lock screens, with a dot indicator that fills as you type.

## Public API

```tsx
<CodeInput
  length={6}
  value={code} onChange={setCode}          // controlled; or defaultValue + onComplete
  onComplete={(code) => verify(code)}
  masked={false}                            // true shows dots instead of digits
  error={isWrong}                            // true plays the shake and red state, then clears
  autoFocus
  keyboardType="number-pad"                  // or 'default' for alphanumeric codes
  cellStyle, cellTextStyle, activeCellStyle, errorCellStyle
  haptics={fn}                               // 'tick' per digit, 'error' on shake, 'success' on complete
  autoComplete="sms-otp"                      // forwarded for SMS autofill (iOS textContentType oneTimeCode)
/>

<PinPad
  length={4}
  onComplete={(pin) => Promise<boolean> | boolean}   // return false to shake and clear
  biometricLabel="Face ID" onBiometric={fn}
  haptics={fn}
/>
```

## Behaviour

CodeInput: a hidden TextInput owns the value and the keyboard. Cells render the digits. Tapping any cell
focuses the input. The active cell shows a blinking caret. When a digit lands, its cell pops (scale
1 → 1.12 → 1) and the digit fades in. Backspace removes the last digit with a quick fade out. When all
cells are filled `onComplete` fires once. `error` true: the row shakes horizontally (±8 px, four cycles),
cells turn red, and the value is cleared after the shake. Pasting a full code fills every cell.

PinPad: twelve keys (1-9, biometric or blank, 0, backspace) with press feedback. Dots above fill as digits
arrive. On the last digit `onComplete` runs; while it is pending the dots pulse; `false` shakes the dots and
clears. Keys are 72 px circles in a 3-column grid.

Accessibility: CodeInput is one text field with a label like "Verification code, 3 of 6 digits entered".
PinPad keys are buttons with labels.

## Example app

1. Verify: 6-digit code, correct code 123456, wrong codes shake.
2. PIN: masked 4-digit code input.
3. Lock screen: PinPad with Face ID button and a wrong-PIN shake.
