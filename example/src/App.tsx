import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { CodeInput, PinPad, type HapticsCallback } from 'rn-code-input';

const colors = {
  bg: '#0F1115',
  card: '#181B22',
  border: '#262A33',
  text: '#F3F4F6',
  muted: '#9AA0AB',
  accent: '#6C8CFF',
  success: '#34D399',
  danger: '#FF6B6B',
};

const haptics: HapticsCallback = (event) => {
  const run =
    event === 'tick'
      ? Haptics.selectionAsync()
      : Haptics.notificationAsync(
          event === 'success'
            ? Haptics.NotificationFeedbackType.Success
            : Haptics.NotificationFeedbackType.Error
        );
  run.catch(() => undefined);
};

const TABS = ['Verify', 'PIN', 'Lock screen'] as const;
type Tab = (typeof TABS)[number];

function VerifyDemo() {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [status, setStatus] = useState<'idle' | 'ok' | 'wrong'>('idle');
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Enter the code we sent</Text>
      <Text style={styles.hint}>
        The right code is 123456. Anything else shakes.
      </Text>
      <CodeInput
        length={6}
        value={code}
        onChange={(c) => {
          setCode(c);
          if (c.length < 6) {
            setStatus('idle');
          }
        }}
        error={error}
        onErrorCleared={() => setError(false)}
        autoFocus
        haptics={haptics}
        onComplete={(c) => {
          if (c === '123456') {
            setStatus('ok');
          } else {
            setStatus('wrong');
            setError(true);
          }
        }}
        style={styles.input}
      />
      <Text
        style={[
          styles.status,
          status === 'ok' && styles.ok,
          status === 'wrong' && styles.wrong,
        ]}
      >
        {status === 'ok'
          ? 'Verified'
          : status === 'wrong'
            ? 'Wrong code, try again'
            : ' '}
      </Text>
    </View>
  );
}

function PinDemo() {
  const [pin, setPin] = useState('');
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Choose a PIN</Text>
      <Text style={styles.hint}>Masked cells. Digits show as dots.</Text>
      <CodeInput
        length={4}
        value={pin}
        onChange={setPin}
        masked
        autoFocus
        haptics={haptics}
        style={styles.input}
      />
      <Text style={styles.status}>{pin.length === 4 ? 'PIN set' : ' '}</Text>
    </View>
  );
}

function LockDemo() {
  const [unlocked, setUnlocked] = useState(false);
  return (
    <View style={[styles.card, styles.lock]}>
      <Text style={styles.title}>
        {unlocked ? 'Unlocked' : 'Enter passcode'}
      </Text>
      <Text style={styles.hint}>
        The passcode is 2468. Face ID unlocks too.
      </Text>
      <PinPad
        length={4}
        biometricLabel="Face ID"
        onBiometric={() => setUnlocked(true)}
        haptics={haptics}
        onComplete={async (p) => {
          await new Promise((r) => setTimeout(r, 500));
          const ok = p === '2468';
          setUnlocked(ok);
          return ok;
        }}
        style={styles.pad}
      />
      {unlocked ? (
        <Pressable onPress={() => setUnlocked(false)} style={styles.button}>
          <Text style={styles.buttonText}>Lock again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function Home() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('Verify');
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>rn-code-input</Text>
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tab, t === tab && styles.tabActive]}
          >
            <Text style={[styles.tabText, t === tab && styles.tabTextActive]}>
              {t}
            </Text>
          </Pressable>
        ))}
      </View>
      {tab === 'Verify' ? <VerifyDemo /> : null}
      {tab === 'PIN' ? <PinDemo /> : null}
      {tab === 'Lock screen' ? <LockDemo /> : null}
    </ScrollView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Home />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 20, gap: 14 },
  heading: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  tabs: { flexDirection: 'row', gap: 8 },
  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: colors.accent },
  tabText: { color: colors.muted, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 20,
    gap: 10,
  },
  lock: { alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  hint: { fontSize: 13, color: colors.muted },
  input: { marginTop: 12 },
  status: {
    marginTop: 6,
    color: colors.muted,
    textAlign: 'center',
    height: 20,
  },
  ok: { color: colors.success },
  wrong: { color: colors.danger },
  pad: { marginTop: 16 },
  button: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: colors.accent,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});
