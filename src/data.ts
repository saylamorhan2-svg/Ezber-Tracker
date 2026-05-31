import { Stage, Student, Target, ActivityLog, Classroom } from './types';

export const DEFAULT_CLASSROOM: Classroom = {
  name: 'Morning Hifz Class',
  instructor: 'Ustadh Ahmed Al-Farsi',
  studentCount: 24,
  pin: '4829',
  nextReviewDate: 'Tomorrow',
  quote: {
    text: 'The best among you are those who learn the Qur\'an and teach it.',
    source: 'Sahih al-Bukhari'
  }
};

export const DEFAULT_TARGETS: Target[] = [
  {
    id: 't-1',
    surahName: 'Surah Al-Baqarah',
    verses: 'Verses 142 - 176',
    assignedDate: 'Nov 12',
    dueDate: 'Due in 2 days',
    progress: 65,
    status: 'In Progress'
  },
  {
    id: 't-2',
    surahName: 'Surah An-Nisa',
    verses: 'Verses 1 - 10',
    assignedDate: 'Nov 14',
    dueDate: 'Due in 5 days',
    progress: 20,
    status: 'In Progress'
  }
];

export const DEFAULT_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'a-1',
    type: 'review',
    title: 'Review: Juz 30 Complete',
    timestamp: 'Yesterday at 4:30 PM',
    xp: 15
  },
  {
    id: 'a-2',
    type: 'memorization',
    title: 'Surah Al-Imran New Memorization',
    timestamp: 'Nov 13 at 9:00 AM',
    xp: 42
  }
];

