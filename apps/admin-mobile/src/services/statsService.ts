import { loadCurriculumClasses } from './curriculumService';
import { loadMaterials } from './materialsService';

export interface DashboardStats {
  totalClasses: number;
  totalSubjects: number;
  totalChapters: number;
  totalSections: number;
  totalMaterials: number;
  publishedMaterials: number;
  draftsCount: number;
  archivedCount: number;
  recentActivity: Array<{
    id: string;
    title: string;
    action: 'published' | 'created' | 'updated' | 'draft';
    timestamp: string;
    category: string;
  }>;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const [classes, materials] = await Promise.all([
    loadCurriculumClasses(),
    loadMaterials(),
  ]);

  let totalSubjects = 0;
  let totalChapters = 0;
  let totalSections = 0;

  classes.forEach((c) => {
    totalSubjects += c.subjects.length;
    c.subjects.forEach((s) => {
      totalChapters += s.chapters.length;
      s.chapters.forEach((ch) => {
        totalSections += ch.sections.length;
      });
    });
  });

  const publishedMaterials = materials.filter((m) => m.status === 'published').length;
  const draftsCount = materials.filter((m) => m.status === 'draft').length;
  const archivedCount = materials.filter((m) => m.status === 'archived').length;

  const recentActivity = [
    {
      id: 'act-1',
      title: 'Rational Numbers - Chapter Notes',
      action: 'published' as const,
      timestamp: '15 mins ago',
      category: 'Class 8 · Mathematics',
    },
    {
      id: 'act-2',
      title: 'Linear Equations Lecture Slides',
      action: 'draft' as const,
      timestamp: '2 hours ago',
      category: 'Class 8 · Mathematics',
    },
    {
      id: 'act-3',
      title: 'Force and Pressure Infographic',
      action: 'published' as const,
      timestamp: 'Yesterday',
      category: 'Class 8 · Physical Science',
    },
    {
      id: 'act-4',
      title: 'అమ్మ ఒడి - పాఠ్యాంశ సమగ్ర విశ్లేషణ',
      action: 'updated' as const,
      timestamp: '2 days ago',
      category: 'Class 6 · Telugu',
    },
  ];

  return {
    totalClasses: classes.length,
    totalSubjects,
    totalChapters,
    totalSections,
    totalMaterials: materials.length,
    publishedMaterials,
    draftsCount,
    archivedCount,
    recentActivity,
  };
};
