import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Hash, FileText, ShieldCheck, Loader2, AlertCircle,
  Plus, Trash2, Edit2, Check, X, ChevronUp, ChevronDown,
  RefreshCw, Eye, BookOpen, UserCog, Search, Layers,
} from 'lucide-react';
import {
  adminGetUsers, adminSetUserRole,
  adminGetTopics, adminCreateTopic, adminUpdateTopic, adminDeleteTopic,
  adminGetArticles, adminSetArticleStatus, adminSetArticleOrder, adminUpdateArticleTopic,
  DbUser, Topic, Article,
} from '../services/ctfApi';
import NovelRenderer from './NovelRenderer';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import ConfirmModal from './ConfirmModal';

// ─── Shared Helpers ───────────────────────────────────────────────────────────

const getRoleColors = (role: string, isLight: boolean): string => {
  const colors = {
    admin: isLight 
      ? 'text-yellow-700 bg-yellow-100 border-yellow-300'
      : 'text-yellow-400 bg-yellow-900/30 border-yellow-700/40',
    author: isLight
      ? 'text-cyan-700 bg-cyan-100 border-cyan-300'
      : 'text-cyan-400 bg-cyan-900/30 border-cyan-700/40',
    student: isLight
      ? 'text-gray-700 bg-gray-100 border-gray-300'
      : 'text-gray-400 bg-gray-800/60 border-gray-700',
  };
  return colors[role as keyof typeof colors] || colors.student;
};

const getStatusColors = (status: string, isLight: boolean): string => {
  const colors = {
    draft: isLight
      ? 'text-gray-700 bg-gray-100 border-gray-300'
      : 'text-gray-400 bg-gray-800/60 border-gray-700',
    pending: isLight
      ? 'text-yellow-700 bg-yellow-100 border-yellow-300'
      : 'text-yellow-400 bg-yellow-900/30 border-yellow-700/40',
    approved: isLight
      ? 'text-indigo-700 bg-indigo-100 border-indigo-300'
      : 'text-indigo-400 bg-indigo-900/30 border-indigo-700/40',
    published: isLight
      ? 'text-cyan-700 bg-cyan-100 border-cyan-300'
      : 'text-cyan-400 bg-cyan-900/30 border-cyan-700/40',
    rejected: isLight
      ? 'text-red-700 bg-red-100 border-red-300'
      : 'text-red-400 bg-red-900/30 border-red-700/40',
  };
  return colors[status as keyof typeof colors] || colors.draft;
};

const getTypeColors = (type: string, isLight: boolean): string => {
  const colors = {
    blog: isLight
      ? 'text-emerald-700 bg-emerald-100 border-emerald-300'
      : 'text-emerald-400 bg-emerald-900/30 border-emerald-700/40',
    ctf: isLight
      ? 'text-cyan-700 bg-cyan-100 border-cyan-300'
      : 'text-cyan-400 bg-cyan-900/30 border-cyan-700/40',
    experiment: isLight
      ? 'text-purple-700 bg-purple-100 border-purple-300'
      : 'text-purple-400 bg-purple-900/30 border-purple-700/40',
  };
  return colors[type as keyof typeof colors] || colors.ctf;
};

const Badge: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
    {label}
  </span>
);

// ─── Panel: Users ─────────────────────────────────────────────────────────────

