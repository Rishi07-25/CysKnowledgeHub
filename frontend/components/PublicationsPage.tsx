import React, { useMemo, useState } from 'react';
import { BookOpenText } from 'lucide-react';
import { PUBLICATIONS } from '../publicationsData';
import { Publication } from '../types';
import PublicationCard from './PublicationCard';
import PublicationDetailModal from './PublicationDetailModal';

const PublicationsPage: React.FC = () => {
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);

  const publicationsByYear = useMemo(() => {
    const sorted = [...PUBLICATIONS].sort((a, b) => b.publicationDate.localeCompare(a.publicationDate));

    return sorted.reduce<Record<number, Publication[]>>((accumulator, publication) => {
      const year = Number(publication.publicationDate.slice(0, 4));
      if (!accumulator[year]) accumulator[year] = [];
      accumulator[year].push(publication);
      return accumulator;
    }, {});
  }, []);

  const years = useMemo(
    () => Object.keys(publicationsByYear).map(Number).sort((a, b) => b - a),
    [publicationsByYear]
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="space-y-3">
        <h1 className="text-4xl font-bold text-white">Student Publications</h1>
        <div className="w-20 h-1 bg-cyan-500 rounded-full" />
        <p className="text-gray-400 max-w-3xl">
          A year-wise timeline of student scholarly output across conferences, journals, patents, and research showcases.
        </p>
      </header>

      <div className="relative pl-0 md:pl-10">
        <div className="hidden md:block absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/50 via-cyan-500/30 to-transparent" />

        <div className="space-y-10">
          {years.map((year) => {
            const publications = publicationsByYear[year];

            return (
              <section key={year} className="relative">
                <div className="md:absolute md:left-0 md:top-1.5 hidden md:flex w-8 h-8 rounded-full border border-cyan-500/40 bg-gray-950 items-center justify-center">
                  <BookOpenText className="w-4 h-4 text-cyan-400" />
                </div>

                <div className="md:ml-12 mb-4 flex items-end justify-between gap-4 border-b border-gray-800 pb-2">
                  <h2 className="text-2xl font-bold text-cyan-300">{year}</h2>
                  <p className="text-sm text-gray-400">{publications.length} publication{publications.length > 1 ? 's' : ''}</p>
                </div>

                <div className="md:ml-12 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {publications.map((publication) => (
                    <PublicationCard
                      key={publication.id}
                      publication={publication}
                      onClick={setSelectedPublication}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <PublicationDetailModal
        publication={selectedPublication}
        onClose={() => setSelectedPublication(null)}
      />
    </div>
  );
};

export default PublicationsPage;
