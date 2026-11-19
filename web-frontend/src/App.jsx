import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ToastProvider } from './components/common/Toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LearningProvider } from './hooks/useLearningProgress';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { StudentOnboardingPage } from './pages/StudentOnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { CoursesPage } from './pages/CoursesPage';
import { SubjectDetailsPage } from './pages/SubjectDetailsPage';
import { ChapterReaderPage } from './pages/ChapterReaderPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ContactPage } from './pages/ContactPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-soft)' }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '4px solid var(--primary)',
          borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite'
        }} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Account-level check: If this student has NOT completed setup, gate to /onboarding
  if (!user.isOnboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // If this student has ALREADY completed setup, redirect away from /onboarding
  if (user.isOnboarded && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <LearningProvider>
              <Routes>
          {/* Public Landing & Marketing Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Student Onboarding (Student Setup Form) */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <StudentOnboardingPage />
              </ProtectedRoute>
            }
          />

          {/* Authenticated Student Portal */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:classId/:subjectId" element={<SubjectDetailsPage />} />
            <Route path="/courses/:classId/:subjectId/:chapterId" element={<ChapterReaderPage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </LearningProvider>
    </AuthProvider>
  </ToastProvider>
  </BrowserRouter>
</ErrorBoundary>
);
}
