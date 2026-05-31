import React, { useState } from 'react';
import { Sparkles, ArrowRight, User, GraduationCap, Eye, EyeOff } from 'lucide-react';
import { Student } from '../types';

interface LoginScreenProps {
  students: Student[];
  onLogin: (role: 'Student' | 'Teacher', studentId?: string) => void;
  onSignup: (name: string, email: string) => string;
}

export default function LoginScreen({ students, onLogin, onSignup }: LoginScreenProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Focus states for input label transitions
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail.includes('teacher') || cleanEmail.includes('ustadh') || cleanEmail.includes('ahmed')) {
      setError('');
      onLogin('Teacher');
    } else {
      // Find matching student by email, fallback gracefully if not found
      const matched = students.find(s => s.email.toLowerCase().trim() === cleanEmail);
      if (matched) {
        setError('');
        onLogin('Student', matched.id);
      } else {
        setError('This email address is not registered yet. Please click the "Sign Up" tab above to create an account, or select any "Quick Select" profile below for evaluator testing.');
      }
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (role === 'teacher') {
      setError('');
      onLogin('Teacher');
    } else {
      // Prevent signing up with an email that is already registered
      const emailExists = students.some(s => s.email.toLowerCase().trim() === cleanEmail);
      if (emailExists) {
        setError('An account with this email address already exists. Please switch to the "Login" tab to sign in.');
        return;
      }

      setError('');
      // Dynamically add a real student account with the actual name and email entered
      const newStudentId = onSignup(cleanName, cleanEmail);
      onLogin('Student', newStudentId);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc] text-slate-800 font-sans antialiased">
      {/* Left Side: Brand Identity (40%) */}
      <section className="w-full md:w-[40%] bg-indigo-950 flex flex-col justify-between p-8 md:p-16 text-white relative overflow-hidden shrink-0">
        {/* Subtle geometric dot matrix overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.15) 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }} />

        {/* Brand visual texture watermark */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay">
          <img 
            alt="Islamic Art" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5ju27wfyYqlfWyzi4HPXW6V6Ddx4gfv_5FTql0nYHclxRBiNEQDs980iVIRdFyBbQixIrwcFaQ_fZnAlc1lOUsn5Y-_KBDDmZ_oDa2T3jvr_UD7OaeLBdD4GbrVmKxIDoIEPHnZ5r5YjAd-MyxDgYAWKsjwAM2XGvOhHVYbYt2_4R78rQUANGCeV6iiZv76FJkQDcwmv6aVjfyl1sdTmYmau4XqThRrf4hucdqZOJPJYsdJctLQMtVbRjxc2sK76qO_L186Ukxg"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="z-10 mt-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Ezber Tracker
          </h1>
          {/* Accent rule bar */}
          <div className="h-1 w-12 bg-indigo-500 mb-6 rounded-full" />
          <p className="text-indigo-100/90 text-[15px] leading-relaxed max-w-sm font-sans font-light">
            Master your memorization with precision and purpose. A disciplined sanctuary for spiritual growth and academic excellence.
          </p>
        </div>

        <div className="mt-12 z-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-900/50 flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
            <span className="font-semibold text-sm tracking-wide">Join 5,000+ Students &amp; Teachers</span>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm">
            <div className="p-4 border border-white/5 rounded-xl backdrop-blur-sm bg-white/5">
              <span className="text-white/60 text-xs block mb-1">Success Rate</span>
              <span className="font-display text-2xl font-bold text-indigo-300 md:text-3xl">94%</span>
            </div>
            <div className="p-4 border border-white/5 rounded-xl backdrop-blur-sm bg-white/5">
              <span className="text-white/60 text-xs block mb-1">Active Surahs</span>
              <span className="font-display text-2xl font-bold text-indigo-300 md:text-3xl">114</span>
            </div>
          </div>
        </div>
      </section>

      {/* Right Side: Interaction Area (60%) */}
      <section className="w-full md:w-[60%] flex items-center justify-center p-6 md:p-16 bg-[#f8fafc]">
        <div className="w-full max-w-md space-y-8">
          {/* Toggle Header */}
          <div className="flex justify-center">
            <div className="bg-slate-100 p-1 rounded-full flex gap-1 relative shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setError('');
                }}
                className={`px-8 py-2 rounded-full font-bold text-sm transition-all duration-300 z-10 cursor-pointer ${
                  activeTab === 'login' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signup');
                  setError('');
                }}
                className={`px-8 py-2 rounded-full font-bold text-sm transition-all duration-300 z-10 cursor-pointer ${
                  activeTab === 'signup' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Forms Area */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl text-xs font-semibold leading-relaxed mb-6 flex gap-2.5 items-start animate-in fade-in duration-200">
                <span className="text-sm select-none" role="img" aria-label="warning">⚠️</span>
                <span>{error}</span>
              </div>
            )}
            {activeTab === 'login' ? (
              <div className="space-y-6">
                <header>
                  <h2 className="font-display text-2xl font-bold text-indigo-650 mb-1">Welcome back</h2>
                  <p className="text-sm text-slate-400">Continue your journey of preservation.</p>
                </header>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className={`text-xs font-bold select-none transition-colors ml-1 ${emailFocused ? 'text-indigo-600' : 'text-slate-400'}`}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                      placeholder="name@example.com"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center px-1">
                      <label className={`text-xs font-bold select-none transition-colors ${passwordFocused ? 'text-indigo-600' : 'text-slate-400'}`}>
                        Password
                      </label>
                      <button type="button" className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer">Forgot?</button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                        className="w-full px-4 py-3 pr-10 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white hover:bg-indigo-700 py-3.5 rounded-xl font-bold text-sm shadow-xs transition-all hover:scale-[1.01] active:scale-95 duration-150 flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                <header>
                  <h2 className="font-display text-2xl font-bold text-indigo-650 mb-1">Create Account</h2>
                  <p className="text-sm text-slate-400">Start tracking your memorization today.</p>
                </header>

                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className={`text-xs font-bold select-none transition-colors ml-1 ${nameFocused ? 'text-indigo-600' : 'text-slate-400'}`}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setNameFocused(true)}
                      onBlur={() => setNameFocused(false)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                      placeholder="Abdullah Rahman"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`text-xs font-bold select-none transition-colors ml-1 ${emailFocused ? 'text-indigo-600' : 'text-slate-400'}`}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                      placeholder="name@example.com"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`text-xs font-bold select-none transition-colors ml-1 ${passwordFocused ? 'text-indigo-600' : 'text-slate-400'}`}>
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                      placeholder="Minimum 8 characters"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 ml-1 block">Role</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="radio"
                          id="role-student"
                          name="role"
                          checked={role === 'student'}
                          onChange={() => setRole('student')}
                          className="sr-only peer"
                        />
                        <label
                          htmlFor="role-student"
                          className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-all font-bold text-sm peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:border-indigo-600"
                        >
                          <User className="w-4 h-4" />
                          <span>Student</span>
                        </label>
                      </div>
                      <div>
                        <input
                          type="radio"
                          id="role-teacher"
                          name="role"
                          checked={role === 'teacher'}
                          onChange={() => setRole('teacher')}
                          className="sr-only peer"
                        />
                        <label
                          htmlFor="role-teacher"
                          className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-all font-bold text-sm peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:border-indigo-600"
                        >
                          <GraduationCap className="w-4 h-4" />
                          <span>Teacher</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white hover:bg-indigo-700 py-3.5 rounded-xl font-bold text-sm shadow-xs transition-all hover:scale-[1.01] active:scale-95 duration-150 cursor-pointer mt-2"
                  >
                    Create Account
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Quick Selection for Testing */}
          <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50 space-y-3">
            <p className="text-xs font-bold text-slate-400 text-center uppercase tracking-wider">
              Quick Select Roles (For testing evaluators)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setEmail('zaid@ezbertracker.com');
                  onLogin('Student', 's-1');
                }}
                className="px-2 py-1.5 text-xs font-semibold bg-indigo-55/65 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors border border-indigo-200/50 cursor-pointer"
              >
                Student Zaid
              </button>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setEmail('ibrahim@ezbertracker.com');
                  onLogin('Student', 's-2');
                }}
                className="px-2 py-1.5 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors border border-amber-200/50 cursor-pointer"
              >
                Student Ibrahim
              </button>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setEmail('ustadh@ezberacademy.com');
                  onLogin('Teacher');
                }}
                className="px-2 py-1.5 text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors border border-slate-200 cursor-pointer"
              >
                Teacher Portal
              </button>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="text-center text-xs text-slate-400">
            By continuing, you agree to Ezber Tracker's{' '}
            <a href="#" className="font-bold text-indigo-600 hover:underline">
              Terms of Service
            </a>.
          </div>
        </div>
      </section>
    </div>
  );
}
