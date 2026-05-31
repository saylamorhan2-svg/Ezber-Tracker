import React from 'react';
import { 
  Building2, 
  BookOpen, 
  ListTodo, 
  FolderLock, 
  Settings, 
  HelpCircle, 
  PlusCircle, 
  LogOut,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  role: 'Student' | 'Teacher';
  userName: string;
  onLogout: () => void;
}

export default function Sidebar({ currentTab, onTabChange, role, userName, onLogout }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-[#e2e8f0] bg-white flex flex-col shrink-0 h-screen overflow-y-auto">
      <div className="flex flex-col h-full p-6">
        
        {/* Sidebar Header Brand */}
        <div className="mb-10 px-2">
          <h2 className="font-display text-xl font-bold text-indigo-600 tracking-tight">
            {role === 'Teacher' ? 'Ezber Academy' : 'Ezber Sanctuary'}
          </h2>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5 flex items-center gap-1">
            {role === 'Teacher' ? (
              <>
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Teacher Portal</span>
              </>
            ) : (
              <span>Student Profile</span>
            )}
          </p>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 space-y-1.5">
          <button
            type="button"
            onClick={() => onTabChange('Dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm cursor-pointer ${
              currentTab === 'Dashboard' 
                ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600 rounded-r-none' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
            }`}
          >
            <Building2 className="w-4 h-4 shrink-0" />
            <span>Overview</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('Classes')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm cursor-pointer ${
              currentTab === 'Classes' 
                ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600 rounded-r-none' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>My Classes</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('Curriculum')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm cursor-pointer ${
              currentTab === 'Curriculum' 
                ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600 rounded-r-none' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
            }`}
          >
            <ListTodo className="w-4 h-4 shrink-0" />
            <span>Curriculum</span>
          </button>


        </nav>

        {/* Bottom Utility Menu */}
        <div className="pt-4 border-t border-slate-200/60 space-y-1.5 mt-auto">
          <button
            type="button"
            onClick={() => onTabChange('Settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm cursor-pointer ${
              currentTab === 'Settings' 
                ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600 rounded-r-none' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Settings</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('Help')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm cursor-pointer ${
              currentTab === 'Help' 
                ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600 rounded-r-none' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
            }`}
          >
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span>Help</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all font-semibold text-sm cursor-pointer mt-2"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </aside>
  );
}
