import React, { useState } from 'react';
import { Bell, Settings, LogOut, ChevronDown, User, Shield, CheckCircle2, Menu } from 'lucide-react';
import { Student } from '../types';

interface TopNavBarProps {
  students: Student[];
  currentProfileId: string;
  currentRole: 'Student' | 'Teacher';
  onProfileChange: (role: 'Student' | 'Teacher', profileId?: string) => void;
  onLogout: () => void;
  activeNavTab: string;
  onNavTabChange: (tab: string) => void;
  onOpenMobileMenu?: () => void;
}

export default function TopNavBar({
  students,
  currentProfileId,
  currentRole,
  onProfileChange,
  onLogout,
  activeNavTab,
  onNavTabChange,
  onOpenMobileMenu
}: TopNavBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  // Find current student info if role is Student
  const currentStudent = students.find(s => s.id === currentProfileId);

  const getProfileName = () => {
    if (currentRole === 'Teacher') {
      return 'Ustadh Ahmed Al-Farsi';
    }
    return currentStudent ? currentStudent.name : 'Unknown Student';
  };

  const getProfileAvatar = () => {
    if (currentRole === 'Teacher') {
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2DBglWW9h81vqkqJFuz74uT0x3O7mQwC_i0wWTqs_q3TOgP6XhSEL788Y0_QZuSmae0etNsoqS_robkFRXCwMFK4NpD74K4P6g57V0z5R1mwJNBNeX12rcnE_DtPt7x_o675tewKXNZjwjUlIcj5YaD2kaB-Phs3H5qsid4lDYyq-aoowpNBxTwNZbsYlOKWoEfm9vrOj2PSx-bWyfqudGFbmrPyx3yCS5bKCBdD_yMvFq0fFl6eReu6xTMcCC6LNtRvrqmrr6w';
    }
    // Return avatar url or first initials circle fallback
    return currentStudent?.avatarUrl || '';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleProfileSelect = (type: 'Student' | 'Teacher', id?: string) => {
    onProfileChange(type, id);
    setDropdownOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200">
      <div className="max-w-[1440px] mx-auto flex justify-between items-center px-4 md:px-16 py-3.5">
        
        {/* Left Side Brand */}
        <div className="flex items-center gap-3 lg:gap-10">
          {/* Hamburger Menu on Smaller Screens */}
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-1.5 hover:bg-slate-100/80 rounded-xl text-slate-600 hover:text-indigo-650 transition-colors cursor-pointer"
            title="Toggle Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <h1 
            onClick={() => onNavTabChange('Dashboard')}
            className="font-display text-xl md:text-2xl font-bold text-indigo-600 tracking-tight hover:scale-98 transition-transform cursor-pointer"
          >
            Ezber Tracker
          </h1>
          
          {/* Main Tabs (Desk) */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => onNavTabChange('Dashboard')}
              className={`pb-1 font-bold text-sm transition-all relative cursor-pointer ${
                activeNavTab === 'Dashboard'
                  ? 'text-indigo-600'
                  : 'text-slate-500 hover:text-indigo-600'
              }`}
            >
              <span>Dashboard</span>
              {activeNavTab === 'Dashboard' && (
                <span className="absolute bottom-[-14px] left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>
            <button
              onClick={() => onNavTabChange('Classes')}
              className={`pb-1 font-bold text-sm transition-all relative cursor-pointer ${
                activeNavTab === 'Classes'
                  ? 'text-indigo-600'
                  : 'text-slate-500 hover:text-indigo-600'
              }`}
            >
              <span>Classes</span>
              {activeNavTab === 'Classes' && (
                <span className="absolute bottom-[-14px] left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>
            <button
              onClick={() => onNavTabChange('Students')}
              className={`pb-1 font-bold text-sm transition-all relative cursor-pointer ${
                activeNavTab === 'Students'
                  ? 'text-indigo-600'
                  : 'text-slate-500 hover:text-indigo-600'
              }`}
            >
              <span>Students</span>
              {activeNavTab === 'Students' && (
                <span className="absolute bottom-[-14px] left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>
            <button
              onClick={() => onNavTabChange('Reports')}
              className={`pb-1 font-bold text-sm transition-all relative cursor-pointer ${
                activeNavTab === 'Reports'
                  ? 'text-indigo-600'
                  : 'text-slate-500 hover:text-indigo-600'
              }`}
            >
              <span>Reports</span>
              {activeNavTab === 'Reports' && (
                <span className="absolute bottom-[-14px] left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>
          </nav>
        </div>

        {/* Right Action Icons Dashboard */}
        <div className="flex items-center gap-3">
          
          {/* Notifications Trigger */}
          <div className="relative">
            <button 
              onClick={() => {
                setNotifDropdownOpen(!notifDropdownOpen);
                setDropdownOpen(false);
              }}
              className="p-2 hover:bg-stone-100 rounded-lg transition-all text-[#41493e] relative cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>

            {/* Notification Dropdown Container */}
            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-[#1a1c1c]">Notification center</h4>
                  <button onClick={() => setNotifDropdownOpen(false)} className="text-stone-400 hover:text-stone-600">Dismiss</button>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  <div className="flex items-start gap-2.5 p-2 hover:bg-stone-50 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-stone-900">Review checked by Teacher</p>
                      <p className="text-secondary opacity-80 mt-0.5">Ustadh Ahmed marked SURAH AL-FATIHA as fully memorized!</p>
                      <span className="text-[10px] text-stone-400 block mt-1">10 minutes ago</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-2 hover:bg-stone-50 rounded-lg">
                    <Bell className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-stone-900">New priority target set</p>
                      <p className="text-secondary opacity-80 mt-0.5">Focus: Surah Al-Baqarah verses 142-176.</p>
                      <span className="text-[10px] text-stone-400 block mt-1">2 hours ago</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => onNavTabChange('Settings')}
            className="p-2 hover:bg-stone-100 rounded-lg transition-all text-[#41493e] cursor-pointer"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* User Profile Controls Switcher */}
          <div className="relative border-l border-stone-200 pl-3">
            <button
              onClick={() => {
                setDropdownOpen(!dropdownOpen);
                setNotifDropdownOpen(false);
              }}
              className="flex items-center gap-2 py-1 px-1.5 hover:bg-stone-50 rounded-full transition-all cursor-pointer border border-slate-200 shadow-sm"
            >
              {getProfileAvatar() ? (
                <img
                  alt="User Profile Avatar"
                  className="w-8 h-8 rounded-full border border-indigo-200/50 object-cover"
                  src={getProfileAvatar()}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-150 text-indigo-800 font-bold text-xs flex items-center justify-center border border-indigo-200/30 font-display">
                  {getInitials(getProfileName())}
                </div>
              )}
              <span className="hidden sm:inline-block text-xs font-semibold text-[#1a1c1c] max-w-[120px] truncate">
                {getProfileName()}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#41493e]" />
            </button>

            {/* User Toggling Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2.5 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-stone-100 text-[10px] uppercase font-bold tracking-wider text-stone-400">
                  Current Session
                </div>
                <div className="p-3 bg-indigo-50/40 rounded-xl m-1 flex items-center gap-2.5 mb-2">
                  <div className="text-xs font-semibold text-stone-800">
                    Role: <span className="text-indigo-600 font-bold">{currentRole}</span>
                  </div>
                </div>

                <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Switch Profiles
                </div>

                <div className="max-h-56 overflow-y-auto space-y-0.5">
                  <button
                    onClick={() => handleProfileSelect('Teacher')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                      currentRole === 'Teacher' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Teacher: Ustadh Ahmed</span>
                  </button>

                  {students.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => handleProfileSelect('Student', student.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                        currentRole === 'Student' && currentProfileId === student.id
                          ? 'bg-indigo-50 text-indigo-700 font-bold'
                          : 'hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <div className="flex-1 truncate">
                        <span>{student.name}</span>
                        <span className="text-[10px] text-gray-400 ml-1 font-bold">({student.masteredCount} verified)</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="border-t border-stone-100 my-1 pt-1">
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-600" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
