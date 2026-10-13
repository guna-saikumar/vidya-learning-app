import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { UploadCloud, CheckCircle2, FileText, X } from 'lucide-react-native';
import Colors from '../../constants/colors';
import { pickDocumentFile } from '../../services/materialsService';

interface FileUploadBoxProps {
  onFileSelected: (file: { name: string; size: number; uri: string }) => void;
  selectedFile?: { name: string; size: number; uri?: string } | null;
  onClearFile?: () => void;
  allowedTypesDescription?: string;
}

export const FileUploadBox: React.FC<FileUploadBoxProps> = ({
  onFileSelected,
  selectedFile,
  onClearFile,
  allowedTypesDescription = 'PDF, PPT, DOCX, PNG, JPG (up to 25MB)',
}) => {
  const [uploading, setUploading] = useState(false);

  const handlePickFile = async () => {
    setUploading(true);
    try {
      const file = await pickDocumentFile();
      if (file) {
        onFileSelected(file);
      }
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 KB';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    const kb = bytes / 1024;
    return `${kb.toFixed(0)} KB`;
  };

  if (selectedFile) {
    return (
      <View className="bg-palePeach/50 border border-primaryLight rounded-2xl p-4 flex-row items-center justify-between gap-3 shadow-sm">
        <View className="flex-row items-center gap-3 flex-1 min-w-0">
          <View className="w-10 h-10 rounded-xl bg-palePeach items-center justify-center border border-primaryLight">
            <FileText size={20} color={Colors.primary} />
          </View>
          <View className="flex-1 min-w-0">
            <View className="flex-row items-center gap-1.5">
              <Text className="font-manrope-bold text-sm text-textPrimary" numberOfLines={1}>
                {selectedFile.name}
              </Text>
              <CheckCircle2 size={14} color={Colors.success} />
            </View>
            <Text className="font-manrope-medium text-xs text-textSecondary mt-0.5">
              {formatSize(selectedFile.size)} · Ready to upload
            </Text>
          </View>
        </View>

        {onClearFile && (
          <TouchableOpacity
            className="w-8 h-8 rounded-full bg-white border border-border items-center justify-center"
            onPress={onClearFile}
            activeOpacity={0.7}
          >
            <X size={14} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <TouchableOpacity
      className="bg-softWarm/80 border-2 border-dashed border-border rounded-2xl p-6 items-center justify-center gap-2"
      onPress={handlePickFile}
      disabled={uploading}
      activeOpacity={0.7}
    >
      {uploading ? (
        <View className="items-center gap-2">
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text className="font-manrope-medium text-xs text-textSecondary">
            Selecting document...
          </Text>
        </View>
      ) : (
        <>
          <View className="w-12 h-12 rounded-2xl bg-white border border-border items-center justify-center shadow-sm">
            <UploadCloud size={24} color={Colors.primary} />
          </View>
          <Text className="font-manrope-bold text-sm text-textPrimary text-center">
            Tap to select document from device
          </Text>
          <Text className="font-manrope-medium text-[11px] text-textMuted text-center">
            {allowedTypesDescription}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};
