import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/colors';

export type ToastType = 'error' | 'success' | 'info' | 'warning';

export interface ToastData {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
  duration?: number;
  actionText?: string;
  onAction?: () => void;
}

type ToastListener = (toast: ToastData | null) => void;
const listeners: Set<ToastListener> = new Set();

let toastCounter = 0;

export const toast = {
  show: (options: {
    title: string;
    message?: string;
    type?: ToastType;
    duration?: number;
    actionText?: string;
    onAction?: () => void;
  }) => {
    toastCounter += 1;
    const newToast: ToastData = {
      id: `toast_${Date.now()}_${toastCounter}`,
      title: options.title,
      message: options.message,
      type: options.type || 'info',
      duration: options.duration ?? 3500,
      actionText: options.actionText,
      onAction: options.onAction,
    };
    listeners.forEach((listener) => listener(newToast));
  },
  error: (title: string, message?: string, duration?: number) => {
    toast.show({ title, message, type: 'error', duration });
  },
  success: (title: string, message?: string, duration?: number) => {
    toast.show({ title, message, type: 'success', duration });
  },
  info: (title: string, message?: string, duration?: number) => {
    toast.show({ title, message, type: 'info', duration });
  },
  warning: (title: string, message?: string, duration?: number) => {
    toast.show({ title, message, type: 'warning', duration });
  },
  dismiss: () => {
    listeners.forEach((listener) => listener(null));
  },
};

export const ToastContainer: React.FC = () => {
  const [current, setCurrent] = useState<ToastData | null>(null);
  const animY = useRef(new Animated.Value(-60)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    Animated.parallel([
      Animated.timing(animY, {
        toValue: -60,
        duration: 220,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(animOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      setCurrent(null);
    });
  }, [animY, animOpacity]);

  useEffect(() => {
    const handleNewToast: ToastListener = (t) => {
      if (!t) {
        dismiss();
        return;
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setCurrent(t);
      animY.setValue(-60);
      animOpacity.setValue(0);

      Animated.parallel([
        Animated.spring(animY, {
          toValue: 0,
          useNativeDriver: Platform.OS !== 'web',
          tension: 80,
          friction: 9,
        }),
        Animated.timing(animOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();

      if (t.duration && t.duration > 0) {
        timerRef.current = setTimeout(() => {
          dismiss();
        }, t.duration);
      }
    };

    listeners.add(handleNewToast);
    return () => {
      listeners.delete(handleNewToast);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [dismiss, animY, animOpacity]);

  if (!current) return null;

  const isError = current.type === 'error';
  const isSuccess = current.type === 'success';
  const isWarning = current.type === 'warning';

  const iconName = isError
    ? 'error-outline'
    : isSuccess
    ? 'check-circle'
    : isWarning
    ? 'warning-amber'
    : 'info-outline';

  const iconColor = isError
    ? Colors.error
    : isSuccess
    ? Colors.success
    : isWarning
    ? Colors.accentGoldDark
    : Colors.primary;

  const iconBg = isError
    ? Colors.errorBg
    : isSuccess
    ? Colors.successBg
    : isWarning
    ? Colors.accentGoldBg
    : Colors.palePeach;

  return (
    <Animated.View
      style={[
        styles.toastWrapper,
        {
          transform: [{ translateY: animY }],
          opacity: animOpacity,
        },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={dismiss}
        style={[styles.toastCard, isError && styles.toastCardError]}
      >
        <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
          <MaterialIcons name={iconName} size={20} color={iconColor} />
        </View>

        <View style={styles.contentCol}>
          <Text style={styles.titleText} numberOfLines={1}>
            {current.title}
          </Text>
          {!!current.message && (
            <Text style={styles.messageText} numberOfLines={3}>
              {current.message}
            </Text>
          )}
        </View>

        {current.actionText && current.onAction ? (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              dismiss();
              current.onAction?.();
            }}
          >
            <Text style={styles.actionText}>{current.actionText}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={dismiss}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.closeButton}
          >
            <MaterialIcons name="close" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 16 : 48,
    left: 16,
    right: 16,
    zIndex: 999999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ede1d8',
    ...Platform.select({
      web: {
        boxShadow: '0 8px 24px rgba(58, 45, 41, 0.12), 0 2px 6px rgba(58, 45, 41, 0.08)',
      },
      default: {
        elevation: 6,
        shadowColor: '#3a2d29',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.14,
        shadowRadius: 10,
      },
    }),
  },
  toastCardError: {
    borderColor: '#ffc8c4',
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  contentCol: {
    flex: 1,
    marginRight: 8,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
    fontFamily: Platform.OS === 'web' ? 'inherit' : undefined,
  },
  messageText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 17,
    fontFamily: Platform.OS === 'web' ? 'inherit' : undefined,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.palePeach,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  closeButton: {
    padding: 4,
    marginLeft: 4,
  },
});
