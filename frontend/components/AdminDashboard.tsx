import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Hash, FileText, ShieldCheck, Loader2, AlertCircle,
  Plus, Trash2, Edit2, Check, X, ChevronUp, ChevronDown,
  RefreshCw, Eye, BookOpen, UserCog, Search, Layers,
  Flag, Trophy, Tag as TagIcon, MonitorPlay, ListVideo
} from 'lucide-react';
import {
  adminGetUsers, adminSetUserRole,
  adminGetTopics, adminCreateTopic, adminUpdateTopic, adminDeleteTopic,
  adminGetArticles, adminSetArticleStatus, adminSetArticleOrder, adminUpdateArticleTopic,
  adminGetVideos, adminSetVideoStatus,
  DbUser, Topic, Article, Video,
} from '../services/ctfApi';
import {
  adminGetWriteups, adminSetWriteupStatus, adminDeleteWriteup, Writeup
} from '../services/writeupApi';
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
    writeups: isLight
      ? 'text-indigo-700 bg-indigo-100 border-indigo-300'
      : 'text-indigo-400 bg-indigo-900/30 border-indigo-700/40',
    experiment: isLight
      ? 'text-purple-700 bg-purple-100 border-purple-300'
      : 'text-purple-400 bg-purple-900/30 border-purple-700/40',
  };
  return colors[type as keyof typeof colors] || colors.ctf;
};

const getVideoCategoryColors = (category: string, isLight: boolean): string => {
  const colors = {
    tutorial: isLight
      ? 'text-cyan-700 bg-cyan-100 border-cyan-300'
      : 'text-cyan-400 bg-cyan-900/30 border-cyan-700/40',
    reel: isLight
      ? 'text-amber-700 bg-amber-100 border-amber-300'
      : 'text-amber-400 bg-amber-900/30 border-amber-700/40',
  };
  return colors[category.toLowerCase() as keyof typeof colors] || (isLight ? 'text-gray-700 bg-gray-100 border-gray-300' : 'text-gray-400 bg-gray-800/60 border-gray-700');
};

