import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  CheckCircle2,
  Clock,
  Archive,
  FileText,
  Video,
  Globe,
  Share2,
  BookOpen,
} from 'lucide-react-native';
import Colors from '../constants/colors';
import { HeaderBar } from '../components/common/HeaderBar';
import { BottomNav } from '../components/common/BottomNav';
import { TypeBadge } from '../components/common/TypeBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { getMaterialById, updateMaterialStatus } from '../services/materialsService';
import { LectureMaterial, PublicationStatus } from '../types/materials';

export const PreviewPublishScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { materialId } = route.params;

  const [material, setMaterial] = useState<LectureMaterial | null>(null);

  useEffect(() => {
    loadData();
  }, [materialId]);

  const loadData = async () => {
    const mat = await getMaterialById(materialId);
    if (mat) setMaterial(mat);
  };

  const handleSetStatus = async (status: PublicationStatus) => {
    try {
      await updateMaterialStatus(materialId, status);
      await loadData();
      Alert.alert(
        'Status Updated',
        status === 'published'
          ? 'Material is now PUBLISHED and visible to students in the student mobile app!'
          : status === 'draft'
          ? 'Material moved to DRAFT. It is now hidden from the student app.'
          : 'Material has been ARCHIVED.'
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not update status');
    }
  };

  if (!material) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6">
        <Text className="font-manrope-medium text-sm text-textMuted">Loading preview...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <HeaderBar
        title="Student View Preview"
        subtitle="Verify before publishing"
        showBack
        onBackPress={() => navigation.goBack()}
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 48, gap: 18 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Callout Banner */}
        <View
          className={`p-4 rounded-[20px] border flex-row items-center justify-between ${
            material.status === 'published'
              ? 'bg-[#E7F3ED] border-success/30'
              : material.status === 'draft'
              ? 'bg-[#FEF3C7] border-warning/30'
              : 'bg-softWarm border-border'
          }`}
        >
          <View className="flex-row items-center gap-2">
            {material.status === 'published' ? (
              <CheckCircle2 size={18} color={Colors.success} />
            ) : (
              <Clock size={18} color={Colors.warning} />
            )}
            <View>
              <Text className="font-manrope-extrabold text-xs text-textPrimary">
                Publication Status
              </Text>
              <Text className="font-manrope-medium text-[11px] text-textSecondary">
                {material.status === 'published'
                  ? 'Visible to students in Class ' + material.grade
                  : 'Hidden from student mobile app'}
              </Text>
            </View>
          </View>
          <StatusBadge status={material.status} />
        </View>

        {/* Student View Mock Card */}
        <View className="bg-white rounded-[20px] p-5 border border-border shadow-sm gap-4">
          <View className="flex-row items-center justify-between">
            <TypeBadge type={material.materialType} />
            <Text className="font-manrope-bold text-xs text-primaryDark">
              Class {material.grade} · {material.subjectName}
            </Text>
          </View>

          <View className="gap-1.5">
            <Text className="font-manrope-extrabold text-xl text-textPrimary tracking-tight">
              {material.title}
            </Text>
            <Text className="font-manrope-semibold text-xs text-primary">
              Chapter: {material.chapterTitle}
              {material.sectionTitle ? ` · ${material.sectionTitle}` : ''}
            </Text>
          </View>

          {material.description ? (
            <Text className="font-manrope-medium text-sm text-textSecondary leading-5">
              {material.description}
            </Text>
          ) : null}

          {/* Type-Specific Display */}
          {material.materialType === 'video' && material.videoUrl ? (
            <View className="bg-softWarm rounded-2xl p-5 border border-border items-center justify-center gap-2">
              <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
                <Video size={24} color={Colors.primary} />
              </View>
              <Text className="font-manrope-bold text-xs text-textPrimary text-center">
                Lecture Video Stream
              </Text>
              <Text className="font-manrope-medium text-[11px] text-textMuted text-center" numberOfLines={1}>
                {material.videoUrl}
              </Text>
              <TouchableOpacity
                className="mt-2 bg-primary px-4 py-2 rounded-xl"
                onPress={() => Linking.openURL(material.videoUrl || '').catch(() => {})}
              >
                <Text className="font-manrope-bold text-xs text-white">Open Link in Browser</Text>
              </TouchableOpacity>
            </View>
          ) : material.materialType === 'quiz' && material.quizData ? (
            <View className="bg-accentGoldBg rounded-2xl p-4 border border-accentGold/30 gap-3">
              <Text className="font-manrope-extrabold text-sm text-accentGoldDark">
                Checkpoint Quiz Preview
              </Text>
              <Text className="font-manrope-bold text-sm text-textPrimary">
                {material.quizData.question}
              </Text>
              <View className="gap-2">
                {material.quizData.options.map((opt, i) => (
                  <View
                    key={i}
                    className={`p-3 rounded-xl border ${
                      i === material.quizData?.correctIndex
                        ? 'bg-successBg border-success'
                        : 'bg-white border-border'
                    }`}
                  >
                    <Text
                      className={`font-manrope-medium text-xs ${
                        i === material.quizData?.correctIndex
                          ? 'text-success font-manrope-bold'
                          : 'text-textPrimary'
                      }`}
                    >
                      {opt} {i === material.quizData?.correctIndex ? '✓ (Correct)' : ''}
                    </Text>
                  </View>
                ))}
              </View>
              {material.quizData.explanation ? (
                <Text className="font-manrope-medium text-xs text-textSecondary italic">
                  Explanation: {material.quizData.explanation}
                </Text>
              ) : null}
            </View>
          ) : material.materialType === 'notes' && material.notesContent ? (
            <View className="bg-palePeach/40 rounded-2xl p-4 border border-primaryLight gap-2">
              <Text className="font-manrope-extrabold text-xs text-primary uppercase tracking-wider">
                Reading Notes Content
              </Text>
              <Text className="font-manrope-medium text-sm text-textPrimary leading-6">
                {material.notesContent}
              </Text>
            </View>
          ) : material.fileName ? (
            <View className="bg-softWarm rounded-2xl p-4 border border-border flex-row items-center justify-between">
              <View className="flex-row items-center gap-3 flex-1 min-w-0 mr-2">
                <FileText size={22} color={Colors.primary} />
                <View className="flex-1 min-w-0">
                  <Text className="font-manrope-bold text-xs text-textPrimary" numberOfLines={1}>
                    {material.fileName}
                  </Text>
                  <Text className="font-manrope-medium text-[10px] text-textMuted">
                    Uploaded Resource File
                  </Text>
                </View>
              </View>
            </View>
          ) : null}

          {/* Author metadata */}
          <View className="flex-row items-center justify-between pt-3 border-t border-border">
            <Text className="font-manrope-medium text-xs text-textMuted">
              Author: {material.authorName || 'SCERT AP Curriculum Team'}
            </Text>
            <Text className="font-manrope-medium text-xs text-textMuted">
              Language: {material.language}
            </Text>
          </View>
        </View>

        {/* Publishing Actions Card placed directly inside the page */}
        <View className="bg-white rounded-[20px] p-5 border border-border shadow-sm gap-3.5 mb-2">
          <Text className="font-manrope-extrabold text-[15px] text-textPrimary tracking-tight">
            Publishing Actions
          </Text>
          <View className="flex-row items-center gap-3">
            {material.status === 'published' ? (
              <TouchableOpacity
                className="flex-1 py-3.5 rounded-xl border border-warning bg-[#FEF3C7] items-center justify-center flex-row gap-2"
                onPress={() => handleSetStatus('draft')}
                activeOpacity={0.8}
              >
                <Clock size={16} color={Colors.warning} />
                <Text className="font-manrope-bold text-sm text-warning">Unpublish to Draft</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                className="flex-1 py-3.5 rounded-xl bg-primary items-center justify-center flex-row gap-2 shadow-sm"
                onPress={() => handleSetStatus('published')}
                activeOpacity={0.8}
              >
                <CheckCircle2 size={16} color={Colors.white} />
                <Text className="font-manrope-bold text-sm text-white">Publish to Students</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              className="px-4 py-3.5 rounded-xl border border-border bg-softWarm items-center justify-center flex-row gap-1.5"
              onPress={() => handleSetStatus('archived')}
              activeOpacity={0.7}
            >
              <Archive size={16} color={Colors.textMuted} />
              <Text className="font-manrope-bold text-xs text-textSecondary">Archive</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navbar */}
      <BottomNav activeTab="Materials" navigation={navigation} />
    </View>
  );
};
