import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { LectureMaterial, MaterialFilter, MaterialType, PublicationStatus } from '../types/materials';

const MATERIALS_STORAGE_KEY = '@vidya_admin_lecture_materials_v1';

export const INITIAL_MATERIALS: LectureMaterial[] = [
  {
    id: 'mat-001',
    title: 'Rational Numbers - Chapter Reference Notes & Theorems',
    description: 'Comprehensive SCERT textbook notes covering closure, commutative and distributive properties with solved examples.',
    materialType: 'pdf',
    classId: 'class-8',
    grade: 8,
    subjectId: 'c8-maths',
    subjectName: 'Mathematics',
    chapterId: 'c8-math-ch1',
    chapterTitle: 'Rational Numbers',
    sectionId: 'c8-math-ch1-s1',
    sectionTitle: 'Properties of Rational Numbers',
    language: 'English',
    displayOrder: 1,
    status: 'published',
    fileName: 'Class8_Maths_Ch1_RationalNumbers.pdf',
    fileSizeBytes: 2450000,
    fileUrl: 'https://cdn.vidya.edu.in/materials/c8/maths/ch1_notes.pdf',
    createdAt: '2026-10-10T10:00:00Z',
    updatedAt: '2026-10-12T14:30:00Z',
    authorName: 'Dr. Ramesh Sharma',
  },
  {
    id: 'mat-002',
    title: 'Distributive Law Animation & Visual Proof',
    description: 'Detailed explanation of a(b + c) = ab + ac with geometry tiles and real-life examples.',
    materialType: 'video',
    classId: 'class-8',
    grade: 8,
    subjectId: 'c8-maths',
    subjectName: 'Mathematics',
    chapterId: 'c8-math-ch1',
    chapterTitle: 'Rational Numbers',
    sectionId: 'c8-math-ch1-s1',
    sectionTitle: 'Properties of Rational Numbers',
    language: 'English',
    displayOrder: 2,
    status: 'published',
    videoUrl: 'https://www.youtube.com/watch?v=demo-distributive-law',
    createdAt: '2026-10-11T11:00:00Z',
    updatedAt: '2026-10-11T11:00:00Z',
    authorName: 'S. K. Verma',
  },
  {
    id: 'mat-003',
    title: 'Linear Equations in One Variable Lecture Slides',
    description: 'Classroom presentation deck highlighting transposing methods and word problem modeling.',
    materialType: 'presentation',
    classId: 'class-8',
    grade: 8,
    subjectId: 'c8-maths',
    subjectName: 'Mathematics',
    chapterId: 'c8-math-ch2',
    chapterTitle: 'Linear Equations in One Variable',
    language: 'English',
    displayOrder: 1,
    status: 'draft',
    fileName: 'LinearEquations_Class8_LectureDeck.pptx',
    fileSizeBytes: 5200000,
    fileUrl: 'https://cdn.vidya.edu.in/materials/c8/maths/ch2_deck.pptx',
    createdAt: '2026-10-13T09:15:00Z',
    updatedAt: '2026-10-13T09:15:00Z',
    authorName: 'Dr. Ramesh Sharma',
  },
  {
    id: 'mat-004',
    title: 'Force and Pressure - Visual Diagram & Lab Activity',
    description: 'High-resolution diagram comparing contact vs non-contact forces and barometer pressure experiments.',
    materialType: 'image',
    classId: 'class-8',
    grade: 8,
    subjectId: 'c8-phy-sci',
    subjectName: 'Physical Science',
    chapterId: 'c8-phy-ch1',
    chapterTitle: 'Force and Pressure',
    language: 'English',
    displayOrder: 1,
    status: 'published',
    fileName: 'Force_Pressure_Infographic_AP.png',
    fileSizeBytes: 1800000,
    fileUrl: 'https://cdn.vidya.edu.in/materials/c8/physics/force_diagram.png',
    createdAt: '2026-10-09T08:00:00Z',
    updatedAt: '2026-10-09T08:00:00Z',
    authorName: 'K. Anitha',
  },
  {
    id: 'mat-005',
    title: 'Rational Numbers - Quick Mastery 5-Question Quiz',
    description: 'Interactive checkpoint quiz testing multiplicative inverse and identity axioms.',
    materialType: 'quiz',
    classId: 'class-8',
    grade: 8,
    subjectId: 'c8-maths',
    subjectName: 'Mathematics',
    chapterId: 'c8-math-ch1',
    chapterTitle: 'Rational Numbers',
    language: 'English',
    displayOrder: 3,
    status: 'published',
    quizData: {
      question: 'Which of the following illustrates the Distributive Property?',
      options: [
        'a + b = b + a',
        'a(b + c) = ab + ac',
        '(a × b) × c = a × (b × c)',
        'a × 1 = a',
      ],
      correctIndex: 1,
      explanation: 'The distributive property of multiplication over addition states a(b + c) = ab + ac.',
    },
    createdAt: '2026-10-12T16:00:00Z',
    updatedAt: '2026-10-12T16:00:00Z',
    authorName: 'Dr. Ramesh Sharma',
  },
  {
    id: 'mat-006',
    title: 'అమ్మ ఒడి - పాఠ్యాంశ సమగ్ర విశ్లేషణ మరియు వ్యాకరణాంశాలు',
    description: 'ఆంధ్రప్రదేశ్ ఎస్సీఈఆర్టీ 6వ తరగతి తెలుగు మొదటి పాఠం వివరణ మరియు ప్రశ్నోత్తరాలు.',
    materialType: 'notes',
    classId: 'class-6',
    grade: 6,
    subjectId: 'c6-telugu',
    subjectName: 'Telugu (తెలుగు)',
    chapterId: 'c6-tel-ch1',
    chapterTitle: 'అమ్మ ఒడి (Amma Vodi)',
    language: 'Telugu',
    displayOrder: 1,
    status: 'draft',
    notesContent: 'అమ్మ ప్రేమ అనంతమైనది. కవి పరిచయం మరియు పద్య భావాలు ఈ విభాగంలో వివరంగా చదవండి.',
    createdAt: '2026-10-13T11:30:00Z',
    updatedAt: '2026-10-13T11:30:00Z',
    authorName: 'P. Venkat Rao',
  },
];

