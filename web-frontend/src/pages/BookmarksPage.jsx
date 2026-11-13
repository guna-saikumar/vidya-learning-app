import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredBookmarks, removeBookmark } from '../services/progressService';
import {
  Bookmark,
  Trash2,
  ChevronRight,
  Sparkles,
  BookOpen,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';
import styles from './BookmarksPage.css';

export const BookmarksPage = () => {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState(() => getStoredBookmarks());
  const [filterType, setFilterType] = useState('all');

  const handleRemove = async (id, e) => {
    e.stopPropagation();
    const updated = await removeBookmark(id);
    setBookmarks([...updated]);
  };

  const handleOpenBookmark = (bm) => {
    if (bm.classId && bm.subjectId && bm.chapterId) {
      navigate(`/courses/${bm.classId}/${bm.subjectId}/${bm.chapterId}`);
    }
  };

  const filteredBookmarks = useMemo(() => {
    if (filterType === 'formula') {
      return bookmarks.filter((b) => b.type === 'formula');
    }
    if (filterType === 'chapter') {
      return bookmarks.filter((b) => b.type !== 'formula');
    }
    return bookmarks;
  }, [bookmarks, filterType]);

  return (
    <div className={styles.container}>
      {/* ================= HERO BANNER (Matches Dashboard) ================= */}
      <section className={styles.welcomeBanner}>
        <div className={styles.welcomeContent}>
          <div className={styles.welcomePillRow}>
            <div className={styles.welcomePill}>
              <Bookmark size={15} />
              <span>Study Vault</span>
            </div>
            <div className={styles.welcomePillNeutral}>
              <GraduationCap size={14} />
              <span>AP SCERT Revision</span>
            </div>
            <div className={styles.welcomePillNeutral}>
              <span>{bookmarks.length} Saved Items</span>
            </div>
          </div>

          <h1 className={styles.welcomeTitle}>
            Formulas & <span className={styles.welcomeTitlePrimary}>Saved Notes</span>
          </h1>

          <p className={styles.welcomeSubtitle}>
            Your personal revision library. Bookmark important formulas, definitions, and chapter sections
            while studying to revisit them anytime before examinations.
          </p>

          <div className={styles.filterPillsRow}>
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`${styles.filterPill} ${filterType === 'all' ? styles.filterPillActive : ''}`}
            >
              All Bookmarks ({bookmarks.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('formula')}
              className={`${styles.filterPill} ${filterType === 'formula' ? styles.filterPillActive : ''}`}
            >
              <Sparkles size={14} />
              <span>Formulas & Theorems</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterType('chapter')}
              className={`${styles.filterPill} ${filterType === 'chapter' ? styles.filterPillActive : ''}`}
            >
              <BookOpen size={14} />
              <span>Chapter Lessons</span>
            </button>
          </div>
        </div>
      </section>

      {/* ================= BOOKMARKS LIST ================= */}
      <div className={styles.sectionBlock}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <h2 className={styles.sectionTitle}>Saved Reference Cards</h2>
            <p className={styles.sectionSubtitle}>
              Click any card to jump directly into the textbook chapter
            </p>
          </div>
          <div className={styles.badgePill}>
            <span>{filteredBookmarks.length} Showing</span>
          </div>
        </div>

        {filteredBookmarks.length > 0 ? (
          <div className={styles.bookmarkList}>
            {filteredBookmarks.map((bm) => (
              <div
                key={bm.id}
                onClick={() => handleOpenBookmark(bm)}
                className={styles.bookmarkCard}
              >
                <div className={styles.iconBox}>
                  {bm.type === 'formula' ? (
                    <Sparkles size={22} />
                  ) : (
                    <BookOpen size={22} />
                  )}
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.cardHeaderRow}>
                    <span className={styles.subjectText}>
                      {bm.subtitle || 'Chapter Formula'}
                    </span>
                    <span className={styles.savedBadge}>
                      {bm.type === 'formula' ? 'Formula' : 'Chapter'}
                    </span>
                  </div>

                  <h3 className={styles.bookmarkTitle}>{bm.title}</h3>

                  {bm.previewText && (
                    <div className={styles.previewBox}>
                      <p className={styles.previewText}>{bm.previewText}</p>
                    </div>
                  )}
                </div>

                <div className={styles.actionsGroup}>
                  <button
                    type="button"
                    onClick={(e) => handleRemove(bm.id, e)}
                    title="Remove from vault"
                    className={styles.deleteBtn}
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className={styles.chevronIcon}>
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyCard}>
            <div className={styles.emptyIconBox}>
              <Bookmark size={32} />
            </div>
            <h3 className={styles.emptyTitle}>
              {bookmarks.length === 0 ? 'No bookmarks saved yet' : 'No items match this filter'}
            </h3>
            <p className={styles.emptySubtitle}>
              {bookmarks.length === 0
                ? 'Tap the bookmark icon in any chapter reader or textbook lesson to pin important formulas and sections here.'
                : 'Switch back to "All Bookmarks" to see all your saved study items.'}
            </p>
            <button onClick={() => navigate('/courses')} className={styles.primaryBtn} style={{ marginTop: 10 }}>
              <span>Browse Textbooks</span>
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
