# rn-code-input

One-time code and PIN inputs for React Native. `CodeInput` renders animated cells for an OTP or passcode: digits pop in, the row shakes and turns red on a wrong code, SMS autofill works on iOS and Android, and a masked mode shows dots for PINs. `PinPad` is a lock-screen keypad with a dot indicator, an async check, and a biometric key. Animations run with Reanimated.

https://github.com/user-attachments/assets/REPLACE-WITH-UPLOADED-DEMO

_Demo recorded on the iOS Simulator from the example app: [docs/demo.mp4](docs/demo.mp4)._

## Install

```bash
npm install rn-code-input react-native-reanimated react-native-worklets
```

With Expo:

```bash
npx expo install rn-code-input react-native-reanimated react-native-worklets
```

Requires React Native 0.76 or newer and Reanimated 4.

## Usage

```tsx
import { CodeInput, PinPad } from 'rn-code-input';

<CodeInput
  length={6}
  autoFocus
  error={wrong}
  onErrorCleared={() => setWrong(false)}
  onComplete={(code) => verify(code).then((ok) => setWrong(!ok))}
/>

<CodeInput length={4} masked onComplete={savePin} />

<PinPad
  length={4}
  biometricLabel="Face ID"
  onBiometric={unlockWithBiometrics}
  onComplete={async (pin) => (await check(pin)) ? true : false}
/>
```

## API

### `CodeInput` props

| prop | type | default | description |
|---|---|---|---|
| `length` | `number` | `6` | Number of cells. |
| `value` / `defaultValue` | `string` | | Controlled or starting value. |
| `onChange` | `(code) => void` | | Every change, sanitised and capped. |
| `onComplete` | `(code) => void` | | Once, when every cell is filled. |
| `masked` | `boolean` | `false` | Dots instead of characters. |
| `error` | `boolean` | `false` | Plays the shake, shows red cells, clears the value, then calls `onErrorCleared`. |
| `autoFocus` | `boolean` | `false` | Focus and show the keyboard on mount. |
| `keyboardType` | `'number-pad' \| 'default'` | `'number-pad'` | `'default'` allows letters. |
| `disabled` | `boolean` | `false` | Block input. |
| `haptics` | `(event: 'tick' \| 'error' \| 'success') => void` | | Hook up any haptics library. |
| `cellStyle`, `activeCellStyle`, `filledCellStyle`, `errorCellStyle`, `cellTextStyle` | styles | | Appearance per state. |
| `gap` | `number` | `10` | Space between cells. |

The hidden text field sets `textContentType="oneTimeCode"` and `autoComplete="sms-otp"`, so the OS offers codes from messages.

### `PinPad` props

| prop | type | default | description |
|---|---|---|---|
| `length` | `number` | `4` | Digits. |
| `onComplete` | `(pin) => boolean \| Promise<boolean>` | required | Return `false` to shake and clear. Dots pulse while a promise is pending. |
| `biometricLabel` | `string` | | Label of the bottom-left key, for example "Face ID". Omit for a blank key. |
| `onBiometric` | `() => void` | | Pressed the biometric key. |
| `haptics` | same as above | | |
| `keySize` | `number` | `72` | Key diameter. |
| `keyStyle`, `keyTextStyle`, `dotColor`, `errorColor` | | | Appearance. |

## Behaviour notes

- A digit landing pops its cell (scale 1 → 1.12 → 1) and fades the character in; backspace fades it out.
- The active cell shows a blinking caret. Tapping anywhere on the row focuses the hidden field.
- Pasting a full code fills every cell at once.
- `CodeInput` is one accessible element labelled "Verification code, 3 of 6 digits entered". Keypad keys are buttons.
- Reduced motion shortens the animations.

## Example app

```bash
yarn
yarn example ios
```

Three tabs: Verify (right code 123456, wrong codes shake), PIN (masked), Lock screen (keypad, passcode 2468, Face ID button).

## Credits

Inspired by the verification code and lock-screen PIN demos by Enzo Mangano at reactiive.io. Implemented from scratch for this package.

## License

MIT © Asad Ali
