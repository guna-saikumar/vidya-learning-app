import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { AlertTriangle, Trash2, CheckCircle2 } from 'lucide-react-native';
import Colors from '../../constants/colors';

interface ModalConfirmProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'success' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ModalConfirm: React.FC<ModalConfirmProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <Trash2 size={24} color={Colors.error} />;
      case 'success':
        return <CheckCircle2 size={24} color={Colors.success} />;
      case 'warning':
      default:
        return <AlertTriangle size={24} color={Colors.warning} />;
    }
  };

  const getConfirmButtonClass = () => {
    switch (variant) {
      case 'danger':
        return 'bg-error';
      case 'success':
        return 'bg-success';
      case 'warning':
      default:
        return 'bg-primary';
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 bg-black/40 items-center justify-center p-6">
        <View className="w-full max-w-sm bg-white rounded-3xl p-6 border border-border shadow-lg gap-4">
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-2xl bg-softWarm items-center justify-center">
              {getIcon()}
            </View>
            <View className="flex-1">
              <Text className="font-manrope-extrabold text-lg text-textPrimary tracking-tight">
                {title}
              </Text>
            </View>
          </View>

          <Text className="font-manrope-medium text-sm text-textSecondary leading-5">
            {message}
          </Text>

          <View className="flex-row items-center gap-3 mt-2">
            <TouchableOpacity
              className="flex-1 py-3 rounded-xl border border-border items-center justify-center bg-white"
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text className="font-manrope-bold text-sm text-textSecondary">{cancelLabel}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 py-3 rounded-xl items-center justify-center shadow-sm ${getConfirmButtonClass()}`}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text className="font-manrope-bold text-sm text-white">{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
