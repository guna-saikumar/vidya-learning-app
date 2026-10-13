import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Plus, BookOpen, AlertCircle } from 'lucide-react-native';
import Colors from '../constants/colors';
import { HeaderBar } from '../components/common/HeaderBar';
import { ClassSelector } from '../components/curriculum/ClassSelector';
import { SearchFilterBar } from '../components/common/SearchFilterBar';
import { SubjectCard } from '../components/curriculum/SubjectCard';
import { AddEditSubjectModal } from '../components/curriculum/AddEditSubjectModal';
import { ModalConfirm } from '../components/common/ModalConfirm';
import { EmptyState } from '../components/common/EmptyState';
import { HoverCard } from '../components/common/HoverCard';
import { PageIntro } from '../components/common/PageIntro';
import {
  getClasses,
  addSubjectToClass,
  updateSubject,
  toggleArchiveSubject,
  deleteSubject,
} from '../services/curriculumService';
import { SchoolClass, Subject } from '../types/curriculum';

export const ClassesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('class-8');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [isAddEditModalVisible, setIsAddEditModalVisible] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  const loadData = async () => {
    try {
      const cls = await getClasses();
      setClasses(cls);
    } catch (err) {
      console.error('Failed to load classes:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const allSubjects = currentClass ? currentClass.subjects : [];

  const filteredSubjects = allSubjects.filter((s) => {
    if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchDesc = s.description?.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    return true;
  });

  const handleSaveSubject = async (data: any) => {
    try {
      if (subjectToEdit) {
        await updateSubject(selectedClassId, subjectToEdit.id, data);
      } else {
        await addSubjectToClass(selectedClassId, data);
      }
      await loadData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save subject.');
    }
  };

  const handleToggleArchive = async (subjectId: string) => {
    try {
      await toggleArchiveSubject(selectedClassId, subjectId);
      await loadData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to toggle archive.');
    }
  };

  const handleDeleteSubject = async () => {
    if (!subjectToDelete) return;
    try {
      await deleteSubject(selectedClassId, subjectToDelete.id);
      setSubjectToDelete(null);
      await loadData();
    } catch (err: any) {
      setSubjectToDelete(null);
      Alert.alert('Cannot Delete', err.message);
    }
  };

  const filterOptions = [
    { key: 'all', label: 'All Subjects', badge: allSubjects.length },
    { key: 'stem', label: 'STEM', badge: allSubjects.filter((s) => s.category === 'stem').length },
    { key: 'languages', label: 'Languages', badge: allSubjects.filter((s) => s.category === 'languages').length },
    { key: 'social', label: 'Social Studies', badge: allSubjects.filter((s) => s.category === 'social').length },
  ];

  return (
    <View className="flex-1 bg-white">
      <HeaderBar onProfilePress={() => navigation.navigate('Profile')} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingTop: 18,
          paddingBottom: 48,
          gap: 18,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Page Heading & Subheading scrolling naturally with the content */}
        <PageIntro
          eyebrow="SCERT AP CURRICULUM"
          badge={`${classes.length} Classes`}
          title="Curriculum & Syllabi"
          description="Manage official Andhra Pradesh State Board curriculum and subjects."
          rightAction={
            <TouchableOpacity
              className="flex-row items-center gap-1.5 bg-primary px-3.5 py-2 rounded-full shadow-sm"
              onPress={() => {
                setSubjectToEdit(null);
                setIsAddEditModalVisible(true);
              }}
              activeOpacity={0.8}
            >
              <Plus size={15} color={Colors.white} />
              <Text className="font-manrope-bold text-xs text-white">Add Subject</Text>
            </TouchableOpacity>
          }
        />

        {/* Classes Selector Cards placed cleanly below Title & Subtitle */}
        <ClassSelector
          classes={classes}
          selectedClassId={selectedClassId}
          onSelectClass={setSelectedClassId}
        />

        {/* Class Overview Banner */}
        {currentClass && (
          <HoverCard
            className="bg-palePeach rounded-[20px] p-5 border border-primaryLight flex-row items-center justify-between shadow-sm"
            lift={-3}
          >
            <View className="flex-1 min-w-0 mr-3">
              <Text className="font-manrope-extrabold text-[17px] text-textPrimary tracking-tight">
                {currentClass.title} Curriculum
              </Text>
              <Text className="font-manrope-medium text-[13px] text-textSecondary mt-0.5 leading-[18px]">
                {currentClass.subtitle}
              </Text>
            </View>
            <View className="bg-white px-3 py-1.5 rounded-full border border-primaryLight shadow-sm">
              <Text className="font-manrope-bold text-xs text-primary">
                {allSubjects.length} Subjects
              </Text>
            </View>
          </HoverCard>
        )}

        {/* Search & Category Filter */}
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder={`Search ${currentClass?.title || 'class'} subjects...`}
          filters={filterOptions}
          activeFilter={selectedCategory}
          onFilterSelect={setSelectedCategory}
        />

        {/* Subjects List */}
        <View className="gap-1">
          <View className="flex-row items-center justify-between pb-1">
            <Text className="font-manrope-extrabold text-base text-textPrimary tracking-tight">
              Subject Syllabi ({filteredSubjects.length})
            </Text>
            <Text className="font-manrope-medium text-xs text-textMuted">Tap to view chapters</Text>
          </View>

          {filteredSubjects.length === 0 ? (
            <EmptyState
              title="No subjects found"
              message={`No subjects found matching "${searchQuery}". Add a new subject or change filter.`}
              icon={<BookOpen size={36} color={Colors.primary} />}
              actionLabel="Add Subject"
              onActionPress={() => {
                setSubjectToEdit(null);
                setIsAddEditModalVisible(true);
              }}
            />
          ) : (
            filteredSubjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                onPress={() =>
                  navigation.navigate('Chapters', {
                    classId: selectedClassId,
                    subjectId: subject.id,
                  })
                }
                onEdit={() => {
                  setSubjectToEdit(subject);
                  setIsAddEditModalVisible(true);
                }}
                onToggleArchive={() => handleToggleArchive(subject.id)}
                onDelete={() => setSubjectToDelete(subject)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Add / Edit Subject Modal */}
      <AddEditSubjectModal
        visible={isAddEditModalVisible}
        subjectToEdit={subjectToEdit}
        onSave={handleSaveSubject}
        onClose={() => {
          setIsAddEditModalVisible(false);
          setSubjectToEdit(null);
        }}
      />

      {/* Delete Subject Confirmation */}
      <ModalConfirm
        visible={Boolean(subjectToDelete)}
        title="Delete Subject?"
        message={`Are you sure you want to delete "${subjectToDelete?.name}"? Subjects with chapters or lecture materials cannot be deleted.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteSubject}
        onCancel={() => setSubjectToDelete(null)}
      />
    </View>
  );
};