export const STAGE_TEMPLATE = [
  {
    id: 1,
    title: 'Stage 1: The Foundations',
    description: 'Core foundational steps of memorization.',
    items: [
      { id: 1, name: 'TEKBIR', stageId: 1, status: 'Memorized' as const, lastReviewed: 'Oct 12, 2023', isStarred: true },
      { id: 2, name: 'SANA', stageId: 1, status: 'Memorized' as const, lastReviewed: 'Oct 14, 2023', isStarred: false },
      { id: 3, name: 'AT-TAHIYYAT', stageId: 1, status: 'Memorized' as const, lastReviewed: 'Oct 15, 2023', isStarred: false },
      { id: 4, name: 'ALLAHUMMA SALLI', stageId: 1, status: 'Memorized' as const, lastReviewed: 'Oct 20, 2023', isStarred: false },
      { id: 5, name: 'ALLAHUMMA BARIK', stageId: 1, status: 'Memorized' as const, lastReviewed: 'Oct 22, 2023', isStarred: false },
      { id: 6, name: 'RABBANAA AATINAA', stageId: 1, status: 'Memorized' as const, lastReviewed: 'Oct 25, 2023', isStarred: false },
      { id: 7, name: 'RABBANA GHIFRILI', stageId: 1, status: 'Memorized' as const, lastReviewed: 'Oct 27, 2023', isStarred: false },
      { id: 8, name: 'KUNUT 1', stageId: 1, status: 'Memorized' as const, lastReviewed: 'Nov 01, 2023', isStarred: false },
      { id: 9, name: 'KUNUT 2', stageId: 1, status: 'Memorized' as const, lastReviewed: 'Nov 03, 2023', isStarred: false },
      { id: 10, name: 'AYAT AL-KURSI', stageId: 1, status: 'Memorized' as const, lastReviewed: 'Nov 05, 2023', isStarred: true },
      { id: 11, name: 'AMANAR-RASULU', stageId: 1, status: 'Memorized' as const, lastReviewed: 'Nov 08, 2023', isStarred: false },
      { id: 12, name: 'HUWALLAHUL-LAZI', stageId: 1, status: 'Memorized' as const, lastReviewed: 'Nov 10, 2023', isStarred: false },
      { id: 13, name: 'SURAH AD-DUHA', stageId: 1, status: 'Memorized' as const, lastReviewed: 'Nov 12, 2023', isStarred: false },
      { id: 14, name: 'SURAH ASH-SHARH', stageId: 1, status: 'Memorized' as const, lastReviewed: 'Nov 15, 2023', isStarred: false }
    ]
  },
  {
    id: 2,
    title: 'Stage 2: Core Practices',
    description: 'Frequently recited short surahs.',
    items: [
      { id: 15, name: 'SURAH AL-FATIHA', stageId: 2, status: 'Memorized' as const, lastReviewed: '2 days ago', isStarred: false },
      { id: 16, name: 'SURAH AL-IKHLAS', stageId: 2, status: 'In Progress' as const, lastReviewed: 'Yesterday', isStarred: true },
      { id: 17, name: 'SURAH AL-FALAQ', stageId: 2, status: 'Not Started' as const, lastReviewed: 'Not yet reviewed', isStarred: false },
      { id: 18, name: 'SURAH AN-NAS', stageId: 2, status: 'Not Started' as const, lastReviewed: 'Not yet reviewed', isStarred: false },
      { id: 19, name: 'SURAH AL-MASAD', stageId: 2, status: 'Not Started' as const, lastReviewed: 'Not yet reviewed', isStarred: false },
      { id: 20, name: 'SURAH AN-NASR', stageId: 2, status: 'Not Started' as const, lastReviewed: 'Not yet reviewed', isStarred: false },
      { id: 21, name: 'SURAH AL-KAFIRUN', stageId: 2, status: 'Not Started' as const, lastReviewed: 'Not yet reviewed', isStarred: false },
      { id: 22, name: 'SURAH AL-KAWTHAR', stageId: 2, status: 'Not Started' as const, lastReviewed: 'Not yet reviewed', isStarred: false },
      { id: 23, name: 'SURAH AL-MA\'UN', stageId: 2, status: 'Not Started' as const, lastReviewed: 'Not yet reviewed', isStarred: false },
      { id: 24, name: 'SURAH QURAYSH', stageId: 2, status: 'Not Started' as const, lastReviewed: 'Not yet reviewed', isStarred: false },
      { id: 25, name: 'SURAH AL-FIL', stageId: 2, status: 'Not Started' as const, lastReviewed: 'Not yet reviewed', isStarred: false },
      { id: 26, name: 'SURAH AL-HUMAZAH', stageId: 2, status: 'Not Started' as const, lastReviewed: 'Not yet reviewed', isStarred: false },
      { id: 27, name: 'SURAH AL-ASR', stageId: 2, status: 'Not Started' as const, lastReviewed: 'Not yet reviewed', isStarred: false },
      { id: 28, name: 'SURAH AT-TAKATHUR', stageId: 2, status: 'Not Started' as const, lastReviewed: 'Not yet reviewed', isStarred: false }
    ]
  },
  {
    id: 3,
    title: 'Stage 3: Advanced Duas',
    description: 'Prophetic supplications and evening prayers.',
    items: Array.from({ length: 14 }, (_, i) => ({
      id: 29 + i,
      name: `DUA PRACTICE PART ${i + 1}`,
      stageId: 3,
      status: 'Not Started' as const,
      lastReviewed: 'Locked',
      isStarred: false
    }))
  },
  {
    id: 4,
    title: 'Stage 4: Juz 30 Core',
    description: 'First half of Juz Amma.',
    items: Array.from({ length: 12 }, (_, i) => ({
      id: 43 + i,
      name: `SURAH JUZ 30 PART ${i + 1}`,
      stageId: 4,
      status: 'Not Started' as const,
      lastReviewed: 'Locked',
      isStarred: false
    }))
  },
  {
    id: 5,
    title: 'Stage 5: Juz 29 Core',
    description: 'Core surahs of Juz Tabarak.',
    items: Array.from({ length: 12 }, (_, i) => ({
      id: 55 + i,
      name: `SURAH JUZ 29 PART ${i + 1}`,
      stageId: 5,
      status: 'Not Started' as const,
      lastReviewed: 'Locked',
      isStarred: false
    }))
  },
  {
    id: 6,
    title: 'Stage 6: Prophetic Prayers',
    description: 'Advanced daily supplications.',
    items: Array.from({ length: 12 }, (_, i) => ({
      id: 67 + i,
      name: `PROPHETIC DUA PART ${i + 1}`,
      stageId: 6,
      status: 'Not Started' as const,
      lastReviewed: 'Locked',
      isStarred: false
    }))
  }
];

