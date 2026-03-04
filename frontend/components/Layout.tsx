
import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, BookOpen, Map, Award, Terminal, Briefcase, Menu, X, Github, UserCircle, LogOut, Cpu, Building2, ChevronDown, FileBadge, MessageSquare, Users, PenLine, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import AuthModal from './AuthModal';
interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [openNav, setOpenNav] = useState<string | null>(null);
  const { theme, toggle: toggleTheme } = useTheme();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, signOut, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Close user-menu and nav dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      const target = e.target as Element;
      if (!target.closest('[data-nav-dropdown]')) {
        setOpenNav(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [])

  // Keep a concise top-level nav and expose category subsections
  const navItems = [
    { id: 'home', label: 'Home', icon: Shield, path: '/' },
    {
      id: 'learn', label: 'Learn', icon: BookOpen,
      subItems: [
        { id: 'blogs', label: 'Blogs', icon: BookOpen, path: '/blogs' },
        { id: 'ctf', label: 'CTF Guides', icon: Terminal, path: '/ctf' },
        { id: 'roadmaps', label: 'Roadmaps', icon: Map, path: '/roadmaps' },
      ]
    },
    {
      id: 'showcase', label: 'Showcase', icon: Github,
      subItems: [
        { id: 'projects', label: 'Projects', icon: Github, path: '/projects' },
        { id: 'achievements', label: 'Achievements', icon: Award, path: '/achievements' },
        { id: 'experiments', label: 'Experiments', icon: Cpu, path: '/experiments' },
        { id: 'certifications', label: 'Certifications', icon: FileBadge, path: '/certifications' },
      ]
    },
    {
      id: 'directory', label: 'Directory', icon: Users,
      subItems: [
        { id: 'students', label: 'The Constellation', icon: Users, path: '/students' },
        { id: 'faculty', label: 'Faculty', icon: UserCircle, path: '/faculty' },
        { id: 'gallery', label: 'Gallery', icon: Map, path: '/gallery' },
      ]
    },
    {
      id: 'career_hub', label: 'Career Hub', icon: Briefcase,
      subItems: [
        { id: 'career', label: 'Preparation', icon: Briefcase, path: '/career' },
        { id: 'interviews', label: 'Experiences', icon: MessageSquare, path: '/interviews' },
        { id: 'companies', label: 'Companies', icon: Building2, path: '/companies' },
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Shield className="w-8 h-8 text-cyan-500" />
            <span className="text-xl font-bold tracking-tight mono">CYBER<span className="text-cyan-500">SHIELD</span></span>
          </div>

          {/* Desktop Nav */}

          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              item.subItems ? (
                <div key={item.id} className="relative group">
                  <button className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl transition-colors hover:text-cyan-400 hover:bg-gray-800/50 ${
                    item.subItems.some(s => isActive(s.path)) ? 'text-cyan-500' : 'text-gray-400'
                  }`}>
                    {item.label} <ChevronDown className="w-3.5 h-3.5 opacity-70 group-hover:rotate-180 transition-transform" />
                  </button>
                  <div className="absolute top-full left-0 pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-xl overflow-hidden">
                      {item.subItems.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => { navigate(sub.path); setOpenNav(null); }}
                          className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-left transition-colors hover:bg-gray-800 hover:text-cyan-400 ${isActive(sub.path) ? 'text-cyan-500 bg-gray-800/50' : 'text-gray-400'}`}
                        >
                          <sub.icon className="w-4 h-4" />
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  key={item.id}
                  onClick={() => navigate((item as any).path)}
                  className={`px-3 py-2 text-sm font-medium rounded-xl transition-colors hover:bg-gray-800/50 hover:text-cyan-400 ${isActive((item as any).path) ? 'text-cyan-500' : 'text-gray-400'}`}
                >
                  {item.label}
                </button>
              )
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Profile / Auth button */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu((v) => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName ?? 'avatar'} className="w-6 h-6 rounded-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <UserCircle className="w-6 h-6 text-cyan-400" />
                  )}
                  <span className="hidden sm:block text-sm font-medium text-gray-200 max-w-[120px] truncate">
                    {user.displayName ?? user.email}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-800">
                      <p className="text-sm font-semibold text-white truncate">{user.displayName ?? 'User'}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    {(role === 'author' || role === 'admin') && (
                      <button
                        onClick={() => { setShowUserMenu(false); navigate('/author-dashboard'); }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-cyan-400 hover:bg-gray-800 transition-colors"
                      >
                        <PenLine className="w-4 h-4" />
                        My Articles
                      </button>
                    )}
                    {role === 'admin' && (
                      <button
                        onClick={() => { setShowUserMenu(false); navigate('/admin-dashboard'); }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-yellow-400 hover:bg-gray-800 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Admin Dashboard
                      </button>
                    )}
                    <div className="border-t border-gray-800" />
                    <button
                      onClick={async () => { setShowUserMenu(false); await signOut(); }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-gray-800 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition-colors"
              >
                <UserCircle className="w-5 h-5" />
                Sign In
              </button>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-xl text-gray-400 hover:text-cyan-400 hover:bg-gray-800/50 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-gray-400 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-gray-950/95 pt-20 overflow-y-auto pb-10">
          <nav className="flex flex-col items-center gap-8">
            {navItems.map((item) => (
              <div key={item.id} className="w-full flex flex-col items-center gap-5">
                {item.subItems ? (
                  <>
                    <div className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">{item.label}</div>
                    {item.subItems.map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => { navigate(sub.path); setIsMenuOpen(false); }}
                        className={`text-xl font-bold flex items-center gap-3 ${isActive(sub.path) ? 'text-cyan-500' : 'text-gray-400'}`}
                      >
                        <sub.icon className="w-5 h-5" />
                        {sub.label}
                      </button>
                    ))}
                  </>
                ) : (
                  <button
                    onClick={() => { navigate((item as any).path); setIsMenuOpen(false); }}
                    className={`text-2xl font-bold flex items-center gap-3 ${isActive((item as any).path) ? 'text-cyan-500' : 'text-gray-400'}`}
                  >
                    <item.icon className="w-6 h-6" />
                    {item.label}
                  </button>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}

      <main className={`flex-1 w-full flex flex-col ${location.pathname.startsWith('/gallery') ? 'min-h-[calc(100vh-64px)]' : 'max-w-7xl mx-auto px-4 py-8'}`}>
        {children}
      </main>

      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-cyan-500" />
              <span className="text-lg font-bold mono">CYBERSHIELD</span>
            </div>
            <p className="text-gray-400 max-w-sm">
              The official knowledge repository of the Department Cybersecurity Cell.
              Dedicated to building the next generation of digital defenders.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><button onClick={() => navigate('/blogs')} className="hover:text-cyan-400">Security Blogs</button></li>
              <li><button onClick={() => navigate('/ctf')} className="hover:text-cyan-400">CTF Guides</button></li>
              <li><button onClick={() => navigate('/roadmaps')} className="hover:text-cyan-400">Roadmaps</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Contribute</h4>
            <ul className="space-y-2 text-gray-400">
              <li><button className="hover:text-cyan-400">Submit Project</button></li>
              <li><button className="hover:text-cyan-400">Share Interview Exp</button></li>
              <li><button className="hover:text-cyan-400">CMS Login</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Department Cybersecurity Hub. Securely built for hackers.
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
};

export default Layout;
