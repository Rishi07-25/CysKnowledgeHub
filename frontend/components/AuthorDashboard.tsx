import React, { useState, useEffect, useCallback } from 'react';
import {
  PenLine, Plus, Trash2, Clock, CheckCircle2, XCircle,
  Eye, FileText, Loader2, AlertCircle, ArrowLeft, RefreshCw,
  BookOpen, Terminal, Tag, CalendarDays, LayoutGrid,
} from 'lucide-react';
import ArticleEditor from './ArticleEditor';
import {
  getMyArticles, createArticle, updateArticle, deleteArticle,
  submitArticle, getArticleForEdit, getTopics, Article, Topic,
} from '../services/ctfApi';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';

// ─── Status badge ─────────────────────────────────────────────────────────────

const getStatusMeta = (status: string, isLight: boolean) => {
  const statusConfig = {
    draft: {
      label: 'Draft',
      color: isLight
        ? 'text-gray-700 bg-gray-100 border-gray-300'
        : 'text-gray-400 bg-gray-800/60 border-gray-700',
      icon: FileText
    },
    pending: {
      label: 'Pending',
      color: isLight
        ? 'text-yellow-700 bg-yellow-100 border-yellow-300'
        : 'text-yellow-400 bg-yellow-900/30 border-yellow-700/50',
      icon: Clock
    },
    approved: {
      label: 'Approved',
      color: isLight
        ? 'text-indigo-700 bg-indigo-100 border-indigo-300'
        : 'text-indigo-400 bg-indigo-900/30 border-indigo-700/50',
      icon: CheckCircle2
    },
    published: {
      label: 'Published',
      color: isLight
        ? 'text-cyan-700 bg-cyan-100 border-cyan-300'
        : 'text-cyan-400 bg-cyan-900/30 border-cyan-700/50',
      icon: CheckCircle2
    },
    rejected: {
      label: 'Rejected',
      color: isLight
        ? 'text-red-700 bg-red-100 border-red-300'
        : 'text-red-400 bg-red-900/30 border-red-700/50',
      icon: XCircle
    },
  };
  return statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
};

