import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './index';
import { getEnrolledClassStats } from '../services/curriculumService';
import { SchoolClass, ChapterProgress } from '../types/curriculum';

export interface RecentProgressItem {
  chapterId: string;
  subjectId: string;
  classId: string;
  progressPercent: number;
  completed: boolean;
  lastAccessed: number;
  completedSections: string[];
}

export interface EnrolledCurriculumStats {
  schoolClass: SchoolClass | undefined;
  grade: number;
  totalSubjects: number;
  totalChapters: number;
  completedChapters: number;
  progressPercent: number;
  recentProgress: RecentProgressItem[];
  subjectProgressMap: Record<string, { percent: number; completed: number }>;
}

const selectActiveClassId = (state: RootState) => state.student.profile?.activeClassId;
const selectProgressMap = (state: RootState) => state.progress.progressMap;

export const selectEnrolledCurriculumStats = createSelector(
  [selectActiveClassId, selectProgressMap],
  (activeClassId, progressMap): EnrolledCurriculumStats => {
    const enrolledInfo = getEnrolledClassStats(activeClassId);
    const schoolClass = enrolledInfo.schoolClass;

    if (!schoolClass) {
      return {
        schoolClass: undefined,
        grade: 0,
        totalSubjects: 0,
        totalChapters: 0,
        completedChapters: 0,
        progressPercent: 0,
        recentProgress: [],
        subjectProgressMap: {},
      };
    }

    let totalChapters = 0;
    let completedChapters = 0;
    const subjectProgressMap: Record<string, { percent: number; completed: number }> = {};

    for (const subject of schoolClass.subjects) {
      let subjCompleted = 0;
      let subjTotal = subject.chapters.length;
      totalChapters += subjTotal;

      for (const ch of subject.chapters) {
        const p = progressMap[ch.id];
        if (p?.completed) {
          completedChapters++;
          subjCompleted++;
        }
      }

      const subjPercent = subjTotal > 0 ? Math.round((subjCompleted / subjTotal) * 100) : 0;
      subjectProgressMap[subject.id] = {
        percent: subjPercent,
        completed: subjCompleted,
      };
    }

    const progressPercent =
      totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

    // Recent in-progress chapters
    const inProgress = Object.values(progressMap)
      .filter((p) => !p.completed && (p.progressPercent > 0 || (p.lastAccessed && p.lastAccessed > 0)))
      .sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0));

    let recentProgress: RecentProgressItem[] = [];

    if (inProgress.length > 0) {
      recentProgress = inProgress.slice(0, 2).map((p) => ({
        chapterId: p.chapterId,
        subjectId: p.subjectId,
        classId: p.classId,
        progressPercent: p.progressPercent || 0,
        completed: false,
        lastAccessed: p.lastAccessed || Date.now(),
        completedSections: p.completedSections || [],
      }));
    } else if (schoolClass.subjects.length > 0) {
      // Default to the first uncompleted chapter
      for (const subj of schoolClass.subjects) {
        for (const ch of subj.chapters || []) {
          const p = progressMap[ch.id];
          if (!p || !p.completed) {
            recentProgress = [
              {
                chapterId: ch.id,
                subjectId: subj.id,
                classId: schoolClass.id,
                progressPercent: p?.progressPercent || 0,
                completed: false,
                lastAccessed: p?.lastAccessed || Date.now(),
                completedSections: p?.completedSections || [],
              },
            ];
            break;
          }
        }
        if (recentProgress.length > 0) break;
      }
    }

    return {
      schoolClass,
      grade: schoolClass.grade,
      totalSubjects: schoolClass.subjects.length,
      totalChapters,
      completedChapters,
      progressPercent,
      recentProgress,
      subjectProgressMap,
    };
  }
);
