/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  loadStoredData, 
  saveStoredData, 
  DEFAULT_CLASSROOM, 
  DEFAULT_TARGETS, 
  DEFAULT_ACTIVITY_LOGS, 
  DEFAULT_STUDENTS,
  STAGE_TEMPLATE
} from './data';
import { Student, Classroom, Target, ActivityLog, ItemStatus } from './types';
import LoginScreen from './components/LoginScreen';
import TopNavBar from './components/TopNavBar';
import Sidebar from './components/Sidebar';
import StudentDashboard from './components/StudentDashboard';
import TeacherPortal from './components/TeacherPortal';
import ClassroomView from './components/ClassroomView';
import { 
  Sparkles, 
  Award, 
  BookOpen, 
  ListTodo, 
  Settings as SettingsIcon, 
  HelpCircle, 
  TrendingUp, 
  Grid,
  FileCheck2,
  BookmarkCheck,
  Search,
  Check,
  Calendar,
  Layers,
  HeartHandshake,
  Menu,
  X,
  Building2,
  Users,
  LogOut,
  GraduationCap
} from 'lucide-react';

export default function App() {
  // Session States
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem('ezber_is_logged_in');
    return stored !== null ? stored === 'true' : true;
  });
  const [currentUserRole, setCurrentUserRole] = useState<'Student' | 'Teacher'>(() => {
    if (typeof window === 'undefined') return 'Student';
    const stored = localStorage.getItem('ezber_role');
    return (stored as 'Student' | 'Teacher') || 'Student';
  });
  const [currentProfileId, setCurrentProfileId] = useState<string>(() => {
    if (typeof window === 'undefined') return 's-1';
    const stored = localStorage.getItem('ezber_profile_id');
    return stored || 's-1';
  });

  // Database States
  const [students, setStudents] = useState<Student[]>([]);
  const [classroom, setClassroom] = useState<Classroom>(DEFAULT_CLASSROOM);
  const [targets, setTargets] = useState<Target[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Navigation tab states
  const [activeHeaderNav, setActiveHeaderNav] = useState<string>('Dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search filter for Student Directory tab
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // Teacher progress tracker state (Ustadh Ahmed's personal progress)
  const [teacherItemsStatus, setTeacherItemsStatus] = useState<{ [itemId: number]: ItemStatus }>(() => {
    if (typeof window === 'undefined') return {};
    const stored = localStorage.getItem('ezber_teacher_items_status');
    if (stored) return JSON.parse(stored);
    
    // Seed initial progress for teacher (e.g., Stage 1-3 fully memorized + some Stage 4)
    const initialStatus: { [itemId: number]: ItemStatus } = {};
    for (let i = 1; i <= 78; i++) {
      if (i <= 46) {
        initialStatus[i] = 'Memorized';
      } else if (i <= 50) {
        initialStatus[i] = 'In Progress';
      } else {
        initialStatus[i] = 'Not Started';
      }
    }
    return initialStatus;
  });

  const handleUpdateTeacherStatus = (newItemsStatus: { [itemId: number]: ItemStatus }) => {
    setTeacherItemsStatus(newItemsStatus);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ezber_teacher_items_status', JSON.stringify(newItemsStatus));
    }
  };

  // Initial Load from localStorage
  useEffect(() => {
    const data = loadStoredData();
    setStudents(data.students);
    setClassroom(data.classroom);
    setTargets(data.targets);
    setActivityLogs(data.activityLogs);

    // If first-time visitor, default to logged-in student profile s-1
    if (typeof window !== 'undefined' && localStorage.getItem('ezber_is_logged_in') === null) {
      localStorage.setItem('ezber_is_logged_in', 'true');
      localStorage.setItem('ezber_role', 'Student');
      localStorage.setItem('ezber_profile_id', 's-1');
    }
  }, []);

  // Save changes to localStorage whenever states update
  const syncLocalDatabase = (
    nextStudents: Student[],
    nextClassroom: Classroom,
    nextTargets: Target[],
    nextLogs: ActivityLog[]
  ) => {
    setStudents(nextStudents);
    setClassroom(nextClassroom);
    setTargets(nextTargets);
    setActivityLogs(nextLogs);
    saveStoredData({
      students: nextStudents,
      classroom: nextClassroom,
      targets: nextTargets,
      activityLogs: nextLogs
    });
  };

  const handleUpdateStudent = (id: string, updatedStudent: Student) => {
    const nextList = students.map(s => s.id === id ? updatedStudent : s);
    syncLocalDatabase(nextList, classroom, targets, activityLogs);
  };

  const handleRemoveStudent = (id: string) => {
    const nextList = students.filter(s => s.id !== id);
    syncLocalDatabase(nextList, classroom, targets, activityLogs);
  };

  const handleAddNewStudent = (name: string, email: string): string => {
    const newStudent: Student = {
      id: `s-custom-${Date.now()}`,
      name,
      email,
      joinedDate: 'Joined today',
      masteredCount: 14, // Stage 1 completed default
      totalCount: 78,
      streakDays: 1,
      retentionRate: 90,
      lastUpdate: 'Just now',
      currentFocus: 'Stage 2: Core Practices',
      stageProgress: {
        1: { completed: 14, total: 14 },
        2: { completed: 0, total: 14 },
        3: { completed: 0, total: 14 },
        4: { completed: 0, total: 12 },
        5: { completed: 0, total: 12 },
        6: { completed: 0, total: 12 }
      },
      itemsStatus: Object.fromEntries(
        Array.from({ length: 78 }).map((_, i) => [i + 1, i < 14 ? 'Memorized' as const : 'Not Started' as const])
      ),
      starredItemIds: []
    };

    const nextList = [...students, newStudent];
    syncLocalDatabase(nextList, classroom, targets, activityLogs);
    return newStudent.id;
  };

  const handleAddTarget = (newTarget: Target) => {
    const nextTargets = [newTarget, ...targets];
    syncLocalDatabase(students, classroom, nextTargets, activityLogs);
  };

  const handleDeleteTarget = (targetId: string) => {
    const nextTargets = targets.filter(t => t.id !== targetId);
    syncLocalDatabase(students, classroom, nextTargets, activityLogs);
  };

  const handleLogActivity = (title: string, xp: number, type: 'review' | 'memorization' | 'target_assigned') => {
    const typeMapping: { [key: string]: 'review' | 'memorization' | 'target_assigned' | 'target_completed' } = {
      review: 'review',
      memorization: 'memorization',
      target_assigned: 'target_assigned'
    };

    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      type: typeMapping[type] || 'review',
      title,
      timestamp: 'Just now',
      xp
    };

    const nextLogs = [newLog, ...activityLogs];
    syncLocalDatabase(students, classroom, targets, nextLogs);
  };

  const handleLogin = (role: 'Student' | 'Teacher', profileId?: string) => {
    setCurrentUserRole(role);
    if (profileId) {
      setCurrentProfileId(profileId);
    }
    setIsLoggedIn(true);
    setActiveHeaderNav('Dashboard');

    if (typeof window !== 'undefined') {
      localStorage.setItem('ezber_is_logged_in', 'true');
      localStorage.setItem('ezber_role', role);
      if (profileId) {
        localStorage.setItem('ezber_profile_id', profileId);
      }
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ezber_is_logged_in', 'false');
    }
  };

  // Find reference to current authenticated student user
  const currentStudent = students.find(s => s.id === currentProfileId) || students[0];

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      {!isLoggedIn ? (
        <LoginScreen students={students} onLogin={handleLogin} onSignup={handleAddNewStudent} />
      ) : (
        <div className="flex flex-col min-h-screen">
          {/* Top Universal Navbar banner */}
          <TopNavBar 
            students={students}
            currentProfileId={currentProfileId}
            currentRole={currentUserRole}
            onProfileChange={handleLogin}
            onLogout={handleLogout}
            activeNavTab={activeHeaderNav}
            onNavTabChange={setActiveHeaderNav}
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
          />

          {/* Premium Mobile Navigation Drawer slide-over */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              {/* Overlay background with soft blur */}
              <div 
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200" 
              />
              
              {/* Drawer Container (Sliding in from Left) */}
              <aside className="fixed inset-y-0 left-0 w-72 bg-white flex flex-col p-6 shadow-2xl animate-in slide-in-from-left duration-250">
                {/* Header brand and close button */}
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="font-display text-lg font-bold text-indigo-600 tracking-tight">
                      {currentUserRole === 'Teacher' ? 'Ezber Academy' : 'Ezber Sanctuary'}
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      {currentUserRole === 'Teacher' ? 'Teacher Portal' : 'Student Profile'}
                    </p>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 hover:bg-slate-100/80 rounded-xl text-slate-500 hover:text-indigo-600 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Profile info block */}
                <div className="px-1.5 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl mb-6 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-150 flex items-center justify-center font-bold text-sm">
                    {currentUserRole === 'Teacher' ? 'UA' : (currentStudent?.name ? currentStudent.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0, 2) : 'S')}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-slate-800 truncate">
                      {currentUserRole === 'Teacher' ? 'Ustadh Ahmed' : currentStudent?.name || 'Student User'}
                    </p>
                    <p className="text-[10px] text-indigo-650 font-bold uppercase tracking-wider scale-95 origin-left">
                      {currentUserRole} Account
                    </p>
                  </div>
                </div>

                {/* Navigation options list */}
                <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveHeaderNav('Dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-bold text-xs cursor-pointer ${
                      activeHeaderNav === 'Dashboard' 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                    }`}
                  >
                    <Building2 className="w-4 h-4 shrink-0" />
                    <span>Overview (Dashboard)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveHeaderNav('Classes');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-bold text-xs cursor-pointer ${
                      activeHeaderNav === 'Classes' 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <span>My Classes (Scoreboard)</span>
                  </button>

                  {currentUserRole === 'Teacher' && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveHeaderNav('Students');
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-bold text-xs cursor-pointer ${
                        activeHeaderNav === 'Students' 
                          ? 'bg-indigo-50 text-indigo-600' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                      }`}
                    >
                      <Users className="w-4 h-4 shrink-0" />
                      <span>Student Directory</span>
                    </button>
                  )}

                  {currentUserRole === 'Teacher' && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveHeaderNav('Reports');
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-bold text-xs cursor-pointer ${
                        activeHeaderNav === 'Reports' 
                          ? 'bg-indigo-50 text-indigo-600' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                      }`}
                    >
                      <TrendingUp className="w-4 h-4 shrink-0" />
                      <span>Reports &amp; Insights</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setActiveHeaderNav('Curriculum');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-bold text-xs cursor-pointer ${
                      activeHeaderNav === 'Curriculum' 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                    }`}
                  >
                    <ListTodo className="w-4 h-4 shrink-0" />
                    <span>Curriculum Syllabus</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveHeaderNav('Settings');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-bold text-xs cursor-pointer ${
                      activeHeaderNav === 'Settings' 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                    }`}
                  >
                    <SettingsIcon className="w-4 h-4 shrink-0" />
                    <span>Settings &amp; Preferences</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveHeaderNav('Help');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-bold text-xs cursor-pointer ${
                      activeHeaderNav === 'Help' 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4 shrink-0" />
                    <span>Frequently Asked Questions</span>
                  </button>
                </nav>

                {/* Sign Out Button at bottom */}
                <div className="pt-4 border-t border-slate-100 mt-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-red-650 hover:bg-red-50 hover:text-red-700 font-bold text-xs transition"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Sign Out Account</span>
                  </button>
                </div>
              </aside>
            </div>
          )}

          <div className="flex-1 flex max-w-[1440px] mx-auto w-full pt-16">
            {/* Sidebar Controller (Hidden on mobile/tablet) */}
            <div className="hidden lg:block shrink-0">
              <Sidebar 
                currentTab={activeHeaderNav}
                onTabChange={setActiveHeaderNav}
                role={currentUserRole}
                userName={currentUserRole === 'Teacher' ? 'Ustadh Ahmed' : currentStudent?.name || 'Zaid M.'}
                onLogout={handleLogout}
              />
            </div>

            {/* Main scrollable layout canvas */}
            <main className="flex-1 overflow-y-auto px-4 md:px-16 py-8">
              
              {/* PAGE ROUTER ACTIONS */}

              {/* ROUTE 1: DASHBOARD TAB */}
              {activeHeaderNav === 'Dashboard' && (
                currentUserRole === 'Student' ? (
                  currentStudent ? (
                    <StudentDashboard 
                      currentStudent={currentStudent}
                      onUpdateStudent={handleUpdateStudent}
                      onLogActivity={handleLogActivity}
                    />
                  ) : (
                    <div className="p-12 text-center text-stone-500">Loading student profile...</div>
                  )
                ) : (
                  <TeacherPortal 
                    students={students}
                    onUpdateStudent={handleUpdateStudent}
                    onRemoveStudent={handleRemoveStudent}
                    onAddNewStudent={handleAddNewStudent}
                    onAddTarget={handleAddTarget}
                    onLogActivity={handleLogActivity}
                    teacherItemsStatus={teacherItemsStatus}
                    onUpdateTeacherStatus={handleUpdateTeacherStatus}
                  />
                )
              )}

              {/* ROUTE 2: CLASSES / CLASSROOM SCOREBOARD TAB */}
              {activeHeaderNav === 'Classes' && (
                <ClassroomView 
                  currentStudent={currentStudent || students[0]}
                  students={students}
                  classroom={classroom}
                  targets={targets}
                  activityLogs={activityLogs}
                  onAddTarget={handleAddTarget}
                  onUpdateClassroom={setClassroom}
                  onLogActivity={handleLogActivity}
                  role={currentUserRole}
                  onUpdateStudent={handleUpdateStudent}
                  onDeleteTarget={handleDeleteTarget}
                />
              )}

              {/* ROUTE 3: ENROLLED STUDENTS DIRECTORY */}
              {activeHeaderNav === 'Students' && (
                <div className="space-y-6 max-w-[1200px] mx-auto animate-in fade-in duration-300">
                  <header className="border-b border-[#c0c9bb]/30 pb-4">
                    <h2 className="font-serif text-3xl font-bold text-[#00450d]">Students Directory</h2>
                    <p className="text-xs text-stone-500 mt-1">Syllabus compliance tracking across the academy</p>
                  </header>

                  {/* Search Bar filter */}
                  <div className="bg-white p-4 rounded-2xl border border-stone-200/60 shadow-sm flex items-center gap-3">
                    <Search className="w-5 h-5 text-gray-400 shrink-0" />
                    <input 
                      type="text"
                      placeholder="Search students by name, focus surah or record..."
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                      className="w-full text-sm outline-none bg-transparent"
                    />
                  </div>

                  {/* Directory Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {students
                      .filter(s => s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) || s.currentFocus.toLowerCase().includes(studentSearchQuery.toLowerCase()))
                      .map((student) => {
                        const pct = Math.round((student.masteredCount / student.totalCount) * 100);
                        return (
                          <div key={student.id} className="bg-white border border-[#c0c9bb]/40 p-5 rounded-2xl shadow-sm hover:border-[#1b5e20]/40 transition-all flex flex-col justify-between">
                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                {student.avatarUrl ? (
                                  <img src={student.avatarUrl} alt={student.name} className="w-10 h-10 rounded-full border" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center justify-center border">
                                    {student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <h4 className="font-semibold text-stone-900 text-sm leading-snug">{student.name}</h4>
                                  <p className="text-[10px] text-stone-400 font-bold uppercase">{student.joinedDate}</p>
                                </div>
                              </div>
                              
                              <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                                <span className="text-[10px] uppercase font-bold text-stone-400 block">Syllabus focus</span>
                                <span className="text-xs font-semibold text-[#1b5e20]">{student.currentFocus}</span>
                              </div>
                            </div>

                            <div className="space-y-1.5 mt-5">
                              <div className="flex justify-between text-xs font-bold text-stone-600">
                                <span>Mastery Progress</span>
                                <span className="text-[#1b5e20]">{student.masteredCount} / {student.totalCount} ({pct}%)</span>
                              </div>
                              <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-[#1b5e20] to-[#2a6b2c]" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* ROUTE 4: REPORT STREAKS & METRICS */}
              {activeHeaderNav === 'Reports' && (
                <div className="space-y-6 max-w-[1200px] mx-auto animate-in fade-in duration-300">
                  <header className="border-b border-[#c0c9bb]/30 pb-4">
                    <h2 className="font-serif text-3xl font-bold text-[#00450d]">Academy Reports &amp; Insights</h2>
                    <p className="text-xs text-stone-500 mt-1">Comprehensive intelligence charts on student milestones and streak levels</p>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-white border border-[#c0c9bb]/40 rounded-3xl space-y-3 flex flex-col justify-between">
                      <div className="space-y-1">
                        <Award className="w-8 h-8 text-[#724900] fill-amber-50" />
                        <h4 className="font-serif text-lg font-bold text-stone-900">Highest Streak recorded</h4>
                        <p className="text-xs text-stone-500">Highest daily streaks in active classrooms</p>
                      </div>
                      <p className="font-serif text-2xl font-bold text-[#00450d] mt-4">28 Days - Yusuf A.</p>
                    </div>

                    <div className="p-6 bg-white border border-[#c0c9bb]/40 rounded-3xl space-y-3 flex flex-col justify-between">
                      <div className="space-y-1">
                        <TrendingUp className="w-8 h-8 text-[#1b5e20]" />
                        <h4 className="font-serif text-lg font-bold text-stone-900">Average Compliance Rate</h4>
                        <p className="text-xs text-stone-500">Average retention on stage reviews</p>
                      </div>
                      <p className="font-serif text-2xl font-bold text-[#00450d] mt-4">94.8% Academy compliance</p>
                    </div>

                    <div className="p-6 bg-white border border-[#c0c9bb]/40 rounded-3xl space-y-3 flex flex-col justify-between">
                      <div className="space-y-1">
                        <Grid className="w-8 h-8 text-blue-600" />
                        <h4 className="font-serif text-lg font-bold text-[#00450d]">Total Mastered Sections</h4>
                        <p className="text-xs text-stone-500">Total surah boxes cataloged across database</p>
                      </div>
                      <p className="font-serif text-2xl font-bold text-[#00450d] mt-4">329/546 Verified Masters</p>
                    </div>
                  </div>

                  {/* Symmetrical simple inline SVG progression visual */}
                  <div className="bg-white p-6 rounded-3xl border border-[#c0c9bb]/40 space-y-4">
                    <h3 className="font-serif text-lg font-bold text-stone-800">Memorization Intake Load (Last 7 Sessions)</h3>
                    <div className="h-40 flex items-end justify-between px-4 pt-6 border-b border-stone-200">
                      {[
                        { day: 'Mon', h: '35%' },
                        { day: 'Tue', h: '45%' },
                        { day: 'Wed', h: '70%' },
                        { day: 'Thu', h: '20%' },
                        { day: 'Fri', h: '85%' },
                        { day: 'Sat', h: '95%' },
                        { day: 'Sun', h: '60%' }
                      ].map((bar, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 w-12 group">
                          <div className="w-6 bg-gradient-to-t from-[#1b5e20] to-[#2a6b2c] rounded-t-lg transition-all group-hover:opacity-80" style={{ height: bar.h }}>
                            <div className="absolute -mt-6 bg-stone-900 text-white text-[10px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{bar.h}</div>
                          </div>
                          <span className="text-[10px] font-bold text-stone-400 mt-1 select-none">{bar.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ROUTE 5: SIDEBAR CURRICULUM TAB */}
              {activeHeaderNav === 'Curriculum' && (
                <div className="space-y-6 max-w-[1200px] mx-auto animate-in fade-in duration-300">
                  <header className="border-b border-[#c0c9bb]/30 pb-4">
                    <h2 className="font-serif text-3xl font-bold text-[#00450d]">Curriculum Framework</h2>
                    <p className="text-xs text-stone-500 mt-1">Structural stages defined for student progression levels</p>
                  </header>

                  <div className="space-y-4">
                    {STAGE_TEMPLATE.map((stage) => (
                      <div key={stage.id} className="bg-white border rounded-2xl p-5 shadow-sm hover:border-[#1b5e20]/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase font-bold text-stone-400 bg-stone-100 rounded-full px-2.5 py-1 tracking-wider inline-block">Stage {stage.id}</span>
                          <h4 className="font-serif text-lg font-bold text-[#00450d]">{stage.title}</h4>
                          <p className="text-xs text-stone-500 leading-snug">{stage.description}</p>
                        </div>
                        <div className="shrink-0 flex items-center gap-4 bg-stone-200/30 px-4 py-2 border rounded-xl border-stone-200/50">
                          <span className="text-xs text-stone-600 font-bold tracking-wider uppercase">Syllabus items</span>
                          <span className="text-sm font-bold text-[#00450d] bg-white border px-3 py-1 rounded-lg">{stage.items.length} sections</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}



              {/* ROUTE 7: SETTINGS TAB */}
              {activeHeaderNav === 'Settings' && (
                <div className="space-y-6 max-w-[1200px] mx-auto animate-in fade-in duration-300">
                  <header className="border-b border-[#c0c9bb]/30 pb-4">
                    <h2 className="font-serif text-3xl font-bold text-[#00450d]">Profile Settings</h2>
                    <p className="text-xs text-stone-500 mt-1">Configure account options and notifications pathways</p>
                  </header>

                  <div className="bg-white p-6 rounded-3xl border border-[#c0c9bb]/40 shadow-sm space-y-4">
                    <div className="space-y-1">
                      <h3 className="font-serif text-lg font-bold text-[#1a1c1c]">Academy Notification preferences</h3>
                      <p className="text-xs text-stone-500">Configure how you receive review feedback and target updates.</p>
                    </div>
                    
                    <div className="space-y-3 pt-2">
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input type="checkbox" defaultChecked className="rounded border-stone-300 text-[#1b5e20] focus:ring-[#00450d]" />
                        <span className="text-xs font-semibold text-stone-700">Receive email alerts for newly assigned targets</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input type="checkbox" defaultChecked className="rounded border-stone-300 text-[#1b5e20] focus:ring-[#00450d]" />
                        <span className="text-xs font-semibold text-stone-700">Receive browser alerts for review verification statuses</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input type="checkbox" className="rounded border-stone-300 text-[#1b5e20] focus:ring-[#00450d]" />
                        <span className="text-xs font-semibold text-stone-700">Subscribe to weekly competition scoreboard reports digest</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* ROUTE 8: HELP TAB */}
              {activeHeaderNav === 'Help' && (
                <div className="space-y-6 max-w-[1200px] mx-auto animate-in fade-in duration-300 font-sans">
                  <header className="border-b border-[#c0c9bb]/30 pb-4">
                    <h2 className="font-serif text-3xl font-bold text-[#00450d]">Help &amp; FAQs center</h2>
                    <p className="text-xs text-stone-500 mt-1">Frequently asked questions and guides about using Ezber Tracker</p>
                  </header>

                  <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4 leading-relaxed text-sm text-stone-700">
                    <div className="divide-y divide-stone-100 space-y-4">
                      <div className="pt-2">
                        <h4 className="font-serif font-bold text-[#00450d] mb-1">How do I update my item progress?</h4>
                        <p className="text-xs text-stone-500">
                          Go to your <strong>Dashboard</strong>. Under Stage lists, click your target section's status button. The button will cycle statuses dynamically between <strong>Not Started</strong>, <strong>In Progress</strong> and <strong>Memorized</strong>. This calculates your total mastery metrics immediately!
                        </p>
                      </div>
                      <div className="pt-4">
                        <h4 className="font-serif font-bold text-[#00450d] mb-1">How can I select different student profiles?</h4>
                        <p className="text-xs text-stone-500">
                          Click on your user avatar on the top right-hand side. A dropdown will toggle listing all registered classmate profiles (Zaid, Ibrahim, etc.), as well as the <strong>Teacher Portal</strong>. Selecting a role instantly switches dashboards allowing you to verify all screens mentioned in the guide!
                        </p>
                      </div>
                      <div className="pt-4">
                        <h4 className="font-serif font-bold text-[#00450d] mb-1">What is the 78-grid board in Teacher Portal?</h4>
                        <p className="text-xs text-stone-500">
                          It is an absolute compliance grid representing all 78 curriculum items. Hovering over any cell reveals its section title alongside custom shortcut buttons to toggling completed checklists or assigning active priority deadlines with structured feedback notes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </main>
          </div>
        </div>
      )}
    </div>
  );
}

