import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  UserPlus, 
  ChevronRight, 
  Trash2, 
  Check, 
  Star, 
  X,
  AlertCircle,
  Clock,
  Award,
  Zap,
  Users,
  Copy,
  Plus,
  Sparkles,
  HelpCircle,
  FileCheck2,
  BookmarkCheck,
  BookOpen,
  CheckCircle2
} from 'lucide-react';
import { Student, CourseItem, ItemStatus, Target, Stage } from '../types';
import { STAGE_TEMPLATE } from '../data';

interface TeacherPortalProps {
  students: Student[];
  onUpdateStudent: (id: string, updated: Student) => void;
  onRemoveStudent: (id: string) => void;
  onAddNewStudent: (name: string, email: string) => void;
  onAddTarget: (target: Target) => void;
  onLogActivity: (title: string, xp: number, type: 'review' | 'memorization' | 'target_assigned') => void;
  teacherItemsStatus: { [itemId: number]: ItemStatus };
  onUpdateTeacherStatus: (newStatus: { [itemId: number]: ItemStatus }) => void;
}

export default function TeacherPortal({
  students,
  onUpdateStudent,
  onRemoveStudent,
  onAddNewStudent,
  onAddTarget,
  onLogActivity,
  teacherItemsStatus,
  onUpdateTeacherStatus
}: TeacherPortalProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [pinCopied, setPinCopied] = useState(false);

  // Add Student state
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');

  // Target Modal state
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [targetIdToAssign, setTargetIdToAssign] = useState<number | null>(null);
  const [targetDate, setTargetDate] = useState('2026-06-05');
  const [targetInstructions, setTargetInstructions] = useState('');
  const [noDueDate, setNoDueDate] = useState(false);
  const [viewMode, setViewMode] = useState<'students' | 'personal'>('students');

  // Personal tracker states
  const [openStagesPersonal, setOpenStagesPersonal] = useState<{ [stageId: number]: boolean }>({
    1: true,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false
  });
  const [personalSearchQuery, setPersonalSearchQuery] = useState('');

  // Filter students showing only class-focused entries (Aisha and Omar etc)
  const activeStudent = students.find(s => s.id === selectedStudentId);

  // Copy Classroom PIN
  const handleCopyPin = () => {
    navigator.clipboard.writeText('4829');
    setPinCopied(true);
    setTimeout(() => setPinCopied(false), 2000);
  };

  const handleCreateStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentEmail.trim()) return;

    onAddNewStudent(newStudentName.trim(), newStudentEmail.trim());
    onLogActivity(`Enrolled a new student: ${newStudentName.trim()}`, 30, 'memorization');
    
    setNewStudentName('');
    setNewStudentEmail('');
    setShowAddStudentForm(false);
  };

  // Open Target model
  const handleOpenTargetModal = (itemId: number) => {
    setTargetIdToAssign(itemId);
    setShowTargetModal(true);
  };

  const handleConfirmTarget = () => {
    if (!targetIdToAssign) return;

    // Find item details
    const itemTemplate = STAGE_TEMPLATE.flatMap(s => s.items).find(i => i.id === targetIdToAssign);
    if (!itemTemplate) return;

    // Build target object
    const newTarget: Target = {
      id: `t-custom-${Date.now()}`,
      surahName: itemTemplate.name,
      verses: `Assigned: Item #${targetIdToAssign}`,
      assignedDate: 'Nov 12',
      dueDate: noDueDate ? 'No due date' : `Due on ${targetDate}`,
      progress: 0,
      status: 'In Progress'
    };

    onAddTarget(newTarget);
    
    if (activeStudent) {
      // Toggle progress state in student profile
      const updatedStatus = { ...activeStudent.itemsStatus, [targetIdToAssign]: 'In Progress' as const };
      onUpdateStudent(activeStudent.id, {
        ...activeStudent,
        itemsStatus: updatedStatus
      });
    }

    onLogActivity(`Assigned target ${itemTemplate.name} to ${activeStudent?.name || 'Class'}`, 20, 'target_assigned');
    setShowTargetModal(false);
    setTargetIdToAssign(null);
    setNoDueDate(false);
  };

  const toggleMasteredStatus = (itemId: number) => {
    if (!activeStudent) return;

    const currentStatus = activeStudent.itemsStatus[itemId] || 'Not Started';
    const nextStatusMap: { [key: string]: ItemStatus } = {
      'Not Started': 'In Progress',
      'In Progress': 'Memorized',
      'Memorized': 'Not Started'
    };
    const nextStatus = nextStatusMap[currentStatus];

    const updatedStatus = { ...activeStudent.itemsStatus, [itemId]: nextStatus };
    
    // Recalculate Mastered stats
    const totalMastered = Object.values(updatedStatus).filter(s => s === 'Memorized').length;

    // Recalculate stage logs
    const updatedStageProgress = { ...activeStudent.stageProgress };
    STAGE_TEMPLATE.forEach(stage => {
      const stageItems = stage.items;
      const completed = stageItems.filter(i => updatedStatus[i.id] === 'Memorized').length;
      updatedStageProgress[stage.id] = {
        completed,
        total: stageItems.length
      };
    });

    onUpdateStudent(activeStudent.id, {
      ...activeStudent,
      itemsStatus: updatedStatus,
      masteredCount: totalMastered,
      stageProgress: updatedStageProgress,
      lastUpdate: 'Just now'
    });

    const item = STAGE_TEMPLATE.flatMap(s => s.items).find(i => i.id === itemId);
    if (item) {
      onLogActivity(`Marked ${item.name} as ${nextStatus} for ${activeStudent.name}`, 15, 'review');
    }
  };

  const teacherCompletedCount = Object.values(teacherItemsStatus || {}).filter(s => s === 'Memorized').length;
  const teacherProgressPct = Math.round((teacherCompletedCount / 78) * 100);
  const teacherInProgressCount = Object.values(teacherItemsStatus || {}).filter(s => s === 'In Progress').length;

  const handleCycleTeacherStatus = (itemId: number) => {
    const nextStatusMap: { [key: string]: ItemStatus } = {
      'Not Started': 'In Progress',
      'In Progress': 'Memorized',
      'Memorized': 'Not Started'
    };
    const currentStatus = teacherItemsStatus[itemId] || 'Not Started';
    const newStatus = nextStatusMap[currentStatus];
    const newStatusMap = { ...teacherItemsStatus, [itemId]: newStatus };
    onUpdateTeacherStatus(newStatusMap);

    const item = STAGE_TEMPLATE.flatMap(s => s.items).find(i => i.id === itemId);
    if (item) {
      onLogActivity(`Ustadh Ahmed updated his personal progress on ${item.name} to ${newStatus}`, 15, 'review');
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto animate-in fade-in duration-500 pb-16">
      
      {/* Header Panel */}
      <header className="bg-white border border-slate-200 px-6 py-5 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <h2 className="font-display text-2xl font-bold text-indigo-600 tracking-tight">Morning Hifz Class</h2>
          <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 select-none">
            <span className="text-xs font-bold text-amber-700 tracking-wider font-sans uppercase">PIN: 4829</span>
            <button 
              onClick={handleCopyPin} 
              className="p-0.5 text-amber-600 hover:text-amber-700 rounded-md transition-all cursor-pointer"
              title="Copy PIN URL"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            {pinCopied && (
              <span className="text-[10px] text-indigo-600 font-bold ml-1 animate-ping">Copied!</span>
            )}
          </div>
        </div>

        {/* View Selection Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200">
          <button
            type="button"
            onClick={() => setViewMode('students')}
            className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 select-none cursor-pointer ${
              viewMode === 'students'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Class Directory</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('personal')}
            className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 select-none cursor-pointer ${
              viewMode === 'personal'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>My Progress Tracker</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-slate-500 text-xs font-semibold mr-1">
            Teacher ID: <span className="font-bold underline text-indigo-600">Ustadh Ahmed</span>
          </div>
        </div>
      </header>

      {viewMode === 'students' ? (
        /* Grid Layout Container */
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mt-6">
        
        {/* Left Column: Student List (35% equivalent) */}
        <section className="xl:col-span-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-bold text-indigo-600 tracking-tight">Enrolled Students</h3>
            <button 
              onClick={() => setShowAddStudentForm(!showAddStudentForm)}
              className="flex items-center gap-1.5 font-bold text-xs text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl hover:bg-indigo-100/85 transition-colors cursor-pointer animate-in duration-200"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {/* Add Enrolled Student Inline Panel */}
          {showAddStudentForm && (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl shadow-inner space-y-3 animate-in slide-in-from-top-3 duration-200">
              <h4 className="text-xs font-bold text-slate-600">Enroll new student</h4>
              <form onSubmit={handleCreateStudentSubmit} className="space-y-2">
                <input 
                  type="text" 
                  required
                  placeholder="Abdullah Rahman"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full p-2 bg-white text-xs border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <input 
                  type="email" 
                  required
                  placeholder="name@example.com"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  className="w-full p-2 bg-white text-xs border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <div className="flex justify-end gap-2 pt-1 text-[10px]">
                  <button 
                    type="button" 
                    onClick={() => setShowAddStudentForm(false)}
                    className="px-2.5 py-1 text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-3.5 py-1.5 bg-indigo-600 text-white font-bold rounded-md cursor-pointer hover:bg-indigo-700 transition"
                  >
                    Enroll Student
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Student list card renderer */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {students.map((student) => {
              const studentPercentage = Math.round((student.masteredCount / student.totalCount) * 100);
              const isSelected = selectedStudentId === student.id;

              return (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudentId(student.id)}
                  className={`border p-4 rounded-2xl shadow-xs cursor-pointer transition-all hover:scale-[1.01] flex flex-col relative ${
                    isSelected 
                      ? 'bg-white border-l-4 border-l-indigo-600 border-indigo-600 ring-1 ring-indigo-50 shadow-sm' 
                      : 'bg-white hover:border-indigo-300 border-slate-200/90'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      {student.avatarUrl ? (
                        <img 
                          alt={student.name}
                          className="w-11 h-11 rounded-full object-cover shrink-0 border border-slate-200"
                          src={student.avatarUrl}
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-slate-100 text-[#454747] font-bold text-sm flex items-center justify-center shrink-0 border border-slate-200">
                          {getInitials(student.name)}
                        </div>
                      )}
                      <div className="truncate">
                        <h4 className="font-semibold text-slate-800 text-sm leading-snug">{student.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{student.joinedDate || 'Joined recently'}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>

                  <div className="space-y-1.5 mt-1">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                      <span>Completion Progress</span>
                      <span className="font-bold text-indigo-600">{student.masteredCount} / {student.totalCount} ({studentPercentage}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-650" 
                        initial={{ width: 0 }}
                        animate={{ width: `${studentPercentage}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right Column: Expanded Student Detail Workspace (65% equivalent) */}
        <section className="xl:col-span-8">
          
          {/* Initial State / Empty State box */}
          {!activeStudent ? (
            <div className="h-full min-h-[460px] flex flex-col items-center justify-center bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center select-none">
              <Users className="w-16 h-16 text-indigo-400/20 mb-4 animate-bounce duration-1000" />
              <h3 className="font-display text-xl font-bold text-slate-700 mb-2">Select a student</h3>
              <p className="max-w-xs text-xs text-slate-455 leading-relaxed">
                Choose a student from the left-side class directory to view their detailed memorization history, checked statistics, and assign priorities.
              </p>
            </div>
          ) : (
            
            /* Active Classroom Board */
            <div className="space-y-6">
              
              {/* Student Header */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display text-2xl font-bold text-indigo-600 tracking-tight">{activeStudent.name}</h3>
                      <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full uppercase">
                        {activeStudent.masteredCount >= 50 ? 'Top Performer' : 'Active Student'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Current Focus: <span className="font-bold underline text-indigo-600">{activeStudent.currentFocus}</span></p>
                  </div>
                  
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${activeStudent.name} from Morning Hifz Class tracking?`)) {
                        onRemoveStudent(activeStudent.id);
                        setSelectedStudentId(null);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-xl hover:bg-red-50/70 transition-colors font-bold cursor-pointer font-sans"
                  >
                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Remove Student</span>
                  </button>
                </div>

                {/* Scorecards Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200 flex items-center gap-2.5">
                    <FileCheck2 className="w-5 h-5 text-indigo-650" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Mastered</p>
                      <p className="font-display text-lg font-bold text-indigo-600">{activeStudent.masteredCount} items</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200 flex items-center gap-2.5">
                    <Award className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Retention</p>
                      <p className="font-display text-lg font-bold text-indigo-600">{activeStudent.retentionRate}%</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200 flex items-center gap-2.5">
                    <Clock className="w-5 h-5 text-indigo-500" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Last Update</p>
                      <p className="font-display text-lg font-bold text-indigo-600">{activeStudent.lastUpdate}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200 flex items-center gap-2.5">
                    <Zap className="w-5 h-5 text-amber-500 fill-amber-550/15" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Streak</p>
                      <p className="font-display text-lg font-bold text-indigo-600">{activeStudent.streakDays} days</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 78-Grid Board */}
              <div className="bg-slate-50/55 p-6 rounded-3xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h4 className="text-sm font-display font-bold text-slate-800">Curriculum Board Grid (78 items)</h4>
                  
                  {/* Legend Grid */}
                  <div className="flex gap-4 flex-wrap text-[10px] font-semibold text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                      <span>Memorized</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span>Targeted / Active</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                      <span>Not Started</span>
                    </div>
                  </div>
                </div>

                {/* 78 Board Rendered */}
                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 xl:grid-cols-12 gap-2 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
                  {Array.from({ length: 78 }).map((_, index) => {
                    const itemId = index + 1;
                    const status = activeStudent.itemsStatus[itemId] || 'Not Started';
                    const label = STAGE_TEMPLATE.flatMap(s => s.items).find(i => i.id === itemId)?.name || `Item ${itemId}`;

                    let statusClass = 'bg-slate-50 text-slate-400 border-slate-150';
                    let icon = <div className="w-2 h-2 rounded-full bg-slate-200 shrink-0" />;

                    if (status === 'Memorized') {
                      statusClass = 'bg-indigo-50 text-indigo-800 border-indigo-200 font-bold';
                      icon = <Check className="w-4 h-4 text-indigo-600" />;
                    } else if (status === 'In Progress') {
                      statusClass = 'bg-amber-50 text-amber-800 border-amber-300 font-bold';
                      icon = <Star className="w-4 h-4 text-amber-500 fill-amber-500/10 shrink-0 animate-pulse" />;
                    }

                    return (
                      <div
                        key={itemId}
                        className={`relative group h-14 rounded-xl border flex flex-col items-center justify-center p-2 text-center transition-all hover:scale-105 select-none cursor-pointer ${statusClass}`}
                        title={label}
                      >
                        <span className="text-[9px] font-bold text-slate-400 leading-none">{itemId}</span>
                        <div className="mt-1 leading-none">{icon}</div>

                        {/* Hover Overlay triggers with quick controls */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-slate-50/95 rounded-xl flex items-center justify-center gap-1.5 transition-opacity z-10 border border-slate-300 shadow">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenTargetModal(itemId);
                            }}
                            className="p-1 hover:bg-amber-50 rounded-lg text-amber-700 hover:text-amber-800 cursor-pointer"
                            title="Assign priority target"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMasteredStatus(itemId);
                            }}
                            className="p-1 hover:bg-indigo-50 rounded-lg text-indigo-700 hover:text-indigo-800 cursor-pointer"
                            title="Toggle Completed"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
      ) : (
        /* Personal Tracker Layout */
        <div className="mt-6 space-y-6 max-w-[1240px] mx-auto animate-in fade-in duration-300">
          
          {/* Tracker Header Info Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
            <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 flex items-center justify-center font-display text-2xl font-bold">
                  UA
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-2xl font-bold">Ustadh Ahmed Al-Farsi</h3>
                    <span className="bg-indigo-500/30 hover:bg-indigo-500/40 text-indigo-200 text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full uppercase select-none border border-indigo-400/30">
                      Instructor
                    </span>
                  </div>
                  <p className="text-xs text-indigo-200/80 mt-1">Lead Hifz Teacher • Setting an exemplary course of preservation & hifz standards</p>
                </div>
              </div>

              {/* Quick actions or info */}
              <div className="text-right">
                <p className="text-xs text-indigo-200/60 uppercase font-bold tracking-wider">Overall Syllabus Mastery</p>
                <div className="flex items-baseline justify-end gap-1.5 mt-1">
                  <span className="text-3xl font-display font-bold text-white">{teacherCompletedCount}</span>
                  <span className="text-xs text-indigo-200/80">/ 78 Sections Completed</span>
                </div>
              </div>
            </div>

            {/* Overall progress bar with motion */}
            <div className="space-y-2 mt-6 relative z-10">
              <div className="flex justify-between text-xs font-semibold text-indigo-150">
                <span>Continuity Progression</span>
                <span className="font-bold text-white">{teacherProgressPct}% Mastered</span>
              </div>
              <div className="h-3 w-full bg-indigo-950/80 rounded-full overflow-hidden border border-indigo-800/30">
                <motion.div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-indigo-400 rounded-full" 
                  initial={{ width: 0 }}
                  animate={{ width: `${teacherProgressPct}%` }}
                  transition={{ duration: 1.0, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>

          {/* Teacher Status Board Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-750 flex items-center justify-center font-bold">
                {teacherCompletedCount}
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 font-sans leading-none">Preserved</p>
                <p className="font-display text-sm font-bold text-slate-800 mt-1">Memorized sections</p>
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                {teacherInProgressCount}
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 font-sans leading-none">In Practice</p>
                <p className="font-display text-sm font-bold text-slate-800 mt-1">Active sections</p>
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-755 flex items-center justify-center font-bold">
                45d
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 font-sans leading-none">Instructor Habit</p>
                <p className="font-display text-sm font-bold text-slate-800 mt-1">Exemplary Streak</p>
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-semibold">
                99%
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 font-sans leading-none">Ustadh Audit</p>
                <p className="font-display text-sm font-bold text-slate-800 mt-1">Retention compliance</p>
              </div>
            </div>
          </div>

          {/* Interactive Teacher Curriculum Stages */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h4 className="font-display text-lg font-bold text-slate-800">Your Preservation Curriculum</h4>
                <p className="text-xs text-slate-400 mt-0.5">Click any syllabus item in the stages below to toggle its memorization status.</p>
              </div>

              {/* Personal Search Bar */}
              <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-2 w-full sm:max-w-xs shadow-xs">
                <Plus className="w-4 h-4 text-slate-400 rotate-45 shrink-0" />
                <input 
                  type="text"
                  placeholder="Search my surahs..."
                  value={personalSearchQuery}
                  onChange={(e) => setPersonalSearchQuery(e.target.value)}
                  className="w-full text-xs outline-none bg-transparent text-slate-700"
                />
                {personalSearchQuery && (
                  <button onClick={() => setPersonalSearchQuery('')} className="p-0.5 text-slate-400 hover:text-slate-600">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Stages Grid/Accordion */}
            <div className="space-y-4">
              {STAGE_TEMPLATE.map((stage) => {
                // Calculate teacher's progress in this particular stage
                const stageItems = stage.items;
                const completedInStage = stageItems.filter(i => teacherItemsStatus[i.id] === 'Memorized').length;
                const totalInStage = stageItems.length;
                const stageProgressPct = Math.round((completedInStage / totalInStage) * 100);
                const isOpen = openStagesPersonal[stage.id];
                const isCompleted = completedInStage === totalInStage;

                // Apply search filter if active
                const filteredItems = stageItems.filter(item => 
                  item.name.toLowerCase().includes(personalSearchQuery.toLowerCase())
                );

                if (personalSearchQuery && filteredItems.length === 0) {
                  return null;
                }

                return (
                  <div 
                    key={stage.id}
                    className={`bg-white rounded-2xl shadow-xs border transition-all duration-300 overflow-hidden ${
                      isOpen 
                        ? 'border-indigo-200 ring-1 ring-indigo-50' 
                        : 'border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {/* Stage Header Accordion control */}
                    <button
                      type="button"
                      onClick={() => setOpenStagesPersonal(prev => ({ ...prev, [stage.id]: !prev[stage.id] }))}
                      className="w-full text-left p-5 flex items-center justify-between font-sans cursor-pointer focus:outline-none select-none"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isCompleted 
                            ? 'bg-indigo-50 text-indigo-755 border border-indigo-150' 
                            : 'bg-amber-50 text-amber-700 border border-amber-150'
                        }`}>
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-display font-bold text-slate-800 text-sm md:text-base">{stage.title}</h3>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-slate-100 rounded-md text-slate-500">Stage {stage.id}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 font-medium leading-snug">{stage.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 ml-4">
                        <div className="text-right hidden sm:block">
                          <span className="text-xs font-bold text-slate-700 font-sans">{completedInStage} / {totalInStage} sections</span>
                          <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden mt-1">
                            <motion.div 
                              className="h-full bg-indigo-600 rounded-full" 
                              initial={{ width: 0 }}
                              animate={{ width: `${stageProgressPct}%` }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                            />
                          </div>
                        </div>

                        <div className="p-1 hover:bg-slate-50 rounded-lg text-slate-450 transition-colors">
                          <ChevronRight className={`w-5 h-5 transform transition-transform duration-250 ${isOpen ? 'rotate-90' : ''}`} />
                        </div>
                      </div>
                    </button>

                    {/* Stage Items Grid */}
                    {isOpen && (
                      <div className="px-6 pb-6 pt-2 border-t border-slate-50 bg-slate-50/20 animate-in fade-in duration-350">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {filteredItems.map((item) => {
                            const status = teacherItemsStatus[item.id] || 'Not Started';
                            const isStarred = item.isStarred;

                            let statusStyles = {
                              container: 'border-slate-200 bg-white hover:border-slate-350',
                              pill: 'bg-slate-100 text-slate-500'
                            };

                            if (status === 'Memorized') {
                              statusStyles = {
                                container: 'border-indigo-200 bg-indigo-50/30 hover:border-indigo-400 shadow-sm shadow-indigo-100/50',
                                pill: 'bg-indigo-600 text-white font-bold'
                              };
                            } else if (status === 'In Progress') {
                              statusStyles = {
                                container: 'border-amber-300 bg-amber-50/20 hover:border-amber-500',
                                pill: 'bg-amber-500 text-white font-bold'
                              };
                            }

                            return (
                              <div
                                key={item.id}
                                onClick={() => handleCycleTeacherStatus(item.id)}
                                className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between h-28 hover:translate-y-[-2px] ${statusStyles.container}`}
                              >
                                <div className="flex justify-between items-start gap-1.5">
                                  <span className="text-[10px] font-bold text-slate-400 tracking-wider">Item #{item.id}</span>
                                  {isStarred && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500/15" />}
                                </div>

                                <div className="mt-1 flex-1">
                                  <h5 className="font-semibold text-slate-800 text-xs tracking-tight line-clamp-1">{item.name}</h5>
                                  <p className="text-[10px] text-slate-300 mt-0.5 leading-none font-medium">Click to cycle status</p>
                                </div>

                                <div className="mt-2 flex items-center justify-between">
                                  <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${statusStyles.pill}`}>
                                    {status === 'Memorized' ? 'Memorized' : status}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Target Assign Modal Popups */}
      {showTargetModal && targetIdToAssign && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div onClick={() => setShowTargetModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" />
          
          <div className="bg-white border border-slate-200 p-6 rounded-3xl max-w-md w-full relative z-10 animate-in zoom-in-95 duration-150 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-display text-xl font-bold text-indigo-650 tracking-tight">Set Priority Target</h3>
              <button 
                onClick={() => setShowTargetModal(false)} 
                className="p-1.5 hover:bg-stone-50 rounded-full text-stone-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-450 mb-4">
              Assigning <span className="font-bold underline text-indigo-600">
                {STAGE_TEMPLATE.flatMap(s => s.items).find(i => i.id === targetIdToAssign)?.name || `Item #${targetIdToAssign}`}
              </span> as an active focus target.
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-400">Target Due Date</label>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={noDueDate}
                      onChange={(e) => setNoDueDate(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                    />
                    <span className="text-[11px] font-semibold text-slate-500">No due date</span>
                  </label>
                </div>
                {!noDueDate && (
                  <input 
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-250 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 bg-stone-50 font-sans"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Special instructions / Tajweed focus</label>
                <textarea 
                  rows={3}
                  value={targetInstructions}
                  onChange={(e) => setTargetInstructions(e.target.value)}
                  placeholder="e.g. Focus on tajweed rule of Idghaam in latter verses..."
                  className="w-full px-3 py-2 text-xs border border-slate-250 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 bg-stone-50 font-sans"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowTargetModal(false)}
                className="px-4 py-1.5 text-xs text-slate-550 hover:bg-neutral-50 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTarget}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-indigo-750 cursor-pointer transition-colors"
              >
                Assign Target
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
