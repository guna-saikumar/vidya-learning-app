import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ArrowLeft, Check, Save, FileText, Video, Globe, BookOpen } from 'lucide-react-native';
import Colors from '../constants/colors';
import { HeaderBar } from '../components/common/HeaderBar';
import { BottomNav } from '../components/common/BottomNav';
import { FileUploadBox } from '../components/materials/FileUploadBox';
import { getClasses } from '../services/curriculumService';
import {
  getMaterialById,
  addMaterial,
  updateMaterial,
} from '../services/materialsService';
import { SchoolClass, Subject, Chapter } from '../types/curriculum';
import { MaterialType, PublicationStatus } from '../types/materials';
import { useAdminAuth } from '../hooks/useAdminAuth';

export const AddEditMaterialScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user } = useAdminAuth();
  const { materialId, defaultClassId, defaultSubjectId, defaultChapterId } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<SchoolClass[]>([]);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [materialType, setMaterialType] = useState<MaterialType>('pdf');
  const [selectedClassId, setSelectedClassId] = useState('class-8');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [language, setLanguage] = useState('English');
  const [videoUrl, setVideoUrl] = useState('');
  const [notesContent, setNotesContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: number; uri?: string } | null>(null);
  const [status, setStatus] = useState<PublicationStatus>('published');

  useEffect(() => {
    initForm();
  }, [materialId]);

  const initForm = async () => {
    setLoading(true);
    try {
      const cls = await getClasses();
      setClasses(cls);

      if (materialId) {
        const mat = await getMaterialById(materialId);
        if (mat) {
          setTitle(mat.title);
          setDescription(mat.description || '');
          setMaterialType(mat.materialType);
          setSelectedClassId(mat.classId);
          setSelectedSubjectId(mat.subjectId);
          setSelectedChapterId(mat.chapterId);
          setSelectedSectionId(mat.sectionId || '');
          setLanguage(mat.language || 'English');
          setVideoUrl(mat.videoUrl || '');
          setNotesContent(mat.notesContent || '');
          setStatus(mat.status);
          if (mat.fileName) {
            setSelectedFile({
              name: mat.fileName,
              size: mat.fileSizeBytes || 2500000,
            });
          }
          return;
        }
      }

      // Default cascade setup
      const targetClassId = defaultClassId || 'class-8';
      setSelectedClassId(targetClassId);
      const targetClass = cls.find((c) => c.id === targetClassId) || cls[0];
      if (targetClass && targetClass.subjects.length > 0) {
        const targetSubj = defaultSubjectId
          ? targetClass.subjects.find((s) => s.id === defaultSubjectId) || targetClass.subjects[0]
          : targetClass.subjects[0];
        setSelectedSubjectId(targetSubj.id);
        if (targetSubj.chapters.length > 0) {
          setSelectedChapterId(defaultChapterId || targetSubj.chapters[0].id);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const availableSubjects = currentClass ? currentClass.subjects : [];
  const currentSubject = availableSubjects.find((s) => s.id === selectedSubjectId) || availableSubjects[0];
  const availableChapters = currentSubject ? currentSubject.chapters : [];
  const currentChapter = availableChapters.find((ch) => ch.id === selectedChapterId) || availableChapters[0];
  const availableSections = currentChapter ? currentChapter.sections : [];

  const handleClassChange = (cId: string) => {
    setSelectedClassId(cId);
    const cls = classes.find((c) => c.id === cId);
    if (cls && cls.subjects.length > 0) {
      setSelectedSubjectId(cls.subjects[0].id);
      if (cls.subjects[0].chapters.length > 0) {
        setSelectedChapterId(cls.subjects[0].chapters[0].id);
      } else {
        setSelectedChapterId('');
      }
    } else {
      setSelectedSubjectId('');
      setSelectedChapterId('');
    }
  };

  const handleSubjectChange = (sId: string) => {
    setSelectedSubjectId(sId);
    const subj = availableSubjects.find((s) => s.id === sId);
    if (subj && subj.chapters.length > 0) {
      setSelectedChapterId(subj.chapters[0].id);
    } else {
      setSelectedChapterId('');
    }
  };

  const handleSave = async (targetStatus: PublicationStatus) => {
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter a title for this material.');
      return;
    }
    if (!selectedSubjectId || !selectedChapterId) {
      Alert.alert('Curriculum Required', 'Please select a valid subject and chapter.');
      return;
    }

    if (materialType === 'video' && !videoUrl.trim()) {
      Alert.alert('Video URL Required', 'Please provide a valid lecture video URL.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        materialType,
        classId: selectedClassId,
        grade: currentClass?.grade || 8,
        subjectId: selectedSubjectId,
        subjectName: currentSubject?.name || 'General',
        chapterId: selectedChapterId,
        chapterTitle: currentChapter?.title || 'Chapter',
        sectionId: selectedSectionId || undefined,
        sectionTitle: availableSections.find((s) => s.id === selectedSectionId)?.title,
        language,
        authorName: user?.fullName || 'Admin Name',
        displayOrder: 1,
        status: targetStatus,
        fileName: selectedFile?.name,
        fileSizeBytes: selectedFile?.size,
        videoUrl: videoUrl.trim() || undefined,
        notesContent: notesContent.trim() || undefined,
      };

      if (materialId) {
        await updateMaterial(materialId, payload);
      } else {
        await addMaterial(payload);
      }

      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Save Failed', err.message || 'Could not save material.');
    } finally {
      setLoading(false);
    }
  };

  const materialTypes: Array<{ type: MaterialType; label: string }> = [
    { type: 'pdf', label: 'PDF Document' },
    { type: 'video', label: 'Lecture Video' },
    { type: 'presentation', label: 'Slides / PPT' },
    { type: 'notes', label: 'Lecture Notes' },
    { type: 'image', label: 'Diagram / Image' },
    { type: 'quiz', label: 'Checkpoint Quiz' },
  ];

  return (
    <View className="flex-1 bg-white">
      <HeaderBar
        title={materialId ? 'Edit Material' : 'Upload Material'}
        subtitle="Lecture notes, PDFs & media"
        showBack
        onBackPress={() => navigation.goBack()}
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 48, gap: 18 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View className="gap-1.5">
          <Text className="font-manrope-bold text-xs text-textLead">Material Title *</Text>
          <TextInput
            className="bg-white border border-border rounded-xl px-3.5 h-12 font-manrope-medium text-sm text-textPrimary shadow-sm"
            placeholder="e.g. Chapter 1 Comprehensive Notes & Formula Reference"
            placeholderTextColor={Colors.textPlaceholder}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Description */}
        <View className="gap-1.5">
          <Text className="font-manrope-bold text-xs text-textLead">Description / Summary</Text>
          <TextInput
            className="bg-white border border-border rounded-xl p-3 h-20 font-manrope-medium text-sm text-textPrimary shadow-sm"
            placeholder="Brief overview of concepts, topics, or instructions for students..."
            placeholderTextColor={Colors.textPlaceholder}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Material Format Type */}
        <View className="gap-1.5">
          <Text className="font-manrope-bold text-xs text-textLead">Material Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {materialTypes.map((item) => {
              const isSelected = materialType === item.type;
              return (
                <TouchableOpacity
                  key={item.type}
                  className={`px-3 py-2 rounded-xl border ${
                    isSelected ? 'bg-primary border-primary' : 'bg-softWarm border-border'
                  }`}
                  onPress={() => setMaterialType(item.type)}
                  activeOpacity={0.8}
                >
                  <Text className={`font-manrope-bold text-xs ${isSelected ? 'text-white' : 'text-textSecondary'}`}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Class Selection */}
        <View className="gap-1.5">
          <Text className="font-manrope-bold text-xs text-textLead">Select Enrolled Class</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {classes.map((cls) => {
              const isSelected = selectedClassId === cls.id;
              return (
                <TouchableOpacity
                  key={cls.id}
                  className={`px-3 py-1.5 rounded-full border ${
                    isSelected ? 'bg-primary border-primary' : 'bg-white border-border'
                  }`}
                  onPress={() => handleClassChange(cls.id)}
                  activeOpacity={0.8}
                >
                  <Text className={`font-manrope-bold text-xs ${isSelected ? 'text-white' : 'text-textSecondary'}`}>
                    {cls.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Subject Selection */}
        <View className="gap-1.5">
          <Text className="font-manrope-bold text-xs text-textLead">Select Subject</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {availableSubjects.map((subj) => {
              const isSelected = selectedSubjectId === subj.id;
              return (
                <TouchableOpacity
                  key={subj.id}
                  className={`px-3 py-1.5 rounded-xl border ${
                    isSelected ? 'bg-palePeach border-primary' : 'bg-white border-border'
                  }`}
                  onPress={() => handleSubjectChange(subj.id)}
                  activeOpacity={0.8}
                >
                  <Text className={`font-manrope-bold text-xs ${isSelected ? 'text-primaryDark' : 'text-textSecondary'}`}>
                    {subj.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Chapter Selection */}
        <View className="gap-1.5">
          <Text className="font-manrope-bold text-xs text-textLead">Select Target Chapter</Text>
          {availableChapters.length === 0 ? (
            <View className="p-3 bg-softWarm rounded-xl border border-border">
              <Text className="font-manrope-medium text-xs text-textMuted">
                No chapters exist for this subject yet. Please add a chapter first in Curriculum.
              </Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {availableChapters.map((chap) => {
                const isSelected = selectedChapterId === chap.id;
                return (
                  <TouchableOpacity
                    key={chap.id}
                    className={`px-3 py-1.5 rounded-xl border ${
                      isSelected ? 'bg-primary border-primary' : 'bg-white border-border'
                    }`}
                    onPress={() => setSelectedChapterId(chap.id)}
                    activeOpacity={0.8}
                  >
                    <Text className={`font-manrope-bold text-xs ${isSelected ? 'text-white' : 'text-textSecondary'}`}>
                      Ch {chap.chapterNumber}: {chap.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Type-Specific Upload or Link Input */}
        {materialType === 'video' ? (
          <View className="gap-1.5">
            <Text className="font-manrope-bold text-xs text-textLead">Video URL (YouTube or Cloud Stream) *</Text>
            <View className="flex-row items-center bg-white border border-border rounded-xl px-3.5 h-12 shadow-sm">
              <Globe size={18} color={Colors.textSecondary} />
              <TextInput
                className="flex-1 min-w-0 ml-2.5 font-manrope-medium text-sm text-textPrimary"
                placeholder="https://www.youtube.com/watch?v=..."
                placeholderTextColor={Colors.textPlaceholder}
                value={videoUrl}
                onChangeText={setVideoUrl}
                autoCapitalize="none"
              />
            </View>
          </View>
        ) : materialType === 'notes' ? (
          <View className="gap-1.5">
            <View className="flex-row items-center justify-between">
              <Text className="font-manrope-bold text-xs text-textLead">Structured Text Notes</Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('ContentEditor', {
                    initialNotes: notesContent,
                    title,
                  })
                }
              >
                <Text className="font-manrope-bold text-xs text-primary">Open Rich Note Builder</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              className="bg-white border border-border rounded-xl p-3 h-28 font-manrope-medium text-sm text-textPrimary shadow-sm"
              placeholder="Enter chapter notes, formulas, or summaries..."
              placeholderTextColor={Colors.textPlaceholder}
              value={notesContent}
              onChangeText={setNotesContent}
              multiline
              textAlignVertical="top"
            />
          </View>
        ) : (
          <View className="gap-1.5">
            <Text className="font-manrope-bold text-xs text-textLead">Upload Resource Document / Media</Text>
            <FileUploadBox
              selectedFile={selectedFile}
              onFileSelected={(file) => setSelectedFile(file)}
              onClearFile={() => setSelectedFile(null)}
              allowedTypesDescription={
                materialType === 'presentation'
                  ? 'PPT, PPTX slides up to 30MB'
                  : materialType === 'image'
                  ? 'PNG, JPG, SVG diagrams up to 10MB'
                  : 'PDF documents up to 25MB'
              }
            />
          </View>
        )}

        {/* Bottom Actions */}
        <View className="flex-row items-center gap-3 pt-3">
          <TouchableOpacity
            className="flex-1 py-3.5 rounded-xl border border-border items-center justify-center bg-white flex-row gap-2 shadow-sm"
            onPress={() => handleSave('draft')}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Save size={16} color={Colors.textSecondary} />
            <Text className="font-manrope-bold text-sm text-textSecondary">Save as Draft</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 py-3.5 rounded-xl bg-primary items-center justify-center shadow-sm flex-row gap-2"
            onPress={() => handleSave('published')}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Check size={16} color={Colors.white} />
                <Text className="font-manrope-bold text-sm text-white">Publish Now</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomNav activeTab="Materials" navigation={navigation} />
    </View>
  );
};
