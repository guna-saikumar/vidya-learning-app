import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getChapterById } from '../services/curriculumService';
import {
  getStoredProgress,
  saveChapterProgress,
  getStoredBookmarks,
  addBookmark,
  removeBookmark,
} from '../services/progressService';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Bookmark,
  Sparkles,
  Clock,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  BookOpen,
  GraduationCap,
  Layers,
} from 'lucide-react';
import styles from './ChapterReaderPage.css';

export const ChapterReaderPage = () => {
  const navigate = useNavigate();
  const { classId = 'class-10', subjectId = '', chapterId = '' } = useParams();

  const { schoolClass, subject, chapter } = useMemo(
    () => getChapterById(classId, subjectId, chapterId),
    [classId, subjectId, chapterId]
  );

  const [progressMap, setProgressMap] = useState(() => getStoredProgress());
  const [bookmarks, setBookmarks] = useState(() => getStoredBookmarks());
  const [selectedQuizIdx, setSelectedQuizIdx] = useState(null);

  const chapterProgress = progressMap[chapterId];
  const isCompleted = Boolean(chapterProgress?.completed);
  const completedSections = chapterProgress?.completedSections || [];

  const isBookmarked = bookmarks.some((b) => b.chapterId === chapterId && b.type === 'chapter');

  const { prevChapter, nextChapter } = useMemo(() => {
    if (!subject) return { prevChapter: null, nextChapter: null };
    const idx = subject.chapters.findIndex((c) => c.id === chapterId);
    return {
      prevChapter: idx > 0 ? subject.chapters[idx - 1] : null,
      nextChapter: idx < subject.chapters.length - 1 ? subject.chapters[idx + 1] : null,
    };
  }, [subject, chapterId]);

  const handleToggleComplete = async () => {
    if (!chapter) return;
    const willBeCompleted = !isCompleted;
    const allSectionIds = chapter.sections.map((s) => s.id);

    const updated = await saveChapterProgress({
      chapterId: chapter.id,
      subjectId,
      classId,
      progressPercent: willBeCompleted ? 100 : 0,
      completed: willBeCompleted,
      lastAccessed: Date.now(),
      completedSections: willBeCompleted ? allSectionIds : [],
    });
    setProgressMap({ ...updated });
  };

  const handleToggleSection = async (sectionId) => {
    if (!chapter) return;
    const isDone = completedSections.includes(sectionId);
    const nextSections = isDone
      ? completedSections.filter((id) => id !== sectionId)
      : [...completedSections, sectionId];

    const percent = Math.min(100, Math.round((nextSections.length / Math.max(1, chapter.sections.length)) * 100));

    const updated = await saveChapterProgress({
      chapterId: chapter.id,
      subjectId,
      classId,
      progressPercent: percent,
      completed: percent === 100,
      lastAccessed: Date.now(),
      completedSections: nextSections,
    });
    setProgressMap({ ...updated });
  };

  const handleToggleBookmark = async () => {
    if (!chapter || !subject) return;
    if (isBookmarked) {
      const match = bookmarks.find((b) => b.chapterId === chapterId && b.type === 'chapter');
      if (match) {
        const updated = await removeBookmark(match.id);
        setBookmarks([...updated]);
      }
    } else {
      const updated = await addBookmark({
        title: chapter.title,
        subtitle: `${subject.name} • Chapter ${chapter.order}`,
        type: 'chapter',
        chapterId: chapter.id,
        subjectId,
        classId,
        previewText: chapter.description || (chapter.sections[0]?.content?.slice(0, 160) + '...'),
      });
      setBookmarks([...updated]);
    }
  };

  if (!chapter || !subject) {
    return (
      <div className={styles.container}>
        <Link to={`/courses/${classId}/${subjectId}`} className={styles.backLink}>
          <ArrowLeft size={16} /> Back to Subject
        </Link>
        <div className={styles.notFoundCard}>
          <BookOpen size={48} color="var(--primary)" />
          <h2 className={styles.notFoundTitle}>Chapter Not Found</h2>
          <p className={styles.notFoundSubtitle}>
            The selected chapter is not available in the curriculum.
          </p>
          <Link to="/courses" className={styles.primaryBtn} style={{ marginTop: 12 }}>
            Return to Curriculum
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Top Breadcrumb & Navigation */}
      <div className={styles.topBar}>
        <Link to={`/courses/${classId}/${subjectId}`} className={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Back to {subject.name}</span>
        </Link>

        <span className={styles.chapterOrderText}>
          Chapter {chapter.order} of {subject.chapters.length}
        </span>
      </div>

      {/* ================= HERO BANNER (Matches Dashboard) ================= */}
      <section className={styles.welcomeBanner}>
        <div className={styles.welcomeContent}>
          <div className={styles.welcomePillRow}>
            <div className={styles.welcomePill}>
              <GraduationCap size={15} />
              <span>{schoolClass?.title || 'Class 10'} • {subject.name}</span>
            </div>
            <div className={styles.welcomePillNeutral}>
              <Layers size={14} />
              <span>Chapter {chapter.order} • {chapter.sections.length} Sections</span>
            </div>
            {chapter.durationMinutes && (
              <div className={styles.welcomePillNeutral}>
                <Clock size={14} />
                <span>~{chapter.durationMinutes} mins</span>
              </div>
            )}
            <div className={`${styles.statusChip} ${isCompleted ? styles.statusChipDone : styles.statusChipActive}`}>
              {isCompleted ? 'Completed' : `${completedSections.length}/${chapter.sections.length} Read`}
            </div>
          </div>

          <h1 className={styles.welcomeTitle}>{chapter.title}</h1>
          {chapter.description && (
            <p className={styles.welcomeSubtitle}>{chapter.description}</p>
          )}

          {/* Action Buttons Row */}
          <div className={styles.actionRow}>
            <button
              type="button"
              onClick={handleToggleComplete}
              className={`${styles.actionBtn} ${isCompleted ? styles.actionBtnSuccessActive : styles.actionBtnSuccessOutline}`}
            >
              <CheckCircle2 size={16} />
              <span>{isCompleted ? 'Marked as Completed' : 'Mark Entire Chapter Complete'}</span>
            </button>

            <button
              type="button"
              onClick={handleToggleBookmark}
              className={`${styles.actionBtn} ${isBookmarked ? styles.actionBtnBookmarkActive : styles.actionBtnBookmarkOutline}`}
            >
              <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
              <span>{isBookmarked ? 'Saved to Vault' : 'Bookmark for Revision'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Learning Objectives Box */}
      {chapter.learningGoals && chapter.learningGoals.length > 0 && (
        <div className={styles.objectivesBox}>
          <div className={styles.objectivesHeader}>
            <div className={styles.objectivesIconBadge}>
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className={styles.objectivesTitle}>Core Learning Objectives</h3>
              <p className={styles.objectivesSub}>
                Master the key conceptual competencies prescribed for this textbook chapter:
              </p>
            </div>
          </div>

          <div className={styles.goalsList}>
            {chapter.learningGoals.map((goal, idx) => (
              <div key={idx} className={styles.goalItem}>
                <div className={styles.goalNum}>{idx + 1}</div>
                <p className={styles.goalText}>{goal}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chapter Sections List */}
      <div className={styles.sectionsList}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <h2 className={styles.sectionTitle}>Detailed Study Sections</h2>
            <p className={styles.sectionSubtitle}>
              Read each section and mark complete as you finish studying
            </p>
          </div>
          <div className={styles.badgePill}>
            <span>{completedSections.length} of {chapter.sections.length} Done</span>
          </div>
        </div>

        {chapter.sections.map((section, idx) => {
          const isDone = completedSections.includes(section.id);
          return (
            <div
              key={section.id}
              className={`${styles.sectionCard} ${isDone ? styles.sectionCardDone : ''}`}
            >
              <div className={styles.sectionHeaderRow}>
                <div className={styles.sectionHeaderLeft}>
                  <div className={styles.sectionIdxBox}>{idx + 1}</div>
                  <div>
                    <h3 className={styles.sectionHeading}>{section.title}</h3>
                    {section.durationMinutes && (
                      <div className={styles.sectionDuration}>
                        <Clock size={12} />
                        <span>{section.durationMinutes} min read</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleSection(section.id)}
                  className={`${styles.sectionCompleteBtn} ${isDone ? styles.sectionCompleteBtnDone : styles.sectionCompleteBtnIdle}`}
                >
                  {isDone ? (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Completed</span>
                    </>
                  ) : (
                    <>
                      <Circle size={16} />
                      <span>Mark Complete</span>
                    </>
                  )}
                </button>
              </div>

              {/* Section Content */}
              <div className={styles.sectionContent}>
                <p>{section.content}</p>
              </div>

              {/* Summary Point / Axiom Box */}
              {section.summaryPoint && (
                <div className={styles.summaryBox}>
                  <span className={styles.summaryLabel}>Key Concept / Axiom</span>
                  <p className={styles.summaryText}>"{section.summaryPoint}"</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Chapter Quiz if available */}
      {chapter.quiz && (
        <div className={styles.quizCard}>
          <div className={styles.quizHeader}>
            <div className={styles.quizIconBadge}>
              <HelpCircle size={20} />
            </div>
            <div>
              <h3 className={styles.quizTitle}>Concept Check Assessment</h3>
              <p className={styles.quizSubtitle}>Test your understanding of the core concepts in this lesson</p>
            </div>
          </div>

          <p className={styles.quizQuestion}>{chapter.quiz.question}</p>

          <div className={styles.quizOptions}>
            {chapter.quiz.options.map((opt, optIdx) => {
              const isSelected = selectedQuizIdx === optIdx;
              const isCorrect = optIdx === chapter.quiz?.correctIndex;
              let optionStyle = '';

              if (selectedQuizIdx !== null) {
                if (isSelected) {
                  optionStyle = isCorrect ? styles.quizOptionCorrect : styles.quizOptionIncorrect;
                } else if (isCorrect) {
                  optionStyle = styles.quizOptionCorrect;
                }
              }

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => setSelectedQuizIdx(optIdx)}
                  className={`${styles.quizOptionBtn} ${optionStyle}`}
                >
                  <span>{opt}</span>
                  {selectedQuizIdx !== null && isCorrect && (
                    <CheckCircle2 size={16} color="#059669" />
                  )}
                </button>
              );
            })}
          </div>

          {selectedQuizIdx !== null && (
            <div className={styles.quizExplanation}>
              <strong style={{ color: 'var(--primary)' }}>Academic Explanation: </strong>
              {chapter.quiz.explanation}
            </div>
          )}
        </div>
      )}

      {/* Navigation Footer */}
      <div className={styles.navFooter}>
        {prevChapter ? (
          <button
            onClick={() => navigate(`/courses/${classId}/${subjectId}/${prevChapter.id}`)}
            className={styles.chapterNavBtn}
          >
            <ChevronLeft size={16} />
            <span>Previous: {prevChapter.title}</span>
          </button>
        ) : <div />}

        {nextChapter ? (
          <button
            onClick={() => navigate(`/courses/${classId}/${subjectId}/${nextChapter.id}`)}
            className={`${styles.chapterNavBtn} ${styles.chapterNavBtnNext}`}
          >
            <span>Next: {nextChapter.title}</span>
            <ChevronRight size={16} />
          </button>
        ) : <div />}
      </div>
    </div>
  );
};
