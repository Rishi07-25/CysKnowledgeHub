import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Hash,
  Tag,
  User,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Loader2,
} from 'lucide-react';
import NovelRenderer from './components/NovelRenderer';
import { Article, Topic, adminGetTopics, adminSetArticleStatus, adminUpdateArticleTopic } from './services/ctfApi';
import { useToast } from './contexts/ToastContext';

const getPreviewArticle = (): Article | null => {
  try {
    const data = localStorage.getItem('admin-article-preview');
    if (!data) return null;
    return JSON.parse(data) as Article;
  } catch {
    return null;
  }
};

const statusMeta = (status: Article['status']) => {
  switch (status) {
    case 'published':
      return {
        label: 'Published',
        className: 'bg-cyan-900/40 text-cyan-300 border-cyan-600/60',
      };
    case 'approved':
      return {
        label: 'Approved',
        className: 'bg-indigo-900/40 text-indigo-300 border-indigo-600/60',
      };
    case 'pending':
      return {
        label: 'Pending Review',
        className: 'bg-yellow-900/40 text-yellow-300 border-yellow-600/60',
      };
    case 'rejected':
      return {
        label: 'Rejected',
        className: 'bg-red-900/40 text-red-300 border-red-600/60',
      };
    case 'draft':
    default:
      return {
        label: 'Draft',
        className: 'bg-gray-900/70 text-gray-300 border-gray-600/60',
      };
  }
};

