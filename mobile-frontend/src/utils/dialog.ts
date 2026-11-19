import { Alert, Platform } from 'react-native';
import { toast, ToastType } from '../components/common/Toast';

export type DialogButton = {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

function inferToastType(title: string, message?: string): ToastType {
  const combined = `${title} ${message || ''}`.toLowerCase();
  if (
    combined.includes('error') ||
    combined.includes('invalid') ||
    combined.includes('failed') ||
    combined.includes('required') ||
    combined.includes('validation') ||
    combined.includes('could not')
  ) {
    return 'error';
  }
  if (
    combined.includes('success') ||
    combined.includes('updated') ||
    combined.includes('saved') ||
    combined.includes('restored') ||
    combined.includes('completed') ||
    combined.includes('removed')
  ) {
    return 'success';
  }
  if (combined.includes('warning') || combined.includes('caution')) {
    return 'warning';
  }
  return 'info';
}

/**
 * Modern toast-based alert dialog.
 * Renders an in-app animated toast notification on web and mobile instead
 * of blocking browser `window.alert(...)` modals.
 */
export function showAlert(
  title: string,
  message?: string,
  buttons?: DialogButton[]
): void {
  const type = inferToastType(title, message);
  const actionButtons = (buttons ?? []).filter(
    (button) => button.style !== 'cancel'
  );
  const primary = actionButtons[actionButtons.length - 1];

  // If on native mobile and there are multiple choices, keep native Alert sheet
  if (Platform.OS !== 'web' && buttons && buttons.length > 1) {
    Alert.alert(title, message, buttons);
    return;
  }

  // Display toast with action button if provided
  toast.show({
    title,
    message,
    type,
    duration: 3800,
    actionText: primary?.text,
    onAction: primary?.onPress,
  });
}

/**
 * Promise-based confirmation helper.
 */
export function showConfirm(
  title: string,
  message?: string,
  options?: { confirmText?: string; cancelText?: string }
): Promise<boolean> {
  return new Promise((resolve) => {
    if (Platform.OS === 'web') {
      toast.show({
        title,
        message,
        type: 'warning',
        duration: 8000,
        actionText: options?.confirmText ?? 'Confirm',
        onAction: () => resolve(true),
      });
      return;
    }

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
