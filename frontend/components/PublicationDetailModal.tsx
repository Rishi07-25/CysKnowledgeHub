import React, { useEffect } from 'react';
import { X, CalendarDays, Building2, FileText, Tag, ExternalLink, Users } from 'lucide-react';
import { Publication } from '../types';

interface PublicationDetailModalProps {
  publication: Publication | null;
  onClose: () => void;
}

const PublicationDetailModal: React.FC<PublicationDetailModalProps> = ({ publication, onClose }) => {
  useEffect(() => {
    if (!publication) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [publication, onClose]);

  if (!publication) return null;

  const formattedDate = new Date(publication.publicationDate).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Publication details"
        className="relative w-full max-w-3xl max-h-[90vh] overflow-auto bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl"
      >
        <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 p-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-2">{publication.kind}</p>
            <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">{publication.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            aria-label="Close publication details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 md:p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-3">
              <p className="text-gray-500 text-xs uppercase mb-1 inline-flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> Publication Date</p>
              <p className="text-gray-100 font-medium">{formattedDate}</p>
            </div>
            <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-3">
              <p className="text-gray-500 text-xs uppercase mb-1 inline-flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> Publisher</p>
              <p className="text-gray-100 font-medium">{publication.publisher}</p>
            </div>
            <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-3 md:col-span-2">
              <p className="text-gray-500 text-xs uppercase mb-1 inline-flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Conference / Journal</p>
              <p className="text-gray-100 font-medium">{publication.venue}</p>
            </div>
            <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-3 md:col-span-2">
              <p className="text-gray-500 text-xs uppercase mb-1 inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Authors</p>
              <p className="text-gray-100 font-medium">{publication.authors.join(', ')}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider mb-2">Abstract</h3>
            <p className="text-gray-300 leading-relaxed text-sm">{publication.abstract}</p>
          </div>

          {publication.keywords && publication.keywords.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider mb-2 inline-flex items-center gap-1">
                <Tag className="w-4 h-4 text-gray-500" /> Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {publication.keywords.map((keyword) => (
                  <span key={keyword} className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-200">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            <a
              href={publication.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition-colors"
            >
              View Publication
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicationDetailModal;
