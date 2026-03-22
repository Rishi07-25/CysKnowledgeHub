import React from 'react';
import { CalendarDays, Building2, FileText, Globe2, Landmark } from 'lucide-react';
import { Publication } from '../types';

interface PublicationCardProps {
  publication: Publication;
  onClick: (publication: Publication) => void;
}

const PublicationCard: React.FC<PublicationCardProps> = ({ publication, onClick }) => {
  const publicationYear = publication.publicationDate.slice(0, 4);

  return (
    <button
      type="button"
      onClick={() => onClick(publication)}
      className="w-full text-left group bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-cyan-500/40 transition-all duration-200 hover:-translate-y-0.5"
      aria-label={`Open publication details for ${publication.title}`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] uppercase tracking-wider font-bold text-cyan-400/80 bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 rounded-full">
            {publication.kind}
          </span>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-violet-400/80 bg-violet-500/10 border border-violet-500/20 px-2 py-1 rounded-full">
            {publication.venueType}
          </span>
          {publication.isInternational ? (
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-400/80 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">
              <Globe2 className="w-3 h-3" /> Intl
            </span>
          ) : (
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-amber-400/80 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-full">
              <Landmark className="w-3 h-3" /> National
            </span>
          )}
        </div>
        <span className="inline-flex items-center gap-1 text-xs text-gray-400 shrink-0">
          <CalendarDays className="w-3.5 h-3.5" />
          {publicationYear}
        </span>
      </div>

      <h3 className="text-base font-semibold text-gray-100 leading-snug group-hover:text-cyan-300 transition-colors line-clamp-2">
        {publication.title}
      </h3>

      <div className="mt-3 space-y-1.5">
        <p className="text-sm text-gray-300 inline-flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-500" />
          <span className="line-clamp-1">{publication.publisher}</span>
        </p>
        <p className="text-sm text-gray-400 inline-flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-600" />
          <span className="line-clamp-1">{publication.venue}</span>
        </p>
      </div>
    </button>
  );
};

export default PublicationCard;
