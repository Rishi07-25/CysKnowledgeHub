import React from 'react';
import { CalendarDays, Building2, FileText } from 'lucide-react';
import { Publication } from '../types';

interface PublicationCardProps {
  publication: Publication;
  onClick: (publication: Publication) => void;
}

const PublicationCard: React.FC<PublicationCardProps> = ({ publication, onClick }) => {
  return (
    <button
      type="button"
      onClick={() => onClick(publication)}
      className="w-full text-left group bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-cyan-500/40 transition-all duration-200 hover:-translate-y-0.5"
      aria-label={`Open publication details for ${publication.title}`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-[11px] uppercase tracking-wider font-bold text-cyan-400/80 bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 rounded-full">
          {publication.kind}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
          <CalendarDays className="w-3.5 h-3.5" />
          {publication.year}
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