const AdminArticlePreviewPage: React.FC = () => {
  const [article, setArticle] = useState<Article | null>(() => getPreviewArticle());
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loadingAction, setLoadingAction] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [changingCategory, setChangingCategory] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newTopicId, setNewTopicId] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!article) return;
    adminGetTopics()
      .then(({ topics }) => setTopics(topics))
      .catch(() => {
        // Silent failure; actions will still work, only category change will be limited.
      });
  }, [article]);

  const topicObject = useMemo(
    () =>
      article && typeof article.topicId === 'object'
        ? (article.topicId as Topic)
        : null,
    [article]
  );

  const topicTitle = topicObject?.title ?? '—';
  const topicType = topicObject?.type;

  const availableTopics = useMemo(
    () =>
      topics.filter((t) => (topicType ? t.type === topicType : true)),
    [topics, topicType]
  );

  const saveLocal = (updated: Article) => {
    setArticle(updated);
    try {
      localStorage.setItem('admin-article-preview', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleStatusChange = async (status: Article['status'], reason?: string) => {
    if (!article) return;
    setLoadingAction(true);
    try {
      const { article: updated } = await adminSetArticleStatus(article._id, status, reason);
      saveLocal(updated);
      if (status === 'approved' || status === 'published') {
        toast.success('Article approved and published.');
      } else if (status === 'pending') {
        toast.warning('Article moved back to pending status.');
      } else if (status === 'rejected') {
        toast.error('Article rejected.');
      } else {
        toast.info(`Status updated to "${status}".`);
      }
      setRejectMode(false);
      setRejectReason('');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to update article status');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleChangeCategory = async () => {
    if (!article || !newTopicId) return;
    setChangingCategory(true);
    try {
      const { article: updated } = await adminUpdateArticleTopic(article._id, newTopicId);
      saveLocal(updated);
      toast.success('Category updated.');
      setShowCategoryForm(false);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to change category');
    } finally {
      setChangingCategory(false);
    }
  };

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-gray-500">
        <p className="mb-4">No article data found for preview.</p>
        <button
          onClick={() => navigate('/admin-dashboard')}
          className="px-4 py-2 rounded-lg bg-gray-800 text-sm text-gray-200 border border-gray-700 hover:bg-gray-700"
        >
          Back to Admin Dashboard
        </button>
      </div>
    );
  }

  const meta = statusMeta(article.status);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-0 m-0">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back + actions row (sits under global navbar) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <button
              onClick={() => navigate('/admin-dashboard')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-800 bg-gray-900/70 hover:bg-gray-800 text-xs font-medium text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Admin Dashboard
            </button>
            <span className="hidden md:inline text-gray-600">
              Reviewing: <span className="text-gray-300 line-clamp-1">{article.title}</span>
            </span>
          </div>

          {/* Primary moderation actions — reuse admin button look & feel */}
          <div className="flex items-center gap-2">
            {article.status === 'pending' && (
              <>
                <button
                  onClick={() => handleStatusChange('approved')}
                  disabled={loadingAction}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 shadow-sm shadow-cyan-900/40"
                >
                  {loadingAction ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3" />
                  )}
                  Approve &amp; Publish
                </button>
                <button
                  onClick={() => setRejectMode((v) => !v)}
                  disabled={loadingAction}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-500/60 text-red-300 hover:bg-red-900/30 disabled:opacity-50"
                >
                  <XCircle className="w-3 h-3" />
                  Reject
                </button>
              </>
            )}
            {article.status === 'published' && (
              <button
                onClick={() => handleStatusChange('pending')}
                disabled={loadingAction}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-700 text-gray-200 hover:bg-gray-800 disabled:opacity-50"
              >
                {loadingAction ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Clock className="w-3 h-3" />
                )}
                Unpublish
              </button>
            )}
            {(article.status === 'approved' || article.status === 'rejected') && (
              <button
                onClick={() => handleStatusChange('pending')}
                disabled={loadingAction}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-600 text-gray-200 hover:bg-gray-800 disabled:opacity-50"
              >
                {loadingAction ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <FileText className="w-3 h-3" />
                )}
                Set Pending
              </button>
            )}
          </div>
        </div>

        <div className="py-4 space-y-6">
        {/* Article context */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 md:p-6 space-y-4 shadow-lg shadow-black/30">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight">
                {article.title}
              </h1>
              {article.excerpt && (
                <p className="text-sm text-gray-400 max-w-2xl">{article.excerpt}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                <span className="inline-flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{article.authorName}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-gray-500" />
                  <span>{topicTitle}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  <span>
                    {new Date(article.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </span>
                {article.tags && article.tags.length > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-gray-500" />
                    <span className="flex flex-wrap gap-1">
                      {article.tags.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-full bg-gray-800 text-[10px] text-gray-300 border border-gray-700"
                        >
                          #{t}
                        </span>
                      ))}
                      {article.tags.length > 4 && (
                        <span className="text-[10px] text-gray-500">
                          +{article.tags.length - 4}
                        </span>
                      )}
                    </span>
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${meta.className}`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full bg-current opacity-80"
                  aria-hidden="true"
                />
                {meta.label}
              </span>
              {article.status === 'rejected' && article.rejectionReason && (
                <p className="max-w-xs text-[11px] text-red-300 bg-red-950/40 border border-red-700/50 rounded-lg px-3 py-2">
                  <span className="font-semibold">Previous rejection:</span>{' '}
                  {article.rejectionReason}
                </p>
              )}
            </div>
          </div>

          {/* Secondary moderation: rejection comment + category change */}
          {rejectMode && (
            <div className="mt-3 space-y-2 border-t border-gray-800 pt-3">
              <label className="text-xs font-semibold text-red-300 flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" />
                Rejection comment (visible to author)
              </label>
              <div className="flex flex-col md:flex-row gap-2">
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={2}
                  className="flex-1 bg-gray-950 border border-red-700/50 rounded-xl px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500/70"
                  placeholder="Explain why this article is being rejected…"
                />
                <div className="flex flex-col gap-2 w-full md:w-auto">
                  <button
                    onClick={() => handleStatusChange('rejected', rejectReason.trim() || undefined)}
                    disabled={loadingAction}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 disabled:opacity-50"
                  >
                    {loadingAction ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    Confirm Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRejectMode(false);
                      setRejectReason('');
                    }}
                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-700 text-gray-200 hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-3 border-t border-gray-800 pt-3 space-y-2">
            <button
              type="button"
              onClick={() => setShowCategoryForm((v) => !v)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border border-purple-600/60 text-purple-200 bg-purple-900/20 hover:bg-purple-900/40 transition-colors"
            >
              <Hash className="w-3 h-3" />
              Change Category / Topic
            </button>
            {showCategoryForm && (
              <div className="flex flex-col md:flex-row gap-2 items-center">
                <select
                  value={newTopicId}
                  onChange={(e) => setNewTopicId(e.target.value)}
                  className="flex-1 w-full bg-gray-950 border border-purple-700/50 rounded-xl px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-purple-500/70"
                >
                  <option value="">— Select new category —</option>
                  {availableTopics.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.title}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleChangeCategory}
                  disabled={changingCategory || !newTopicId}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 disabled:opacity-50"
                >
                  {changingCategory ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3" />
                  )}
                  Move
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Article body */}
        <div className="bg-gray-950 border border-gray-900 rounded-2xl p-4 md:p-6">
          <NovelRenderer
            content={article.content}
            contentType={article.contentType ?? 'markdown'}
          />
        </div>
        </div>
      </div>
    </div>
  );
};

export default AdminArticlePreviewPage;