export type ItemStatus = 'Not Started' | 'In Progress' | 'Memorized';

export interface CourseItem {
  id: number;
  name: string;
  stageId: number;
  status: ItemStatus;
  lastReviewed?: string;
  notes?: string;
  isStarred?: boolean;
}

export interface Stage {
  id: number;
  title: string;
  description: string;
  totalItems: number;
  completedItems: number;
  status: 'Completed' | 'In Progress' | 'Locked';
  items: CourseItem[];
}

export interface Student {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  joinedDate: string;
  masteredCount: number;
  totalCount: number;
  streakDays: number;
  retentionRate: number;
  lastUpdate: string;
  currentFocus: string;
  stageProgress: { [stageId: number]: { completed: number; total: number } };
  itemsStatus: { [itemId: number]: ItemStatus };
  starredItemIds: number[];
  enrolledClassroom?: string;
}

export interface ClassmateRanking {
  id: string;
  name: string;
  avatarUrl?: string;
  rank: number;
  completed: number;
  total: number;
}

export interface Target {
  id: string;
  surahName: string;
  verses: string;
  assignedDate: string;
  dueDate: string;
  progress: number;
  status: 'Urgent' | 'In Progress' | 'Completed';
}

export interface ActivityLog {
  id: string;
  type: 'review' | 'memorization' | 'target_assigned' | 'target_completed';
  title: string;
  timestamp: string;
  xp: number;
}

export interface Classroom {
  name: string;
  instructor: string;
  studentCount: number;
  pin: string;
  nextReviewDate: string;
  quote: {
    text: string;
    source: string;
  };
  isDeleted?: boolean;
}

export interface UserSession {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: 'Student' | 'Teacher';
    avatarUrl?: string;
  } | null;
}
