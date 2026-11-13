import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import { getClassById, getSubjectsByClass } from '../services/curriculumService';
import { getStoredProgress } from '../services/progressService';
import {
  BookOpen,
  Search,
  ChevronRight,
  School,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import styles from './CoursesPage.css';

export const CoursesPage = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const activeClassId = profile?.activeClassId || 'class-10';

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const schoolClass = useMemo(() => getClassById(activeClassId), [activeClassId]);
  const subjects = useMemo(() => getSubjectsByClass(activeClassId), [activeClassId]);
  const progressMap = useMemo(() => getStoredProgress(), []);

  // Compute stats across enrolled curriculum
  const { totalChapters, completedChapters, progressPercent } = useMemo(() => {
    let total = 0;
    let completed = 0;
    subjects.forEach((s) => {
      s.chapters.forEach((ch) => {
        total++;
        if (progressMap[ch.id]?.completed) {
          completed++;
        }
      });
    });
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      totalChapters: total,
      completedChapters: completed,
      progressPercent: percent,
    };
  }, [subjects, progressMap]);

  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) => {
      const matchesCategory =
        selectedCategory === 'all' || subject.category === selectedCategory;
      const matchesSearch =
        subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (subject.description ? subject.description.toLowerCase().includes(searchQuery.toLowerCase()) : false) ||
        (subject.code ? subject.code.toLowerCase().includes(searchQuery.toLowerCase()) : false);
      return matchesCategory && matchesSearch;
    });
  }, [subjects, selectedCategory, searchQuery]);

  const getSubjectStats = (chapters) => {
    if (!chapters || chapters.length === 0) return { percent: 0, completed: 0 };
    let completed = 0;
    let totalSum = 0;
    for (const ch of chapters) {
      const p = progressMap[ch.id];
      if (p) {
        if (p.completed) completed++;
        totalSum += p.progressPercent || 0;
      }
    }
    return {
      percent: Math.round(totalSum / chapters.length),
      completed,
    };
  };

  return (
    <div className={styles.container}>
      {/* ================= HERO BANNER (Matches Dashboard) ================= */}
      <section className={styles.welcomeBanner}>
        <div className={styles.welcomeContent}>
          <div className={styles.welcomePillRow}>
            <div className={styles.welcomePill}>
              <GraduationCap size={15} />
              <span>
                {schoolClass?.title || 'Class 10'} • Section {profile?.section || 'A'}
              </span>
            </div>
            <div className={styles.welcomePillNeutral}>
              <School size={14} />
              <span>{profile?.schoolName || 'AP State Board High School'}</span>
            </div>
            <div className={styles.welcomePillNeutral}>
              <BookOpen size={14} />
              <span>{subjects.length} Textbooks</span>
            </div>
          </div>

          <h1 className={styles.welcomeTitle}>
            Academic <span className={styles.welcomeTitlePrimary}>Curriculum</span>
          </h1>

          <p className={styles.welcomeSubtitle}>
            Official Andhra Pradesh State Board (SCERT) syllabus. Access all prescribed subject
            textbooks, digital lesson summaries, and chapter practice assessments.
          </p>

          <div className={styles.heroMetaStats}>
            <div className={styles.heroMetaItem}>
              <span className={styles.metaLabel}>Medium</span>
              <span className={styles.metaValue}>{profile?.medium || 'English'}</span>
            </div>
            <div className={styles.heroMetaItem}>
              <span className={styles.metaLabel}>Academic Year</span>
              <span className={styles.metaValue}>2026–27</span>
            </div>
            <div className={styles.heroMetaItem}>
              <span className={styles.metaLabel}>Total Chapters</span>
              <span className={styles.metaValue}>{totalChapters} Chapters</span>
            </div>
            <div className={styles.heroMetaItem}>
              <span className={styles.metaLabel}>Overall Progress</span>
              <span className={styles.metaValue} style={{ color: 'var(--primary)' }}>
                {progressPercent}% Complete
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PROGRESS SUMMARY STRIP ================= */}
      <div className={styles.progressCard}>
        <div className={styles.progressHeader}>
          <div className={styles.progressHeaderLeft}>
            <div className={styles.progressIconBadge}>
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 className={styles.progressTitle}>Annual Syllabus Completion</h3>
              <p className={styles.progressSub}>
                {completedChapters} of {totalChapters} chapters completed across all {subjects.length} subjects
              </p>
            </div>
          </div>
          <div className={styles.progressBadgeHighlight}>
            <span>{progressPercent}%</span>
          </div>
        </div>

        <div className={styles.progressTrack}>
          <div
            className={styles.progressBar}
            style={{ width: `${Math.max(progressPercent, 4)}%` }}
          />
        </div>
      </div>

      {/* ================= CONTROLS: SEARCH & CATEGORY PILLS ================= */}
      <div className={styles.controlsRow}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${schoolClass?.title || 'Class'} subjects, textbooks, or codes...`}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.categoriesBar}>
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`${styles.categoryPill} ${selectedCategory === 'all' ? styles.categoryPillActive : ''}`}
          >
            All Subjects ({subjects.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('stem')}
            className={`${styles.categoryPill} ${selectedCategory === 'stem' ? styles.categoryPillActive : ''}`}
          >
            Science & Math
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('languages')}
            className={`${styles.categoryPill} ${selectedCategory === 'languages' ? styles.categoryPillActive : ''}`}
          >
            Languages
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('social')}
            className={`${styles.categoryPill} ${selectedCategory === 'social' ? styles.categoryPillActive : ''}`}
          >
            Social Studies
          </button>
        </div>
      </div>

      {/* ================= SUBJECTS GRID ================= */}
      <div className={styles.subjectsSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <h2 className={styles.sectionTitle}>
              {schoolClass?.title || 'Class 10'} Textbooks
            </h2>
            <p className={styles.sectionSubtitle}>
              Select any textbook to explore chapters and start reading
            </p>
          </div>
          <div className={styles.badgePill}>
            <span>{filteredSubjects.length} Textbooks Available</span>
          </div>
        </div>

        <div className={styles.subjectsGrid}>
          {filteredSubjects.map((subject) => {
            const { percent, completed } = getSubjectStats(subject.chapters);
            return (
              <div
                key={subject.id}
                onClick={() => navigate(`/courses/${activeClassId}/${subject.id}`)}
                className={styles.subjectCard}
              >
                <div className={styles.cardTopRow}>
                  <div className={styles.subjectIconCircle}>
                    <BookOpen size={22} />
                  </div>
                  <div className={styles.subjectCodeBadge}>
                    <span>{subject.code || 'SCERT'}</span>
                  </div>
                </div>

                <div className={styles.cardContent}>
                  <h3 className={styles.subjectName}>{subject.name}</h3>
                  {subject.description && (
                    <p className={styles.subjectDesc}>{subject.description}</p>
                  )}
                </div>

                <div className={styles.cardProgressBlock}>
                  <div className={styles.cardProgressMeta}>
                    <span>{completed} of {subject.chapters.length} chapters done</span>
                    <span className={styles.cardProgressPct}>{percent}%</span>
                  </div>
                  <div className={styles.cardProgressTrack}>
                    <div
                      className={styles.cardProgressBar}
                      style={{ width: `${Math.max(percent, 4)}%` }}
                    />
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <span>Explore Chapters</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            );
          })}
        </div>

        {filteredSubjects.length === 0 && (
          <div className={styles.emptyBox}>
            <div className={styles.emptyIconCircle}>
              <BookOpen size={32} />
            </div>
            <h3 className={styles.emptyTitle}>No textbooks match your search</h3>
            <p className={styles.emptySubtitle}>
              Try searching with another keyword or switch category filters.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className={styles.primaryBtn}
              style={{ marginTop: 12 }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