export const DEFAULT_STUDENTS: Student[] = [
  {
    id: 's-1',
    name: 'Zaid M.',
    email: 'zaid@ezbertracker.com',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrtbNkX8v6GNsmqLButCPjZDLbIEEGXxzbi9lPeQE5g4Ijv6ivaGDDjawDmXGrCRJC0a4fhKc4c6licTuSzhrBrhKeiTHyfawPLI84SFSyzdEdl3ZRI-n9ufVW_9-TvwHJxn4Hpz6ILcoNc4-mxeF03AwU6gncYX85ASHnb88q0xzvp0o1oovkG7C3OHoDxFwESQHXdb4b-tLoPmE2MyPqQy9GGaKt1LFteVuVxxk3he8W39Qw1mEudMzZ15H9mZtq4cZnkOiTmQ',
    joinedDate: 'Joined 3 months ago',
    masteredCount: 24,
    totalCount: 78,
    streakDays: 14,
    retentionRate: 95,
    lastUpdate: '2 hours ago',
    currentFocus: 'Stage 2: Core Practices',
    stageProgress: {
      1: { completed: 14, total: 14 },
      2: { completed: 5, total: 14 },
      3: { completed: 0, total: 14 },
      4: { completed: 0, total: 12 },
      5: { completed: 0, total: 12 },
      6: { completed: 0, total: 12 }
    },
    itemsStatus: {
      // Stage 1
      1: 'Memorized', 2: 'Memorized', 3: 'Memorized', 4: 'Memorized', 5: 'Memorized',
      6: 'Memorized', 7: 'Memorized', 8: 'Memorized', 9: 'Memorized', 10: 'Memorized',
      11: 'Memorized', 12: 'Memorized', 13: 'Memorized', 14: 'Memorized',
      // Stage 2
      15: 'Memorized', 16: 'In Progress', 17: 'Not Started', 18: 'Not Started',
      19: 'Not Started', 20: 'Not Started', 21: 'Not Started', 22: 'Not Started',
      23: 'Not Started', 24: 'Not Started', 25: 'Not Started', 26: 'Not Started',
      27: 'Not Started', 28: 'Not Started'
    },
    starredItemIds: [1, 10, 16]
  },
  {
    id: 's-2',
    name: 'Ibrahim S.',
    email: 'ibrahim@ezbertracker.com',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9V2zPilGqoT5eRTkf5qX09nEVLI8I2Wkoxy93JYY_9DXEfSHu9SB4I2e1gjtJkGwQRXqk4lV7-S9mBW6fK49K2wh7dn2bFXo6LuNcZpFBmQZRz7EJVq3wuwozIoJwQ18CH3Db-yCXvqkmStzo1OwzT3LcTWb-m0VviFFFSKTeUfIMt-oiMhHaTj1C4E2jS_w7DLZA0k86ETczyspvyKRHoL41vMLInYTRLJYOe9-7jqzSpqO8xquZ0LFNOCM4DhuflKp_WdCqyw',
    joinedDate: 'Joined 2 weeks ago',
    masteredCount: 52,
    totalCount: 78,
    streakDays: 8,
    retentionRate: 91,
    lastUpdate: '1 day ago',
    currentFocus: 'Stage 4: Juz 30 Core',
    stageProgress: {
      1: { completed: 14, total: 14 },
      2: { completed: 14, total: 14 },
      3: { completed: 14, total: 14 },
      4: { completed: 10, total: 12 },
      5: { completed: 0, total: 12 },
      6: { completed: 0, total: 12 }
    },
    itemsStatus: Object.fromEntries([
      ...Array.from({ length: 42 }, (_, i) => [i + 1, 'Memorized' as const]),
      ...Array.from({ length: 10 }, (_, i) => [43 + i, 'Memorized' as const]),
      [53, 'In Progress' as const],
      [54, 'In Progress' as const]
    ]),
    starredItemIds: [10, 32, 45]
  },
  {
    id: 's-3',
    name: 'Omar Abdullah',
    email: 'omar.abdullah@ezbertracker.com',
    avatarUrl: '',
    joinedDate: 'Joined 2 months ago',
    masteredCount: 45,
    totalCount: 78,
    streakDays: 12,
    retentionRate: 94,
    lastUpdate: '2h ago',
    currentFocus: 'Juz 15 - Al-Kahf',
    stageProgress: {
      1: { completed: 14, total: 14 },
      2: { completed: 14, total: 14 },
      3: { completed: 14, total: 14 },
      4: { completed: 3, total: 12 },
      5: { completed: 0, total: 12 },
      6: { completed: 0, total: 12 }
    },
    itemsStatus: Object.fromEntries([
      ...Array.from({ length: 42 }, (_, i) => [i + 1, 'Memorized' as const]),
      [43, 'Memorized' as const], [44, 'Memorized' as const], [45, 'Memorized' as const],
      [46, 'In Progress' as const], [47, 'In Progress' as const]
    ]),
    starredItemIds: [10, 16, 46, 47]
  },
  {
    id: 's-4',
    name: 'Aisha Rahman',
    email: 'aisha@ezbertracker.com',
    avatarUrl: '',
    joinedDate: 'Joined 1 month ago',
    masteredCount: 32,
    totalCount: 78,
    streakDays: 19,
    retentionRate: 96,
    lastUpdate: '4h ago',
    currentFocus: 'Stage 3: Advanced Duas',
    stageProgress: {
      1: { completed: 14, total: 14 },
      2: { completed: 14, total: 14 },
      3: { completed: 4, total: 14 },
      4: { completed: 0, total: 12 },
      5: { completed: 0, total: 12 },
      6: { completed: 0, total: 12 }
    },
    itemsStatus: Object.fromEntries([
      ...Array.from({ length: 28 }, (_, i) => [i + 1, 'Memorized' as const]),
      [29, 'Memorized' as const], [30, 'Memorized' as const], [31, 'Memorized' as const], [32, 'Memorized' as const],
      [33, 'In Progress' as const], [34, 'In Progress' as const]
    ]),
    starredItemIds: [5, 15, 29]
  },
  {
    id: 's-5',
    name: 'Yusuf A.',
    email: 'yusuf@ezbertracker.com',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPbKjG1snYFRASr7668jua6iTsMChX4pHXy7glKNOOX3lmQHLeGfubWEsZeUHVs2Lo9rpz7vTWGwQ4VMVNy-KMCGpkoTNsFKXnYKvX0FTtuzju8bRTg1cc7asVy13mfXPGmLDUYk9Xsi0YSL9w3p2v8mWZekN_tNdHDw6AsSBE2Ub3nRkqQZbg4pqNz_bvpZrYr-aF2RvS57tyq_4JX2MISIDI9gQ5yKPxnDtbIEGzEzDIgoNNkEcXLgqTlaW8aLZyhDbKwkIsZw',
    joinedDate: 'Joined 4 months ago',
    masteredCount: 68,
    totalCount: 78,
    streakDays: 28,
    retentionRate: 98,
    lastUpdate: '5m ago',
    currentFocus: 'Stage 6: Prophetic Prayers',
    stageProgress: {
      1: { completed: 14, total: 14 },
      2: { completed: 14, total: 14 },
      3: { completed: 14, total: 14 },
      4: { completed: 12, total: 12 },
      5: { completed: 12, total: 12 },
      6: { completed: 2, total: 12 }
    },
    itemsStatus: Object.fromEntries([
      ...Array.from({ length: 66 }, (_, i) => [i + 1, 'Memorized' as const]),
      [67, 'Memorized' as const], [68, 'Memorized' as const],
      [69, 'In Progress' as const], [70, 'In Progress' as const]
    ]),
    starredItemIds: [12, 28, 55]
  },
  {
    id: 's-6',
    name: 'Omar K.',
    email: 'omar.k@ezbertracker.com',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPjQE1gGL7xQnWzJbUEVL9mQEN1sj5ofjbQTDtkDaj3UBApxeq_KiRnliPllg2wadEKTMWj38s16xAE4GpgaAiSECRhOcZPNTzhGw0ofmo_AXI7qWsgROC1TgT2J-flTyO6GKk17GDZDgSFGFdG1uGN9z6t4x1xJR3jQ7Y-d0gKe4urqMBI5blERPYBL9igPjojxSk4C8ydeB5ZyMuqB6KMv8hYrsLD6qhxZlJ0D9jkeHf2b38XQfJx88IfpRDEJ6OUQF6NNQ1-g',
    joinedDate: 'Joined 3 months ago',
    masteredCount: 61,
    totalCount: 78,
    streakDays: 22,
    retentionRate: 97,
    lastUpdate: '30m ago',
    currentFocus: 'Stage 5: Juz 29 Core',
    stageProgress: {
      1: { completed: 14, total: 14 },
      2: { completed: 14, total: 14 },
      3: { completed: 14, total: 14 },
      4: { completed: 12, total: 12 },
      5: { completed: 7, total: 12 },
      6: { completed: 0, total: 12 }
    },
    itemsStatus: Object.fromEntries([
      ...Array.from({ length: 54 }, (_, i) => [i + 1, 'Memorized' as const]),
      ...Array.from({ length: 7 }, (_, i) => [55 + i, 'Memorized' as const]),
      [62, 'In Progress' as const], [63, 'In Progress' as const]
    ]),
    starredItemIds: [14, 40, 58]
  },
  {
    id: 's-7',
    name: 'Abdullah H.',
    email: 'abdullah.h@ezbertracker.com',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5Kipn9i08ozpKvhDRucFh0OxR3Iv6cQzcC0OTO4T13VCdm6m6gRaP5WAOk7n0i1DYA-svVnL_8_CvwnWxnP--BZokpMB-eZEx6XuI99wha_LG6ImSW_hfYzyQLmDaU50uVLtHwaQWXD2nWWdg49AFT1DFxzR5DPr_f5rDMWx3gQOlUwun9vlJDdI4C4wRKoDuhSVKwVvBgq9ve5zIYM3Cut5Az6xorPySk7M6Z0zvGGirVSmUb1xTj2GyU583xh4kAyDuR_2oAA',
    joinedDate: 'Joined 2 months ago',
    masteredCount: 47,
    totalCount: 78,
    streakDays: 10,
    retentionRate: 93,
    lastUpdate: '1h ago',
    currentFocus: 'Stage 4: Juz 30 Core',
    stageProgress: {
      1: { completed: 14, total: 14 },
      2: { completed: 14, total: 14 },
      3: { completed: 14, total: 14 },
      4: { completed: 5, total: 12 },
      5: { completed: 0, total: 12 },
      6: { completed: 0, total: 12 }
    },
    itemsStatus: Object.fromEntries([
      ...Array.from({ length: 42 }, (_, i) => [i + 1, 'Memorized' as const]),
      [43, 'Memorized' as const], [44, 'Memorized' as const], [45, 'Memorized' as const],
      [46, 'Memorized' as const], [47, 'Memorized' as const], [48, 'In Progress' as const]
    ]),
    starredItemIds: [2, 18, 44]
  }
];