const Badge: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border inline-block w-max ${color}`}>
    {label}
  </span>
);

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

// ─── CMS Configuration ──────────────────────────────────────────────────────

type CMSType = 'blog' | 'ctf' | 'writeups';

const CMS_TYPES: { id: CMSType; label: string; apiValue: 'blog' | 'ctf' | 'writeup' }[] = [
  { id: 'blog', label: 'Blog', apiValue: 'blog' },
  { id: 'ctf', label: 'CTF Guides', apiValue: 'ctf' },
  { id: 'writeups', label: 'CTF Writeups', apiValue: 'writeup' },
];

// ─── Panel: Topics ────────────────────────────────────────────────────────────

const TopicsPanel: React.FC = () => {
  const toast = useToast();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [activeTopicType, setActiveTopicType] = useState<CMSType>(() => {
    try {
      const saved = localStorage.getItem('adminTopicType');
      return (saved === 'blog' || saved === 'ctf' || saved === 'writeups') ? (saved as CMSType) : 'blog';
    } catch { return 'blog'; }
  });

  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [form, setForm] = useState({ title: '', description: '', type: 'writeup' as 'ctf' | 'blog' | 'experiment' | 'writeup' });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string; articleCount: number } | null>(null);

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
    } catch (err: any) { toast.error(err.message); }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setDeletingId(deleteConfirm.id);
    try {
      await adminDeleteTopic(deleteConfirm.id);
      await load();
      toast.success('Topic deleted.');
      setDeleteConfirm(null);
    } catch (err: any) { toast.error(err.message); }
    finally { setDeletingId(null); }
  };

  const moveOrder = async (topic: Topic, direction: 'up' | 'down') => {
    const delta = direction === 'up' ? -1.5 : 1.5;
    try { await adminUpdateTopic(topic._id, { order: topic.order + delta }); await load(); }
    catch (err: any) { toast.error(err.message); }
  };

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
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Hash className="w-5 h-5 text-cyan-500" /> Topic Management
        </h2>
        <div className="flex gap-2">
          <button onClick={load} className="p-2.5 transition-all rounded-xl border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-sm font-semibold transition-colors"><Plus className="w-4 h-4" /> New Topic</button>
        </div>
      </div>

      <div className="flex items-center gap-2 pb-3 border-b border-gray-800">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-600">Type:</span>
        {CMS_TYPES.map((cms) => (
          <button
            key={cms.id}
            onClick={() => setActiveTopicType(cms.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTopicType === cms.id ? 'bg-cyan-900/30 text-cyan-300 border border-cyan-500/40' : 'bg-gray-800/60 text-gray-400 border border-gray-700'
            }`}
          >
            {cms.label}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="border rounded-2xl p-5 space-y-4 bg-gray-900 border-cyan-500/30">
          <h3 className="font-semibold text-white">{editingTopic ? 'Edit Topic' : 'New Topic'}</h3>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Topic title" className="w-full rounded-xl px-4 py-2.5 text-sm bg-gray-800 border border-gray-700 text-white" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className="w-full rounded-xl px-4 py-2.5 text-sm bg-gray-800 border border-gray-700 text-white resize-none" />
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Section type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })} className="w-full rounded-xl px-4 py-2.5 text-sm bg-gray-800 border border-gray-700 text-white" disabled={!!editingTopic}>
              <option value="ctf">CTF Guide</option>
              <option value="blog">Blog</option>
              <option value="writeup">Writeup Category</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving || !form.title.trim()} className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm bg-gray-800 border border-gray-700 text-white">Cancel</button>
          </div>
        </div>
      )}

      {loading ? <LoadingSpinner /> : filteredTopics.length === 0 ? (
        <div className="text-center py-16 opacity-50"><p>No topics yet.</p></div>
      ) : (
        <div className="rounded-2xl border border-gray-800 overflow-hidden overflow-x-auto">
          <div className="min-w-[640px]">
            <div className="grid grid-cols-[44px_1fr_120px_2fr_100px] gap-4 px-5 py-2.5 border-b bg-gray-900/80 border-gray-800 text-xs font-semibold uppercase tracking-widest text-gray-500">
              <span>Order</span><span>Title</span><span>Type</span><span>Description</span><span className="text-right">Actions</span>
            </div>
            {filteredTopics.map((t, idx) => (
              <div key={t._id} className={`grid grid-cols-[44px_1fr_120px_2fr_100px] gap-4 items-center px-5 py-3.5 transition-colors ${idx % 2 === 0 ? 'bg-gray-900/40' : 'bg-gray-900/20'} hover:bg-gray-800/40`}>
                <div className="flex flex-col gap-0.5">
                  <button disabled={idx === 0} onClick={() => moveOrder(t, 'up')} className="text-gray-600 hover:text-white disabled:opacity-20"><ChevronUp className="w-3.5 h-3.5" /></button>
                  <button disabled={idx === filteredTopics.length - 1} onClick={() => moveOrder(t, 'down')} className="text-gray-600 hover:text-white disabled:opacity-20"><ChevronDown className="w-3.5 h-3.5" /></button>
                </div>
                <p className="font-medium text-white">{t.title}</p>
                <div><Badge label={t.type ?? 'ctf'} color={getTypeColors(t.type ?? 'ctf', false)} /></div>
                <p className="text-xs text-gray-500 truncate">{t.description || '—'}</p>
                <div className="flex items-center gap-1 justify-end">
                  <button onClick={() => openEdit(t)} className="p-2 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-gray-800"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(t._id, t.title)} disabled={deletingId === t._id} className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-900/20">{deletingId === t._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Panel: Content Review ────────────────────────────────────────────────────

const ArticlePreviewModal: React.FC<{ article: any; onClose: () => void }> = ({ article, onClose }) => (
  <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-gray-950 border border-gray-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <h2 className="font-bold text-white truncate">{article.title}</h2>
        <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-6" data-color-mode="dark">
        <NovelRenderer content={article.content} contentType={article.contentType ?? 'markdown'} />
      </div>
    </div>
  </div>
);

const TIME_RANGES = [
  { label: 'All time',    value: '' },
  { label: 'Today',       value: 'today' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days',value: '30d' },
];

function inRange(dateStr: string, range: string): boolean {
  if (!range) return true;
  const now = Date.now();
  const d = new Date(dateStr).getTime();
  if (range === 'today') {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    return d >= start.getTime();
  }
  const days = range === '7d' ? 7 : 30;
  return d >= now - days * 24 * 60 * 60 * 1000;
}

// ─── Panel: Content (Multi-CMS) ───────────────────────────────────────────────

const ContentPanel: React.FC = () => {
  const toast = useToast();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [activeCMS, setActiveCMS] = useState<CMSType>(() => {
    try {
      const saved = localStorage.getItem('adminContentType');
      return (saved === 'blog' || saved === 'ctf' || saved === 'writeups') ? (saved as CMSType) : 'blog';
    } catch { return 'blog'; }
  });

  const [articles, setArticles] = useState<Article[]>([]);
  const [writeups, setWriteups] = useState<Writeup[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('published'); // Default to published for easier visibility of seeded data
  const [topicFilter, setTopicFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewItem, setPreviewItem] = useState<any | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [pendingCounts, setPendingCounts] = useState<Record<CMSType, number>>({ blog: 0, ctf: 0, writeups: 0 });
  const [unpublishConfirm, setUnpublishConfirm] = useState<string | null>(null);

  useEffect(() => {
    try { localStorage.setItem('adminContentType', activeCMS); } catch {}
  }, [activeCMS]);

  useEffect(() => {
    adminGetTopics().then(({ topics }) => setTopics(topics)).catch(() => {});
  }, []);

  const loadPendingCounts = useCallback(async () => {
    try {
      const [blogRes, ctfRes, wupRes] = await Promise.all([
        adminGetArticles({ status: 'pending', topicType: 'blog' }),
        adminGetArticles({ status: 'pending', topicType: 'ctf' }),
        adminGetWriteups({ status: 'pending' })
      ]);
      setPendingCounts({
        blog: blogRes.articles.length,
        ctf: ctfRes.articles.length,
        writeups: wupRes.writeups.length
      });
    } catch {}
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (activeCMS === 'writeups') {
        const { writeups } = await adminGetWriteups({ status: statusFilter || undefined });
        setWriteups(writeups);
      } else {
        const cmsConfig = CMS_TYPES.find(c => c.id === activeCMS);
        const { articles } = await adminGetArticles({
          status: statusFilter || undefined,
          topicId: topicFilter || undefined,
          topicType: cmsConfig?.apiValue || undefined,
        });
        setArticles(articles);
      }
      await loadPendingCounts();
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  }, [statusFilter, topicFilter, activeCMS, loadPendingCounts]);

  const visibleItems = (activeCMS === 'writeups' ? writeups : articles)
    .filter((item: any) => !timeFilter || inRange(item.updatedAt, timeFilter))
    .filter((item: any) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchBasic = item.title.toLowerCase().includes(q) || item.authorName.toLowerCase().includes(q);
      if (activeCMS === 'writeups') {
        const w = item as Writeup;
        return matchBasic || w.eventName.toLowerCase().includes(q) || w.challengeName.toLowerCase().includes(q);
      }
      const topicTitle = typeof item.topicId === 'object' ? (item.topicId as any).title?.toLowerCase() : '';
      return matchBasic || topicTitle.includes(q);
    });

  const metrics = {
    total: activeCMS === 'writeups' ? writeups.length : articles.length,
    pending: (activeCMS === 'writeups' ? writeups : articles).filter(i => i.status === 'pending').length,
    published: (activeCMS === 'writeups' ? writeups : articles).filter(i => i.status === 'published').length,
  };

  useEffect(() => { load(); }, [load]);

  const handleStatus = async (id: string, status: string) => {
    setActionId(id);
    const finalStatus = status === 'approved' ? 'published' : status;
    
    let rejectionReason = '';
    if (finalStatus === 'rejected') {
      rejectionReason = window.prompt('Enter rejection reason (optional):') || '';
    }

    try {
      if (activeCMS === 'writeups') {
        await adminSetWriteupStatus(id, finalStatus, rejectionReason);
        toast.success(`Writeup ${finalStatus}.`);
      } else {
        await adminSetArticleStatus(id, finalStatus, rejectionReason);
        toast.success(`Article ${finalStatus}.`);
      }
      await load();
    } catch (err: any) { toast.error(err.message); }
    finally { setActionId(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this item?')) return;
    setActionId(id);
    try {
      if (activeCMS === 'writeups') await adminDeleteWriteup(id);
      else toast.warning('Article deletion not implemented here.');
      toast.success('Deleted.');
      await load();
    } catch (err: any) { toast.error(err.message); }
    finally { setActionId(null); }
  };

  return (
    <div className="space-y-4">
      {previewItem && <ArticlePreviewModal article={previewItem} onClose={() => setPreviewItem(null)} />}
      <ConfirmModal isOpen={!!unpublishConfirm} onClose={() => setUnpublishConfirm(null)} onConfirm={() => { handleStatus(unpublishConfirm!, 'pending'); setUnpublishConfirm(null); }} title="Unpublish?" message="Move back to pending review?" confirmText="Unpublish" variant="warning" isLoading={!!actionId} />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-500" /> Content Management
          {!loading && <span className="text-sm font-normal text-gray-500">— {visibleItems.length} items</span>}
        </h2>
      </div>

      <div className="flex items-center gap-2 pb-3 border-b border-gray-800">
        {CMS_TYPES.map(cms => (
          <button key={cms.id} onClick={() => { setActiveCMS(cms.id); setTopicFilter(''); setSearchQuery(''); }} className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeCMS === cms.id ? 'bg-cyan-900/30 text-cyan-300 border border-cyan-500/40' : 'bg-gray-800/60 text-gray-400 border border-gray-700 hover:text-white'}`}>
            {cms.label}
            {pendingCounts[cms.id] > 0 && <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">{pendingCounts[cms.id]}</span>}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={`Search ${activeCMS}...`} className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="published">Published</option>
          <option value="rejected">Rejected</option>
        </select>
        {activeCMS !== 'writeups' && (
          <select value={topicFilter} onChange={(e) => setTopicFilter(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white">
            <option value="">{activeCMS === 'ctf' ? 'All Categories' : 'All Topics'}</option>
            {topics.filter(t => t.type === activeCMS).map(t => <option key={t._id} value={t._id}>{t.title}</option>)}
          </select>
        )}
        <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white">
          {TIME_RANGES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>

      {loading ? <LoadingSpinner /> : visibleItems.length === 0 ? (
        <div className="text-center py-16 opacity-40"><p>No items found.</p></div>
      ) : (
        <div className="space-y-3">
          {visibleItems.map((item: any) => (
            <div key={item._id} className="p-4 bg-gray-950 border border-gray-800 hover:border-gray-700 rounded-2xl flex items-center justify-between group transition-all">
              <div className="min-w-0 pr-4">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-white truncate">{item.title}</h3>
                  <Badge label={item.status} color={getStatusColors(item.status, false)} />
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><UserCog className="w-3 h-3" /> {item.authorName}</span>
                  {activeCMS === 'writeups' ? (
                    <span className="flex items-center gap-1 text-cyan-500/60">{item.eventName}</span>
                  ) : (
                    <span>{activeCMS === 'ctf' ? 'Category' : 'Topic'}: {typeof item.topicId === 'object' ? item.topicId.title : '—'}</span>
                  )}
                  <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setPreviewItem(item)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400" title="Preview"><Eye className="w-4 h-4" /></button>
                {item.status === 'pending' && (
                  <button onClick={() => handleStatus(item._id, 'approved')} className="p-2 hover:bg-cyan-900/40 rounded-lg text-cyan-400" title="Approve"><Check className="w-4 h-4" /></button>
                )}
                {item.status === 'published' && (
                  <button onClick={() => setUnpublishConfirm(item._id)} className="p-2 hover:bg-yellow-900/20 rounded-lg text-yellow-500" title="Unpublish"><X className="w-4 h-4" /></button>
                )}
                <button onClick={() => handleDelete(item._id)} disabled={actionId === item._id} className="p-2 hover:bg-red-900/20 rounded-lg text-red-400">
                  {actionId === item._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Panel: Video Moderation ───────────────────────────────────────────────────

const VideosPanel: React.FC = () => {
  const toast = useToast();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const v = await adminGetVideos({
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
      });
      setVideos(v);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, toast]);

  useEffect(() => { load(); }, [load]);

  const visibleVideos = videos.filter((v) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      v.title.toLowerCase().includes(q) ||
      v.author.toLowerCase().includes(q) ||
      v.tag.toLowerCase().includes(q)
    );
  });

  const handleStatus = async (id: string, status: 'published' | 'pending' | 'rejected') => {
    setActionId(id);
    try {
      await adminSetVideoStatus(id, status);
      toast.success(`Video ${status}.`);
      await load();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <MonitorPlay className="w-5 h-5 text-cyan-500" /> Video Moderation
          {!loading && <span className="text-sm font-normal text-gray-500">— {visibleVideos.length} items</span>}
        </h2>
        <button onClick={load} className="p-2.5 transition-all rounded-xl border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search title, author, tag..." className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="published">Published</option>
          <option value="rejected">Rejected</option>
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white">
          <option value="">All Categories</option>
          <option value="Tutorial">Tutorial</option>
          <option value="Reel">Reel / Short</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : visibleVideos.length === 0 ? (
        <div className="text-center py-16 opacity-40"><p>No videos found.</p></div>
      ) : (
        <div className="space-y-3">
          {visibleVideos.map((v) => (
            <div key={v._id} className="p-4 bg-gray-950 border border-gray-800 hover:border-gray-700 rounded-2xl flex items-center justify-between group transition-all">
              <div className="min-w-0 pr-4">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-white truncate">{v.title}</h3>
                  <Badge label={v.status} color={getStatusColors(v.status, false)} />
                  <Badge label={v.category} color={getVideoCategoryColors(v.category, false)} />
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><UserCog className="w-3 h-3" /> {v.author}</span>
                  <span className="flex items-center gap-1"><TagIcon className="w-3 h-3" /> {v.tag}</span>
                  <span>{new Date(v.date || Date.now()).toLocaleDateString()}</span>
                </div>
                {v.series && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-purple-400 uppercase tracking-widest bg-purple-900/20 px-2 py-0.5 rounded border border-purple-500/30">
                      <ListVideo className="w-3 h-3" />
                      Series: {v.series}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
                      Part {v.seriesOrder}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {v.status === 'pending' && (
                  <>
                    <button onClick={() => handleStatus(v._id, 'published')} className="p-2 hover:bg-cyan-900/40 rounded-lg text-cyan-400" title="Approve"><Check className="w-4 h-4" /></button>
                    <button onClick={() => handleStatus(v._id, 'rejected')} className="p-2 hover:bg-red-900/20 rounded-lg text-red-400" title="Reject"><X className="w-4 h-4" /></button>
                  </>
                )}
                {v.status === 'published' && (
                  <button onClick={() => handleStatus(v._id, 'pending')} className="p-2 hover:bg-yellow-900/20 rounded-lg text-yellow-500" title="Set Pending"><X className="w-4 h-4" /></button>
                )}
                {v.status === 'rejected' && (
                  <button onClick={() => handleStatus(v._id, 'pending')} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400" title="Set Pending"><RefreshCw className="w-4 h-4" /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main AdminDashboard ──────────────────────────────────────────────────────

type AdminTab = 'users' | 'topics' | 'content' | 'videos';

const AdminDashboard: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [tab, setTab] = useState<AdminTab>('content');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl"><ShieldCheck className="w-5 h-5 text-yellow-400" /></div>
        <div><h1 className="text-2xl font-bold text-white">Admin Dashboard</h1><p className="text-sm text-gray-500">Manage users, topics, and content submissions</p></div>
      </div>
      <div className="border-b border-gray-800 flex gap-1">
        {[
          { id: 'content', label: 'Content', icon: Layers },
          { id: 'videos', label: 'Videos', icon: MonitorPlay },
          { id: 'topics', label: 'Topics', icon: Hash },
          { id: 'users', label: 'Users', icon: Users },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as AdminTab)} className={`relative flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all ${tab === t.id ? 'text-cyan-400' : 'text-gray-500 hover:text-white'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
            {tab === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />}
          </button>
        ))}
      </div>
      <div>
        {tab === 'users' && <UsersPanel />}
        {tab === 'topics' && <TopicsPanel />}
        {tab === 'content' && <ContentPanel />}
        {tab === 'videos' && <VideosPanel />}
      </div>
    </div>
  );
};

export default AdminDashboard;