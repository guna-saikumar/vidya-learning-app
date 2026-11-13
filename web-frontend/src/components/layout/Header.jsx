import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Bookmark,
  Bell,
  HelpCircle,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Home,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { resolveAvatarUrl } from '../../lib/avatar';
import styles from './Header.css';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/courses', label: 'Curriculum', icon: BookOpen },
  { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/contact', label: 'Support', icon: HelpCircle },
];

export const Header = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { profile } = useProfile();

  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const menuRef = useRef(null);
  const avatar = resolveAvatarUrl(profile?.avatarUrl);

  const grade = profile?.grade || '10';
  const displayName =
    profile?.firstName && profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : profile?.fullName || profile?.name || user?.name || 'Student';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        {/* Left: Brand Logo & Wordmark */}
        <div className={styles.brandGroup}>
          <Link to="/dashboard" className={styles.brandLink}>
            <div className={styles.logoBadge}>
              <img
                src="/assets/logo.png"
                alt="Vidya Learning"
                className={styles.logoImg}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <span className={styles.brandText}>
              Vidya <span className={styles.brandHighlight}>Learning</span>
            </span>
          </Link>
          <span className={styles.classPill}>Class {grade}</span>
        </div>

        {/* Center: Top Navigation Links */}
        <nav>
          <ul className={styles.navLinksList}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                    }
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right: Student Profile & Dropdown */}
        <div className={styles.userSection} ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className={styles.profileButton}
            aria-label="Student menu"
          >
            {avatar && !avatarError ? (
              <img
                src={avatar}
                alt={displayName}
                onError={() => setAvatarError(true)}
                className={styles.avatar}
              />
            ) : (
              <div className={styles.avatarFallback}>
                {(displayName[0] || 'S').toUpperCase()}
              </div>
            )}
            <span className={styles.displayName}>{displayName.split(' ')[0]}</span>
            <ChevronDown
              size={15}
              className={`${styles.chevronIcon} ${menuOpen ? styles.chevronIconOpen : ''}`}
            />
          </button>

          {/* Profile Flyout Dropdown */}
          {menuOpen && (
            <div className={styles.dropdownMenu}>
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className={styles.menuItem}
              >
                <User size={16} />
                <span>Student Profile</span>
              </Link>

              <Link
                to="/settings"
                onClick={() => setMenuOpen(false)}
                className={styles.menuItem}
              >
                <Settings size={16} />
                <span>Settings</span>
              </Link>

              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className={styles.menuItem}
              >
                <Home size={16} />
                <span>Landing Page</span>
              </Link>

              <div className={styles.menuDivider} />

              <button
                type="button"
                onClick={handleSignOut}
                className={`${styles.menuItem} ${styles.menuItemDanger}`}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className={styles.mobileMenuBtn}
            aria-label="Toggle mobile menu"
          >
            {mobileDrawerOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div className={styles.mobileNavDrawer}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileDrawerOpen(false)}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                }
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </header>
  );
};
