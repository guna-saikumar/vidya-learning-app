import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Chapter, PublicationStatus } from '../../types/curriculum';
import { X } from 'lucide-react-native';
import Colors from '../../constants/colors';

interface AddEditChapterModalProps {
  visible: boolean;
  chapterToEdit?: Chapter | null;
  nextChapterNumber: number;
  onSave: (data: {
    chapterNumber: number;
    title: string;
    description: string;
    unitName: string;
    durationMinutes: number;
    learningGoals: string[];
    displayOrder: number;
    status: PublicationStatus;
  }) => void;
  onClose: () => void;
}

export const AddEditChapterModal: React.FC<AddEditChapterModalProps> = ({
  visible,
  chapterToEdit,
  nextChapterNumber,
  onSave,
  onClose,
}) => {
  const [chapterNumber, setChapterNumber] = useState(String(nextChapterNumber));
  const [title, setTitle] = useState('');
  const [unitName, setUnitName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('30');
  const [goalsText, setGoalsText] = useState('');
  const [status, setStatus] = useState<PublicationStatus>('published');

  useEffect(() => {
    if (chapterToEdit) {
      setChapterNumber(String(chapterToEdit.chapterNumber));
      setTitle(chapterToEdit.title);
      setUnitName(chapterToEdit.unitName || '');
      setDescription(chapterToEdit.description || '');
      setDuration(String(chapterToEdit.durationMinutes || 30));
      setGoalsText((chapterToEdit.learningGoals || []).join('\n'));
      setStatus(chapterToEdit.status);
    } else {
      setChapterNumber(String(nextChapterNumber));
      setTitle('');
      setUnitName('');
      setDescription('');
      setDuration('30');
      setGoalsText('');
      setStatus('published');
    }
  }, [chapterToEdit, nextChapterNumber, visible]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a chapter title.');
      return;
    }
    const num = parseInt(chapterNumber, 10) || nextChapterNumber;
    const dur = parseInt(duration, 10) || 30;
    const goals = goalsText
      .split('\n')
      .map((g) => g.trim())
      .filter((g) => g.length > 0);

    onSave({
      chapterNumber: num,
      title: title.trim(),
      unitName: unitName.trim(),
      description: description.trim(),
      durationMinutes: dur,
      learningGoals: goals,
      displayOrder: num,
      status,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/40 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[90%] p-5 border-t border-border gap-4">
          <View className="flex-row items-center justify-between pb-3 border-b border-border">
            <Text className="font-manrope-extrabold text-lg text-textPrimary tracking-tight">
              {chapterToEdit ? 'Edit Chapter' : 'Add Chapter'}
            </Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <X size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
            {/* Number & Duration Row */}
            <View className="flex-row items-center gap-3">
              <View className="w-24 gap-1.5">
                <Text className="font-manrope-bold text-xs text-textLead">Chapter #</Text>
                <TextInput
                  className="bg-white border border-border rounded-xl px-3 h-12 font-manrope-bold text-sm text-textPrimary text-center shadow-sm"
                  keyboardType="numeric"
                  value={chapterNumber}
                  onChangeText={setChapterNumber}
                />
              </View>

              <View className="flex-1 gap-1.5">
                <Text className="font-manrope-bold text-xs text-textLead">Est. Duration (Mins)</Text>
                <TextInput
                  className="bg-white border border-border rounded-xl px-3.5 h-12 font-manrope-medium text-sm text-textPrimary shadow-sm"
                  keyboardType="numeric"
                  placeholder="30"
                  value={duration}
                  onChangeText={setDuration}
                />
              </View>
            </View>

            {/* Title */}
            <View className="gap-1.5">
              <Text className="font-manrope-bold text-xs text-textLead">Chapter Title *</Text>
              <TextInput
                className="bg-white border border-border rounded-xl px-3.5 h-12 font-manrope-medium text-sm text-textPrimary shadow-sm"
                placeholder="e.g. Rational Numbers, Laws of Motion"
                placeholderTextColor={Colors.textPlaceholder}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Unit / Theme */}
            <View className="gap-1.5">
              <Text className="font-manrope-bold text-xs text-textLead">Unit / Section Theme</Text>
              <TextInput
                className="bg-white border border-border rounded-xl px-3.5 h-12 font-manrope-medium text-sm text-textPrimary shadow-sm"
                placeholder="e.g. Number Systems, Mechanics"
                placeholderTextColor={Colors.textPlaceholder}
                value={unitName}
                onChangeText={setUnitName}
              />
            </View>

            {/* Publication Status */}
            <View className="gap-1.5">
              <Text className="font-manrope-bold text-xs text-textLead">Publication Status</Text>
              <View className="flex-row items-center gap-2">
                {(['published', 'draft', 'archived'] as PublicationStatus[]).map((st) => {
                  const isActive = status === st;
                  return (
                    <TouchableOpacity
                      key={st}
                      className={`flex-1 py-2.5 rounded-xl border items-center justify-center capitalize ${
                        isActive ? 'bg-primary border-primary' : 'bg-white border-border'
                      }`}
                      onPress={() => setStatus(st)}
                      activeOpacity={0.8}
                    >
                      <Text className={`font-manrope-bold text-xs ${isActive ? 'text-white' : 'text-textSecondary'}`}>
                        {st}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Learning Goals */}
            <View className="gap-1.5">
              <Text className="font-manrope-bold text-xs text-textLead">Learning Goals (one per line)</Text>
              <TextInput
                className="bg-white border border-border rounded-xl p-3 h-24 font-manrope-medium text-sm text-textPrimary shadow-sm"
                placeholder="Understand properties of rational numbers&#10;Master distributive law formula"
                placeholderTextColor={Colors.textPlaceholder}
                value={goalsText}
                onChangeText={setGoalsText}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Description */}
            <View className="gap-1.5">
              <Text className="font-manrope-bold text-xs text-textLead">Description</Text>
              <TextInput
                className="bg-white border border-border rounded-xl p-3 h-20 font-manrope-medium text-sm text-textPrimary shadow-sm"
                placeholder="Summary of concepts covered..."
                placeholderTextColor={Colors.textPlaceholder}
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          <View className="flex-row items-center gap-3 pt-2">
            <TouchableOpacity
              className="flex-1 py-3 rounded-xl border border-border items-center justify-center bg-white"
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text className="font-manrope-bold text-sm text-textSecondary">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 py-3 rounded-xl bg-primary items-center justify-center shadow-sm"
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text className="font-manrope-bold text-sm text-white">
                {chapterToEdit ? 'Save Chapter' : 'Add Chapter'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
