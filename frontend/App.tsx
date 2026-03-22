
import React, { useState } from 'react';
import Layout from './components/Layout';
import ChatAssistant from './components/ChatAssistant';
import { MOCK_CONTENT, MOCK_INTERVIEWS, ROADMAPS } from './constants';
import { ContentType, RoadmapData } from './types';
import ProjectsPage from './components/ProjectsPage';
import AchievementsPage from './components/AchievementsPage';
import PublicationsPage from './components/PublicationsPage';
import CertificationsPage from "./components/CertificationsPage";
import CompaniesPage from './components/CompaniesPage';
import StudentsPage from './components/StudentsPage';
import FacultyPage from './components/FacultyPage';
import InterviewExperiencesPage from './components/InterviewExperiencesPage';
import DepartmentGallery from './components/galleries/DepartmentGallery';
import EventsGallery from './components/galleries/EventsGallery';
import CTFPage from './components/CTFPage';
import ResearchLabsPage from './components/ResearchLabsPage';
import AuthorDashboard from './components/AuthorDashboard';
import AdminDashboard from './components/AdminDashboard';
import { useAuth } from './contexts/AuthContext';
import {
  Terminal, Shield, BookOpen, Map, Award, Briefcase,
  ExternalLink, ArrowRight, User, ChevronRight,
  Code, HardDrive, Search, Clock, ArrowLeft, Check, Lock,
} from 'lucide-react';

// ─── Roadmap detail page ──────────────────────────────────────────────────────

const roleConfig: Record<string, { icon: React.FC<{ className?: string }>, accent: string }> = {
  SOC_ANALYST: { icon: Shield, accent: 'from-cyan-900/30 to-blue-900/20' },
  PENETRATION_TESTER: { icon: Terminal, accent: 'from-emerald-900/20 to-cyan-900/20' },
  GRC_SPECIALIST: { icon: Award, accent: 'from-indigo-900/20 to-cyan-900/20' },
  CLOUD_SECURITY: { icon: HardDrive, accent: 'from-sky-900/20 to-cyan-900/20' },
};

// Trim long topic strings to a short label (stops at — or :)
const shortLabel = (item: string) => item.split(/\s*[—:]\s*/)[0].trim();

interface RoadmapDetailPageProps {
  roadmap: RoadmapData;
  onBack: () => void;
}

