import React, { useState, useMemo } from 'react';
import {
  getStoredNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/progressService';
import {
  Bell,
  Sparkles,
  Calendar,
  Check,
  CheckCheck,
  School,
  FileText,
} from 'lucide-react';
import styles from './NotificationsPage.css';

const formatTime = (timestamp) => {
  const time = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp;
  const now = Date.now();
  const diff = now - time;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (isNaN(diff) || minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
};

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState(() => getStoredNotifications());
  const [filterType, setFilterType] = useState('all');

  const unreadCount = notifications.filter((n) => !n.isRead && !n.read).length;

  const handleNotificationClick = (id) => {
    const updated = markNotificationAsRead(id);
    setNotifications([...updated]);
  };

  const handleMarkAllRead = () => {
    const updated = markAllNotificationsAsRead();
    setNotifications([...updated]);
  };

  const filteredNotifications = useMemo(() => {
    if (filterType === 'unread') {
      return notifications.filter((n) => !n.isRead && !n.read);
    }
    if (filterType === 'academic') {
      return notifications.filter((n) => n.type === 'announcement' || !n.type);
    }
    if (filterType === 'reminders') {
      return notifications.filter((n) => n.type === 'reminder' || n.type === 'achievement');
    }
    return notifications;
  }, [notifications, filterType]);

  const getIconConfig = (type) => {
    switch (type) {
      case 'achievement':
        return {
          icon: Sparkles,
          label: 'Milestone',
        };
      case 'reminder':
        return {
          icon: Calendar,
          label: 'Schedule',
        };
      case 'announcement':
      default:
        return {
          icon: FileText,
          label: 'Board Notice',
        };
    }
  };

  return (
    <div className={styles.container}>
      {/* ================= HERO BANNER (Matches Dashboard) ================= */}
      <section className={styles.welcomeBanner}>
        <div className={styles.welcomeContent}>
          <div className={styles.welcomePillRow}>
            <div className={styles.welcomePill}>
              <Bell size={15} />
              <span>Board Notices</span>
            </div>
            <div className={styles.welcomePillNeutral}>
              <School size={14} />
              <span>AP SCERT Official Circulars</span>
            </div>
            <div className={styles.welcomePillNeutral}>
              <span>{unreadCount > 0 ? `${unreadCount} Unread` : 'All Caught Up'}</span>
            </div>
          </div>

          <div className={styles.bannerHeaderRow}>
            <div>
              <h1 className={styles.welcomeTitle}>
                Academic <span className={styles.welcomeTitlePrimary}>Circulars & Updates</span>
              </h1>

              <p className={styles.welcomeSubtitle}>
                Official state board schedules, examination timetables, practical circulars,
                and textbook syllabus announcements directly from the education department.
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className={styles.markAllBtn}
              >
                <CheckCheck size={16} />
                <span>Mark All Read</span>
              </button>
            )}
          </div>

          <div className={styles.filterPillsRow}>
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`${styles.filterPill} ${filterType === 'all' ? styles.filterPillActive : ''}`}
            >
              All Circulars ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('unread')}
              className={`${styles.filterPill} ${filterType === 'unread' ? styles.filterPillActive : ''}`}
            >
              Unread ({unreadCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('academic')}
              className={`${styles.filterPill} ${filterType === 'academic' ? styles.filterPillActive : ''}`}
            >
              Board Circulars
            </button>
            <button
              type="button"
              onClick={() => setFilterType('reminders')}
              className={`${styles.filterPill} ${filterType === 'reminders' ? styles.filterPillActive : ''}`}
            >
              Schedules & Tests
            </button>
          </div>
        </div>
      </section>

      {/* ================= NOTIFICATIONS LIST ================= */}
      <div className={styles.sectionBlock}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <h2 className={styles.sectionTitle}>Official Announcements</h2>
            <p className={styles.sectionSubtitle}>
              Tap any notice to mark it as read and view full circular details
            </p>
          </div>
          <div className={styles.badgePill}>
            <span>{filteredNotifications.length} Bulletins</span>
          </div>
        </div>

        {filteredNotifications.length > 0 ? (
          <div className={styles.list}>
            {filteredNotifications.map((notif) => {
              const isRead = Boolean(notif.isRead ?? notif.read);
              const { icon: IconComp, label } = getIconConfig(notif.type);

              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif.id)}
                  className={`${styles.notifCard} ${!isRead ? styles.notifCardUnread : ''}`}
                >
                  <div className={styles.notifIconBox}>
                    <IconComp size={20} />
                  </div>

                  <div className={styles.notifBody}>
                    <div className={styles.notifHeaderRow}>
                      <div className={styles.notifTitleGroup}>
                        <span className={styles.notifCategory}>{label}</span>
                        <h3 className={`${styles.notifTitle} ${isRead ? styles.notifTitleRead : ''}`}>
                          {notif.title}
                        </h3>
                      </div>

                      <div className={styles.timeDotGroup}>
                        <span className={styles.timeText}>
                          {formatTime(notif.createdAt)}
                        </span>
                        {!isRead && <div className={styles.unreadDot} />}
                      </div>
                    </div>

                    <p className={styles.notifMessage}>
                      {notif.message || notif.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyCard}>
            <div className={styles.emptyIconBox}>
              <Check size={32} />
            </div>
            <h3 className={styles.emptyTitle}>You're all caught up!</h3>
            <p className={styles.emptySubtitle}>
              There are no unread circulars at this moment. You will receive notifications when new board schedules or academic advisories are published.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