const UsersPanel: React.FC = () => {
  const toast = useToast();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [users, setUsers] = useState<DbUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { const { users } = await adminGetUsers(); setUsers(users); }
    catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRoleChange = async (uid: string, role: string) => {
    setUpdatingId(uid);
    try {
      await adminSetUserRole(uid, role);
      await load();
      toast.success(`Role updated to "${role}".`);
    } catch (err: any) { toast.error(err.message); }
    finally { setUpdatingId(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-500" /> User Management
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage roles for all registered users</p>
        </div>
        <button onClick={load} className={`p-2.5 transition-all rounded-xl border ${
          isLight 
            ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-gray-200' 
            : 'text-gray-400 hover:text-white hover:bg-gray-800 border-gray-800'
        }`} title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className={`rounded-2xl border overflow-hidden overflow-x-auto ${
          isLight ? 'border-gray-200' : 'border-gray-800'
        }`}>
          <div className="min-w-[580px]">
          {/* Table header */}
          <div className={`grid grid-cols-[1fr_180px_160px_40px] gap-4 px-5 py-2.5 border-b text-xs font-semibold uppercase tracking-widest ${
            isLight 
              ? 'bg-gray-50 border-gray-200 text-gray-600' 
              : 'bg-gray-900/80 border-gray-800 text-gray-500'
          }`}>
            <span>User</span>
            <span>Current Role</span>
            <span>Change Role</span>
            <span />
          </div>
          {users.map((u, i) => (
            <div
              key={u.uid}
              className={`grid grid-cols-[1fr_180px_160px_40px] gap-4 items-center px-5 py-3.5 transition-colors ${
                isLight
                  ? `${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`
                  : `${i % 2 === 0 ? 'bg-gray-900/40' : 'bg-gray-900/20'} hover:bg-gray-800/40`
              }`}
            >
              <div className="min-w-0">
                <p className={`font-medium truncate ${
                  isLight ? 'text-gray-900' : 'text-white'
                }`}>{u.displayName || '(no name)'}</p>
                <p className={`text-xs truncate ${
                  isLight ? 'text-gray-600' : 'text-gray-500'
                }`}>{u.email}</p>
              </div>
              <div>
                <Badge label={u.role} color={getRoleColors(u.role, isLight)} />
              </div>
              <div>
                <select
                  value={u.role}
                  disabled={updatingId === u.uid}
                  onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                  className={`w-full rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 disabled:opacity-50 border ${
                    isLight 
                      ? 'bg-white border-gray-200 text-gray-900' 
                      : 'bg-gray-800 border-gray-700 text-white'
                  }`}
                >
                  <option value="student">student</option>
                  <option value="author">author</option>
                  <option value="admin">admin</option>
                </select>
              </div>
              <div className="flex justify-center">
                {updatingId === u.uid && <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />}
              </div>
            </div>
          ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Panel: Topics ────────────────────────────────────────────────────────────

const TopicsPanel: React.FC = () => {
  const toast = useToast();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  // Topic type filter (persisted to localStorage)
  const [activeTopicType, setActiveTopicType] = useState<CMSType>(() => {
    try {
      const saved = localStorage.getItem('adminTopicType');
      return (saved === 'blog' || saved === 'ctf') ? saved : 'blog';
    } catch { return 'blog'; }
  });

  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [form, setForm] = useState({ title: '', description: '', type: 'ctf' as 'ctf' | 'blog' | 'experiment' });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string; articleCount: number } | null>(null);

  // Persist topic type to localStorage
  useEffect(() => {
    try { localStorage.setItem('adminTopicType', activeTopicType); } catch {}
  }, [activeTopicType]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { const { topics } = await adminGetTopics(); setTopics(topics); }
    catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    const cmsConfig = CMS_TYPES.find(c => c.id === activeTopicType);
    setForm({ title: '', description: '', type: cmsConfig?.apiValue as any || 'ctf' });
    setEditingTopic(null);
    setShowForm(true);
  };
  const openEdit = (t: Topic) => { setForm({ title: t.title, description: t.description ?? '', type: t.type ?? 'ctf' }); setEditingTopic(t); setShowForm(true); };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editingTopic) {
        await adminUpdateTopic(editingTopic._id, { title: form.title, description: form.description, type: form.type });
        toast.success('Topic updated.');
      } else {
        await adminCreateTopic({ title: form.title, description: form.description, type: form.type });
        toast.success('Topic created.');
      }
      setShowForm(false);
      await load();
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string, topicTitle: string) => {
    try {
      const { articles } = await adminGetArticles({ topicId: id });
      const articleCount = articles.length;
      setDeleteConfirm({ id, title: topicTitle, articleCount });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setDeletingId(deleteConfirm.id);
    try {
      await adminDeleteTopic(deleteConfirm.id);
      await load();
      toast.success('Topic deleted.');
      setDeleteConfirm(null);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const moveOrder = async (topic: Topic, direction: 'up' | 'down') => {
    const delta = direction === 'up' ? -1.5 : 1.5;
    try { await adminUpdateTopic(topic._id, { order: topic.order + delta }); await load(); }
    catch (err: any) { toast.error(err.message); }
  };

  // Filter topics by active type
  const filteredTopics = topics.filter((t) => {
    const cmsConfig = CMS_TYPES.find(c => c.id === activeTopicType);
    return t.type === cmsConfig?.apiValue;
  });

  return (
    <div className="space-y-4">
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Topic?"
        message={
          deleteConfirm
            ? deleteConfirm.articleCount > 0
              ? `Are you sure you want to delete "${deleteConfirm.title}"?\n\nThis will delete ${deleteConfirm.articleCount} article${deleteConfirm.articleCount === 1 ? '' : 's'}.`
              : `Are you sure you want to delete "${deleteConfirm.title}"?`
            : ''
        }
        confirmText="Delete"
        variant="danger"
        isLoading={!!deletingId}
      />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Hash className="w-5 h-5 text-cyan-500" /> Topic Management
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Organise content categories and their display order</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className={`p-2.5 transition-all rounded-xl border ${
            isLight 
              ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-gray-200' 
              : 'text-gray-400 hover:text-white hover:bg-gray-800 border-gray-800'
          }`} title="Refresh"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-cyan-900/30">
            <Plus className="w-4 h-4" /> New Topic
          </button>
        </div>
      </div>

      {/* Topic Type Switcher */}
      <div className="flex items-center gap-2 pb-3 border-b border-gray-800">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-600">Topic Type:</span>
        {CMS_TYPES.map((cms) => (
          <button
            key={cms.id}
            onClick={() => setActiveTopicType(cms.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTopicType === cms.id
                ? 'bg-cyan-900/30 text-cyan-300 border border-cyan-500/40'
                : 'bg-gray-800/60 text-gray-400 border border-gray-700 hover:text-white hover:border-gray-600'
            }`}
          >
            {cms.label}
          </button>
        ))}
      </div>

      {/* Create/Edit form */}
      {showForm && (
        <div className={`border rounded-2xl p-5 space-y-4 ${
          isLight ? 'border-cyan-200 bg-cyan-50' : 'bg-gray-900 border-cyan-500/30'
        }`}>
          <h3 className={`font-semibold ${
            isLight ? 'text-gray-900' : 'text-white'
          }`}>{editingTopic ? 'Edit Topic' : 'New Topic'}</h3>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Topic title (e.g. XSS, SQL Injection)"
            className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 border ${
              isLight 
                ? 'bg-white border-gray-200 text-gray-900' 
                : 'bg-gray-800 border-gray-700 text-white'
            }`}
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Short description (optional)"
            rows={2}
            className={`w-full rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50 border ${
              isLight 
                ? 'bg-white border-gray-200 text-gray-900' 
                : 'bg-gray-800 border-gray-700 text-white'
            }`}
          />
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Section type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as 'ctf' | 'blog' | 'experiment' })}
              className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 border ${
                isLight 
                  ? 'bg-white border-gray-200 text-gray-900' 
                  : 'bg-gray-800 border-gray-700 text-white'
              }`}
              disabled={!!editingTopic}
            >
              <option value="ctf">CTF Writeup</option>
              <option value="blog">Blog</option>
              <option value="experiment">Experiment</option>
            </select>
            {editingTopic && (
              <p className="text-xs text-gray-600 mt-1">Type cannot be changed after creation</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !form.title.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => setShowForm(false)} className={`px-4 py-2 rounded-xl text-sm transition-colors border ${
              isLight 
                ? 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700' 
                : 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-white'
            }`}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? <LoadingSpinner /> : filteredTopics.length === 0 ? (
        <div className="text-center py-16">
          <Hash className="w-12 h-12 text-gray-700 mx-auto mb-3 opacity-50" />
          <p className="text-gray-600 mb-4">
            No {CMS_TYPES.find(c => c.id === activeTopicType)?.label} topics yet.
          </p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-400 rounded-xl text-sm font-semibold transition-all"
          >
            <Plus className="w-4 h-4" /> Create your first topic
          </button>
        </div>
      ) : (
        <div className={`rounded-2xl border overflow-hidden overflow-x-auto ${
          isLight ? 'border-gray-200' : 'border-gray-800'
        }`}>
          <div className="min-w-[640px]">
          {/* Table header */}
          <div className={`grid grid-cols-[44px_1fr_120px_2fr_100px] gap-4 px-5 py-2.5 border-b text-xs font-semibold uppercase tracking-widest ${
            isLight 
              ? 'bg-gray-50 border-gray-200 text-gray-600' 
              : 'bg-gray-900/80 border-gray-800 text-gray-500'
          }`}>
            <span>Order</span>
            <span>Title</span>
            <span>Type</span>
            <span>Description</span>
            <span className="text-right">Actions</span>
          </div>
          {filteredTopics.map((t, idx) => (
            <div
              key={t._id}
              className={`grid grid-cols-[44px_1fr_120px_2fr_100px] gap-4 items-center px-5 py-3.5 transition-colors ${
                isLight
                  ? 'bg-white hover:bg-gray-50'
                  : `${idx % 2 === 0 ? 'bg-gray-900/40' : 'bg-gray-900/20'} hover:bg-gray-800/40`
              }`}
            >
              <div className="flex flex-col gap-0.5">
                <button disabled={idx === 0} onClick={() => moveOrder(t, 'up')} className={`transition-colors disabled:opacity-20 ${
                  isLight ? 'text-gray-500 hover:text-gray-900' : 'text-gray-600 hover:text-white'
                }`} title="Move up"><ChevronUp className="w-3.5 h-3.5" /></button>
                <button disabled={idx === filteredTopics.length - 1} onClick={() => moveOrder(t, 'down')} className={`transition-colors disabled:opacity-20 ${
                  isLight ? 'text-gray-500 hover:text-gray-900' : 'text-gray-600 hover:text-white'
                }`} title="Move down"><ChevronDown className="w-3.5 h-3.5" /></button>
              </div>
              <p className={`font-medium ${
                isLight ? 'text-gray-900' : 'text-white'
              }`}>{t.title}</p>
              <div className="flex items-center">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTypeColors(t.type ?? 'ctf', isLight)}`}>
                  {t.type ?? 'ctf'}
                </span>
              </div>
              <p className={`text-xs truncate min-w-0 ${
                isLight ? 'text-gray-600' : 'text-gray-500'
              }`}>{t.description || '—'}</p>
              <div className="flex items-center gap-1 justify-end">
                <button onClick={() => openEdit(t)} className={`p-2 rounded-lg transition-colors ${
                  isLight 
                    ? 'text-gray-500 hover:text-cyan-600 hover:bg-gray-100' 
                    : 'text-gray-400 hover:text-cyan-400 hover:bg-gray-800'
                }`} title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(t._id, t.title)} disabled={deletingId === t._id} className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                  isLight
                    ? 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                    : 'text-gray-400 hover:text-red-400 hover:bg-red-900/20'
                }`} title="Delete">
                  {deletingId === t._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Panel: Articles Review ───────────────────────────────────────────────────

const ArticlePreviewModal: React.FC<{ article: Article; onClose: () => void }> = ({ article, onClose }) => (
  <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-gray-950 border border-gray-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <h2 className="font-bold text-white truncate">{article.title}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const previewUrl = new URL('/admin/article-preview', window.location.origin);
              localStorage.setItem('admin-article-preview', JSON.stringify(article));
              window.open(previewUrl.toString(), '_blank', 'noopener,noreferrer');
            }}
            className="p-1.5 text-cyan-400 hover:text-white hover:bg-cyan-800 rounded-lg transition-colors"
            title="Open in new tab"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3h7m0 0v7m0-7L10 14m-7 7h7a2 2 0 002-2v-7" /></svg>
          </button>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6" data-color-mode="dark">
        <NovelRenderer
          content={article.content}
          contentType={(article as any).contentType ?? 'markdown'}
        />
      </div>
    </div>
  </div>
);

// Time-range helpers
const TIME_RANGES = [
  { label: 'All time',    value: '' },
  { label: 'Today',       value: 'today' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days',value: '30d' },
  { label: 'Last 90 days',value: '90d' },
];

function inRange(dateStr: string, range: string): boolean {
  if (!range) return true;
  const now = Date.now();
  const d = new Date(dateStr).getTime();
  if (range === 'today') {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    return d >= start.getTime();
  }
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  return d >= now - days * 24 * 60 * 60 * 1000;
}

// ─── CMS Type Configuration ──────────────────────────────────────────────────

type CMSType = 'blog' | 'ctf';

const CMS_TYPES: { id: CMSType; label: string; apiValue: string }[] = [
  { id: 'blog', label: 'Blog', apiValue: 'blog' },
  { id: 'ctf', label: 'CTF Writeups', apiValue: 'ctf' },
];

const TYPE_COLORS: Record<string, string> = {
  blog: 'text-emerald-400 bg-emerald-900/30 border-emerald-700/40',
  ctf: 'text-cyan-400 bg-cyan-900/30 border-cyan-700/40',
  experiment: 'text-purple-400 bg-purple-900/30 border-purple-700/40',
};

// ─── Panel: Content (Multi-CMS) ───────────────────────────────────────────────

const ContentPanel: React.FC = () => {
  const toast = useToast();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  // CMS type state (persisted to localStorage)
  const [activeCMS, setActiveCMS] = useState<CMSType>(() => {
    try {
      const saved = localStorage.getItem('adminContentType');
      return (saved === 'blog' || saved === 'ctf') ? saved : 'blog';
    } catch { return 'blog'; }
  });

  const [articles, setArticles] = useState<Article[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [topicFilter, setTopicFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectForm, setRejectForm] = useState<{ id: string; reason: string } | null>(null);
  const [changeCatForm, setChangeCatForm] = useState<{ id: string; topicType: string; newTopicId: string } | null>(null);
  const [changingCat, setChangingCat] = useState(false);
  const [pendingCounts, setPendingCounts] = useState<Record<CMSType, number>>({ blog: 0, ctf: 0 });
  const [unpublishConfirm, setUnpublishConfirm] = useState<string | null>(null);

  // Persist CMS type to localStorage
  useEffect(() => {
    try { localStorage.setItem('adminContentType', activeCMS); } catch {}
  }, [activeCMS]);

  // Load topics once for the filter dropdown
  useEffect(() => {
    adminGetTopics().then(({ topics }) => setTopics(topics)).catch(() => {});
  }, []);

  // Load pending counts for all CMS types
  const loadPendingCounts = useCallback(async () => {
    try {
      const counts: Record<CMSType, number> = { blog: 0, ctf: 0 };
      for (const cms of CMS_TYPES) {
        const { articles } = await adminGetArticles({ status: 'pending', topicType: cms.apiValue });
        counts[cms.id] = articles.length;
      }
      setPendingCounts(counts);
    } catch {}
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cmsConfig = CMS_TYPES.find(c => c.id === activeCMS);
      const { articles } = await adminGetArticles({
        status: statusFilter || undefined,
        topicId: topicFilter || undefined,
        topicType: cmsConfig?.apiValue || undefined,
      });
      setArticles(articles);
      await loadPendingCounts();
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  }, [statusFilter, topicFilter, activeCMS, loadPendingCounts]);

  // Client-side filters: time + search
  const visibleArticles = articles
    .filter((a) => !timeFilter || inRange(a.updatedAt, timeFilter))
    .filter((a) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const topicTitle = typeof a.topicId === 'object' ? (a.topicId as any).title?.toLowerCase() : '';
      return (
        a.title.toLowerCase().includes(q) ||
        a.authorName.toLowerCase().includes(q) ||
        topicTitle.includes(q)
      );
    });

  // Calculate metrics for current CMS type
  const metrics = {
    total: articles.length,
    pending: articles.filter(a => a.status === 'pending').length,
    published: articles.filter(a => a.status === 'published').length,
  };

  useEffect(() => { load(); }, [load]);

  const handleStatus = async (id: string, status: string, rejectionReason?: string) => {
    setActionId(id);
    try {
      await adminSetArticleStatus(id, status, rejectionReason);
      const msg =
        status === 'approved' ? 'Article approved and published.' :
        status === 'pending'  ? 'Article unpublished and set to pending.' :
        `Article ${status}.`;
      if (status === 'pending') {
        toast.warning(msg);
      } else {
        toast.success(msg);
      }
      await load();
    } catch (err: any) { toast.error(err.message); }
    finally { setActionId(null); setRejectForm(null); }
  };

  const moveOrder = async (article: Article, dir: 'up' | 'down') => {
    const delta = dir === 'up' ? -1.5 : 1.5;
    try { await adminSetArticleOrder(article._id, article.order + delta); await load(); }
    catch (err: any) { toast.error(err.message); }
  };

  const handleChangeCat = async () => {
    if (!changeCatForm || !changeCatForm.newTopicId) return;
    setChangingCat(true);
    try {
      await adminUpdateArticleTopic(changeCatForm.id, changeCatForm.newTopicId);
      toast.success('Category updated.');
      setChangeCatForm(null);
      await load();
    } catch (err: any) { toast.error(err.message); }
    finally { setChangingCat(false); }
  };

  return (
    <div className="space-y-4">
      {previewArticle && <ArticlePreviewModal article={previewArticle} onClose={() => setPreviewArticle(null)} />}
      
      <ConfirmModal
        isOpen={!!unpublishConfirm}
        onClose={() => setUnpublishConfirm(null)}
        onConfirm={() => {
          if (unpublishConfirm) {
            handleStatus(unpublishConfirm, 'pending');
            setUnpublishConfirm(null);
          }
        }}
        title="Unpublish Article?"
        message="Are you sure you want to unpublish this article? It will be moved back to pending status and removed from public view."
        confirmText="Unpublish"
        variant="warning"
        isLoading={!!actionId}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-500" /> Content Management
            {!loading && (
              <span className="text-sm font-normal text-gray-500">
                — {visibleArticles.length}{timeFilter || topicFilter || searchQuery ? ` of ${articles.length}` : ''} articles
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Review, approve, and publish content across all CMS types</p>
        </div>
      </div>

      {/* CMS Type Switcher */}
      <div className="flex items-center gap-2 pb-3 border-b border-gray-800">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-600">Content Type:</span>
        {CMS_TYPES.map((cms) => (
          <button
            key={cms.id}
            onClick={() => { setActiveCMS(cms.id); setTopicFilter(''); setSearchQuery(''); }}
            className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeCMS === cms.id
                ? 'bg-cyan-900/30 text-cyan-300 border border-cyan-500/40'
                : 'bg-gray-800/60 text-gray-400 border border-gray-700 hover:text-white hover:border-gray-600'
            }`}
          >
            {cms.label}
            {pendingCounts[cms.id] > 0 && (
              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeCMS === cms.id
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'bg-yellow-900/30 text-yellow-500/70'
              }`}>
                {pendingCounts[cms.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Metrics Row */}
      {!loading && articles.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-3">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Articles</div>
            <div className="text-2xl font-bold text-white">{metrics.total}</div>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-xl px-4 py-3">
            <div className="text-xs text-yellow-500/70 uppercase tracking-wider mb-1">Pending Review</div>
            <div className="text-2xl font-bold text-yellow-400">{metrics.pending}</div>
          </div>
          <div className="bg-cyan-900/20 border border-cyan-700/40 rounded-xl px-4 py-3">
            <div className="text-xs text-cyan-500/70 uppercase tracking-wider mb-1">Published</div>
            <div className="text-2xl font-bold text-cyan-400">{metrics.published}</div>
          </div>
        </div>
      )}

      {/* Filters & Search Row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Global Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search content, author, or topic..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 placeholder:text-gray-600"
          />
        </div>
        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
        >
          <option value="">All status</option>
          <option value="pending">Pending</option>
          <option value="published">Published</option>
          <option value="rejected">Rejected</option>
          <option value="draft">Draft</option>
        </select>

        {/* Topic Filter */}
        <select
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
        >
          <option value="">All topics</option>
          {topics
            .filter((t) => {
              const cmsConfig = CMS_TYPES.find(c => c.id === activeCMS);
              return t.type === cmsConfig?.apiValue;
            })
            .map((t) => (
            <option key={t._id} value={t._id}>{t.title}</option>
          ))}
        </select>

        {/* Time Range Filter */}
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
        >
          {TIME_RANGES.map(({ label, value }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        {/* Refresh Button */}
        <button onClick={load} className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800 rounded-xl transition-all" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? <LoadingSpinner /> : visibleArticles.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-gray-700 mx-auto mb-3 opacity-50" />
          <p className="text-gray-600">
            {articles.length === 0
              ? `No ${CMS_TYPES.find(c => c.id === activeCMS)?.label} articles in this state.`
              : 'No articles match the selected filters.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 text-sm text-cyan-500 hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {visibleArticles.map((a, idx) => {
            const topicTitle = typeof a.topicId === 'object' ? (a.topicId as any).title : '—';
            const canReorder = a.status === 'published';

            return (
              <div key={a._id} className="group bg-gray-900/80 border border-gray-800 hover:border-gray-700 rounded-2xl px-5 py-4 space-y-3 transition-all">
                <div className="flex items-start gap-4">
                  {/* Order controls (published only) */}
                  {canReorder && (
                    <div className="flex flex-col gap-0.5 mt-0.5 opacity-50 group-hover:opacity-100 transition-opacity">
                      <button disabled={idx === 0} onClick={() => moveOrder(a, 'up')} className="text-gray-600 hover:text-white disabled:opacity-20"><ChevronUp className="w-3.5 h-3.5" /></button>
                      <button disabled={idx === visibleArticles.length - 1} onClick={() => moveOrder(a, 'down')} className="text-gray-600 hover:text-white disabled:opacity-20"><ChevronDown className="w-3.5 h-3.5" /></button>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                      <h3 className="font-semibold text-white">{a.title}</h3>
                      <Badge label={a.status} color={getStatusColors(a.status, isLight)} />
                      {typeof a.topicId === 'object' && (a.topicId as any).type && (
                        <Badge
                          label={(a.topicId as any).type}
                          color={getTypeColors((a.topicId as any).type, isLight)}
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-5 text-xs text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <UserCog className="w-3 h-3" />
                        <span className="text-gray-300 font-medium">{a.authorName}</span>
                      </span>
                      <span>Topic: <span className="text-gray-400">{topicTitle}</span></span>
                      <span>{new Date(a.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    {a.rejectionReason && (
                      <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                        <X className="w-3 h-3" /> {a.rejectionReason}
                      </p>
                    )}
                  </div>

                  {/* Preview */}
                  <button
                    onClick={() => setPreviewArticle(a)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors flex-shrink-0 opacity-70 group-hover:opacity-100"
                  >
                    <Eye className="w-3 h-3" /> Preview
                  </button>
                </div>

                {/* Action buttons based on current status */}
                <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-800">
                  {a.status === 'pending' && (
                    <>
                      <ActionButton
                        label="Approve & Publish"
                        color="text-cyan-400 border-cyan-700/40 hover:bg-cyan-900/20"
                        icon={<BookOpen className="w-3 h-3" />}
                        loading={actionId === a._id}
                        onClick={() => handleStatus(a._id, 'approved')}
                      />
                      <ActionButton
                        label="Reject"
                        color="text-red-400 border-red-700/40 hover:bg-red-900/20"
                        icon={<X className="w-3 h-3" />}
                        loading={false}
                        onClick={() => setRejectForm({ id: a._id, reason: '' })}
                      />
                    </>
                  )}
                  {a.status === 'published' && (
                    <ActionButton
                      label="Unpublish"
                      color="text-yellow-400 border-yellow-700/40 hover:bg-yellow-900/20"
                      icon={<X className="w-3 h-3" />}
                      loading={actionId === a._id}
                      onClick={() => setUnpublishConfirm(a._id)}
                    />
                  )}
                  {(a.status === 'rejected' || a.status === 'approved') && (
                    <ActionButton
                      label="Set Pending"
                      color="text-gray-400 border-gray-700 hover:bg-gray-800"
                      icon={<UserCog className="w-3 h-3" />}
                      loading={actionId === a._id}
                      onClick={() => handleStatus(a._id, 'pending')}
                    />
                  )}
                  {/* Change Category — always available for admin */}
                  <ActionButton
                    label="Change Category"
                    color="text-purple-400 border-purple-700/40 hover:bg-purple-900/20"
                    icon={<Hash className="w-3 h-3" />}
                    loading={false}
                    onClick={() => {
                      const currentType = typeof a.topicId === 'object' ? (a.topicId as any).type : '';
                      setChangeCatForm({ id: a._id, topicType: currentType, newTopicId: '' });
                      setRejectForm(null);
                    }}
                  />
                </div>

                {/* Rejection reason input */}
                {rejectForm?.id === a._id && (
                  <div className="flex gap-2 items-end mt-2">
                    <div className="flex-1">
                      <input
                        value={rejectForm.reason}
                        onChange={(e) => setRejectForm({ ...rejectForm, reason: e.target.value })}
                        placeholder="Reason for rejection (optional)…"
                        className="w-full bg-gray-800 border border-red-700/40 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={() => handleStatus(a._id, 'rejected', rejectForm.reason)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-xl text-sm font-semibold transition-colors"
                    >
                      {actionId === a._id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Reject'}
                    </button>
                    <button onClick={() => setRejectForm(null)} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm">Cancel</button>
                  </div>
                )}

                {/* Change category inline form */}
                {changeCatForm?.id === a._id && (
                  <div className="flex gap-2 items-center mt-2">
                    <select
                      value={changeCatForm.newTopicId}
                      onChange={(e) => setChangeCatForm({ ...changeCatForm, newTopicId: e.target.value })}
                      className="flex-1 bg-gray-800 border border-purple-700/40 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    >
                      <option value="">— Select new category —</option>
                      {topics
                        .filter((t) => {
                          const cmsConfig = CMS_TYPES.find(c => c.id === activeCMS);
                          return t.type === cmsConfig?.apiValue;
                        })
                        .map((t) => (
                          <option key={t._id} value={t._id}>{t.title}</option>
                        ))}
                    </select>
                    <button
                      onClick={handleChangeCat}
                      disabled={changingCat || !changeCatForm.newTopicId}
                      className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      {changingCat ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      {changingCat ? 'Saving…' : 'Move'}
                    </button>
                    <button onClick={() => setChangeCatForm(null)} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm">Cancel</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Small shared components ──────────────────────────────────────────────────

const ActionButton: React.FC<{
  label: string; color: string; icon: React.ReactNode;
  loading: boolean; onClick: () => void;
}> = ({ label, color, icon, loading, onClick }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-lg transition-colors disabled:opacity-50 ${color}`}
  >
    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : icon}{label}
  </button>
);

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-cyan-500" /></div>
);

// ─── Main AdminDashboard ──────────────────────────────────────────────────────

type AdminTab = 'users' | 'topics' | 'content';

const TABS: { id: AdminTab; label: string; icon: React.FC<any> }[] = [
  { id: 'content', label: 'Content', icon: Layers },
  { id: 'topics', label: 'Topics',   icon: Hash },
  { id: 'users',  label: 'Users',    icon: Users },
];

const AdminDashboard: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [tab, setTab] = useState<AdminTab>('content');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <ShieldCheck className="w-5 h-5 text-yellow-400" />
        </div>
        <div>
          <h1 className={`text-2xl font-bold ${
            isLight ? 'text-gray-900' : 'text-white'
          }`}>Admin Dashboard</h1>
          <p className={`text-sm mt-0.5 ${
            isLight ? 'text-gray-600' : 'text-gray-500'
          }`}>Manage users, topics, and content submissions</p>
        </div>
      </div>

      {/* Underline tab bar */}
      <div className={`border-b ${
        isLight ? 'border-gray-200' : 'border-gray-800'
      }`}>
        <div className="flex gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`relative flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all ${
                tab === id 
                  ? (isLight ? 'text-cyan-600' : 'text-cyan-400') 
                  : (isLight ? 'text-gray-600 hover:text-gray-800' : 'text-gray-500 hover:text-gray-300')
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {tab === id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Panel */}
      <div>
        {tab === 'users'   && <UsersPanel />}
        {tab === 'topics'  && <TopicsPanel />}
        {tab === 'content' && <ContentPanel />}
      </div>
    </div>
  );
};

export default AdminDashboard;
