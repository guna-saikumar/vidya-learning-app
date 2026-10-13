import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Section, PublicationStatus } from '../../types/curriculum';
import { X } from 'lucide-react-native';
import Colors from '../../constants/colors';

interface AddEditSectionModalProps {
  visible: boolean;
  sectionToEdit?: Section | null;
  nextSectionNumber: number;
  onSave: (data: {
    sectionNumber: number;
    title: string;
    content: string;
    summaryPoint: string;
    keyAxiom: string;
    durationMinutes: number;
    displayOrder: number;
    status: PublicationStatus;
  }) => void;
  onClose: () => void;
}

export const AddEditSectionModal: React.FC<AddEditSectionModalProps> = ({
  visible,
  sectionToEdit,
  nextSectionNumber,
  onSave,
  onClose,
}) => {
  const [sectionNumber, setSectionNumber] = useState(String(nextSectionNumber));
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summaryPoint, setSummaryPoint] = useState('');
  const [keyAxiom, setKeyAxiom] = useState('');
  const [duration, setDuration] = useState('15');

  useEffect(() => {
    if (sectionToEdit) {
      setSectionNumber(String(sectionToEdit.sectionNumber));
      setTitle(sectionToEdit.title);
      setContent(sectionToEdit.content);
      setSummaryPoint(sectionToEdit.summaryPoint || '');
      setKeyAxiom(sectionToEdit.keyAxiom || '');
      setDuration(String(sectionToEdit.durationMinutes || 15));
    } else {
      setSectionNumber(String(nextSectionNumber));
      setTitle('');
      setContent('');
      setSummaryPoint('');
      setKeyAxiom('');
      setDuration('15');
    }
  }, [sectionToEdit, nextSectionNumber, visible]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a section title.');
      return;
    }
    const num = parseInt(sectionNumber, 10) || nextSectionNumber;
    const dur = parseInt(duration, 10) || 15;

    onSave({
      sectionNumber: num,
      title: title.trim(),
      content: content.trim() || 'Detailed topic content and study notes.',
      summaryPoint: summaryPoint.trim(),
      keyAxiom: keyAxiom.trim(),
      durationMinutes: dur,
      displayOrder: num,
      status: sectionToEdit?.status || 'published',
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/40 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[90%] p-5 border-t border-border gap-4">
          <View className="flex-row items-center justify-between pb-3 border-b border-border">
            <Text className="font-manrope-extrabold text-lg text-textPrimary tracking-tight">
              {sectionToEdit ? 'Edit Section' : 'Add Section'}
            </Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <X size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
            <View className="flex-row items-center gap-3">
              <View className="w-24 gap-1.5">
                <Text className="font-manrope-bold text-xs text-textLead">Section #</Text>
                <TextInput
                  className="bg-white border border-border rounded-xl px-3 h-12 font-manrope-bold text-sm text-textPrimary text-center shadow-sm"
                  keyboardType="numeric"
                  value={sectionNumber}
                  onChangeText={setSectionNumber}
                />
              </View>

              <View className="flex-1 gap-1.5">
                <Text className="font-manrope-bold text-xs text-textLead">Duration (Mins)</Text>
                <TextInput
                  className="bg-white border border-border rounded-xl px-3.5 h-12 font-manrope-medium text-sm text-textPrimary shadow-sm"
                  keyboardType="numeric"
                  value={duration}
                  onChangeText={setDuration}
                />
              </View>
            </View>

            <View className="gap-1.5">
              <Text className="font-manrope-bold text-xs text-textLead">Section Title *</Text>
              <TextInput
                className="bg-white border border-border rounded-xl px-3.5 h-12 font-manrope-medium text-sm text-textPrimary shadow-sm"
                placeholder="e.g. Closure Property of Rational Numbers"
                placeholderTextColor={Colors.textPlaceholder}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View className="gap-1.5">
              <Text className="font-manrope-bold text-xs text-textLead">Key Axiom / Formula Highlight</Text>
              <TextInput
                className="bg-white border border-border rounded-xl px-3.5 h-12 font-manrope-medium text-sm text-textPrimary shadow-sm"
                placeholder="e.g. a(b + c) = ab + ac (Distributive Property)"
                placeholderTextColor={Colors.textPlaceholder}
                value={keyAxiom}
                onChangeText={setKeyAxiom}
              />
            </View>

            <View className="gap-1.5">
              <Text className="font-manrope-bold text-xs text-textLead">Summary Point (Key Takeaway)</Text>
              <TextInput
                className="bg-white border border-border rounded-xl px-3.5 h-12 font-manrope-medium text-sm text-textPrimary shadow-sm"
                placeholder="Core takeaway for rapid revision..."
                placeholderTextColor={Colors.textPlaceholder}
                value={summaryPoint}
                onChangeText={setSummaryPoint}
              />
            </View>

            <View className="gap-1.5">
              <Text className="font-manrope-bold text-xs text-textLead">Topic Content / Text</Text>
              <TextInput
                className="bg-white border border-border rounded-xl p-3 h-28 font-manrope-medium text-sm text-textPrimary shadow-sm"
                placeholder="Detailed explanations, definitions, and step-by-step proofs..."
                placeholderTextColor={Colors.textPlaceholder}
                value={content}
                onChangeText={setContent}
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
                {sectionToEdit ? 'Save Section' : 'Add Section'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
