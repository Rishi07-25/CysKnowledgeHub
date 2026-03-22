import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { PublicationKind, VenueType } from '../types';

export interface FilterState {
  search: string;
  publishers: string[];
  venueTypes: VenueType[];
  kinds: PublicationKind[];
  international: 'all' | 'yes' | 'no';
  years: number[];
}

interface PublicationsFilterProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  publisherOptions: string[];
  yearOptions: number[];
  totalResults: number;
}

const VENUE_TYPES: VenueType[] = ['Conference', 'Journal', 'Workshop', 'Symposium', 'Other'];
const KINDS: PublicationKind[] = ['Paper', 'Patent', 'Book Chapter', 'Poster'];

function ToggleChip({
  label,
  active,
  onClick,
  color = 'cyan',
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: 'cyan' | 'violet' | 'emerald' | 'amber';
}) {
  const palette = {
    cyan: active
      ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300'
      : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-300',
    violet: active
      ? 'bg-violet-500/20 border-violet-500/60 text-violet-300'
      : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-300',
    emerald: active
      ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
      : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-300',
    amber: active
      ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
      : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-300',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all duration-150 cursor-pointer select-none ${palette[color]}`}
    >
      {label}
    </button>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] uppercase tracking-widest font-semibold text-gray-500">{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

const PublicationsFilter: React.FC<PublicationsFilterProps> = ({
  filters,
  onChange,
  publisherOptions,
  yearOptions,
  totalResults,
}) => {
  function toggle<T>(array: T[], value: T): T[] {
    return array.includes(value) ? array.filter((v) => v !== value) : [...array, value];
  }

  const hasActiveFilters =
    filters.search !== '' ||
    filters.publishers.length > 0 ||
    filters.venueTypes.length > 0 ||
    filters.kinds.length > 0 ||
    filters.international !== 'all' ||
    filters.years.length > 0;

  function resetAll() {
    onChange({ search: '', publishers: [], venueTypes: [], kinds: [], international: 'all', years: [] });
  }

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 space-y-5 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-gray-300">
          <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-sm">Filters</span>
          {hasActiveFilters && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              active
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{totalResults} result{totalResults !== 1 ? 's' : ''}</span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAll}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        <input
          type="search"
          placeholder="Search title, author, keyword…"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full bg-gray-800/60 border border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500/60 transition-colors"
        />
      </div>

      {/* Publisher */}
      <FilterSection title="Publisher">
        {publisherOptions.map((pub) => (
          <ToggleChip
            key={pub}
            label={pub}
            active={filters.publishers.includes(pub)}
            onClick={() => onChange({ ...filters, publishers: toggle(filters.publishers, pub) })}
            color="cyan"
          />
        ))}
      </FilterSection>

      {/* Venue Type */}
      <FilterSection title="Venue Type">
        {VENUE_TYPES.map((vt) => (
          <ToggleChip
            key={vt}
            label={vt}
            active={filters.venueTypes.includes(vt)}
            onClick={() => onChange({ ...filters, venueTypes: toggle(filters.venueTypes, vt) })}
            color="violet"
          />
        ))}
      </FilterSection>

      {/* Publication Kind */}
      <FilterSection title="Type">
        {KINDS.map((k) => (
          <ToggleChip
            key={k}
            label={k}
            active={filters.kinds.includes(k)}
            onClick={() => onChange({ ...filters, kinds: toggle(filters.kinds, k) })}
            color="emerald"
          />
        ))}
      </FilterSection>

      {/* International */}
      <FilterSection title="International">
        {(['all', 'yes', 'no'] as const).map((val) => (
          <ToggleChip
            key={val}
            label={val === 'all' ? 'All' : val === 'yes' ? 'Yes' : 'No'}
            active={filters.international === val}
            onClick={() => onChange({ ...filters, international: val })}
            color="amber"
          />
        ))}
      </FilterSection>

      {/* Year */}
      <FilterSection title="Year">
        {yearOptions.map((year) => (
          <ToggleChip
            key={year}
            label={String(year)}
            active={filters.years.includes(year)}
            onClick={() => onChange({ ...filters, years: toggle(filters.years, year) })}
            color="cyan"
          />
        ))}
      </FilterSection>
    </div>
  );
};

export default PublicationsFilter;
