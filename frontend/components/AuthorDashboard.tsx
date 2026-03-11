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

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string; icon: React.FC<any> }> = {
  draft:     { label: 'Draft',     color: 'text-gray-400 bg-gray-800/60 border-gray-700',       icon: FileText },
  pending:   { label: 'Pending',   color: 'text-yellow-400 bg-yellow-900/30 border-yellow-700/50', icon: Clock },
  approved:  { label: 'Approved',  color: 'text-indigo-400 bg-indigo-900/30 border-indigo-700/50', icon: CheckCircle2 },
  published: { label: 'Published', color: 'text-cyan-400 bg-cyan-900/30 border-cyan-700/50',     icon: CheckCircle2 },
  rejected:  { label: 'Rejected',  color: 'text-red-400 bg-red-900/30 border-red-700/50',        icon: XCircle },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const meta = STATUS_META[status] ?? STATUS_META.draft;
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
        <div className="flex items-center justify-between">
          <button
            onClick={() => { setView('list'); setEditingArticle(null); }}
            className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 text-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to My Articles
          </button>
          <p className="text-xs text-gray-600">Changes auto-saved as drafts</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
            <PenLine className="w-4 h-4 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold">
            {view === 'new'
              ? activeTab === 'blog' ? 'New Blog Post' : 'New CTF Article'
              : 'Edit Article'}
          </h1>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-400 bg-red-950/30 border border-red-700/40 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto text-gray-500 hover:text-white">✕</button>
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
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
            <PenLine className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">My Articles</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage your {activeTab === 'blog' ? 'blog posts' : 'CTF writeups &amp; experiments'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-800/80 border border-gray-800 hover:border-gray-700 rounded-xl transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setEditingArticle(null); setView('new'); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-cyan-900/30"
          >
            <Plus className="w-4 h-4" />
            New {activeTab === 'blog' ? 'Blog Post' : 'CTF Article'}
          </button>
        </div>
      </div>

      {/* ── Tab switcher ───────────────────────────────────────────────────── */}
      <div className="border-b border-gray-800">
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
                  ? 'text-cyan-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {activeTab === id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats row ──────────────────────────────────────────────────────── */}
      {!loading && tabArticles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total',     value: statCounts.total,     color: 'text-gray-300',   bg: 'bg-gray-800/60', icon: LayoutGrid },
            { label: 'Published', value: statCounts.published, color: 'text-cyan-400',   bg: 'bg-cyan-900/20', icon: CheckCircle2 },
            { label: 'Pending',   value: statCounts.pending,   color: 'text-yellow-400', bg: 'bg-yellow-900/20', icon: Clock },
            { label: 'Drafts',    value: statCounts.draft,     color: 'text-gray-400',   bg: 'bg-gray-800/60', icon: FileText },
          ].map(({ label, value, color, bg, icon: Icon }) => (
            <div key={label} className={`${bg} border border-gray-800/80 rounded-xl px-4 py-3 flex items-center gap-3`}>
              <Icon className={`w-4 h-4 ${color} flex-shrink-0`} />
              <div>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Alerts ─────────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-950/30 border border-red-700/40 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
          <button onClick={() => setError(null)} className="ml-auto text-gray-500 hover:text-white">✕</button>
        </div>
      )}

      {/* ── Article list ───────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-600">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
          <p className="text-sm">Loading your articles…</p>
        </div>
      ) : tabArticles.length === 0 ? (
        /* ── Empty state ─────────────────────────────────────────────────── */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gray-800/80 border border-gray-700/60 flex items-center justify-center">
              {activeTab === 'blog'
                ? <BookOpen className="w-9 h-9 text-gray-600" />
                : <Terminal className="w-9 h-9 text-gray-600" />}
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-cyan-900/60 border border-cyan-700/40 flex items-center justify-center">
              <Plus className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-300 mb-1">
            No {activeTab === 'blog' ? 'blog posts' : 'CTF articles'} yet
          </h3>
          <p className="text-sm text-gray-600 max-w-xs mb-6">
            {activeTab === 'blog'
              ? 'Share your knowledge, research, and security insights with the community.'
              : 'Document your CTF solutions and experiments to help others learn.'}
          </p>
          <button
            onClick={() => { setEditingArticle(null); setView('new'); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 hover:border-cyan-500/50 text-cyan-400 rounded-xl text-sm font-semibold transition-all"
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

            const ACCENT: Record<string, string> = {
              draft:     'bg-gray-600',
              pending:   'bg-yellow-500',
              approved:  'bg-indigo-500',
              published: 'bg-cyan-500',
              rejected:  'bg-red-500',
            };

            return (
              <div
                key={a._id}
                className="group relative flex items-start gap-4 bg-gray-900/80 border border-gray-800 hover:border-gray-700 rounded-2xl px-5 py-4 transition-all hover:bg-gray-900"
              >
                {/* Status accent bar */}
                <div className={`absolute left-0 top-4 bottom-4 w-[3px] rounded-full ${ACCENT[a.status] ?? ACCENT.draft} opacity-70`} />

                <div className="flex-1 min-w-0 pl-2">
                  {/* Title + badge */}
                  <div className="flex items-start gap-3 flex-wrap mb-2">
                    <h3 className="font-semibold text-white leading-snug">{a.title}</h3>
                    <StatusBadge status={a.status} />
                  </div>

                  {/* Excerpt */}
                  {(a as any).excerpt && (
                    <p className="text-sm text-gray-500 line-clamp-1 mb-2">{(a as any).excerpt}</p>
                  )}

                  {/* Meta row */}
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
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
                          <span key={tag} className="px-1.5 py-0.5 bg-gray-800 border border-gray-700/60 rounded text-gray-500 text-[10px] font-medium">
                            {tag}
                          </span>
                        ))}
                        {a.tags.length > 3 && <span className="text-gray-600">+{a.tags.length - 3}</span>}
                      </div>
                    )}
                  </div>

                  {/* Rejection reason */}
                  {a.status === 'rejected' && a.rejectionReason && (
                    <div className="mt-2 flex items-start gap-1.5 text-xs text-red-400 bg-red-950/20 border border-red-900/40 rounded-lg px-3 py-2">
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
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg font-medium transition-colors"
                    >
                      <PenLine className="w-3 h-3" /> Edit
                    </button>
                  )}
                  {canView && (
                    <button
                      onClick={() => handleEdit(a._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg font-medium transition-colors"
                    >
                      <Eye className="w-3 h-3" /> View
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(a._id)}
                      disabled={deletingId === a._id}
                      className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-900/20 border border-transparent hover:border-red-900/40 rounded-lg transition-all disabled:opacity-50"
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
