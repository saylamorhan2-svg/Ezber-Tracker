import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Sparkles, 
  Stars, 
  ChevronDown, 
  ChevronUp, 
  Lock, 
  BookOpen, 
  FileText, 
  Plus,
  Compass,
  AlertCircle,
  X,
  Target
} from 'lucide-react';
import { Student, Stage, CourseItem, ItemStatus } from '../types';
import { STAGE_TEMPLATE } from '../data';

interface StudentDashboardProps {
  currentStudent: Student;
  onUpdateStudent: (id: string, updated: Student) => void;
  onLogActivity: (title: string, xp: number, type: 'review' | 'memorization') => void;
}

export default function StudentDashboard({
  currentStudent,
  onUpdateStudent,
  onLogActivity
}: StudentDashboardProps) {
  const [openStages, setOpenStages] = useState<{ [key: number]: boolean }>({
    1: true,
    2: true, // both Stage 1 and 2 are open in the mockup
    3: false
  });

  const [showNewEntryModal, setShowNewEntryModal] = useState(false);
  const [newEntryName, setNewEntryName] = useState('');
  const [newEntryStage, setNewEntryStage] = useState(2);
  const [newEntryStatus, setNewEntryStatus] = useState<ItemStatus>('In Progress');

  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  // Toggle stage expansions
  const toggleStage = (stageId: number) => {
    setOpenStages(prev => ({
      ...prev,
      [stageId]: !prev[stageId]
    }));
  };

  // Status mapping colors & classes
  const getStatusConfig = (status: ItemStatus) => {
    switch (status) {
      case 'Memorized':
        return {
          text: 'Memorized',
          class: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
          badgeClass: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
          circleIcon: <CheckCircle2 className="w-5 h-5 text-indigo-600 fill-indigo-100/20 shrink-0" />
        };
      case 'In Progress':
        return {
          text: 'In Progress',
          class: 'bg-amber-50 text-[#724900] border-[#ffb957]/40 hover:bg-amber-100/70',
          badgeClass: 'bg-amber-100 text-amber-800 border border-amber-200',
          circleIcon: <span className="w-5 h-5 rounded-full border-2 border-amber-500 flex items-center justify-center text-amber-500 shrink-0 font-bold text-[8px]">●</span>
        };
      default:
        return {
          text: 'Not Started',
          class: 'bg-neutral-100 text-stone-500 border-stone-200/50 hover:bg-stone-200/50',
          badgeClass: 'bg-stone-100 text-stone-500 border border-stone-200',
          circleIcon: <div className="w-5 h-5 rounded-full border-2 border-stone-300 shrink-0" />
        };
    }
  };

  // Cycle states on button click (Not Started -> In Progress -> Memorized -> Not Started)
  const handleCycleStatus = (item: CourseItem) => {
    const nextStatusMap: { [key: string]: ItemStatus } = {
      'Not Started': 'In Progress',
      'In Progress': 'Memorized',
      'Memorized': 'Not Started'
    };

    const newStatus = nextStatusMap[item.status];
    updateItemStatus(item.id, item.stageId, newStatus);
  };

  const updateItemStatus = (itemId: number, stageId: number, status: ItemStatus) => {
    const updatedStatus = { ...currentStudent.itemsStatus, [itemId]: status };
    
    // Recalculate stage progress counts
    const templateStages = STAGE_TEMPLATE;
    const stageProgress = { ...currentStudent.stageProgress };
    
    // Get all items in this stage
    const stageTemplate = templateStages.find(s => s.id === stageId);
    if (stageTemplate) {
      const itemsInStage = stageTemplate.items;
      const completedInStage = itemsInStage.filter(i => {
        // If it's the one we just changed, use the new status; otherwise look in existing list
        const st = i.id === itemId ? status : (updatedStatus[i.id] || 'Not Started');
        return st === 'Memorized';
      }).length;
      
      stageProgress[stageId] = {
        completed: completedInStage,
        total: itemsInStage.length
      };
    }

    // Recalculate overall mastered count
    const totalMastered = Object.values(updatedStatus).filter(s => s === 'Memorized').length;

    // Log the event
    const itemTemplate = STAGE_TEMPLATE.flatMap(s => s.items).find(i => i.id === itemId);
    if (itemTemplate) {
      if (status === 'Memorized') {
        onLogActivity(`Completed memorization of ${itemTemplate.name}!`, 25, 'memorization');
      } else {
        onLogActivity(`Updated status of ${itemTemplate.name} to ${status}`, 10, 'review');
      }
    }

    onUpdateStudent(currentStudent.id, {
      ...currentStudent,
      itemsStatus: updatedStatus,
      stageProgress,
      masteredCount: totalMastered,
      lastUpdate: 'Just now'
    });
  };

  const handleAddNewEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntryName.trim()) return;

    // We can map this new custom item to Stage 2 (or chosen stage)
    // For local database simplicity, let's find the matching mock templates
    const flattenedTemplate = STAGE_TEMPLATE.flatMap(s => s.items);
    const matchedKeyword = flattenedTemplate.find(i => i.name.toLowerCase() === newEntryName.trim().toLowerCase());
    
    if (matchedKeyword) {
      updateItemStatus(matchedKeyword.id, matchedKeyword.stageId, newEntryStatus);
    } else {
      // It's a completely custom item! Or let's trigger a notice.
      // We can fake matching it to one of the "Not Started" items in Stage 2 to make it visual
      const stageItems = STAGE_TEMPLATE.find(s => s.id === newEntryStage)?.items || [];
      const idleItem = stageItems.find(i => currentStudent.itemsStatus[i.id] === 'Not Started');
      if (idleItem) {
        updateItemStatus(idleItem.id, newEntryStage, newEntryStatus);
        onLogActivity(`Started custom memorization: ${newEntryName.trim().toUpperCase()}`, 15, 'memorization');
      } else {
        alert("The designated stage limit is full. Please reset or cycle statuses.");
      }
    }

    setNewEntryName('');
    setShowNewEntryModal(false);
  };

  // Build the list of stages loaded with active student stats
  const activeStagesList: Stage[] = STAGE_TEMPLATE.map(stage => {
    const progress = currentStudent.stageProgress[stage.id] || { completed: 0, total: stage.items.length };
    
    const itemsWithStatus: CourseItem[] = stage.items.map(item => ({
      ...item,
      status: currentStudent.itemsStatus[item.id] || 'Not Started'
    }));

    let statusValue: 'Completed' | 'In Progress' | 'Locked' = 'In Progress';
    if (progress.completed === progress.total && progress.total > 0) {
      statusValue = 'Completed';
    }

    return {
      id: stage.id,
      title: stage.title,
      description: stage.description,
      totalItems: progress.total,
      completedItems: progress.completed,
      status: statusValue,
      items: itemsWithStatus
    };
  });

  const percentage = Math.round((currentStudent.masteredCount / currentStudent.totalCount) * 100) || 0;

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto animate-in fade-in duration-500 pb-16">
      
      {/* Welcome Banner */}
      <section className="relative overflow-hidden bg-slate-50/50 rounded-3xl p-6 md:p-12 border border-slate-200 shadow-sm">
        {/* Subtle patterned overlay matching design concept */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: 'radial-gradient(#4f46e5 0.5px, transparent 0.5px)',
          backgroundSize: '24px 24px'
        }} />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="font-display text-3xl md:text-4xl text-indigo-600 mb-1 font-bold tracking-tight">
              Assalamu Alaikum, {currentStudent.name.split(' ')[0]}
            </h2>
            <p className="text-slate-650 font-sans text-sm md:text-base leading-relaxed max-w-sm mt-2 font-medium opacity-90">
              Keep up the discipline. You're closer to your goal today than you were yesterday.
            </p>
          </div>

          {/* Mastered Progress Widget */}
          <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-end mb-3">
              <div>
                <div className="flex items-baseline gap-0.5 inline-flex">
                  <span className="font-display text-3xl font-bold text-indigo-600">{currentStudent.masteredCount}</span>
                  <span className="text-lg text-slate-400 font-sans px-1">/</span>
                  <span className="font-display text-2xl font-bold text-indigo-505 text-indigo-500">{currentStudent.totalCount}</span>
                </div>
                <span className="text-xs text-slate-500 ml-2 font-semibold uppercase tracking-wider">Items Mastered</span>
              </div>
              <span className="font-display text-2.5xl font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-100">{percentage}%</span>
            </div>

            {/* Custom Dual-Track Progress bar with gradient theme */}
            <div className="h-4 w-full bg-[#eeeeee] rounded-full overflow-hidden relative shadow-inner">
              <motion.div 
                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full" 
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />
            </div>

            <div className="mt-3.5 flex items-center gap-1.5 text-amber-600">
              <Stars className="w-4 h-4 text-amber-500 fill-amber-300" />
              <span className="text-[10px] font-bold uppercase tracking-widest font-sans">
                Next Milestone: {currentStudent.masteredCount >= 30 ? '60 items' : '30 items'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Stage Summary Card Grid */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {activeStagesList.map((stage) => {
          const isCompleted = stage.completedItems === stage.totalItems;
          const isInProgress = stage.completedItems > 0 && !isCompleted;
          
          return (
            <div 
              key={stage.id}
              onClick={() => {
                // Ensure stage is open
                setOpenStages(prev => ({
                  ...prev,
                  [stage.id]: true
                }));
                // Smooth scroll to the corresponding stage element
                setTimeout(() => {
                  const element = document.getElementById(`stage-panel-${stage.id}`);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }, 100);
              }}
              className={`p-4 bg-white rounded-2xl border-t-2 shadow-xs transition-all duration-200 group relative cursor-pointer ${
                isCompleted 
                  ? 'border-indigo-600 hover:translate-y-[-2px] hover:shadow-xs' 
                  : isInProgress 
                    ? 'border-amber-500 hover:translate-y-[-2px] hover:shadow-xs' 
                    : 'border-slate-200 hover:translate-y-[-2px] hover:shadow-xs'
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Stage {stage.id}</span>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-800 font-sans text-sm">{stage.completedItems} / {stage.totalItems}</span>
                {isCompleted ? (
                   <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                ) : (
                  <span className="text-xs text-amber-600 font-bold">
                    {Math.round((stage.completedItems / stage.totalItems) * 100)}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* Main Content Area: Stages Accordion Panels */}
      <section className="space-y-4">
        {activeStagesList.map((stage) => {
          const isOpen = openStages[stage.id];
          const isCompleted = stage.completedItems === stage.totalItems;
          const isLocked = false;

          return (
            <div 
              key={stage.id}
              id={`stage-panel-${stage.id}`}
              className={`bg-white rounded-2xl shadow-xs border transition-all duration-300 overflow-hidden ${
                isLocked 
                  ? 'border-slate-200 opacity-70 bg-slate-50' 
                  : isOpen 
                    ? 'border-indigo-200 ring-1 ring-indigo-50' 
                    : 'border-slate-200 hover:border-indigo-300'
              }`}
            >
              {/* Accordion Control Header */}
              <button
                type="button"
                disabled={isLocked && stage.id > 3}
                onClick={() => toggleStage(stage.id)}
                className="w-full text-left p-5 flex items-center justify-between font-sans cursor-pointer focus:outline-none select-none"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isLocked 
                      ? 'bg-slate-100 text-slate-400' 
                      : isCompleted 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'bg-amber-50 text-amber-700'
                  }`}>
                    {isLocked ? (
                      <Lock className="w-5 h-5" />
                    ) : (
                      <BookOpen className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className={`font-display text-lg font-bold ${isLocked ? 'text-slate-400' : 'text-slate-800'}`}>
                      {stage.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">
                      {isLocked ? `Locked until Stage ${stage.id - 1} completion` : `${stage.completedItems} items completed`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {!isLocked && (
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                      isCompleted 
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-150' 
                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      {isCompleted ? 'COMPLETED' : 'IN PROGRESS'}
                    </span>
                  )}
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-stone-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-stone-500 shrink-0" />
                  )}
                </div>
              </button>

              {/* Accordion Content Panel */}
              {isOpen && !isLocked && (
                <div className="border-t border-stone-100 p-5 bg-white space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {stage.items.map((item) => {
                      const config = getStatusConfig(item.status);
                      const isHovered = hoveredItem === item.id;

                      return (
                        <div
                          key={item.id}
                          onMouseEnter={() => setHoveredItem(item.id)}
                          onMouseLeave={() => setHoveredItem(null)}
                          className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 ${
                            item.status === 'Memorized' 
                              ? 'bg-indigo-50/10 border-indigo-100/50 hover:bg-indigo-50/25' 
                              : 'bg-white border-slate-250 hover:border-indigo-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {config.circleIcon}
                            <div className="truncate">
                              <h4 className="font-semibold text-slate-800 text-sm tracking-wide">
                                {item.name}
                              </h4>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Last Reviewed: {item.lastReviewed || 'Never'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 select-none">
                            {item.isStarred && (
                              <Stars className="w-4 h-4 text-amber-500 fill-amber-300 shrink-0" />
                            )}
                            <button
                              type="button"
                              onClick={() => handleCycleStatus(item)}
                              className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all duration-200 cursor-pointer ${config.class}`}
                            >
                              {config.text}
                            </button>
                            <span className="p-1 hover:bg-slate-50 text-slate-400 rounded-lg cursor-pointer">
                              <FileText className="w-4 h-4 shrink-0" />
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
      </section>

      {/* Floating Action Button (FAB) */}
      <button 
        onClick={() => setShowNewEntryModal(true)}
        className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-2xl shadow-lg hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer group z-40"
      >
        <Plus className="w-5 h-5 shrink-0" />
        <span className="font-semibold text-sm tracking-wide">New Entry</span>
      </button>

      {/* Add New Entry Modal Popup */}
      {showNewEntryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <div onClick={() => setShowNewEntryModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" />

          {/* Modal Card */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xl max-w-md w-full relative z-10 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-display text-xl font-bold text-indigo-650 flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-500" />
                <span>Log New Practice Session</span>
              </h3>
              <button 
                onClick={() => setShowNewEntryModal(false)} 
                className="p-1.5 hover:bg-stone-100 rounded-full text-stone-400 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewEntry} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Item Title / Surah Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. SURAH AN-NAS"
                  value={newEntryName}
                  onChange={(e) => setNewEntryName(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <span className="text-[10px] text-gray-400 block mt-1 leading-normal">
                  💡 Type existing names like "SURAH AN-NAS", "SURAH AL-ASR" to sync their templates immediately!
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Stage Category</label>
                  <select 
                    value={newEntryStage}
                    onChange={(e) => setNewEntryStage(Number(e.target.value))}
                    className="w-full p-2 text-sm rounded-xl border border-slate-200 bg-white text-stone-700 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={1}>Stage 1: Foundations</option>
                    <option value={2}>Stage 2: Core Practices</option>
                    <option value={3}>Stage 3: Advanced Duas</option>
                    <option value={4}>Stage 4: Juz 30 Core</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Current Progress</label>
                  <select 
                    value={newEntryStatus}
                    onChange={(e) => setNewEntryStatus(e.target.value as ItemStatus)}
                    className="w-full p-2 text-sm rounded-xl border border-slate-200 bg-white text-stone-700 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Memorized">Memorized</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-indigo-50 text-[11px] text-indigo-700 font-sans font-medium rounded-xl flex gap-2 items-start mt-2 border border-indigo-100">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-indigo-700" />
                <p>Ready to log! Submitting will increase your mastered statistics and logging score dynamically.</p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowNewEntryModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-800 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