export const loadMaterials = async (): Promise<LectureMaterial[]> => {
  try {
    const raw = await AsyncStorage.getItem(MATERIALS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
    await AsyncStorage.setItem(MATERIALS_STORAGE_KEY, JSON.stringify(INITIAL_MATERIALS));
    return INITIAL_MATERIALS;
  } catch (err) {
    console.error('Failed to load materials:', err);
    return INITIAL_MATERIALS;
  }
};

export const saveMaterials = async (materials: LectureMaterial[]): Promise<void> => {
  await AsyncStorage.setItem(MATERIALS_STORAGE_KEY, JSON.stringify(materials));
};

export const resetMaterialsToDefaults = async (): Promise<LectureMaterial[]> => {
  await AsyncStorage.setItem(MATERIALS_STORAGE_KEY, JSON.stringify(INITIAL_MATERIALS));
  return INITIAL_MATERIALS;
};

export const getAllMaterials = async (): Promise<LectureMaterial[]> => {
  return loadMaterials();
};

export const getMaterialById = async (id: string): Promise<LectureMaterial | undefined> => {
  const list = await loadMaterials();
  return list.find((m) => m.id === id);
};

export const filterMaterials = async (filter: MaterialFilter): Promise<LectureMaterial[]> => {
  const all = await loadMaterials();
  return all.filter((item) => {
    if (filter.classId && item.classId !== filter.classId) return false;
    if (filter.subjectId && item.subjectId !== filter.subjectId) return false;
    if (filter.chapterId && item.chapterId !== filter.chapterId) return false;
    if (filter.materialType && filter.materialType !== 'all' && item.materialType !== filter.materialType) return false;
    if (filter.status && filter.status !== 'all' && item.status !== filter.status) return false;
    if (filter.searchQuery && filter.searchQuery.trim()) {
      const q = filter.searchQuery.trim().toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchSubject = item.subjectName.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchSubject) return false;
    }
    return true;
  });
};

export const addMaterial = async (
  data: Omit<LectureMaterial, 'id' | 'createdAt' | 'updatedAt'>
): Promise<LectureMaterial> => {
  const all = await loadMaterials();
  const now = new Date().toISOString();
  const newMaterial: LectureMaterial = {
    ...data,
    id: `mat-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  all.unshift(newMaterial);
  await saveMaterials(all);
  return newMaterial;
};

export const updateMaterial = async (
  id: string,
  updatedData: Partial<LectureMaterial>
): Promise<LectureMaterial> => {
  const all = await loadMaterials();
  const index = all.findIndex((m) => m.id === id);
  if (index === -1) throw new Error('Material not found');

  all[index] = {
    ...all[index],
    ...updatedData,
    updatedAt: new Date().toISOString(),
  };

  await saveMaterials(all);
  return all[index];
};

export const updateMaterialStatus = async (
  id: string,
  status: PublicationStatus
): Promise<LectureMaterial> => {
  return updateMaterial(id, { status });
};

export const deleteMaterial = async (id: string): Promise<void> => {
  const all = await loadMaterials();
  const filtered = all.filter((m) => m.id !== id);
  await saveMaterials(filtered);
};

export const pickDocumentFile = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'image/*'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const file = result.assets[0];
      return {
        name: file.name,
        size: file.size || 0,
        uri: file.uri,
        mimeType: file.mimeType || 'application/octet-stream',
      };
    }
    return null;
  } catch (err) {
    console.error('File pick error:', err);
    return null;
  }
};