const StatusBadge: React.FC<{ status: string; isLight: boolean }> = ({ status, isLight }) => {
  const meta = getStatusMeta(status, isLight);
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${meta.color}`}>
      <Icon className="w-3 h-3" />
      {meta.label}
    </span>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

type View = 'list' | 'new' | 'edit';
type TabMode = 'blog' | 'ctf';

const AuthorDashboard: React.FC = () => {
  const toast = useToast();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [view, setView] = useState<View>('list');
  const [activeTab, setActiveTab] = useState<TabMode>('ctf');
  const [articles, setArticles] = useState<Article[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ articles }, { topics }] = await Promise.all([getMyArticles(), getTopics()]);
      setArticles(articles);
      setTopics(topics);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Save draft ─────────────────────────────────────────────────────────────
  const handleSave = async (data: {
    title: string; topicId: string; content: string; contentType: 'novel';
    excerpt: string; coverImage: string; tags: string[];
  }) => {
    setIsSaving(true);
    try {
      if (editingArticle) {
        const { article } = await updateArticle(editingArticle._id, data);
        setEditingArticle(article);
        toast.info('Draft saved.');
      } else {
        const { article } = await createArticle(data);
        setEditingArticle(article);
        setView('edit');
        toast.success('Article created as draft.');
      }
      await loadData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Submit for review ──────────────────────────────────────────────────────
  // Works in both "edit" mode (already has a draft) and "new" mode (no draft yet).
  // In new mode the article is created first, then immediately submitted.
  const handleSubmit = async (data: {
    title: string; topicId: string; content: string; contentType: 'novel';
    excerpt: string; coverImage: string; tags: string[];
  }) => {
    setIsSubmitting(true);
    try {
      let articleId = editingArticle?._id;
      if (!articleId) {
        // No draft exists yet — create it silently, then submit
        const { article: created } = await createArticle(data);
        articleId = created._id;
        setEditingArticle(created);
      }
      await submitArticle(articleId);
      toast.success('Article submitted for review.');
      await loadData();
      setView('list');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Edit article ───────────────────────────────────────────────────────────
  const handleEdit = async (articleId: string) => {
    try {
      const { article } = await getArticleForEdit(articleId);
      setEditingArticle(article);
      setView('edit');
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ── Delete article ─────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this article permanently? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteArticle(id);
      await loadData();
      toast.success('Article deleted.');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  // Filter articles + topics by active tab
  const tabArticles = articles.filter((a) => {
    const topicType = typeof a.topicId === 'object' ? (a.topicId as any).type : null;
    if (activeTab === 'blog') return topicType === 'blog';
    return topicType !== 'blog';
  });

  const tabTopics = topics.filter((t) =>
    activeTab === 'blog' ? t.type === 'blog' : t.type !== 'blog'
  );

  if (view === 'new' || view === 'edit') {
    const article = editingArticle;
    return (
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <button
            onClick={() => { setView('list'); setEditingArticle(null); }}
            className={`flex items-center gap-2 text-sm group transition-colors ${
              isLight ? 'text-gray-600 hover:text-cyan-600' : 'text-gray-400 hover:text-cyan-400'
            }`}
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to My Articles
          </button>
          <p className={`text-xs ${
            isLight ? 'text-gray-500' : 'text-gray-600'
          }`}>Changes auto-saved as drafts</p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border ${
            isLight 
              ? 'bg-cyan-100 border-cyan-200' 
              : 'bg-cyan-500/10 border-cyan-500/20'
          }`}>
            <PenLine className="w-4 h-4 text-cyan-400" />
          </div>
          <h1 className={`text-2xl font-bold ${
            isLight ? 'text-gray-900' : 'text-white'
          }`}>
            {view === 'new'
              ? activeTab === 'blog' ? 'New Blog Post' : 'New CTF Article'
              : 'Edit Article'}
          </h1>
        </div>

        {error && (
          <div className={`flex items-center gap-2 text-sm rounded-xl px-4 py-3 ${
            isLight 
              ? 'text-red-700 bg-red-50 border border-red-200' 
              : 'text-red-400 bg-red-950/30 border border-red-700/40'
          }`}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
            <button onClick={() => setError(null)} className={`ml-auto transition-colors ${
              isLight ? 'text-gray-500 hover:text-gray-900' : 'text-gray-500 hover:text-white'
            }`}>✕</button>
          </div>
        )}

        <ArticleEditor
          topics={tabTopics}
          isBlog={activeTab === 'blog'}
          initialTitle={article?.title}
          initialContent={article?.content}
          initialContentType={(article as any)?.contentType}
          initialCoverImage={article?.coverImage}
          initialTopicId={typeof article?.topicId === 'object' ? (article.topicId as any)._id : article?.topicId}
          initialTags={article?.tags}
          initialExcerpt={(article as any)?.excerpt ?? ''}
          articleStatus={article?.status ?? 'draft'}
          rejectionReason={article?.rejectionReason}
          onSave={handleSave}
          onSubmit={handleSubmit}
          isSaving={isSaving}
          isSubmitting={isSubmitting}
          onTopicCreated={(t) => setTopics((prev) => [...prev, t])}
        />
      </div>
    );
  }

  // ── Article list ───────────────────────────────────────────────────────────

  // Per-status counts for the stats bar
  const statCounts = {
    total:     tabArticles.length,
    published: tabArticles.filter((a) => a.status === 'published').length,
    pending:   tabArticles.filter((a) => a.status === 'pending').length,
    draft:     tabArticles.filter((a) => a.status === 'draft').length,
  };

  return (
    <div className="space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${
            isLight 
              ? 'bg-cyan-100 border-cyan-200' 
              : 'bg-cyan-500/10 border-cyan-500/20'
          }`}>
            <PenLine className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${
              isLight ? 'text-gray-900' : 'text-white'
            }`}>My Articles</h1>
            <p className={`text-sm mt-0.5 ${
              isLight ? 'text-gray-600' : 'text-gray-500'
            }`}>
              Manage your {activeTab === 'blog' ? 'blog posts' : 'CTF writeups &amp; experiments'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className={`p-2.5 border rounded-xl transition-all ${
              isLight 
                ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-gray-200' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800/80 border-gray-800 hover:border-gray-700'
            }`}
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setEditingArticle(null); setView('new'); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              isLight 
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-200/50' 
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/30'
            }`}
          >
            <Plus className="w-4 h-4" />
            New {activeTab === 'blog' ? 'Blog Post' : 'CTF Article'}
          </button>
        </div>
      </div>

      {/* ── Tab switcher ───────────────────────────────────────────────────── */}
      <div className={`border-b ${
        isLight ? 'border-gray-200' : 'border-gray-800'
      }`}>
        <div className="flex gap-1">
          {([
            { id: 'ctf',  label: 'CTF & Experiments', icon: Terminal },
            { id: 'blog', label: 'Blog Posts',         icon: BookOpen },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`relative flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all ${
                activeTab === id
                  ? (isLight ? 'text-cyan-600' : 'text-cyan-400')
                  : (isLight ? 'text-gray-600 hover:text-gray-800' : 'text-gray-500 hover:text-gray-300')
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {activeTab === id && (
                <span className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full ${
                  isLight ? 'bg-cyan-600' : 'bg-cyan-500'
                }`} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats row ──────────────────────────────────────────────────────── */}
      {!loading && tabArticles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total',     value: statCounts.total,     color: isLight ? 'text-gray-700' : 'text-gray-300',   bg: isLight ? 'bg-gray-100' : 'bg-gray-800/60', icon: LayoutGrid },
            { label: 'Published', value: statCounts.published, color: isLight ? 'text-cyan-700' : 'text-cyan-400',   bg: isLight ? 'bg-cyan-100' : 'bg-cyan-900/20', icon: CheckCircle2 },
            { label: 'Pending',   value: statCounts.pending,   color: isLight ? 'text-yellow-700' : 'text-yellow-400', bg: isLight ? 'bg-yellow-100' : 'bg-yellow-900/20', icon: Clock },
            { label: 'Drafts',    value: statCounts.draft,     color: isLight ? 'text-gray-700' : 'text-gray-400',   bg: isLight ? 'bg-gray-100' : 'bg-gray-800/60', icon: FileText },
          ].map(({ label, value, color, bg, icon: Icon }) => (
            <div key={label} className={`${bg} border rounded-xl px-4 py-3 flex items-center gap-3 ${
              isLight ? 'border-gray-200' : 'border-gray-800/80'
            }`}>
              <Icon className={`w-4 h-4 ${color} flex-shrink-0`} />
              <div>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className={`text-xs ${
                  isLight ? 'text-gray-600' : 'text-gray-500'
                }`}>{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Alerts ─────────────────────────────────────────────────────────── */}
      {error && (
        <div className={`flex items-center gap-2 text-sm rounded-xl px-4 py-3 ${
          isLight 
            ? 'text-red-700 bg-red-50 border border-red-200' 
            : 'text-red-400 bg-red-950/30 border border-red-700/40'
        }`}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
          <button onClick={() => setError(null)} className={`ml-auto transition-colors ${
            isLight ? 'text-gray-500 hover:text-gray-900' : 'text-gray-500 hover:text-white'
          }`}>✕</button>
        </div>
      )}

      {/* ── Article list ───────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-600">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
          <p className={`text-sm ${
            isLight ? 'text-gray-600' : 'text-gray-600'
          }`}>Loading your articles…</p>
        </div>
      ) : tabArticles.length === 0 ? (
        /* ── Empty state ─────────────────────────────────────────────────── */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="relative mb-6">
            <div className={`w-20 h-20 rounded-2xl border flex items-center justify-center ${
            isLight ? 'bg-gray-100 border-gray-200' : 'bg-gray-800/80 border-gray-700/60'
          }`}>
              {activeTab === 'blog'
                ? <BookOpen className={`w-9 h-9 ${
                    isLight ? 'text-gray-500' : 'text-gray-600'
                  }`} />
                : <Terminal className={`w-9 h-9 ${
                    isLight ? 'text-gray-500' : 'text-gray-600'
                  }`} />}
            </div>
            <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-xl border flex items-center justify-center ${
              isLight 
                ? 'bg-cyan-100 border-cyan-200' 
                : 'bg-cyan-900/60 border-cyan-700/40'
            }`}>
              <Plus className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <h3 className={`text-lg font-semibold mb-1 ${
            isLight ? 'text-gray-800' : 'text-gray-300'
          }`}>
            No {activeTab === 'blog' ? 'blog posts' : 'CTF articles'} yet
          </h3>
          <p className={`text-sm max-w-xs mb-6 ${
            isLight ? 'text-gray-600' : 'text-gray-600'
          }`}>
            {activeTab === 'blog'
              ? 'Share your knowledge, research, and security insights with the community.'
              : 'Document your CTF solutions and experiments to help others learn.'}
          </p>
          <button
            onClick={() => { setEditingArticle(null); setView('new'); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isLight 
                ? 'bg-cyan-100 hover:bg-cyan-200 border border-cyan-200 hover:border-cyan-300 text-cyan-700' 
                : 'bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 hover:border-cyan-500/50 text-cyan-400'
            }`}
          >
            <PenLine className="w-4 h-4" />
            Write your first {activeTab === 'blog' ? 'blog post' : 'CTF article'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tabArticles.map((a) => {
            const topic = typeof a.topicId === 'object'
              ? (a.topicId as any)
              : topics.find((t) => t._id === a.topicId);
            const topicTitle = topic?.title ?? '—';
            const canDelete = ['draft', 'rejected'].includes(a.status);
            const canEdit   = ['draft', 'rejected'].includes(a.status);
            const canView   = ['approved', 'published'].includes(a.status);

            const getAccentColor = (status: string, isLight: boolean) => {
              const colors = {
                draft: isLight ? 'bg-gray-400' : 'bg-gray-600',
                pending: isLight ? 'bg-yellow-600' : 'bg-yellow-500',
                approved: isLight ? 'bg-indigo-600' : 'bg-indigo-500',
                published: isLight ? 'bg-cyan-600' : 'bg-cyan-500',
                rejected: isLight ? 'bg-red-600' : 'bg-red-500',
              };
              return colors[status as keyof typeof colors] || colors.draft;
            };

            return (
              <div
                key={a._id}
                className={`group relative flex items-start gap-4 border rounded-2xl px-5 py-4 transition-all ${
                  isLight 
                    ? 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50' 
                    : 'bg-gray-900/80 border-gray-800 hover:border-gray-700 hover:bg-gray-900'
                }`}
              >
                {/* Status accent bar */}
                <div className={`absolute left-0 top-4 bottom-4 w-[3px] rounded-full opacity-70 ${getAccentColor(a.status, isLight)}`} />

                <div className="flex-1 min-w-0 pl-2">
                  {/* Title + badge */}
                  <div className="flex items-start gap-3 flex-wrap mb-2">
                    <h3 className={`font-semibold leading-snug ${
                      isLight ? 'text-gray-900' : 'text-white'
                    }`}>{a.title}</h3>
                    <StatusBadge status={a.status} isLight={isLight} />
                  </div>

                  {/* Excerpt */}
                  {(a as any).excerpt && (
                    <p className={`text-sm line-clamp-1 mb-2 ${
                      isLight ? 'text-gray-600' : 'text-gray-500'
                    }`}>{(a as any).excerpt}</p>
                  )}

                  {/* Meta row */}
                  <div className={`flex items-center flex-wrap gap-x-4 gap-y-1 text-xs ${
                    isLight ? 'text-gray-600' : 'text-gray-600'
                  }`}>
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {topicTitle}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {new Date(a.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {a.tags && a.tags.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        {a.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className={`px-1.5 py-0.5 border rounded text-[10px] font-medium ${
                            isLight 
                              ? 'bg-gray-100 border-gray-200 text-gray-600' 
                              : 'bg-gray-800 border-gray-700/60 text-gray-500'
                          }`}>
                            {tag}
                          </span>
                        ))}
                        {a.tags.length > 3 && <span className={`${
                          isLight ? 'text-gray-600' : 'text-gray-600'
                        }`}>+{a.tags.length - 3}</span>}
                      </div>
                    )}
                  </div>

                  {/* Rejection reason */}
                  {a.status === 'rejected' && a.rejectionReason && (
                    <div className={`mt-2 flex items-start gap-1.5 text-xs border rounded-lg px-3 py-2 ${
                      isLight 
                        ? 'text-red-700 bg-red-50 border-red-200' 
                        : 'text-red-400 bg-red-950/20 border-red-900/40'
                    }`}>
                      <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      {a.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                  {canEdit && (
                    <button
                      onClick={() => handleEdit(a._id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-lg font-medium transition-colors ${
                        isLight 
                          ? 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700' 
                          : 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-white'
                      }`}
                    >
                      <PenLine className="w-3 h-3" /> Edit
                    </button>
                  )}
                  {canView && (
                    <button
                      onClick={() => handleEdit(a._id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-lg font-medium transition-colors ${
                        isLight 
                          ? 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700' 
                          : 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-white'
                      }`}
                    >
                      <Eye className="w-3 h-3" /> View
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(a._id)}
                      disabled={deletingId === a._id}
                      className={`p-1.5 border border-transparent rounded-lg transition-all disabled:opacity-50 ${
                        isLight 
                          ? 'text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200' 
                          : 'text-gray-600 hover:text-red-400 hover:bg-red-900/20 hover:border-red-900/40'
                      }`}
                      title="Delete"
                    >
                      {deletingId === a._id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AuthorDashboard;