const RoadmapDetailPage: React.FC<RoadmapDetailPageProps> = ({ roadmap, onBack }) => {
  const cfg = roleConfig[roadmap.id] || roleConfig.SOC_ANALYST;
  const Icon = cfg.icon;

  // ── Checklist state (persisted to localStorage) ──────────────────────────
  const storageKey = `ckh_rm_${roadmap.id}`;
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try { const s = localStorage.getItem(storageKey); return s ? JSON.parse(s) : {}; }
    catch { return {}; }
  });

  const toggle = (key: string) => {
    const next = { ...checked, [key]: !checked[key] };
    setChecked(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { }
  };

  // ── Progress calculation ──────────────────────────────────────────────────
  const allKeys = roadmap.steps.flatMap((step, si) =>
    (step.topics ?? []).flatMap((group, gi) =>
      group.items.map((_, ii) => `${si}.${gi}.${ii}`)
    )
  );
  const doneCount = allKeys.filter(k => checked[k]).length;
  const pct = allKeys.length ? Math.round((doneCount / allKeys.length) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors text-sm font-medium group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Roadmaps
      </button>

      {/* Header bar */}
      <div className={`bg-gradient-to-br ${cfg.accent} border border-cyan-500/20 rounded-2xl p-6`}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold">{roadmap.title} Path</h1>
            <p className="text-sm text-gray-400 mt-0.5">{roadmap.subtitle}</p>
          </div>
          {/* Progress display (desktop) */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <div className="text-lg font-bold">{pct}%</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">complete</div>
            </div>
            <div className="w-24 h-2 bg-gray-800/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-panel body ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[270px_1fr] gap-6 items-start">

        {/* ── LEFT: Sticky learning checklist ── */}
        <div className="lg:sticky lg:top-20 space-y-0">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">

            {/* Panel header */}
            <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-gray-900 z-10">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Checklist</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[10px] font-bold text-cyan-400 tabular-nums w-7 text-right">{pct}%</span>
              </div>
            </div>

            {/* Checklist body — scrollable */}
            <div className="overflow-y-auto max-h-[70vh] p-2 space-y-1">
              {roadmap.steps.map((step, si) => (
                <div key={si}>
                  {/* Phase header */}
                  <div className="flex items-center gap-2 px-2 pt-3 pb-1">
                    <span className="text-[9px] font-bold text-cyan-500 uppercase tracking-widest whitespace-nowrap">
                      Phase {si + 1}
                    </span>
                    <div className="flex-1 h-px bg-gray-800" />
                  </div>
                  <div className="px-2 pb-1.5 text-[11px] font-semibold text-gray-300">{step.title}</div>

                  {/* Topic checkboxes */}
                  {(step.topics ?? []).flatMap((group, gi) =>
                    group.items.map((item, ii) => {
                      const key = `${si}.${gi}.${ii}`;
                      const done = !!checked[key];
                      return (
                        <button
                          key={key}
                          onClick={() => toggle(key)}
                          className="w-full flex items-start gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-800/60 text-left transition-colors group"
                        >
                          {/* Checkbox */}
                          <div className={`w-3.5 h-3.5 mt-0.5 rounded border flex-shrink-0 flex items-center justify-center transition-all ${done ? 'bg-cyan-500 border-cyan-500' : 'border-gray-600 group-hover:border-cyan-500/60'}`}>
                            {done && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                          {/* Label */}
                          <span className={`text-[11px] leading-relaxed transition-colors ${done ? 'line-through text-gray-600' : 'text-gray-400 group-hover:text-gray-200'}`}>
                            {shortLabel(item)}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Vertical node-flow diagram ── */}
        <div className="relative">
          {/* Vertical dashed guide line */}
          <div className="absolute left-[5px] top-3 bottom-3 w-px border-l-2 border-dashed border-cyan-500/20 pointer-events-none" />

          {roadmap.steps.map((step, si) => {
            const stepKeys = (step.topics ?? []).flatMap((g, gi) =>
              g.items.map((_, ii) => `${si}.${gi}.${ii}`)
            );
            const stepDone = stepKeys.filter(k => checked[k]).length;
            const allDone = stepKeys.length > 0 && stepDone === stepKeys.length;

            return (
              <div key={si} className="relative flex gap-5 mb-8 last:mb-0">
                {/* Dot on the guideline */}
                <div className={`flex-shrink-0 w-2.5 h-2.5 rounded-full mt-[14px] z-10 border-2 transition-colors ${allDone ? 'bg-cyan-500 border-cyan-500' : 'bg-gray-950 border-cyan-500/50'}`} />

                {/* Content card */}
                <div className="flex-1 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-colors duration-200">

                  {/* Node header */}
                  <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-gray-800/60">
                    <div>
                      <div className="text-[9px] font-bold text-cyan-500/70 uppercase tracking-widest mb-0.5">Stage {si + 1}</div>
                      <h3 className={`text-base font-bold leading-tight ${allDone ? 'text-cyan-400' : 'text-white'}`}>
                        {step.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{step.description}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      {step.duration && (
                        <span className="flex items-center gap-1 text-[10px] text-gray-600 border border-gray-800 rounded-full px-2 py-0.5 whitespace-nowrap">
                          <Clock className="w-2.5 h-2.5" />{step.duration}
                        </span>
                      )}
                      {stepKeys.length > 0 && (
                        <div className="text-[10px] text-gray-600 mt-1.5">{stepDone}/{stepKeys.length} done</div>
                      )}
                    </div>
                  </div>

                  {/* Topic groups */}
                  {(step.topics ?? []).length > 0 && (
                    <div className="px-5 py-4 space-y-3">
                      {(step.topics ?? []).map((group, gi) => (
                        <div key={gi}>
                          {/* Group label */}
                          <div className={`text-[9px] font-bold uppercase tracking-widest mb-2 ${group.type === 'must-know' ? 'text-cyan-500/70' : group.type === 'good-to-know' ? 'text-indigo-400/60' : 'text-gray-500'}`}>
                            {group.name}
                          </div>
                          {/* Topic pills — short labels, click to check */}
                          <div className="flex flex-wrap gap-1.5">
                            {group.items.map((item, ii) => {
                              const key = `${si}.${gi}.${ii}`;
                              const done = !!checked[key];
                              const base =
                                group.type === 'must-know'
                                  ? 'border-gray-700 text-gray-200 hover:border-cyan-500/60 hover:text-cyan-300'
                                  : group.type === 'good-to-know'
                                    ? 'border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-400'
                                    : 'border-cyan-500/15 text-cyan-400/60 hover:border-cyan-500/40 hover:text-cyan-300';
                              return (
                                <span
                                  key={ii}
                                  title={item}
                                  onClick={() => toggle(key)}
                                  className={`text-[11px] px-2 py-0.5 rounded border bg-gray-950 cursor-pointer select-none transition-all duration-150 ${done ? 'line-through opacity-30 border-gray-800 text-gray-600' : base}`}
                                >
                                  {shortLabel(item)}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Resources */}
                  {step.resources.length > 0 && (
                    <div className="px-5 pb-4 pt-0 border-t border-gray-800/40">
                      <div className="text-[9px] font-bold uppercase tracking-widest text-gray-600 mb-2 pt-3">Resources</div>
                      <div className="flex flex-wrap gap-1.5">
                        {step.resources.map(r => (
                          <span key={r} className="text-[11px] bg-cyan-900/20 text-cyan-400/80 px-2 py-0.5 rounded-full border border-cyan-500/20">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};



// ─── Main App ────────────────────────────────────────────────────────────────

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [activeRoadmap, setActiveRoadmap] = useState<string | null>(null);
  const { role, loading: authLoading } = useAuth();

  const roadmapCards = [
    { id: 'SOC_ANALYST', title: 'SOC Analyst', desc: 'Focus on defensive operations and monitoring.', icon: Shield },
    { id: 'PENETRATION_TESTER', title: 'Penetration Tester', desc: 'Ethical hacking and offensive security.', icon: Terminal },
    { id: 'GRC_SPECIALIST', title: 'GRC Specialist', desc: 'Governance, risk, and compliance.', icon: Award },
    { id: 'CLOUD_SECURITY', title: 'Cloud Security', desc: 'Securing AWS, Azure, and GCP environments.', icon: HardDrive },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-16">
            {/* Hero */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-100 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border border-cyan-200 dark:border-cyan-500/20 p-8 md:p-16 text-center">

              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #06b6d4 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                Master the Art of <span className="text-cyan-500 underline decoration-cyan-500/30">Cyber Defense</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
                A knowledge vault for cybersecurity enthusiasts. Roadmaps, research, writeups, and experiences from the community.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button onClick={() => setActiveTab('roadmaps')} className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-full font-semibold transition-all flex items-center gap-2">
                  Get Started <ArrowRight className="w-5 h-5" />
                </button>
                <button onClick={() => setActiveTab('ctf')} className="px-8 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-full font-semibold transition-all">
                  Browse CTFs
                </button>
              </div>
            </section>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Blogs', count: '45+', icon: BookOpen },
                { label: 'CTF Writeups', count: '120+', icon: Terminal },
                { label: 'Projects', count: '30+', icon: Code },
                { label: 'Placements', count: '85+', icon: Briefcase },
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl text-center group hover:border-cyan-500/50 transition-colors shadow-sm dark:shadow-none">
                  <stat.icon className="w-6 h-6 text-cyan-600 dark:text-cyan-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">{stat.count}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-500 uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}

            </div>

            {/* Featured */}
            <section>
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Featured Knowledge</h2>
                  <p className="text-gray-400">Hand-picked resources to level up your skills.</p>
                </div>
                <button onClick={() => setActiveTab('blogs')} className="text-cyan-500 font-medium hover:underline flex items-center gap-1">
                  View all <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {MOCK_CONTENT.slice(0, 3).map((item) => (
                  <div key={item.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:transform hover:-translate-y-1 transition-all shadow-sm hover:shadow-md dark:shadow-none">

                    <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover" />
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-cyan-900/40 text-cyan-400 border border-cyan-500/20">
                          {item.type}
                        </span>
                        <span className="text-xs text-gray-500">{item.date}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-2 line-clamp-1">{item.title}</h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{item.description}</p>
                      <button className="text-sm font-semibold text-cyan-500 hover:text-cyan-400">Read More</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        );

      case 'ctf':
        return <CTFPage />;

      case 'blogs':
      case 'experiments': {
        const typeMap: Record<string, ContentType> = {
          'blogs': ContentType.BLOG,
          'experiments': ContentType.EXPERIMENT
        };
        const filtered = MOCK_CONTENT.filter(c => c.type === typeMap[activeTab]);
        return (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold capitalize mb-2">{activeTab}</h1>
                <p className="text-gray-400">Explore our community-driven {activeTab} vault.</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full py-2 pl-10 pr-4 w-full md:w-64 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.length > 0 ? filtered.map((item) => (
                <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-cyan-500" />
                        <span className="text-xs text-gray-400">{item.author}</span>
                      </div>
                      <span className="text-xs text-gray-500">{item.date}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                    <p className="text-gray-400 text-sm mb-6">{item.description}</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {item.tags.map(t => (
                        <span key={t} className="text-[10px] bg-gray-800 text-gray-400 px-2 py-1 rounded">#{t}</span>
                      ))}
                    </div>
                    <button className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold text-sm transition-colors border border-gray-700">
                      Explore Content
                    </button>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-20 text-center">
                  <div className="text-gray-500 mb-2">No items found in this category yet.</div>
                  <button className="text-cyan-500 hover:underline">Contribute your first {activeTab.slice(0, -1)}?</button>
                </div>
              )}
            </div>
          </div>
        );
      }

      case 'author-dashboard':
        if (authLoading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>;
        if (!role || (role !== 'author' && role !== 'admin')) return (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-3">
            <Lock className="w-10 h-10 opacity-30" />
            <p>You need Author or Admin access to view this page.</p>
          </div>
        );
        return <AuthorDashboard />;

      case 'admin-dashboard':
        if (authLoading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>;
        if (role !== 'admin') return (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-3">
            <Lock className="w-10 h-10 opacity-30" />
            <p>Admin access required.</p>
          </div>
        );
        return <AdminDashboard />;

      case 'projects':
        return <ProjectsPage />;

      case 'achievements':
        return <AchievementsPage />;

      case 'companies':
        return <CompaniesPage />;

      case 'publications':
        return <PublicationsPage />;

      case 'certifications':
        return <CertificationsPage />;
      case 'students':
        return <StudentsPage />;

      case 'faculty':
        return <FacultyPage />;

      case 'research-labs':
        return <ResearchLabsPage />;

      case 'gallery-department':
        return <DepartmentGallery />;
      case 'gallery-events':
        return <EventsGallery />;
      case 'interviews':
        return <InterviewExperiencesPage />;

      case 'roadmaps':
        // Individual roadmap detail view
        if (activeRoadmap && ROADMAPS[activeRoadmap]) {
          return (
            <RoadmapDetailPage
              roadmap={ROADMAPS[activeRoadmap]}
              onBack={() => setActiveRoadmap(null)}
            />
          );
        }

        // Roadmap selection grid
        return (
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Cybersecurity Roadmaps</h1>
              <p className="text-gray-400">Step-by-step guides to land your dream role in infosec.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {roadmapCards.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setActiveRoadmap(role.id)}
                  className="bg-gray-900 border border-gray-800 p-6 rounded-2xl hover:border-cyan-500/50 transition-all duration-200 group cursor-pointer text-left w-full focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                >
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
                    <role.icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">{role.title}</h3>
                  <p className="text-gray-400 text-sm mb-6">{role.desc}</p>
                  <span className="flex items-center gap-2 text-sm font-semibold text-cyan-500 group-hover:gap-3 transition-all">
                    View Interactive Roadmap <ChevronRight className="w-4 h-4" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'career':
        return (
          <div className="space-y-12">
            <div>
              <h1 className="text-4xl font-bold mb-4">Career Hub</h1>
              <p className="text-gray-400">Interview experiences, company data, and guidance.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Briefcase className="text-cyan-500" /> Senior Interview Experiences
                  </h3>
                  <button onClick={() => setActiveTab('interviews')} className="text-cyan-400 text-sm font-semibold hover:underline flex items-center gap-1">
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                {MOCK_INTERVIEWS.slice(0, 2).map(exp => (
                  <div key={exp.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-bold">{exp.company}</h4>
                        <p className="text-cyan-500 text-sm">{exp.role}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${exp.difficulty === 'Hard' ? 'bg-red-900/20 text-red-400 border border-red-500/20' :
                        exp.difficulty === 'Medium' ? 'bg-yellow-900/20 text-yellow-400 border border-yellow-500/20' :
                          'bg-green-900/20 text-green-400 border border-green-500/20'
                        }`}>
                        {exp.difficulty}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-950 p-3 rounded-xl border border-gray-800">
                        <span className="text-[10px] text-gray-500 uppercase block mb-1">Student</span>
                        <span className="text-sm font-medium">{exp.studentName} (Batch {exp.batch})</span>
                      </div>
                      <div className="bg-gray-950 p-3 rounded-xl border border-gray-800">
                        <span className="text-[10px] text-gray-500 uppercase block mb-1">Total Rounds</span>
                        <span className="text-sm font-medium">{exp.rounds.length} Rounds</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs font-bold text-gray-500 uppercase">Top Tips:</span>
                        <ul className="mt-2 space-y-1">
                          {exp.insights?.tips?.map((tip, i) => (
                            <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                              <span className="text-cyan-500">•</span> {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <button onClick={() => setActiveTab('interviews')} className="mt-6 w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-bold transition-all border border-gray-700">
                      Read Full Experience
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-indigo-900/40 to-cyan-900/40 border border-cyan-500/20 p-6 rounded-2xl">
                  <h3 className="text-xl font-bold mb-4">Top Recruiters</h3>
                  <div className="space-y-4">
                    {['Google Cloud Security', 'Zscaler', 'Cloudflare', 'Cisco Talos', 'SentinelOne'].map(company => (
                      <div key={company} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl border border-white/5">
                        <span className="font-medium text-sm">{company}</span>
                        <ExternalLink className="w-3 h-3 text-gray-500" />
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all">
                    View Full Directory
                  </button>
                </div>

                <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Award className="text-yellow-500" /> Prep Resources
                  </h3>
                  <ul className="space-y-3">
                    <li className="text-sm text-gray-400 hover:text-cyan-400 cursor-pointer flex items-center justify-between">
                      Common SOC Interview Qs <ChevronRight className="w-4 h-4" />
                    </li>
                    <li className="text-sm text-gray-400 hover:text-cyan-400 cursor-pointer flex items-center justify-between">
                      Bypassing WAFs Guide <ChevronRight className="w-4 h-4" />
                    </li>
                    <li className="text-sm text-gray-400 hover:text-cyan-400 cursor-pointer flex items-center justify-between">
                      Networking Fundamentals <ChevronRight className="w-4 h-4" />
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Not found</div>;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
      <ChatAssistant />
    </Layout>
  );
};

export default App;
