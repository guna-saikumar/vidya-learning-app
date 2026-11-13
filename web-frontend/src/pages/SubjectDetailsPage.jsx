import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getSubjectById, getClassById } from '../services/curriculumService';
import { getStoredProgress } from '../services/progressService';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Layers,
  GraduationCap,
  Play,
  Sparkles,
} from 'lucide-react';
import styles from './SubjectDetailsPage.css';

export const SubjectDetailsPage = () => {
  const navigate = useNavigate();
  const { classId = 'class-10', subjectId = '' } = useParams();

  const schoolClass = useMemo(() => getClassById(classId), [classId]);
  const subject = useMemo(() => getSubjectById(classId, subjectId), [classId, subjectId]);
  const progressMap = useMemo(() => getStoredProgress(), []);

  if (!subject) {
    return (
      <div className={styles.container}>
        <Link to="/courses" className={styles.backLink}>
          <ArrowLeft size={16} /> Back to Curriculum
        </Link>
        <div className={styles.notFoundCard}>
          <BookOpen size={48} color="var(--primary)" />
          <h2 className={styles.notFoundTitle}>Subject Not Found</h2>
          <p className={styles.notFoundSubtitle}>
            The requested curriculum subject could not be located.
          </p>
          <Link to="/courses" className={styles.primaryBtn} style={{ marginTop: 12 }}>
            Return to Curriculum
          </Link>
        </div>
      </div>
    );
  }

  const completedCount = subject.chapters.filter((c) => progressMap[c.id]?.completed).length;
  const progressPercent =
    subject.chapters.length > 0 ? Math.round((completedCount / subject.chapters.length) * 100) : 0;

  // Find next unread chapter or first chapter
  const nextChapter = subject.chapters.find((c) => !progressMap[c.id]?.completed) || subject.chapters[0];

  return (
    <div className={styles.container}>
      {/* Back button */}
      <div>
        <Link to="/courses" className={styles.backLink}>
          <ArrowLeft size={16} /> Back to Curriculum
        </Link>
      </div>

      {/* ================= HERO BANNER (Matches Dashboard) ================= */}
      <section className={styles.welcomeBanner}>
        <div className={styles.welcomeContent}>
          <div className={styles.welcomePillRow}>
            <div className={styles.welcomePill}>
              <GraduationCap size={15} />
              <span>{schoolClass?.title || 'Class 10'}</span>
            </div>
            <div className={styles.welcomePillNeutral}>
              <BookOpen size={14} />
              <span>{subject.code || 'SCERT'} • {subject.category.toUpperCase()}</span>
            </div>
            <div className={styles.welcomePillNeutral}>
              <span>{subject.chapters.length} Chapters</span>
            </div>
          </div>

          <div className={styles.bannerHeaderFlex}>
            <div className={styles.bannerHeaderLeft}>
              <div className={styles.subjectIconBox}>
                <BookOpen size={30} />
              </div>
              <div>
                <h1 className={styles.welcomeTitle}>{subject.name}</h1>
                {subject.description && (
                  <p className={styles.welcomeSubtitle}>{subject.description}</p>
                )}
              </div>
            </div>

            <div className={styles.progressCardWidget}>
              <div className={styles.widgetHeader}>
                <span className={styles.widgetLabel}>Syllabus Progress</span>
                <span className={styles.widgetValue}>{progressPercent}%</span>
              </div>
              <div className={styles.widgetTrack}>
                <div
                  className={styles.widgetBar}
                  style={{ width: `${Math.max(progressPercent, 5)}%` }}
                />
              </div>
              <span className={styles.widgetMeta}>
                {completedCount} of {subject.chapters.length} chapters completed
              </span>
            </div>
          </div>

          {nextChapter && (
            <div className={styles.bannerActionRow}>
              <button
                onClick={() => navigate(`/courses/${classId}/${subject.id}/${nextChapter.id}`)}
                className={styles.primaryBtn}
              >
                <Play size={15} fill="currentColor" />
                <span>Continue: Chapter {nextChapter.order} - {nextChapter.title}</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ================= CHAPTERS LIST ================= */}
      <div className={styles.chapterListSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <h2 className={styles.sectionTitle}>Chapters & Lesson Units</h2>
            <p className={styles.sectionSubtitle}>
              Prescribed SCERT textbook chapters with reading notes and practice tests
            </p>
          </div>
          <div className={styles.badgePill}>
            <span>{completedCount} / {subject.chapters.length} Completed</span>
          </div>
        </div>

        <div className={styles.chaptersGrid}>
          {subject.chapters.map((chapter) => {
            const isCompleted = Boolean(progressMap[chapter.id]?.completed);
            const progress = progressMap[chapter.id]?.progressPercent || (isCompleted ? 100 : 0);

            return (
              <div
                key={chapter.id}
                onClick={() => navigate(`/courses/${classId}/${subject.id}/${chapter.id}`)}
                className={`${styles.chapterCard} ${isCompleted ? styles.chapterCardDone : ''}`}
              >
                <div className={styles.chapterOrderCircle}>
                  <span>{chapter.order}</span>
                </div>

                <div className={styles.chapterBody}>
                  <div className={styles.chapterTopRow}>
                    <h3 className={styles.chapterTitle}>{chapter.title}</h3>
                    {isCompleted ? (
                      <div className={styles.completedBadge}>
                        <CheckCircle2 size={14} />
                        <span>Done</span>
                      </div>
                    ) : progress > 0 ? (
                      <div className={styles.inProgressBadge}>
                        <span>{progress}%</span>
                      </div>
                    ) : null}
                  </div>

                  {chapter.description && (
                    <p className={styles.chapterDesc}>{chapter.description}</p>
                  )}

                  <div className={styles.chapterMetaRow}>
                    <div className={styles.metaSnippet}>
                      <Layers size={13} />
                      <span>{chapter.sections.length} Sections</span>
                    </div>
                    {chapter.durationMinutes && (
                      <div className={styles.metaSnippet}>
                        <Clock size={13} />
                        <span>~{chapter.durationMinutes} mins read</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.chapterActionArrow}>
                  <ChevronRight size={18} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
