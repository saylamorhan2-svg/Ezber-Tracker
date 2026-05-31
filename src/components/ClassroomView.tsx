import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Award, 
  Trash2, 
  CheckCircle2, 
  Star, 
  X,
  AlertCircle,
  Clock,
  Zap,
  Users,
  Copy,
  Plus,
  Sparkles,
  ChevronRight,
  GraduationCap,
  Quote,
  Calendar,
  History,
  TrendingUp,
  User,
  LogOut,
  ChevronDown,
  UserMinus
} from 'lucide-react';
import { Student, Target, ActivityLog, Classroom } from '../types';
import { STAGE_TEMPLATE } from '../data';

interface ClassroomViewProps {
  currentStudent: Student;
  students: Student[];
  classroom: Classroom;
  targets: Target[];
  activityLogs: ActivityLog[];
  onAddTarget: (target: Target) => void;
  onUpdateClassroom: (classroom: Classroom) => void;
  onLogActivity: (title: string, xp: number, type: 'review' | 'memorization' | 'target_assigned') => void;
  role: 'Student' | 'Teacher';
  onUpdateStudent: (id: string, updatedStudent: Student) => void;
  onDeleteTarget: (targetId: string) => void;
}

export default function ClassroomView({
  currentStudent,
  students,
  classroom,
  targets,
  activityLogs,
  onAddTarget,
  onUpdateClassroom,
  onLogActivity,
  role,
  onUpdateStudent,
  onDeleteTarget
}: ClassroomViewProps) {
  // Derived state to check if current student is enrolled in the active classroom
  const enrolledInThisClass = classroom && !classroom.isDeleted && (
    currentStudent.enrolledClassroom === classroom.name ||
    (currentStudent.enrolledClassroom === undefined && classroom.name === 'Morning Hifz Class')
  );

  const isJoined = enrolledInThisClass && classroom && !classroom.isDeleted;

  // Filter students enrolled in the active classroom
  const enrolledStudents = students.filter(student => {
    if (!classroom || classroom.isDeleted) return false;
    return student.enrolledClassroom === classroom.name ||
      (student.enrolledClassroom === undefined && classroom.name === 'Morning Hifz Class');
  });

  const [joinClassName, setJoinClassName] = useState('');
  const [joinPin, setJoinPin] = useState('');
  const [joinError, setJoinError] = useState('');

  // Creation options states for teacher when no class exists
  const [createName, setCreateName] = useState('Morning Hifz Class');
  const [createPin, setCreatePin] = useState('4829');
  const [createInstructor, setCreateInstructor] = useState('Ustadh Ahmed Al-Farsi');

  const [showFullLeaderboard, setShowFullLeaderboard] = useState(false);

  // Teacher specific states for homework and classroom configuration
  const [selectedHomeworkItemId, setSelectedHomeworkItemId] = useState<number>(1);
  const [assignRecipient, setAssignRecipient] = useState<'all' | string>('all'); // student id or 'all'
  const [hwDueDate, setHwDueDate] = useState('2026-06-15');
  const [hwNoDueDate, setHwNoDueDate] = useState(false);
  const [hwInstructions, setHwInstructions] = useState('');
  const [isEditingClass, setIsEditingClass] = useState(false);
  const [editedClassName, setEditedClassName] = useState(classroom?.name || '');
  const [editedClassPin, setEditedClassPin] = useState(classroom?.pin || '');
  const [editedReviewDate, setEditedReviewDate] = useState(classroom?.nextReviewDate || '');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCreateClassroom = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateClassroom({
      name: createName,
      instructor: createInstructor,
      studentCount: 0,
      pin: createPin,
      nextReviewDate: 'Tomorrow',
      quote: {
        text: "The best among you are those who learn the Qur'an and teach it.",
        source: 'Sahih al-Bukhari'
      },
      isDeleted: false
    });
    // Auto-enroll all students under the newly launched classroom to make it immediately populated and active!
    students.forEach(student => {
      onUpdateStudent(student.id, {
        ...student,
        enrolledClassroom: createName
      });
    });
    onLogActivity(`Launched a new learning circle: ${createName}!`, 50, 'review');
  };

  const handleAssignHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHomeworkItemId) return;

    const item = STAGE_TEMPLATE.flatMap(s => s.items).find(i => i.id === selectedHomeworkItemId);
    if (!item) return;

    let targetVerses = '';
    let targetTitle = '';

    if (assignRecipient === 'all') {
      targetVerses = `Class Homework • Item #${selectedHomeworkItemId}`;
      targetTitle = `Assigned ${item.name} to the whole class`;
      
      // Update status to 'In Progress' for that item for all active enrolled students!
      enrolledStudents.forEach(student => {
        const currentStatus = student.itemsStatus[selectedHomeworkItemId] || 'Not Started';
        if (currentStatus === 'Not Started') {
          const updatedStatus = { ...student.itemsStatus, [selectedHomeworkItemId]: 'In Progress' as const };
          onUpdateStudent(student.id, {
            ...student,
            itemsStatus: updatedStatus
          });
        }
      });
    } else {
      const targetStudent = enrolledStudents.find(s => s.id === assignRecipient);
      if (targetStudent) {
        targetVerses = `Homework for ${targetStudent.name} • Item #${selectedHomeworkItemId}`;
        targetTitle = `Assigned ${item.name} to ${targetStudent.name}`;
        
        // Update status to 'In Progress' for that item in selected student's profile
        const updatedStatus = { ...targetStudent.itemsStatus, [selectedHomeworkItemId]: 'In Progress' as const };
        onUpdateStudent(targetStudent.id, {
          ...targetStudent,
          itemsStatus: updatedStatus
        });
      } else {
        targetVerses = `Individual Homework • Item #${selectedHomeworkItemId}`;
        targetTitle = `Assigned ${item.name} individually`;
      }
    }

    const newTarget: Target = {
      id: `t-custom-${Date.now()}`,
      surahName: item.name,
      verses: targetVerses,
      assignedDate: 'Nov 12',
      dueDate: hwNoDueDate ? 'No due date' : `Due on ${hwDueDate}`,
      progress: 0,
      status: 'In Progress'
    };

    onAddTarget(newTarget);
    onLogActivity(targetTitle, 20, 'target_assigned');

    // Show success message
    const friendlyRecipient = assignRecipient === 'all' 
      ? 'the class' 
      : (enrolledStudents.find(s => s.id === assignRecipient)?.name || 'student');
    setSuccessMessage(`Successfully assigned homework (${item.name}) to ${friendlyRecipient}!`);
    
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4500);

    // Reset notes
    setHwInstructions('');
  };

  const handleSaveClassroomEdit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateClassroom({
      ...classroom,
      name: editedClassName,
      pin: editedClassPin,
      nextReviewDate: editedReviewDate
    });
    // Ensure all enrolled students' metadata stays in sync with any rename event!
    students.forEach(student => {
      if (student.enrolledClassroom === classroom.name || student.enrolledClassroom === undefined) {
        onUpdateStudent(student.id, {
          ...student,
          enrolledClassroom: editedClassName
        });
      }
    });

    setIsEditingClass(false);
  };

  // Generate dynamic rankings list based on actual enrolled students
  const activeStudentScores = enrolledStudents.map((s) => ({
    id: s.id,
    name: s.name,
    avatarUrl: s.avatarUrl,
    completed: s.masteredCount,
    total: s.totalCount
  }));

  // Sort by mastered count descending
  const sortedClassmates = [...activeStudentScores].sort((a, b) => b.completed - a.completed);

  // Map ranking index
  const rankedClassmates = sortedClassmates.map((student, idx) => ({
    ...student,
    rank: idx + 1
  }));

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classroom || classroom.isDeleted) {
      setJoinError('Our academy has no active classroom right now. Ask your Ustadh Ahmed to create one!');
      return;
    }

    if (
      joinClassName.trim().toLowerCase() === classroom.name.toLowerCase() && 
      joinPin.trim() === classroom.pin
    ) {
      onUpdateStudent(currentStudent.id, {
        ...currentStudent,
        enrolledClassroom: classroom.name
      });
      setJoinError('');
      onLogActivity(`Successfully joined class: ${classroom.name}!`, 40, 'review');
    } else {
      setJoinError(`Invalid Class Name or 4-digit PIN. (Hint: Class Name: "${classroom.name}", PIN: "${classroom.pin}")`);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in duration-550 pb-16 font-sans">
      
      {/* JOIN CLASSROOM VIEW (EMPTY STATE) OR CREATE CLASSROOM (TEACHER) */}
      {(!classroom || classroom.isDeleted) ? (
        role === 'Teacher' ? (
          /* CREATE CLASSROOM VIEW FOR TEACHER */
          <div className="max-w-md mx-auto py-12 px-4 space-y-6 text-center animate-in zoom-in-95 duration-300 md:mt-12">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-700 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-200 shadow-sm">
              <GraduationCap className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-3xl font-bold text-indigo-650 tracking-tight">Create a New Classroom</h2>
              <p className="text-sm text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
                Set up a learning circle to track memorization syllabus progress and assign custom hifz homework milestones.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-left">
              <form onSubmit={handleCreateClassroom} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Classroom Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Morning Hifz Class"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    className="w-full border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none rounded-xl px-4 py-3 text-sm transition-all font-sans font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">4-Digit Entry PIN</label>
                    <span className="text-[10px] text-slate-400">Suggestion: 4829</span>
                  </div>
                  <input 
                    type="text" 
                    maxLength={4}
                    required
                    placeholder="e.g. 4829"
                    value={createPin}
                    onChange={(e) => setCreatePin(e.target.value)}
                    className="w-full border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none rounded-xl px-4 py-3 text-center font-bold text-sm transition-all font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Instructor Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Ustadh Ahmed Al-Farsi"
                    value={createInstructor}
                    onChange={(e) => setCreateInstructor(e.target.value)}
                    className="w-full border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none rounded-xl px-4 py-3 text-sm transition-all font-sans font-semibold"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full mt-4 bg-indigo-600 text-white py-3.5 rounded-xl font-bold cursor-pointer transition-all hover:bg-indigo-755 hover:scale-[1.01] active:scale-95 shadow-sm"
                >
                  Launch Learning Circle
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* NO ACADEMY CLASSROOM FOR STUDENTS */
          <div className="flex flex-col items-center justify-center min-h-[600px] py-12 px-4 space-y-6 animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-3 max-w-sm">
              <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
                <AlertCircle className="w-10 h-10 animate-bounce" />
              </div>
              <h2 className="font-display text-3xl font-bold text-indigo-600 tracking-tight">No Active Classroom</h2>
              <p className="text-slate-500 text-sm leading-relaxed font-semibold">
                There is currently no active learning circle set up in our academy. 
                Ask your teacher to launch one so you can join and share scores!
              </p>
            </div>
          </div>
        )
      ) : !isJoined && role !== 'Teacher' ? (
        <div className="flex flex-col items-center justify-center min-h-[600px] py-12 px-4 space-y-6 animate-in zoom-in-95 duration-300">
          <div className="text-center space-y-3 max-w-md">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-700 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-200">
              <GraduationCap className="w-10 h-10" />
            </div>
            <h2 className="font-display text-3xl font-bold text-indigo-600 tracking-tight">Join Your Classroom</h2>
            <p className="text-[#41493e]/90 text-sm leading-relaxed font-medium">
              Enter the class name and 4-digit PIN provided by your teacher to start tracking your progress with your peers in real-time.
            </p>
          </div>

          <div className="w-full max-w-sm bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <form onSubmit={handleJoinSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Class Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Morning Hifz Class"
                  value={joinClassName}
                  onChange={(e) => setJoinClassName(e.target.value)}
                  className="w-full border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none rounded-xl px-4 py-3 text-sm transition-all"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">4-Digit PIN</label>
                  <span className="text-[10px] text-slate-400">Default: 4829</span>
                </div>
                <input 
                  type="password" 
                  maxLength={4}
                  required
                  placeholder="••••"
                  value={joinPin}
                  onChange={(e) => setJoinPin(e.target.value)}
                  className="w-full border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none rounded-xl px-4 py-3 text-center tracking-[1em] font-bold text-sm transition-all"
                />
              </div>

              {joinError && (
                <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-600 rounded-xl flex gap-1.5 items-start font-medium leading-relaxed">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-700" />
                  <p>{joinError}</p>
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold cursor-pointer transition-all hover:scale-[1.01] hover:bg-indigo-700 active:scale-95 shadow-sm"
              >
                Join Class
              </button>
            </form>
          </div>
        </div>
      ) : role === 'Teacher' ? (

        /* TEACHER CLASSROOM CONTROL / TARGETS BOARD */
        <div className="space-y-8 animate-in duration-500 delay-75">
          
          {/* Header Panel for Teacher */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="p-1 px-2.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg uppercase tracking-wide select-none border border-indigo-150">
                  Teacher Portal Console
                </span>
                <span className="text-xs text-slate-400 font-semibold">•</span>
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Morning Hifz Class Controls</span>
              </div>
              
              {isEditingClass ? (
                <form onSubmit={handleSaveClassroomEdit} className="flex flex-wrap items-center gap-3 mt-2">
                  <input
                    type="text"
                    value={editedClassName}
                    onChange={(e) => setEditedClassName(e.target.value)}
                    className="px-3 py-1.5 font-display text-xl font-bold text-slate-800 border rounded-xl focus:ring-1 focus:ring-indigo-600 outline-none bg-stone-50"
                    required
                  />
                  <input
                    type="text"
                    value={editedClassPin}
                    onChange={(e) => setEditedClassPin(e.target.value)}
                    placeholder="PIN"
                    maxLength={4}
                    className="px-2 py-1.5 w-20 text-center font-bold text-sm border rounded-xl focus:ring-1 focus:ring-indigo-600 outline-none bg-stone-50"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white rounded-xl px-3 py-1.5 text-xs font-bold cursor-pointer hover:bg-indigo-755 transition-colors shadow-sm"
                  >
                    Save Options
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingClass(false);
                      setEditedClassName(classroom.name);
                      setEditedClassPin(classroom.pin);
                    }}
                    className="bg-slate-100 text-slate-600 rounded-xl px-3 py-1.5 text-xs font-semibold cursor-pointer hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <h1 className="font-display text-3xl font-bold text-indigo-650 tracking-tight">{classroom.name}</h1>
                  <button
                    onClick={() => setIsEditingClass(true)}
                    className="text-indigo-600 hover:text-indigo-850 p-1 px-2.5 hover:bg-indigo-50 border border-transparent hover:border-indigo-150 rounded-xl transition-all text-xs font-bold flex items-center gap-1 cursor-pointer select-none"
                    title="Edit Classroom Info"
                  >
                    <span>Configure Class Details</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`⚠️ WARNING: Are you sure you want to delete the classroom "${classroom.name}"?\nThis will remove ALL homework targets, and kick out all enrolled students (they will need to join a new class). This action is permanent!`)) {
                        onUpdateClassroom({
                          ...classroom,
                          name: '',
                          isDeleted: true
                        });
                        // Unlink all students from this classroom
                        students.forEach(student => {
                          if (student.enrolledClassroom === classroom.name || student.enrolledClassroom === undefined) {
                            onUpdateStudent(student.id, {
                              ...student,
                              enrolledClassroom: ''
                            });
                          }
                        });
                        onLogActivity(`Deleted the classroom: ${classroom.name}`, 30, 'review');
                      }
                    }}
                    className="text-red-550 hover:text-red-700 p-1 px-2.5 hover:bg-red-50 border border-transparent hover:border-red-150 rounded-xl transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer select-none"
                    title="Delete Classroom"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Classroom</span>
                  </button>
                </div>
              )}
              <p className="text-xs text-slate-450 font-semibold mt-1">
                Instructor: <span className="font-bold text-slate-700">{classroom.instructor}</span> • {enrolledStudents.length} Student Seats Enrolled • Class Entry PIN: <span className="font-mono font-bold bg-indigo-50 border border-indigo-150 rounded px-1.5 py-0.5 text-indigo-700">{classroom.pin}</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 select-none">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold text-amber-700 font-sans uppercase">Next Session: Weekly Review</span>
              </div>
            </div>
          </header>

          {/* Teacher Classroom Grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* COLUMN 1: Homework Assignment Form and Active List (7/12 equivalent) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Success Notification Alert */}
              {successMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 shadow-xs">
                  <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none">✓</div>
                  <p className="flex-1 font-sans">{successMessage}</p>
                  <button onClick={() => setSuccessMessage(null)} className="p-1 hover:bg-emerald-100 text-emerald-600 rounded-lg cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Assign Homework Card */}
              <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-725 flex items-center justify-center font-bold text-sm">
                      ＋
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-slate-800 text-base select-none">Assign Classroom Homework Target</h3>
                      <p className="text-[11px] text-slate-450 font-medium">Broadcast curriculum homework milestones with or without due dates</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleAssignHomework} className="space-y-4 pt-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Syllabus Item dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 block">Syllabus Verse Chapters</label>
                      <select
                        value={selectedHomeworkItemId}
                        onChange={(e) => setSelectedHomeworkItemId(Number(e.target.value))}
                        className="w-full border border-slate-200 focus:ring-1 focus:ring-indigo-600 outline-none rounded-xl px-3 py-2.5 text-xs bg-[#fdfdfd] font-sans font-medium hover:border-indigo-200 focus:bg-white transition-all"
                      >
                        {STAGE_TEMPLATE.map(stage => (
                          <optgroup key={stage.id} label={`${stage.title} (Stage ${stage.id})`}>
                            {stage.items.map(item => (
                              <option key={item.id} value={item.id}>
                                Stage {item.stageId} • Item #{item.id}: {item.name}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>

                    {/* Recipient selection */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 block">Assign Target Recipient</label>
                      <select
                        value={assignRecipient}
                        onChange={(e) => setAssignRecipient(e.target.value)}
                        className="w-full border border-slate-200 focus:ring-1 focus:ring-indigo-600 outline-none rounded-xl px-3 py-2.5 text-xs bg-[#fdfdfd] font-sans font-medium hover:border-indigo-200 focus:bg-white transition-all"
                      >
                        <option value="all">Whole Class ({classroom?.name || 'Class'})</option>
                        {enrolledStudents.map(student => (
                          <option key={student.id} value={student.id}>
                            Student: {student.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    {/* Due Date block */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-500 block">Target Due Date</label>
                        <label className="flex items-center gap-1.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={hwNoDueDate}
                            onChange={(e) => setHwNoDueDate(e.target.checked)}
                            className="rounded border-slate-305 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                          />
                          <span className="text-[11px] font-bold text-slate-500">No due date</span>
                        </label>
                      </div>

                      {!hwNoDueDate ? (
                        <input
                          type="date"
                          value={hwDueDate}
                          onChange={(e) => setHwDueDate(e.target.value)}
                          className="w-full border border-slate-200 focus:ring-1 focus:ring-indigo-600 outline-none rounded-xl px-3 py-2 text-xs bg-[#fdfdfd] font-sans font-medium hover:border-indigo-200 focus:bg-white transition-all"
                          required
                        />
                      ) : (
                        <div className="w-full border border-slate-200 bg-slate-100 text-slate-400 select-none rounded-xl px-3 py-2 text-xs font-sans font-semibold">
                          No due date designated for homework
                        </div>
                      )}
                    </div>

                    {/* Special Instructions */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 block">Focus/Tajweed guidelines info</label>
                      <input
                        type="text"
                        placeholder="e.g. pay attention to Qalqalah rules in latter surah lines"
                        value={hwInstructions}
                        onChange={(e) => setHwInstructions(e.target.value)}
                        className="w-full border border-slate-200 focus:ring-1 focus:ring-indigo-600 outline-none rounded-xl px-3 py-2 text-xs bg-[#fdfdfd] font-sans font-medium hover:border-indigo-200 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 bg-indigo-600 hover:bg-indigo-755 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all cursor-pointer shadow-xs active:scale-98"
                  >
                    Assign Homework Target
                  </button>
                </form>
              </div>

              {/* Active Targets Board */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-300" />
                    <h3 className="font-display text-lg font-bold text-slate-800">Class Classroom Homework Targets</h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-450">{targets.length} Targets Assigned</span>
                </div>

                {targets.length === 0 ? (
                  <div className="p-8 text-center bg-white border border-slate-200 rounded-3xl text-slate-450 text-xs">
                    No active targets assigned. Use form above to assign hifz/review homework!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-300">
                    {targets.map((target) => (
                      <div
                        key={target.id}
                        className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden flex flex-col justify-between h-40 transition-all hover:border-indigo-200"
                      >
                        <div className="flex justify-between items-start">
                          <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase truncate max-w-[170px] select-none border border-indigo-100">
                            {target.surahName}
                          </span>
                          
                          <button
                            onClick={() => {
                              onDeleteTarget(target.id);
                              onLogActivity(`Retracted assigned target: ${target.surahName}`, 10, 'review');
                            }}
                            className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-colors cursor-pointer"
                            title="Retract / Delete Homework Target"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="my-2">
                          <h4 className="font-display font-bold text-sm text-slate-800 leading-tight">
                            {target.verses}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 select-none">
                            Assigned: {target.assignedDate} • <span className="text-indigo-650 font-extrabold">{target.dueDate}</span>
                          </p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-semibold text-slate-450 select-none">
                            <span>Average Mastery Progress</span>
                            <span className="font-bold text-indigo-650">{target.progress || 0}% Completed</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border">
                            <div className="h-full bg-indigo-650 rounded-full" style={{ width: `${target.progress || 15}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* COLUMN 2: Students List and Quick Quran Citing (4/12 equivalent) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Leaderboard Card for Teacher */}
              <div className="space-y-3 bg-white p-5 border border-slate-200 rounded-3xl shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600 animate-pulse" />
                    <h3 className="font-display text-sm font-bold text-slate-800">Class Progress Audit</h3>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 rounded-lg font-mono tracking-wider select-none">
                    LIVE
                  </span>
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {enrolledStudents.map((student) => {
                    const pct = Math.round((student.masteredCount / student.totalCount) * 100);
                    return (
                      <div
                        key={student.id}
                        className="flex items-center justify-between gap-2.5 p-2.5 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-800 font-bold text-[10px] flex items-center justify-center border shrink-0">
                            {student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{student.name}</p>
                            <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-semibold mt-0.5">
                              <span>{student.masteredCount} Preserved</span>
                              <span>•</span>
                              <span className="text-emerald-700 font-bold">{student.streakDays}d Streak</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            <p className="text-xs font-display font-extrabold text-indigo-800">{pct}%</p>
                            <p className="text-[8px] font-sans text-slate-400 font-bold leading-none">complete</p>
                          </div>

                          {role === 'Teacher' && (
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to kick ${student.name} from the classroom "${classroom.name}"?`)) {
                                  onUpdateStudent(student.id, {
                                    ...student,
                                    enrolledClassroom: ''
                                  });
                                  onLogActivity(`Kicked student ${student.name} from ${classroom.name}.`, 10, 'review');
                                }
                              }}
                              className="p-1 px-1.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg border border-transparent hover:border-red-100 transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                              title={`Kick ${student.name} out of class`}
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Class Quote Box matching Bukhari citing */}
              <div className="p-6 bg-slate-50 text-slate-700 rounded-3xl border border-slate-200 space-y-3 shadow-xs relative overflow-hidden select-none">
                <Quote className="w-8 h-8 text-indigo-400/10 absolute -right-1 -top-1" />
                <Quote className="w-7 h-7 text-indigo-600/10" />
                <p className="font-sans text-sm italic leading-relaxed text-slate-650 font-medium">
                  "The best among you are those who learn the Qur'an and teach it."
                </p>
                <p className="text-[10px] font-semibold tracking-wider uppercase text-indigo-600 font-sans">
                  — Sahih al-Bukhari
                </p>
              </div>

            </div>

          </div>

        </div>

      ) : (
        
        /* ACTIVE CLASSROOM PROGRESS INTERFACE */
        <div className="space-y-8 animate-in fade-in duration-500">
          
          {/* Header Panel info */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <h1 className="font-display text-3xl font-bold text-indigo-600 tracking-tight">{classroom?.name}</h1>
              <p className="text-xs text-slate-450 font-semibold mt-1">
                Instructor: <span className="font-bold underline text-indigo-600">{classroom?.instructor}</span> • {enrolledStudents.length} Student Seats Enrolled
              </p>
            </div>
            
            <div className="flex items-center flex-wrap gap-2.5">
              <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 select-none">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold text-amber-700 font-sans uppercase">Next Review: {classroom?.nextReviewDate}</span>
              </div>

              {role === 'Student' && (
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to leave "${classroom.name}"? You will no longer receive homework targets or show up on the class leaderboards.`)) {
                      onUpdateStudent(currentStudent.id, {
                        ...currentStudent,
                        enrolledClassroom: ''
                      });
                      onLogActivity(`You left the classroom: ${classroom.name}.`, 15, 'review');
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl transition-all cursor-pointer font-bold text-xs"
                  title="Leave this classroom"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Leave Classroom</span>
                </button>
              )}
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* My Targets Workspace & Achievements (Center/Left 8/12 spacing) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Core Targets List */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-300" />
                  <h3 className="font-display text-xl font-bold text-slate-800 tracking-tight">My Targets Focus</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {targets.map((target, idx) => {
                    // Draw visual highlights corresponding to mock stats
                    const isBaqarah = target.surahName.includes('Baqarah');
                    const colorPercentage = isBaqarah ? 65 : 20;

                    return (
                      <div 
                        key={target.id || idx}
                        className="bg-white p-5 rounded-2xl border-t-4 border-t-indigo-600 border border-slate-200 shadow-xs relative overflow-hidden transition-all duration-200 hover:scale-[1.01] cursor-pointer"
                      >
                        <div className="absolute top-4 right-4 text-amber-400">
                          <Award className="w-6 h-6 shrink-0 fill-amber-50/40" />
                        </div>

                        <div className="space-y-4">
                          <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full uppercase">
                            {target.surahName}
                          </span>
                          
                          <div>
                            <h4 className="font-display text-lg font-bold text-slate-800 leading-tight">
                              {target.verses}
                            </h4>
                            <p className="text-[10px] text-slate-450 uppercase font-bold tracking-wider mt-1 leading-normal">
                              Assigned: {target.assignedDate} • {target.dueDate}
                            </p>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold text-slate-500">
                              <span>Practice Score</span>
                              <span className="font-bold text-indigo-600">{colorPercentage}% completed</span>
                            </div>
                            <div className="h-2 w-full bg-[#eeeeee] rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-650 rounded-full" 
                                initial={{ width: 0 }}
                                animate={{ width: `${colorPercentage}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Activity Log Feed */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-1.5 px-1">
                  <h3 className="font-display text-lg font-bold text-slate-800">Recent Classroom Activity</h3>
                </div>

                <div className="space-y-3.5">
                  {activityLogs.map((log) => (
                    <div 
                      key={log.id}
                      className="flex items-center gap-4 p-3.5 rounded-xl border border-stone-100 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      <div className="w-11 h-11 bg-slate-50 hover:bg-indigo-50/50 rounded-xl flex items-center justify-center shrink-0 border border-slate-150">
                        {log.type === 'review' ? (
                          <CheckCircle2 className="w-5 h-5 text-indigo-650 shrink-0" />
                        ) : (
                          <History className="w-5 h-5 text-amber-500 shrink-0" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-sm leading-tight truncate">{log.title}</p>
                        <p className="text-[10px] text-slate-450 font-bold mt-1 uppercase tracking-wider">{log.timestamp}</p>
                      </div>
                      <span className="text-xs font-bold text-indigo-650 bg-indigo-50 border border-indigo-100/30 px-2.5 py-1 rounded-full font-mono shrink-0">
                        +{log.xp} XP
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Competition Side Panel Classmates Scoreboard (Right 4/12 spacing) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Leaderboard panel card matching mockup */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-display text-lg font-bold text-slate-800 tracking-tight">Classmates Leaderboard</h3>
                </div>

                <div className="bg-slate-50/60 p-5 rounded-3xl border border-slate-200 space-y-3">
                  
                  {/* Leaderboards classmate listings */}
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {rankedClassmates.slice(0, showFullLeaderboard ? rankedClassmates.length : 5).map((mate) => {
                      const isMe = mate.id === currentStudent.id;
                      
                      return (
                        <div 
                          key={mate.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                            isMe 
                              ? 'bg-gradient-to-r from-indigo-500 to-indigo-650 text-white border-indigo-600 shadow-sm' 
                              : 'bg-white hover:border-indigo-200 border-slate-150 text-stone-700'
                          }`}
                        >
                          {/* Rank label indicator */}
                          <span className={`text-[10px] uppercase font-mono font-bold w-5 text-center leading-none ${isMe ? 'text-white/80' : 'text-slate-400'}`}>
                            {mate.rank}
                          </span>

                          {/* Avatar render */}
                          {mate.avatarUrl ? (
                            <img 
                              alt={mate.name} 
                              className={`w-9 h-9 rounded-full object-cover shrink-0 border ${isMe ? 'border-white/20' : 'border-indigo-100/50'}`}
                              src={mate.avatarUrl} 
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 border ${
                              isMe ? 'bg-white/20 border-white/30 text-white' : 'bg-slate-50 border-slate-200 text-slate-500'
                            }`}>
                              {mate.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">
                              {isMe ? `You (${mate.name.split(' ')[0]})` : mate.name}
                            </p>
                            <p className={`text-[9px] font-semibold tracking-wide ${isMe ? 'text-white/70' : 'text-slate-400'}`}>
                              Rank {mate.rank === 1 ? '1st' : mate.rank === 2 ? '2nd' : mate.rank === 3 ? '3rd' : `${mate.rank}th`}
                            </p>
                          </div>

                          <div className="text-right shrink-0 flex items-baseline justify-end gap-0.5">
                            <span className="text-sm font-display font-bold">{mate.completed}</span>
                            <span className={`text-[10px] font-medium font-sans ${isMe ? 'text-white/75' : 'text-slate-400'}`}> / 78</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button 
                    onClick={() => setShowFullLeaderboard(!showFullLeaderboard)}
                    className="w-full py-2.5 text-xs text-indigo-600 hover:bg-indigo-50/50 font-bold transition-all rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{showFullLeaderboard ? 'Hide Leaderboard' : 'View Full Leaderboard'}</span>
                    <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                  </button>
                </div>
              </div>

              {/* Class Quote Box matching Bukhari citing */}
              <div className="p-6 bg-slate-50 text-slate-700 rounded-3xl border border-slate-200 space-y-3 shadow-xs relative overflow-hidden select-none">
                <Quote className="w-8 h-8 text-indigo-400/10 absolute -right-1 -top-1" />
                <Quote className="w-7 h-7 text-indigo-600/10" />
                <p className="font-sans text-sm md:text-base italic leading-relaxed text-slate-650 font-medium">
                  "The best among you are those who learn the Qur'an and teach it."
                </p>
                <p className="text-[10px] font-semibold tracking-wider uppercase text-indigo-600 font-sans">
                  — Sahih al-Bukhari
                </p>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
