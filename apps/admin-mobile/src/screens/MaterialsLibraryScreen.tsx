import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Plus, Layers, Filter } from 'lucide-react-native';
import Colors from '../constants/colors';
import { HeaderBar } from '../components/common/HeaderBar';
import { SearchFilterBar } from '../components/common/SearchFilterBar';
import { MaterialCard } from '../components/materials/MaterialCard';
import { ModalConfirm } from '../components/common/ModalConfirm';
import { EmptyState } from '../components/common/EmptyState';
import { PageIntro } from '../components/common/PageIntro';
import {
  getAllMaterials,
  filterMaterials,
  updateMaterialStatus,
  deleteMaterial,
} from '../services/materialsService';
import { getClasses } from '../services/curriculumService';
import { LectureMaterial, MaterialType, PublicationStatus } from '../types/materials';
import { SchoolClass } from '../types/curriculum';

export const MaterialsLibraryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [materials, setMaterials] = useState<LectureMaterial[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<MaterialType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<PublicationStatus | 'all'>('all');

  // Delete Modal
  const [materialToDelete, setMaterialToDelete] = useState<LectureMaterial | null>(null);

  const loadData = async () => {
    try {
      const [allMat, cls] = await Promise.all([
        filterMaterials({
          classId: selectedClassId === 'all' ? undefined : selectedClassId,
          materialType: selectedType,
          status: selectedStatus,
          searchQuery,
        }),
        getClasses(),
      ]);
      setMaterials(allMat);
      setClasses(cls);
    } catch (err) {
      console.error('Failed to load materials:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [selectedClassId, selectedType, selectedStatus, searchQuery])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleToggleStatus = async (material: LectureMaterial) => {
    const nextStatus: PublicationStatus = material.status === 'published' ? 'draft' : 'published';
    try {
      await updateMaterialStatus(material.id, nextStatus);
      await loadData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update publication status.');
    }
  };

  const handleDelete = async () => {
    if (!materialToDelete) return;
    try {
      await deleteMaterial(materialToDelete.id);
      setMaterialToDelete(null);
      await loadData();
    } catch (err: any) {
      setMaterialToDelete(null);
      Alert.alert('Error', err.message || 'Failed to delete material.');
    }
  };

  // Status Filter Chips
  const statusFilters = [
    { key: 'all', label: 'All Status', badge: materials.length },
    { key: 'published', label: 'Published' },
    { key: 'draft', label: 'Drafts' },
    { key: 'archived', label: 'Archived' },
  ];

  // Material Type Chips
  const typeChips: Array<{ key: MaterialType | 'all'; label: string }> = [
    { key: 'all', label: 'All Types' },
    { key: 'pdf', label: 'PDFs' },
    { key: 'video', label: 'Videos' },
    { key: 'notes', label: 'Notes' },
    { key: 'presentation', label: 'Presentations' },
    { key: 'image', label: 'Diagrams' },
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
          eyebrow="LECTURE RESOURCES"
          badge={`${materials.length} Total`}
          title="Learning Materials"
          description="Curate and publish PDFs, lecture notes, videos, and presentations."
          rightAction={
            <TouchableOpacity
              className="flex-row items-center gap-1.5 bg-primary px-3.5 py-2 rounded-full shadow-sm"
              onPress={() => navigation.navigate('AddEditMaterial')}
              activeOpacity={0.8}
            >
              <Plus size={15} color={Colors.white} />
              <Text className="font-manrope-bold text-xs text-white">Upload</Text>
            </TouchableOpacity>
          }
        />
        {/* Search Bar */}
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Search by title, subject or notes..."
          filters={statusFilters}
          activeFilter={selectedStatus}
          onFilterSelect={(k) => setSelectedStatus(k as any)}
        />

        {/* Secondary Filter: Class Selector */}
        <View className="gap-2">
          <Text className="font-manrope-extrabold text-xs text-textLead uppercase tracking-wider">
            Filter by Class
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
          >
            <TouchableOpacity
              className={`px-3.5 py-1.5 rounded-full border ${
                selectedClassId === 'all'
                  ? 'bg-primary border-primary'
                  : 'bg-white border-border'
              }`}
              onPress={() => setSelectedClassId('all')}
              activeOpacity={0.8}
            >
              <Text
                className={`font-manrope-bold text-xs ${
                  selectedClassId === 'all' ? 'text-white' : 'text-textSecondary'
                }`}
              >
                All Classes
              </Text>
            </TouchableOpacity>

            {classes.map((cls) => {
              const isSelected = selectedClassId === cls.id;
              return (
                <TouchableOpacity
                  key={cls.id}
                  className={`px-3.5 py-1.5 rounded-full border ${
                    isSelected
                      ? 'bg-primary border-primary'
                      : 'bg-white border-border'
                  }`}
                  onPress={() => setSelectedClassId(cls.id)}
                  activeOpacity={0.8}
                >
                  <Text
                    className={`font-manrope-bold text-xs ${
                      isSelected ? 'text-white' : 'text-textSecondary'
                    }`}
                  >
                    {cls.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Third Filter: Material Type Horizontal Scroll */}
        <View className="gap-2">
          <Text className="font-manrope-extrabold text-xs text-textLead uppercase tracking-wider">
            Resource Type
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
          >
            {typeChips.map((typeChip) => {
              const isSelected = selectedType === typeChip.key;
              return (
                <TouchableOpacity
                  key={typeChip.key}
                  className={`px-3.5 py-1.5 rounded-full border ${
                    isSelected
                      ? 'bg-palePeach border-primary'
                      : 'bg-white border-border'
                  }`}
                  onPress={() => setSelectedType(typeChip.key)}
                  activeOpacity={0.8}
                >
                  <Text
                    className={`font-manrope-bold text-xs ${
                      isSelected ? 'text-primary' : 'text-textSecondary'
                    }`}
                  >
                    {typeChip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Materials List */}
        <View className="gap-1">
          <View className="flex-row items-center justify-between pb-1">
            <Text className="font-manrope-extrabold text-base text-textPrimary tracking-tight">
              Materials ({materials.length})
            </Text>
            <Text className="font-manrope-medium text-xs text-textMuted">
              {materials.filter((m) => m.status === 'published').length} Live in student app
            </Text>
          </View>

          {materials.length === 0 ? (
            <EmptyState
              title="No materials found"
              message="No lecture materials match your filter criteria. Try choosing a different class, type, or upload a new resource."
              icon={<Layers size={36} color={Colors.primary} />}
              actionLabel="Upload Material"
              onActionPress={() => navigation.navigate('AddEditMaterial')}
            />
          ) : (
            materials.map((item) => (
              <MaterialCard
                key={item.id}
                material={item}
                onPress={() =>
                  navigation.navigate('PreviewPublish', { materialId: item.id })
                }
                onEdit={() =>
                  navigation.navigate('AddEditMaterial', { materialId: item.id })
                }
                onToggleStatus={() => handleToggleStatus(item)}
                onDelete={() => setMaterialToDelete(item)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <ModalConfirm
        visible={Boolean(materialToDelete)}
        title="Delete Learning Material?"
        message={`Are you sure you want to delete "${materialToDelete?.title}"? This will remove the file for both students and admins.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setMaterialToDelete(null)}
      />
    </View>
  );
};

export default MaterialsLibraryScreen;
