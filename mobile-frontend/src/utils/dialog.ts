import { Alert, Platform } from 'react-native';

export type DialogButton = {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

/**
 * Cross-platform alert dialog.
 *
 * `react-native-web` ships `Alert` as a no-op (`static alert() {}`), so any
 * message or confirmation built with `Alert.alert` silently disappears in the
 * browser. On web we fall back to the native `window` dialogs; on iOS/Android
 * the regular React Native alert is used unchanged.
 */
export function showAlert(
  title: string,
  message?: string,
  buttons?: DialogButton[]
): void {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons);
    return;
  }

  if (typeof window === 'undefined') {
    return;
  }

  const body = message ? `${title}\n\n${message}` : title;
  const actionButtons = (buttons ?? []).filter(
    (button) => button.style !== 'cancel'
  );

  // Multi-button alerts are confirmations: run the primary action only when
  // the student accepts.
  if (buttons && buttons.length > 1) {
    const primary = actionButtons[actionButtons.length - 1];
    if (window.confirm(body)) {
      primary?.onPress?.();
    }
    return;
  }

  window.alert(body);
  actionButtons[0]?.onPress?.();
}

/**
 * Promise-based confirmation helper for flows that read better with `await`.
 * Resolves `true` when the student confirms.
 */
export function showConfirm(
  title: string,
  message?: string,
  options?: { confirmText?: string; cancelText?: string }
): Promise<boolean> {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') return Promise.resolve(false);
    const body = message ? `${title}\n\n${message}` : title;
    return Promise.resolve(window.confirm(body));
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      {
        text: options?.cancelText ?? 'Cancel',
        style: 'cancel',
        onPress: () => resolve(false),
      },
      { text: options?.confirmText ?? 'OK', onPress: () => resolve(true) },
    ]);
  });
}
