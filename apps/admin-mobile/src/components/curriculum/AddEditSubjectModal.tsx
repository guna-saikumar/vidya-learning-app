import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Subject, SubjectCategory } from '../../types/curriculum';
import { X, BookOpen, Calculator, Atom, Dna, Globe, Languages, GraduationCap, Landmark } from 'lucide-react-native';
import Colors from '../../constants/colors';

interface AddEditSubjectModalProps {
  visible: boolean;
  subjectToEdit?: Subject | null;
  onSave: (data: {
    code: string;
    name: string;
    description: string;
    category: SubjectCategory;
    iconName: string;
    displayOrder: number;
    isArchived: boolean;
  }) => void;
  onClose: () => void;
}

const ICONS = [
  { name: 'book-open', icon: BookOpen, label: 'Book' },
  { name: 'calculator', icon: Calculator, label: 'Math' },
  { name: 'atom', icon: Atom, label: 'Physics' },
  { name: 'dna', icon: Dna, label: 'Biology' },
  { name: 'languages', icon: Languages, label: 'Languages' },
  { name: 'graduation-cap', icon: GraduationCap, label: 'Academic' },
  { name: 'globe', icon: Globe, label: 'Geography' },
  { name: 'landmark', icon: Landmark, label: 'History' },
];

export const AddEditSubjectModal: React.FC<AddEditSubjectModalProps> = ({
  visible,
  subjectToEdit,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SubjectCategory>('stem');
  const [iconName, setIconName] = useState('book-open');

  useEffect(() => {
    if (subjectToEdit) {
      setName(subjectToEdit.name);
      setCode(subjectToEdit.code);
      setDescription(subjectToEdit.description || '');
      setCategory(subjectToEdit.category);
      setIconName(subjectToEdit.iconName);
    } else {
      setName('');
      setCode('');
      setDescription('');
      setCategory('stem');
      setIconName('book-open');
    }
  }, [subjectToEdit, visible]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a subject name.');
      return;
    }
    const finalCode = code.trim() || name.trim().toLowerCase().replace(/\s+/g, '-');
    onSave({
      name: name.trim(),
      code: finalCode,
      description: description.trim(),
      category,
      iconName,
      displayOrder: subjectToEdit?.displayOrder || 1,
      isArchived: subjectToEdit?.isArchived || false,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/40 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[90%] p-5 border-t border-border gap-4">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-border">
            <Text className="font-manrope-extrabold text-lg text-textPrimary tracking-tight">
              {subjectToEdit ? 'Edit Subject' : 'Add New Subject'}
            </Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <X size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
            {/* Subject Name */}
            <View className="gap-1.5">
              <Text className="font-manrope-bold text-xs text-textLead">Subject Name *</Text>
              <TextInput
                className="bg-white border border-border rounded-xl px-3.5 h-12 font-manrope-medium text-sm text-textPrimary shadow-sm"
                placeholder="e.g. Mathematics, Physical Science"
                placeholderTextColor={Colors.textPlaceholder}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Subject Code */}
            <View className="gap-1.5">
              <Text className="font-manrope-bold text-xs text-textLead">Subject Code (identifier)</Text>
              <TextInput
                className="bg-white border border-border rounded-xl px-3.5 h-12 font-manrope-medium text-sm text-textPrimary shadow-sm"
                placeholder="e.g. maths, phy-sci"
                placeholderTextColor={Colors.textPlaceholder}
                value={code}
                onChangeText={setCode}
                autoCapitalize="none"
              />
            </View>

            {/* Category Selection */}
            <View className="gap-1.5">
              <Text className="font-manrope-bold text-xs text-textLead">Curriculum Category</Text>
              <View className="flex-row items-center gap-2">
                {(['stem', 'languages', 'social'] as SubjectCategory[]).map((cat) => {
                  const isActive = category === cat;
                  const label = cat === 'stem' ? 'STEM' : cat === 'languages' ? 'Languages' : 'Social';
                  return (
                    <TouchableOpacity
                      key={cat}
                      className={`flex-1 py-2.5 rounded-xl border items-center justify-center ${
                        isActive ? 'bg-primary border-primary' : 'bg-white border-border'
                      }`}
                      onPress={() => setCategory(cat)}
                      activeOpacity={0.8}
                    >
                      <Text className={`font-manrope-bold text-xs ${isActive ? 'text-white' : 'text-textSecondary'}`}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Icon Picker */}
            <View className="gap-1.5">
              <Text className="font-manrope-bold text-xs text-textLead">Select Outline Icon</Text>
              <View className="flex-row flex-wrap gap-2.5">
                {ICONS.map((item) => {
                  const IconComp = item.icon;
                  const isSelected = iconName === item.name;
                  return (
                    <TouchableOpacity
                      key={item.name}
                      className={`w-11 h-11 rounded-xl items-center justify-center border ${
                        isSelected ? 'bg-palePeach border-primary' : 'bg-softWarm border-border'
                      }`}
                      onPress={() => setIconName(item.name)}
                      activeOpacity={0.7}
                    >
                      <IconComp size={20} color={isSelected ? Colors.primary : Colors.textSecondary} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Description */}
            <View className="gap-1.5">
              <Text className="font-manrope-bold text-xs text-textLead">Description / Syllabus Overview</Text>
              <TextInput
                className="bg-white border border-border rounded-xl p-3 h-20 font-manrope-medium text-sm text-textPrimary shadow-sm"
                placeholder="Brief syllabus coverage, board prescribed topics..."
                placeholderTextColor={Colors.textPlaceholder}
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          {/* Action Buttons */}
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
                {subjectToEdit ? 'Save Changes' : 'Create Subject'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
