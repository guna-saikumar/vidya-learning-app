import { Notification } from '../types/curriculum';

const now = Date.now();
const DAY = 86400000;

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-4',
    title: 'New Curriculum Content: Understanding Quadrilaterals',
    message: 'Chapter 3: Understanding Quadrilaterals is now ready with interactive notes and exercises.',
    detailedBody: 'Comprehensive study materials for Class 8 Mathematics Chapter 3 are now live in the curriculum library.\n\nWhat is Included:\n• Polygon classification (convex, concave, regular)\n• Angle sum property of quadrilaterals\n• Properties of Parallelograms, Rhombus, Rectangles, and Squares\n• Solved examples aligned with AP SCERT textbook exercises\n\nStart reading the interactive chapter today!',
    type: 'update',
    icon: 'library-add',
    read: true,
    createdAt: now - DAY * 2,
    actionRoute: 'Learn',
    actionLabel: 'Explore Chapter in Learn Tab',
  },
  {
    id: 'notif-5',
    title: 'Study Reminder: Physical Science Force & Pressure',
    message: 'It has been 3 days since you last reviewed Force & Pressure. Resume now?',
    detailedBody: 'Spaced repetition helps retain scientific principles and definitions.\n\nSuggested Revision Topics:\n• Contact vs Non-contact forces (Gravitational, Electrostatic, Magnetic)\n• Definition of Pressure: Force per unit area (P = F / A)\n• Atmospheric pressure and liquid pressure experiments\n\nSpend 15 minutes reviewing the chapter summary to keep your memory fresh.',
    type: 'reminder',
    icon: 'notifications-active',
    read: true,
    createdAt: now - DAY * 3,
    actionRoute: 'Learn',
    actionLabel: 'Resume Science Chapter',
  },
];