export const loadStoredData = () => {
  if (typeof window === 'undefined') return {
    students: DEFAULT_STUDENTS,
    classroom: DEFAULT_CLASSROOM,
    targets: DEFAULT_TARGETS,
    activityLogs: DEFAULT_ACTIVITY_LOGS
  };

  const storedStudents = localStorage.getItem('ezber_students');
  const storedClassroom = localStorage.getItem('ezber_classroom');
  const storedTargets = localStorage.getItem('ezber_targets');
  const storedLogs = localStorage.getItem('ezber_logs');

  const students = storedStudents ? JSON.parse(storedStudents) : DEFAULT_STUDENTS;
  const classroom = storedClassroom ? JSON.parse(storedClassroom) : DEFAULT_CLASSROOM;
  const targets = storedTargets ? JSON.parse(storedTargets) : DEFAULT_TARGETS;
  const activityLogs = storedLogs ? JSON.parse(storedLogs) : DEFAULT_ACTIVITY_LOGS;

  if (!storedStudents) localStorage.setItem('ezber_students', JSON.stringify(students));
  if (!storedClassroom) localStorage.setItem('ezber_classroom', JSON.stringify(classroom));
  if (!storedTargets) localStorage.setItem('ezber_targets', JSON.stringify(targets));
  if (!storedLogs) localStorage.setItem('ezber_logs', JSON.stringify(activityLogs));

  return { students, classroom, targets, activityLogs };
};

export const saveStoredData = (data: {
  students: Student[];
  classroom: Classroom;
  targets: Target[];
  activityLogs: ActivityLog[];
}) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('ezber_students', JSON.stringify(data.students));
  localStorage.setItem('ezber_classroom', JSON.stringify(data.classroom));
  localStorage.setItem('ezber_targets', JSON.stringify(data.targets));
  localStorage.setItem('ezber_logs', JSON.stringify(data.activityLogs));
};
